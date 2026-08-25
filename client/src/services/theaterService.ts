import { api } from '@/lib/api'
import type { ApiResponse } from '@/types/api'
import type { Theater, TheaterRequest } from '@/types/theater'

export const theaterService = {
  getAll: async (): Promise<Theater[]> => {
    const response = await api.get<ApiResponse<Theater[]>>('/theaters')
    return response.data || []
  },
  getById: async (id: string): Promise<Theater> => {
    const response = await api.get<ApiResponse<Theater>>(`/theaters/${id}`)
    if (!response.data) throw new Error(response.message || 'Không tìm thấy thông tin rạp')
    return response.data
  },
  getByMovieId: async (movieId: string): Promise<Theater[]> => {
    const response = await api.get<ApiResponse<Theater[]>>(`/theaters?movieId=${encodeURIComponent(movieId)}`)
    return response.data || []
  },
  create: async (payload: TheaterRequest): Promise<Theater> => {
    const response = await api.post<ApiResponse<Theater>>('/theaters', payload)
    if (!response.data) throw new Error(response.message || 'Tạo rạp thất bại')
    return response.data
  },
  update: async (id: string, payload: TheaterRequest): Promise<Theater> => {
    const response = await api.put<ApiResponse<Theater>>(`/theaters/${id}`, payload)
    if (!response.data) throw new Error(response.message || 'Cập nhật rạp thất bại')
    return response.data
  },
  delete: async (id: string): Promise<void> => {
    await api.delete<ApiResponse<void>>(`/theaters/${id}`)
  },
}
