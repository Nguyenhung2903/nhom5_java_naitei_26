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

  // Xác định style theo design system token & bảng màu mới
  let colorClasses = ''
  let labelColor = 'text-[var(--rogym-text-primary)]'
  let topBarColor = 'border-[var(--rogym-border-white-dim)] bg-[var(--rogym-border-white-dim)]'

  if (isBooked) {
    colorClasses = 'bg-[var(--rogym-bg-elevated)] border-[var(--rogym-border-subtle)] text-[var(--rogym-text-faint)] cursor-not-allowed opacity-40'
    labelColor = 'text-[var(--rogym-text-faint)]'
    topBarColor = 'border-[var(--rogym-border-subtle)] bg-[var(--rogym-border-subtle)]'
  } else if (isSelected) {
    colorClasses = 'bg-cyan-500/25 border-cyan-400 text-cyan-200 shadow-[0_0_12px_rgba(6,182,212,0.6)] scale-[1.04]'
    labelColor = 'text-cyan-200 font-bold'
    topBarColor = 'border-cyan-400 bg-cyan-400'
  } else if (isHeld) {
    colorClasses = 'bg-amber-500/15 border-amber-500/50 text-amber-400 cursor-not-allowed opacity-75 animate-pulse'
    labelColor = 'text-amber-400'
    topBarColor = 'border-amber-400 bg-amber-400'
  } else {
    // Trạng thái khả dụng (AVAILABLE / Preview)
    switch (seatType) {
      case 'VIP':
        colorClasses = 'bg-amber-950/40 border-amber-500/60 text-amber-300 hover:border-amber-400 hover:bg-amber-900/50 hover:text-amber-100 hover:shadow-[0_0_8px_rgba(245,158,11,0.35)]'
        labelColor = 'text-amber-300 font-semibold'
        topBarColor = 'border-amber-400 bg-amber-400'
        break
      case 'COUPLE':
        colorClasses = 'bg-rose-950/40 border-rose-500/60 text-rose-300 hover:bg-rose-900/50 hover:border-rose-400 hover:shadow-[0_0_8px_rgba(244,63,94,0.35)]'
        labelColor = 'text-rose-300 font-semibold'
        topBarColor = 'border-rose-400 bg-rose-400'
        break
      case 'NORMAL':
      default:
        colorClasses = 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300 hover:border-emerald-400 hover:bg-emerald-900/50 hover:text-emerald-100 hover:shadow-[0_0_8px_rgba(16,185,129,0.25)]'
        labelColor = 'text-emerald-300 font-medium'
        topBarColor = 'border-emerald-500/60 bg-emerald-500/60'
        break
    }
  }

  const tooltip = price
    ? `Ghế ${code} (${seatType === 'VIP' ? 'VIP' : seatType === 'COUPLE' ? 'Ghế đôi' : 'Thường'}) - ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)}`
    : `Ghế ${code} (${seatType === 'VIP' ? 'VIP' : seatType === 'COUPLE' ? 'Ghế đôi' : 'Thường'})`

  const widthClass = isCouple ? 'w-[62px] sm:w-[72px] md:w-[80px]' : 'w-7 sm:w-8 md:w-9'
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

      {/* Tên / Số ghế (A1, A2... E1-E2) */}
      <span className={`text-[9px] sm:text-[11px] md:text-xs tracking-tighter sm:tracking-tight ${labelColor}`}>
        {code}
      </span>
    </button>
  )
}
