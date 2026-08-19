import { Link } from 'react-router-dom'
import { Card, Button } from '@/components/ui'
import { Film, Home, ArrowLeft } from 'lucide-react'

export function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <Card variant="glass" className="max-w-md w-full text-center p-8 border-[var(--rogym-border-subtle)] space-y-6">
        <div className="mx-auto w-16 h-16 rounded-3xl bg-[var(--rogym-green)]/10 border border-[var(--rogym-green)]/30 flex items-center justify-center text-[var(--rogym-green)]">
          <Film className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-5xl font-black font-display text-[var(--rogym-green)] tracking-wider">
            404
          </span>
          <h1 className="text-xl font-bold uppercase tracking-wide text-white">
            Trang Không Tồn Tại
          </h1>
          <p className="text-xs text-[var(--rogym-text-secondary)] leading-relaxed">
            Rất tiếc, cuộn phim bạn đang tìm kiếm có thể đã bị gỡ bỏ hoặc đường dẫn không chính xác.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <Link to="/">
            <Button variant="primary" size="md" leftIcon={<Home className="w-4 h-4" />}>
              Về Trang Chủ
            </Button>
          </Link>
          <button
            type="button"
            onClick={() => window.history.back()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-[var(--rogym-text-secondary)] hover:text-white hover:bg-white/5 border border-[var(--rogym-border-subtle)] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Quay lại</span>
          </button>
        </div>
      </Card>
    </div>
  )
}

export default NotFoundPage
