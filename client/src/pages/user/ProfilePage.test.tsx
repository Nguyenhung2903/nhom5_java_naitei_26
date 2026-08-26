import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ProfilePage } from './ProfilePage'
import { useAuth } from '@/hooks/useAuth'
import { authService } from '@/services/authService'
import { userService } from '@/services/userService'

vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}))

vi.mock('@/services/authService', () => ({
  authService: {
    changePassword: vi.fn(),
  },
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

  it('switches to edit mode, submits changes, and calls setUserSession', async () => {
    const refreshProfile = vi.fn().mockResolvedValue(mockUser)
    const setUserSession = vi.fn()
    vi.mocked(useAuth).mockReturnValue({
      user: mockUser,
      refreshProfile,
      setUserSession,
      isAuthenticated: true,
      isAdmin: false,
      isLoading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      token: 'fake-token',
    })
    vi.mocked(userService.updateMyProfile).mockResolvedValue({
      accessToken: 'new-fake-token',
      tokenType: 'Bearer',
      expiresIn: 604800000,
      user: {
        ...mockUser,
        fullName: 'John Doe Updated',
      },
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
      expect(setUserSession).toHaveBeenCalledWith(
        expect.objectContaining({
          accessToken: 'new-fake-token',
        })
      )
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

  it('validates password change form fields and submits successfully with currentPassword', async () => {
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
    vi.mocked(authService.changePassword).mockResolvedValue(undefined)

    render(
      <MemoryRouter>
        <ProfilePage />
      </MemoryRouter>
    )

    // Switch to Security Tab
    fireEvent.click(screen.getByRole('tab', { name: /đổi mật khẩu/i }))

    const submitBtn = screen.getByText('Cập nhật mật khẩu')
    fireEvent.click(submitBtn)

    // Check empty validation
    expect(screen.getByText('Vui lòng nhập mật khẩu hiện tại')).toBeTruthy()
    expect(screen.getByText('Vui lòng nhập mật khẩu mới')).toBeTruthy()
    expect(screen.getByText('Vui lòng xác nhận mật khẩu mới')).toBeTruthy()

    // Fill current and short new password
    const currentPassInput = screen.getByLabelText(/Mật khẩu hiện tại/i)
    const newPassInput = screen.getByLabelText(/^Mật khẩu mới/i)
    const confirmPassInput = screen.getByLabelText(/Xác nhận mật khẩu mới/i)

    fireEvent.change(currentPassInput, { target: { value: 'OldPassword@123' } })
    fireEvent.change(newPassInput, { target: { value: '123' } })
    fireEvent.change(confirmPassInput, { target: { value: '123' } })
    fireEvent.click(submitBtn)

    expect(screen.getByText('Mật khẩu mới phải có ít nhất 6 ký tự')).toBeTruthy()

    // Fill new password same as current password
    fireEvent.change(newPassInput, { target: { value: 'OldPassword@123' } })
    fireEvent.change(confirmPassInput, { target: { value: 'OldPassword@123' } })
    fireEvent.click(submitBtn)

    expect(screen.getByText('Mật khẩu mới không được trùng với mật khẩu hiện tại')).toBeTruthy()

    // Fill valid new password with mismatch confirm
    fireEvent.change(newPassInput, { target: { value: 'NewPassword@123' } })
    fireEvent.change(confirmPassInput, { target: { value: 'DifferentPassword@123' } })
    fireEvent.click(submitBtn)

    expect(screen.getByText('Mật khẩu xác nhận không khớp')).toBeTruthy()

    // Fill matching valid new password and submit
    fireEvent.change(confirmPassInput, { target: { value: 'NewPassword@123' } })
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(authService.changePassword).toHaveBeenCalledWith({
        currentPassword: 'OldPassword@123',
        newPassword: 'NewPassword@123',
        confirmPassword: 'NewPassword@123',
      })
      expect(screen.getByText('Đổi mật khẩu thành công!')).toBeTruthy()
    })
  })
})
