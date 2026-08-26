import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { UserMoviesPage } from './UserMoviesPage'
import { movieService } from '@/services/movieService'

vi.mock('@/services/movieService', () => ({
  movieService: {
    getMovies: vi.fn(),
  },
}))

const mockMovies = [
  {
    id: 'movie-1',
    title: 'Now Showing Movie',
    description: 'A great movie currently showing',
    duration: 120,
    status: 'NOW_SHOWING' as const,
    genres: [{ id: '1', name: 'Hành động' }],
    ageRating: 'T13',
    releaseDate: '2026-08-01',
  },
  {
    id: 'movie-2',
    title: 'Coming Soon Movie',
    description: 'An exciting upcoming blockbuster',
    duration: 140,
    status: 'COMING_SOON' as const,
    genres: [{ id: '2', name: 'Khoa học viễn tưởng' }],
    ageRating: 'T16',
    releaseDate: '2026-09-01',
  },
]

describe('UserMoviesPage', () => {
  it('defaults to NOW_SHOWING tab and switches to COMING_SOON correctly without ALL button', async () => {
    vi.mocked(movieService.getMovies).mockResolvedValue(mockMovies)

    render(
      <MemoryRouter initialEntries={['/user/movies']}>
        <Routes>
          <Route path="/user/movies" element={<UserMoviesPage />} />
        </Routes>
      </MemoryRouter>
    )

    // Verify "Tất cả" is NOT present
    expect(screen.queryByRole('button', { name: /tất cả/i })).toBeNull()

    // Verify "Đang chiếu" is active and showing Movie 1
    const nowShowingMovie = await screen.findByText('Now Showing Movie')
    expect(nowShowingMovie).toBeTruthy()
    expect(screen.queryByText('Coming Soon Movie')).toBeNull()

    // Switch to "Sắp chiếu"
    const comingSoonButton = screen.getByRole('button', { name: /sắp chiếu/i })
    fireEvent.click(comingSoonButton)

    await waitFor(() => {
      expect(screen.getByText('Coming Soon Movie')).toBeTruthy()
      expect(screen.queryByText('Now Showing Movie')).toBeNull()
    })
  })
})
