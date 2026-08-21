import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { BadgePercent, Edit, Plus, RefreshCcw, Search, Trash2 } from 'lucide-react'
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Input, Select, Textarea } from '@/components/ui'
import { promotionService } from '@/services/promotionService'
import type { DiscountType, Promotion, PromotionPayload, PromotionStatus } from '@/types/promotion'

const PROMOTION_STATUSES: PromotionStatus[] = ['ACTIVE', 'INACTIVE']
const DISCOUNT_TYPES: DiscountType[] = ['PERCENT', 'FIXED']

const emptyForm = {
  title: '',
  description: '',
  discountType: 'PERCENT' as DiscountType,
  discountValue: '',
  startDate: '',
  endDate: '',
  status: 'ACTIVE' as PromotionStatus,
  code: '',
}

type PromotionFormState = typeof emptyForm

function toDatetimeLocal(value?: string) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toISOString().slice(0, 16)
}

function toIsoInstant(value: string) {
  return new Date(value).toISOString()
}

export function PromotionManagementPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [form, setForm] = useState<PromotionFormState>(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [keyword, setKeyword] = useState('')
  const [statusFilter, setStatusFilter] = useState<PromotionStatus | ''>('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const editingPromotion = useMemo(
    () => promotions.find((promotion) => promotion.id === editingId) ?? null,
    [promotions, editingId]
  )

  const loadPromotions = async () => {
    setLoading(true)
    setError(null)
    try {
      setPromotions(await promotionService.getPromotions({ keyword, status: statusFilter }))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải danh sách khuyến mãi')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadPromotions()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const updateField = (field: keyof PromotionFormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const resetForm = () => {
    setForm(emptyForm)
    setEditingId(null)
  }

  const startEdit = (promotion: Promotion) => {
    setEditingId(promotion.id)
    setForm({
      title: promotion.title,
      description: promotion.description ?? '',
      discountType: promotion.discountType,
      discountValue: String(promotion.discountValue),
      startDate: toDatetimeLocal(promotion.startDate),
      endDate: toDatetimeLocal(promotion.endDate),
      status: promotion.status,
      code: promotion.code,
    })
  }

  const buildPayload = (): PromotionPayload => ({
    title: form.title.trim(),
    description: form.description.trim() || undefined,
    discountType: form.discountType,
    discountValue: Number(form.discountValue),
    startDate: toIsoInstant(form.startDate),
    endDate: toIsoInstant(form.endDate),
    status: form.status,
    code: form.code.trim().toUpperCase(),
  })

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const payload = buildPayload()
      if (editingId) {
        await promotionService.updatePromotion(editingId, payload)
      } else {
        await promotionService.createPromotion(payload)
      }
      resetForm()
      await loadPromotions()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể lưu khuyến mãi')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (promotion: Promotion) => {
    if (!window.confirm(`Xóa khuyến mãi "${promotion.title}"?`)) return
    setError(null)
    try {
      await promotionService.deletePromotion(promotion.id)
      await loadPromotions()
      if (editingId === promotion.id) resetForm()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể xóa khuyến mãi')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold uppercase tracking-wide text-white">
            <BadgePercent className="h-6 w-6 text-[var(--rogym-green)]" />
            Quản lý khuyến mãi
          </h1>
          <p className="mt-1 text-xs text-[var(--rogym-text-secondary)]">
            CRUD mã giảm giá, thời gian hiệu lực và trạng thái sử dụng.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="Tìm tiêu đề hoặc mã"
            leftIcon={<Search className="h-4 w-4" />}
          />
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as PromotionStatus | '')}>
            <option value="">Tất cả trạng thái</option>
            {PROMOTION_STATUSES.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </Select>
          <Button type="button" variant="secondary" onClick={loadPromotions} loading={loading} leftIcon={<RefreshCcw className="h-4 w-4" />}>
            Lọc
          </Button>
        </div>
      </div>

      {error && (
        <Card variant="danger" padding="sm">
          <p className="text-sm text-red-200">{error}</p>
        </Card>
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>Danh sách khuyến mãi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {promotions.length === 0 ? (
              <p className="py-10 text-center text-sm text-[var(--rogym-text-muted)]">
                Chưa có khuyến mãi nào.
              </p>
            ) : (
              promotions.map((promotion) => (
                <div key={promotion.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="truncate text-base font-bold text-white">{promotion.title}</h2>
                        <Badge tone={promotion.status === 'ACTIVE' ? 'success' : 'muted'} size="sm">
                          {promotion.status}
                        </Badge>
                        <Badge tone="info" size="sm">{promotion.code}</Badge>
                      </div>
                      <p className="line-clamp-2 text-xs text-[var(--rogym-text-secondary)]">
                        {promotion.description || 'Chưa có mô tả'}
                      </p>
                      <div className="flex flex-wrap gap-2 text-xs text-[var(--rogym-text-muted)]">
                        <span>
                          Giảm {promotion.discountType === 'PERCENT'
                            ? `${promotion.discountValue}%`
                            : `${promotion.discountValue.toLocaleString('vi-VN')} đ`}
                        </span>
                        <span>{new Date(promotion.startDate).toLocaleDateString('vi-VN')}</span>
                        <span>-</span>
                        <span>{new Date(promotion.endDate).toLocaleDateString('vi-VN')}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button type="button" variant="secondary" size="sm" leftIcon={<Edit className="h-4 w-4" />} onClick={() => startEdit(promotion)}>
                        Sửa
                      </Button>
                      <Button type="button" variant="danger" size="sm" leftIcon={<Trash2 className="h-4 w-4" />} onClick={() => void handleDelete(promotion)}>
                        Xóa
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card variant="accent">
          <CardHeader>
            <CardTitle>{editingPromotion ? `Sửa mã: ${editingPromotion.code}` : 'Tạo khuyến mãi mới'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-3" onSubmit={handleSubmit}>
              <Input value={form.title} onChange={(event) => updateField('title', event.target.value)} placeholder="Tiêu đề" required />
              <Textarea value={form.description} onChange={(event) => updateField('description', event.target.value)} placeholder="Mô tả" rows={3} />
              <div className="grid grid-cols-2 gap-3">
                <Input value={form.code} onChange={(event) => updateField('code', event.target.value)} placeholder="Mã giảm giá" required />
                <Select value={form.status} onValueChange={(value) => updateField('status', value)}>
                  {PROMOTION_STATUSES.map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Select value={form.discountType} onValueChange={(value) => updateField('discountType', value)}>
                  {DISCOUNT_TYPES.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </Select>
                <Input value={form.discountValue} onChange={(event) => updateField('discountValue', event.target.value)} placeholder="Giá trị" type="number" min={0.01} step={0.01} required />
              </div>
              <Input value={form.startDate} onChange={(event) => updateField('startDate', event.target.value)} type="datetime-local" required />
              <Input value={form.endDate} onChange={(event) => updateField('endDate', event.target.value)} type="datetime-local" required />
              <div className="flex gap-2 pt-2">
                <Button type="submit" loading={saving} leftIcon={<Plus className="h-4 w-4" />}>
                  {editingId ? 'Cập nhật' : 'Tạo mới'}
                </Button>
                {editingId && (
                  <Button type="button" variant="secondary" onClick={resetForm}>
                    Hủy
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default PromotionManagementPage
