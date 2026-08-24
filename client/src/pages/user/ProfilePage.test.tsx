import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ProfilePage } from './ProfilePage'
import { useAuth } from '@/hooks/useAuth'
import { userService } from '@/services/userService'

vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}))

vi.mock('@/services/userService', () => ({
  userService: {
    updateMyProfile: vi.fn(),
  },
}))

afterEach(() => {
  vi.restoreAllMocks()
})

const mockUser = {
  id: 'user-1',
  username: 'johndoe',
  email: 'johndoe@cinemanest.vn',
  fullName: 'John Doe',
  role: 'USER' as const,
  status: 'ACTIVE' as const,
  phone: '0912345678',
  birthday: '1995-05-20',
  gender: 'Nam',
  avatar: 'https://example.com/avatar.jpg',
}

describe('ProfilePage', () => {
  it('renders user details in view mode', () => {
    const refreshProfile = vi.fn()
    vi.mocked(useAuth).mockReturnValue({
      user: mockUser,
      refreshProfile,
      isAuthenticated: true,
      isAdmin: false,
      isLoading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      token: 'fake-token',
    })

    render(
      <MemoryRouter>
        <ProfilePage />
      </MemoryRouter>
    )

    expect(screen.getByText('Hồ Sơ Cá Nhân')).toBeTruthy()
    expect(screen.getAllByText('John Doe').length).toBeGreaterThan(0)
    expect(screen.getAllByText('@johndoe').length).toBeGreaterThan(0)
    expect(screen.getByText('johndoe@cinemanest.vn')).toBeTruthy()
    expect(screen.getByText('0912345678')).toBeTruthy()
    expect(screen.getByText('Chỉnh sửa')).toBeTruthy()
  })

  it('switches to edit mode, submits changes, and calls refreshProfile', async () => {
    const refreshProfile = vi.fn().mockResolvedValue(mockUser)
    vi.mocked(useAuth).mockReturnValue({
      user: mockUser,
      refreshProfile,
      isAuthenticated: true,
      isAdmin: false,
      isLoading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      token: 'fake-token',
    })
    vi.mocked(userService.updateMyProfile).mockResolvedValue({
      ...mockUser,
      fullName: 'John Doe Updated',
    })

    render(
      <MemoryRouter>
        <ProfilePage />
      </MemoryRouter>
    )

    // Nhấn nút Chỉnh sửa
    fireEvent.click(screen.getByText('Chỉnh sửa'))

    // Kiểm tra input xuất hiện
    const fullNameInput = screen.getByLabelText(/Họ và tên/i)
    expect(fullNameInput).toBeTruthy()

    // Thay đổi họ tên
    fireEvent.change(fullNameInput, { target: { value: 'John Doe Updated' } })

    // Nhấn Lưu thay đổi
    fireEvent.click(screen.getByText('Lưu thay đổi'))

    await waitFor(() => {
      expect(userService.updateMyProfile).toHaveBeenCalledWith(
        expect.objectContaining({
          fullName: 'John Doe Updated',
        })
      )
      expect(refreshProfile).toHaveBeenCalledOnce()
    })
  })

  it('hides member stats and displays admin title when user has role ADMIN', () => {
    const adminUser = {
      ...mockUser,
      role: 'ADMIN' as const,
      fullName: 'Super Admin',
    }

    vi.mocked(useAuth).mockReturnValue({
      user: adminUser,
      refreshProfile: vi.fn(),
      isAuthenticated: true,
      isAdmin: true,
      isLoading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      token: 'fake-token',
    })

    render(
      <MemoryRouter>
        <ProfilePage />
      </MemoryRouter>
    )

    expect(screen.getByText('Hồ Sơ Quản Trị Viên')).toBeTruthy()
    expect(screen.queryByText('Vé đã xem')).toBeNull()
    expect(screen.queryByText('Điểm thưởng')).toBeNull()
  })

  it('hides member stats explicitly when showMemberStats={false}', () => {
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

    render(
      <MemoryRouter>
        <ProfilePage showMemberStats={false} />
      </MemoryRouter>
    )

    expect(screen.queryByText('Vé đã xem')).toBeNull()
    expect(screen.queryByText('Điểm thưởng')).toBeNull()
  })
})
