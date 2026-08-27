import { api } from '@/lib/api'
import type { ApiResponse } from '@/types/api'
import type { Genre, GenrePayload } from '@/types/genre'

function unwrap<T>(response: ApiResponse<T>): T {
  if (response.data === undefined) {
    throw new Error(response.message || 'Không có dữ liệu phản hồi')
  }
  return response.data
}

export const genreService = {
  getGenres: async (keyword?: string): Promise<Genre[]> => {
    const searchParams = new URLSearchParams()
    if (keyword && keyword.trim()) {
      searchParams.set('keyword', keyword.trim())
    }
    const query = searchParams.toString()
    return unwrap(await api.get<ApiResponse<Genre[]>>(`/genres${query ? `?${query}` : ''}`))
  },

  getGenreById: async (id: string): Promise<Genre> =>
    unwrap(await api.get<ApiResponse<Genre>>(`/genres/${id}`)),

  createGenre: async (payload: GenrePayload): Promise<Genre> =>
    unwrap(await api.post<ApiResponse<Genre>>('/genres', payload)),

  updateGenre: async (id: string, payload: GenrePayload): Promise<Genre> =>
    unwrap(await api.put<ApiResponse<Genre>>(`/genres/${id}`, payload)),

  deleteGenre: async (id: string): Promise<void> => {
    await api.delete<ApiResponse<void>>(`/genres/${id}`)
  },
}

export default genreService
