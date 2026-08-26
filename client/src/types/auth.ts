export type Role = 'ADMIN' | 'USER'

export type UserStatus = 'ACTIVE' | 'LOCKED'

export interface UserProfile {
  id: string
  username: string
  email: string
  fullName: string
  role: Role
  status: UserStatus
  phone?: string | null
  birthday?: string | null
  gender?: string | null
  avatar?: string | null
  createdAt?: string
  updatedAt?: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  username: string
  password: string
  email: string
  fullName: string
  phone?: string
  birthday?: string
  gender?: string
}

export interface AuthResponse {
  accessToken: string
  tokenType: string
  expiresIn: number
  user: UserProfile
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
  confirmPassword: string
  oldPassword?: string
}
