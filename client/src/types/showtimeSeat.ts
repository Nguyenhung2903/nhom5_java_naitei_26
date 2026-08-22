export interface ShowtimeSeat {
  id: string
  seatRow: string
  seatNumber: number
  seatType: string
  price: number
  status: 'AVAILABLE' | 'BOOKED' | 'HELD'
  heldUntil: string | null
}
