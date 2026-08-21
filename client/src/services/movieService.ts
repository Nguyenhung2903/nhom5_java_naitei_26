import { api } from '@/lib/api'
import type { ApiResponse } from '@/types/api'
import type { Movie, MovieOption, MoviePayload, MovieStatus } from '@/types/movie'

function unwrap<T>(response: ApiResponse<T>): T {
  if (response.data === undefined) {
    throw new Error(response.message || 'Không có dữ liệu phản hồi')
  }
  return response.data
}

export const movieService = {
  getAll: async (): Promise<MovieOption[]> => {
    const response = await api.get<ApiResponse<MovieOption[]>>('/movies')
    return response.data || []
  },

  getMovies: async (params?: { keyword?: string; status?: MovieStatus | '' }): Promise<Movie[]> => {
    const searchParams = new URLSearchParams()
    if (params?.keyword) searchParams.set('keyword', params.keyword)
    if (params?.status) searchParams.set('status', params.status)
    const query = searchParams.toString()
    return unwrap(await api.get<ApiResponse<Movie[]>>(`/movies${query ? `?${query}` : ''}`))
  },

  getMovieById: async (id: string): Promise<Movie> =>
    unwrap(await api.get<ApiResponse<Movie>>(`/movies/${id}`)),

  createMovie: async (payload: MoviePayload): Promise<Movie> =>
    unwrap(await api.post<ApiResponse<Movie>>('/movies', payload)),

  updateMovie: async (id: string, payload: MoviePayload): Promise<Movie> =>
    unwrap(await api.put<ApiResponse<Movie>>(`/movies/${id}`, payload)),

  deleteMovie: async (id: string): Promise<void> => {
    await api.delete<ApiResponse<void>>(`/movies/${id}`)
  },
}

export default movieService
