import { useQuery, useQueryClient } from "@tanstack/react-query"
import { customerMe, type CustomerSession } from "@/lib/api"

export function useCustomerAuth() {
  const queryClient = useQueryClient()
  const { data, isLoading, isError } = useQuery<CustomerSession>({
    queryKey: ["customer-session"],
    queryFn: customerMe,
    retry: false,
    staleTime: 5 * 60 * 1000,
  })

  return {
    session: data ?? null,
    isLoading,
    isAuthenticated: Boolean(data) && !isError,
    invalidate: () => queryClient.invalidateQueries({ queryKey: ["customer-session"] }),
  }
}
