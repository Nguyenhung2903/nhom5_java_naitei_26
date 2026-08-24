/**
 * Cấu hình HTTP Client kết nối tới Backend Spring Boot API
 * Hỗ trợ CORS, tự động đính kèm JWT Bearer token và chuẩn hóa lỗi trả về.
 */

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  'http://localhost:8080/api'

export class ApiError extends Error {
  status: number
  statusText: string
  data?: unknown
  errors?: Record<string, string> | string[]

  constructor(status: number, statusText: string, data?: unknown, message?: string) {
    super(message || `API Error ${status}: ${statusText}`)
    this.name = 'ApiError'
    this.status = status
    this.statusText = statusText
    this.data = data

    if (data && typeof data === 'object' && 'errors' in data) {
      this.errors = (data as { errors: Record<string, string> | string[] }).errors
    }
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`

  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  }

  // Tự động gắn Bearer Token nếu có trong localStorage
  const token = localStorage.getItem('access_token')
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`
  }

  const config: RequestInit = {
    ...options,
    credentials: 'include',
    headers: {
      ...defaultHeaders,
      ...((options.headers as Record<string, string>) || {}),
    },
  }

  let response: Response
  try {
    response = await fetch(url, config)
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'TypeError') {
      throw new ApiError(
        0,
        'Network Error',
        null,
        `Không thể kết nối đến máy chủ Backend (${API_BASE_URL}). Vui lòng đảm bảo Spring Boot server đã được khởi động trên cổng 8080.`
      )
    }
    throw err
  }

  if (!response.ok) {
    let errorData: unknown
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`
    try {
      errorData = await response.json()
      if (errorData && typeof errorData === 'object' && 'message' in errorData) {
        errorMessage = String((errorData as { message: unknown }).message)
      }
    } catch {
      errorData = await response.text()
    }
    throw new ApiError(response.status, response.statusText, errorData, errorMessage)
  }

  if (response.status === 204) {
    return {} as T
  }

  return response.json()
}

export const api = {
  get: <T>(endpoint: string, options?: RequestInit) =>
    request<T>(endpoint, { ...options, method: 'GET' }),

  post: <T>(endpoint: string, body?: unknown, options?: RequestInit) =>
    request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),

  put: <T>(endpoint: string, body?: unknown, options?: RequestInit) =>
    request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),

  patch: <T>(endpoint: string, body?: unknown, options?: RequestInit) =>
    request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),

  delete: <T>(endpoint: string, options?: RequestInit) =>
    request<T>(endpoint, { ...options, method: 'DELETE' }),
}

export default api
