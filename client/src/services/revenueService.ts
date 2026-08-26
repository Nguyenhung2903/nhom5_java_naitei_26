import { api } from '@/lib/api'
import type { ApiResponse } from '@/types/api'
import type {
  RevenueOverview,
  RevenueTimePoint,
  MovieRevenue,
  TheaterRevenue,
  AdminBookingDetail,
  RevenueFilterParams,
} from '@/types/revenue'

function unwrap<T>(response: ApiResponse<T>): T {
  if (response.data === undefined) {
    throw new Error(response.message || 'Không có dữ liệu phản hồi')
  }
  return response.data
}

function buildQuery(params?: RevenueFilterParams): string {
  if (!params) return ''
  const searchParams = new URLSearchParams()
  if (params.startDate) searchParams.set('startDate', params.startDate)
  if (params.endDate) searchParams.set('endDate', params.endDate)
  if (params.movieId) searchParams.set('movieId', params.movieId)
  if (params.theaterId) searchParams.set('theaterId', params.theaterId)
  if (params.groupBy) searchParams.set('groupBy', params.groupBy)
  if (params.search) searchParams.set('search', params.search)
  if (params.status) searchParams.set('status', params.status)
  if (params.limit !== undefined) searchParams.set('limit', String(params.limit))
  const qs = searchParams.toString()
  return qs ? `?${qs}` : ''
}

export const revenueService = {
  getOverview: async (params?: RevenueFilterParams): Promise<RevenueOverview> => {
    const res = await api.get<ApiResponse<RevenueOverview>>(`/admin/revenue/overview${buildQuery(params)}`)
    return unwrap(res)
  },

  getTimeSeries: async (params?: RevenueFilterParams): Promise<RevenueTimePoint[]> => {
    const res = await api.get<ApiResponse<RevenueTimePoint[]>>(`/admin/revenue/time-series${buildQuery(params)}`)
    return unwrap(res)
  },

  getRevenueByMovies: async (params?: RevenueFilterParams): Promise<MovieRevenue[]> => {
    const res = await api.get<ApiResponse<MovieRevenue[]>>(`/admin/revenue/by-movie${buildQuery(params)}`)
    return unwrap(res)
  },

  getRevenueByTheaters: async (params?: RevenueFilterParams): Promise<TheaterRevenue[]> => {
    const res = await api.get<ApiResponse<TheaterRevenue[]>>(`/admin/revenue/by-theater${buildQuery(params)}`)
    return unwrap(res)
  },

  getBookings: async (params?: RevenueFilterParams): Promise<AdminBookingDetail[]> => {
    const res = await api.get<ApiResponse<AdminBookingDetail[]>>(`/admin/revenue/bookings${buildQuery(params)}`)
    return unwrap(res)
  },
}

export default revenueService
