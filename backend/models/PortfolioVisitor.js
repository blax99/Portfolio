const mongoose = require("mongoose")

const portfolioVisitorSchema = new mongoose.Schema(
  {
    sessionHash: { type: String, required: true, unique: true },
    visitedAt: { type: Date, required: true },
  },
  {
    collection: "portfolio_visitors",
    versionKey: false,
  },
)

module.exports = mongoose.model("PortfolioVisitor", portfolioVisitorSchema)
