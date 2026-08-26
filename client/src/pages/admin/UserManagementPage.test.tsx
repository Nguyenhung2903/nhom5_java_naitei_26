import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { UserManagementPage } from './UserManagementPage'
import { userService } from '@/services/userService'

vi.mock('@/services/userService', () => ({
  userService: {
    getUsers: vi.fn(),
    createUser: vi.fn(),
    updateUser: vi.fn(),
    deleteUser: vi.fn(),
  },
}))

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: {
      id: 'user-1',
      username: 'admin01',
      email: 'admin01@cinemanest.vn',
      fullName: 'Admin User',
      role: 'ADMIN',
      status: 'ACTIVE',
    },
    isAuthenticated: true,
    isAdmin: true,
  }),
}))

afterEach(() => {
  vi.restoreAllMocks()
})

const mockUsers = [
  {
    id: 'user-1',
    username: 'admin01',
    email: 'admin01@cinemanest.vn',
    fullName: 'Admin User',
    role: 'ADMIN' as const,
    status: 'ACTIVE' as const,
    phone: '0912345678',
    birthday: '1990-01-01',
    gender: 'Nam',
    avatar: 'https://example.com/avatar1.jpg',
  },
  {
    id: 'user-2',
    username: 'client01',
    email: 'client01@cinemanest.vn',
    fullName: 'Client User',
    role: 'USER' as const,
    status: 'ACTIVE' as const,
    phone: '0987654321',
    birthday: '1998-05-15',
    gender: 'Nữ',
    avatar: '',
  },
]

describe('UserManagementPage', () => {
  it('renders user list from API', async () => {
    vi.mocked(userService.getUsers).mockResolvedValue({
      content: mockUsers,
      pageNo: 0,
      pageSize: 10,
      totalElements: 2,
      totalPages: 1,
      last: true,
    })

    render(
      <MemoryRouter>
        <UserManagementPage />
      </MemoryRouter>
    )

    expect(await screen.findByText('Quản lý người dùng')).toBeTruthy()
    expect(await screen.findByText('Admin User')).toBeTruthy()
    expect(screen.getByText('Client User')).toBeTruthy()
    expect(screen.getByText('@admin01')).toBeTruthy()
    expect(screen.getByText('@client01')).toBeTruthy()
    expect(userService.getUsers).toHaveBeenCalledOnce()
  })

  it('opens create modal when clicking Thêm tài khoản mới', async () => {
    vi.mocked(userService.getUsers).mockResolvedValue({
      content: mockUsers,
      pageNo: 0,
      pageSize: 10,
      totalElements: 2,
      totalPages: 1,
      last: true,
    })

    render(
      <MemoryRouter>
        <UserManagementPage />
      </MemoryRouter>
    )

    await screen.findByText('Quản lý người dùng')

    const createButton = screen.getByText('Thêm tài khoản mới')
    fireEvent.click(createButton)

    expect(screen.getByText('Thêm tài khoản người dùng mới')).toBeTruthy()
  })

  it('opens edit modal and updates user', async () => {
    vi.mocked(userService.getUsers).mockResolvedValue({
      content: mockUsers,
      pageNo: 0,
      pageSize: 10,
      totalElements: 2,
      totalPages: 1,
      last: true,
    })
    vi.mocked(userService.updateUser).mockResolvedValue({
      ...mockUsers[0],
      fullName: 'Admin User Promoted',
    })

    render(
      <MemoryRouter>
        <UserManagementPage />
      </MemoryRouter>
    )

    await screen.findByText('Admin User')

    const editButtons = screen.getAllByText('Sửa')
    fireEvent.click(editButtons[0])

    expect(screen.getByText('Chỉnh sửa thông tin & phân quyền')).toBeTruthy()

    const nameInput = screen.getByLabelText(/Họ và tên đầy đủ/i)
    fireEvent.change(nameInput, { target: { value: 'Admin User Promoted' } })

    fireEvent.click(screen.getByText('Lưu thay đổi'))

    await waitFor(() => {
      expect(userService.updateUser).toHaveBeenCalledWith(
        'user-1',
        expect.objectContaining({
          fullName: 'Admin User Promoted',
        })
      )
    })
  })

  it('displays "Bạn" badge for current user and hides Lock button for self', async () => {
    vi.mocked(userService.getUsers).mockResolvedValue({
      content: mockUsers,
      pageNo: 0,
      pageSize: 10,
      totalElements: 2,
      totalPages: 1,
      last: true,
    })

    render(
      <MemoryRouter>
        <UserManagementPage />
      </MemoryRouter>
    )

    await screen.findByText('Admin User')
    expect(screen.getByText('Bạn')).toBeTruthy()

    // Chỉ có 1 nút Khóa (cho client01), không có cho admin01
    const lockButtons = screen.getAllByText('Khóa')
    expect(lockButtons.length).toBe(1)
  })

  it('disables role and status select fields when editing self', async () => {
    vi.mocked(userService.getUsers).mockResolvedValue({
      content: mockUsers,
      pageNo: 0,
      pageSize: 10,
      totalElements: 2,
      totalPages: 1,
      last: true,
    })

    render(
      <MemoryRouter>
        <UserManagementPage />
      </MemoryRouter>
    )

    await screen.findByText('Admin User')

    const editButtons = screen.getAllByText('Sửa')
    fireEvent.click(editButtons[0]) // Edit Admin User (self)

    expect(screen.getByText('Chỉnh sửa thông tin & phân quyền')).toBeTruthy()
    expect(screen.getByText('Không thể tự thay đổi vai trò của chính mình')).toBeTruthy()
    expect(screen.getByText('Không thể tự khóa tài khoản của chính mình')).toBeTruthy()
  })
})
