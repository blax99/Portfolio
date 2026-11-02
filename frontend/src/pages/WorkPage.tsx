import { useState } from "react"
import SiteLayout from "../components/SiteLayout"
import SectionDivider from "../components/SectionDivider"
import useApiResource from "../hooks/useApiResource"
import type { WorkProject } from "../types/content"
import { Link } from "react-router-dom"

export default function WorkPage() {
  const {
    data: csProjects,
    error,
    loading,
  } = useApiResource<WorkProject[]>("works")
  const technologies = new Set(
    csProjects?.flatMap((project) => project.technologies) ?? [],
  )
  const years =
    csProjects
      ?.map((project) => Number(project.year))
      .filter(Number.isInteger)
      .sort((a, b) => a - b) ?? []
  const timeline =
    years.length > 1
      ? `${years[0]}–${years[years.length - 1]}`
      : (years[0]?.toString() ?? "—")

  const projectsPerPage = 3
  const [currentPage, setCurrentPage] = useState(1)
  const totalProjects = csProjects?.length ?? 0
  const totalPages = Math.ceil(totalProjects / projectsPerPage)
  const startIndex = (currentPage - 1) * projectsPerPage
  const endIndex = startIndex + projectsPerPage
  const paginatedProjects = csProjects?.slice(startIndex, endIndex) ?? []

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }

  const goPrev = () => goToPage(currentPage - 1)
  const goNext = () => goToPage(currentPage + 1)

  return (
    <SiteLayout active="works">
      <main>
        <section className="bg-[#edf7fa] transition-colors dark:bg-[#0f172a]">
          <div className="mx-auto w-full max-w-[858px] px-6 pt-10 pb-6 md:px-0 md:pt-[46px] md:pb-6">
            <Link
              className="font-heebo-medium text-[16px] text-[#00a8cc] hover:underline"
              to="/"
            >
              ← Back to home
            </Link>
            <p className="font-heebo-medium mt-8 text-[16px] uppercase tracking-[0.18em] text-[#ff6464]">
              Projects & experiments
            </p>
            <h1 className="font-heebo-bold mt-2 max-w-[660px] text-[40px] leading-[1.2] text-[#21243d] md:text-[52px] dark:text-[#f8fafc]">
              Computer Science Projects
            </h1>
            <p className="font-heebo-regular mt-5 max-w-[650px] text-[18px] leading-[1.65] text-[#21243d] dark:text-[#cbd5e1]">
              A collection of products where thoughtful engineering meets
              practical problem-solving, from full-stack platforms to algorithm
              visualization and AI-assisted learning.
            </p>
          </div>
        </section>
        <SectionDivider />

        <section className="mx-auto w-full max-w-[858px] px-6 pt-8 pb-16 md:px-0 md:pt-12 md:pb-[86px]">
          <div
            className={`grid grid-cols-3 gap-3 text-[#21243d] dark:text-[#f8fafc] ${
              csProjects?.length === 0 && !loading && !error ? "mb-7" : "mb-12"
            }`}
          >
            <div className="border-2 border-[#21243d] bg-white/70 p-3 shadow-[3px_3px_0_#00a8cc] dark:border-[#94a3b8] dark:bg-[#1f2a44] dark:shadow-[3px_3px_0_#0e7490] sm:p-4">
              <p className="font-heebo-bold text-[28px]">
                {String(csProjects?.length ?? 0).padStart(2, "0")}
              </p>
              <p className="font-heebo-regular text-[14px] text-[#8695a4] dark:text-[#94a3b8]">
                Projects
              </p>
            </div>
            <div className="border-2 border-[#21243d] bg-white/70 p-3 shadow-[3px_3px_0_#00a8cc] dark:border-[#94a3b8] dark:bg-[#1f2a44] dark:shadow-[3px_3px_0_#0e7490] sm:p-4">
              <p className="font-heebo-bold text-[28px]">
                {technologies.size.toString().padStart(2, "0")}
              </p>
              <p className="font-heebo-regular text-[14px] text-[#8695a4] dark:text-[#94a3b8]">
                Technologies
              </p>
            </div>
            <div className="border-2 border-[#21243d] bg-white/70 p-3 shadow-[3px_3px_0_#00a8cc] dark:border-[#94a3b8] dark:bg-[#1f2a44] dark:shadow-[3px_3px_0_#0e7490] sm:p-4">
              <p className="font-heebo-bold text-[28px]">{timeline}</p>
              <p className="font-heebo-regular text-[14px] text-[#8695a4] dark:text-[#94a3b8]">
                Timeline
              </p>
            </div>
          </div>

          <div
            className={`flex flex-col ${
              csProjects?.length === 0 && !loading && !error ? "gap-0" : "gap-8"
            }`}
          >
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
            {csProjects?.length === 0 && !loading && !error && (
              <p className="font-heebo-regular text-[#8695a4] dark:text-[#94a3b8]">
                No projects yet.
              </p>
            )}
            {paginatedProjects.map((project, index) => (
              <article
                className="group flex flex-col gap-5 border-2 border-[#21243d] bg-white/80 p-4 shadow-[5px_5px_0_#00a8cc] transition-transform hover:-translate-y-1 hover:shadow-[7px_7px_0_#00a8cc] sm:p-6 md:flex-row md:items-start md:gap-7 dark:border-[#94a3b8] dark:bg-[#1f2a44] dark:shadow-[5px_5px_0_#0e7490] dark:hover:shadow-[7px_7px_0_#0e7490]"
                key={project.id}
              >
                <div className="relative aspect-[16/10] overflow-hidden border-2 border-[#21243d] bg-[#edf7fa] md:aspect-[4/3] md:w-[34%] md:shrink-0 dark:border-[#94a3b8] dark:bg-[#0f172a]">
                  <img
                    alt={`${project.title} project preview`}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    loading="lazy"
                    src={project.image}
                  />
                  <span className="font-heebo-black absolute left-2 top-2 border-2 border-[#21243d] bg-white px-3 py-1 text-[14px] text-[#ff6464] dark:border-[#94a3b8] dark:bg-[#0f172a]">
                    {String(startIndex + index + 1).padStart(2, "0")}
                  </span>
                </div>
                <div className="min-w-0 flex-1 md:py-1">
                  <div className="flex flex-col justify-between gap-3 border-b-2 border-dashed border-[#cbd5e1] pb-4 dark:border-[#334155] sm:flex-row sm:items-start">
                    <div>
                      <h2 className="font-heebo-bold text-[28px] leading-tight text-[#21243d] transition-colors group-hover:text-[#007f9b] dark:text-[#f8fafc] dark:group-hover:text-[#67e8f9]">
                        {project.title}
                      </h2>
                      <p className="font-heebo-medium mt-2 text-[13px] tracking-[0.12em] text-[#ff6464] uppercase">
                        {project.category}
                      </p>
                    </div>
                    <span className="font-heebo-black w-fit border-2 border-[#21243d] bg-[#142850] px-3 py-1 text-[14px] text-white dark:border-[#94a3b8]">
                      {project.year}
                    </span>
                  </div>

                  <p className="font-heebo-regular mt-6 text-[16px] leading-[1.7] text-[#21243d] dark:text-[#cbd5e1]">
                    {project.summary}
                  </p>

                  <div
                    aria-label="Technologies used"
                    className="mt-6 flex flex-wrap gap-2"
                  >
                    {project.technologies.map((technology) => (
                      <span
                        className="font-heebo-medium border border-[#00a8cc]/40 bg-[#edf7fa] px-3 py-1 text-[13px] text-[#007f9b] dark:border-[#67e8f9]/30 dark:bg-[#263552] dark:text-[#67e8f9]"
                        key={technology}
                      >
                        {technology}
                      </span>
                    ))}
                  </div>

                  <details className="project-details mt-7 border-t-2 border-dashed border-[#cbd5e1] pt-5 dark:border-[#334155]">
                    <summary className="font-heebo-bold cursor-pointer text-[14px] tracking-wide text-[#ff6464] uppercase">
                      View project details
                    </summary>
                    <ul className="font-heebo-regular mt-4 grid gap-2 text-[15px] leading-relaxed text-[#21243d] dark:text-[#cbd5e1]">
                      {project.highlights.map((highlight) => (
                        <li className="flex gap-3" key={highlight}>
                          <span
                            className="mt-[9px] h-2 w-2 shrink-0 bg-[#00a8cc]"
                            aria-hidden="true"
                          />
                          {highlight}
                        </li>
                      ))}
                    </ul>
                  </details>
                </div>
              </article>
            ))}
          </div>
        </section>

        {totalPages > 1 && (
          <section className="mx-auto w-full max-w-[858px] px-6 pb-12 pt-[30px] md:px-0 md:pb-16">
            <nav
              className="flex flex-col items-center justify-between gap-6 md:flex-row"
              aria-label="Project pagination"
            >
              <button
                onClick={goPrev}
                disabled={currentPage === 1}
                className="font-heebo-medium rounded-[4px] border border-[#e5e5ea] px-4 py-2 text-[16px] text-[#21243d] transition-colors disabled:opacity-50 disabled:pointer-events-none dark:border-[#334155] dark:text-[#f8fafc] hover:bg-[#ff6464] hover:text-white dark:hover:bg-[#00a8cc] dark:hover:text-white"
              >
                Prev
              </button>
              <div className="flex gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => goToPage(page)}
                      aria-current={currentPage === page ? "page" : undefined}
                      className={`rounded-[4px] px-4 py-2 text-[16px] transition-colors ${
                        currentPage === page
                          ? "bg-[#ff6464] text-white"
                          : "border border-[#e5e5ea] text-[#21243d] hover:bg-[#ff6464] hover:text-white dark:border-[#334155] dark:text-[#f8fafc] dark:hover:bg-[#00a8cc] dark:hover:text-white"
                      }`}
                    >
                      {page}
                    </button>
                  ),
                )}
              </div>
              <button
                onClick={goNext}
                disabled={currentPage === totalPages}
                className="font-heebo-medium rounded-[4px] border border-[#e5e5ea] px-4 py-2 text-[16px] text-[#21243d] transition-colors disabled:opacity-50 disabled:pointer-events-none dark:border-[#334155] dark:text-[#f8fafc] hover:bg-[#ff6464] hover:text-white dark:hover:bg-[#00a8cc] dark:hover:text-white"
              >
                Next
              </button>
            </nav>
          </section>
        )}
      </main>
    </SiteLayout>
  )
}
