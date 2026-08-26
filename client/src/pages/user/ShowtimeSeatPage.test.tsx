import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ShowtimeSeatPage } from './ShowtimeSeatPage'
import { showtimeSeatService } from '@/services/showtimeSeatService'
import type { ShowtimeSeat } from '@/types/showtimeSeat'

vi.mock('@/services/showtimeSeatService', () => ({
  showtimeSeatService: {
    getSeats: vi.fn(),
    holdSeats: vi.fn(),
    releaseSeats: vi.fn(),
  },
}))

const mockSeats: ShowtimeSeat[] = [
  {
    id: 'seat-1',
    showtimeId: 'showtime-1',
    seatId: 's1',
    seatRow: 'A',
    seatNumber: 1,
    seatType: 'NORMAL',
    price: 75000,
    status: 'AVAILABLE',
    heldUntil: null,
  },
  {
    id: 'seat-2',
    showtimeId: 'showtime-1',
    seatId: 's2',
    seatRow: 'A',
    seatNumber: 2,
    seatType: 'NORMAL',
    price: 75000,
    status: 'AVAILABLE',
    heldUntil: null,
  },
  {
    id: 'seat-3',
    showtimeId: 'showtime-1',
    seatId: 's3',
    seatRow: 'B',
    seatNumber: 1,
    seatType: 'VIP',
    price: 95000,
    status: 'BOOKED',
    heldUntil: null,
  },
]

function renderPage(showtimeId = 'showtime-1') {
  return render(
    <MemoryRouter initialEntries={[`/user/booking/${showtimeId}/seats`]}>
      <Routes>
        <Route path="/user/booking/:showtimeId/seats" element={<ShowtimeSeatPage />} />
        <Route path="/user/booking/:showtimeId/combos" element={<div>Combo Selection</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

afterEach(() => {
  vi.clearAllMocks()
})

describe('ShowtimeSeatPage', () => {
  it('renders seat map after loading without React Hook errors', async () => {
    vi.mocked(showtimeSeatService.getSeats).mockResolvedValue(mockSeats)

    renderPage()

    // Initially loads without crashing
    expect(screen.getByLabelText('Đang tải sơ đồ ghế...')).toBeInTheDocument()

    // Transitions to displaying seats
    expect(await screen.findByText('A1')).toBeInTheDocument()
    expect(screen.getByText('A2')).toBeInTheDocument()
    expect(screen.getByText('B1')).toBeInTheDocument()
    expect(showtimeSeatService.getSeats).toHaveBeenCalledWith('showtime-1')
  })

  it('allows selecting seats and updating summary price', async () => {
    vi.mocked(showtimeSeatService.getSeats).mockResolvedValue(mockSeats)

    renderPage()

    const seatA1 = await screen.findByText('A1')
    fireEvent.click(seatA1)

    // Check summary updates
    expect(await screen.findByText('Ghế đã chọn:')).toBeInTheDocument()
    expect(screen.getByText('75.000 ₫')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Tiếp tục thanh toán/i })).not.toBeDisabled()
  })

  it('holds seats and navigates to combo page on continue', async () => {
    vi.mocked(showtimeSeatService.getSeats).mockResolvedValue(mockSeats)
    vi.mocked(showtimeSeatService.holdSeats).mockResolvedValue()

    renderPage()

    const seatA1 = await screen.findByText('A1')
    fireEvent.click(seatA1)

    const continueButton = screen.getByRole('button', { name: /Tiếp tục thanh toán/i })
    fireEvent.click(continueButton)

    await waitFor(() => {
      expect(showtimeSeatService.holdSeats).toHaveBeenCalledWith('showtime-1', ['seat-1'])
      expect(screen.getByText('Combo Selection')).toBeInTheDocument()
    })
  })
})
