import { useState } from "react"
import SiteLayout from "../components/SiteLayout"
import SectionDivider from "../components/SectionDivider"
import useApiResource from "../hooks/useApiResource"
import type { BlogPost } from "../types/content"
import { Link } from "react-router-dom"

export default function BlogPage() {
  const { data: blogPosts, error, loading } = useApiResource<BlogPost[]>("blog")
  const sortedPosts = blogPosts
    ?.slice()
    .sort((a, b) => b.dateTime.localeCompare(a.dateTime))
  const postsPerPage = 5
  const [currentPage, setCurrentPage] = useState(1)
  const totalPosts = sortedPosts?.length ?? 0
  const totalPages = Math.ceil(totalPosts / postsPerPage)
  const startIndex = (currentPage - 1) * postsPerPage
  const visiblePosts =
    sortedPosts?.slice(startIndex, startIndex + postsPerPage) ?? []

  function goToPage(page: number) {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }

  return (
    <SiteLayout active="blog">
      <main>
        <section className="mx-auto w-full max-w-[858px] px-6 pt-10 pb-6 md:px-0 md:pt-[46px] md:pb-6">
          <Link
            className="font-heebo-medium text-[16px] text-[#00a8cc] hover:underline"
            to="/"
          >
            ← Back to home
          </Link>
          <div className="mt-8">
            <p className="font-heebo-medium text-[16px] uppercase tracking-[0.18em] text-[#ff6464]">
              Thoughts & notes
            </p>
            <h1 className="font-heebo-bold mt-2 text-[44px] leading-tight text-[#21243d] md:text-[52px] dark:text-[#f8fafc]">
              Blog
            </h1>
            <p className="font-heebo-regular mt-5 max-w-[620px] text-[18px] leading-[1.65] text-[#21243d] dark:text-[#cbd5e1]">
              Writing about product design, front-end development, creative
              tools, and the systems that bring them together.
            </p>
          </div>
        </section>

        <SectionDivider />

        <section
          className={`mx-auto w-full max-w-[858px] px-6 md:px-0 ${
            totalPosts === 0 ? "pt-4 md:pt-6" : "pt-8 md:pt-12"
          } ${
            totalPages > 1 || totalPosts === 0
              ? "pb-12 md:pb-16"
              : "pb-24 md:pb-[130px]"
          }`}
        >
          <div className="grid gap-5">
            {loading && (
              <p className="font-heebo-regular border-2 border-[#21243d] bg-white/80 p-6 text-[#8695a4] shadow-[5px_5px_0_#00a8cc] dark:border-[#94a3b8] dark:bg-[#1f2a44] dark:text-[#94a3b8] dark:shadow-[5px_5px_0_#0e7490]">
                Loading posts…
              </p>
            )}
            {error && (
              <p
                className="font-heebo-regular border-2 border-[#21243d] bg-white/80 p-6 text-[#c24141] shadow-[5px_5px_0_#ff6464] dark:border-[#94a3b8] dark:bg-[#1f2a44]"
                role="alert"
              >
                Could not load posts: {error}
              </p>
            )}
            {blogPosts?.length === 0 && !loading && !error && (
              <p className="font-heebo-regular text-[#8695a4] dark:text-[#94a3b8]">
                No posts yet.
              </p>
            )}
            {visiblePosts.map((post, index) => (
              <article
                className="group grid gap-5 border-2 border-[#21243d] bg-white/80 p-5 shadow-[5px_5px_0_#00a8cc] transition-transform hover:-translate-y-1 sm:p-7 md:grid-cols-[64px_1fr] md:gap-7 dark:border-[#94a3b8] dark:bg-[#1f2a44] dark:shadow-[5px_5px_0_#0e7490]"
                key={post.id}
              >
                <span className="font-heebo-black flex h-12 w-12 items-center justify-center border-2 border-[#21243d] bg-[#edf7fa] text-[16px] text-[#ff6464] transition-colors group-hover:bg-[#ff6464] group-hover:text-white dark:border-[#94a3b8] dark:bg-[#0f172a] dark:group-hover:bg-[#ff6464]">
                  {String(startIndex + index + 1).padStart(2, "0")}
                </span>
                <div>
                  <h2 className="font-heebo-bold border-b-2 border-dashed border-[#cbd5e1] pb-4 text-[28px] leading-tight text-[#21243d] transition-colors group-hover:text-[#007f9b] md:text-[30px] dark:border-[#334155] dark:text-[#f8fafc] dark:group-hover:text-[#67e8f9]">
                    <Link
                      className="transition-colors hover:text-[#00a8cc]"
                      to={`/blog/${post.id}`}
                    >
                      {post.title}
                    </Link>
                  </h2>
                  <div className="font-heebo-regular mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[16px]">
                    <time
                      className="text-[#21243d] dark:text-[#cbd5e1]"
                      dateTime={post.dateTime}
                    >
                      {post.date}
                    </time>
                    <span className="border border-[#00a8cc]/40 bg-[#edf7fa] px-2 py-0.5 text-[13px] text-[#007f9b] dark:border-[#67e8f9]/30 dark:bg-[#263552] dark:text-[#67e8f9]">
                      {post.category}
                    </span>
                    <span className="font-heebo-medium text-[#00a8cc]">
                      {post.readTime}
                    </span>
                  </div>
                  <p className="font-heebo-regular mt-5 max-w-[690px] text-[16px] leading-[1.7] text-[#21243d] dark:text-[#cbd5e1]">
                    {post.summary}
                  </p>
                </div>
              </article>
            ))}
          </div>
          {totalPages > 1 && (
            <nav
              aria-label="Blog pagination"
              className="mt-10 flex flex-col items-center justify-between gap-6 md:flex-row"
            >
              <button
                className="font-heebo-medium rounded-[4px] border border-[#e5e5ea] px-4 py-2 text-[16px] text-[#21243d] transition-colors disabled:pointer-events-none disabled:opacity-50 hover:bg-[#ff6464] hover:text-white dark:border-[#334155] dark:text-[#f8fafc] dark:hover:bg-[#00a8cc] dark:hover:text-white"
                disabled={currentPage === 1}
                onClick={() => goToPage(currentPage - 1)}
                type="button"
              >
                Prev
              </button>
              <div className="flex gap-2">
                {Array.from(
                  { length: totalPages },
                  (_, index) => index + 1,
                ).map((page) => (
                  <button
                    aria-current={currentPage === page ? "page" : undefined}
                    className={`rounded-[4px] px-4 py-2 text-[16px] transition-colors ${
                      currentPage === page
                        ? "bg-[#ff6464] text-white"
                        : "border border-[#e5e5ea] text-[#21243d] hover:bg-[#ff6464] hover:text-white dark:border-[#334155] dark:text-[#f8fafc] dark:hover:bg-[#00a8cc] dark:hover:text-white"
                    }`}
                    key={page}
                    onClick={() => goToPage(page)}
                    type="button"
                  >
                    {page}
                  </button>
                ))}
              </div>
              <button
                className="font-heebo-medium rounded-[4px] border border-[#e5e5ea] px-4 py-2 text-[16px] text-[#21243d] transition-colors disabled:pointer-events-none disabled:opacity-50 hover:bg-[#ff6464] hover:text-white dark:border-[#334155] dark:text-[#f8fafc] dark:hover:bg-[#00a8cc] dark:hover:text-white"
                disabled={currentPage === totalPages}
                onClick={() => goToPage(currentPage + 1)}
                type="button"
              >
                Next
              </button>
            </nav>
          )}
        </section>
      </main>
    </SiteLayout>
  )
}
