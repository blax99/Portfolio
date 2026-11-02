import { Link, useParams } from "react-router-dom"
import SiteLayout from "../components/SiteLayout"
import SectionDivider from "../components/SectionDivider"
import useApiResource from "../hooks/useApiResource"
import type { BlogPost } from "../types/content"

export default function BlogPostPage() {
  const { id } = useParams<{ id: string }>()
  const { data: post, error, loading } = useApiResource<BlogPost>(`blog/${id}`)

  if (loading) {
    return (
      <SiteLayout active="blog">
        <main className="mx-auto w-full max-w-[858px] px-6 py-16 md:px-0">
          <p className="font-heebo-regular text-[#8695a4] dark:text-[#94a3b8]">
            Loading post…
          </p>
        </main>
      </SiteLayout>
    )
  }

  if (error || !post) {
    return (
      <SiteLayout active="blog">
        <main className="mx-auto w-full max-w-[858px] px-6 py-16 md:px-0">
          <p className="font-heebo-regular text-[#c24141]" role="alert">
            {error ?? "Post not found."}
          </p>
        </main>
      </SiteLayout>
    )
  }

  return (
    <SiteLayout active="blog">
      <main>
        <section className="mx-auto w-full max-w-[858px] px-6 pb-12 pt-10 md:px-0 md:pb-[48px] md:pt-[46px]">
          <Link to="/blog" className="font-heebo-medium text-[16px] text-[#00a8cc] hover:underline">
            ← Back to blog
          </Link>
          <div className="mt-8">
            <p className="font-heebo-medium text-[16px] uppercase tracking-[0.18em] text-[#ff6464]">
              {post.category}
            </p>
            <h1 className="font-heebo-bold mt-2 text-[44px] leading-tight text-[#21243d] md:text-[52px] dark:text-[#f8fafc]">
              {post.title}
            </h1>
            <div className="mt-5 flex flex-wrap items-center gap-4 text-[16px]">
              <time dateTime={post.dateTime}>{post.date}</time>
              <span
                className="h-[18px] w-px bg-[#21243d] dark:bg-[#94a3b8]"
                aria-hidden="true"
              />
              <span className="text-[#8695a4] dark:text-[#94a3b8]">
                {post.readTime}
              </span>
            </div>
          </div>
        </section>

        <SectionDivider />

        <section className="mx-auto w-full max-w-[858px] px-6 pt-12 pb-28 md:px-0 md:pt-[48px] md:pb-[148px]">
          <div className="[&_p]:mb-6 [&_p]:last:mb-0 max-w-[690px] text-justify text-[16px] leading-[1.7] text-[#21243d] dark:text-[#cbd5e1]">
            {(post.content || "").split("\n\n").map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </section>
      </main>
    </SiteLayout>
  )
}
