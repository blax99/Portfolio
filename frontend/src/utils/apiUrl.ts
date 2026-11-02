const apiBaseUrl = (import.meta.env.API_BASE_URL || "").replace(/\/+$/, "")

export function apiUrl(path: string) {
  return `${apiBaseUrl}${path.startsWith("/") ? path : `/${path}`}`
}
