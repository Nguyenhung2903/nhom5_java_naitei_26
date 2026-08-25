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

export const SeatMap: React.FC<SeatMapProps> = ({
  seats,
  selectedSeatIds = [],
  onSeatToggle,
  mode = 'booking',
  className = '',
  showLegend = true,
}) => {
  // Nhóm ghế theo hàng (A, B, C, D, E)
  const rows = useMemo(() => {
    const grouped: Record<string, GenericSeat[]> = {}
    seats.forEach((seat) => {
      const row = seat.seatRow
      if (!grouped[row]) grouped[row] = []
      grouped[row].push(seat)
    })

    const sortedRowKeys = Object.keys(grouped).sort()
    return sortedRowKeys.map((rowKey) => {
      const rowSeats = grouped[rowKey].sort((a, b) => a.seatNumber - b.seatNumber)
      return {
        rowKey,
        seats: rowSeats,
        isCoupleRow: rowSeats.some((s) => s.seatType === 'COUPLE'),
      }
    })
  }, [seats])

  // Helper tìm seat theo hàng và số ghế
  const getSeatByRowAndNumber = (rowKey: string, number: number) => {
    return seats.find((s) => s.seatRow === rowKey && s.seatNumber === number)
  }

  // Xử lý click ghế (tự động ghép cặp đối với ghế đôi COUPLE)
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

  return (
    <div className={`w-full flex flex-col items-center select-none ${className}`}>
      {/* Màn hình cong phát sáng */}
      <ScreenIndicator />

      {/* Sơ đồ ghế */}
      <div className="w-full max-w-4xl overflow-x-auto py-4 px-2 flex justify-center">
        <div className="flex flex-col gap-2.5 sm:gap-3.5 min-w-max items-center">
          {rows.map(({ rowKey, seats: rowSeats, isCoupleRow }) => {
            if (isCoupleRow) {
              // Hàng ghế đôi COUPLE (Ví dụ E1-E2, E3-E4, E5-E6, E7-E8, E9-E10)
              // Phân cụm 1 cặp (trái) - 3 cặp (giữa) - 1 cặp (phải) tương ứng 2 - 6 - 2 cột
              const pair1_2 = [getSeatByRowAndNumber(rowKey, 1), getSeatByRowAndNumber(rowKey, 2)].filter(Boolean) as GenericSeat[]
              const pair3_4 = [getSeatByRowAndNumber(rowKey, 3), getSeatByRowAndNumber(rowKey, 4)].filter(Boolean) as GenericSeat[]
              const pair5_6 = [getSeatByRowAndNumber(rowKey, 5), getSeatByRowAndNumber(rowKey, 6)].filter(Boolean) as GenericSeat[]
              const pair7_8 = [getSeatByRowAndNumber(rowKey, 7), getSeatByRowAndNumber(rowKey, 8)].filter(Boolean) as GenericSeat[]
              const pair9_10 = [getSeatByRowAndNumber(rowKey, 9), getSeatByRowAndNumber(rowKey, 10)].filter(Boolean) as GenericSeat[]

              const renderCouplePair = (pair: GenericSeat[]) => {
                if (pair.length === 0) return null
                const mainSeat = pair[0]
                const partnerSeat = pair.length > 1 ? pair[1] : undefined
                const isSelected = selectedSeatIds.includes(mainSeat.id) || (partnerSeat ? selectedSeatIds.includes(partnerSeat.id) : false)
                const booked = isSeatBooked(mainSeat) || (partnerSeat ? isSeatBooked(partnerSeat) : false)
                const held = isSeatHeld(mainSeat) || (partnerSeat ? isSeatHeld(partnerSeat) : false)
                const totalPrice = (mainSeat.price || 0) + (partnerSeat?.price || 0)

                return (
                  <SeatItem
                    key={`couple-${mainSeat.id}`}
                    seatRow={mainSeat.seatRow}
                    seatNumber={mainSeat.seatNumber}
                    couplePartnerNumber={partnerSeat?.seatNumber}
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

              return (
                <div key={rowKey} className="flex items-center gap-2 sm:gap-3">
                  {/* Nhãn hàng bên trái */}
                  <span className="w-5 sm:w-6 text-center text-xs sm:text-sm font-bold text-[var(--rogym-text-muted)]">
                    {rowKey}
                  </span>

                  {/* Cụm trái (1 cặp: E1-E2) */}
                  <div className="flex items-center gap-2">
                    {renderCouplePair(pair1_2)}
                  </div>

                  {/* Lối đi trái */}
                  <div className="w-4 sm:w-7 h-8 flex items-center justify-center border-l border-dashed border-[var(--rogym-border-white-dim)]" />

                  {/* Cụm giữa (3 cặp: E3-E4, E5-E6, E7-E8) */}
                  <div className="flex items-center gap-2 sm:gap-3">
                    {renderCouplePair(pair3_4)}
                    {renderCouplePair(pair5_6)}
                    {renderCouplePair(pair7_8)}
                  </div>

                  {/* Lối đi phải */}
                  <div className="w-4 sm:w-7 h-8 flex items-center justify-center border-r border-dashed border-[var(--rogym-border-white-dim)]" />

                  {/* Cụm phải (1 cặp: E9-E10) */}
                  <div className="flex items-center gap-2">
                    {renderCouplePair(pair9_10)}
                  </div>

                  {/* Nhãn hàng bên phải */}
                  <span className="w-5 sm:w-6 text-center text-xs sm:text-sm font-bold text-[var(--rogym-text-muted)]">
                    {rowKey}
                  </span>
                </div>
              )
            }

            // Hàng ghế đơn (NORMAL / VIP) - Chia cụm 2 - 6 - 2
            const leftCluster = rowSeats.filter((s) => s.seatNumber <= 2)
            const centerCluster = rowSeats.filter((s) => s.seatNumber >= 3 && s.seatNumber <= 8)
            const rightCluster = rowSeats.filter((s) => s.seatNumber >= 9)

            const renderSingleSeat = (seat: GenericSeat) => {
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
                  isSelected={isSelected}
                  isBooked={booked}
                  isHeld={held}
                  interactive={mode === 'booking'}
                  onClick={() => handleItemClick(seat)}
                />
              )
            }

            return (
              <div key={rowKey} className="flex items-center gap-2 sm:gap-3">
                {/* Nhãn hàng bên trái */}
                <span className="w-5 sm:w-6 text-center text-xs sm:text-sm font-bold text-[var(--rogym-text-muted)]">
                  {rowKey}
                </span>

                {/* Cụm trái: Cột 1, 2 */}
                <div className="flex items-center gap-1.5 sm:gap-2">
                  {leftCluster.map(renderSingleSeat)}
                </div>

                {/* Lối đi trái */}
                <div className="w-4 sm:w-7 h-8 flex items-center justify-center border-l border-dashed border-[var(--rogym-border-white-dim)]" />

                {/* Cụm giữa: Cột 3 -> 8 */}
                <div className="flex items-center gap-1.5 sm:gap-2">
                  {centerCluster.map(renderSingleSeat)}
                </div>

                {/* Lối đi phải */}
                <div className="w-4 sm:w-7 h-8 flex items-center justify-center border-r border-dashed border-[var(--rogym-border-white-dim)]" />

                {/* Cụm phải: Cột 9, 10 */}
                <div className="flex items-center gap-1.5 sm:gap-2">
                  {rightCluster.map(renderSingleSeat)}
                </div>

                {/* Nhãn hàng bên phải */}
                <span className="w-5 sm:w-6 text-center text-xs sm:text-sm font-bold text-[var(--rogym-text-muted)]">
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
            <div className="w-4 h-4 rounded-sm border border-[var(--rogym-border-white-button)]/40 bg-[var(--rogym-bg-card)]" />
            <span className="text-[var(--rogym-text-secondary)]">Ghế Thường</span>
          </div>

          {/* Ghế VIP */}
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-sm border border-[var(--rogym-teal)] bg-[var(--rogym-bg-elevated-green)]" />
            <span className="text-[var(--rogym-teal)] font-medium">Ghế VIP</span>
          </div>

          {/* Ghế Đôi */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-4 rounded-sm border border-rose-500/60 bg-rose-500/20" />
            <span className="text-rose-300 font-medium">Ghế Đôi</span>
          </div>

          {mode === 'booking' && (
            <>
              {/* Đang chọn */}
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-sm border border-[var(--rogym-green)] bg-[var(--rogym-green)]/25 shadow-[var(--rogym-shadow-tone-sm)]" />
                <span className="text-[var(--rogym-green)] font-medium">Đang chọn</span>
              </div>

              {/* Đang giữ */}
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-sm border border-amber-500/50 bg-amber-500/15 animate-pulse" />
                <span className="text-amber-400">Đang giữ</span>
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
