const assert = require("node:assert/strict")
const fs = require("node:fs/promises")
const os = require("node:os")
const path = require("node:path")
const { after, before, test } = require("node:test")
const serverApp = require("../server")
const { createApp } = serverApp
const { createJsonStore } = require("../store")

const workPayload = {
  title: "Test Project",
  image: "/assets/test-project.svg",
  category: "Testing",
  year: "2026",
  featured: false,
  summary: "A project created to test the CRUD API.",
  technologies: ["Node.js"],
  highlights: ["Creates and updates content"],
}

const blogPayload = {
  title: "Test Post",
  date: "27 Oct 2026",
  dateTime: "2026-10-27",
  category: "Testing",
  readTime: "2 min read",
  summary: "A post created to test the CRUD API.",
  content: "This is the test post content.",
}

const skillPayload = {
  group: "Testing",
  name: "Test skill",
  logo: "react",
  color: "61DAFB",
}

const thoughtPayload = {
  text: "Build useful things.",
  author: "Test Author",
  image: "",
  imageAlt: "",
  imageSource: "",
}

const aboutPayload = {
  name: "Test Profile",
  location: "Kathmandu, Nepal",
  education: "Computer Science",
  interest: "Building useful products",
  image: "/assets/pf.jpeg",
  imageAlt: "Test profile portrait",
}

let server
let temporaryDirectory
let baseUrl
let adminCookie
let uploadedImageBytes
let cloudinaryUploadError = null

test("exports an Express handler for Vercel", () => {
  assert.equal(typeof serverApp, "function")
  assert.equal(typeof serverApp.createApp, "function")
})

test("root route reports that the server is running", async () => {
  const response = await fetch(baseUrl)
  assert.equal(response.status, 200)
  assert.deepEqual(await response.json(), { status: "running" })
})

async function adminFetch(url, options = {}) {
  const headers = new Headers(options.headers)
  if (adminCookie) headers.set("cookie", adminCookie)
  return fetch(url, { ...options, headers })
}

before(async () => {
  temporaryDirectory = await fs.mkdtemp(
    path.join(os.tmpdir(), "portfolio-api-test-"),
  )
  const dataPath = path.join(temporaryDirectory, "content.json")
  await fs.copyFile(path.join(__dirname, "../data/content.json"), dataPath)
  const store = createJsonStore(dataPath)
  await store.initialize()
  server = createApp(store, {
    adminUsername: "test-admin",
    adminPassword: "a-long-test-password",
    allowedOrigins: ["https://portfolio.example"],
    cloudinaryUpload: async (file) => {
      if (cloudinaryUploadError) throw cloudinaryUploadError
      uploadedImageBytes = file.buffer
      return {
        secure_url:
          "https://res.cloudinary.com/test-cloud/image/upload/v1/portfolio/projects/test.png",
      }
    },
  }).listen(0, "127.0.0.1")
  await new Promise((resolve, reject) => {
    server.once("listening", resolve)
    server.once("error", reject)
  })
  baseUrl = `http://127.0.0.1:${server.address().port}`
})

after(async () => {
  if (server) {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()))
    })
  }
  if (temporaryDirectory) {
    await fs.rm(temporaryDirectory, { recursive: true, force: true })
  }
})

