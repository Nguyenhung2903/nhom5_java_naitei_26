import { CalendarDays } from 'lucide-react'
import { useEffect, useState } from 'react'
import { AdminCrudPage } from '@/components/admin'
import { FormField, Input, Select } from '@/components/ui'
import type { ColumnDef } from '@/components/ui/ResponsiveTable'
import { movieService } from '@/services/movieService'
import { roomService } from '@/services/roomService'
import { showtimeService } from '@/services/showtimeService'
import type { MovieOption } from '@/types/movie'
import type { Room } from '@/types/room'
import type { Showtime, ShowtimeRequest, ShowtimeStatus } from '@/types/showtime'

const initialForm: ShowtimeRequest = { movieId: '', roomId: '', startTime: '', endTime: '', status: 'OPEN' }
const columns: ColumnDef<Showtime>[] = [
  { key: 'movieTitle', header: 'Phim', render: (item) => <strong className="text-white">{item.movieTitle}</strong> },
  { key: 'theaterName', header: 'Rạp' },
  { key: 'roomName', header: 'Phòng' },
  { key: 'startTime', header: 'Bắt đầu', render: (item) => new Date(item.startTime).toLocaleString('vi-VN') },
  { key: 'status', header: 'Trạng thái' },
]

const toInputDateTime = (value?: string) => {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const pad = (n: number) => n.toString().padStart(2, '0')
  const year = date.getFullYear()
  const month = pad(date.getMonth() + 1)
  const day = pad(date.getDate())
  const hours = pad(date.getHours())
  const minutes = pad(date.getMinutes())
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

const toInstant = (value?: string) => {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toISOString()
}

export function ShowtimeManagementPage() {
  const [movies, setMovies] = useState<MovieOption[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  useEffect(() => {
    void Promise.all([movieService.getAll(), roomService.getAll()])
      .then(([movieOptions, roomOptions]) => { setMovies(movieOptions); setRooms(roomOptions) })
      .catch(() => { setMovies([]); setRooms([]) })
  }, [])

  return (
    <AdminCrudPage<Showtime, ShowtimeRequest>
      title="Quản lý suất chiếu"
      subtitle="Gán phim vào phòng và thiết lập khung giờ"
      icon={<CalendarDays className="h-6 w-6 text-[var(--rogym-teal)]" />}
      addLabel="Thêm suất chiếu"
      editLabel="Cập nhật suất chiếu"
      columns={columns}
      service={showtimeService}
      initialForm={initialForm}
      toForm={(item) => ({
        movieId: item.movieId,
        roomId: item.roomId,
        startTime: item.startTime,
        endTime: item.endTime,
        status: item.status,
      })}
      getSearchText={(item) => `${item.movieTitle} ${item.theaterName} ${item.roomName} ${item.status}`}
      searchPlaceholder="Tìm kiếm theo tên phim, phòng, rạp, trạng thái..."
      renderForm={(form, update) => (
        <>
          <FormField label="Phim" htmlFor="showtime-movie" required>
            <Select value={form.movieId} onValueChange={(value) => update('movieId', value)} required>
              <option value="">Chọn phim</option>
              {movies.map((movie) => <option key={movie.id} value={movie.id}>{movie.title}</option>)}
            </Select>
          </FormField>
          <FormField label="Phòng" htmlFor="showtime-room" required>
            <Select value={form.roomId} onValueChange={(value) => update('roomId', value)} required>
              <option value="">Chọn phòng</option>
              {rooms.map((room) => <option key={room.id} value={room.id}>{room.theaterName} - {room.name}</option>)}
            </Select>
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Bắt đầu" htmlFor="showtime-start" required>
              <Input id="showtime-start" type="datetime-local" value={toInputDateTime(form.startTime)} onChange={(event) => update('startTime', event.target.value ? toInstant(event.target.value) : '')} required />
            </FormField>
            <FormField label="Kết thúc" htmlFor="showtime-end" required>
              <Input id="showtime-end" type="datetime-local" value={toInputDateTime(form.endTime)} onChange={(event) => update('endTime', event.target.value ? toInstant(event.target.value) : '')} required />
            </FormField>
          </div>
          <FormField label="Trạng thái" htmlFor="showtime-status" required>
            <Select value={form.status} onValueChange={(value) => update('status', value as ShowtimeStatus)} required>
              <option value="OPEN">Mở bán</option>
              <option value="CANCELLED">Đã hủy</option>
              <option value="FINISHED">Đã kết thúc</option>
            </Select>
          </FormField>
        </>
      )}
    />
  )
}
