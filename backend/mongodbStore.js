const { createHash, randomUUID } = require("node:crypto")
const fs = require("node:fs/promises")
const path = require("node:path")
const mongoose = require("mongoose")
const Work = require("./models/Work")
const BlogPost = require("./models/BlogPost")
const Skill = require("./models/Skill")
const DailyThought = require("./models/DailyThought")
const AboutProfile = require("./models/AboutProfile")
const AdminSession = require("./models/AdminSession")
const PortfolioVisitor = require("./models/PortfolioVisitor")
const { getKathmanduPeriodStarts } = require("./visitorAnalytics")

const MODELS = {
  works: Work,
  blogPosts: BlogPost,
  skills: Skill,
  thoughts: DailyThought,
  about: AboutProfile,
}

function modelFor(collection) {
  const model = MODELS[collection]
  if (!model) throw new Error(`Unknown collection: ${collection}`)
  return model
}

function toRecord(document) {
  if (!document) return null
  const { _id, ...rest } =
    typeof document.toObject === "function" ? document.toObject() : document
  return rest
}

function createMongoStore(mongoUri) {
  if (!mongoUri) {
    throw new Error("MONGODB_URI is required to create the MongoDB store.")
  }
  let connected = false

  async function initialize() {
    if (connected) return
    await mongoose.connect(mongoUri, {
      autoIndex: true,
    })
    await Work.updateMany(
      {
        id: {
          $in: ["campus-connect", "pathfinding-visualizer", "studysync"],
        },
        featured: { $exists: false },
      },
      { $set: { featured: true } },
    )
    await Work.updateMany({ featured: { $exists: false } }, {
      $set: { featured: false },
    })
    const skillsCollectionExists = await mongoose.connection.db
      .listCollections({ name: Skill.collection.collectionName }, {
        nameOnly: true,
      })
      .hasNext()
    if (!skillsCollectionExists) {
      const contentPath = path.join(__dirname, "data", "content.json")
      const content = JSON.parse(await fs.readFile(contentPath, "utf8"))
      await Skill.insertMany(content.skills ?? [])
    }
    if ((await DailyThought.countDocuments()) === 0) {
      const contentPath = path.join(__dirname, "data", "content.json")
      const content = JSON.parse(await fs.readFile(contentPath, "utf8"))
      await DailyThought.insertMany(content.thoughts ?? [])
    }
    if ((await AboutProfile.countDocuments()) === 0) {
      const contentPath = path.join(__dirname, "data", "content.json")
      const content = JSON.parse(await fs.readFile(contentPath, "utf8"))
      await AboutProfile.insertMany(content.about ?? [])
    }
    connected = true
  }

  async function list(collection) {
    await initialize()
    const documents = await modelFor(collection).find().sort({ _id: 1 }).lean()
    return documents.map(toRecord)
  }

  async function find(collection, id) {
    await initialize()
    const document = await modelFor(collection).findOne({ id }).lean()
    return toRecord(document)
  }

  async function create(collection, item) {
    await initialize()
    const Model = modelFor(collection)
    const record = { id: randomUUID(), ...item }

    if (collection === "works" && !record.number) {
      const existing = await Model.find({}, "number").lean()
      const nextNumber =
        existing.reduce(
          (highest, work) => Math.max(highest, Number(work.number) || 0),
          0,
        ) + 1
      record.number = String(nextNumber).padStart(2, "0")
    }

    const created = await Model.create(record)
    return toRecord(created)
  }

  async function update(collection, id, item) {
    await initialize()
    const updated = await modelFor(collection)
      .findOneAndUpdate({ id }, { $set: item }, {
        returnDocument: "after",
        lean: true,
      })
      .exec()
    return toRecord(updated)
  }

  async function removeRecord(collection, id) {
    await initialize()
    const result = await modelFor(collection).deleteOne({ id })
    return result.deletedCount > 0
  }

  async function createSession(token, expiresAt) {
    await initialize()
    await AdminSession.create({
      tokenHash: createHash("sha256").update(token).digest("hex"),
      expiresAt: new Date(expiresAt),
    })
  }

  async function getSession(token) {
    await initialize()
    const tokenHash = createHash("sha256").update(token).digest("hex")
    return AdminSession.findOne({
      tokenHash,
      expiresAt: { $gt: new Date() },
    })
      .select("expiresAt")
      .lean()
  }

  async function deleteSession(token) {
    await initialize()
    const tokenHash = createHash("sha256").update(token).digest("hex")
    await AdminSession.deleteOne({ tokenHash })
  }

  async function recordVisitor(sessionHash, visitedAt) {
    await initialize()
    try {
      await PortfolioVisitor.updateOne(
        { sessionHash },
        { $setOnInsert: { sessionHash, visitedAt } },
        { upsert: true },
      )
    } catch (error) {
      if (error.code !== 11000) throw error
    }
  }

  async function getVisitorStats(now = new Date()) {
    await initialize()
    const starts = getKathmanduPeriodStarts(now)
    const [total, year, month, week, day] = await Promise.all([
      PortfolioVisitor.countDocuments(),
      PortfolioVisitor.countDocuments({ visitedAt: { $gte: starts.year } }),
      PortfolioVisitor.countDocuments({ visitedAt: { $gte: starts.month } }),
      PortfolioVisitor.countDocuments({ visitedAt: { $gte: starts.week } }),
      PortfolioVisitor.countDocuments({ visitedAt: { $gte: starts.day } }),
    ])
    return { total, year, month, week, day }
  }

  return {
    initialize,
    list,
    find,
    create,
    update,
    delete: removeRecord,
    createSession,
    getSession,
    deleteSession,
    recordVisitor,
    getVisitorStats,
  }
}

module.exports = { createMongoStore }
