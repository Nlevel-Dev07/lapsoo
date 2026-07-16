import { Navigate, Outlet } from "react-router-dom"
import { useAdminAuth } from "./useAdminAuth"

export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAdminAuth()

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center text-ink/40 text-sm">Loading…</div>
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />
  }

  return <Outlet />
}
