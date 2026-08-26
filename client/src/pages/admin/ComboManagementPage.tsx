import { useState } from 'react'
import { Utensils } from 'lucide-react'
import { AdminCrudPage } from '@/components/admin'
import { Badge, FormField, Input, Select, Textarea, type ColumnDef } from '@/components/ui'
import { comboService } from '@/services/comboService'
import type { Combo, ComboPayload } from '@/types/combo'

function ComboThumbnail({ src, alt }: { src?: string | null; alt: string }) {
  const [error, setError] = useState(false)

  if (!src || error) {
    return (
      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
        <Utensils className="h-5 w-5 text-[var(--rogym-text-muted)]" />
      </div>
    )
  }

  return (
    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
      <img
        src={src}
        alt={alt}
        className="h-full w-full object-cover"
        onError={() => setError(true)}
      />
    </div>
  )
}

const initialForm: ComboPayload = {
  name: '',
  description: '',
  price: 0,
  image: '',
  status: 'ACTIVE',
}

const columns: ColumnDef<Combo>[] = [
  {
    key: 'name',
    header: 'Tên combo',
    render: (item: Combo) => (
      <div className="flex items-center gap-3 py-1">
        <ComboThumbnail src={item.image} alt={item.name} />
        <div className="min-w-0">
          <strong className="text-white block truncate max-w-xs sm:max-w-sm">{item.name}</strong>
          {item.description && (
            <p className="text-xs text-[var(--rogym-text-muted)] truncate max-w-xs">
              {item.description}
            </p>
          )}
        </div>
      </div>
    ),
  },
  {
    key: 'price',
    header: 'Giá',
    render: (item: Combo) => (
      <span className="font-semibold text-white">
        {item.price.toLocaleString('vi-VN')} đ
      </span>
    ),
  },
  {
    key: 'status',
    header: 'Trạng thái',
    render: (item: Combo) => (
      <Badge tone={item.status === 'ACTIVE' ? 'success' : 'muted'} size="sm">
        {item.status}
      </Badge>
    ),
  },
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
