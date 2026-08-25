import type { SeatType } from './seat'

export type ShowtimeSeatStatus = 'AVAILABLE' | 'BOOKED' | 'HELD'

export interface ShowtimeSeat {
  id: string
  seatRow: string
  seatNumber: number
  seatType: SeatType
  price: number
  status: ShowtimeSeatStatus
  heldUntil: string | null
}

