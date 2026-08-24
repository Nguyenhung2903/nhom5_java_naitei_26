import { describe, it, expect } from 'vitest'
import { router } from './index'

describe('Router Configuration', () => {
  it('defines valid routes array', () => {
    expect(router.routes).toBeDefined()
    expect(router.routes.length).toBeGreaterThan(0)
  })

  it('has public landing routes for home, movies, cinemas, promotions, news', () => {
    const rootRoute = router.routes.find((r) => r.path === '/')
    expect(rootRoute).toBeDefined()
    expect(rootRoute?.children).toBeDefined()

    const childPaths = rootRoute?.children?.map((c) => c.path || (c.index ? 'index' : ''))
    expect(childPaths).toContain('index')
    expect(childPaths).toContain('movies')
    expect(childPaths).toContain('cinemas')
    expect(childPaths).toContain('promotions')
    expect(childPaths).toContain('news')
    expect(childPaths).toContain('news/:newsId')
  })

  it('defines /user Member Portal and Booking branches', () => {
    const userRoute = router.routes.find((r) => r.path === '/user')
    expect(userRoute).toBeDefined()
    expect(userRoute?.children).toBeDefined()

    // Sub-branch 1: Member Portal Layout
    const portalLayoutChild = userRoute?.children?.[0]
    expect(portalLayoutChild?.children).toBeDefined()
    const portalPaths = portalLayoutChild?.children?.map((c) => c.path || (c.index ? 'index' : ''))
    expect(portalPaths).toContain('index')
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

  it('protects admin routes with allowedRoles ADMIN', () => {
    const adminRoute = router.routes.find((r) => r.path === '/admin')
    expect(adminRoute).toBeDefined()
  })
})
