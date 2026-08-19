import { api } from '@/lib/api'
import type { ApiResponse } from '@/types/api'
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  UserProfile,
  ChangePasswordRequest,
} from '@/types/auth'

export const authService = {
  /**
   * Đăng ký tài khoản người dùng mới (Role mặc định là USER)
   */
  register: async (payload: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/register', payload)
    if (!response.data) {
      throw new Error(response.message || 'Đăng ký không thành công')
    }
    return response.data
  },

  /**
   * Đăng nhập hệ thống (User hoặc Admin)
   */
  login: async (payload: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', payload)
    if (!response.data) {
      throw new Error(response.message || 'Đăng nhập không thành công')
    }
    return response.data
  },

  /**
   * Lấy thông tin hồ sơ tài khoản hiện tại từ Token
   */
  getCurrentUser: async (): Promise<UserProfile> => {
    const response = await api.get<ApiResponse<UserProfile>>('/auth/me')
    if (!response.data) {
      throw new Error(response.message || 'Không thể lấy thông tin người dùng')
    }
    return response.data
  },

  /**
   * Đổi mật khẩu tài khoản
   */
  changePassword: async (payload: ChangePasswordRequest): Promise<void> => {
    await api.post<ApiResponse<void>>('/auth/change-password', payload)
  },
}

export default authService
