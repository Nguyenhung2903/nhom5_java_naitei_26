import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { UserDashboardPage } from './UserDashboardPage'
import { useAuth } from '@/hooks/useAuth'
import { bookingService } from '@/services/bookingService'

vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}))

vi.mock('@/services/bookingService', () => ({
  bookingService: {
    getMyBookings: vi.fn(),
  },
}))

afterEach(() => {
  vi.restoreAllMocks()
})

const mockUser = {
  id: 'usr-1',
  username: 'nguyenvana',
  fullName: 'Nguyễn Văn A',
  email: 'user@example.com',
  role: 'USER' as const,
  status: 'ACTIVE' as const,
  phone: '0912345678',
  avatar: 'https://example.com/avatar.jpg',
}

describe('UserDashboardPage', () => {
  it('renders stats, user greeting and recent bookings', async () => {
    vi.mocked(useAuth).mockReturnValue({
      user: mockUser,
      refreshProfile: vi.fn(),
      isAuthenticated: true,
      isAdmin: false,
      isLoading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      token: 'fake-token',
    })

    vi.mocked(bookingService.getMyBookings).mockResolvedValue([
      {
        id: 'bkg-1',
        bookingCode: 'TK-1234',
        bookingTime: '2026-08-25T10:00:00Z',
        totalAmount: 180000,
        bookingStatus: 'CONFIRMED',
        paymentStatus: 'PAID',
        movieTitle: 'Avengers: Doomsday',
        moviePoster: 'https://example.com/poster.jpg',
        ageRating: 'T16',
        theaterName: 'CinemaNest Thủ Đức',
        roomName: 'Phòng VIP 01',
        showtimeStartTime: '2026-08-25T19:30:00Z',
        showtimeEndTime: '2026-08-25T22:00:00Z',
        seatNames: ['E10', 'E11'],
        combos: ['1x Bắp rang bơ'],
      },
    ])

    render(
      <MemoryRouter>
        <UserDashboardPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/Bảng Điều Khiển Thành Viên/i)).toBeTruthy()
    })

    expect(screen.getAllByText('Nguyễn Văn A').length).toBeGreaterThan(0)
    expect(screen.getByText('Avengers: Doomsday')).toBeTruthy()
    expect(screen.getByText('TK-1234')).toBeTruthy()
    expect(screen.getByText('Vé đã đặt')).toBeTruthy()
    expect(screen.getByText('Điểm tích lũy')).toBeTruthy()
    expect(screen.getByText('Tổng chi tiêu')).toBeTruthy()
  })
})
