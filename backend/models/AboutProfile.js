const mongoose = require("mongoose")

const aboutProfileSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 2000 },
    location: { type: String, required: true, trim: true, maxlength: 2000 },
    education: { type: String, required: true, trim: true, maxlength: 2000 },
    interest: { type: String, required: true, trim: true, maxlength: 2000 },
    image: { type: String, required: true, trim: true, maxlength: 2000 },
    imageAlt: { type: String, trim: true, maxlength: 2000 },
  },
  {
    collection: "about",
    versionKey: false,
  },
)

module.exports = mongoose.model("AboutProfile", aboutProfileSchema)
