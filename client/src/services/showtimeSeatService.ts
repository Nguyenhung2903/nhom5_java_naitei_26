import { api } from '@/lib/api'
import type { ShowtimeSeat } from '@/types/showtimeSeat'

export const showtimeSeatService = {
  getSeats: async (showtimeId: string): Promise<ShowtimeSeat[]> => {
    // Controller returns List<ShowtimeSeatResponse> directly, not wrapped in ApiResponse
    return await api.get<ShowtimeSeat[]>(`/showtimes/${showtimeId}/seats`)
  },
  holdSeats: async (showtimeId: string, seatIds: string[]): Promise<void> => {
    await api.post(`/showtimes/${showtimeId}/seats/hold`, { seatIds })
  },
}
