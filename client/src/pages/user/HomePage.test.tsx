import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { HomePage } from './HomePage'

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: null,
    isAuthenticated: false,
    isAdmin: false,
  }),
}))

describe('HomePage', () => {
  it('navigates to the selected movie showtimes when booking is clicked', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/booking/:movieId/showtimes" element={<div>Movie showtimes</div>} />
        </Routes>
      </MemoryRouter>,
    )

    fireEvent.click(screen.getAllByRole('button', { name: 'Đặt vé ngay' })[1])

    expect(screen.getByText('Movie showtimes')).toBeTruthy()
  })
})