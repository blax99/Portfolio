const { createApp } = require("../server")

const app = createApp()

module.exports = (request, response) => {
  if (!request.url.startsWith("/api")) {
    request.url = `/api${request.url.startsWith("/") ? "" : "/"}${request.url}`
  }
  return app(request, response)
}
