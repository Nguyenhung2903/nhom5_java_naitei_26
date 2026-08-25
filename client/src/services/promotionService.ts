import { api } from '@/lib/api'
import type { ApiResponse } from '@/types/api'
import type { Promotion, PromotionPayload, PromotionStatus } from '@/types/promotion'

function unwrap<T>(response: ApiResponse<T>): T {
  if (response.data === undefined) {
    throw new Error(response.message || 'Không có dữ liệu phản hồi')
  }
  return response.data
}

export const promotionService = {
  getPromotions: async (params?: { keyword?: string; status?: PromotionStatus | '' }): Promise<Promotion[]> => {
    const searchParams = new URLSearchParams()
    if (params?.keyword) searchParams.set('keyword', params.keyword)
    if (params?.status) searchParams.set('status', params.status)
    const query = searchParams.toString()
    return unwrap(await api.get<ApiResponse<Promotion[]>>(`/promotions${query ? `?${query}` : ''}`))
  },

  getPromotionById: async (id: string): Promise<Promotion> =>
    unwrap(await api.get<ApiResponse<Promotion>>(`/promotions/${id}`)),

  validateCode: async (code: string): Promise<Promotion> =>
    unwrap(await api.get<ApiResponse<Promotion>>(`/promotions/validate?code=${encodeURIComponent(code)}`)),

  createPromotion: async (payload: PromotionPayload): Promise<Promotion> =>
    unwrap(await api.post<ApiResponse<Promotion>>('/promotions', payload)),

  updatePromotion: async (id: string, payload: PromotionPayload): Promise<Promotion> =>
    unwrap(await api.put<ApiResponse<Promotion>>(`/promotions/${id}`, payload)),

  deletePromotion: async (id: string): Promise<void> => {
    await api.delete<ApiResponse<void>>(`/promotions/${id}`)
  },
}

export default promotionService
