import type { Role } from '@/types/auth'

/**
 * Returns a role-safe redirect URL to prevent users/admins from being redirected
 * to unauthorized portal areas after login or navigation.
 */
export function getSafeRedirectUrl(role: Role, redirectUrl?: string | null): string {
  if (!redirectUrl || !redirectUrl.startsWith('/')) {
    return role === 'ADMIN' ? '/admin' : '/user'
  }

  // Admin users should only be redirected to /admin paths
  if (role === 'ADMIN') {
    return redirectUrl.startsWith('/admin') ? redirectUrl : '/admin'
  }

  // Standard users should only be redirected to /user paths
  if (role === 'USER') {
    return redirectUrl.startsWith('/user') ? redirectUrl : '/user'
  }

  return role === 'ADMIN' ? '/admin' : '/user'
}
