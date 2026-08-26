import type { BadgeTone } from '@/components/ui'

export type ShowtimeStatus = 'OPEN' | 'CANCELLED' | 'FINISHED'

export const SHOWTIME_STATUS_CONFIG: Record<ShowtimeStatus, { label: string; tone: BadgeTone }> = {
  OPEN: { label: 'Mở bán', tone: 'success' },
  CANCELLED: { label: 'Đã hủy', tone: 'danger' },
  FINISHED: { label: 'Đã kết thúc', tone: 'muted' },
}

export interface Showtime {
  id: string
  movieId: string
  movieTitle: string
  roomId: string
  roomName: string
  theaterId: string
  theaterName: string
  startTime: string
  endTime: string
  status: ShowtimeStatus
}

export interface ShowtimeRequest {
  movieId: string
  roomId: string
  startTime: string
  status: ShowtimeStatus
}

export interface ShowtimeFilters {
  movieId?: string
  theaterId?: string
  roomId?: string
  date?: string
  status?: ShowtimeStatus
}
