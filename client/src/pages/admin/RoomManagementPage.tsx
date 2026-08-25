import { DoorOpen, Settings } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AdminCrudPage } from '@/components/admin'
import { FormField, Input, Select } from '@/components/ui'
import type { ColumnDef } from '@/components/ui/ResponsiveTable'
import { roomService } from '@/services/roomService'
import { theaterService } from '@/services/theaterService'
import type { Room, RoomRequest } from '@/types/room'
import type { Theater } from '@/types/theater'

const initialForm: RoomRequest = { theaterId: '', name: '' }

export function RoomManagementPage() {
  const navigate = useNavigate()
  const [theaters, setTheaters] = useState<Theater[]>([])

  useEffect(() => {
    void theaterService.getAll().then(setTheaters).catch(() => setTheaters([]))
  }, [])

  const columns: ColumnDef<Room>[] = [
    {
      key: 'name',
      header: 'Tên phòng',
      render: (item) => (
        <Link
          to={`/admin/rooms/${item.id}`}
          className="text-white font-bold hover:text-[var(--rogym-teal)] transition-colors inline-flex items-center gap-1.5"
          title="Xem chi tiết & Quản lý sơ đồ ghế"
        >
          <span>{item.name}</span>
        </Link>
      ),
    },
    { key: 'theaterName', header: 'Rạp' },
  ]

  return (
    <AdminCrudPage<Room, RoomRequest>
      title="Quản lý phòng chiếu"
      subtitle="Thiết lập phòng chiếu thuộc từng rạp (Tự động sinh 50 ghế chuẩn khi tạo phòng mới)"
      icon={<DoorOpen className="h-6 w-6 text-[var(--rogym-teal)]" />}
      addLabel="Thêm phòng"
      editLabel="Cập nhật phòng"
      columns={columns}
      service={roomService}
      initialForm={initialForm}
      toForm={(item) => ({ theaterId: item.theaterId, name: item.name })}
      getSearchText={(item) => `${item.name} ${item.theaterName}`}
      searchPlaceholder="Tìm kiếm theo tên phòng, cụm rạp..."
      editButtonText="Quản lý ghế & Sơ đồ"
      editButtonIcon={<Settings className="h-3.5 w-3.5" />}
      editButtonVariant="primary"
      onEdit={(room) => navigate(`/admin/rooms/${room.id}`)}
      onRowClick={(room) => navigate(`/admin/rooms/${room.id}`)}
      onCreated={(room) => navigate(`/admin/rooms/${room.id}`)}
      renderForm={(form, update) => (
        <>
          <FormField label="Rạp" htmlFor="room-theater" required>
            <Select value={form.theaterId} onValueChange={(value) => update('theaterId', value)} required>
              <option value="">Chọn rạp</option>
              {theaters.map((theater) => <option key={theater.id} value={theater.id}>{theater.name}</option>)}
            </Select>
          </FormField>
          <FormField label="Tên phòng" htmlFor="room-name" required>
            <Input id="room-name" placeholder="Ví dụ: Phòng 01, Cinema 2..." value={form.name} onChange={(event) => update('name', event.target.value)} required />
          </FormField>
          <div className="p-3 rounded-lg bg-[var(--rogym-bg-elevated)] border border-[var(--rogym-border-subtle)] text-xs text-[var(--rogym-text-muted)] space-y-1">
            <p className="font-semibold text-white">✨ Tự động tạo sơ đồ ghế chuẩn:</p>
            <p>• 5 hàng A - E, mỗi hàng 10 ghế (Tổng 50 ghế, chia lối đi 2 - 6 - 2)</p>
            <p>• Hàng A, B: Ghế Thường | Hàng C, D: Ghế VIP | Hàng E: Ghế Đôi (5 cặp)</p>
          </div>
        </>
      )}
    />
  )
}

