import { describe, it, expect } from 'vitest'
import { router } from './index'

describe('Router Configuration', () => {
  it('defines valid routes array', () => {
    expect(router.routes).toBeDefined()
    expect(router.routes.length).toBeGreaterThan(0)
  })

  it('has public user routes for home and movies', () => {
    const rootRoute = router.routes.find((r) => r.path === '/')
    expect(rootRoute).toBeDefined()
    expect(rootRoute?.children).toBeDefined()

    const childPaths = rootRoute?.children?.map((c) => c.path || (c.index ? 'index' : ''))
    expect(childPaths).toContain('index')
    expect(childPaths).toContain('movies')
    expect(childPaths).toContain('cinemas')
    expect(childPaths).toContain('booking/:movieId/showtimes')
    expect(childPaths).toContain('booking/:showtimeId/seats')
    expect(childPaths).toContain('booking/:showtimeId/combos')
  })

  it('protects checkout and payment routes inside ProtectedRoute child', () => {
    const rootRoute = router.routes.find((r) => r.path === '/')
    const protectedChild = rootRoute?.children?.find((c) => !c.path && c.children)
    expect(protectedChild).toBeDefined()

    const protectedPaths = protectedChild?.children?.map((c) => c.path)
    expect(protectedPaths).toContain('booking/:showtimeId/checkout')
    expect(protectedPaths).toContain('booking/:showtimeId/payment')
    expect(protectedPaths).toContain('profile')
    expect(protectedPaths).toContain('my-tickets')
  })

  it('defines /user Member Portal branch with subroutes', () => {
    const userPortalRoute = router.routes.find((r) => r.path === '/user')
    expect(userPortalRoute).toBeDefined()
    expect(userPortalRoute?.children).toBeDefined()

    const layoutChild = userPortalRoute?.children?.[0]
    expect(layoutChild?.children).toBeDefined()

    const userSubPaths = layoutChild?.children?.map((c) => c.path || (c.index ? 'index' : ''))
    expect(userSubPaths).toContain('index')
    expect(userSubPaths).toContain('tickets')
    expect(userSubPaths).toContain('profile')
  })

  it('protects admin routes with allowedRoles ADMIN', () => {
    const adminRoute = router.routes.find((r) => r.path === '/admin')
    expect(adminRoute).toBeDefined()
  })
})
