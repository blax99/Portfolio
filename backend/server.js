const fs = require("node:fs")
const path = require("node:path")
const { createHash, randomBytes, timingSafeEqual } = require("node:crypto")
const { Readable } = require("node:stream")
const express = require("express")
const cors = require("cors")
const multer = require("multer")
const { v2: cloudinary } = require("cloudinary")
const dotenv = require("dotenv")
const { createJsonStore } = require("./store")
const { createMongoStore } = require("./mongodbStore")

dotenv.config({ path: path.join(__dirname, ".env") })

const dataPath = path.join(__dirname, "data", "content.json")
const webPath = path.resolve(__dirname, "../frontend/dist")
const store = process.env.MONGODB_URI
  ? createMongoStore(process.env.MONGODB_URI)
  : createJsonStore(dataPath)
const sessionCookieName = "portfolio_admin_session"
const sessionLifetimeMs = 8 * 60 * 60 * 1000
const loginWindowMs = 15 * 60 * 1000
const loginAttemptLimit = 5
const imageExtensions = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
})

function uploadImageToCloudinary(file, folder) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
        allowed_formats: Object.values(imageExtensions).map((extension) =>
          extension.slice(1),
        ),
      },
      (error, result) => {
        if (error) {
          reject(error)
        } else if (!result?.secure_url) {
          reject(new Error("Cloudinary did not return a secure image URL."))
        } else {
          resolve(result)
        }
      },
    )
    Readable.from([file.buffer]).pipe(uploadStream)
  })
}

const fields = {
  works: {
    number: "string",
    title: "string",
    image: "string",
    category: "string",
    year: "string",
    featured: "boolean",
    summary: "string",
    technologies: "stringArray",
    highlights: "stringArray",
  },
  blogPosts: {
    title: "string",
    date: "string",
    dateTime: "date",
    category: "string",
    readTime: "string",
    summary: "string",
    content: "string",
  },
  skills: {
    group: "string",
    name: "string",
    logo: "string",
    color: "string",
    imageUrl: "string",
  },
  thoughts: {
    text: "string",
    author: "string",
    image: "string",
    imageAlt: "string",
    imageSource: "string",
  },
  about: {
    name: "string",
    location: "string",
    education: "string",
    interest: "string",
    image: "string",
    imageAlt: "string",
  },
}

class RequestError extends Error {
  constructor(status, message, { expose = false } = {}) {
    super(message)
    this.status = status
    this.expose = expose
  }
}

function validateRecord(
  input,
  collection,
  { partial = false, optional = [] } = {},
) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new RequestError(400, "Request body must be a JSON object.")
  }

  const schema = fields[collection]
  const unknownFields = Object.keys(input).filter((key) => !(key in schema))
  if (unknownFields.length > 0) {
    throw new RequestError(400, `Unknown field: ${unknownFields.join(", ")}`)
  }

  if (!partial) {
    const missingFields = Object.keys(schema).filter(
      (key) => !(key in input) && !optional.includes(key),
    )
    if (missingFields.length > 0) {
      throw new RequestError(
        400,
        `Missing required fields: ${missingFields.join(", ")}`,
      )
    }
  } else if (Object.keys(input).length === 0) {
    throw new RequestError(400, "Provide at least one field to update.")
  }

  const validated = {}
  for (const [key, value] of Object.entries(input)) {
    const type = schema[key]
    if (type === "string") {
      if (optional.includes(key) && value === "") {
        validated[key] = ""
        continue
      }
      if (typeof value !== "string" || value.trim().length === 0) {
        throw new RequestError(400, `${key} must be a non-empty string.`)
      }
      if (value.length > 2000) {
        throw new RequestError(400, `${key} must be 2000 characters or fewer.`)
      }
      validated[key] = value.trim()
    } else if (type === "boolean") {
      if (typeof value !== "boolean") {
        throw new RequestError(400, `${key} must be a boolean.`)
      }
      validated[key] = value
    } else if (type === "date") {
      if (
        typeof value !== "string" ||
        !/^\d{4}-\d{2}-\d{2}$/.test(value) ||
        Number.isNaN(Date.parse(`${value}T00:00:00Z`)) ||
        new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) !== value
      ) {
        throw new RequestError(400, `${key} must be a valid YYYY-MM-DD date.`)
      }
      validated[key] = value
    } else if (type === "stringArray") {
      if (
        !Array.isArray(value) ||
        value.length > 30 ||
        value.some(
          (entry) =>
            typeof entry !== "string" ||
            entry.trim().length === 0 ||
            entry.length > 2000,
        )
      ) {
        throw new RequestError(
          400,
          `${key} must be an array of up to 30 non-empty strings.`,
        )
      }
      validated[key] = value.map((entry) => entry.trim())
    }
  }

  if (collection === "skills" && !partial) {
    const skill = { ...input, ...validated }
    if (
      !(typeof skill.imageUrl === "string" && skill.imageUrl.trim()) &&
      !(
        typeof skill.logo === "string" &&
        skill.logo.trim() &&
        typeof skill.color === "string" &&
        skill.color.trim()
      )
    ) {
      throw new RequestError(
        400,
        "Provide an imageUrl or both logo and color for the skill icon.",
      )
    }
  }

  return validated
}

