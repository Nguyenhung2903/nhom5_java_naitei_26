import { forwardRef } from 'react'
import { Badge, type BadgeProps, type BadgeTone, type BadgeSize } from './Badge'

export type GenericStatusTone = BadgeTone

export interface StatusBadgeProps extends Omit<BadgeProps, 'tone' | 'children'> {
  status: string
  tone?: BadgeTone
  label?: string
  size?: BadgeSize
  statusMap?: Record<string, { tone?: BadgeTone; label?: string }>
}

const DEFAULT_TONES: Record<string, BadgeTone> = {
  active: 'success',
  completed: 'success',
  success: 'success',
  pending: 'warning',
  warning: 'warning',
  in_progress: 'accent',
  expired: 'danger',
  inactive: 'muted',
  cancelled: 'danger',
  error: 'danger',
}

export const StatusBadge = forwardRef<HTMLSpanElement, StatusBadgeProps>(
  ({ status, tone, label, size = 'md', statusMap, className, ...props }, ref) => {
    const mapped = statusMap?.[status]
    const effectiveTone = tone ?? mapped?.tone ?? DEFAULT_TONES[status.toLowerCase()] ?? 'muted'
    const effectiveLabel = label ?? mapped?.label ?? status.replace(/_/g, ' ')

    return (
      <Badge
        ref={ref}
        tone={effectiveTone}
        size={size}
        className={className}
        {...props}
      >
        {effectiveLabel}
      </Badge>
    )
  }
)
StatusBadge.displayName = 'StatusBadge'
