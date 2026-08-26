import { useEffect, useState, useCallback, useMemo } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { theaterService } from '@/services/theaterService'
import { roomService } from '@/services/roomService'
import { seatService } from '@/services/seatService'
import type { Theater, TheaterRequest } from '@/types/theater'
import type { Room, RoomRequest } from '@/types/room'
import {
  PageLoader,
  Alert,
  AlertDescription,
  Badge,
  Button,
  FormField,
  Input,
  Modal,
  ConfirmDialog,
  ResponsiveTable,
} from '@/components/ui'
import type { ColumnDef } from '@/components/ui/ResponsiveTable'
import {
  ArrowLeft,
  Building2,
  DoorOpen,
  Save,
  Plus,
  Edit2,
  Trash2,
  Armchair,
  CheckCircle2,
  Settings,
  Sparkles,
  TrendingUp,
} from 'lucide-react'

export function TheaterDetailManagementPage() {
  const { theaterId } = useParams<{ theaterId: string }>()
  const navigate = useNavigate()

  const [theater, setTheater] = useState<Theater | null>(null)
  const [rooms, setRooms] = useState<Room[]>([])
  const [roomSeatCounts, setRoomSeatCounts] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  // Form chỉnh sửa thông tin rạp
  const [theaterForm, setTheaterForm] = useState<TheaterRequest>({
    name: '',
    address: '',
    phone: '',
  })
  const [savingTheater, setSavingTheater] = useState(false)

  // Modal Thêm / Sửa Phòng Chiếu
  const [roomModalOpen, setRoomModalOpen] = useState(false)
  const [editingRoom, setEditingRoom] = useState<Room | null>(null)
  const [roomForm, setRoomForm] = useState<{ name: string }>({ name: '' })
  const [savingRoom, setSavingRoom] = useState(false)

  // Hộp thoại xác nhận xóa phòng
  const [deletingRoom, setDeletingRoom] = useState<Room | null>(null)
  const [isDeletingRoom, setIsDeletingRoom] = useState(false)

  const loadData = useCallback(async () => {
    if (!theaterId) return
    setLoading(true)
    setError(null)
    try {
      const [theaterData, allRooms] = await Promise.all([
        theaterService.getById(theaterId),
        roomService.getAll(),
      ])

      setTheater(theaterData)
      setTheaterForm({
        name: theaterData.name,
        address: theaterData.address,
        phone: theaterData.phone || '',
      })

      const theaterRooms = allRooms.filter((r) => r.theaterId === theaterId)
      setRooms(theaterRooms)

      // Lấy số lượng ghế của từng phòng
      const counts: Record<string, number> = {}
      await Promise.all(
        theaterRooms.map(async (r) => {
          try {
            const seats = await seatService.getByRoomId(r.id)
            counts[r.id] = seats.length
          } catch {
            counts[r.id] = 50 // Mặc định 50 ghế chuẩn
          }
        })
      )
      setRoomSeatCounts(counts)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Không thể tải thông tin cụm rạp')
    } finally {
      setLoading(false)
    }
  }, [theaterId])

  useEffect(() => {
    void loadData()
  }, [loadData])

  const totalSeats = useMemo(() => {
    return Object.values(roomSeatCounts).reduce((acc, count) => acc + count, 0)
  }, [roomSeatCounts])

  const handleSaveTheaterInfo = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!theaterId || !theaterForm.name.trim() || !theaterForm.address.trim()) return

    setSavingTheater(true)
    setSuccessMsg(null)
    setError(null)
    try {
      const updated = await theaterService.update(theaterId, theaterForm)
      setTheater(updated)
      setSuccessMsg('Đã cập nhật thông tin cụm rạp thành công!')
      setTimeout(() => setSuccessMsg(null), 3000)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Không thể lưu thay đổi cụm rạp')
    } finally {
      setSavingTheater(false)
    }
  }

  const handleOpenAddRoomModal = () => {
    setEditingRoom(null)
    setRoomForm({ name: '' })
    setRoomModalOpen(true)
  }

  const handleOpenEditRoomModal = (room: Room) => {
    setEditingRoom(room)
    setRoomForm({ name: room.name })
    setRoomModalOpen(true)
  }

  const handleSaveRoom = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!theaterId || !roomForm.name.trim()) return

    setSavingRoom(true)
    setError(null)
    try {
      if (editingRoom) {
        // Cập nhật tên phòng
        const payload: RoomRequest = {
          theaterId,
          name: roomForm.name.trim(),
        }
        await roomService.update(editingRoom.id, payload)
        setSuccessMsg(`Đã đổi tên phòng thành "${roomForm.name.trim()}"!`)
      } else {
        // Thêm phòng mới
        const payload: RoomRequest = {
          theaterId,
          name: roomForm.name.trim(),
        }
        const newRoom = await roomService.create(payload)
        setSuccessMsg(`Đã tạo mới phòng "${newRoom.name}" và tự động sinh 50 ghế chuẩn!`)
      }
      setRoomModalOpen(false)
      setTimeout(() => setSuccessMsg(null), 3500)
      await loadData()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Không thể lưu thông tin phòng chiếu')
    } finally {
      setSavingRoom(false)
    }
  }

  const handleConfirmDeleteRoom = async () => {
    if (!deletingRoom) return
    setIsDeletingRoom(true)
    setError(null)
    try {
      await roomService.delete(deletingRoom.id)
      setSuccessMsg(`Đã xóa phòng "${deletingRoom.name}" khỏi cụm rạp!`)
      setTimeout(() => setSuccessMsg(null), 3000)
      setDeletingRoom(null)
      await loadData()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Không thể xóa phòng chiếu')
    } finally {
      setIsDeletingRoom(false)
    }
  }

  const roomColumns: ColumnDef<Room>[] = [
    {
      key: 'name',
      header: 'Tên phòng chiếu',
      render: (item) => (
        <div className="flex items-center gap-2.5">
          <span className="p-2 rounded-lg bg-[var(--rogym-teal)]/15 text-[var(--rogym-teal)]">
            <DoorOpen className="w-4 h-4" />
          </span>
          <span className="font-bold text-white text-sm">{item.name}</span>
        </div>
      ),
    },
    {
      key: 'seats',
      header: 'Số lượng ghế',
      render: (item) => {
        const count = roomSeatCounts[item.id] ?? 50
        return (
          <Badge tone="accent" size="sm">
            <span className="inline-flex items-center gap-1">
              <Armchair className="w-3.5 h-3.5" />
              {count} ghế chuẩn
            </span>
          </Badge>
        )
      },
    },
    {
      key: 'actions',
      header: 'Thao tác & Cấu hình',
      align: 'right',
      render: (item) => (
        <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate(`/admin/theaters/${theaterId}/rooms/${item.id}`)}
            className="flex items-center gap-1.5"
            title="Xem chi tiết & Quản lý sơ đồ ghế"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Sơ đồ ghế</span>
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleOpenEditRoomModal(item)}
            title="Đổi tên phòng"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => setDeletingRoom(item)}
            className="text-red-400 hover:text-red-300 hover:bg-red-500/10 border-red-500/20"
            title="Xóa phòng chiếu"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      ),
    },
  ]

  if (loading && !theater) return <PageLoader ariaLabel="Đang tải dữ liệu cụm rạp..." />

  if (!theater && !loading) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center space-y-4">
        <p className="text-red-400 font-semibold">{error || 'Không tìm thấy cụm rạp yêu cầu'}</p>
        <Button variant="primary" onClick={() => navigate('/admin/theaters')}>
          Quay lại danh sách cụm rạp
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--rogym-border-subtle)] pb-4">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/theaters"
            className="p-2.5 rounded-xl bg-[var(--rogym-bg-card)] border border-[var(--rogym-border-subtle)] text-[var(--rogym-text-muted)] hover:text-white hover:border-[var(--rogym-green)] transition-all"
            title="Quay lại danh sách cụm rạp"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2 text-xs text-[var(--rogym-text-muted)]">
              <Link to="/admin/theaters" className="hover:underline hover:text-white transition-colors">
                Quản lý Cụm Rạp & Phòng Chiếu
              </Link>
              <span>/</span>
              <span className="text-white font-medium">{theater?.name}</span>
            </div>
            <div className="flex items-center gap-3 mt-1">
              <h1 className="text-2xl sm:text-3xl font-bold font-display uppercase tracking-wide text-white">
                {theater?.name}
              </h1>
              <Badge tone="accent" size="sm">
                {rooms.length} Phòng chiếu
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link to={`/admin/revenue?theaterId=${theaterId}`}>
            <Button variant="secondary" size="sm" leftIcon={<TrendingUp className="w-4 h-4 text-[var(--rogym-teal)]" />}>
              Doanh thu rạp
            </Button>
          </Link>
          <Button variant="secondary" onClick={() => navigate('/admin/theaters')} size="sm">
            Danh sách rạp
          </Button>
          <Button
            variant="primary"
            onClick={handleOpenAddRoomModal}
            size="sm"
            className="flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm phòng chiếu</span>
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

      {/* Metric Cards - Thống kê nhanh */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-[var(--rogym-bg-elevated)] border border-[var(--rogym-border-subtle)] flex items-center gap-4 shadow-md">
          <div className="p-3.5 rounded-xl bg-[var(--rogym-green)]/15 text-[var(--rogym-green)] border border-[var(--rogym-green)]/20">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-[var(--rogym-text-muted)] uppercase tracking-wider font-semibold">
              Cụm Rạp
            </p>
            <p className="text-lg font-bold text-white line-clamp-1">{theater?.name}</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[var(--rogym-bg-elevated)] border border-[var(--rogym-border-subtle)] flex items-center gap-4 shadow-md">
          <div className="p-3.5 rounded-xl bg-[var(--rogym-teal)]/15 text-[var(--rogym-teal)] border border-[var(--rogym-teal)]/20">
            <DoorOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-[var(--rogym-text-muted)] uppercase tracking-wider font-semibold">
              Tổng Phòng Chiếu
            </p>
            <p className="text-2xl font-bold text-[var(--rogym-teal)]">{rooms.length} phòng</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[var(--rogym-bg-elevated)] border border-[var(--rogym-border-subtle)] flex items-center gap-4 shadow-md">
          <div className="p-3.5 rounded-xl bg-[var(--rogym-green)]/15 text-[var(--rogym-green)] border border-[var(--rogym-green)]/20">
            <Armchair className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-[var(--rogym-text-muted)] uppercase tracking-wider font-semibold">
              Tổng Số Ghế Toàn Rạp
            </p>
            <p className="text-2xl font-bold text-[var(--rogym-green)]">{totalSeats} ghế</p>
          </div>
        </div>
      </div>

      {/* Khối 1: Thông tin Cụm Rạp */}
      <div className="p-6 rounded-2xl bg-[var(--rogym-bg-card)] border border-[var(--rogym-border-subtle)] shadow-lg space-y-5">
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <div className="flex items-center gap-2.5 text-white font-bold text-base">
            <Building2 className="w-5 h-5 text-[var(--rogym-green)]" />
            <span>Thông Tin Cụm Rạp</span>
          </div>
          <span className="text-xs text-[var(--rogym-text-muted)]">
            Cập nhật tên, địa chỉ và số điện thoại
          </span>
        </div>

        <form onSubmit={handleSaveTheaterInfo} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField label="Tên cụm rạp" htmlFor="theater-name-input" required>
              <Input
                id="theater-name-input"
                value={theaterForm.name}
                onChange={(e) => setTheaterForm((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="VD: CinemaNest Landmark 81"
                required
              />
            </FormField>

            <FormField label="Địa chỉ" htmlFor="theater-address-input" required>
              <div className="relative">
                <Input
                  id="theater-address-input"
                  value={theaterForm.address}
                  onChange={(e) => setTheaterForm((prev) => ({ ...prev, address: e.target.value }))}
                  placeholder="VD: 720A Điện Biên Phủ, P. 22, Bình Thạnh"
                  required
                />
              </div>
            </FormField>

            <FormField label="Số điện thoại" htmlFor="theater-phone-input">
              <Input
                id="theater-phone-input"
                value={theaterForm.phone || ''}
                onChange={(e) => setTheaterForm((prev) => ({ ...prev, phone: e.target.value }))}
                placeholder="VD: 1900 1234"
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <Button
              type="submit"
              variant="primary"
              loading={savingTheater}
              className="flex items-center justify-center gap-2 h-10 w-full"
            >
              <Save className="w-4 h-4" />
              <span>Lưu Thông Tin Rạp</span>
            </Button>
          </div>
        </form>
      </div>

      {/* Khối 2: Danh sách Phòng Chiếu Trực Thuộc Rạp */}
      <div className="p-6 rounded-2xl bg-[var(--rogym-bg-card)] border border-[var(--rogym-border-subtle)] shadow-lg space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
          <div>
            <div className="flex items-center gap-2.5 text-white font-bold text-base">
              <DoorOpen className="w-5 h-5 text-[var(--rogym-teal)]" />
              <span>Danh Sách Phòng Chiếu Trực Thuộc Rạp ({rooms.length})</span>
            </div>
            <p className="text-xs text-[var(--rogym-text-muted)] mt-0.5">
              Quản lý các phòng chiếu và cấu hình ma trận sơ đồ ghế của từng phòng
            </p>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenAddRoomModal}
            className="flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm phòng mới</span>
          </Button>
        </div>

        {rooms.length === 0 ? (
          <div className="p-8 text-center rounded-xl bg-[var(--rogym-bg-elevated)] border border-[var(--rogym-border-subtle)] space-y-3">
            <DoorOpen className="w-10 h-10 mx-auto text-[var(--rogym-text-muted)]" />
            <p className="text-sm text-[var(--rogym-text-secondary)] font-medium">
              Chưa có phòng chiếu nào thuộc cụm rạp này.
            </p>
            <Button variant="secondary" size="sm" onClick={handleOpenAddRoomModal}>
              + Tạo phòng chiếu đầu tiên
            </Button>
          </div>
        ) : (
          <ResponsiveTable<Room>
            data={rooms}
            columns={roomColumns}
            keyExtractor={(item) => item.id}
            onRowClick={(room) => navigate(`/admin/theaters/${theaterId}/rooms/${room.id}`)}
          />
        )}
      </div>

      {/* Modal Thêm / Sửa Phòng Chiếu */}
      <Modal
        open={roomModalOpen}
        title={editingRoom ? `Đổi Tên Phòng: ${editingRoom.name}` : 'Thêm Phòng Chiếu Mới'}
        onClose={() => setRoomModalOpen(false)}
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setRoomModalOpen(false)} disabled={savingRoom}>
              Hủy
            </Button>
            <Button
              variant="primary"
              onClick={handleSaveRoom}
              loading={savingRoom}
              className="flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{editingRoom ? 'Lưu Thay Đổi' : 'Tạo Phòng Chiếu'}</span>
            </Button>
          </>
        }
      >
        <form onSubmit={handleSaveRoom} className="space-y-4">
          <FormField label="Tên phòng chiếu" htmlFor="room-modal-name" required>
            <Input
              id="room-modal-name"
              value={roomForm.name}
              onChange={(e) => setRoomForm({ name: e.target.value })}
              placeholder="VD: Phòng 01, Cinema VIP 02..."
              autoFocus
              required
            />
          </FormField>

          {!editingRoom && (
            <div className="p-3.5 rounded-xl bg-[var(--rogym-bg-elevated)] border border-[var(--rogym-border-subtle)] text-xs text-[var(--rogym-text-muted)] space-y-1.5">
              <div className="flex items-center gap-1.5 font-semibold text-white">
                <Sparkles className="w-4 h-4 text-[var(--rogym-teal)]" />
                <span>Tự động sinh 50 ghế chuẩn:</span>
              </div>
              <p>• 5 hàng (A - E) x 10 ghế mỗi hàng, có lối đi chia 2 - 6 - 2.</p>
              <p>• Hàng A, B: Ghế Thường | Hàng C, D: Ghế VIP | Hàng E: Ghế Đôi (5 cặp).</p>
            </div>
          )}
        </form>
      </Modal>

      {/* Hộp thoại xác nhận Xóa Phòng Chiếu */}
      <ConfirmDialog
        open={!!deletingRoom}
        title="Xác nhận xóa phòng chiếu"
        description={`Bạn có chắc chắn muốn xóa phòng chiếu "${deletingRoom?.name}" khỏi cụm rạp này? Toàn bộ sơ đồ ghế và các suất chiếu chưa có người đặt vé thuộc phòng này sẽ bị xóa.`}
        confirmLabel="Xóa phòng chiếu"
        cancelLabel="Hủy bỏ"
        variant="danger"
        loading={isDeletingRoom}
        onConfirm={handleConfirmDeleteRoom}
        onClose={() => setDeletingRoom(null)}
      />
    </div>
  )
}

export default TheaterDetailManagementPage

