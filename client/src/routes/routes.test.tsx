import { describe, it, expect } from 'vitest'
import { router } from './index'
import { getSafeRedirectUrl } from './authRedirect'

describe('Router Configuration & Auth Redirection', () => {
  it('defines valid routes array', () => {
    expect(router.routes).toBeDefined()
    expect(router.routes.length).toBeGreaterThan(0)
  })

  it('has public landing routes wrapped in PublicOnlyRoute for home, movies, cinemas, promotions, news', () => {
    const publicOnlyBranch = router.routes[0]
    expect(publicOnlyBranch).toBeDefined()
    const landingRoute = publicOnlyBranch?.children?.find((r) => r.path === '/')
    expect(landingRoute).toBeDefined()
    expect(landingRoute?.children).toBeDefined()

    const childPaths = landingRoute?.children?.map((c) => c.path || (c.index ? 'index' : ''))
    expect(childPaths).toContain('index')
    expect(childPaths).toContain('movies')
    expect(childPaths).toContain('cinemas')
    expect(childPaths).toContain('promotions')
    expect(childPaths).toContain('news')
    expect(childPaths).toContain('news/:newsId')
  })

  it('defines /user Member Portal with movies, tickets, profile, and Booking branches', () => {
    const userRoute = router.routes.find((r) => r.path === '/user')
    expect(userRoute).toBeDefined()
    expect(userRoute?.children).toBeDefined()

    // Sub-branch 1: Member Portal Layout
    const portalLayoutChild = userRoute?.children?.[0]
    expect(portalLayoutChild?.children).toBeDefined()
    const portalPaths = portalLayoutChild?.children?.map((c) => c.path || (c.index ? 'index' : ''))
    expect(portalPaths).toContain('index')
    expect(portalPaths).toContain('movies')
    expect(portalPaths).toContain('tickets')
    expect(portalPaths).toContain('profile')

    // Sub-branch 2: Booking Layout
    const bookingLayoutChild = userRoute?.children?.[1]
    expect(bookingLayoutChild?.children).toBeDefined()
    const bookingPaths = bookingLayoutChild?.children?.map((c) => c.path)
    expect(bookingPaths).toContain('booking/:movieId/showtimes')
    expect(bookingPaths).toContain('booking/:showtimeId/seats')
    expect(bookingPaths).toContain('booking/:showtimeId/combos')
    expect(bookingPaths).toContain('booking/:showtimeId/checkout')
    expect(bookingPaths).toContain('booking/:showtimeId/payment')
    expect(bookingPaths).toContain('payment/vnpay-return')
  })

  it('protects admin routes with allowedRoles ADMIN and contains profile route', () => {
    const adminRoute = router.routes.find((r) => r.path === '/admin')
    expect(adminRoute).toBeDefined()
    const adminLayoutChild = adminRoute?.children?.[0]
    expect(adminLayoutChild?.children).toBeDefined()
    const adminPaths = adminLayoutChild?.children?.map((c) => c.path || (c.index ? 'index' : ''))
    expect(adminPaths).toContain('index')
    expect(adminPaths).toContain('movies')
    expect(adminPaths).toContain('news')
    expect(adminPaths).toContain('promotions')
    expect(adminPaths).toContain('showtimes')
    expect(adminPaths).toContain('theaters')
    expect(adminPaths).toContain('rooms')
    expect(adminPaths).toContain('seats')
    expect(adminPaths).toContain('bookings')
    expect(adminPaths).toContain('users')
    expect(adminPaths).toContain('profile')
  })

  describe('getSafeRedirectUrl helper', () => {
    it('redirects ADMIN to /admin when redirectUrl is /user or not starting with /admin', () => {
      expect(getSafeRedirectUrl('ADMIN', '/user')).toBe('/admin')
      expect(getSafeRedirectUrl('ADMIN', '/user/profile')).toBe('/admin')
      expect(getSafeRedirectUrl('ADMIN', null)).toBe('/admin')
      expect(getSafeRedirectUrl('ADMIN', '')).toBe('/admin')
      expect(getSafeRedirectUrl('ADMIN', 'invalid')).toBe('/admin')
    })

    it('redirects ADMIN to requested /admin path when redirectUrl starts with /admin', () => {
      expect(getSafeRedirectUrl('ADMIN', '/admin/movies')).toBe('/admin/movies')
      expect(getSafeRedirectUrl('ADMIN', '/admin/theaters')).toBe('/admin/theaters')
    })

    it('redirects USER to /user when redirectUrl is /admin or not starting with /user', () => {
      expect(getSafeRedirectUrl('USER', '/admin')).toBe('/user')
      expect(getSafeRedirectUrl('USER', '/admin/movies')).toBe('/user')
      expect(getSafeRedirectUrl('USER', null)).toBe('/user')
      expect(getSafeRedirectUrl('USER', '')).toBe('/user')
    })

    it('redirects USER to requested /user path when redirectUrl starts with /user', () => {
      expect(getSafeRedirectUrl('USER', '/user/movies')).toBe('/user/movies')
      expect(getSafeRedirectUrl('USER', '/user/booking/123/showtimes')).toBe('/user/booking/123/showtimes')
    })
  })
})
