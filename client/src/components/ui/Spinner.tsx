import { cn } from '@/lib/utils'

// Vòng tròn xoay dùng chung cho mọi trạng thái lazy-load / loading.
export function Spinner({ size = 24, className }: { size?: number; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'inline-block shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent',
        className
      )}
      style={{ width: size, height: size }}
    />
  )
}

// Loader căn giữa cho Suspense fallback ở mức nội dung (trong layout đã render).
export function PageLoader({
  className,
  minHeight = '60vh',
  size = 36,
  ariaLabel = 'Đang tải...',
}: {
  className?: string
  minHeight?: string
  size?: number
  ariaLabel?: string
}) {
  return (
    <div
      role="status"
      aria-label={ariaLabel}
      className={cn(
        'flex w-full items-center justify-center text-[var(--rogym-green)]',
        className
      )}
      style={{ minHeight }}
    >
      <Spinner size={size} />
    </div>
  )
}

// Loader phủ toàn màn hình cho fallback route-level.
export function FullScreenLoader({ ariaLabel = 'Đang tải...' }: { ariaLabel?: string } = {}) {
  return (
    <div
      role="status"
      aria-label={ariaLabel}
      className="flex min-h-screen w-full items-center justify-center bg-[var(--rogym-bg-base)] text-[var(--rogym-green)]"
    >
      <Spinner size={44} />
    </div>
  )
}
