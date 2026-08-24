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
    const isDefaultDashboard = location.pathname === '/user' || location.pathname === '/admin'
    const redirectQuery = isDefaultDashboard
      ? ''
      : `?redirect=${encodeURIComponent(location.pathname + location.search)}`
    return <Navigate to={`/login${redirectQuery}`} replace />
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    if (user.role === 'ADMIN') {
      // Nếu Admin vô tình vào trang của User -> Tự động đưa về /admin
      return <Navigate to="/admin" replace />
    }
    // Nếu User cố tình vào trang Admin -> Chặn với lỗi 403
    return <Navigate to="/403" replace />
  }

  return <Outlet />
}

export default ProtectedRoute
