import { useEffect, useState, useMemo } from 'react'
import { MapPin, DoorOpen, Building2 } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { AdminCrudPage } from '@/components/admin'
import { Badge, FormField, Input } from '@/components/ui'
import type { ColumnDef } from '@/components/ui/ResponsiveTable'
import { theaterService } from '@/services/theaterService'
import { roomService } from '@/services/roomService'
import type { Theater, TheaterRequest } from '@/types/theater'
import type { Room } from '@/types/room'

const initialForm: TheaterRequest = {
  name: '',
  address: '',
  phone: '',
  latitude: undefined,
  longitude: undefined,
}

export function TheaterManagementPage() {
  const navigate = useNavigate()
  const [rooms, setRooms] = useState<Room[]>([])

  useEffect(() => {
    void roomService.getAll().then(setRooms).catch(() => setRooms([]))
  }, [])

  const roomCountByTheater = useMemo(() => {
    const map: Record<string, number> = {}
    for (const r of rooms) {
      map[r.theaterId] = (map[r.theaterId] || 0) + 1
    }
    return map
  }, [rooms])

  const columns: ColumnDef<Theater>[] = [
    {
      key: 'name',
      header: 'Tên cụm rạp',
      render: (item) => (
        <Link
          to={`/admin/theaters/${item.id}`}
          className="text-white font-bold hover:text-[var(--rogym-green)] transition-colors inline-flex items-center gap-2"
          title="Xem chi tiết cụm rạp & Quản lý phòng chiếu"
        >
          <Building2 className="w-4 h-4 text-[var(--rogym-green)] shrink-0" />
          <span>{item.name}</span>
        </Link>
      ),
    },
    { key: 'address', header: 'Địa chỉ' },
    {
      key: 'phone',
      header: 'Điện thoại',
      render: (item) => item.phone || <span className="text-[var(--rogym-text-muted)]">-</span>,
    },
    {
      key: 'rooms',
      header: 'Số phòng chiếu',
      render: (item) => {
        const count = roomCountByTheater[item.id] || 0
        return (
          <Badge tone={count > 0 ? 'accent' : 'warning'} size="sm">
            <span className="inline-flex items-center gap-1">
              <DoorOpen className="w-3.5 h-3.5" />
              {count} phòng
            </span>
          </Badge>
        )
      },
    },
  ]

  return (
    <AdminCrudPage<Theater, TheaterRequest>
      title="Quản lý Cụm Rạp & Phòng Chiếu"
      subtitle="Quản lý danh sách cụm rạp, phòng chiếu và cấu hình sơ đồ ghế trong hệ thống"
      icon={<MapPin className="h-6 w-6 text-[var(--rogym-green)]" />}
      addLabel="Thêm cụm rạp"
      editLabel="Cập nhật cụm rạp"
      columns={columns}
      service={theaterService}
      initialForm={initialForm}
      toForm={(item) => ({
        name: item.name,
        address: item.address,
        phone: item.phone || '',
        latitude: item.latitude || undefined,
        longitude: item.longitude || undefined,
      })}
      getSearchText={(item) => `${item.name} ${item.address} ${item.phone || ''}`}
      searchPlaceholder="Tìm kiếm theo tên rạp, địa chỉ, số điện thoại..."
      editButtonText="Quản lý phòng chiếu"
      editButtonIcon={<DoorOpen className="h-3.5 w-3.5" />}
      editButtonVariant="primary"
      onEdit={(theater) => navigate(`/admin/theaters/${theater.id}`)}
      onRowClick={(theater) => navigate(`/admin/theaters/${theater.id}`)}
      onCreated={(theater) => navigate(`/admin/theaters/${theater.id}`)}
      renderForm={(form, update) => (
        <>
          <FormField label="Tên cụm rạp" htmlFor="theater-name" required>
            <Input
              id="theater-name"
              placeholder="VD: CinemaNest Landmark 81"
              value={form.name}
              onChange={(event) => update('name', event.target.value)}
              required
            />
          </FormField>
          <FormField label="Địa chỉ" htmlFor="theater-address" required>
            <Input
              id="theater-address"
              placeholder="VD: 720A Điện Biên Phủ, P. 22, Q. Bình Thạnh, TP.HCM"
              value={form.address}
              onChange={(event) => update('address', event.target.value)}
              required
            />
          </FormField>
          <FormField label="Điện thoại" htmlFor="theater-phone">
            <Input
              id="theater-phone"
              placeholder="VD: 1900 1234"
              value={form.phone}
              onChange={(event) => update('phone', event.target.value)}
            />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Vĩ độ (Latitude)" htmlFor="theater-latitude">
              <Input
                id="theater-latitude"
                type="number"
                step="any"
                placeholder="10.794..."
                value={form.latitude ?? ''}
                onChange={(event) =>
                  update(
                    'latitude',
                    event.target.value ? Number(event.target.value) : undefined
                  )
                }
              />
            </FormField>
            <FormField label="Kinh độ (Longitude)" htmlFor="theater-longitude">
              <Input
                id="theater-longitude"
                type="number"
                step="any"
                placeholder="106.721..."
                value={form.longitude ?? ''}
                onChange={(event) =>
                  update(
                    'longitude',
                    event.target.value ? Number(event.target.value) : undefined
                  )
                }
              />
            </FormField>
          </div>
        </>
      )}
    />
  )
}
