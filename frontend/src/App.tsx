import { useEffect, useRef, useState } from "react"
import { Navigate, Route, Routes, useLocation } from "react-router-dom"
import OfflinePage from "./components/OfflinePage"
import BlogPage from "./pages/BlogPage"
import BlogPostPage from "./pages/BlogPostPage"
import ContactPage from "./pages/ContactPage"
import HomePage from "./pages/HomePage"
import SkillsPage from "./pages/SkillsPage"
import WorkPage from "./pages/WorkPage"
import AdminDashboardPage from "./pages/admin/AdminDashboardPage"
import AdminLoginPage from "./pages/admin/AdminLoginPage"
import { apiUrl } from "./utils/apiUrl"

function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [pathname])

  return null
}

function PortfolioVisitTracker() {
  const { pathname } = useLocation()
  const fallbackSessionId = useRef<string>(window.crypto.randomUUID())
  const fallbackTracked = useRef(false)

  useEffect(() => {
    if (pathname.startsWith("/admin")) return

    let sessionId = fallbackSessionId.current
    let shouldTrack = false
    try {
      const savedSessionId = window.sessionStorage.getItem(
        "portfolio-visitor-session",
      )
      if (savedSessionId) {
        sessionId = savedSessionId
      } else {
        window.sessionStorage.setItem("portfolio-visitor-session", sessionId)
        shouldTrack = true
      }
    } catch (storageError) {
      console.warn(
        "Could not save the anonymous visitor session.",
        storageError,
      )
      shouldTrack = !fallbackTracked.current
      fallbackTracked.current = true
    }

    if (!shouldTrack) return

    fetch(apiUrl("/api/visitors"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),
    })
      .then(async (response) => {
        if (!response.ok) {
          console.error("Could not record portfolio visit.", {
            status: response.status,
            response: await response.text(),
          })
        }
      })
      .catch((trackingError) => {
        console.error("Could not record portfolio visit.", trackingError)
      })
  }, [pathname])

  return null
}

export default function App() {
  const [isOffline, setIsOffline] = useState(() => !window.navigator.onLine)

  useEffect(() => {
    const handleOnline = () => setIsOffline(false)
    const handleOffline = () => setIsOffline(true)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)
    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  if (isOffline) return <OfflinePage />

  return (
    <div className="min-h-screen bg-[#edf7fa] transition-colors duration-300 dark:bg-[#0f172a]">
      <ScrollToTop />
      <PortfolioVisitTracker />
      <Routes>
        <Route element={<HomePage />} path="/" />
        <Route element={<SkillsPage />} path="/skills" />
        <Route element={<WorkPage />} path="/works" />
        <Route element={<BlogPage />} path="/blog" />
        <Route element={<BlogPostPage />} path="/blog/:id" />
        <Route element={<ContactPage />} path="/contact" />
        <Route element={<AdminLoginPage />} path="/admin/login" />
        <Route element={<AdminDashboardPage />} path="/admin/dashboard" />
        <Route element={<Navigate replace to="/admin/login" />} path="/admin" />
        <Route
          element={<Navigate replace to="/admin/login" />}
          path="/admin/*"
        />
        <Route element={<Navigate replace to="/" />} path="*" />
      </Routes>
    </div>
  )
}
