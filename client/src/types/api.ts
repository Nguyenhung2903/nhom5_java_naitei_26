export interface ApiResponse<T = unknown> {
  statusCode: number
  message: string
  data?: T
  timestamp?: string
}

export interface ApiErrorResponse {
  statusCode?: number
  message?: string
  errors?: Record<string, string> | string[]
  timestamp?: string
}
