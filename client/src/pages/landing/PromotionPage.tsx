import { useEffect, useMemo, useState } from 'react'
import { BadgePercent, CalendarDays, Copy, RefreshCcw, Search } from 'lucide-react'
import { Badge, Button, Card, Input, StatusBadge } from '@/components/ui'
import { promotionService } from '@/services/promotionService'
import type { Promotion } from '@/types/promotion'

function formatDiscount(promotion: Promotion) {
  if (promotion.discountType === 'PERCENT') return `${promotion.discountValue}%`
  return `${promotion.discountValue.toLocaleString('vi-VN')} đ`
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('vi-VN')
}

export function PromotionPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [keyword, setKeyword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const activePromotions = useMemo(
    () => promotions.filter((promotion) => promotion.status === 'ACTIVE'),
    [promotions]
  )

  const loadPromotions = async () => {
    setLoading(true)
    setError(null)
    try {
      setPromotions(await promotionService.getPromotions({ keyword, status: 'ACTIVE' }))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải khuyến mãi')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadPromotions()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const copyCode = async (code: string) => {
    await navigator.clipboard.writeText(code)
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <Badge tone="success" size="sm">Ưu đãi đang hoạt động</Badge>
          <h1 className="flex items-center gap-2 text-3xl font-black uppercase tracking-wide text-white">
            <BadgePercent className="h-7 w-7 text-[var(--rogym-green)]" />
            Khuyến mãi
          </h1>
          <p className="max-w-2xl text-sm text-[var(--rogym-text-secondary)]">
            Danh sách mã giảm giá được quản trị viên cập nhật từ cơ sở dữ liệu.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="Tìm tiêu đề hoặc mã"
            leftIcon={<Search className="h-4 w-4" />}
          />
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

      {loading ? (
        <Card variant="elevated" className="py-12 text-center text-sm text-[var(--rogym-text-muted)]">
          Đang tải khuyến mãi...
        </Card>
      ) : activePromotions.length === 0 ? (
        <Card variant="elevated" className="py-12 text-center text-sm text-[var(--rogym-text-muted)]">
          Chưa có khuyến mãi phù hợp.
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {activePromotions.map((promotion) => (
            <Card key={promotion.id} variant="elevated" className="flex flex-col gap-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="line-clamp-2 text-lg font-bold text-white">{promotion.title}</h2>
                  <p className="mt-2 line-clamp-3 text-sm text-[var(--rogym-text-secondary)]">
                    {promotion.description || 'Áp dụng khi thanh toán đơn đặt vé hợp lệ.'}
                  </p>
                </div>
                <StatusBadge status={promotion.status} label="Đang bật" size="sm" />
              </div>

              <div className="rounded-xl border border-[var(--rogym-green)]/30 bg-[var(--rogym-green)]/10 p-4">
                <p className="text-xs uppercase tracking-wide text-[var(--rogym-text-muted)]">Mã ưu đãi</p>
                <div className="mt-2 flex items-center justify-between gap-3">
                  <p className="truncate text-xl font-black text-[var(--rogym-teal)]">{promotion.code}</p>
                  <Button type="button" variant="secondary" size="sm" onClick={() => void copyCode(promotion.code)} leftIcon={<Copy className="h-4 w-4" />}>
                    Sao chép
                  </Button>
                </div>
              </div>

              <div className="mt-auto flex flex-wrap items-center justify-between gap-3 text-xs text-[var(--rogym-text-muted)]">
                <Badge tone="accent" size="md">Giảm {formatDiscount(promotion)}</Badge>
                <span className="flex items-center gap-1">
                  <CalendarDays className="h-3.5 w-3.5 text-[var(--rogym-teal)]" />
                  {formatDate(promotion.startDate)} - {formatDate(promotion.endDate)}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default PromotionPage
