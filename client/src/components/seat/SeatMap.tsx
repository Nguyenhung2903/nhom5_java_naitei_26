import React, { useMemo } from 'react'
import { ScreenIndicator } from './ScreenIndicator'
import { SeatItem } from './SeatItem'
import type { Seat, SeatType } from '@/types/seat'
import type { ShowtimeSeat, ShowtimeSeatStatus } from '@/types/showtimeSeat'

export type GenericSeat = (Seat | ShowtimeSeat) & {
  seatType: SeatType
  status?: ShowtimeSeatStatus
  heldUntil?: string | null
  price?: number
}

export interface SeatMapProps {
  seats: GenericSeat[]
  selectedSeatIds?: string[]
  onSeatToggle?: (seat: GenericSeat, partnerSeat?: GenericSeat) => void
  mode?: 'booking' | 'preview'
  className?: string
  showLegend?: boolean
}

interface RowItem {
  type: 'single' | 'couple'
  seat: GenericSeat
  partnerSeat?: GenericSeat
  seatNumber: number
}

export const SeatMap: React.FC<SeatMapProps> = ({
  seats,
  selectedSeatIds = [],
  onSeatToggle,
  mode = 'booking',
  className = '',
  showLegend = true,
}) => {
  // Tìm số ghế lớn nhất trong cả phòng để tính toán vị trí lối đi
  const maxSeatNumberInRoom = useMemo(() => {
    if (seats.length === 0) return 10
    return Math.max(...seats.map((s) => s.seatNumber), 10)
  }, [seats])

  // Nhóm ghế theo hàng (A, B, C, D, E...) và sắp xếp tự nhiên
  const rows = useMemo(() => {
    const grouped: Record<string, GenericSeat[]> = {}
    seats.forEach((seat) => {
      const row = seat.seatRow.toUpperCase()
      if (!grouped[row]) grouped[row] = []
      grouped[row].push(seat)
    })

    const sortedRowKeys = Object.keys(grouped).sort((a, b) =>
      a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
    )

    return sortedRowKeys.map((rowKey) => {
      const rowSeats = grouped[rowKey].sort((a, b) => a.seatNumber - b.seatNumber)

      // Xử lý gom cặp ghế đôi (COUPLE) động không giới hạn số lượng ghế
      const items: RowItem[] = []
      for (let i = 0; i < rowSeats.length; i++) {
        const current = rowSeats[i]
        const next = rowSeats[i + 1]

        if (
          current.seatType === 'COUPLE' &&
          next &&
          next.seatType === 'COUPLE' &&
          next.seatNumber === current.seatNumber + 1
        ) {
          items.push({
            type: 'couple',
            seat: current,
            partnerSeat: next,
            seatNumber: current.seatNumber,
          })
          i++ // Bỏ qua ghế bạn đã ghép cặp
        } else {
          items.push({
            type: 'single',
            seat: current,
            seatNumber: current.seatNumber,
          })
        }
      }

      return {
        rowKey,
        items,
        totalSeatsInRow: rowSeats.length,
      }
    })
  }, [seats])

  // Xử lý click ghế (tự động chọn cả 2 ghế đối với ghế đôi COUPLE)
  const handleItemClick = (seat: GenericSeat, partnerSeat?: GenericSeat) => {
    if (onSeatToggle) {
      onSeatToggle(seat, partnerSeat)
    }
  }

  const isSeatBooked = (seat: GenericSeat) => {
    return seat.status === 'BOOKED'
  }

  const isSeatHeld = (seat: GenericSeat) => {
    if (seat.status !== 'HELD') return false
    if (!seat.heldUntil) return true
    return new Date(seat.heldUntil) > new Date()
  }

  const renderItem = (item: RowItem) => {
    if (item.type === 'couple' && item.partnerSeat) {
      const mainSeat = item.seat
      const partnerSeat = item.partnerSeat
      const isSelected =
        selectedSeatIds.includes(mainSeat.id) || selectedSeatIds.includes(partnerSeat.id)
      const booked = isSeatBooked(mainSeat) || isSeatBooked(partnerSeat)
      const held = isSeatHeld(mainSeat) || isSeatHeld(partnerSeat)
      const totalPrice = (mainSeat.price || 0) + (partnerSeat.price || 0)

      return (
        <SeatItem
          key={`couple-${mainSeat.id}-${partnerSeat.id}`}
          seatRow={mainSeat.seatRow}
          seatNumber={mainSeat.seatNumber}
          couplePartnerNumber={partnerSeat.seatNumber}
          seatType="COUPLE"
          price={totalPrice > 0 ? totalPrice : undefined}
          isCouple={true}
          isSelected={isSelected}
          isBooked={booked}
          isHeld={held}
          interactive={mode === 'booking'}
          onClick={() => handleItemClick(mainSeat, partnerSeat)}
        />
      )
    }

    // Ghế đơn lẻ (NORMAL, VIP hoặc COUPLE đơn lẻ)
    const seat = item.seat
    const isSelected = selectedSeatIds.includes(seat.id)
    const booked = isSeatBooked(seat)
    const held = isSeatHeld(seat)

    return (
      <SeatItem
        key={seat.id}
        seatRow={seat.seatRow}
        seatNumber={seat.seatNumber}
        seatType={seat.seatType}
        price={seat.price}
        isCouple={seat.seatType === 'COUPLE'}
        isSelected={isSelected}
        isBooked={booked}
        isHeld={held}
        interactive={mode === 'booking'}
        onClick={() => handleItemClick(seat)}
      />
    )
  }

  return (
    <div className={`w-full flex flex-col items-center select-none ${className}`}>
      {/* Màn hình cong phát sáng */}
      <ScreenIndicator />

      {/* Sơ đồ ghế */}
      <div className="w-full max-w-5xl overflow-x-auto py-4 px-2 flex justify-center">
        <div className="flex flex-col gap-2.5 sm:gap-3.5 min-w-max items-center">
          {rows.map(({ rowKey, items }) => {
            // Tách các cụm linh hoạt theo lối đi chuẩn nếu hàng có từ 8 ghế trở lên
            const useAisles = maxSeatNumberInRoom >= 8 && items.length >= 4

            const leftThreshold = 2
            const rightThreshold = maxSeatNumberInRoom - 1

            const leftCluster = useAisles
              ? items.filter((it) => it.seatNumber <= leftThreshold)
              : []
            const centerCluster = useAisles
              ? items.filter((it) => it.seatNumber > leftThreshold && it.seatNumber < rightThreshold)
              : items
            const rightCluster = useAisles
              ? items.filter((it) => it.seatNumber >= rightThreshold)
              : []

            return (
              <div key={rowKey} className="flex items-center gap-2 sm:gap-3">
                {/* Nhãn hàng bên trái */}
                <span className="w-6 sm:w-7 text-center text-xs sm:text-sm font-bold text-[var(--rogym-text-muted)] font-mono">
                  {rowKey}
                </span>

                {/* Cụm trái */}
                {leftCluster.length > 0 && (
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    {leftCluster.map(renderItem)}
                  </div>
                )}

                {/* Lối đi bên trái */}
                {leftCluster.length > 0 && (
                  <div className="w-3 sm:w-6 h-8 flex items-center justify-center border-l border-dashed border-[var(--rogym-border-white-dim)]" />
                )}

                {/* Cụm giữa */}
                <div className="flex items-center gap-1.5 sm:gap-2">
                  {centerCluster.map(renderItem)}
                </div>

                {/* Lối đi bên phải */}
                {rightCluster.length > 0 && (
                  <div className="w-3 sm:w-6 h-8 flex items-center justify-center border-r border-dashed border-[var(--rogym-border-white-dim)]" />
                )}

                {/* Cụm phải */}
                {rightCluster.length > 0 && (
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    {rightCluster.map(renderItem)}
                  </div>
                )}

                {/* Nhãn hàng bên phải */}
                <span className="w-6 sm:w-7 text-center text-xs sm:text-sm font-bold text-[var(--rogym-text-muted)] font-mono">
                  {rowKey}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Thanh chú thích (Legend) */}
      {showLegend && (
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 mt-6 py-3 px-4 sm:px-6 rounded-xl bg-[var(--rogym-bg-card)] border border-[var(--rogym-border-subtle)] text-xs sm:text-sm">
          {/* Ghế thường */}
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-sm border border-emerald-500/60 bg-emerald-950/40" />
            <span className="text-emerald-400 font-medium">Ghế Thường</span>
          </div>

          {/* Ghế VIP */}
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-sm border border-amber-500/60 bg-amber-950/40" />
            <span className="text-amber-400 font-medium">Ghế VIP</span>
          </div>

          {/* Ghế Đôi */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-4 rounded-sm border border-rose-500/60 bg-rose-950/40" />
            <span className="text-rose-300 font-medium">Ghế Đôi</span>
          </div>

          {mode === 'booking' && (
            <>
              {/* Đang chọn */}
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-sm border border-cyan-400 bg-cyan-500/25 shadow-[0_0_8px_rgba(6,182,212,0.5)]" />
                <span className="text-cyan-300 font-medium">Đang chọn</span>
              </div>

              {/* Đang giữ */}
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-sm border border-amber-500/50 bg-amber-500/15 animate-pulse" />
                <span className="text-amber-400 font-medium">Đang giữ</span>
              </div>

              {/* Đã bán */}
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-sm border border-[var(--rogym-border-subtle)] bg-[var(--rogym-bg-elevated)] opacity-40" />
                <span className="text-[var(--rogym-text-faint)]">Đã bán</span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

