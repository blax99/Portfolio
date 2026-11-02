import { useEffect, useState, type ReactNode } from "react"
import { Link } from "react-router-dom"
import NepaliDate from "nepali-date-converter"
import DailyQuote from "./DailyQuote"
import { assets } from "../data/siteData"
import { getMillisecondsUntilKathmanduMidnight } from "../utils/kathmanduTime"

type ActivePage = "works" | "blog" | "contact" | "skills"

const nepaliMonths = [
  "बैशाख",
  "जेठ",
  "असार",
  "साउन",
  "भदौ",
  "असोज",
  "कार्तिक",
  "मंसिर",
  "पुष",
  "माघ",
  "फागुन",
  "चैत",
]

function getKathmanduDate() {
  const now = new Date()
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kathmandu",
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).formatToParts(now)
  const dateParts = Object.fromEntries(
    parts.map(({ type, value }) => [type, value]),
  )
  const year = Number(dateParts.year)
  const month = Number(dateParts.month)
  const day = Number(dateParts.day)
  const nepaliDate = NepaliDate.fromAD(new Date(year, month - 1, day, 12))
  const date = nepaliDate.getBS()

  return {
    dateTime: `${year.toString().padStart(4, "0")}-${month
      .toString()
      .padStart(2, "0")}-${day.toString().padStart(2, "0")}`,
    label: `${nepaliDate.format("D", "np")} ${nepaliMonths[date.month]}`,
    year: nepaliDate.format("YYYY", "np"),
  }
}

function NepaliDateBadge() {
  const [date, setDate] = useState(getKathmanduDate)

  useEffect(() => {
    let timeoutId: number
    const updateDate = () => {
      setDate(getKathmanduDate())
      timeoutId = window.setTimeout(
        updateDate,
        getMillisecondsUntilKathmanduMidnight(),
      )
    }

    timeoutId = window.setTimeout(
      updateDate,
      getMillisecondsUntilKathmanduMidnight(),
    )

    return () => window.clearTimeout(timeoutId)
  }, [])

  return (
    <time
      className="flex min-w-[74px] flex-col items-start font-sans leading-tight text-[#21243d] dark:text-[#f8fafc]"
      dateTime={date.dateTime}
      lang="ne-NP"
    >
      <span className="text-[14px] font-semibold">{date.label}</span>
      <span className="mt-0.5 text-[12px] text-[#8695a4] dark:text-[#94a3b8]">
        {date.year}
      </span>
    </time>
  )
}

function ThemeToggle() {
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = window.localStorage.getItem("theme")
    if (savedTheme) return savedTheme === "dark"
    return window.matchMedia("(prefers-color-scheme: dark)").matches
  })

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode)
    window.localStorage.setItem("theme", darkMode ? "dark" : "light")
  }, [darkMode])

  return (
    <button
      aria-label={`Switch to ${darkMode ? "light" : "dark"} mode`}
      aria-pressed={darkMode}
      className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-[#e5e5ea] text-[#21243d] transition-colors hover:border-[#ff6464] hover:text-[#ff6464] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff6464] dark:border-[#475569] dark:text-[#f8fafc]"
      onClick={() => setDarkMode((current) => !current)}
      type="button"
    >
      {darkMode ? (
        <svg
          aria-hidden="true"
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.8"
          viewBox="0 0 24 24"
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" />
        </svg>
      ) : (
        <svg
          aria-hidden="true"
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.8"
          viewBox="0 0 24 24"
        >
          <path d="M20.9 13A9 9 0 0 1 11 3.1 9 9 0 1 0 20.9 13Z" />
        </svg>
      )}
    </button>
  )
}

