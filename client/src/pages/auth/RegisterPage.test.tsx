import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { RegisterPage } from './RegisterPage'
import { useAuth } from '@/hooks/useAuth'

vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}))

describe('RegisterPage', () => {
  it('renders all required fields directly without collapsible toggle and validates required inputs', async () => {
    const registerMock = vi.fn()
    vi.mocked(useAuth).mockReturnValue({
      register: registerMock,
      user: null,
      isAuthenticated: false,
      isAdmin: false,
      login: vi.fn(),
      logout: vi.fn(),
      setUserSession: vi.fn(),
    })

    render(
      <MemoryRouter initialEntries={['/register']}>
        <Routes>
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
      </MemoryRouter>
    )

    // Verify collapsible button is NOT present
    expect(screen.queryByText(/Bổ sung thông tin cá nhân/i)).toBeNull()
    expect(screen.queryByText(/Thu gọn thông tin cá nhân/i)).toBeNull()

    // Verify all fields are directly in document
    expect(screen.getByLabelText(/Họ và tên/i)).toBeTruthy()
    expect(screen.getByLabelText(/Địa chỉ Email/i)).toBeTruthy()
    expect(screen.getByLabelText(/Tên đăng nhập/i)).toBeTruthy()
    expect(screen.getByLabelText(/^Mật khẩu/i)).toBeTruthy()
    expect(screen.getByLabelText(/Xác nhận mật khẩu/i)).toBeTruthy()
    expect(screen.getByLabelText(/Số điện thoại/i)).toBeTruthy()
    expect(screen.getByText('Giới tính')).toBeTruthy()
    expect(screen.getByRole('combobox')).toBeTruthy()
    expect(screen.getByLabelText(/Ngày sinh/i)).toBeTruthy()

    // Click submit when empty
    fireEvent.click(screen.getByRole('button', { name: /Đăng ký tài khoản ngay/i }))

    await waitFor(() => {
      expect(screen.getByText('Họ và tên không được để trống')).toBeTruthy()
      expect(screen.getByText('Email không được để trống')).toBeTruthy()
      expect(screen.getByText('Tên đăng nhập không được để trống')).toBeTruthy()
      expect(screen.getByText('Mật khẩu không được để trống')).toBeTruthy()
      expect(screen.getByText('Vui lòng xác nhận mật khẩu')).toBeTruthy()
      expect(screen.getByText('Số điện thoại không được để trống')).toBeTruthy()
      expect(screen.getByText('Vui lòng chọn giới tính')).toBeTruthy()
      expect(screen.getByText('Vui lòng chọn ngày sinh')).toBeTruthy()
    })
  })

  it('displays error when user is under 14 years old', async () => {
    const registerMock = vi.fn()
    vi.mocked(useAuth).mockReturnValue({
      register: registerMock,
      user: null,
      isAuthenticated: false,
      isAdmin: false,
      login: vi.fn(),
      logout: vi.fn(),
      setUserSession: vi.fn(),
    })

    render(
      <MemoryRouter initialEntries={['/register']}>
        <Routes>
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
      </MemoryRouter>
    )

    fireEvent.change(screen.getByLabelText(/Họ và tên/i), { target: { value: 'Nguyễn Văn A' } })
    fireEvent.change(screen.getByLabelText(/Địa chỉ Email/i), { target: { value: 'nguyenvana@gmail.com' } })
    fireEvent.change(screen.getByLabelText(/Tên đăng nhập/i), { target: { value: 'nguyen_van_a' } })
    fireEvent.change(screen.getByLabelText(/^Mật khẩu/i), { target: { value: '123456' } })
    fireEvent.change(screen.getByLabelText(/Xác nhận mật khẩu/i), { target: { value: '123456' } })
    fireEvent.change(screen.getByLabelText(/Số điện thoại/i), { target: { value: '0912345678' } })
    // Birthday 5 years ago (under 14)
    fireEvent.change(screen.getByLabelText(/Ngày sinh/i), { target: { value: '2021-01-01' } })

    fireEvent.click(screen.getByRole('button', { name: /Đăng ký tài khoản ngay/i }))

    await waitFor(() => {
      expect(screen.getByText('Bạn phải từ đủ 14 tuổi trở lên để đăng ký tài khoản')).toBeTruthy()
    })
    expect(registerMock).not.toHaveBeenCalled()
  })
})
