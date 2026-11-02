import type {
  BlogPost,
  AboutProfile,
  DailyThought,
  Skill,
  WorkProject,
} from "../../types/content"
import { apiUrl } from "../../utils/apiUrl"

export type WorkInput = Omit<WorkProject, "id" | "number"> & {
  number?: string
}
export type BlogInput = Omit<BlogPost, "id">
export type SkillInput = Omit<Skill, "id">
export type DailyThoughtInput = Omit<DailyThought, "id">
export type AboutProfileInput = Omit<AboutProfile, "id">
export type AdminResource = "works" | "blog" | "skills" | "thoughts" | "about"

interface ApiError {
  error?: string
}

export async function adminRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const isFormData = options.body instanceof FormData
  const response = await fetch(apiUrl(path), {
    ...options,
    credentials: "include",
    headers: {
      ...(options.body && !isFormData
        ? { "Content-Type": "application/json" }
        : {}),
      ...options.headers,
    },
  })

  if (response.status === 204) {
    if (!response.ok) throw new Error(`Request failed (${response.status}).`)
    return undefined as T
  }

  const body = (await response.json()) as T & ApiError
  if (!response.ok) {
    throw new Error(body.error || `Request failed (${response.status}).`)
  }
  return body
}

export function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong."
}
