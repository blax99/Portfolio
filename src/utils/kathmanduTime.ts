export function getMillisecondsUntilKathmanduMidnight() {
  const now = new Date()
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kathmandu",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hourCycle: "h23",
  }).formatToParts(now)
  const dateParts = Object.fromEntries(
    parts.map(({ type, value }) => [type, Number(value)]),
  )
  const currentNepalTime = Date.UTC(
    dateParts.year,
    dateParts.month - 1,
    dateParts.day,
    dateParts.hour,
    dateParts.minute,
    dateParts.second,
    now.getMilliseconds(),
  )
  const nextMidnight = Date.UTC(
    dateParts.year,
    dateParts.month - 1,
    dateParts.day + 1,
  )

  return nextMidnight - currentNepalTime
}
