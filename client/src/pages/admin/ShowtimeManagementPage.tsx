import { CalendarDays } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { AdminCrudPage } from '@/components/admin'
import { Button, DatePickerInput, FormField, Input, SearchToolbar, Select } from '@/components/ui'
import type { ColumnDef } from '@/components/ui/ResponsiveTable'
import { movieService } from '@/services/movieService'
import { roomService } from '@/services/roomService'
import { showtimeService } from '@/services/showtimeService'
import type { Movie } from '@/types/movie'
import type { Room } from '@/types/room'
import type { Showtime, ShowtimeFilters, ShowtimeRequest, ShowtimeStatus } from '@/types/showtime'

const initialForm: ShowtimeRequest = { movieId: '', roomId: '', startTime: '', status: 'OPEN' }
const columns: ColumnDef<Showtime>[] = [
  { key: 'movieTitle', header: 'Phim', render: (item) => <strong className="text-white">{item.movieTitle}</strong> },
  { key: 'theaterName', header: 'Rạp' },
  { key: 'roomName', header: 'Phòng' },
  { key: 'startTime', header: 'Bắt đầu', render: (item) => new Date(item.startTime).toLocaleString('vi-VN') },
  { key: 'endTime', header: 'Kết thúc', render: (item) => new Date(item.endTime).toLocaleString('vi-VN') },
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
  const [movies, setMovies] = useState<Movie[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [filters, setFilters] = useState<ShowtimeFilters>({})
  useEffect(() => {
    void Promise.all([movieService.getMovies(), roomService.getAll()])
      .then(([movieOptions, roomOptions]) => { setMovies(movieOptions); setRooms(roomOptions) })
      .catch(() => { setMovies([]); setRooms([]) })
  }, [])

  const filteredService = useMemo(() => ({
    ...showtimeService,
    getAll: () => showtimeService.getAll(filters),
  }), [filters])

  const theaters = [...new Map(rooms.map((room) => [room.theaterId, room.theaterName])).entries()]
  const updateFilter = <K extends keyof ShowtimeFilters>(key: K, value: ShowtimeFilters[K]) => {
    setFilters((current) => ({ ...current, [key]: value || undefined }))
  }

  return (
    <AdminCrudPage<Showtime, ShowtimeRequest>
      title="Quản lý suất chiếu"
      subtitle="Gán phim vào phòng và thiết lập khung giờ"
      icon={<CalendarDays className="h-6 w-6 text-[var(--rogym-teal)]" />}
      addLabel="Thêm suất chiếu"
      editLabel="Cập nhật suất chiếu"
      columns={columns}
      service={filteredService}
      initialForm={initialForm}
      toForm={(item) => ({
        movieId: item.movieId,
        roomId: item.roomId,
        startTime: item.startTime,
        status: item.status,
      })}
      toolbar={(
        <SearchToolbar variant="plain" layout="col" className="mb-4" actions={(
          <Button type="button" variant="secondary" onClick={() => setFilters({})}>Xóa bộ lọc</Button>
        )}>
          <div className="grid w-full grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-5">
            <FormField label="Phim">
              <Select value={filters.movieId || ''} onValueChange={(value) => updateFilter('movieId', value)} aria-label="Lọc theo phim">
                <option value="">Tất cả phim</option>
                {movies.map((movie) => <option key={movie.id} value={movie.id}>{movie.title}</option>)}
              </Select>
            </FormField>
            <FormField label="Rạp">
              <Select value={filters.theaterId || ''} onValueChange={(value) => updateFilter('theaterId', value)} aria-label="Lọc theo rạp">
                <option value="">Tất cả rạp</option>
                {theaters.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
              </Select>
            </FormField>
            <FormField label="Phòng">
              <Select value={filters.roomId || ''} onValueChange={(value) => updateFilter('roomId', value)} aria-label="Lọc theo phòng">
                <option value="">Tất cả phòng</option>
                {rooms.map((room) => <option key={room.id} value={room.id}>{room.name}</option>)}
              </Select>
            </FormField>
            <FormField label="Ngày chiếu">
              <DatePickerInput value={filters.date || ''} onChange={(value) => updateFilter('date', value)} aria-label="Lọc theo ngày chiếu" />
            </FormField>
            <FormField label="Trạng thái">
              <Select value={filters.status || ''} onValueChange={(value) => updateFilter('status', value as ShowtimeStatus || undefined)} aria-label="Lọc theo trạng thái">
                <option value="">Tất cả trạng thái</option>
                <option value="OPEN">Mở bán</option>
                <option value="CANCELLED">Đã hủy</option>
                <option value="FINISHED">Đã kết thúc</option>
              </Select>
            </FormField>
          </div>
        </SearchToolbar>
      )}
      getSearchText={(item) => `${item.movieTitle} ${item.theaterName} ${item.roomName} ${item.status}`}
      renderForm={(form, update) => {
        const previewMovie = movies.find((movie) => movie.id === form.movieId)
        const endTimePreview = previewMovie && form.startTime
          ? new Date(new Date(form.startTime).getTime() + previewMovie.duration * 60 * 1000).toLocaleString('vi-VN')
          : 'Tự tính sau khi chọn phim và giờ bắt đầu'
        return <>
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
            <FormField label="Kết thúc">
              <Input value={endTimePreview} readOnly disabled />
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
      }}
    />
  )
}