function Header({ active }: { active?: ActivePage }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    if (!mobileMenuOpen) return

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileMenuOpen(false)
    }

    window.addEventListener("keydown", closeOnEscape)
    return () => window.removeEventListener("keydown", closeOnEscape)
  }, [mobileMenuOpen])

  const linkClassName = (page: ActivePage) =>
    `relative py-2 transition-colors duration-200 hover:text-[#00a8cc] after:absolute after:right-0 after:bottom-0 after:left-0 after:h-[2px] after:origin-left after:scale-x-0 after:bg-[#00a8cc] after:transition-transform after:duration-200 hover:after:scale-x-100 ${
      active === page ? "text-[#ff6464]" : ""
    }`

  return (
    <header className="sticky top-0 z-50 flex h-[70px] w-full items-center justify-between bg-[#edf7fa]/95 px-5 backdrop-blur dark:bg-[#0f172a]/95 sm:px-10 sm:pr-14 sm:pl-14 lg:px-20">
      <NepaliDateBadge />
      <button
        aria-controls="primary-navigation"
        aria-expanded={mobileMenuOpen}
        aria-label={
          mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"
        }
        className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-md border border-[#d1dce3] text-[#21243d] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00a8cc] sm:hidden dark:border-[#475569] dark:text-[#f8fafc]"
        onClick={() => setMobileMenuOpen((open) => !open)}
        type="button"
      >
        {mobileMenuOpen ? (
          <svg
            aria-hidden="true"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              d="m6 6 12 12M18 6 6 18"
              stroke="currentColor"
              strokeLinecap="round"
              strokeWidth="2"
            />
          </svg>
        ) : (
          <svg
            aria-hidden="true"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              d="M4 7h16M4 12h16M4 17h16"
              stroke="currentColor"
              strokeLinecap="round"
              strokeWidth="2"
            />
          </svg>
        )}
      </button>
      <nav
        id="primary-navigation"
        aria-label="Primary navigation"
        className={`font-heebo-medium absolute top-full right-0 left-0 flex-col gap-1 border-t border-[#d1dce3] bg-[#edf7fa] px-5 py-3 text-[18px] leading-normal text-black shadow-lg sm:static sm:flex sm:flex-row sm:items-center sm:gap-[34px] sm:border-0 sm:bg-transparent sm:p-0 sm:text-[20px] sm:shadow-none dark:border-[#334155] dark:bg-[#0f172a] dark:text-[#f8fafc] ${
          mobileMenuOpen ? "flex" : "hidden sm:flex"
        }`}
      >
        <Link
          className={linkClassName("works")}
          onClick={() => setMobileMenuOpen(false)}
          to="/works"
        >
          Works
        </Link>
        <Link
          className={linkClassName("skills")}
          onClick={() => setMobileMenuOpen(false)}
          to="/skills"
        >
          Skills
        </Link>
        <Link
          className={linkClassName("blog")}
          onClick={() => setMobileMenuOpen(false)}
          to="/blog"
        >
          Blog
        </Link>
        <Link
          className={linkClassName("contact")}
          onClick={() => setMobileMenuOpen(false)}
          to="/contact"
        >
          Contact
        </Link>
        <div className="flex items-center justify-between py-2 sm:p-0">
          <span className="text-[14px] text-[#64748b] sm:hidden dark:text-[#94a3b8]">
            Appearance
          </span>
          <ThemeToggle />
        </div>
      </nav>
    </header>
  )
}

function Footer() {
  const links = [
    { label: "Facebook", icon: assets.facebook, link: "#" },
    { label: "GitHub", icon: assets.github, link: "https://github.com/blax99" },
    { label: "Twitter", icon: assets.twitter, link: "#" },
    {
      label: "LinkedIn",
      icon: assets.linkedin,
      link: "https://www.linkedin.com/in/krishna-chaudhary-dev/",
    },
  ]

  return (
    <footer className="flex min-h-[182px] flex-col items-center bg-[#edf7fa] transition-colors dark:bg-[#0f172a]">
      <div
        aria-hidden="true"
        className="mb-[46px] w-4/5 border-t-4 border-black/40 dark:border-white/30"
      />
      <div className="flex items-center gap-[35px]">
        {links.map((link) => (
          <a
            aria-label={link.label}
            className="flex h-[37px] items-center justify-center transition-opacity hover:opacity-65"
            href={link.link}
            target="_blank"
            rel="noopener noreferrer"
            key={link.label}
          >
            <img
              alt=""
              className="h-8 w-8 object-contain dark:invert"
              height="32"
              src={link.icon}
              width="32"
            />
          </a>
        ))}
      </div>
      <p className="font-heebo-regular mt-[16px] text-center text-[14px] leading-normal text-[#21243d] dark:text-[#cbd5e1]">
        Copyright ©2026 All rights reserved
      </p>
    </footer>
  )
}

export default function SiteLayout({
  active,
  showDailyQuote = false,
  children,
}: {
  active?: ActivePage
  showDailyQuote?: boolean
  children: ReactNode
}) {
  return (
    <>
      <Header active={active} />
      {children}
      {showDailyQuote && <DailyQuote />}
      <Footer />
    </>
  )
}
