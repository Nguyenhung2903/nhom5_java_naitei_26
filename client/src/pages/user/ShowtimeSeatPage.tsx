import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { showtimeSeatService } from '@/services/showtimeSeatService'
import type { ShowtimeSeat } from '@/types/showtimeSeat'
import { ApiError } from '@/lib/api'
import {
  PageLoader,
  Alert,
  AlertDescription,
  Button,
} from '@/components/ui'
import { AlertCircle, ArrowLeft, Info, Clock } from 'lucide-react'

export function ShowtimeSeatPage() {
  const { showtimeId } = useParams<{ showtimeId: string }>()
  const navigate = useNavigate()

  const [seats, setSeats] = useState<ShowtimeSeat[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([])
  const [countdown, setCountdown] = useState<number | null>(null)
  const [holding, setHolding] = useState(false)

  const loadSeats = () => {
    if (!showtimeId) return
    setLoading(true)
    showtimeSeatService
      .getSeats(showtimeId)
      .then(setSeats)
      .catch((err: Error) => setError(err.message || 'Có lỗi xảy ra khi tải danh sách ghế'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadSeats()
  }, [showtimeId])

  useEffect(() => {
    if (countdown === null) return

    if (countdown <= 0) {
      setCountdown(null)
      setSelectedSeatIds([])
      loadSeats() // Reload seats when timer expires
      return
    }

    const timer = setInterval(() => {
      setCountdown((prev) => (prev !== null ? prev - 1 : null))
    }, 1000)

    return () => clearInterval(timer)
  }, [countdown])

  // Chuyển giây thành phút 
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  //Hàm chạy khi người dùng click vào ghế 
  const handleSeatClick = (seat: ShowtimeSeat) => {
    if (countdown !== null) return // Already holding, cannot change selection

    const now = new Date()
    const isHeld = seat.status === 'HELD'
    let isHeldValid = false

    if (isHeld && seat.heldUntil) {
      const heldUntilDate = new Date(seat.heldUntil)
      if (heldUntilDate > now) {
        isHeldValid = true // Someone else is holding it, or we are but we don't have the current user context here to know. Safest is to disable.
      }
    }

    if (seat.status === 'SOLD' || isHeldValid) return

    setSelectedSeatIds((prev) =>
      prev.includes(seat.id)
        ? prev.filter((id) => id !== seat.id)
        : [...prev, seat.id]
    )
  }

  const handleHoldSeats = async () => {
    if (!showtimeId || selectedSeatIds.length === 0) return

    setHolding(true)
    setError(null)

    try {
      await showtimeSeatService.holdSeats(showtimeId, selectedSeatIds)

      const holdExpiration = new Date().getTime() + 5 * 60 * 1000 // 5 minutes
      const seatsTotalAmount = seats
        .filter(s => selectedSeatIds.includes(s.id))
        .reduce((sum, s) => sum + s.price, 0)

      navigate(`/booking/${showtimeId}/combos`, {
        state: { holdExpiration, selectedSeatIds, seatsTotalAmount }
      })
    } catch (err: unknown) {
      if (err instanceof ApiError && err.status === 401) {
        navigate('/login')
        return
      }
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi giữ ghế')
    } finally {
      setHolding(false)
    }
  }

  if (loading && seats.length === 0) return <PageLoader ariaLabel="Đang tải sơ đồ ghế..." />

  const totalPrice = seats
    .filter(s => selectedSeatIds.includes(s.id))
    .reduce((sum, s) => sum + s.price, 0)

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header section */}
      <div className="flex items-center justify-between border-b border-[var(--rogym-border-subtle)] pb-4">
        <div className="flex items-center gap-4">
          <Link to="/movies" className="text-[var(--rogym-text-muted)] hover:text-white transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold font-display uppercase tracking-wide text-white">
              Chọn Ghế
            </h1>
            <p className="text-sm text-[var(--rogym-text-muted)] mt-1">
              Vui lòng chọn ghế ngồi mong muốn cho suất chiếu của bạn.
            </p>
          </div>
        </div>

        {countdown !== null && (
          <div className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 px-4 py-2 rounded-lg">
            <Clock className="w-5 h-5 animate-pulse" />
            <span className="font-mono font-bold text-lg">{formatTime(countdown)}</span>
          </div>
        )}
      </div>

      {error && (
        <Alert tone="error" icon={<AlertCircle className="w-4 h-4" />}>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Screen area (Màn hình) */}
      <div className="flex flex-col items-center justify-center my-8">
        <div className="w-full max-w-2xl h-8 bg-gradient-to-t from-[var(--rogym-surface)] to-[var(--rogym-border-focus)] rounded-t-xl mb-4 opacity-70"></div>
        <p className="text-[var(--rogym-text-muted)] text-sm tracking-[0.5em] uppercase font-bold">Màn Hình</p>
      </div>

      {/* Legend (Chú thích) */}
      <div className="flex justify-center gap-6 mb-8 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-[var(--rogym-surface-hover)] border border-[var(--rogym-border-subtle)]"></div>
          <span className="text-white">Ghế trống</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-gray-600 border border-gray-700"></div>
          <span className="text-[var(--rogym-text-muted)]">Đã bán</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-[var(--rogym-primary)]/20 border border-[var(--rogym-primary)]"></div>
          <span className="text-[var(--rogym-primary)]">Đang chọn</span>
        </div>
      </div>

      {/* Seat grid */}
      <div className="flex justify-center overflow-x-auto pb-8">
        {seats.length === 0 && !error ? (
          <div className="flex flex-col items-center justify-center p-12 text-[var(--rogym-text-muted)]">
            <Info className="w-12 h-12 mb-4 opacity-50" />
            <p>Không tìm thấy dữ liệu ghế cho suất chiếu này.</p>
          </div>
        ) : (
          <div className="grid grid-cols-10 gap-2 sm:gap-3">
            {seats.map((seat) => {
              const isBooked = seat.status === 'SOLD'
              const now = new Date()
              let isHeld = false
              if (seat.status === 'HELD' && seat.heldUntil) {
                const heldUntilDate = new Date(seat.heldUntil)
                if (heldUntilDate > now) isHeld = true
              }
              const isSelected = selectedSeatIds.includes(seat.id)

              //màu ghế trống 
              let seatClass = 'bg-[var(--rogym-surface-hover)] border-[var(--rogym-border-subtle)] text-white hover:border-[var(--rogym-primary)] hover:text-[var(--rogym-primary)] cursor-pointer transition-all'

              if (isBooked) {
                seatClass = 'bg-gray-700/50 border-gray-700 text-gray-500 cursor-not-allowed opacity-60'
              } else if (isSelected) {
                seatClass = countdown !== null
                  ? 'bg-yellow-500/20 border-yellow-500 text-yellow-500' // Show yellow when held
                  : 'bg-[var(--rogym-primary)]/20 border-[var(--rogym-primary)] text-[var(--rogym-primary)] shadow-[0_0_10px_rgba(34,197,94,0.3)]'
              } else if (isHeld) {
                seatClass = 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500/70 cursor-not-allowed'
              }

              return (
                <button
                  key={seat.id}
                  onClick={() => handleSeatClick(seat)}
                  disabled={isBooked || isHeld || countdown !== null}
                  title={`Ghế ${seat.seatRow}${seat.seatNumber} - ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(seat.price)}`}
                  className={`relative flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded text-xs sm:text-sm font-semibold border focus:outline-none ${seatClass}`}
                >
                  {seat.seatRow}{seat.seatNumber}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Footer actions */}
      <div className="flex items-center justify-between pt-4 border-t border-[var(--rogym-border-subtle)]">
        <div>
          {selectedSeatIds.length > 0 && (
            <div className="text-white">
              <span className="text-[var(--rogym-text-muted)] mr-2">Tổng tiền:</span>
              <span className="text-xl font-bold text-[var(--rogym-primary)]">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalPrice)}
              </span>
            </div>
          )}
        </div>
        <Button
          variant="primary"
          onClick={handleHoldSeats}
          disabled={selectedSeatIds.length === 0 || countdown !== null || holding}
          loading={holding}
        >
          {countdown !== null ? 'Đang giữ ghế...' : 'Tiếp tục thanh toán'}
        </Button>
      </div>
    </div>
  )
}
