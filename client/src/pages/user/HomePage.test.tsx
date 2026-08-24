import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { HomePage } from './HomePage'
import { movieService } from '@/services/movieService'
import { newsService } from '@/services/newsService'
import { promotionService } from '@/services/promotionService'

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: null,
    isAuthenticated: false,
    isAdmin: false,
  }),
}))

vi.mock('@/services/movieService', () => ({
  movieService: {
    getMovies: vi.fn(),
  },
}))

vi.mock('@/services/newsService', () => ({
  newsService: {
    getNews: vi.fn(),
  },
}))

vi.mock('@/services/promotionService', () => ({
  promotionService: {
    getPromotions: vi.fn(),
  },
}))

describe('HomePage', () => {
  it('navigates to the selected movie showtimes when booking is clicked', async () => {
    vi.mocked(movieService.getMovies).mockResolvedValue([
      {
        id: 'movie-1',
        title: 'Avengers: Secret Wars',
        description: 'Epic movie',
        duration: 180,
        status: 'NOW_SHOWING',
        genres: [],
      },
    ])
    vi.mocked(newsService.getNews).mockResolvedValue([])
    vi.mocked(promotionService.getPromotions).mockResolvedValue([])

    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/booking/:movieId/showtimes" element={<div>Movie showtimes</div>} />
        </Routes>
      </MemoryRouter>,
    )

    const bookButtons = await screen.findAllByRole('button', { name: 'Đặt vé ngay' })
    fireEvent.click(bookButtons[0])

    await waitFor(() => {
      expect(screen.getByText('Movie showtimes')).toBeTruthy()
    })
  })
})