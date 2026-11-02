import { useEffect, useState } from "react"
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

function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0 })
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
