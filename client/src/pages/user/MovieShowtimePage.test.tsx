import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MovieShowtimePage } from './MovieShowtimePage'
import { theaterService } from '@/services/theaterService'
import { showtimeService } from '@/services/showtimeService'
import { movieService } from '@/services/movieService'

vi.mock('@/services/movieService', () => ({
  movieService: {
    getMovieById: vi.fn().mockResolvedValue({
      id: 'movie-1',
      title: 'Movie A',
      duration: 120,
      status: 'NOW_SHOWING',
      genres: [{ id: '1', name: 'Action' }],
    }),
  },
}))

vi.mock('@/services/theaterService', () => ({
  theaterService: {
    getByMovieId: vi.fn(),
  },
}))

vi.mock('@/services/showtimeService', () => ({
  showtimeService: {
    getByMovieAndTheaterAndDate: vi.fn(),
  },
}))

const theaters = [
  { id: 'theater-1', name: 'Cinema A', address: 'Address A', phone: null, latitude: null, longitude: null },
  { id: 'theater-2', name: 'Cinema B', address: 'Address B', phone: null, latitude: null, longitude: null },
]

// Future showtime
const futureShowtime = {
  id: 'showtime-1',
  movieId: 'movie-1',
  movieTitle: 'Movie A',
  roomId: 'room-1',
  roomName: 'Room 1',
  theaterId: 'theater-1',
  theaterName: 'Cinema A',
  startTime: '2099-08-21T03:00:00Z',
  endTime: '2099-08-21T05:00:00Z',
  status: 'OPEN' as const,
}

// Past showtime
const pastShowtime = {
  id: 'showtime-past',
  movieId: 'movie-1',
  movieTitle: 'Movie A',
  roomId: 'room-1',
  roomName: 'Room 1',
  theaterId: 'theater-1',
  theaterName: 'Cinema A',
  startTime: '2020-01-01T03:00:00Z',
  endTime: '2020-01-01T05:00:00Z',
  status: 'OPEN' as const,
}

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/user/booking/movie-1/showtimes']}>
      <Routes>
        <Route path="/user/booking/:movieId/showtimes" element={<MovieShowtimePage />} />
        <Route path="/user/booking/:showtimeId/seats" element={<div>Seat selection</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

afterEach(() => {
  vi.clearAllMocks()
})

describe('MovieShowtimePage', () => {
  it('renders theaters returned for the selected movie', async () => {
    vi.mocked(theaterService.getByMovieId).mockResolvedValue(theaters)
    vi.mocked(showtimeService.getByMovieAndTheaterAndDate).mockResolvedValue([futureShowtime])

    renderPage()

    expect(await screen.findByText('Cinema A')).toBeInTheDocument()
    expect(screen.getByText('Cinema B')).toBeInTheDocument()
    expect(theaterService.getByMovieId).toHaveBeenCalledWith('movie-1')
  })

  it('reloads showtimes when the theater changes', async () => {
    vi.mocked(theaterService.getByMovieId).mockResolvedValue(theaters)
    vi.mocked(showtimeService.getByMovieAndTheaterAndDate).mockResolvedValue([])

    renderPage()
    const secondTheater = await screen.findByRole('button', { name: 'Chọn rạp Cinema B' })
    fireEvent.click(secondTheater)

    await waitFor(() => {
      expect(showtimeService.getByMovieAndTheaterAndDate).toHaveBeenLastCalledWith(
        'movie-1',
        'theater-2',
        expect.any(String),
      )
    })
  })

  it('navigates to the existing seat flow after selecting a future showtime', async () => {
    vi.mocked(theaterService.getByMovieId).mockResolvedValue(theaters)
    vi.mocked(showtimeService.getByMovieAndTheaterAndDate).mockResolvedValue([futureShowtime])

    renderPage()

    const showtimeButton = await screen.findByRole('button', { name: /10:00.*Room 1/ })
    expect(showtimeButton).not.toBeDisabled()
    fireEvent.click(showtimeButton)

    expect(await screen.findByText('Seat selection')).toBeInTheDocument()
  })

  it('disables past showtimes and shows passed badge', async () => {
    vi.mocked(theaterService.getByMovieId).mockResolvedValue(theaters)
    vi.mocked(showtimeService.getByMovieAndTheaterAndDate).mockResolvedValue([pastShowtime])

    renderPage()

    const showtimeButton = await screen.findByRole('button', { name: /10:00.*Room 1/ })
    expect(showtimeButton).toBeDisabled()
    expect(screen.getByText('Đã qua giờ')).toBeInTheDocument()
  })

  it('renders quick date selector and updates selected date on click', async () => {
    vi.mocked(theaterService.getByMovieId).mockResolvedValue(theaters)
    vi.mocked(showtimeService.getByMovieAndTheaterAndDate).mockResolvedValue([futureShowtime])

    renderPage()

    const tomorrowButton = await screen.findByRole('button', { name: /Ngày mai/ })
    expect(tomorrowButton).toBeInTheDocument()
    fireEvent.click(tomorrowButton)

    await waitFor(() => {
      expect(showtimeService.getByMovieAndTheaterAndDate).toHaveBeenCalledTimes(2)
    })
  })
})
