import { useEffect, useState } from "react"

interface ApiResourceState<T> {
  data: T | null
  error: string | null
  loading: boolean
}

export default function useApiResource<T>(resource: string) {
  const [state, setState] = useState<ApiResourceState<T>>({
    data: null,
    error: null,
    loading: true,
  })

  useEffect(() => {
    const controller = new AbortController()

    async function loadResource() {
      setState({ data: null, error: null, loading: true })
      try {
        const response = await fetch(`/api/${resource}`, {
          signal: controller.signal,
        })
        if (!response.ok) {
          const errorBody = (await response.json()) as { error?: unknown }
          const message =
            typeof errorBody.error === "string"
              ? errorBody.error
              : `Request failed with status ${response.status}.`
          throw new Error(message)
        }
        const body = (await response.json()) as T
        setState({ data: body, error: null, loading: false })
      } catch (error) {
        if (controller.signal.aborted) return
        setState({
          data: null,
          error:
            error instanceof Error ? error.message : "Could not load content.",
          loading: false,
        })
      }
    }

    void loadResource()
    return () => controller.abort()
  }, [resource])

  return state
}
