import { useEffect, useState, useCallback } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { roomService } from '@/services/roomService'
import { seatService } from '@/services/seatService'
import { theaterService } from '@/services/theaterService'
import type { Room, RoomRequest } from '@/types/room'
import type { Seat } from '@/types/seat'
import type { Theater } from '@/types/theater'
import { AdminInteractiveSeatMap } from '@/components/seat'
import {
  PageLoader,
  Alert,
  AlertDescription,
  Button,
  FormField,
  Input,
  Select,
} from '@/components/ui'
import {
  ArrowLeft,
  DoorOpen,
  Armchair,
  Sparkles,
  Heart,
  Save,
  CheckCircle2,
} from 'lucide-react'


export function RoomDetailManagementPage() {
  const { theaterId, roomId } = useParams<{ theaterId?: string; roomId: string }>()
  const navigate = useNavigate()

  const [room, setRoom] = useState<Room | null>(null)
  const [theaters, setTheaters] = useState<Theater[]>([])
  const [seats, setSeats] = useState<Seat[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  // Form chỉnh sửa thông tin phòng
  const [roomForm, setRoomForm] = useState<RoomRequest>({
    name: '',
    theaterId: '',
  })
  const [savingRoom, setSavingRoom] = useState(false)

  const parentTheaterUrl = room?.theaterId ? `/admin/theaters/${room.theaterId}` : (theaterId ? `/admin/theaters/${theaterId}` : '/admin/theaters')

  const loadData = useCallback(async () => {
    if (!roomId) return
    setLoading(true)
    setError(null)
    try {
      const [roomData, seatsData, theatersData] = await Promise.all([
        roomService.getById(roomId),
        seatService.getByRoomId(roomId),
        theaterService.getAll().catch(() => []),
      ])
      setRoom(roomData)
      setSeats(seatsData)
      setTheaters(theatersData)
      setRoomForm({
        name: roomData.name,
        theaterId: roomData.theaterId,
      })
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Không thể tải thông tin phòng chiếu')
    } finally {
      setLoading(false)
    }
  }, [roomId])

  useEffect(() => {
    void loadData()
  }, [loadData])

  const handleRefreshSeats = async () => {
    if (!roomId) return
    try {
      const seatsData = await seatService.getByRoomId(roomId)
      setSeats(seatsData)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Không thể cập nhật danh sách ghế')
    }
  }

  const handleSaveRoomInfo = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!roomId || !roomForm.name.trim() || !roomForm.theaterId) return

    setSavingRoom(true)
    setSuccessMsg(null)
    setError(null)
    try {
      const updated = await roomService.update(roomId, roomForm)
      setRoom(updated)
      setSuccessMsg('Đã cập nhật thông tin phòng chiếu thành công!')
      setTimeout(() => setSuccessMsg(null), 3000)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Không thể lưu thay đổi phòng chiếu')
    } finally {
      setSavingRoom(false)
    }
  }

  if (loading && !room) return <PageLoader ariaLabel="Đang tải thông tin phòng chiếu..." />

  if (!room && !loading) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center space-y-4">
        <p className="text-red-400 font-semibold">{error || 'Không tìm thấy phòng chiếu'}</p>
        <Button variant="primary" onClick={() => navigate(parentTheaterUrl)}>
          Quay lại cụm rạp
        </Button>
      </div>
    )
  }

  const normalSeats = seats.filter((s) => s.seatType === 'NORMAL')
  const vipSeats = seats.filter((s) => s.seatType === 'VIP')
  const coupleSeats = seats.filter((s) => s.seatType === 'COUPLE')

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--rogym-border-subtle)] pb-4">
        <div className="flex items-center gap-3">
          <Link
            to={parentTheaterUrl}
            className="p-2 rounded-xl bg-[var(--rogym-bg-card)] border border-[var(--rogym-border-subtle)] text-[var(--rogym-text-muted)] hover:text-white hover:border-[var(--rogym-teal)] transition-all"
            title="Quay lại cụm rạp"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2 text-xs text-[var(--rogym-text-muted)] flex-wrap">
              <Link to="/admin/theaters" className="hover:underline hover:text-white transition-colors">
                Quản lý Cụm Rạp & Phòng Chiếu
              </Link>
              <span>/</span>
              <Link to={parentTheaterUrl} className="hover:underline hover:text-white transition-colors">
                {room?.theaterName || 'Cụm rạp'}
              </Link>
              <span>/</span>
              <span className="text-white font-medium">{room?.name}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-display uppercase tracking-wide text-white mt-0.5">
              {room?.name} <span className="text-[var(--rogym-text-muted)] text-xl font-normal">({room?.theaterName})</span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => navigate(parentTheaterUrl)} size="sm">
            Quản lý phòng rạp
          </Button>
        </div>
      </div>

      {error && (
        <Alert tone="error">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {successMsg && (
        <Alert tone="success" icon={<CheckCircle2 className="w-4 h-4" />}>
          <AlertDescription>{successMsg}</AlertDescription>
        </Alert>
      )}

      {/* Khối 1: Thông tin phòng chiếu */}
      <div className="p-6 rounded-2xl bg-[var(--rogym-bg-card)] border border-[var(--rogym-border-subtle)] shadow-lg space-y-5">
        <div className="flex items-center gap-2.5 text-white font-bold text-base border-b border-white/5 pb-3">
          <DoorOpen className="w-5 h-5 text-[var(--rogym-teal)]" />
          <span>Thông tin Cơ bản của Phòng Chiếu</span>
        </div>

        <form onSubmit={handleSaveRoomInfo} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <FormField label="Rạp trực thuộc" htmlFor="room-theater-select" required>
            <Select
              value={roomForm.theaterId}
              onValueChange={(val) => setRoomForm((prev) => ({ ...prev, theaterId: val }))}
              required
            >
              <option value="">Chọn rạp</option>
              {theaters.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </Select>
          </FormField>

          <FormField label="Tên phòng chiếu" htmlFor="room-name-input" required>
            <Input
              id="room-name-input"
              value={roomForm.name}
              onChange={(e) => setRoomForm((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="VD: Phòng 01, Cinema VIP..."
              required
            />
          </FormField>

          <Button
            type="submit"
            variant="primary"
            loading={savingRoom}
            className="flex items-center justify-center gap-2 h-10"
          >
            <Save className="w-4 h-4" />
            <span>Lưu Thông Tin Phòng</span>
          </Button>
        </form>
      </div>

      {/* Khối 2: Thống kê cơ cấu ghế */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[var(--rogym-bg-elevated)] border border-[var(--rogym-border-subtle)] flex items-center gap-3.5 shadow-md">
          <div className="p-3 rounded-xl bg-[var(--rogym-green)]/15 text-[var(--rogym-green)]">
            <Armchair className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-[var(--rogym-text-muted)]">Tổng số ghế</p>
            <p className="text-xl font-bold text-white">{seats.length}</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[var(--rogym-bg-elevated)] border border-[var(--rogym-border-subtle)] flex items-center gap-3.5 shadow-md">
          <div className="p-3 rounded-xl bg-emerald-500/15 text-emerald-400">
            <Armchair className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-[var(--rogym-text-muted)]">Ghế thường (A-B)</p>
            <p className="text-xl font-bold text-emerald-300">{normalSeats.length}</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[var(--rogym-bg-elevated)] border border-[var(--rogym-border-subtle)] flex items-center gap-3.5 shadow-md">
          <div className="p-3 rounded-xl bg-amber-500/15 text-amber-400">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-[var(--rogym-text-muted)]">Ghế VIP (C-D)</p>
            <p className="text-xl font-bold text-amber-300">{vipSeats.length}</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[var(--rogym-bg-elevated)] border border-[var(--rogym-border-subtle)] flex items-center gap-3.5 shadow-md">
          <div className="p-3 rounded-xl bg-rose-500/15 text-rose-400">
            <Heart className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-[var(--rogym-text-muted)]">Ghế đôi (E)</p>
            <p className="text-xl font-bold text-rose-300">
              {coupleSeats.length} ({coupleSeats.length / 2} cặp)
            </p>
          </div>
        </div>
      </div>

      {/* Khối 3: Sơ đồ ghế tương tác & chỉnh sửa */}
      {room && (
        <AdminInteractiveSeatMap
          roomId={room.id}
          roomName={room.name}
          theaterName={room.theaterName}
          seats={seats}
          onRefresh={handleRefreshSeats}
        />
      )}
    </div>
  )
}

export default RoomDetailManagementPage