function digest(value) {
  return createHash("sha256").update(value).digest()
}

function credentialsMatch(username, password, adminUsername, adminPassword) {
  return (
    timingSafeEqual(digest(username), digest(adminUsername)) &&
    timingSafeEqual(digest(password), digest(adminPassword))
  )
}

function getSessionToken(request) {
  const cookies = request.headers.cookie?.split(";") ?? []
  for (const cookie of cookies) {
    const separator = cookie.indexOf("=")
    if (separator === -1) continue
    if (cookie.slice(0, separator).trim() === sessionCookieName) {
      const token = cookie.slice(separator + 1).trim()
      return /^[A-Za-z0-9_-]{43}$/.test(token) ? token : undefined
    }
  }
}

function setSessionCookie(response, request, token) {
  const secure =
    process.env.NODE_ENV === "production" || request.secure ? "; Secure" : ""
  const sameSite = process.env.NODE_ENV === "production" ? "None" : "Strict"
  response.setHeader(
    "Set-Cookie",
    `${sessionCookieName}=${encodeURIComponent(token)}; HttpOnly; SameSite=${sameSite}; Path=/api; Max-Age=${sessionLifetimeMs / 1000}${secure}`,
  )
}

function clearSessionCookie(response, request) {
  const secure =
    process.env.NODE_ENV === "production" || request.secure ? "; Secure" : ""
  const sameSite = process.env.NODE_ENV === "production" ? "None" : "Strict"
  response.setHeader(
    "Set-Cookie",
    `${sessionCookieName}=; HttpOnly; SameSite=${sameSite}; Path=/api; Max-Age=0${secure}`,
  )
}

function isValidAdminConfiguration({ adminUsername, adminPassword }) {
  return (
    typeof adminUsername === "string" &&
    adminUsername.trim().length > 0 &&
    typeof adminPassword === "string" &&
    adminPassword.length >= 12
  )
}

