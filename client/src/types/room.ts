export interface Room {
  id: string
  theaterId: string
  theaterName: string
  name: string
}

export interface RoomRequest {
  theaterId: string
  name: string
}
