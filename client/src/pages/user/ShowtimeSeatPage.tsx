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
import { SeatMap } from '@/components/seat'
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

  // Hàm toggle ghế (hỗ trợ chọn đồng thời cả 2 ghế đối với ghế đôi COUPLE)
  const handleSeatToggle = (seat: ShowtimeSeat, partnerSeat?: ShowtimeSeat) => {
    if (countdown !== null) return // Đang giữ ghế, không thể thay đổi

    const targetIds = partnerSeat ? [seat.id, partnerSeat.id] : [seat.id]
    const isAlreadySelected = targetIds.some((id) => selectedSeatIds.includes(id))

    if (isAlreadySelected) {
      setSelectedSeatIds((prev) => prev.filter((id) => !targetIds.includes(id)))
    } else {
      setSelectedSeatIds((prev) => [...prev, ...targetIds])
    }
  }

  const handleHoldSeats = async () => {
    if (!showtimeId || selectedSeatIds.length === 0) return

    setHolding(true)
    setError(null)

    try {
      await showtimeSeatService.holdSeats(showtimeId, selectedSeatIds)

      const holdExpiration = new Date().getTime() + 5 * 60 * 1000 // 5 minutes
      const seatsTotalAmount = seats
        .filter((s) => selectedSeatIds.includes(s.id))
        .reduce((sum, s) => sum + s.price, 0)

      navigate(`/user/booking/${showtimeId}/combos`, {
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

  const selectedSeats = seats.filter((s) => selectedSeatIds.includes(s.id))
  const totalPrice = selectedSeats.reduce((sum, s) => sum + s.price, 0)

  const selectedSeatsSummary = useMemo(() => {
    const list: { label: string; isCouple: boolean }[] = []
    const processed = new Set<string>()

    const selected = seats.filter((s) => selectedSeatIds.includes(s.id))
    for (const s of selected) {
      if (processed.has(s.id)) continue

      if (s.seatType === 'COUPLE') {
        const partner = selected.find(
          (other) =>
            other.id !== s.id &&
            other.seatRow === s.seatRow &&
            other.seatType === 'COUPLE' &&
            Math.abs(other.seatNumber - s.seatNumber) === 1
        )
        if (partner) {
          processed.add(s.id)
          processed.add(partner.id)
          const minNum = Math.min(s.seatNumber, partner.seatNumber)
          const maxNum = Math.max(s.seatNumber, partner.seatNumber)
          list.push({ label: `${s.seatRow}${minNum}-${s.seatRow}${maxNum} (Đôi)`, isCouple: true })
          continue
        }
      }

      processed.add(s.id)
      list.push({ label: `${s.seatRow}${s.seatNumber}`, isCouple: false })
    }
    return list
  }, [seats, selectedSeatIds])

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header section */}
      <div className="flex items-center justify-between border-b border-[var(--rogym-border-subtle)] pb-4">
        <div className="flex items-center gap-4">
          <Link to="/user/movies" className="text-[var(--rogym-text-muted)] hover:text-white transition-colors">
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
          <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 px-4 py-2 rounded-lg">
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

      {/* Seat Map Area */}
      {seats.length === 0 && !error ? (
        <div className="flex flex-col items-center justify-center p-12 text-[var(--rogym-text-muted)] bg-[var(--rogym-bg-card)] rounded-2xl border border-[var(--rogym-border-subtle)]">
          <Info className="w-12 h-12 mb-4 opacity-50" />
          <p>Không tìm thấy dữ liệu ghế cho suất chiếu này.</p>
        </div>
      ) : (
        <div className="p-4 sm:p-8 rounded-2xl bg-[var(--rogym-bg-deep)] border border-[var(--rogym-border-subtle)] shadow-2xl">
          <SeatMap
            seats={seats}
            selectedSeatIds={selectedSeatIds}
            onSeatToggle={(seat, partner) =>
              handleSeatToggle(seat as ShowtimeSeat, partner as ShowtimeSeat | undefined)
            }
            mode="booking"
          />
        </div>
      )}

      {/* Selected Seats summary & Footer actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[var(--rogym-border-subtle)]">
        <div className="flex flex-wrap items-center gap-3">
          {selectedSeatIds.length > 0 ? (
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm text-[var(--rogym-text-muted)]">Ghế đã chọn:</span>
              <div className="flex flex-wrap gap-1.5">
                {selectedSeatsSummary.map((item, idx) => (
                  <span
                    key={idx}
                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold border ${
                      item.isCouple
                        ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                        : 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
                    }`}
                  >
                    {item.label}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <span className="text-xs sm:text-sm text-[var(--rogym-text-dim)] italic">
              Chưa chọn ghế nào
            </span>
          )}
        </div>

        <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
          {selectedSeatIds.length > 0 && (
            <div className="text-right">
              <span className="text-xs text-[var(--rogym-text-muted)] block">Tổng tiền</span>
              <span className="text-xl sm:text-2xl font-bold text-[var(--rogym-green)]">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalPrice)}
              </span>
            </div>
          )}
          <Button
            variant="primary"
            onClick={handleHoldSeats}
            disabled={selectedSeatIds.length === 0 || countdown !== null || holding}
            loading={holding}
            className="w-full sm:w-auto px-6 py-2.5"
          >
            {countdown !== null ? 'Đang giữ ghế...' : 'Tiếp tục thanh toán'}
          </Button>
        </div>
      </div>
    </div>
  )
}
