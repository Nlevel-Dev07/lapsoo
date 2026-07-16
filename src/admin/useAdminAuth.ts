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
