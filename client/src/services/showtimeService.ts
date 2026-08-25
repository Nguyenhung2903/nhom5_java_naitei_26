import { api } from '@/lib/api'
import type { ApiResponse } from '@/types/api'
import type { Showtime, ShowtimeFilters, ShowtimeRequest } from '@/types/showtime'

const toInstant = (val?: string) => {
  if (!val) return ''
  const date = new Date(val)
  return Number.isNaN(date.getTime()) ? val : date.toISOString()
}

const normalizePayload = (payload: ShowtimeRequest): ShowtimeRequest => ({
  ...payload,
  startTime: toInstant(payload.startTime),
})

export const showtimeService = {
  getAll: async (filters: ShowtimeFilters = {}): Promise<Showtime[]> => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value)
    })
    const query = params.toString()
    const response = await api.get<ApiResponse<Showtime[]>>(`/showtimes${query ? `?${query}` : ''}`)
    return response.data || []
  },
  getByMovieAndTheaterAndDate: async (
    movieId: string,
    theaterId: string,
    date: string,
  ): Promise<Showtime[]> => {
    const params = new URLSearchParams({ movieId, theaterId, date })
    const response = await api.get<ApiResponse<Showtime[]>>(`/showtimes?${params.toString()}`)
    return response.data || []
  },
  create: async (payload: ShowtimeRequest): Promise<Showtime> => {
    const response = await api.post<ApiResponse<Showtime>>('/showtimes', normalizePayload(payload))
    if (!response.data) throw new Error(response.message || 'Tạo suất chiếu thất bại')
    return response.data
  },
  update: async (id: string, payload: ShowtimeRequest): Promise<Showtime> => {
    const response = await api.put<ApiResponse<Showtime>>(`/showtimes/${id}`, normalizePayload(payload))
    if (!response.data) throw new Error(response.message || 'Cập nhật suất chiếu thất bại')
    return response.data
  },
  delete: async (id: string): Promise<void> => {
    await api.delete<ApiResponse<void>>(`/showtimes/${id}`)
  },
}
