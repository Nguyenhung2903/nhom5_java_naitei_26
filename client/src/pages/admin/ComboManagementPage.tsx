import { Utensils } from 'lucide-react'
import { AdminCrudPage } from '@/components/admin'
import { FormField, Input, Select, Textarea } from '@/components/ui'
import { comboService } from '@/services/comboService'
import type { Combo, ComboPayload } from '@/types/combo'

const initialForm: ComboPayload = {
  name: '',
  description: '',
  price: 0,
  image: '',
  status: 'ACTIVE',
}

const columns = [
  { key: 'name', header: 'Tên combo', render: (item: Combo) => <strong className="text-white">{item.name}</strong> },
  { key: 'price', header: 'Giá', render: (item: Combo) => `${item.price.toLocaleString('vi-VN')} đ` },
  { key: 'status', header: 'Trạng thái' },
]

export function ComboManagementPage() {
  return (
    <AdminCrudPage<Combo, ComboPayload>
      title="Quản lý combo"
      subtitle="Quản lý bắp nước và combo bán kèm vé"
      icon={<Utensils className="h-6 w-6 text-[var(--rogym-teal)]" />}
      addLabel="Thêm combo"
      editLabel="Cập nhật combo"
      columns={columns}
      service={comboService}
      initialForm={initialForm}
      toForm={(item) => ({
        name: item.name,
        description: item.description,
        price: item.price,
        image: item.image ?? '',
        status: item.status,
      })}
      getSearchText={(item) => `${item.name} ${item.description} ${item.status}`}
      renderForm={(form, update) => (
        <>
          <FormField label="Tên combo" required>
            <Input value={form.name} onChange={(event) => update('name', event.target.value)} required />
          </FormField>
          <FormField label="Mô tả">
            <Textarea value={form.description} onChange={(event) => update('description', event.target.value)} rows={3} />
          </FormField>
          <FormField label="Giá" required>
            <Input type="number" min="0.01" step="0.01" value={form.price} onChange={(event) => update('price', Number(event.target.value))} required />
          </FormField>
          <FormField label="Ảnh">
            <Input value={form.image} onChange={(event) => update('image', event.target.value)} placeholder="URL hình ảnh" />
          </FormField>
          <FormField label="Trạng thái" required>
            <Select value={form.status} onValueChange={(value) => update('status', value as ComboPayload['status'])}>
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </Select>
          </FormField>
        </>
      )}
    />
  )
}

export default ComboManagementPage
