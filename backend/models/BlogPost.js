const mongoose = require("mongoose")

const blogPostSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 2000 },
    date: { type: String, required: true, trim: true },
    dateTime: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    readTime: { type: String, required: true, trim: true },
    summary: { type: String, required: true, trim: true, maxlength: 2000 },
    content: { type: String, required: true, trim: true, maxlength: 2000 },
  },
  {
    collection: "blogPosts",
    versionKey: false,
  },
)

module.exports = mongoose.model("BlogPost", blogPostSchema)