function createApp(
  contentStore = store,
  {
    adminUsername = process.env.ADMIN_USERNAME,
    adminPassword = process.env.ADMIN_PASSWORD,
    allowedOrigins = (process.env.CORS_ORIGINS || "")
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean),
    sessionStore = contentStore,
    now = Date.now,
    cloudinaryUpload,
  } = {},
) {
  const app = express()
  app.disable("x-powered-by")
  app.use(
    cors({
      origin: allowedOrigins,
      credentials: true,
    }),
  )
  app.use(express.json({ limit: "1mb" }))
  const sessions = new Map()
  const hasPersistentSessions = [
    "createSession",
    "getSession",
    "deleteSession",
  ].every((method) => typeof sessionStore[method] === "function")
  const loginAttempts = new Map()
  const createImageUpload = (maxFileSize) =>
    multer({
      storage: multer.memoryStorage(),
      limits: { fileSize: maxFileSize, files: 1 },
      fileFilter: (_request, file, callback) => {
        if (!imageExtensions[file.mimetype]) {
          callback(
            new RequestError(400, "Choose a PNG, JPEG, WebP, or GIF image."),
          )
          return
        }
        callback(null, true)
      },
    })
  const projectImageUpload = createImageUpload(5 * 1024 * 1024)
  const aboutImageUpload = createImageUpload(10 * 1024 * 1024)
  const credentialsConfigured = isValidAdminConfiguration({
    adminUsername,
    adminPassword,
  })

  function getClientAddress(request) {
    return request.socket.remoteAddress || "unknown"
  }

  function getLoginAttempt(address) {
    const currentTime = now()
    for (const [key, attempt] of loginAttempts) {
      if (attempt.resetAt <= currentTime) loginAttempts.delete(key)
    }

    let attempt = loginAttempts.get(address)
    if (!attempt || attempt.resetAt <= currentTime) {
      attempt = { count: 0, resetAt: currentTime + loginWindowMs }
      loginAttempts.set(address, attempt)
    }
    return attempt
  }

  async function requireAdmin(request, _response, next) {
    const token = getSessionToken(request)
    const session =
      token &&
      (hasPersistentSessions
        ? await sessionStore.getSession(token)
        : sessions.get(token))
    if (!session || session.expiresAt <= now()) {
      if (token) {
        if (hasPersistentSessions) await sessionStore.deleteSession(token)
        else sessions.delete(token)
      }
      return next(new RequestError(401, "Admin login required."))
    }
    next()
  }

  app.get("/", (_request, response) => {
    response.json({ status: "running" })
  })

  app.get("/api/health", (_request, response) => {
    response.json({ status: "ok" })
  })

  const uploadImageHandler = (folder) => async (request, response) => {
    if (!request.file) {
      throw new RequestError(400, "Choose an image to upload.")
    }
    const cloudinaryConfigured = [
      process.env.CLOUDINARY_CLOUD_NAME,
      process.env.CLOUDINARY_API_KEY,
      process.env.CLOUDINARY_API_SECRET,
    ].every((value) => typeof value === "string" && value.trim())
    if (!cloudinaryConfigured && !cloudinaryUpload) {
      throw new RequestError(
        503,
        "Image uploads are not configured. Set the Cloudinary credentials in backend/.env.",
      )
    }
    let uploaded
    try {
      uploaded = await (cloudinaryUpload ?? uploadImageToCloudinary)(
        request.file,
        folder,
      )
    } catch (uploadError) {
      const cloudinaryStatus =
        uploadError &&
        typeof uploadError === "object" &&
        "http_code" in uploadError
          ? uploadError.http_code
          : undefined
      console.error("Cloudinary image upload failed.", {
        name:
          uploadError instanceof Error
            ? uploadError.name
            : "Unknown upload error",
        httpCode: cloudinaryStatus,
      })
      throw new RequestError(
        502,
        cloudinaryStatus === 401
          ? "Cloudinary rejected the credentials. Verify the Cloud name, API key, and API secret in backend/.env, then restart the backend."
          : "Cloudinary could not store the image. Verify your Cloudinary settings and try again.",
        { expose: true },
      )
    }
    response.status(201).json({
      image: uploaded.secure_url,
    })
  }

  app.post(
    "/api/uploads",
    requireAdmin,
    projectImageUpload.single("image"),
    uploadImageHandler("portfolio/projects"),
  )
  app.post(
    "/api/uploads/about",
    requireAdmin,
    aboutImageUpload.single("image"),
    uploadImageHandler("portfolio/about"),
  )

  app.post("/api/auth/login", async (request, response, next) => {
    if (!credentialsConfigured) {
      return next(
        new RequestError(503, "Admin authentication is not configured."),
      )
    }
    if (process.env.VERCEL && !hasPersistentSessions) {
      return next(
        new RequestError(
          503,
          "Admin sessions require MongoDB. Configure MONGODB_URI in the Vercel backend project.",
          { expose: true },
        ),
      )
    }

    const address = getClientAddress(request)
    const attempt = getLoginAttempt(address)
    if (attempt.count >= loginAttemptLimit) {
      response.setHeader(
        "Retry-After",
        Math.ceil((attempt.resetAt - now()) / 1000),
      )
      return next(
        new RequestError(429, "Too many login attempts. Try again later."),
      )
    }

    const { username, password } = request.body ?? {}
    if (
      typeof username !== "string" ||
      typeof password !== "string" ||
      username.length > 256 ||
      password.length > 1024 ||
      !credentialsMatch(username, password, adminUsername, adminPassword)
    ) {
      attempt.count += 1
      return next(new RequestError(401, "Invalid username or password."))
    }

    loginAttempts.delete(address)
    const currentTime = now()
    if (!hasPersistentSessions) {
      for (const [token, session] of sessions) {
        if (session.expiresAt <= currentTime) sessions.delete(token)
      }
    }
    const token = randomBytes(32).toString("base64url")
    const expiresAt = currentTime + sessionLifetimeMs
    if (hasPersistentSessions) {
      await sessionStore.createSession(token, expiresAt)
    } else {
      sessions.set(token, { expiresAt })
    }
    setSessionCookie(response, request, token)
    response.json({ authenticated: true })
  })

  app.get("/api/auth/me", requireAdmin, (_request, response) => {
    response.json({ authenticated: true })
  })

  app.post("/api/visitors", async (request, response) => {
    const { sessionId } = request.body ?? {}
    if (
      typeof sessionId !== "string" ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        sessionId,
      )
    ) {
      throw new RequestError(400, "A valid visitor session ID is required.")
    }

    const sessionHash = createHash("sha256").update(sessionId).digest("hex")
    await contentStore.recordVisitor(sessionHash, new Date(now()))
    response.status(204).end()
  })

  app.get("/api/admin/visitors", requireAdmin, async (_request, response) => {
    response.setHeader("Cache-Control", "no-store")
    response.json(await contentStore.getVisitorStats(new Date(now())))
  })

  app.post("/api/auth/logout", async (request, response) => {
    const token = getSessionToken(request)
    if (token) {
      if (hasPersistentSessions) await sessionStore.deleteSession(token)
      else sessions.delete(token)
    }
    clearSessionCookie(response, request)
    response.json({ authenticated: false })
  })

  for (const [resource, collection] of [
    ["works", "works"],
    ["blog", "blogPosts"],
    ["skills", "skills"],
    ["thoughts", "thoughts"],
    ["about", "about"],
  ]) {
    app.get(`/api/${resource}`, async (_request, response) => {
      response.json(await contentStore.list(collection))
    })

    app.post(`/api/${resource}`, requireAdmin, async (request, response) => {
      const optional =
        collection === "works"
          ? ["number", "featured"]
          : collection === "skills"
            ? ["logo", "color", "imageUrl"]
            : collection === "thoughts"
              ? ["image", "imageAlt", "imageSource"]
              : collection === "about"
                ? ["imageAlt"]
                : []
      const item = validateRecord(request.body, collection, { optional })
      response.status(201).json(await contentStore.create(collection, item))
    })

    app.get(`/api/${resource}/:id`, async (request, response) => {
      const item = await contentStore.find(collection, request.params.id)
      if (!item) throw new RequestError(404, `${resource} entry not found.`)
      response.json(item)
    })

    app.put(`/api/${resource}/:id`, requireAdmin, async (request, response) => {
      const optional =
        collection === "skills"
          ? ["logo", "color", "imageUrl"]
          : collection === "works"
            ? ["featured"]
            : collection === "thoughts"
              ? ["image", "imageAlt", "imageSource"]
              : collection === "about"
                ? ["imageAlt"]
                : []
      const item = validateRecord(request.body, collection, { optional })
      const updated = await contentStore.update(
        collection,
        request.params.id,
        item,
      )
      if (!updated) throw new RequestError(404, `${resource} entry not found.`)
      response.json(updated)
    })

    app.patch(
      `/api/${resource}/:id`,
      requireAdmin,
      async (request, response) => {
        const existing = await contentStore.find(collection, request.params.id)
        if (!existing)
          throw new RequestError(404, `${resource} entry not found.`)
        const patch = validateRecord(request.body, collection, {
          partial: true,
        })
        const updated = await contentStore.update(
          collection,
          request.params.id,
          {
            ...existing,
            ...patch,
          },
        )
        response.json(updated)
      },
    )

    app.delete(
      `/api/${resource}/:id`,
      requireAdmin,
      async (request, response) => {
        if (
          (resource === "thoughts" || resource === "about") &&
          (await contentStore.list(collection)).length <= 1
        ) {
          throw new RequestError(
            409,
            resource === "about"
              ? "The About Me profile cannot be deleted."
              : "Keep at least one daily thought so the home page can display a quote.",
          )
        }
        const deleted = await contentStore.delete(collection, request.params.id)
        if (!deleted)
          throw new RequestError(404, `${resource} entry not found.`)
        response.status(204).end()
      },
    )
  }

  app.use("/api", (_request, response) => {
    response.status(404).json({ error: "API endpoint not found." })
  })

  if (fs.existsSync(webPath)) {
    app.use(express.static(webPath))
    app.get(/.*/, (_request, response) => {
      response.sendFile(path.join(webPath, "index.html"))
    })
  }

  app.use((error, request, response, _next) => {
    if (response.headersSent) return
    const status =
      error instanceof multer.MulterError
        ? error.code === "LIMIT_FILE_SIZE"
          ? 413
          : 400
        : error.status || error.statusCode || 500
    if (status >= 500) console.error(error)
    response.status(status).json({
      error:
        status >= 500 && !error.expose
          ? "Internal server error."
          : error instanceof multer.MulterError
            ? error.code === "LIMIT_FILE_SIZE"
              ? request.path === "/api/uploads/about"
                ? "Image files must be 10 MB or smaller."
                : "Image files must be 5 MB or smaller."
              : "Upload one image file at a time."
            : error.message,
    })
  })

  return app
}

async function startServer() {
  const authConfiguration = {
    adminUsername: process.env.ADMIN_USERNAME,
    adminPassword: process.env.ADMIN_PASSWORD,
  }
  if (!isValidAdminConfiguration(authConfiguration)) {
    console.warn(
      "Admin authentication is disabled. Set ADMIN_USERNAME and ADMIN_PASSWORD (at least 12 characters) in backend/.env, then restart the API.",
    )
  }

  await store.initialize()
  const port = Number(process.env.API_PORT || 3001)
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("API_PORT must be an integer between 1 and 65535.")
  }

  const host = "127.0.0.1"
  const server = createApp().listen(port, host, () => {
    console.log(`Portfolio API listening at http://${host}:${port}`)
  })
  return server
}

if (require.main === module) {
  startServer().catch((error) => {
    console.error("Could not start the portfolio API:", error)
    process.exitCode = 1
  })
}

module.exports = Object.assign(createApp(), {
  createApp,
  isValidAdminConfiguration,
  startServer,
  validateRecord,
})
