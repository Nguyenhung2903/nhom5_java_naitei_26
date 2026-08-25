import { MapPin } from 'lucide-react'
import { AdminCrudPage } from '@/components/admin'
import { FormField, Input } from '@/components/ui'
import type { ColumnDef } from '@/components/ui/ResponsiveTable'
import { theaterService } from '@/services/theaterService'
import type { Theater, TheaterRequest } from '@/types/theater'

const initialForm: TheaterRequest = { name: '', address: '', phone: '', latitude: undefined, longitude: undefined }

const columns: ColumnDef<Theater>[] = [
  { key: 'name', header: 'Tên rạp', render: (item) => <strong className="text-white">{item.name}</strong> },
  { key: 'address', header: 'Địa chỉ' },
  { key: 'phone', header: 'Điện thoại' },
]

export function TheaterManagementPage() {
  return (
    <AdminCrudPage<Theater, TheaterRequest>
      title="Quản lý rạp"
      subtitle="Quản lý thông tin các cụm rạp trong hệ thống"
      icon={<MapPin className="h-6 w-6 text-[var(--rogym-green)]" />}
      addLabel="Thêm rạp"
      editLabel="Cập nhật rạp"
      columns={columns}
      service={theaterService}
      initialForm={initialForm}
      toForm={(item) => ({ name: item.name, address: item.address, phone: item.phone || '', latitude: item.latitude || undefined, longitude: item.longitude || undefined })}
      getSearchText={(item) => `${item.name} ${item.address} ${item.phone || ''}`}
      searchPlaceholder="Tìm kiếm theo tên rạp, địa chỉ, số điện thoại..."
      renderForm={(form, update) => (
        <>
          <FormField label="Tên rạp" htmlFor="theater-name" required>
            <Input id="theater-name" value={form.name} onChange={(event) => update('name', event.target.value)} required />
          </FormField>
          <FormField label="Địa chỉ" htmlFor="theater-address" required>
            <Input id="theater-address" value={form.address} onChange={(event) => update('address', event.target.value)} required />
          </FormField>
          <FormField label="Điện thoại" htmlFor="theater-phone">
            <Input id="theater-phone" value={form.phone} onChange={(event) => update('phone', event.target.value)} />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Vĩ độ" htmlFor="theater-latitude">
              <Input id="theater-latitude" type="number" step="any" value={form.latitude ?? ''} onChange={(event) => update('latitude', event.target.value ? Number(event.target.value) : undefined)} />
            </FormField>
            <FormField label="Kinh độ" htmlFor="theater-longitude">
              <Input id="theater-longitude" type="number" step="any" value={form.longitude ?? ''} onChange={(event) => update('longitude', event.target.value ? Number(event.target.value) : undefined)} />
            </FormField>
          </div>
        </>
      )}
    />
  )
}
