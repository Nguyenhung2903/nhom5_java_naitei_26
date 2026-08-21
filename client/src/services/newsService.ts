import { api } from '@/lib/api'
import type { ApiResponse } from '@/types/api'
import type { News, NewsPayload } from '@/types/news'

function unwrap<T>(response: ApiResponse<T>): T {
  if (response.data === undefined) {
    throw new Error(response.message || 'Không có dữ liệu phản hồi')
  }
  return response.data
}

export const newsService = {
  getNews: async (keyword?: string): Promise<News[]> => {
    const query = keyword ? `?keyword=${encodeURIComponent(keyword)}` : ''
    return unwrap(await api.get<ApiResponse<News[]>>(`/news${query}`))
  },

  getNewsById: async (id: string): Promise<News> =>
    unwrap(await api.get<ApiResponse<News>>(`/news/${id}`)),

  createNews: async (payload: NewsPayload): Promise<News> =>
    unwrap(await api.post<ApiResponse<News>>('/news', payload)),

  updateNews: async (id: string, payload: NewsPayload): Promise<News> =>
    unwrap(await api.put<ApiResponse<News>>(`/news/${id}`, payload)),

  deleteNews: async (id: string): Promise<void> => {
    await api.delete<ApiResponse<void>>(`/news/${id}`)
  },
}

export default newsService
