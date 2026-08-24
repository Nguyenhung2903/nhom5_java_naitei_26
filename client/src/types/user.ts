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

export interface PageResponse<T> {
  content: T[]
  pageNo: number
  pageSize: number
  totalElements: number
  totalPages: number
  last: boolean
}

export interface UpdateProfilePayload {
  username: string
  fullName: string
  phone?: string
  birthday?: string
  gender?: string
  avatar?: string
}

export interface CreateUserPayload {
  username: string
  email: string
  password: string
  fullName: string
  phone?: string
  birthday?: string
  gender?: string
  avatar?: string
  role?: Role
  status?: UserStatus
}

export interface AdminUpdateUserPayload {
  username: string
  fullName: string
  phone?: string
  birthday?: string
  gender?: string
  avatar?: string
  role: Role
  status: UserStatus
  password?: string
}

export interface GetUsersParams {
  keyword?: string
  role?: Role | ''
  status?: UserStatus | ''
  page?: number
  size?: number
  sortBy?: string
  sortDir?: 'asc' | 'desc'
}
