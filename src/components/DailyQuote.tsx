import { useEffect, useState } from "react"
import type { DailyThought } from "../types/content"
import useApiResource from "../hooks/useApiResource"
import { getMillisecondsUntilKathmanduMidnight } from "../utils/kathmanduTime"

const fallbackThoughts: DailyThought[] = [
  {
    id: "thought-benjamin-franklin",
    text: "Well done is better than well said.",
    author: "Benjamin Franklin",
    image: "/assets/benjamin-franklin.jpg",
    imageAlt: "Portrait of Benjamin Franklin",
    imageSource:
      "https://commons.wikimedia.org/wiki/File:Joseph_Siffrein_Duplessis_-_Benjamin_Franklin_-_Google_Art_Project.jpg",
  },
  {
    id: "thought-marcus-aurelius",
    text: "The happiness of your life depends upon the quality of your thoughts.",
    author: "Marcus Aurelius",
    image: "/assets/marcus-aurelius.jpg",
    imageAlt: "Sculpted portrait of Marcus Aurelius",
    imageSource:
      "https://commons.wikimedia.org/wiki/File:Head_Marcus_Aurelius_archmus_Heraklion.jpg",
  },
  {
    id: "thought-thomas-edison",
    text: "Genius is one percent inspiration and ninety-nine percent perspiration.",
    author: "Thomas Edison",
    image: "/assets/thomas-edison.jpg",
    imageAlt: "Portrait of Thomas Edison",
    imageSource: "https://commons.wikimedia.org/wiki/File:Thomas_Edison2.jpg",
  },
]

const millisecondsPerDay = 24 * 60 * 60 * 1000
const kathmanduOffset = (5 * 60 + 45) * 60 * 1000

function getKathmanduDayIndex() {
  return Math.floor((Date.now() + kathmanduOffset) / millisecondsPerDay)
}

export default function DailyQuote() {
  const [dayIndex, setDayIndex] = useState(getKathmanduDayIndex)
  const { data: thoughts, error } = useApiResource<DailyThought[]>("thoughts")

  useEffect(() => {
    let timeoutId: number
    const updateQuote = () => {
      setDayIndex(getKathmanduDayIndex())
      timeoutId = window.setTimeout(
        updateQuote,
        getMillisecondsUntilKathmanduMidnight(),
      )
    }

    timeoutId = window.setTimeout(
      updateQuote,
      getMillisecondsUntilKathmanduMidnight(),
    )

    return () => window.clearTimeout(timeoutId)
  }, [])

  if (thoughts?.length === 0 && !error) return null

  const dailyThoughts = thoughts?.length ? thoughts : fallbackThoughts
  const quote = dailyThoughts[dayIndex % dailyThoughts.length]

  return (
    <section
      aria-labelledby="daily-quote-title"
      className="mx-auto w-full max-w-[858px] px-6 pt-10 pb-12 md:px-0 md:pt-12 md:pb-16"
    >
      <div className="border-2 border-[#21243d] bg-white/80 p-4 shadow-[6px_6px_0_#00a8cc] dark:border-[#94a3b8] dark:bg-[#1f2a44] dark:shadow-[6px_6px_0_#0e7490] sm:p-6">
        <div className="mb-5 flex items-center justify-between border-b-2 border-dashed border-[#cbd5e1] pb-3 dark:border-[#334155]">
          <p
            className="font-heebo-bold text-[12px] uppercase tracking-[0.16em] text-[#64748b] dark:text-[#94a3b8]"
            id="daily-quote-title"
          >
            Thought of the day <span className="text-[#ff6464]">/ 01</span>
          </p>
          <div aria-hidden="true" className="flex gap-1">
            <span className="h-2.5 w-2.5 bg-[#ff6464]" />
            <span className="h-2.5 w-2.5 bg-[#00a8cc]" />
            <span className="h-2.5 w-2.5 bg-[#21243d] dark:bg-[#94a3b8]" />
          </div>
        </div>
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start sm:gap-7">
          {quote.image && (
            <div className="relative shrink-0">
              <img
                alt={quote.imageAlt ?? ""}
                className="h-32 w-32 border-2 border-[#21243d] object-cover shadow-[4px_4px_0_#ff6464] dark:border-[#94a3b8] sm:h-36 sm:w-36"
                height="144"
                loading="lazy"
                src={quote.image}
                width="144"
              />
              <span className="font-heebo-black absolute -bottom-2 -right-2 border-2 border-[#21243d] bg-white px-2 py-0.5 text-[11px] text-[#00a8cc] dark:border-[#94a3b8] dark:bg-[#0f172a]">
                {String((dayIndex % dailyThoughts.length) + 1).padStart(2, "0")}
              </span>
            </div>
          )}
          <div className="min-w-0 text-center sm:text-left">
            <blockquote className="font-heebo-medium text-[20px] leading-snug text-[#21243d] sm:text-[24px] dark:text-[#f8fafc]">
              “{quote.text}”
            </blockquote>
            <p className="font-heebo-bold mt-5 text-[15px] text-[#21243d] dark:text-[#e2e8f0]">
              {quote.author}
            </p>
            {quote.imageSource && (
              <a
                className="font-heebo-regular mt-1 inline-block text-[11px] text-[#8695a4] underline decoration-transparent underline-offset-2 transition-colors hover:text-[#ff6464] hover:decoration-current dark:text-[#94a3b8]"
                href={quote.imageSource}
                rel="noreferrer"
                target="_blank"
              >
                Portrait source
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
