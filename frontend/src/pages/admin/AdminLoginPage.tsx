import { useEffect, useState, type FormEvent } from "react"
import { Link, useNavigate } from "react-router-dom"
import { adminRequest, getErrorMessage } from "./adminApi"

export default function AdminLoginPage() {
  const navigate = useNavigate()
  const [checkingSession, setCheckingSession] = useState(true)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let active = true
    adminRequest<{ authenticated: boolean }>("/api/auth/me")
      .then(() => {
        if (active) navigate("/admin/dashboard", { replace: true })
      })
      .catch(() => {
        if (active) setCheckingSession(false)
      })
    return () => {
      active = false
    }
  }, [navigate])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")
    setSubmitting(true)

    try {
      await adminRequest<{ authenticated: boolean }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      })
      navigate("/admin/dashboard", { replace: true })
    } catch (loginError) {
      setError(getErrorMessage(loginError))
    } finally {
      setSubmitting(false)
    }
  }

  if (checkingSession) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6">
        <p className="font-heebo-medium text-[#64748b] dark:text-[#cbd5e1]">
          Checking admin session…
        </p>
      </main>
    )
  }

  return (
    <main className="admin-page flex min-h-screen items-center justify-center bg-[#edf7fa] px-5 py-12 dark:bg-[#0f172a]">
      <section className="w-full max-w-[440px] rounded-2xl border border-[#e5e5ea] bg-white p-7 shadow-[0_24px_70px_rgba(33,36,61,0.10)] sm:p-10 dark:border-[#334155] dark:bg-[#1f2a44]">
        <Link
          className="font-heebo-medium text-[14px] text-[#00a8cc] hover:underline"
          to="/"
        >
          ← Back to portfolio
        </Link>
        <div className="mt-9">
          <p className="font-heebo-medium text-[12px] uppercase tracking-[0.18em] text-[#ff6464]">
            Portfolio admin
          </p>
          <h1 className="font-heebo-bold mt-2 text-[34px] leading-tight text-[#21243d] dark:text-[#f8fafc]">
            Welcome back
          </h1>
          <p className="font-heebo-regular mt-3 text-[15px] leading-relaxed text-[#64748b] dark:text-[#cbd5e1]">
            Sign in to manage your work and blog content.
          </p>
        </div>

        <form className="mt-8 grid gap-5" onSubmit={handleSubmit}>
          <label className="grid gap-2">
            <span className="font-heebo-medium text-[14px] text-[#21243d] dark:text-[#e2e8f0]">
              Username
            </span>
            <input
              autoComplete="username"
              autoFocus
              className="font-heebo-regular h-12 rounded-lg border border-[#d8dee8] bg-white px-4 text-[15px] text-[#21243d] outline-none transition focus:border-[#00a8cc] focus:ring-2 focus:ring-[#00a8cc]/20 dark:border-[#475569] dark:bg-[#16213b] dark:text-[#f8fafc]"
              onChange={(event) => setUsername(event.target.value)}
              required
              value={username}
            />
          </label>
          <label className="grid gap-2">
            <span className="font-heebo-medium text-[14px] text-[#21243d] dark:text-[#e2e8f0]">
              Password
            </span>
            <input
              autoComplete="current-password"
              className="font-heebo-regular h-12 rounded-lg border border-[#d8dee8] bg-white px-4 text-[15px] text-[#21243d] outline-none transition focus:border-[#00a8cc] focus:ring-2 focus:ring-[#00a8cc]/20 dark:border-[#475569] dark:bg-[#16213b] dark:text-[#f8fafc]"
              onChange={(event) => setPassword(event.target.value)}
              required
              type="password"
              value={password}
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

          <button
            className="font-heebo-bold mt-1 flex h-12 items-center justify-center rounded-lg bg-[#ff6464] px-5 text-[15px] text-white transition hover:bg-[#e95454] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={submitting}
            type="submit"
          >
            {submitting ? "Signing in…" : "Sign in to dashboard"}
          </button>
        </form>

        <p className="font-heebo-regular mt-6 text-[12px] leading-relaxed text-[#8695a4] dark:text-[#94a3b8]">
          Admin access only. Your session is protected by a secure, HTTP-only
          cookie.
        </p>
      </section>
    </main>
  )
}
