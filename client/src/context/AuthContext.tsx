import { useState, useEffect, useCallback, type ReactNode } from 'react'
import { authService } from '@/services/authService'
import { AuthContext, type AuthContextType } from './auth-context'
import type { UserProfile, LoginRequest, RegisterRequest, AuthResponse } from '@/types/auth'

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

  const setUserSession = useCallback((authData: AuthResponse) => {
    if (authData.accessToken) {
      localStorage.setItem(TOKEN_KEY, authData.accessToken)
      setToken(authData.accessToken)
    }
    if (authData.user) {
      localStorage.setItem(USER_KEY, JSON.stringify(authData.user))
      setUser(authData.user)
    }
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
    const handleAccountLocked = () => {
      logout()
      if (window.location.pathname !== '/login') {
        window.location.href = '/login?reason=account_locked'
      }
    }

    window.addEventListener('auth:account-locked', handleAccountLocked)
    return () => {
      window.removeEventListener('auth:account-locked', handleAccountLocked)
    }
  }, [logout])

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem(TOKEN_KEY)
      if (storedToken) {
        try {
          const profile = await authService.getCurrentUser()
          if (profile.status === 'LOCKED') {
            logout()
            if (window.location.pathname !== '/login') {
              window.location.href = '/login?reason=account_locked'
            }
            return
          }
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

  // Heartbeat định kỳ (30s) và khi tab được focus lại để phát hiện kịp thời nếu tài khoản bị Admin khóa
  useEffect(() => {
    if (!token || !user) return

    const verifySessionStatus = async () => {
      try {
        const profile = await authService.getCurrentUser()
        if (profile.status === 'LOCKED') {
          logout()
          if (window.location.pathname !== '/login') {
            window.location.href = '/login?reason=account_locked'
          }
        }
      } catch (err: unknown) {
        const isLocked =
          err instanceof Error &&
          (err.message.toLowerCase().includes('tài khoản của bạn đã bị khóa') ||
            err.message.toLowerCase().includes('tạm ngưng hoạt động'))
        if (isLocked) {
          logout()
          if (window.location.pathname !== '/login') {
            window.location.href = '/login?reason=account_locked'
          }
        }
      }
    }

    const intervalId = setInterval(() => {
      void verifySessionStatus()
    }, 30000)

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void verifySessionStatus()
      }
    }

    window.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleVisibilityChange)

    return () => {
      clearInterval(intervalId)
      window.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleVisibilityChange)
    }
  }, [token, user, logout])

  const login = async (payload: LoginRequest): Promise<UserProfile> => {
    const data = await authService.login(payload)
    if (data.user?.status === 'LOCKED') {
      logout()
      throw new Error('Tài khoản của bạn đã bị khóa hoặc tạm ngưng hoạt động')
    }
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
    setUserSession,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
