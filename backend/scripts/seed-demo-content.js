const fs = require("node:fs/promises")
const path = require("node:path")
const dotenv = require("dotenv")
const mongoose = require("mongoose")
const Work = require("../models/Work")
const BlogPost = require("../models/BlogPost")

dotenv.config({ path: path.join(__dirname, "..", ".env") })

async function seedMissingRecords(model, records) {
  const operations = records.map((record) => ({
    updateOne: {
      filter: { id: record.id },
      update: { $setOnInsert: record },
      upsert: true,
    },
  }))

  if (operations.length === 0) return 0
  const result = await model.bulkWrite(operations, { ordered: true })
  return result.upsertedCount
}

async function main() {
  const mongoUri = process.env.MONGODB_URI
  if (!mongoUri) {
    throw new Error("MONGODB_URI is required to seed demo content.")
  }

  const contentPath = path.join(__dirname, "..", "data", "content.json")
  const content = JSON.parse(await fs.readFile(contentPath, "utf8"))
  const demoWorks = content.works.filter((work) =>
    work.id.startsWith("demo-project-"),
  )
  const demoPosts = content.blogPosts.filter((post) =>
    post.id.startsWith("demo-blog-"),
  )

  await mongoose.connect(mongoUri)
  try {
    const [projectsAdded, postsAdded] = await Promise.all([
      seedMissingRecords(Work, demoWorks),
      seedMissingRecords(BlogPost, demoPosts),
    ])
    console.log(
      `Added ${projectsAdded} demo projects and ${postsAdded} demo blog posts.`,
    )
  } finally {
    await mongoose.disconnect()
  }
}

main().catch((error) => {
  console.error("Could not seed demo content:", error)
  process.exitCode = 1
})
