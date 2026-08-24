import { useRouteError, isRouteErrorResponse, Link } from 'react-router-dom'
import { Card, Button } from '@/components/ui'
import { AlertTriangle, Home, RefreshCw } from 'lucide-react'

export function RouteErrorBoundary() {
  const error = useRouteError()

  let errorMessage = 'Đã có sự cố bất ngờ xảy ra trong quá trình tải trang.'
  let errorTitle = 'Có Lỗi Xảy Ra'
  let statusCode = '500'

  if (isRouteErrorResponse(error)) {
    statusCode = String(error.status)
    if (error.status === 404) {
      errorTitle = 'Trang Không Tồn Tại'
      errorMessage = 'Đường dẫn bạn yêu cầu không tìm thấy.'
    } else if (error.status === 403) {
      errorTitle = 'Truy Cập Bị Từ Chối'
      errorMessage = 'Bạn không có quyền truy cập vào trang này.'
    } else {
      errorMessage = error.statusText || errorMessage
    }
  } else if (error instanceof Error) {
    errorMessage = error.message
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <Card variant="glass" className="max-w-md w-full text-center p-8 border-[var(--rogym-border-subtle)] space-y-6">
        <div className="mx-auto w-16 h-16 rounded-3xl bg-[var(--rogym-orange)]/10 border border-[var(--rogym-orange)]/30 flex items-center justify-center text-[var(--rogym-orange)]">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-4xl font-black font-display text-[var(--rogym-orange)] tracking-wider">
            {statusCode}
          </span>
          <h1 className="text-xl font-bold uppercase tracking-wide text-white">
            {errorTitle}
          </h1>
          <p className="text-xs text-[var(--rogym-text-secondary)] leading-relaxed">
            {errorMessage}
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <Link to="/">
            <Button variant="primary" size="md" leftIcon={<Home className="w-4 h-4" />}>
              Về Trang Chủ
            </Button>
          </Link>
          <Button
            variant="secondary"
            size="md"
            leftIcon={<RefreshCw className="w-4 h-4" />}
            onClick={() => window.location.reload()}
          >
            Tải lại trang
          </Button>
        </div>
      </Card>
    </div>
  )
}

export default RouteErrorBoundary
