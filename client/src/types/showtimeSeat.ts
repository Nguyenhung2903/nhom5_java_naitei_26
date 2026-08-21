export interface ShowtimeSeat {
  id: string
  seatRow: string
  seatNumber: number
  seatType: string
  price: number
  status: 'AVAILABLE' | 'SOLD' | 'HELD'
  heldUntil: string | null
}
