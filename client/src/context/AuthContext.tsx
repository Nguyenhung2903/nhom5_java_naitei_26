import { useState, useEffect, useCallback, type ReactNode } from 'react'
import { authService } from '@/services/authService'
import { AuthContext, type AuthContextType } from './auth-context'
import type { UserProfile, LoginRequest, RegisterRequest } from '@/types/auth'

export { AuthContext, type AuthContextType } from './auth-context'

const TOKEN_KEY = 'access_token'
const USER_KEY = 'user_profile'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY))
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem(USER_KEY)
    if (saved) {
      try {
        return JSON.parse(saved) as UserProfile
      } catch {
        return null
      }
    }
    return null
  })
  const [isLoading, setIsLoading] = useState<boolean>(true)

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setToken(null)
    setUser(null)
  }, [])

  const refreshProfile = useCallback(async (): Promise<UserProfile | null> => {
    try {
      const current = await authService.getCurrentUser()
      setUser(current)
      localStorage.setItem(USER_KEY, JSON.stringify(current))
      return current
    } catch {
      logout()
      return null
    }
  }, [logout])

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem(TOKEN_KEY)
      if (storedToken) {
        try {
          const profile = await authService.getCurrentUser()
          setUser(profile)
          localStorage.setItem(USER_KEY, JSON.stringify(profile))
        } catch {
          logout()
        }
      }
      setIsLoading(false)
    }

    void initAuth()
  }, [logout])

  const login = async (payload: LoginRequest): Promise<UserProfile> => {
    const data = await authService.login(payload)
    localStorage.setItem(TOKEN_KEY, data.accessToken)
    localStorage.setItem(USER_KEY, JSON.stringify(data.user))
    setToken(data.accessToken)
    setUser(data.user)
    return data.user
  }

  const register = async (payload: RegisterRequest): Promise<UserProfile> => {
    const data = await authService.register(payload)
    localStorage.setItem(TOKEN_KEY, data.accessToken)
    localStorage.setItem(USER_KEY, JSON.stringify(data.user))
    setToken(data.accessToken)
    setUser(data.user)
    return data.user
  }

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated: !!token && !!user,
    isAdmin: user?.role === 'ADMIN',
    login,
    register,
    logout,
    refreshProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
