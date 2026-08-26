import { useEffect, useMemo, useState, type FormEvent } from 'react'
import {
  AlertCircle,
  BadgePercent,
  CheckCircle2,
  Edit,
  Plus,
  RefreshCcw,
  Search,
  Trash2,
} from 'lucide-react'
import {
  Alert,
  AlertDescription,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  ConfirmDialog,
  DateTimePickerInput,
  FormField,
  Input,
  Select,
  Textarea,
} from '@/components/ui'
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
  const [deleting, setDeleting] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Promotion | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)

  const editingPromotion = useMemo(
    () => promotions.find((promotion) => promotion.id === editingId) ?? null,
    [promotions, editingId]
  )

  useEffect(() => {
    if (!feedback && !error) return
    const timer = setTimeout(() => {
      setFeedback(null)
      setError(null)
    }, 5000)
    return () => clearTimeout(timer)
  }, [feedback, error])

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
    setFeedback(null)
    setError(null)
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
    status: editingId ? form.status : 'ACTIVE',
    code: form.code.trim().toUpperCase(),
  })

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!form.startDate) {
      setError('Vui lòng chọn thời gian bắt đầu')
      return
    }
    if (!form.endDate) {
      setError('Vui lòng chọn thời gian kết thúc')
      return
    }
    if (new Date(form.endDate) <= new Date(form.startDate)) {
      setError('Thời gian kết thúc phải sau thời gian bắt đầu')
      return
    }

    setSaving(true)
    setError(null)
    setFeedback(null)
    try {
      const payload = buildPayload()
      if (editingId) {
        await promotionService.updatePromotion(editingId, payload)
        setFeedback(`Cập nhật khuyến mãi "${payload.code}" thành công!`)
      } else {
        await promotionService.createPromotion(payload)
        setFeedback(`Tạo mới khuyến mãi "${payload.code}" thành công!`)
      }
      resetForm()
      await loadPromotions()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể lưu khuyến mãi')
    } finally {
      setSaving(false)
    }
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    setError(null)
    setFeedback(null)
    try {
      await promotionService.deletePromotion(deleteTarget.id)
      setFeedback(`Đã xóa khuyến mãi "${deleteTarget.title}" (${deleteTarget.code})!`)
      if (editingId === deleteTarget.id) resetForm()
      setDeleteTarget(null)
      await loadPromotions()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể xóa khuyến mãi')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
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

      {/* Notifications */}
      {feedback && (
        <Alert tone="success" icon={<CheckCircle2 className="h-4 w-4" />} onClose={() => setFeedback(null)}>
          <AlertDescription>{feedback}</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert tone="error" icon={<AlertCircle className="h-4 w-4" />} onClose={() => setError(null)}>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Content Grid */}
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        {/* Promotion List */}
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
                <div
                  key={promotion.id}
                  className="rounded-xl border border-white/10 bg-white/[0.03] p-4 transition-colors hover:border-white/20"
                >
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
                        <span className="font-medium text-white/90">
                          Giảm {promotion.discountType === 'PERCENT'
                            ? `${promotion.discountValue}%`
                            : `${promotion.discountValue.toLocaleString('vi-VN')} đ`}
                        </span>
                        <span>•</span>
                        <span>{new Date(promotion.startDate).toLocaleDateString('vi-VN')}</span>
                        <span>-</span>
                        <span>{new Date(promotion.endDate).toLocaleDateString('vi-VN')}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        leftIcon={<Edit className="h-4 w-4" />}
                        onClick={() => startEdit(promotion)}
                      >
                        Sửa
                      </Button>
                      <Button
                        type="button"
                        variant="danger"
                        size="sm"
                        leftIcon={<Trash2 className="h-4 w-4" />}
                        onClick={() => setDeleteTarget(promotion)}
                      >
                        Xóa
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Promotion Form (Create / Edit) */}
        <Card variant="accent">
          <CardHeader>
            <CardTitle>{editingPromotion ? `Sửa mã: ${editingPromotion.code}` : 'Tạo khuyến mãi mới'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <FormField label="Tiêu đề" htmlFor="promotion-title" required>
                <Input
                  id="promotion-title"
                  value={form.title}
                  onChange={(event) => updateField('title', event.target.value)}
                  placeholder="Nhập tiêu đề khuyến mãi"
                  required
                />
              </FormField>

              <FormField label="Mô tả" htmlFor="promotion-description">
                <Textarea
                  id="promotion-description"
                  value={form.description}
                  onChange={(event) => updateField('description', event.target.value)}
                  placeholder="Mô tả chi tiết chương trình khuyến mãi"
                  rows={3}
                />
              </FormField>

              {editingId ? (
                <div className="grid grid-cols-2 gap-3">
                  <FormField label="Mã giảm giá" htmlFor="promotion-code" required>
                    <Input
                      id="promotion-code"
                      value={form.code}
                      onChange={(event) => updateField('code', event.target.value)}
                      placeholder="VD: SALE50"
                      required
                    />
                  </FormField>
                  <FormField label="Trạng thái" htmlFor="promotion-status" required>
                    <Select
                      id="promotion-status"
                      value={form.status}
                      onValueChange={(value) => updateField('status', value)}
                    >
                      {PROMOTION_STATUSES.map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </Select>
                  </FormField>
                </div>
              ) : (
                <FormField label="Mã giảm giá" htmlFor="promotion-code" required>
                  <Input
                    id="promotion-code"
                    value={form.code}
                    onChange={(event) => updateField('code', event.target.value)}
                    placeholder="VD: SALE50"
                    required
                  />
                </FormField>
              )}

              <div className="grid grid-cols-2 gap-3">
                <FormField label="Loại giảm giá" htmlFor="promotion-discount-type" required>
                  <Select
                    id="promotion-discount-type"
                    value={form.discountType}
                    onValueChange={(value) => updateField('discountType', value)}
                  >
                    {DISCOUNT_TYPES.map((type) => (
                      <option key={type} value={type}>{type === 'PERCENT' ? 'Phần trăm (%)' : 'Cố định (VNĐ)'}</option>
                    ))}
                  </Select>
                </FormField>
                <FormField
                  label={form.discountType === 'PERCENT' ? 'Giá trị giảm (%)' : 'Giá trị giảm (VNĐ)'}
                  htmlFor="promotion-discount-value"
                  required
                >
                  <Input
                    id="promotion-discount-value"
                    value={form.discountValue}
                    onChange={(event) => updateField('discountValue', event.target.value)}
                    placeholder={form.discountType === 'PERCENT' ? '20' : '50000'}
                    type="number"
                    min={0.01}
                    max={form.discountType === 'PERCENT' ? 100 : undefined}
                    step={form.discountType === 'PERCENT' ? 1 : 1000}
                    required
                  />
                </FormField>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <FormField label="Thời gian bắt đầu" htmlFor="promotion-start-date" required>
                  <DateTimePickerInput
                    value={form.startDate}
                    onChange={(val) => updateField('startDate', val)}
                    placeholder="Chọn ngày & giờ bắt đầu..."
                  />
                </FormField>
                <FormField label="Thời gian kết thúc" htmlFor="promotion-end-date" required>
                  <DateTimePickerInput
                    value={form.endDate}
                    onChange={(val) => updateField('endDate', val)}
                    min={form.startDate || undefined}
                    placeholder="Chọn ngày & giờ kết thúc..."
                  />
                </FormField>
              </div>

              <div className="flex gap-2 pt-2">
                <Button type="submit" variant="primary" loading={saving} leftIcon={<Plus className="h-4 w-4" />}>
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

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Xác nhận xóa khuyến mãi"
        description={
          <span>
            Bạn có chắc chắn muốn xóa khuyến mãi{' '}
            <strong className="text-white">"{deleteTarget?.title}"</strong> ({deleteTarget?.code})? Hành động này không thể hoàn tác.
          </span>
        }
        variant="danger"
        confirmLabel="Xóa vĩnh viễn"
        cancelLabel="Hủy"
        loading={deleting}
      />
    </div>
  )
}

export default PromotionManagementPage
