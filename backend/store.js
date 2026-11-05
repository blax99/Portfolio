const fs = require("node:fs/promises")
const path = require("node:path")
const { randomUUID } = require("node:crypto")
const { countVisitorPeriods } = require("./visitorAnalytics")

function clone(value) {
  return structuredClone(value)
}

function createJsonStore(filePath) {
  let content
  let queue = Promise.resolve()

  async function initialize() {
    if (content) return

    try {
      const file = await fs.readFile(filePath, "utf8")
      const parsed = JSON.parse(file)
      if (!Array.isArray(parsed.works) || !Array.isArray(parsed.blogPosts)) {
        throw new Error("Content data must contain works and blogPosts arrays.")
      }
      content = {
        ...parsed,
        skills: Array.isArray(parsed.skills) ? parsed.skills : [],
        about: Array.isArray(parsed.about) ? parsed.about : [],
        thoughts: Array.isArray(parsed.thoughts) ? parsed.thoughts : [],
        visitors: Array.isArray(parsed.visitors) ? parsed.visitors : [],
      }
    } catch (error) {
      if (error.code !== "ENOENT") throw error
      throw new Error(`Content data file not found: ${filePath}`, {
        cause: error,
      })
    }
  }

  async function persist() {
    const temporaryPath = `${filePath}.${randomUUID()}.tmp`
    await fs.mkdir(path.dirname(filePath), { recursive: true })
    await fs.writeFile(temporaryPath, `${JSON.stringify(content, null, 2)}\n`, {
      encoding: "utf8",
      mode: 0o600,
    })
    await fs.rename(temporaryPath, filePath)
  }

  function mutate(operation) {
    const current = queue.then(async () => {
      await initialize()
      const previousContent = clone(content)
      const result = operation()

      try {
        await persist()
        return clone(result)
      } catch (error) {
        content = previousContent
        throw error
      }
    })

    queue = current.then(
      () => undefined,
      () => undefined,
    )
    return current
  }

  async function read(operation) {
    await queue
    await initialize()
    return clone(operation())
  }

  return {
    initialize,
    list(collection) {
      return read(() => content[collection])
    },
    find(collection, id) {
      return read(() => content[collection].find((item) => item.id === id))
    },
    create(collection, item) {
      return mutate(() => {
        const record = { id: randomUUID(), ...item }
        if (collection === "works" && record.featured === undefined) {
          record.featured = false
        }
        if (collection === "works" && !record.number) {
          const nextNumber =
            content.works.reduce(
              (highest, work) => Math.max(highest, Number(work.number) || 0),
              0,
            ) + 1
          record.number = String(nextNumber).padStart(2, "0")
        }
        content[collection].push(record)
        return content[collection][content[collection].length - 1]
      })
    },
    update(collection, id, item) {
      return mutate(() => {
        const index = content[collection].findIndex((entry) => entry.id === id)
        if (index === -1) return null
        content[collection][index] = {
          ...content[collection][index],
          ...item,
          id,
        }
        return content[collection][index]
      })
    },
    delete(collection, id) {
      return mutate(() => {
        const index = content[collection].findIndex((entry) => entry.id === id)
        if (index === -1) return false
        content[collection].splice(index, 1)
        return true
      })
    },
    recordVisitor(sessionHash, visitedAt) {
      return mutate(() => {
        if (
          content.visitors.some(
            (visitor) => visitor.sessionHash === sessionHash,
          )
        ) {
          return false
        }
        content.visitors.push({ sessionHash, visitedAt })
        return true
      })
    },
    getVisitorStats(now = new Date()) {
      return read(() => {
        return countVisitorPeriods(
          content.visitors.map((visitor) => ({
            visitedAt: new Date(visitor.visitedAt),
          })),
          now,
        )
      })
    },
  }
}

module.exports = { createJsonStore }
