import { afterEach, describe, expect, it, vi } from 'vitest'
import { api } from '@/lib/api'
import { userService } from './userService'
import type { UserProfile, PageResponse } from '@/types/user'

afterEach(() => {
  vi.restoreAllMocks()
})

const mockUser: UserProfile = {
  id: 'user-123',
  username: 'johndoe',
  email: 'johndoe@cinemanest.vn',
  fullName: 'John Doe',
  role: 'USER',
  status: 'ACTIVE',
  phone: '0912345678',
  birthday: '1995-05-20',
  gender: 'Nam',
  avatar: 'https://example.com/avatar.jpg',
}

describe('userService', () => {
  it('calls getMyProfile correctly', async () => {
    vi.spyOn(api, 'get').mockResolvedValue({ data: mockUser } as never)

    const result = await userService.getMyProfile()

    expect(api.get).toHaveBeenCalledWith('/users/me')
    expect(result).toEqual(mockUser)
  })

  it('calls updateMyProfile correctly', async () => {
    vi.spyOn(api, 'put').mockResolvedValue({ data: { ...mockUser, fullName: 'John Doe Updated' } } as never)

    const payload = {
      username: 'johndoe',
      fullName: 'John Doe Updated',
      phone: '0987654321',
    }
    const result = await userService.updateMyProfile(payload)

    expect(api.put).toHaveBeenCalledWith('/users/me', payload)
    expect(result.fullName).toBe('John Doe Updated')
  })

  it('calls getUsers with query parameters', async () => {
    const mockPage: PageResponse<UserProfile> = {
      content: [mockUser],
      pageNo: 0,
      pageSize: 10,
      totalElements: 1,
      totalPages: 1,
      last: true,
    }
    vi.spyOn(api, 'get').mockResolvedValue({ data: mockPage } as never)

    const result = await userService.getUsers({
      keyword: 'john',
      role: 'USER',
      status: 'ACTIVE',
      page: 0,
      size: 10,
      sortBy: 'createdAt',
      sortDir: 'desc',
    })

    expect(api.get).toHaveBeenCalledWith('/users?keyword=john&role=USER&status=ACTIVE&page=0&size=10&sortBy=createdAt&sortDir=desc')
    expect(result.content).toHaveLength(1)
    expect(result.totalElements).toBe(1)
  })

  it('calls getUserById correctly', async () => {
    vi.spyOn(api, 'get').mockResolvedValue({ data: mockUser } as never)

    const result = await userService.getUserById('user-123')

    expect(api.get).toHaveBeenCalledWith('/users/user-123')
    expect(result.id).toBe('user-123')
  })

  it('calls createUser correctly', async () => {
    vi.spyOn(api, 'post').mockResolvedValue({ data: mockUser } as never)

    const payload = {
      username: 'johndoe',
      email: 'johndoe@cinemanest.vn',
      password: 'Password@123',
      fullName: 'John Doe',
      role: 'USER' as const,
      status: 'ACTIVE' as const,
    }
    const result = await userService.createUser(payload)

    expect(api.post).toHaveBeenCalledWith('/users', payload)
    expect(result.username).toBe('johndoe')
  })

  it('calls updateUser correctly', async () => {
    vi.spyOn(api, 'put').mockResolvedValue({ data: { ...mockUser, role: 'ADMIN' } } as never)

    const payload = {
      username: 'johndoe',
      fullName: 'John Doe',
      role: 'ADMIN' as const,
      status: 'ACTIVE' as const,
    }
    const result = await userService.updateUser('user-123', payload)

    expect(api.put).toHaveBeenCalledWith('/users/user-123', payload)
    expect(result.role).toBe('ADMIN')
  })

  it('calls deleteUser correctly', async () => {
    vi.spyOn(api, 'delete').mockResolvedValue({} as never)

    await userService.deleteUser('user-123')

    expect(api.delete).toHaveBeenCalledWith('/users/user-123')
  })
})
