import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { FullScreenLoader } from '@/components/ui'
import type { Role } from '@/types/auth'

interface ProtectedRouteProps {
  allowedRoles?: Role[]
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return <FullScreenLoader ariaLabel="Đang kiểm tra thông tin đăng nhập..." />
  }

  if (!isAuthenticated) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`} replace />
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/403" replace />
  }

  return <Outlet />
}

export default ProtectedRoute
