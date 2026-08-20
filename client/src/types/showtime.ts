export type ShowtimeStatus = 'OPEN' | 'CANCELLED' | 'FINISHED'

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
  endTime: string
  status: ShowtimeStatus
}
