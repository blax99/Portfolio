import SiteLayout from "../components/SiteLayout"
import SectionDivider from "../components/SectionDivider"
import { Link } from "react-router-dom"
import { assets, description } from "../data/siteData"
import useApiResource from "../hooks/useApiResource"
import type { AboutProfile, WorkProject } from "../types/content"

function Hero() {
  return (
    <section className="mx-auto flex w-full max-w-[856px] flex-col-reverse items-center justify-between gap-8 px-5 pb-14 pt-10 sm:gap-10 sm:px-6 sm:pb-20 sm:pt-16 md:flex-row md:items-start md:pb-[87px] md:pt-[110px] lg:px-0 lg:pt-[140px]">
      <div className="flex max-w-[506px] flex-col items-center text-center md:items-start md:text-left">
        <p className="font-heebo-bold mb-3 text-[13px] tracking-[0.18em] text-[#00a8cc] uppercase dark:text-[#67e8f9]">
          Hi, I'm
        </p>
        <h1 className="font-heebo-bold text-[38px] leading-[1.05] tracking-[-0.045em] text-[#21243d] sm:text-[42px] md:text-[56px] md:leading-[1.08] dark:text-[#f8fafc]">
          Krrish
          <span className="block text-[#00a8cc] dark:text-[#67e8f9]">
            Web developer.
          </span>
        </h1>
        <p className="font-heebo-regular mt-6 max-w-[497px] text-justify text-[16px] leading-normal text-[#21243d] md:mt-8 dark:text-[#cbd5e1]">
          {description}
        </p>
        <a
          className="font-heebo-bold mt-[27px] border-2 border-[#21243d] bg-[#ff6464] px-[18px] py-[10px] text-[16px] tracking-wide text-white transition-colors hover:bg-[#e95454] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff6464] md:mt-[39px] dark:border-[#94a3b8]"
          download="Krrish-Resume.pdf"
          href="/assets/resume.pdf"
        >
          Download Resume
        </a>
      </div>

      <div
        className="relative h-[224px] w-[216px] shrink-0 sm:h-[256px] sm:w-[248px]"
        aria-hidden="true"
      >
        <img
          alt=""
          className="absolute right-0 top-0 h-[208px] w-[208px] rounded-full border-4 border-green-500 object-cover sm:h-[243px] sm:w-[243px]"
          height="243"
          src={assets.portrait}
          width="243"
        />
      </div>
    </section>
  )
}

