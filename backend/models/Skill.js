const mongoose = require("mongoose")

const skillSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    group: { type: String, required: true, trim: true, maxlength: 2000 },
    name: { type: String, required: true, trim: true, maxlength: 2000 },
    logo: { type: String, trim: true, maxlength: 2000 },
    color: { type: String, trim: true, maxlength: 2000 },
    imageUrl: { type: String, trim: true, maxlength: 2000 },
  },
  {
    collection: "skills",
    versionKey: false,
  },
)

module.exports = mongoose.model("Skill", skillSchema)
