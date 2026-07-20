import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { adminMe, type AdminSession } from "@/lib/api"

export function useAdminAuth() {
  const queryClient = useQueryClient()
  const { data, isLoading, isError } = useQuery<AdminSession>({
    queryKey: ["admin-session"],
    queryFn: adminMe,
    retry: false,
    staleTime: 5 * 60 * 1000,
  })

  return {
    session: data ?? null,
    isLoading,
    isAuthenticated: Boolean(data) && !isError,
    invalidate: () => queryClient.invalidateQueries({ queryKey: ["admin-session"] }),
  }
}

/** Redirects away from a page a "team" session isn't allowed to see. AdminUser sessions (menuKeys === null) always pass. */
export function useRequireMenu(key: string) {
  const { session, isLoading } = useAdminAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (isLoading) return
    if (session?.menuKeys && !session.menuKeys.includes(key)) {
      navigate("/admin", { replace: true })
    }
  }, [isLoading, session, key, navigate])
}