test("work and blog endpoints support CRUD and persist updates", async () => {
  const initialWorks = await fetch(`${baseUrl}/api/works`).then((response) =>
    response.json(),
  )
  assert.equal(initialWorks.length, 3)
  assert.deepEqual(
    initialWorks.filter((work) => work.featured).map((work) => work.id),
    ["campus-connect", "pathfinding-visualizer", "studysync"],
  )
  const initialPosts = await fetch(`${baseUrl}/api/blog`).then((response) =>
    response.json(),
  )
  assert.equal(initialPosts.length, 4)
  const initialSkills = await fetch(`${baseUrl}/api/skills`).then((response) =>
    response.json(),
  )
  assert.equal(initialSkills.length, 16)
  const initialThoughts = await fetch(`${baseUrl}/api/thoughts`).then(
    (response) => response.json(),
  )
  assert.equal(initialThoughts.length, 3)
  const initialAbout = await fetch(`${baseUrl}/api/about`).then((response) =>
    response.json(),
  )
  assert.equal(initialAbout.length, 1)

  const unauthorizedResponse = await fetch(`${baseUrl}/api/works`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(workPayload),
  })
  assert.equal(unauthorizedResponse.status, 401)
  const unauthorizedUpload = new FormData()
  unauthorizedUpload.append(
    "image",
    new Blob(["image data"], { type: "image/png" }),
    "test.png",
  )
  assert.equal(
    (
      await fetch(`${baseUrl}/api/uploads`, {
        method: "POST",
        body: unauthorizedUpload,
      })
    ).status,
    401,
  )
  assert.equal((await fetch(`${baseUrl}/api/auth/me`)).status, 401)
  assert.equal(
    (
      await fetch(`${baseUrl}/api/auth/me`, {
        headers: { cookie: "portfolio_admin_session=%" },
      })
    ).status,
    401,
  )

  const invalidLoginResponse = await fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      username: "test-admin",
      password: "incorrect-password",
    }),
  })
  assert.equal(invalidLoginResponse.status, 401)

  const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      username: "test-admin",
      password: "a-long-test-password",
    }),
  })
  assert.equal(loginResponse.status, 200)
  const cookie = loginResponse.headers.get("set-cookie")
  assert.match(cookie, /HttpOnly/i)
  assert.match(cookie, /SameSite=Strict/i)
  adminCookie = cookie.split(";", 1)[0]
  assert.equal((await adminFetch(`${baseUrl}/api/auth/me`)).status, 200)

  const uploadForm = new FormData()
  const imageBytes = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  uploadForm.append(
    "image",
    new Blob([imageBytes], { type: "image/png" }),
    "project.png",
  )
  const uploadResponse = await adminFetch(`${baseUrl}/api/uploads`, {
    method: "POST",
    body: uploadForm,
  })
  assert.equal(uploadResponse.status, 201)
  const uploadedImage = await uploadResponse.json()
  assert.equal(
    uploadedImage.image,
    "https://res.cloudinary.com/test-cloud/image/upload/v1/portfolio/projects/test.png",
  )
  assert.deepEqual(uploadedImageBytes, imageBytes)

  const aboutUploadForm = new FormData()
  const maximumAboutImageSize = 10 * 1024 * 1024
  aboutUploadForm.append(
    "image",
    new Blob([Buffer.alloc(maximumAboutImageSize)], { type: "image/png" }),
    "about.png",
  )
  const aboutUploadResponse = await adminFetch(`${baseUrl}/api/uploads/about`, {
    method: "POST",
    body: aboutUploadForm,
  })
  assert.equal(aboutUploadResponse.status, 201)
  assert.equal(uploadedImageBytes.length, maximumAboutImageSize)

  const oversizedAboutUpload = new FormData()
  oversizedAboutUpload.append(
    "image",
    new Blob([Buffer.alloc(maximumAboutImageSize + 1)], {
      type: "image/png",
    }),
    "oversized-about.png",
  )
  const oversizedAboutResponse = await adminFetch(
    `${baseUrl}/api/uploads/about`,
    {
      method: "POST",
      body: oversizedAboutUpload,
    },
  )
  assert.equal(oversizedAboutResponse.status, 413)
  assert.equal(
    (await oversizedAboutResponse.json()).error,
    "Image files must be 10 MB or smaller.",
  )

  const invalidUploadForm = new FormData()
  invalidUploadForm.append(
    "image",
    new Blob(["not an image"], { type: "text/plain" }),
    "document.txt",
  )
  assert.equal(
    (
      await adminFetch(`${baseUrl}/api/uploads`, {
        method: "POST",
        body: invalidUploadForm,
      })
    ).status,
    400,
  )

  cloudinaryUploadError = Object.assign(new Error("Unauthorized"), {
    http_code: 401,
  })
  const failedUploadForm = new FormData()
  failedUploadForm.append(
    "image",
    new Blob([imageBytes], { type: "image/png" }),
    "project.png",
  )
  const failedUploadResponse = await adminFetch(`${baseUrl}/api/uploads`, {
    method: "POST",
    body: failedUploadForm,
  })
  assert.equal(failedUploadResponse.status, 502)
  assert.match(
    (await failedUploadResponse.json()).error,
    /Cloudinary rejected the credentials/,
  )
  cloudinaryUploadError = null

  const createdWorkResponse = await adminFetch(`${baseUrl}/api/works`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(workPayload),
  })
  assert.equal(createdWorkResponse.status, 201)
  const createdWork = await createdWorkResponse.json()
  assert.equal(createdWork.number, "04")
  assert.ok(createdWork.id)

  const simultaneousWorks = await Promise.all(
    Array.from({ length: 2 }, () =>
      adminFetch(`${baseUrl}/api/works`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(workPayload),
      }).then((response) => response.json()),
    ),
  )
  assert.deepEqual(simultaneousWorks.map((work) => work.number).sort(), [
    "05",
    "06",
  ])

  const workResponse = await fetch(`${baseUrl}/api/works/${createdWork.id}`)
  assert.equal(workResponse.status, 200)

  const patchedWorkResponse = await adminFetch(
    `${baseUrl}/api/works/${createdWork.id}`,
    {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title: "Updated Test Project", featured: true }),
    },
  )
  const patchedWork = await patchedWorkResponse.json()
  assert.equal(patchedWork.title, "Updated Test Project")
  assert.equal(patchedWork.featured, true)

  const replacedWorkResponse = await adminFetch(
    `${baseUrl}/api/works/${createdWork.id}`,
    {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        ...workPayload,
        number: "04",
        title: "Replaced Test Project",
      }),
    },
  )
  assert.equal(
    (await replacedWorkResponse.json()).title,
    "Replaced Test Project",
  )

  const createdBlogResponse = await adminFetch(`${baseUrl}/api/blog`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(blogPayload),
  })
  assert.equal(createdBlogResponse.status, 201)
  const createdBlog = await createdBlogResponse.json()

  const invalidSkillResponse = await adminFetch(`${baseUrl}/api/skills`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ group: "Testing", name: "Missing icon" }),
  })
  assert.equal(invalidSkillResponse.status, 400)

  const createdSkillResponse = await adminFetch(`${baseUrl}/api/skills`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(skillPayload),
  })
  assert.equal(createdSkillResponse.status, 201)
  const createdSkill = await createdSkillResponse.json()

  const createdThoughtResponse = await adminFetch(`${baseUrl}/api/thoughts`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(thoughtPayload),
  })
  assert.equal(createdThoughtResponse.status, 201)
  const createdThought = await createdThoughtResponse.json()

  const aboutProfile = initialAbout[0]
  const updatedAboutResponse = await adminFetch(
    `${baseUrl}/api/about/${aboutProfile.id}`,
    {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...aboutPayload, name: "Updated Profile" }),
    },
  )
  assert.equal(updatedAboutResponse.status, 200)
  assert.equal((await updatedAboutResponse.json()).name, "Updated Profile")

  const thoughtResponse = await fetch(
    `${baseUrl}/api/thoughts/${createdThought.id}`,
  )
  assert.equal(thoughtResponse.status, 200)

  const skillResponse = await fetch(`${baseUrl}/api/skills/${createdSkill.id}`)
  assert.equal(skillResponse.status, 200)

  const patchedSkillResponse = await adminFetch(
    `${baseUrl}/api/skills/${createdSkill.id}`,
    {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ group: "Updated group" }),
    },
  )
  assert.equal((await patchedSkillResponse.json()).group, "Updated group")

  const replacedSkillResponse = await adminFetch(
    `${baseUrl}/api/skills/${createdSkill.id}`,
    {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...skillPayload, name: "Replaced skill" }),
    },
  )
  assert.equal((await replacedSkillResponse.json()).name, "Replaced skill")

  const patchedThoughtResponse = await adminFetch(
    `${baseUrl}/api/thoughts/${createdThought.id}`,
    {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text: "Updated thought." }),
    },
  )
  assert.equal((await patchedThoughtResponse.json()).text, "Updated thought.")

  const replacedThoughtResponse = await adminFetch(
    `${baseUrl}/api/thoughts/${createdThought.id}`,
    {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...thoughtPayload, author: "Updated Author" }),
    },
  )
  assert.equal((await replacedThoughtResponse.json()).author, "Updated Author")

  const blogResponse = await fetch(`${baseUrl}/api/blog/${createdBlog.id}`)
  assert.equal(blogResponse.status, 200)

  const patchedBlogResponse = await adminFetch(
    `${baseUrl}/api/blog/${createdBlog.id}`,
    {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title: "Updated Test Post" }),
    },
  )
  assert.equal((await patchedBlogResponse.json()).title, "Updated Test Post")

  const replacedBlogResponse = await adminFetch(
    `${baseUrl}/api/blog/${createdBlog.id}`,
    {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...blogPayload, title: "Replaced Test Post" }),
    },
  )
  assert.equal((await replacedBlogResponse.json()).title, "Replaced Test Post")

  const deletedWorkResponse = await adminFetch(
    `${baseUrl}/api/works/${createdWork.id}`,
    { method: "DELETE" },
  )
  assert.equal(deletedWorkResponse.status, 204)

  await Promise.all(
    simultaneousWorks.map((work) =>
      adminFetch(`${baseUrl}/api/works/${work.id}`, { method: "DELETE" }),
    ),
  )

  const deletedBlogResponse = await adminFetch(
    `${baseUrl}/api/blog/${createdBlog.id}`,
    { method: "DELETE" },
  )
  assert.equal(deletedBlogResponse.status, 204)
  const deletedSkillResponse = await adminFetch(
    `${baseUrl}/api/skills/${createdSkill.id}`,
    { method: "DELETE" },
  )
  assert.equal(deletedSkillResponse.status, 204)
  const deletedThoughtResponse = await adminFetch(
    `${baseUrl}/api/thoughts/${createdThought.id}`,
    { method: "DELETE" },
  )
  assert.equal(deletedThoughtResponse.status, 204)
  for (const thought of initialThoughts.slice(0, -1)) {
    assert.equal(
      (
        await adminFetch(`${baseUrl}/api/thoughts/${thought.id}`, {
          method: "DELETE",
        })
      ).status,
      204,
    )
  }
  const lastThoughtDeleteResponse = await adminFetch(
    `${baseUrl}/api/thoughts/${initialThoughts.at(-1).id}`,
    { method: "DELETE" },
  )
  assert.equal(lastThoughtDeleteResponse.status, 409)

  const persistedStore = createJsonStore(
    path.join(temporaryDirectory, "content.json"),
  )
  await persistedStore.initialize()
  assert.equal(await persistedStore.find("works", createdWork.id), undefined)
  assert.equal(
    await persistedStore.find("blogPosts", createdBlog.id),
    undefined,
  )
  assert.equal(await persistedStore.find("skills", createdSkill.id), undefined)
  assert.equal(
    await persistedStore.find("thoughts", createdThought.id),
    undefined,
  )
  assert.equal(
    (await persistedStore.find("about", aboutProfile.id)).name,
    "Updated Profile",
  )

  const logoutResponse = await adminFetch(`${baseUrl}/api/auth/logout`, {
    method: "POST",
  })
  assert.equal(logoutResponse.status, 200)
  adminCookie = undefined
  assert.equal((await fetch(`${baseUrl}/api/auth/me`)).status, 401)
  assert.equal(
    (
      await fetch(`${baseUrl}/api/works/${initialWorks[0].id}`, {
        method: "DELETE",
      })
    ).status,
    401,
  )
})

