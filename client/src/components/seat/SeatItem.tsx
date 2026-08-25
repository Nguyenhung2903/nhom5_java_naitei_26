import React from 'react'
import type { SeatType } from '@/types/seat'
import type { ShowtimeSeatStatus } from '@/types/showtimeSeat'

export interface SeatItemProps {
  id?: string
  seatRow: string
  seatNumber: number
  seatType: SeatType
  status?: ShowtimeSeatStatus | 'SELECTED'
  price?: number
  isCouple?: boolean
  couplePartnerNumber?: number
  isSelected?: boolean
  isHeld?: boolean
  isBooked?: boolean
  disabled?: boolean
  onClick?: () => void
  interactive?: boolean
  className?: string
}

export const SeatItem: React.FC<SeatItemProps> = ({
  seatRow,
  seatNumber,
  seatType,
  price,
  isCouple = false,
  couplePartnerNumber,
  isSelected = false,
  isHeld = false,
  isBooked = false,
  disabled = false,
  onClick,
  interactive = true,
  className = '',
}) => {
  const code = isCouple && couplePartnerNumber
    ? `${seatRow}${Math.min(seatNumber, couplePartnerNumber)}-${seatRow}${Math.max(seatNumber, couplePartnerNumber)}`
    : `${seatRow}${seatNumber}`

  // Xác định style theo design system token (--rogym-...)
  let colorClasses = ''
  let labelColor = 'text-[var(--rogym-text-primary)]'
  let topBarColor = 'border-[var(--rogym-border-white-dim)] bg-[var(--rogym-border-white-dim)]'

  if (isBooked) {
    colorClasses = 'bg-[var(--rogym-bg-elevated)] border-[var(--rogym-border-subtle)] text-[var(--rogym-text-faint)] cursor-not-allowed opacity-40'
    labelColor = 'text-[var(--rogym-text-faint)]'
    topBarColor = 'border-[var(--rogym-border-subtle)] bg-[var(--rogym-border-subtle)]'
  } else if (isSelected) {
    colorClasses = 'bg-[var(--rogym-green)]/20 border-[var(--rogym-green)] text-[var(--rogym-green)] shadow-[var(--rogym-shadow-tone-sm)] scale-[1.04]'
    labelColor = 'text-[var(--rogym-green)] font-bold'
    topBarColor = 'border-[var(--rogym-green)] bg-[var(--rogym-green)]'
  } else if (isHeld) {
    colorClasses = 'bg-amber-500/15 border-amber-500/50 text-amber-400 cursor-not-allowed opacity-75 animate-pulse'
    labelColor = 'text-amber-400'
    topBarColor = 'border-amber-400 bg-amber-400'
  } else {
    // Trạng thái khả dụng (AVAILABLE / Preview)
    switch (seatType) {
      case 'VIP':
        colorClasses = 'bg-[var(--rogym-bg-elevated-green)] border-[var(--rogym-teal)] text-[var(--rogym-teal)] hover:bg-[var(--rogym-green-dark)] hover:shadow-[var(--rogym-shadow-tone-sm)]'
        labelColor = 'text-[var(--rogym-teal)] font-medium'
        topBarColor = 'border-[var(--rogym-teal)] bg-[var(--rogym-teal)]'
        break
      case 'COUPLE':
        colorClasses = 'bg-rose-500/15 border-rose-500/60 text-rose-300 hover:bg-rose-500/25 hover:border-rose-400 hover:shadow-[0_0_8px_rgba(244,63,94,0.35)]'
        labelColor = 'text-rose-300 font-medium'
        topBarColor = 'border-rose-400 bg-rose-400'
        break
      case 'NORMAL':
      default:
        colorClasses = 'bg-[var(--rogym-bg-card)] border-[var(--rogym-border-white-button)]/40 text-[var(--rogym-text-secondary)] hover:border-[var(--rogym-border-teal-hover)] hover:bg-[var(--rogym-bg-card-hover)] hover:text-white'
        labelColor = 'text-[var(--rogym-text-secondary)]'
        topBarColor = 'border-[var(--rogym-border-white-dim)] bg-[var(--rogym-border-white-dim)]'
        break
    }
  }

  const tooltip = price
    ? `Ghế ${code} (${seatType === 'VIP' ? 'VIP' : seatType === 'COUPLE' ? 'Ghế đôi' : 'Thường'}) - ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)}`
    : `Ghế ${code} (${seatType === 'VIP' ? 'VIP' : seatType === 'COUPLE' ? 'Ghế đôi' : 'Thường'})`

  const widthClass = isCouple ? 'w-16 sm:w-20' : 'w-7 sm:w-8 md:w-9'
  const heightClass = 'h-7 sm:h-8 md:h-9'

  return (
    <button
      type="button"
      onClick={interactive && !disabled && !isBooked && !isHeld ? onClick : undefined}
      disabled={!interactive || disabled || isBooked || isHeld}
      title={tooltip}
      className={`group relative flex flex-col items-center justify-center rounded-t-md sm:rounded-t-lg rounded-b-sm border transition-all duration-150 select-none ${widthClass} ${heightClass} ${colorClasses} ${!interactive ? 'cursor-default' : ''} ${className}`}
    >
      {/* Tựa đầu/lưng ghế (Armchair Top Rest Bar) */}
      <span
        className={`absolute -top-1 inset-x-1 h-1 rounded-t-sm opacity-60 border-t ${topBarColor}`}
      />

      {/* Số ghế */}
      <span className={`text-[10px] sm:text-xs tracking-tight ${labelColor}`}>
        {isCouple ? code : seatNumber}
      </span>
    </button>
  )
}
