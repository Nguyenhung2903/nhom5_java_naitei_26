import { api } from '@/lib/api'
import type { ApiResponse } from '@/types/api'
import type { AuthResponse } from '@/types/auth'
import type {
  UserProfile,
  PageResponse,
  UpdateProfilePayload,
  CreateUserPayload,
  AdminUpdateUserPayload,
  GetUsersParams,
} from '@/types/user'

export const userService = {
  getMyProfile: async (): Promise<UserProfile> => {
    const res = await api.get<ApiResponse<UserProfile>>('/users/me')
    return res.data!
  },

  updateMyProfile: async (payload: UpdateProfilePayload): Promise<AuthResponse> => {
    const res = await api.put<ApiResponse<AuthResponse>>('/users/me', payload)
    return res.data!
  },

  getUsers: async (params: GetUsersParams = {}): Promise<PageResponse<UserProfile>> => {
    const query = new URLSearchParams()
    if (params.keyword) query.set('keyword', params.keyword)
    if (params.role) query.set('role', params.role)
    if (params.status) query.set('status', params.status)
    if (params.page !== undefined) query.set('page', String(params.page))
    if (params.size !== undefined) query.set('size', String(params.size))
    if (params.sortBy) query.set('sortBy', params.sortBy)
    if (params.sortDir) query.set('sortDir', params.sortDir)

    const queryString = query.toString()
    const endpoint = `/users${queryString ? `?${queryString}` : ''}`
    const res = await api.get<ApiResponse<PageResponse<UserProfile>>>(endpoint)
    return res.data!
  },

  getUserById: async (id: string): Promise<UserProfile> => {
    const res = await api.get<ApiResponse<UserProfile>>(`/users/${id}`)
    return res.data!
  },

  createUser: async (payload: CreateUserPayload): Promise<UserProfile> => {
    const res = await api.post<ApiResponse<UserProfile>>('/users', payload)
    return res.data!
  },

  updateUser: async (id: string, payload: AdminUpdateUserPayload): Promise<UserProfile> => {
    const res = await api.put<ApiResponse<UserProfile>>(`/users/${id}`, payload)
    return res.data!
  },

  deleteUser: async (id: string): Promise<void> => {
    await api.delete(`/users/${id}`)
  },
}
