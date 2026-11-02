const mongoose = require("mongoose")

const dailyThoughtSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    text: { type: String, required: true, trim: true, maxlength: 2000 },
    author: { type: String, required: true, trim: true, maxlength: 2000 },
    image: { type: String, trim: true, maxlength: 2000 },
    imageAlt: { type: String, trim: true, maxlength: 2000 },
    imageSource: { type: String, trim: true, maxlength: 2000 },
  },
  {
    collection: "thoughts",
    versionKey: false,
  },
)

module.exports = mongoose.model("DailyThought", dailyThoughtSchema)
