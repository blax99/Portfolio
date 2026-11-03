const mongoose = require("mongoose")

const adminSessionSchema = new mongoose.Schema(
  {
    tokenHash: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true, expires: 0 },
  },
  {
    collection: "admin_sessions",
    versionKey: false,
  },
)

module.exports = mongoose.model("AdminSession", adminSessionSchema)
