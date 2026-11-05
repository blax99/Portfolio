const kathmanduOffsetMs = (5 * 60 + 45) * 60 * 1000

function getKathmanduPeriodStarts(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kathmandu",
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).formatToParts(now)
  const dateParts = Object.fromEntries(
    parts.map(({ type, value }) => [type, Number(value)]),
  )
  const { year, month, day } = dateParts
  const localDate = Date.UTC(year, month - 1, day)
  const weekday = new Date(localDate).getUTCDay()
  const daysSinceMonday = (weekday + 6) % 7

  return {
    day: new Date(localDate - kathmanduOffsetMs),
    week: new Date(
      Date.UTC(year, month - 1, day - daysSinceMonday) - kathmanduOffsetMs,
    ),
    month: new Date(Date.UTC(year, month - 1, 1) - kathmanduOffsetMs),
    year: new Date(Date.UTC(year, 0, 1) - kathmanduOffsetMs),
  }
}

function countVisitorPeriods(visitors, now = new Date()) {
  const starts = getKathmanduPeriodStarts(now)
  return {
    total: visitors.length,
    year: visitors.filter((visitor) => visitor.visitedAt >= starts.year).length,
    month: visitors.filter((visitor) => visitor.visitedAt >= starts.month)
      .length,
    week: visitors.filter((visitor) => visitor.visitedAt >= starts.week).length,
    day: visitors.filter((visitor) => visitor.visitedAt >= starts.day).length,
  }
}

module.exports = { countVisitorPeriods, getKathmanduPeriodStarts }
