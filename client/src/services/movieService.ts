import { api } from '@/lib/api'
import type { ApiResponse } from '@/types/api'
import type { MovieOption } from '@/types/movie'

export const movieService = {
  getAll: async (): Promise<MovieOption[]> => {
    const response = await api.get<ApiResponse<MovieOption[]>>('/movies')
    return response.data || []
  },
}
