import { Navigate, Outlet, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { FullScreenLoader } from '@/components/ui'

export function PublicOnlyRoute() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const [searchParams] = useSearchParams()

  if (isLoading) {
    return <FullScreenLoader ariaLabel="Đang tải..." />
  }

  if (isAuthenticated && user) {
    const redirectUrl = searchParams.get('redirect')
    if (redirectUrl) {
      return <Navigate to={redirectUrl} replace />
    }
    // Nếu là ADMIN -> chuyển về /admin, nếu là USER -> chuyển về /
    return <Navigate to={user.role === 'ADMIN' ? '/admin' : '/'} replace />
  }

  return <Outlet />
}

export default PublicOnlyRoute
