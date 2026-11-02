const mongoose = require("mongoose")

const workSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    number: { type: String, trim: true },
    title: { type: String, required: true, trim: true, maxlength: 2000 },
    image: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    year: { type: String, required: true, trim: true },
    featured: { type: Boolean, default: false },
    summary: { type: String, required: true, trim: true, maxlength: 2000 },
    technologies: [{ type: String, trim: true, maxlength: 2000 }],
    highlights: [{ type: String, trim: true, maxlength: 2000 }],
  },
  {
    collection: "works",
    versionKey: false,
  },
)

module.exports = mongoose.model("Work", workSchema)
