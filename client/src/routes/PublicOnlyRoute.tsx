import { Navigate, Outlet, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { FullScreenLoader } from '@/components/ui'
import { getSafeRedirectUrl } from './authRedirect'

export function PublicOnlyRoute() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const [searchParams] = useSearchParams()

  if (isLoading) {
    return <FullScreenLoader ariaLabel="Đang tải..." />
  }

  if (isAuthenticated && user) {
    const targetUrl = getSafeRedirectUrl(user.role, searchParams.get('redirect'))
    return <Navigate to={targetUrl} replace />
  }

  return <Outlet />
}

export default PublicOnlyRoute
