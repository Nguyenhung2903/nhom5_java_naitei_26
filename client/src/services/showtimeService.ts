import { api } from '@/lib/api'
import type { ApiResponse } from '@/types/api'
import type { Showtime, ShowtimeRequest } from '@/types/showtime'

export const showtimeService = {
  getAll: async (): Promise<Showtime[]> => {
    const response = await api.get<ApiResponse<Showtime[]>>('/showtimes')
    return response.data || []
  },
  create: async (payload: ShowtimeRequest): Promise<Showtime> => {
    const response = await api.post<ApiResponse<Showtime>>('/showtimes', payload)
    if (!response.data) throw new Error(response.message || 'Tạo suất chiếu thất bại')
    return response.data
  },
  update: async (id: string, payload: ShowtimeRequest): Promise<Showtime> => {
    const response = await api.put<ApiResponse<Showtime>>(`/showtimes/${id}`, payload)
    if (!response.data) throw new Error(response.message || 'Cập nhật suất chiếu thất bại')
    return response.data
  },
  delete: async (id: string): Promise<void> => {
    await api.delete<ApiResponse<void>>(`/showtimes/${id}`)
  },
}
