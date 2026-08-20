import { Armchair } from 'lucide-react'
import { useEffect, useState } from 'react'
import { AdminCrudPage } from '@/components/admin'
import { FormField, Input, Select } from '@/components/ui'
import type { ColumnDef } from '@/components/ui/ResponsiveTable'
import { roomService } from '@/services/roomService'
import { seatService } from '@/services/seatService'
import type { Room } from '@/types/room'
import type { Seat, SeatRequest, SeatType } from '@/types/seat'

const initialForm: SeatRequest = { roomId: '', seatRow: '', seatNumber: 1, seatType: 'NORMAL' }
const columns: ColumnDef<Seat>[] = [
  { key: 'seat', header: 'Ghế', render: (item) => <strong className="text-white">{item.seatRow}{item.seatNumber}</strong> },
  { key: 'roomName', header: 'Phòng' },
  { key: 'theaterName', header: 'Rạp' },
  { key: 'seatType', header: 'Loại ghế' },
]

export function SeatManagementPage() {
  const [rooms, setRooms] = useState<Room[]>([])
  useEffect(() => {
    void roomService.getAll().then(setRooms).catch(() => setRooms([]))
  }, [])

  return (
    <AdminCrudPage<Seat, SeatRequest>
      title="Quản lý ghế"
      subtitle="Định danh ghế theo từng phòng chiếu"
      icon={<Armchair className="h-6 w-6 text-[var(--rogym-green)]" />}
      addLabel="Thêm ghế"
      editLabel="Cập nhật ghế"
      columns={columns}
      service={seatService}
      initialForm={initialForm}
      toForm={(item) => ({ roomId: item.roomId, seatRow: item.seatRow, seatNumber: item.seatNumber, seatType: item.seatType })}
      getSearchText={(item) => `${item.seatRow}${item.seatNumber} ${item.roomName} ${item.theaterName} ${item.seatType}`}
      renderForm={(form, update) => (
        <>
          <FormField label="Phòng" htmlFor="seat-room" required>
            <Select value={form.roomId} onValueChange={(value) => update('roomId', value)} required>
              <option value="">Chọn phòng</option>
              {rooms.map((room) => <option key={room.id} value={room.id}>{room.theaterName} - {room.name}</option>)}
            </Select>
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Hàng ghế" htmlFor="seat-row" required>
              <Input id="seat-row" value={form.seatRow} onChange={(event) => update('seatRow', event.target.value.toUpperCase())} required />
            </FormField>
            <FormField label="Số ghế" htmlFor="seat-number" required>
              <Input id="seat-number" type="number" min="1" value={form.seatNumber} onChange={(event) => update('seatNumber', Number(event.target.value))} required />
            </FormField>
          </div>
          <FormField label="Loại ghế" htmlFor="seat-type" required>
            <Select value={form.seatType} onValueChange={(value) => update('seatType', value as SeatType)} required>
              <option value="NORMAL">Thường</option>
              <option value="VIP">VIP</option>
              <option value="COUPLE">Đôi</option>
            </Select>
          </FormField>
        </>
      )}
    />
  )
}
