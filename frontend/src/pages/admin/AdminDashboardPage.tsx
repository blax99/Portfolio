import { useCallback, useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import type {
  AboutProfile,
  BlogPost,
  DailyThought,
  Skill,
  WorkProject,
} from "../../types/content"
import {
  adminRequest,
  getErrorMessage,
  type AboutProfileInput,
  type AdminResource,
  type BlogInput,
  type DailyThoughtInput,
  type SkillInput,
  type WorkInput,
} from "./adminApi"
import {
  AboutProfileEntryForm,
  BlogEntryForm,
  DailyThoughtEntryForm,
  SkillEntryForm,
  WorkEntryForm,
} from "./AdminEntryForm"

interface WorkEditorState {
  kind: "works"
  item: WorkProject | null
}

interface BlogEditorState {
  kind: "blog"
  item: BlogPost | null
}

interface SkillEditorState {
  kind: "skills"
  item: Skill | null
}

interface ThoughtEditorState {
  kind: "thoughts"
  item: DailyThought | null
}

interface AboutEditorState {
  kind: "about"
  item: AboutProfile
}

interface DeleteConfirmation {
  resource: AdminResource
  id: string
  title: string
}

type EditorState = WorkEditorState | BlogEditorState | SkillEditorState | ThoughtEditorState | AboutEditorState | null

function formatNumber(number: number) {
  return String(number).padStart(2, "0")
}

function isSessionExpired(error: unknown) {
  return error instanceof Error && error.message === "Admin login required."
}

export default function AdminDashboardPage() {
  const navigate = useNavigate()
  const [authenticated, setAuthenticated] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)
  const [activeResource, setActiveResource] = useState<AdminResource>("works")
  const [works, setWorks] = useState<WorkProject[]>([])
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [skills, setSkills] = useState<Skill[]>([])
  const [thoughts, setThoughts] = useState<DailyThought[]>([])
  const [aboutProfiles, setAboutProfiles] = useState<AboutProfile[]>([])
  const [loadingContent, setLoadingContent] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [editor, setEditor] = useState<EditorState>(null)
  const [deleteConfirmation, setDeleteConfirmation] =
    useState<DeleteConfirmation | null>(null)
  const [deleteConfirmationText, setDeleteConfirmationText] = useState("")
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")

  useEffect(() => {
    let active = true
    adminRequest<{ authenticated: boolean }>("/api/auth/me")
      .then(() => {
        if (active) setAuthenticated(true)
      })
      .catch(() => {
        if (active) navigate("/admin/login", { replace: true })
      })
      .finally(() => {
        if (active) setCheckingSession(false)
      })

    return () => {
      active = false
    }
  }, [navigate])

  const loadContent = useCallback(async () => {
    setError("")
    setLoadingContent(true)
    try {
      const [
        nextWorks,
        nextPosts,
        nextSkills,
        nextThoughts,
        nextAboutProfiles,
      ] = await Promise.all([
        adminRequest<WorkProject[]>("/api/works"),
        adminRequest<BlogPost[]>("/api/blog"),
        adminRequest<Skill[]>("/api/skills"),
        adminRequest<DailyThought[]>("/api/thoughts"),
        adminRequest<AboutProfile[]>("/api/about"),
      ])
      setWorks(nextWorks)
      setPosts(nextPosts)
      setSkills(nextSkills)
      setThoughts(nextThoughts)
      setAboutProfiles(nextAboutProfiles)
    } catch (loadError) {
      setError(getErrorMessage(loadError))
      if (isSessionExpired(loadError)) {
        navigate("/admin/login", { replace: true })
      }
    } finally {
      setLoadingContent(false)
    }
  }, [navigate])

  useEffect(() => {
    if (authenticated) void loadContent()
  }, [authenticated, loadContent])

  async function saveWork(input: WorkInput) {
    setSaving(true)
    setError("")
    setNotice("")
    try {
      const item = editor?.kind === "works" ? editor.item : null
      const saved = await adminRequest<WorkProject>(
        item ? `/api/works/${item.id}` : "/api/works",
        {
          method: item ? "PUT" : "POST",
          body: JSON.stringify(input),
        },
      )
      setWorks((current) =>
        item
          ? current.map((work) => (work.id === item.id ? saved : work))
          : [...current, saved],
      )
      setNotice(item ? "Project updated." : "Project created.")
      setEditor(null)
    } catch (saveError) {
      setError(getErrorMessage(saveError))
      if (isSessionExpired(saveError)) {
        navigate("/admin/login", { replace: true })
      }
    } finally {
      setSaving(false)
    }
  }

  async function savePost(input: BlogInput) {
    setSaving(true)
    setError("")
    setNotice("")
    try {
      const item = editor?.kind === "blog" ? editor.item : null
      const saved = await adminRequest<BlogPost>(
        item ? `/api/blog/${item.id}` : "/api/blog",
        {
          method: item ? "PUT" : "POST",
          body: JSON.stringify(input),
        },
      )
      setPosts((current) =>
        item
          ? current.map((post) => (post.id === item.id ? saved : post))
          : [saved, ...current],
      )
      setNotice(item ? "Post updated." : "Post created.")
      setEditor(null)
    } catch (saveError) {
      setError(getErrorMessage(saveError))
      if (isSessionExpired(saveError)) {
        navigate("/admin/login", { replace: true })
      }
    } finally {
      setSaving(false)
    }
  }

  async function saveSkill(input: SkillInput) {
    setSaving(true)
    setError("")
    setNotice("")
    try {
      const item = editor?.kind === "skills" ? editor.item : null
      const saved = await adminRequest<Skill>(
        item ? `/api/skills/${item.id}` : "/api/skills",
        {
          method: item ? "PUT" : "POST",
          body: JSON.stringify(input),
        },
      )
      setSkills((current) =>
        item
          ? current.map((skill) => (skill.id === item.id ? saved : skill))
          : [...current, saved],
      )
      setNotice(item ? "Skill updated." : "Skill created.")
      setEditor(null)
    } catch (saveError) {
      setError(getErrorMessage(saveError))
      if (isSessionExpired(saveError)) {
        navigate("/admin/login", { replace: true })
      }
    } finally {
      setSaving(false)
    }
  }

  async function saveThought(input: DailyThoughtInput) {
    setSaving(true)
    setError("")
    setNotice("")
    try {
      const item = editor?.kind === "thoughts" ? editor.item : null
      const saved = await adminRequest<DailyThought>(
        item ? `/api/thoughts/${item.id}` : "/api/thoughts",
        {
          method: item ? "PUT" : "POST",
          body: JSON.stringify(input),
        },
      )
      setThoughts((current) =>
        item
          ? current.map((thought) => (thought.id === item.id ? saved : thought))
          : [...current, saved],
      )
      setNotice(item ? "Thought updated." : "Thought created.")
      setEditor(null)
    } catch (saveError) {
      setError(getErrorMessage(saveError))
      if (isSessionExpired(saveError)) {
        navigate("/admin/login", { replace: true })
      }
    } finally {
      setSaving(false)
    }
  }

  async function saveAboutProfile(input: AboutProfileInput) {
    setSaving(true)
    setError("")
    setNotice("")
    try {
      const item = editor?.kind === "about" ? editor.item : null
      if (!item) throw new Error("The About Me profile could not be loaded.")
      const saved = await adminRequest<AboutProfile>(`/api/about/${item.id}`, {
        method: "PUT",
        body: JSON.stringify(input),
      })
      setAboutProfiles((current) =>
        current.map((profile) => (profile.id === item.id ? saved : profile)),
      )
      setNotice("About Me profile updated.")
      setEditor(null)
    } catch (saveError) {
      setError(getErrorMessage(saveError))
      if (isSessionExpired(saveError)) {
        navigate("/admin/login", { replace: true })
      }
    } finally {
      setSaving(false)
    }
  }

  function requestDelete(resource: AdminResource, id: string, title: string) {
    setError("")
    setDeleteConfirmationText("")
    setDeleteConfirmation({ resource, id, title })
  }

  async function confirmDeleteItem() {
    if (!deleteConfirmation || deleteConfirmationText !== "DELETE") return
    setError("")
    setNotice("")
    setDeleting(true)
    try {
      const { resource, id } = deleteConfirmation
      await adminRequest<void>(`/api/${resource}/${id}`, { method: "DELETE" })
      if (resource === "works") {
        setWorks((current) => current.filter((work) => work.id !== id))
      } else if (resource === "blog") {
        setPosts((current) => current.filter((post) => post.id !== id))
      } else if (resource === "skills") {
        setSkills((current) => current.filter((skill) => skill.id !== id))
      } else if (resource === "thoughts") {
        setThoughts((current) => current.filter((thought) => thought.id !== id))
      } else {
        setAboutProfiles((current) =>
          current.filter((profile) => profile.id !== id),
        )
      }
      setNotice(
        resource === "works"
          ? "Project deleted."
          : resource === "blog"
            ? "Post deleted."
            : resource === "skills"
              ? "Skill deleted."
              : resource === "thoughts"
                ? "Thought deleted."
                : "About profile deleted.",
      )
      setDeleteConfirmation(null)
      setDeleteConfirmationText("")
    } catch (deleteError) {
      setError(getErrorMessage(deleteError))
      if (isSessionExpired(deleteError)) {
        navigate("/admin/login", { replace: true })
      }
    } finally {
      setDeleting(false)
    }
  }

  async function logout() {
    try {
      await adminRequest("/api/auth/logout", { method: "POST" })
    } catch (logoutError) {
      setError(getErrorMessage(logoutError))
    } finally {
      navigate("/admin/login", { replace: true })
    }
  }

  if (checkingSession || !authenticated) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6">
        <p className="font-heebo-medium text-[#64748b] dark:text-[#cbd5e1]">
          Checking admin session…
        </p>
      </main>
    )
  }

  const activeItems =
    activeResource === "works"
      ? works
      : activeResource === "blog"
        ? posts
        : activeResource === "skills"
          ? skills
          : activeResource === "thoughts"
            ? thoughts
            : aboutProfiles

  return (
    <main className="admin-page min-h-screen bg-[#f5f8fc] dark:bg-[#0f172a]">
      <header className="border-b border-[#e5e5ea] bg-white dark:border-[#334155] dark:bg-[#1f2a44]">
        <div className="mx-auto flex max-w-[1240px] items-center justify-between gap-3 px-4 py-4 sm:gap-4 sm:px-8">
          <div>
            <p className="font-heebo-medium text-[11px] uppercase tracking-[0.18em] text-[#ff6464]">
              Portfolio admin
            </p>
            <h1 className="font-heebo-bold mt-0.5 text-[22px] text-[#21243d] dark:text-[#f8fafc]">
              Content dashboard
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <Link
              className="font-heebo-medium hidden text-[14px] text-[#00a8cc] hover:underline sm:inline"
              to="/"
            >
              View portfolio
            </Link>
            <button
              className="font-heebo-medium rounded-lg border border-[#d8dee8] px-3 py-2 text-[13px] text-[#475569] transition hover:border-[#ff6464] hover:text-[#ff6464] dark:border-[#475569] dark:text-[#e2e8f0]"
              onClick={() => void logout()}
              type="button"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1240px] gap-6 px-4 py-6 sm:gap-8 sm:px-8 lg:grid-cols-[230px_1fr] lg:py-12">
        <aside>
          <p className="font-heebo-medium mb-3 px-3 text-[11px] uppercase tracking-[0.14em] text-[#8695a4]">
            Manage content
          </p>
          <nav
            aria-label="Admin content"
            className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:flex lg:flex-col"
          >
            <button
              aria-current={activeResource === "works" ? "page" : undefined}
              className={`font-heebo-medium flex min-w-0 items-center justify-between rounded-xl px-3 py-3 text-left text-[14px] transition sm:px-4 lg:flex-none ${
                activeResource === "works"
                  ? "bg-[#142850] text-white"
                  : "bg-white text-[#475569] hover:bg-[#edf7fa] dark:bg-[#1f2a44] dark:text-[#cbd5e1] dark:hover:bg-[#263552]"
              }`}
              onClick={() => {
                setEditor(null)
                setActiveResource("works")
                setError("")
              }}
              type="button"
            >
              <span className="min-w-0">Work projects</span>
              <span className="text-[12px] opacity-75">
                {formatNumber(works.length)}
              </span>
            </button>
            <button
              aria-current={activeResource === "blog" ? "page" : undefined}
              className={`font-heebo-medium flex min-w-0 items-center justify-between rounded-xl px-3 py-3 text-left text-[14px] transition sm:px-4 lg:flex-none ${
                activeResource === "blog"
                  ? "bg-[#142850] text-white"
                  : "bg-white text-[#475569] hover:bg-[#edf7fa] dark:bg-[#1f2a44] dark:text-[#cbd5e1] dark:hover:bg-[#263552]"
              }`}
              onClick={() => {
                setEditor(null)
                setActiveResource("blog")
                setError("")
              }}
              type="button"
            >
              <span className="min-w-0">Blog posts</span>
              <span className="text-[12px] opacity-75">
                {formatNumber(posts.length)}
              </span>
            </button>
            <button
              aria-current={activeResource === "skills" ? "page" : undefined}
              className={`font-heebo-medium flex min-w-0 items-center justify-between rounded-xl px-3 py-3 text-left text-[14px] transition sm:px-4 lg:flex-none ${
                activeResource === "skills"
                  ? "bg-[#142850] text-white"
                  : "bg-white text-[#475569] hover:bg-[#edf7fa] dark:bg-[#1f2a44] dark:text-[#cbd5e1] dark:hover:bg-[#263552]"
              }`}
              onClick={() => {
                setEditor(null)
                setActiveResource("skills")
                setError("")
              }}
              type="button"
            >
              <span className="min-w-0">Skills</span>
              <span className="text-[12px] opacity-75">
                {formatNumber(skills.length)}
              </span>
            </button>
            <button
              aria-current={activeResource === "thoughts" ? "page" : undefined}
              className={`font-heebo-medium flex min-w-0 items-center justify-between rounded-xl px-3 py-3 text-left text-[14px] transition sm:px-4 lg:flex-none ${
                activeResource === "thoughts"
                  ? "bg-[#142850] text-white"
                  : "bg-white text-[#475569] hover:bg-[#edf7fa] dark:bg-[#1f2a44] dark:text-[#cbd5e1] dark:hover:bg-[#263552]"
              }`}
              onClick={() => {
                setEditor(null)
                setActiveResource("thoughts")
                setError("")
              }}
              type="button"
            >
              <span className="min-w-0">Thought of the day</span>
              <span className="text-[12px] opacity-75">
                {formatNumber(thoughts.length)}
              </span>
            </button>
            <button
              aria-current={activeResource === "about" ? "page" : undefined}
              className={`font-heebo-medium flex min-w-0 items-center justify-between rounded-xl px-3 py-3 text-left text-[14px] transition sm:px-4 lg:flex-none ${
                activeResource === "about"
                  ? "bg-[#142850] text-white"
                  : "bg-white text-[#475569] hover:bg-[#edf7fa] dark:bg-[#1f2a44] dark:text-[#cbd5e1] dark:hover:bg-[#263552]"
              }`}
              onClick={() => {
                setEditor(null)
                setActiveResource("about")
                setError("")
              }}
              type="button"
            >
              <span className="min-w-0">About Me</span>
              <span className="text-[12px] opacity-75">
                {formatNumber(aboutProfiles.length)}
              </span>
            </button>
          </nav>
          <p className="font-heebo-regular mt-6 hidden px-3 text-[13px] leading-relaxed text-[#8695a4] lg:block dark:text-[#94a3b8]">
            Updates are saved immediately and appear on the public portfolio.
          </p>
        </aside>

        <section className="min-w-0">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-heebo-medium text-[11px] uppercase tracking-[0.16em] text-[#ff6464]">
                {activeResource === "works"
                  ? "Portfolio"
                  : activeResource === "blog"
                    ? "Writing"
                    : activeResource === "skills"
                      ? "Expertise"
                      : activeResource === "thoughts"
                        ? "Daily inspiration"
                        : "Profile"}
              </p>
              <h2 className="font-heebo-bold mt-1 text-2xl text-[#21243d] sm:text-[30px] dark:text-[#f8fafc]">
                {activeResource === "works"
                  ? "Work projects"
                  : activeResource === "blog"
                    ? "Blog posts"
                    : activeResource === "skills"
                      ? "Skills"
                      : activeResource === "thoughts"
                        ? "Thought of the day"
                        : "About Me"}
              </h2>
            </div>
            {activeResource !== "about" && (
              <button
                className="font-heebo-bold rounded-lg bg-[#ff6464] px-4 py-2.5 text-[14px] text-white transition hover:bg-[#e95454]"
                onClick={() => {
                  setError("")
                  setNotice("")
                  setEditor(
                    activeResource === "works"
                      ? { kind: "works", item: null }
                      : activeResource === "blog"
                        ? { kind: "blog", item: null }
                        : activeResource === "skills"
                          ? { kind: "skills", item: null }
                          : { kind: "thoughts", item: null },
                  )
                }}
                type="button"
              >
                + Add{" "}
                {activeResource === "works"
                  ? "project"
                  : activeResource === "blog"
                    ? "post"
                    : activeResource === "skills"
                      ? "skill"
                      : "thought"}
              </button>
            )}
          </div>

          {error && (
            <p
              className="font-heebo-medium mb-4 rounded-lg bg-[#fff1f0] px-4 py-3 text-[14px] text-[#bd3d3d] dark:bg-[#482d39] dark:text-[#ffaaaa]"
              role="alert"
            >
              {error}
            </p>
          )}
          {notice && (
            <p
              className="font-heebo-medium mb-4 rounded-lg bg-[#e7f8f2] px-4 py-3 text-[14px] text-[#16775e] dark:bg-[#163e3a] dark:text-[#8de3c5]"
              role="status"
            >
              {notice}
            </p>
          )}

          {editor && (
            <section className="mb-6 rounded-2xl border border-[#e5e5ea] bg-white p-4 shadow-sm sm:p-7 dark:border-[#334155] dark:bg-[#1f2a44]">
              <div className="mb-5">
                <h3 className="font-heebo-bold text-[21px] text-[#21243d] dark:text-[#f8fafc]">
                  {editor.item
                    ? `Edit ${
                        editor.kind === "works"
                          ? "project"
                          : editor.kind === "blog"
                            ? "post"
                            : editor.kind === "skills"
                              ? "skill"
                              : editor.kind === "thoughts"
                                ? "thought"
                                : "About Me profile"
                      }`
                    : `New ${
                        editor.kind === "works"
                          ? "project"
                          : editor.kind === "blog"
                            ? "post"
                            : editor.kind === "skills"
                              ? "skill"
                              : editor.kind === "thoughts"
                                ? "thought"
                                : "About Me profile"
                      }`}
                </h3>
                <p className="font-heebo-regular mt-1 text-[13px] text-[#8695a4] dark:text-[#94a3b8]">
                  Fill in the content fields and save your changes.
                </p>
              </div>
              {editor.kind === "works" ? (
                <WorkEntryForm
                  item={editor.item}
                  key={`work-${editor.item?.id ?? "new"}`}
                  onCancel={() => setEditor(null)}
                  onSave={(input) => void saveWork(input)}
                  saving={saving}
                />
              ) : editor.kind === "blog" ? (
                <BlogEntryForm
                  item={editor.item}
                  key={`blog-${editor.item?.id ?? "new"}`}
                  onCancel={() => setEditor(null)}
                  onSave={(input) => void savePost(input)}
                  saving={saving}
                />
              ) : editor.kind === "skills" ? (
                <SkillEntryForm
                  item={editor.item}
                  key={`skill-${editor.item?.id ?? "new"}`}
                  onCancel={() => setEditor(null)}
                  onSave={(input) => void saveSkill(input)}
                  saving={saving}
                />
              ) : editor.kind === "thoughts" ? (
                <DailyThoughtEntryForm
                  item={editor.item}
                  key={`thought-${editor.item?.id ?? "new"}`}
                  onCancel={() => setEditor(null)}
                  onSave={(input) => void saveThought(input)}
                  saving={saving}
                />
              ) : (
                <AboutProfileEntryForm
                  item={editor.item}
                  key={`about-${editor.item.id}`}
                  onCancel={() => setEditor(null)}
                  onSave={(input) => void saveAboutProfile(input)}
                  saving={saving}
                />
              )}
            </section>
          )}

          <div className="overflow-hidden rounded-2xl border border-[#e5e5ea] bg-white shadow-sm dark:border-[#334155] dark:bg-[#1f2a44]">
            <div className="flex items-center justify-between border-b border-[#e5e5ea] px-4 py-4 sm:px-5 dark:border-[#334155]">
              <p className="font-heebo-medium text-[14px] text-[#475569] dark:text-[#cbd5e1]">
                {activeItems.length}{" "}
                {activeResource === "works"
                  ? "projects"
                  : activeResource === "blog"
                    ? "posts"
                    : activeResource === "skills"
                      ? "skills"
                      : activeResource === "thoughts"
                        ? "thoughts"
                        : "profile"}
              </p>
              <button
                className="font-heebo-medium text-[13px] text-[#00a8cc] hover:underline disabled:opacity-50"
                disabled={loadingContent}
                onClick={() => void loadContent()}
                type="button"
              >
                {loadingContent ? "Refreshing…" : "Refresh"}
              </button>
            </div>

            {loadingContent && activeItems.length === 0 ? (
              <p className="font-heebo-regular px-5 py-12 text-center text-[14px] text-[#8695a4] dark:text-[#94a3b8]">
                Loading content…
              </p>
            ) : activeItems.length === 0 ? (
              <p className="font-heebo-regular px-5 py-12 text-center text-[14px] text-[#8695a4] dark:text-[#94a3b8]">
                Nothing here yet. Use the add button to create your first entry.
              </p>
            ) : (
              <ul className="divide-y divide-[#e5e5ea] dark:divide-[#334155]">
                {activeResource === "works"
                  ? works.map((work) => (
                      <li
                        className="flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:px-5"
                        key={work.id}
                      >
                        <img
                          alt=""
                          className="h-16 w-24 shrink-0 rounded-lg bg-[#edf7fa] object-cover dark:bg-[#263552]"
                          src={work.image}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="font-heebo-bold truncate text-[15px] text-[#21243d] dark:text-[#f8fafc]">
                            {work.number}. {work.title}
                          </p>
                          <p className="font-heebo-regular mt-1 truncate text-[13px] text-[#8695a4] dark:text-[#94a3b8]">
                            {work.category} · {work.year}
                          </p>
                          {work.featured && (
                            <span className="font-heebo-medium mt-2 inline-flex border border-[#00a8cc]/40 bg-[#edf7fa] px-2 py-0.5 text-[11px] text-[#007f9b] dark:border-[#67e8f9]/30 dark:bg-[#263552] dark:text-[#67e8f9]">
                              Featured on home
                            </span>
                          )}
                        </div>
                        <div className="flex shrink-0 gap-2">
                          <button
                            className="font-heebo-medium rounded-lg border border-[#d8dee8] px-3 py-2 text-[13px] text-[#475569] hover:border-[#00a8cc] hover:text-[#0087a4] dark:border-[#475569] dark:text-[#e2e8f0]"
                            onClick={() =>
                              setEditor({ kind: "works", item: work })
                            }
                            type="button"
                          >
                            Edit
                          </button>
                          <button
                            className="font-heebo-medium rounded-lg border border-[#f1c7c7] px-3 py-2 text-[13px] text-[#bd3d3d] hover:bg-[#fff1f0] dark:border-[#71434b] dark:text-[#ffaaaa]"
                            onClick={() =>
                              requestDelete("works", work.id, work.title)
                            }
                            type="button"
                          >
                            Delete
                          </button>
                        </div>
                      </li>
                    ))
                  : activeResource === "blog"
                    ? posts.map((post) => (
                        <li
                          className="flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:px-5"
                          key={post.id}
                        >
                          <div className="flex h-16 w-24 shrink-0 items-center justify-center rounded-lg bg-[#f0edff] text-[24px] text-[#7563df] dark:bg-[#302b50]">
                            Aa
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-heebo-bold truncate text-[15px] text-[#21243d] dark:text-[#f8fafc]">
                              {post.title}
                            </p>
                            <p className="font-heebo-regular mt-1 truncate text-[13px] text-[#8695a4] dark:text-[#94a3b8]">
                              {post.date} · {post.category}
                            </p>
                          </div>
                          <div className="flex shrink-0 gap-2">
                            <button
                              className="font-heebo-medium rounded-lg border border-[#d8dee8] px-3 py-2 text-[13px] text-[#475569] hover:border-[#00a8cc] hover:text-[#0087a4] dark:border-[#475569] dark:text-[#e2e8f0]"
                              onClick={() =>
                                setEditor({ kind: "blog", item: post })
                              }
                              type="button"
                            >
                              Edit
                            </button>
                            <button
                              className="font-heebo-medium rounded-lg border border-[#f1c7c7] px-3 py-2 text-[13px] text-[#bd3d3d] hover:bg-[#fff1f0] dark:border-[#71434b] dark:text-[#ffaaaa]"
                              onClick={() =>
                                requestDelete("blog", post.id, post.title)
                              }
                              type="button"
                            >
                              Delete
                            </button>
                          </div>
                        </li>
                      ))
                    : activeResource === "skills"
                      ? skills.map((skill) => (
                          <li
                            className="flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:px-5"
                            key={skill.id}
                          >
                            <div className="flex h-16 w-16 shrink-0 items-center justify-center border border-[#dbe7eb] bg-[#faf8f2] p-3 dark:border-[#b8a98f] dark:bg-[#eee3cf]">
                              {skill.imageUrl ? (
                                <img
                                  alt=""
                                  className="h-full w-full object-contain"
                                  src={skill.imageUrl}
                                />
                              ) : (
                                <img
                                  alt=""
                                  className="h-full w-full object-contain"
                                  src={`https://cdn.simpleicons.org/${encodeURIComponent(skill.logo ?? "")}/${encodeURIComponent(skill.color ?? "")}`}
                                />
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-heebo-bold truncate text-[15px] text-[#21243d] dark:text-[#f8fafc]">
                                {skill.name}
                              </p>
                              <p className="font-heebo-regular mt-1 truncate text-[13px] text-[#8695a4] dark:text-[#94a3b8]">
                                {skill.group}
                              </p>
                            </div>
                            <div className="flex shrink-0 gap-2">
                              <button
                                className="font-heebo-medium rounded-lg border border-[#d8dee8] px-3 py-2 text-[13px] text-[#475569] hover:border-[#00a8cc] hover:text-[#0087a4] dark:border-[#475569] dark:text-[#e2e8f0]"
                                onClick={() =>
                                  setEditor({ kind: "skills", item: skill })
                                }
                                type="button"
                              >
                                Edit
                              </button>
                              <button
                                className="font-heebo-medium rounded-lg border border-[#f1c7c7] px-3 py-2 text-[13px] text-[#bd3d3d] hover:bg-[#fff1f0] dark:border-[#71434b] dark:text-[#ffaaaa]"
                                onClick={() =>
                                  requestDelete("skills", skill.id, skill.name)
                                }
                                type="button"
                              >
                                Delete
                              </button>
                            </div>
                          </li>
                        ))
                      : activeResource === "thoughts"
                        ? thoughts.map((thought) => (
                            <li
                              className="flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:px-5"
                              key={thought.id}
                            >
                              {thought.image ? (
                                <img
                                  alt={thought.imageAlt ?? ""}
                                  className="h-16 w-16 shrink-0 border border-[#dbe7eb] bg-[#faf8f2] object-cover dark:border-[#b8a98f] dark:bg-[#eee3cf]"
                                  src={thought.image}
                                />
                              ) : (
                                <div className="flex h-16 w-16 shrink-0 items-center justify-center bg-[#edf7fa] text-[24px] text-[#00a8cc] dark:bg-[#263552] dark:text-[#67e8f9]">
                                  “
                                </div>
                              )}
                              <div className="min-w-0 flex-1">
                                <p className="font-heebo-medium line-clamp-2 text-[15px] text-[#21243d] dark:text-[#f8fafc]">
                                  {thought.text}
                                </p>
                                <p className="font-heebo-regular mt-1 truncate text-[13px] text-[#8695a4] dark:text-[#94a3b8]">
                                  {thought.author}
                                </p>
                              </div>
                              <div className="flex shrink-0 gap-2">
                                <button
                                  className="font-heebo-medium rounded-lg border border-[#d8dee8] px-3 py-2 text-[13px] text-[#475569] hover:border-[#00a8cc] hover:text-[#0087a4] dark:border-[#475569] dark:text-[#e2e8f0]"
                                  onClick={() =>
                                    setEditor({
                                      kind: "thoughts",
                                      item: thought,
                                    })
                                  }
                                  type="button"
                                >
                                  Edit
                                </button>
                                <button
                                  className="font-heebo-medium rounded-lg border border-[#f1c7c7] px-3 py-2 text-[13px] text-[#bd3d3d] hover:bg-[#fff1f0] dark:border-[#71434b] dark:text-[#ffaaaa]"
                                  onClick={() =>
                                    requestDelete(
                                      "thoughts",
                                      thought.id,
                                      thought.author,
                                    )
                                  }
                                  type="button"
                                >
                                  Delete
                                </button>
                              </div>
                            </li>
                          ))
                        : aboutProfiles.map((profile) => (
                            <li
                              className="flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:px-5"
                              key={profile.id}
                            >
                              <img
                                alt={profile.imageAlt}
                                className="h-16 w-16 shrink-0 border border-[#dbe7eb] bg-[#faf8f2] object-cover dark:border-[#b8a98f] dark:bg-[#eee3cf]"
                                src={profile.image}
                              />
                              <div className="min-w-0 flex-1">
                                <p className="font-heebo-bold truncate text-[15px] text-[#21243d] dark:text-[#f8fafc]">
                                  {profile.name}
                                </p>
                                <p className="font-heebo-regular mt-1 truncate text-[13px] text-[#8695a4] dark:text-[#94a3b8]">
                                  {profile.location}
                                </p>
                              </div>
                              <button
                                className="font-heebo-medium w-fit shrink-0 rounded-lg border border-[#d8dee8] px-3 py-2 text-[13px] text-[#475569] hover:border-[#00a8cc] hover:text-[#0087a4] dark:border-[#475569] dark:text-[#e2e8f0]"
                                onClick={() =>
                                  setEditor({ kind: "about", item: profile })
                                }
                                type="button"
                              >
                                Edit
                              </button>
                            </li>
                          ))}
              </ul>
            )}
          </div>
        </section>
      </div>
      {deleteConfirmation && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[#0f172a]/60 px-4 py-4 sm:items-center sm:px-5 sm:py-8">
          <section
            aria-describedby="delete-confirmation-description"
            aria-labelledby="delete-confirmation-title"
            aria-modal="true"
            className="my-auto max-h-[calc(100dvh-2rem)] w-full max-w-[440px] overflow-y-auto rounded-2xl border border-[#e5e5ea] bg-white p-5 shadow-xl sm:p-6 dark:border-[#334155] dark:bg-[#1f2a44]"
            role="alertdialog"
          >
            <h2
              className="font-heebo-bold text-[21px] text-[#21243d] dark:text-[#f8fafc]"
              id="delete-confirmation-title"
            >
              Confirm deletion
            </h2>
            <p
              className="font-heebo-regular mt-2 text-[14px] leading-relaxed text-[#64748b] dark:text-[#cbd5e1]"
              id="delete-confirmation-description"
            >
              Delete{" "}
              <span className="font-heebo-bold break-words">
                {deleteConfirmation.title}
              </span>
              ? This action cannot be undone. Type <strong>DELETE</strong> to
              continue.
            </p>
            <form
              className="mt-5 grid gap-4"
              onSubmit={(event) => {
                event.preventDefault()
                void confirmDeleteItem()
              }}
            >
              <label className="grid gap-2">
                <span className="font-heebo-medium text-[13px] text-[#475569] dark:text-[#cbd5e1]">
                  Confirmation
                </span>
                <input
                  autoComplete="off"
                  autoFocus
                  className="font-heebo-regular min-h-11 w-full rounded-lg border border-[#d8dee8] bg-white px-3 py-2 text-[14px] text-[#21243d] outline-none transition focus:border-[#ff6464] focus:ring-2 focus:ring-[#ff6464]/20 dark:border-[#475569] dark:bg-[#16213b] dark:text-[#f8fafc]"
                  onChange={(event) =>
                    setDeleteConfirmationText(event.target.value)
                  }
                  placeholder="Type DELETE"
                  value={deleteConfirmationText}
                />
              </label>
              {error && (
                <p
                  className="font-heebo-medium rounded-lg bg-[#fff1f0] px-4 py-3 text-[14px] text-[#bd3d3d] dark:bg-[#482d39] dark:text-[#ffaaaa]"
                  role="alert"
                >
                  {error}
                </p>
              )}
              <div className="flex flex-col-reverse gap-3 border-t border-[#e5e5ea] pt-4 sm:flex-row sm:justify-end dark:border-[#334155]">
                <button
                  className="font-heebo-medium rounded-lg border border-[#d8dee8] px-5 py-2.5 text-[14px] text-[#475569] transition hover:bg-[#f8fafc] dark:border-[#475569] dark:text-[#e2e8f0] dark:hover:bg-[#263552]"
                  disabled={deleting}
                  onClick={() => {
                    setDeleteConfirmation(null)
                    setDeleteConfirmationText("")
                    setError("")
                  }}
                  type="button"
                >
                  Cancel
                </button>
                <button
                  className="font-heebo-bold rounded-lg bg-[#bd3d3d] px-5 py-2.5 text-[14px] text-white transition hover:bg-[#a83232] disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={deleting || deleteConfirmationText !== "DELETE"}
                  type="submit"
                >
                  {deleting ? "Deleting…" : "Delete"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  )
}