function AboutMe() {
  const { data: aboutProfiles } = useApiResource<AboutProfile[]>("about")
  const profile = aboutProfiles?.[0]
  const education =
    profile?.education ??
    "BSc Computer Science and Inforamtion Technology,\nTribhuvan University"
  const facts = [
    {
      title: "Name",
      value: profile?.name ?? "Krishna Chaudhary",
      icon: (
        <svg
          aria-hidden="true"
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 22 22"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      ),
    },
    {
      title: "Location",
      value: profile?.location ?? "Kathmandu, Nepal",
      icon: (
        <svg
          aria-hidden="true"
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M15 10a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      ),
    },
    {
      title: "Education",
      value: education.includes("\n")
        ? education
        : education.replace(/,\s*/, ",\n"),
      icon: (
        <svg
          aria-hidden="true"
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 14l9-5-9-5-9 5 9 5z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 14v10"
          />
        </svg>
      ),
    },
    {
      title: "Interest",
      value: profile?.interest ?? "Web development & building products",
      icon: (
        <svg
          aria-hidden="true"
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
          />
        </svg>
      ),
    },
  ]

  return (
    <section
      className="mx-auto w-full max-w-[858px] px-5 pb-14 pt-6 sm:px-6 sm:pb-16 sm:pt-[30px] md:pb-20 lg:px-0"
      id="about"
    >
      <div className="mb-9">
        <p className="font-heebo-medium text-[16px] tracking-[0.18em] text-[#ff6464] uppercase">
          About Me
        </p>
        <h2 className="font-heebo-bold mt-2 text-[36px] leading-tight text-[#21243d] sm:text-[44px] md:text-[52px] dark:text-[#f8fafc]">
          Get to know me
        </h2>
      </div>
      <div className="border-2 border-[#21243d] bg-white/70 p-4 shadow-[6px_6px_0_#00a8cc] transition-colors sm:p-7 dark:border-[#94a3b8] dark:bg-[#111c2e]/80 dark:shadow-[6px_6px_0_#0e7490]">
        <div className="mb-6 flex items-center justify-between border-b-2 border-dashed border-[#cbd5e1] pb-4 dark:border-[#334155]">
          <p className="font-heebo-bold text-[12px] tracking-[0.16em] text-[#64748b] uppercase dark:text-[#94a3b8]">
            Player profile <span className="text-[#ff6464]">/ 001</span>
          </p>
          <div aria-hidden="true" className="flex gap-1">
            <span className="h-2.5 w-2.5 bg-[#ff6464]" />
            <span className="h-2.5 w-2.5 bg-[#00a8cc]" />
            <span className="h-2.5 w-2.5 bg-[#21243d] dark:bg-[#94a3b8]" />
          </div>
        </div>
        <div className="grid items-center gap-8 md:grid-cols-[260px_minmax(0,1fr)] md:gap-10">
          <div className="relative mx-auto w-full max-w-[300px] md:mx-0 md:max-w-none">
            <div
              aria-hidden="true"
              className="absolute -left-2 -top-2 grid grid-cols-3 gap-1"
            >
              <span className="h-2 w-2 bg-[#00a8cc]" />
              <span className="h-2 w-2 bg-[#00a8cc]" />
              <span className="h-2 w-2 bg-[#ff6464]" />
              <span className="h-2 w-2 bg-[#00a8cc]" />
            </div>
            <div className="aspect-[13/14] overflow-hidden border-2 border-[#21243d] bg-[#e8f7fa] dark:border-[#94a3b8] dark:bg-[#1f2a44]">
              <img
                alt={profile?.imageAlt ?? "Krishna Chaudhary"}
                className="h-full w-full object-cover object-center"
                height={280}
                src={profile?.image ?? assets.portrait}
                width={260}
              />
            </div>
            <div
              aria-hidden="true"
              className="absolute -bottom-2 -right-2 grid grid-cols-3 gap-1"
            >
              <span className="h-2 w-2 bg-[#ff6464]" />
              <span className="h-2 w-2 bg-[#00a8cc]" />
              <span className="h-2 w-2 bg-[#00a8cc]" />
              <span className="h-2 w-2 bg-[#00a8cc]" />
            </div>
          </div>
          <div className="grid min-w-0 content-center sm:grid-cols-2">
            {facts.map((fact, index) => (
              <article
                key={fact.title}
                className={`grid grid-cols-[36px_minmax(0,1fr)] items-start gap-3 border-b border-[#dbe7eb] py-5 dark:border-[#334155] ${
                  index === 0
                    ? "sm:border-r sm:pr-5"
                    : index === 1
                      ? "sm:pl-5"
                      : "sm:col-span-2"
                }`}
              >
                <div className="flex w-9 shrink-0 flex-col items-center gap-2 text-[#00a8cc] dark:text-[#67e8f9]">
                  <span className="font-heebo-bold text-[10px] leading-none text-[#ff6464]">
                    0{index + 1}
                  </span>
                  {fact.icon}
                </div>
                <div className="min-w-0">
                  <h3 className="font-heebo-bold text-[13px] leading-5 text-[#64748b] dark:text-[#94a3b8]">
                    {fact.title}
                  </h3>
                  <p className="font-heebo-regular mt-1 text-[14px] leading-5 whitespace-pre-line text-[#21243d] dark:text-[#f8fafc]">
                    {fact.value}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function FeaturedWorks() {
  const { data: works, error, loading } = useApiResource<WorkProject[]>("works")
  const featuredWorks = works?.filter((work) => work.featured) ?? []

  return (
    <section
      className="mx-auto w-full max-w-[858px] px-5 pb-6 pt-6 sm:px-6 sm:pt-[30px] md:pb-8 lg:px-0"
      id="works"
    >
      <div className="mb-6 flex items-end justify-between border-b-2 border-dashed border-[#cbd5e1] pb-4 dark:border-[#334155]">
        <div>
          <p className="font-heebo-medium text-[13px] tracking-[0.16em] text-[#ff6464] uppercase">
            Selected projects
          </p>
          <h2 className="font-heebo-bold mt-1 text-[28px] leading-tight text-[#21243d] md:text-[32px] dark:text-[#f8fafc]">
            Featured works
          </h2>
        </div>
        <Link
          className="font-heebo-bold hidden border-2 border-[#21243d] px-3 py-2 text-[12px] text-[#21243d] transition-colors hover:bg-[#21243d] hover:text-white sm:inline-flex dark:border-[#94a3b8] dark:text-[#f8fafc] dark:hover:bg-[#94a3b8] dark:hover:text-[#0f172a]"
          to="/works"
        >
          All projects →
        </Link>
      </div>
      <div className="flex flex-col gap-5">
        {loading && (
          <p className="font-heebo-regular text-[#8695a4] dark:text-[#94a3b8]">
            Loading projects…
          </p>
        )}
        {error && (
          <p className="font-heebo-regular text-[#c24141]" role="alert">
            Could not load projects: {error}
          </p>
        )}
        {featuredWorks.map((work) => (
          <article
            className="group grid gap-5 border-2 border-[#21243d] bg-white/80 p-4 shadow-[5px_5px_0_#00a8cc] transition-transform hover:-translate-y-1 sm:p-5 md:grid-cols-[246px_minmax(0,1fr)] dark:border-[#94a3b8] dark:bg-[#1f2a44] dark:shadow-[5px_5px_0_#0e7490]"
            key={work.id}
          >
            <div className="relative aspect-[4/3] overflow-hidden border-2 border-[#21243d] bg-[#edf7fa] dark:border-[#94a3b8] dark:bg-[#0f172a]">
              <img
                alt={`${work.title} project preview`}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                loading="lazy"
                src={work.image}
              />
              <span className="font-heebo-black absolute left-2 top-2 border-2 border-[#21243d] bg-white px-2 py-1 text-[12px] text-[#ff6464] dark:border-[#94a3b8] dark:bg-[#0f172a]">
                {work.number}
              </span>
            </div>
            <div className="flex min-w-0 flex-col items-start text-[#21243d] dark:text-[#e2e8f0]">
              <h3 className="font-heebo-bold border-b-2 border-dashed border-[#cbd5e1] pb-3 text-[26px] leading-tight transition-colors group-hover:text-[#007f9b] dark:border-[#334155] dark:group-hover:text-[#67e8f9]">
                <Link to="/works">{work.title}</Link>
              </h3>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <span className="font-heebo-black border-2 border-[#21243d] bg-[#142850] px-2 py-0.5 text-[14px] leading-normal text-white dark:border-[#94a3b8]">
                  {work.year}
                </span>
                <span className="font-heebo-medium text-[12px] tracking-[0.12em] text-[#ff6464] uppercase">
                  {work.category}
                </span>
              </div>
              <p className="font-heebo-regular mt-4 text-[15px] leading-[1.65]">
                {work.summary}
              </p>
            </div>
          </article>
        ))}
        {!loading && !error && featuredWorks.length === 0 && (
          <p className="font-heebo-regular text-[#8695a4] dark:text-[#94a3b8]">
            No featured projects yet.
          </p>
        )}
      </div>
      <Link
        className="font-heebo-bold mt-5 inline-flex border-2 border-[#21243d] px-4 py-2 text-[13px] text-[#21243d] transition-colors hover:bg-[#21243d] hover:text-white sm:hidden dark:border-[#94a3b8] dark:text-[#f8fafc] dark:hover:bg-[#94a3b8] dark:hover:text-[#0f172a]"
        to="/works"
      >
        All projects →
      </Link>
    </section>
  )
}

export default function HomePage() {
  return (
    <SiteLayout showDailyQuote>
      <main>
        <Hero />
        <SectionDivider />
        <AboutMe />
        <SectionDivider />
        <FeaturedWorks />
      </main>
    </SiteLayout>
  )
}
