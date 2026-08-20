import { api } from '@/lib/api'
import type { ApiResponse } from '@/types/api'
import type { Room, RoomRequest } from '@/types/room'

export const roomService = {
  getAll: async (): Promise<Room[]> => {
    const response = await api.get<ApiResponse<Room[]>>('/rooms')
    return response.data || []
  },
  create: async (payload: RoomRequest): Promise<Room> => {
    const response = await api.post<ApiResponse<Room>>('/rooms', payload)
    if (!response.data) throw new Error(response.message || 'Tạo phòng thất bại')
    return response.data
  },
  update: async (id: string, payload: RoomRequest): Promise<Room> => {
    const response = await api.put<ApiResponse<Room>>(`/rooms/${id}`, payload)
    if (!response.data) throw new Error(response.message || 'Cập nhật phòng thất bại')
    return response.data
  },
  delete: async (id: string): Promise<void> => {
    await api.delete<ApiResponse<void>>(`/rooms/${id}`)
  },
}
