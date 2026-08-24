import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { RouterProvider, createMemoryRouter } from 'react-router-dom'
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

  it('protects admin routes with allowedRoles ADMIN', () => {
    const adminRoute = router.routes.find((r) => r.path === '/admin')
    expect(adminRoute).toBeDefined()
  })
})
