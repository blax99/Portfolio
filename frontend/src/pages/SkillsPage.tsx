import SiteLayout from "../components/SiteLayout"
import SectionDivider from "../components/SectionDivider"
import { Link } from "react-router-dom"
import useApiResource from "../hooks/useApiResource"
import type { Skill } from "../types/content"

function SkillItem({
  name,
  logo,
  color,
  imageUrl,
}: {
  name: string
  logo?: string
  color?: string
  imageUrl?: string
}) {
  return (
    <div className="skill-item group flex min-w-0 flex-col items-center gap-2 border border-[#dbe7eb] bg-white/70 p-2 transition-colors hover:border-[#00a8cc] hover:bg-[#edf7fa] dark:border-[#334155] dark:bg-[#16213b] dark:hover:border-[#67e8f9] dark:hover:bg-[#164e63]">
      <span className="skill-item-icon flex h-12 w-12 items-center justify-center border-2 border-[#cbd5e1] bg-[#faf8f2] p-3 transition-transform group-hover:-translate-y-1 dark:border-[#b8a98f] dark:bg-[#eee3cf]">
        <img
          alt=""
          className="h-full w-full object-contain"
          height="24"
          loading="lazy"
          src={
            imageUrl ??
            `https://cdn.simpleicons.org/${encodeURIComponent(logo ?? "")}/${encodeURIComponent(color ?? "")}`
          }
          width="24"
        />
      </span>
      <span className="skill-item-name font-heebo-medium text-center text-[12px] leading-tight text-[#475569] dark:text-[#cbd5e1]">
        {name}
      </span>
    </div>
  )
}

export default function SkillsPage() {
  const { data: skills, error, loading } = useApiResource<Skill[]>("skills")
  const groupedSkills = Array.from(
    (skills ?? []).reduce((groups, skill) => {
      const group = groups.get(skill.group) ?? []
      group.push(skill)
      groups.set(skill.group, group)
      return groups
    }, new Map<string, Skill[]>()),
  )
  const totalTools = skills?.length ?? 0

  return (
    <SiteLayout active="skills">
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
              Skills & tools
            </p>
            <h1 className="font-heebo-bold mt-2 text-[44px] leading-tight text-[#21243d] md:text-[52px] dark:text-[#f8fafc]">
              Skills
            </h1>
            <p className="font-heebo-regular mt-5 max-w-[620px] text-[18px] leading-[1.65] text-[#21243d] dark:text-[#cbd5e1]">
              The tools and technologies I work with, grouped by category.
            </p>
          </div>
        </section>

        <SectionDivider />

        <section className="mx-auto w-full max-w-[858px] px-6 pt-8 pb-16 md:px-0 md:pt-12 md:pb-20">
          <div className="mb-7 flex flex-wrap items-end justify-between gap-3">
            <span className="font-heebo-bold border-2 border-[#21243d] bg-white/80 px-3 py-1.5 text-[13px] text-[#21243d] shadow-[3px_3px_0_#00a8cc] dark:border-[#94a3b8] dark:bg-[#1f2a44] dark:text-[#f8fafc] dark:shadow-[3px_3px_0_#0e7490]">
              {totalTools} technologies
            </span>
          </div>

          {loading && (
            <p className="font-heebo-regular py-8 text-[#8695a4] dark:text-[#94a3b8]">
              Loading skills…
            </p>
          )}
          {error && (
            <p className="font-heebo-regular py-8 text-[#c24141]" role="alert">
              Could not load skills: {error}
            </p>
          )}
          {!loading && !error && totalTools === 0 && (
            <p className="font-heebo-regular py-8 text-[#8695a4] dark:text-[#94a3b8]">
              No skills added yet.
            </p>
          )}
          <div className="skills-groups-grid grid gap-5 md:grid-cols-3">
            {groupedSkills.map(([groupTitle, tools], index) => (
              <article
                className="border-2 border-[#21243d] bg-white/80 p-4 shadow-[5px_5px_0_#00a8cc] transition-colors dark:border-[#94a3b8] dark:bg-[#1f2a44] dark:shadow-[5px_5px_0_#0e7490]"
                key={groupTitle}
              >
                <div className="mb-4 flex items-center justify-between border-b-2 border-dashed border-[#cbd5e1] pb-3 dark:border-[#334155]">
                  <h3 className="font-heebo-bold text-[16px] text-[#21243d] dark:text-[#f8fafc]">
                    {groupTitle}
                  </h3>
                  <span className="font-heebo-bold text-[10px] tracking-wide text-[#ff6464]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>
                <div className="skill-tools-grid grid grid-cols-4 gap-1">
                  {tools.map((tool) => (
                    <SkillItem
                      color={tool.color}
                      imageUrl={tool.imageUrl}
                      key={tool.id}
                      logo={tool.logo}
                      name={tool.name}
                    />
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </SiteLayout>
  )
}
