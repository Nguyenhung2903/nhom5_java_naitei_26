import { DoorOpen } from 'lucide-react'
import { useEffect, useState } from 'react'
import { AdminCrudPage } from '@/components/admin'
import { FormField, Input, Select } from '@/components/ui'
import type { ColumnDef } from '@/components/ui/ResponsiveTable'
import { roomService } from '@/services/roomService'
import { theaterService } from '@/services/theaterService'
import type { Room, RoomRequest } from '@/types/room'
import type { Theater } from '@/types/theater'

const initialForm: RoomRequest = { theaterId: '', name: '' }
const columns: ColumnDef<Room>[] = [
  { key: 'name', header: 'Tên phòng', render: (item) => <strong className="text-white">{item.name}</strong> },
  { key: 'theaterName', header: 'Rạp' },
]

export function RoomManagementPage() {
  const [theaters, setTheaters] = useState<Theater[]>([])
  useEffect(() => {
    void theaterService.getAll().then(setTheaters).catch(() => setTheaters([]))
  }, [])

  return (
    <AdminCrudPage<Room, RoomRequest>
      title="Quản lý phòng chiếu"
      subtitle="Thiết lập phòng chiếu thuộc từng rạp"
      icon={<DoorOpen className="h-6 w-6 text-[var(--rogym-teal)]" />}
      addLabel="Thêm phòng"
      editLabel="Cập nhật phòng"
      columns={columns}
      service={roomService}
      initialForm={initialForm}
      toForm={(item) => ({ theaterId: item.theaterId, name: item.name })}
      getSearchText={(item) => `${item.name} ${item.theaterName}`}
      renderForm={(form, update) => (
        <>
          <FormField label="Rạp" htmlFor="room-theater" required>
            <Select value={form.theaterId} onValueChange={(value) => update('theaterId', value)} required>
              <option value="">Chọn rạp</option>
              {theaters.map((theater) => <option key={theater.id} value={theater.id}>{theater.name}</option>)}
            </Select>
          </FormField>
          <FormField label="Tên phòng" htmlFor="room-name" required>
            <Input id="room-name" value={form.name} onChange={(event) => update('name', event.target.value)} required />
          </FormField>
        </>
      )}
    />
  )
}
