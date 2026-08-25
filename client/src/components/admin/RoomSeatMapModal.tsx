import React, { useEffect, useState } from 'react'
import { Modal, Button, Spinner } from '@/components/ui'
import { SeatMap } from '@/components/seat'
import { seatService } from '@/services/seatService'
import type { Room } from '@/types/room'
import type { Seat } from '@/types/seat'
import { Armchair, Sparkles, Heart } from 'lucide-react'

interface RoomSeatMapModalProps {
  room: Room | null
  open: boolean
  onClose: () => void
}

export const RoomSeatMapModal: React.FC<RoomSeatMapModalProps> = ({
  room,
  open,
  onClose,
}) => {
  const [seats, setSeats] = useState<Seat[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open || !room?.id) return

    setLoading(true)
    setError(null)
    seatService
      .getByRoomId(room.id)
      .then((data) => {
        setSeats(data)
      })
      .catch((err: Error) => {
        setError(err.message || 'Không thể tải danh sách ghế của phòng chiếu')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [open, room?.id])

  if (!room) return null

  const normalSeats = seats.filter((s) => s.seatType === 'NORMAL')
  const vipSeats = seats.filter((s) => s.seatType === 'VIP')
  const coupleSeats = seats.filter((s) => s.seatType === 'COUPLE')

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Sơ đồ chỗ ngồi - ${room.name} (${room.theaterName})`}
      size="4xl"
      footer={
        <Button variant="secondary" onClick={onClose}>
          Đóng
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Thống kê nhanh cấu hình phòng */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-[var(--rogym-bg-elevated)] border border-[var(--rogym-border-subtle)] flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[var(--rogym-green)]/15 text-[var(--rogym-green)]">
              <Armchair className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-[var(--rogym-text-muted)]">Tổng số ghế</p>
              <p className="text-lg font-bold text-white">{seats.length}</p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[var(--rogym-bg-elevated)] border border-[var(--rogym-border-subtle)] flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/15 text-purple-400">
              <Armchair className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-[var(--rogym-text-muted)]">Ghế thường (A-B)</p>
              <p className="text-lg font-bold text-purple-300">{normalSeats.length}</p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[var(--rogym-bg-elevated)] border border-[var(--rogym-border-subtle)] flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/15 text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-[var(--rogym-text-muted)]">Ghế VIP (C-D)</p>
              <p className="text-lg font-bold text-amber-300">{vipSeats.length}</p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[var(--rogym-bg-elevated)] border border-[var(--rogym-border-subtle)] flex items-center gap-3">
            <div className="p-2 rounded-lg bg-rose-500/15 text-rose-400">
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-[var(--rogym-text-muted)]">Ghế đôi (E1-E10)</p>
              <p className="text-lg font-bold text-rose-300">
                {coupleSeats.length} ({coupleSeats.length / 2} cặp)
              </p>
            </div>
          </div>
        </div>

        {/* Nội dung sơ đồ ghế */}
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-3">
            <Spinner size={32} />
            <p className="text-sm text-[var(--rogym-text-muted)]">Đang tải sơ đồ ghế...</p>
          </div>
        ) : error ? (
          <div className="p-6 text-center text-red-400 bg-red-500/10 rounded-xl border border-red-500/20">
            {error}
          </div>
        ) : seats.length === 0 ? (
          <div className="p-8 text-center text-[var(--rogym-text-muted)]">
            Chưa có dữ liệu ghế cho phòng này.
          </div>
        ) : (
          <div className="rounded-xl bg-[var(--rogym-bg-deep)] border border-[var(--rogym-border-subtle)] p-4 sm:p-6 overflow-hidden">
            <SeatMap seats={seats} mode="preview" />
          </div>
        )}
      </div>
    </Modal>
  )
}

