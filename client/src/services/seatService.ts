import { api } from '@/lib/api'
import type { ApiResponse } from '@/types/api'
import type { Seat, SeatRequest, CreateRowSeatRequest } from '@/types/seat'

export const seatService = {
  getAll: async (): Promise<Seat[]> => {
    const response = await api.get<ApiResponse<Seat[]>>('/seats')
    return response.data || []
  },
  getByRoomId: async (roomId: string): Promise<Seat[]> => {
    const response = await api.get<ApiResponse<Seat[]>>(`/seats/room/${roomId}`)
    return response.data || []
  },

  create: async (payload: SeatRequest): Promise<Seat> => {
    const response = await api.post<ApiResponse<Seat>>('/seats', payload)
    if (!response.data) throw new Error(response.message || 'Tạo ghế thất bại')
    return response.data
  },
  createRow: async (payload: CreateRowSeatRequest): Promise<Seat[]> => {
    const response = await api.post<ApiResponse<Seat[]>>('/seats/batch-row', payload)
    if (!response.data) throw new Error(response.message || 'Tạo hàng ghế thất bại')
    return response.data
  },
  update: async (id: string, payload: SeatRequest): Promise<Seat> => {
    const response = await api.put<ApiResponse<Seat>>(`/seats/${id}`, payload)
    if (!response.data) throw new Error(response.message || 'Cập nhật ghế thất bại')
    return response.data
  },
  updateBatchType: async (seatIds: string[], seatType: Seat['seatType']): Promise<void> => {
    await api.patch<ApiResponse<void>>('/seats/batch-type', { seatIds, seatType })
  },
  delete: async (id: string): Promise<void> => {
    await api.delete<ApiResponse<void>>(`/seats/${id}`)
  },
  deleteBatch: async (seatIds: string[]): Promise<void> => {
    await api.post<ApiResponse<void>>('/seats/batch-delete', { seatIds })
  },
}

