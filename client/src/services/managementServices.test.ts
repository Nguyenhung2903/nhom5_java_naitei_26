import { afterEach, describe, expect, it, vi } from 'vitest'
import { api } from '../lib/api'
import { roomService } from './roomService'
import { seatService } from './seatService'
import { showtimeService } from './showtimeService'
import { theaterService } from './theaterService'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('management services', () => {
  it('loads theaters through the shared API client', async () => {
    const theater = { id: 'theater-1', name: 'CGV', address: 'Hanoi', phone: null, latitude: null, longitude: null }
    vi.spyOn(api, 'get').mockResolvedValue({ data: [theater] } as never)

    await expect(theaterService.getAll()).resolves.toEqual([theater])
    expect(api.get).toHaveBeenCalledWith('/theaters')
  })

  it('loads rooms and seats through their domain endpoints', async () => {
    const get = vi.spyOn(api, 'get')
      .mockResolvedValueOnce({ data: [{ id: 'room-1', theaterId: 'theater-1', theaterName: 'CGV', name: 'Room 1' }] } as never)
      .mockResolvedValueOnce({ data: [{ id: 'seat-1', roomId: 'room-1', roomName: 'Room 1', theaterId: 'theater-1', theaterName: 'CGV', seatRow: 'A', seatNumber: 1, seatType: 'NORMAL' }] } as never)

    await roomService.getAll()
    await seatService.getAll()

    expect(get).toHaveBeenNthCalledWith(1, '/rooms')
    expect(get).toHaveBeenNthCalledWith(2, '/seats')
  })

  it('loads showtimes through the shared API client', async () => {
    const showtime = { id: 'showtime-1', movieId: 'movie-1', movieTitle: 'Movie', roomId: 'room-1', roomName: 'Room 1', theaterId: 'theater-1', theaterName: 'CGV', startTime: '2026-08-20T10:00:00Z', endTime: '2026-08-20T12:00:00Z', status: 'OPEN' }
    vi.spyOn(api, 'get').mockResolvedValue({ data: [showtime] } as never)

    await expect(showtimeService.getAll()).resolves.toEqual([showtime])
    expect(api.get).toHaveBeenCalledWith('/showtimes')
  })
})
