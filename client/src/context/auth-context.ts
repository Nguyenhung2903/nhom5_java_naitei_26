import { createContext } from 'react'
import type { UserProfile, LoginRequest, RegisterRequest, AuthResponse } from '@/types/auth'

export interface AuthContextType {
  user: UserProfile | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  isAdmin: boolean
  login: (payload: LoginRequest) => Promise<UserProfile>
  register: (payload: RegisterRequest) => Promise<UserProfile>
  logout: () => void
  refreshProfile: () => Promise<UserProfile | null>
  setUserSession: (authData: AuthResponse) => void
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)