test("CORS allows configured frontend origins with credentials", async () => {
  const preflight = await fetch(`${baseUrl}/api/auth/login`, {
    method: "OPTIONS",
    headers: {
      origin: "https://portfolio.example",
      "access-control-request-method": "POST",
      "access-control-request-headers": "content-type",
    },
  })

  assert.equal(preflight.status, 204)
  assert.equal(
    preflight.headers.get("access-control-allow-origin"),
    "https://portfolio.example",
  )
  assert.equal(
    preflight.headers.get("access-control-allow-credentials"),
    "true",
  )

  const untrustedOrigin = await fetch(`${baseUrl}/api/works`, {
    headers: { origin: "https://untrusted.example" },
  })
  assert.equal(untrustedOrigin.headers.get("access-control-allow-origin"), null)
})

test("invalid content, missing IDs, and login throttling are handled", async () => {
  const previousNodeEnv = process.env.NODE_ENV
  process.env.NODE_ENV = "production"
  let loginResponse
  try {
    loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        username: "test-admin",
        password: "a-long-test-password",
      }),
    })
  } finally {
    if (previousNodeEnv === undefined) delete process.env.NODE_ENV
    else process.env.NODE_ENV = previousNodeEnv
  }
  assert.equal(loginResponse.status, 200)
  const loginCookie = loginResponse.headers.get("set-cookie")
  assert.match(loginCookie, /SameSite=None/i)
  assert.match(loginCookie, /Secure/i)
  adminCookie = loginCookie.split(";", 1)[0]

  const invalidResponse = await adminFetch(`${baseUrl}/api/blog`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ ...blogPayload, dateTime: "not-a-date" }),
  })
  assert.equal(invalidResponse.status, 400)
  assert.match((await invalidResponse.json()).error, /YYYY-MM-DD/)

  const missingResponse = await fetch(`${baseUrl}/api/works/not-found`)
  assert.equal(missingResponse.status, 404)

  await adminFetch(`${baseUrl}/api/auth/logout`, { method: "POST" })
  adminCookie = undefined
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const failedLoginResponse = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ username: "test-admin", password: "wrong" }),
    })
    assert.equal(failedLoginResponse.status, 401)
  }
  const rateLimitedResponse = await fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ username: "test-admin", password: "wrong" }),
  })
  assert.equal(rateLimitedResponse.status, 429)
})
