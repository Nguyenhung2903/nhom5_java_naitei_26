export type SeatType = 'NORMAL' | 'VIP' | 'COUPLE'

export interface Seat {
  id: string
  roomId: string
  roomName: string
  theaterId: string
  theaterName: string
  seatRow: string
  seatNumber: number
  seatType: SeatType
}

export interface SeatRequest {
  roomId: string
  seatRow: string
  seatNumber: number
  seatType: SeatType
}
