import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import type { MyBookingResponse } from '@/services/bookingService'
import { bookingService } from '@/services/bookingService'
import { PageLoader, Button, Badge, ConfirmDialog, Alert } from '@/components/ui'
import { TicketIcon, Calendar, Clock, MapPin, Popcorn, AlertCircle, Ban } from 'lucide-react'
import { format } from 'date-fns'

export function MyTicketsPage() {
  const [bookings, setBookings] = useState<MyBookingResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Cancellation state
  const [selectedBookingForCancel, setSelectedBookingForCancel] = useState<MyBookingResponse | null>(null)
  const [isCancelling, setIsCancelling] = useState(false)
  const [actionAlert, setActionAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true)
      const data = await bookingService.getMyBookings()
      setBookings(data)
    } catch (err: any) {
      setError(err.message || 'Không thể tải danh sách vé. Vui lòng thử lại sau.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBookings()
  }, [fetchBookings])

  const handleConfirmCancel = async () => {
    if (!selectedBookingForCancel) return

    try {
      setIsCancelling(true)
      setActionAlert(null)
      await bookingService.cancelBooking(selectedBookingForCancel.id)
      setActionAlert({
        type: 'success',
        message: `Hủy vé mã ${selectedBookingForCancel.bookingCode} thành công. Ghế đã được hoàn trả về hệ thống!`,
      })
      setSelectedBookingForCancel(null)
      await fetchBookings()
    } catch (err: any) {
      setActionAlert({
        type: 'error',
        message: err.message || 'Không thể hủy vé. Vui lòng thử lại sau.',
      })
    } finally {
      setIsCancelling(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <PageLoader ariaLabel="Đang tải danh sách vé..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="inline-flex items-center justify-center p-4 rounded-full bg-red-500/10 mb-4">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-xl font-semibold text-white mb-2">Đã xảy ra lỗi</h2>
        <p className="text-[var(--rogym-text-muted)] mb-6">{error}</p>
        <Button variant="secondary" onClick={() => window.location.reload()}>Thử lại</Button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 md:py-16">
      <div className="flex items-center justify-between gap-3 mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[var(--rogym-primary)]/10 rounded-xl">
            <TicketIcon className="w-6 h-6 text-[var(--rogym-primary)]" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold text-white">Vé Của Tôi</h1>
            <p className="text-sm text-[var(--rogym-text-muted)] mt-1">Quản lý lịch sử đặt vé, hủy vé và thanh toán của bạn</p>
          </div>
        </div>
      </div>

      {actionAlert && (
        <div className="mb-6">
          <Alert
            tone={actionAlert.type === 'success' ? 'success' : 'error'}
            onClose={() => setActionAlert(null)}
          >
            {actionAlert.message}
          </Alert>
        </div>
      )}

      {bookings.length === 0 ? (
        <div className="bg-[var(--rogym-surface)] border border-[var(--rogym-border-subtle)] rounded-2xl p-12 text-center flex flex-col items-center">
          <div className="w-20 h-20 bg-[var(--rogym-bg-base)] rounded-full flex items-center justify-center mb-6">
            <TicketIcon className="w-10 h-10 text-[var(--rogym-text-muted)]" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Bạn chưa có vé nào</h3>
          <p className="text-[var(--rogym-text-secondary)] mb-8 max-w-sm">
            Bạn chưa thực hiện giao dịch đặt vé nào. Hãy chọn bộ phim yêu thích và tận hưởng ngay!
          </p>
          <Link to="/user/movies">
            <Button variant="primary">Đặt Vé Ngay</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {bookings.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              onCancelRequest={() => {
                setActionAlert(null)
                setSelectedBookingForCancel(booking)
              }}
            />
          ))}
        </div>
      )}

      {/* Confirmation Dialog for Ticket Cancellation */}
      <ConfirmDialog
        open={Boolean(selectedBookingForCancel)}
        onClose={() => {
          if (!isCancelling) setSelectedBookingForCancel(null)
        }}
        onConfirm={handleConfirmCancel}
        title="Xác nhận hủy vé xem phim"
        confirmLabel={isCancelling ? 'Đang hủy vé...' : 'Xác nhận hủy vé'}
        cancelLabel="Quay lại"
        variant="danger"
        loading={isCancelling}
        description={
          selectedBookingForCancel ? (
            <div className="space-y-3 text-left">
              <p className="text-sm text-[var(--rogym-text-secondary)]">
                Bạn có chắc chắn muốn hủy đơn vé <strong className="text-white font-mono">{selectedBookingForCancel.bookingCode}</strong>?
              </p>
              <div className="p-3.5 bg-white/5 rounded-xl border border-white/10 space-y-1.5 text-xs text-[var(--rogym-text-secondary)]">
                <p><strong className="text-white">Phim:</strong> {selectedBookingForCancel.movieTitle}</p>
                <p><strong className="text-white">Rạp:</strong> {selectedBookingForCancel.theaterName} - {selectedBookingForCancel.roomName}</p>
                <p><strong className="text-white">Suất chiếu:</strong> {format(new Date(selectedBookingForCancel.showtimeStartTime), 'dd/MM/yyyy HH:mm')}</p>
                <p><strong className="text-white">Ghế:</strong> {selectedBookingForCancel.seatNames?.join(', ')}</p>
                <p><strong className="text-white">Số tiền:</strong> {selectedBookingForCancel.totalAmount.toLocaleString('vi-VN')}đ</p>
              </div>
              <p className="text-xs text-red-400 font-medium">
                * Lưu ý: Sau khi xác nhận hủy, các ghế này sẽ được giải phóng ngay lập tức để người khác có thể đặt và thao tác này không thể hoàn tác.
              </p>
            </div>
          ) : null
        }
      />
    </div>
  )
}

function BookingCard({
  booking,
  onCancelRequest,
}: {
  booking: MyBookingResponse
  onCancelRequest: () => void
}) {
  const isSuccess = booking.bookingStatus === 'CONFIRMED'
  const isCancelled = booking.bookingStatus === 'CANCELLED'

  const isShowtimeFuture = booking.showtimeStartTime
    ? new Date(booking.showtimeStartTime).getTime() > Date.now()
    : false

  const canCancel = isSuccess && isShowtimeFuture

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border transition-all duration-300 ${
        isSuccess
          ? 'border-[var(--rogym-primary)]/30 bg-[var(--rogym-surface)] hover:border-[var(--rogym-primary)]/60 hover:shadow-[0_0_20px_rgba(var(--rogym-primary-rgb),0.1)]'
          : 'border-[var(--rogym-border-subtle)] bg-[var(--rogym-bg-base)]/50 opacity-85'
      }`}
    >
      {/* Decals */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[var(--rogym-primary)]/5 to-transparent rounded-bl-full pointer-events-none" />

      <div className="flex flex-col md:flex-row">
        {/* Left Side: Movie Poster (Hidden on mobile for compact view, shown on md+) */}
        {booking.moviePoster && (
          <div className="hidden md:block w-40 shrink-0 relative p-4">
            <img
              src={booking.moviePoster}
              alt={booking.movieTitle}
              className="w-full h-full object-cover rounded-xl shadow-lg border border-white/5 aspect-[2/3]"
            />
            {booking.ageRating && (
              <div className="absolute bottom-6 right-6">
                <Badge
                  tone={
                    booking.ageRating.includes('18')
                      ? 'danger'
                      : booking.ageRating.includes('16')
                      ? 'warning'
                      : 'success'
                  }
                  size="sm"
                >
                  {booking.ageRating}
                </Badge>
              </div>
            )}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 p-5 md:p-6 md:pl-2 flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
              <div>
                <h3
                  className={`text-lg md:text-xl font-bold mb-1 ${
                    isSuccess ? 'text-white' : 'text-[var(--rogym-text-secondary)]'
                  }`}
                >
                  {booking.movieTitle || 'Vé Đặt (Không xác định phim)'}
                </h3>
                <div className="flex items-center gap-2 text-xs text-[var(--rogym-text-muted)]">
                  <span>
                    Mã đơn: <span className="font-mono text-[var(--rogym-text-secondary)]">{booking.bookingCode}</span>
                  </span>
                  <span>•</span>
                  <span>{format(new Date(booking.bookingTime), 'dd/MM/yyyy HH:mm')}</span>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2 shrink-0">
                <Badge tone={isSuccess ? 'success' : isCancelled ? 'danger' : 'muted'}>
                  {isSuccess ? 'Thành công' : isCancelled ? 'Đã hủy' : booking.bookingStatus}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
              <div className="space-y-2">
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-[var(--rogym-text-muted)] mt-0.5 shrink-0" />
                  <div className="text-sm">
                    <p className="text-white font-medium">{booking.theaterName}</p>
                    <p className="text-[var(--rogym-text-muted)] text-xs mt-0.5">{booking.roomName}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Calendar className="w-4 h-4 text-[var(--rogym-text-muted)] mt-0.5 shrink-0" />
                  <div className="text-sm">
                    <p className="text-white font-medium">{format(new Date(booking.showtimeStartTime), 'dd/MM/yyyy')}</p>
                    <div className="flex items-center gap-1.5 text-[var(--rogym-text-muted)] text-xs mt-0.5">
                      <Clock className="w-3 h-3" />
                      <span>
                        {format(new Date(booking.showtimeStartTime), 'HH:mm')} - {format(new Date(booking.showtimeEndTime), 'HH:mm')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-2.5">
                  <TicketIcon className="w-4 h-4 text-[var(--rogym-text-muted)] mt-0.5 shrink-0" />
                  <div className="text-sm">
                    <p className="text-[var(--rogym-text-secondary)] text-xs mb-1">Ghế đã chọn</p>
                    <div className="flex flex-wrap gap-1.5">
                      {booking.seatNames?.length > 0 ? (
                        booking.seatNames.map((seat, idx) => (
                          <span
                            key={idx}
                            className={`px-2 py-0.5 rounded text-xs font-semibold ${
                              isSuccess
                                ? 'bg-[var(--rogym-primary)]/10 text-[var(--rogym-primary)] border border-[var(--rogym-primary)]/20'
                                : 'bg-white/5 text-[var(--rogym-text-muted)] border border-white/10'
                            }`}
                          >
                            {seat}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-[var(--rogym-text-muted)]">Trống</span>
                      )}
                    </div>
                  </div>
                </div>

                {booking.combos?.length > 0 && (
                  <div className="flex items-start gap-2.5">
                    <Popcorn className="w-4 h-4 text-[var(--rogym-text-muted)] mt-0.5 shrink-0" />
                    <div className="text-sm">
                      <p className="text-[var(--rogym-text-secondary)] text-xs mb-1">Bắp nước</p>
                      <div className="text-[var(--rogym-text-secondary)] text-xs font-medium space-y-0.5">
                        {booking.combos.map((combo, idx) => (
                          <p key={idx}>• {combo}</p>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[var(--rogym-border-subtle)] flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs text-[var(--rogym-text-secondary)]">Thanh toán qua:</span>
              <Badge
                tone={booking.paymentStatus === 'PAID' ? 'success' : 'muted'}
                size="xs"
              >
                {booking.paymentStatus === 'PAID'
                  ? (booking.totalAmount === 0 ? 'Điểm thưởng (100%)' : 'Đã thanh toán (VNPay)')
                  : booking.paymentStatus === 'UNPAID'
                  ? 'Chưa thanh toán'
                  : booking.paymentStatus}
              </Badge>

              {booking.pointsUsed !== undefined && booking.pointsUsed > 0 && (
                <Badge tone="accent" size="xs">
                  Dùng {booking.pointsUsed} điểm
                </Badge>
              )}

              {booking.pointsEarned !== undefined && booking.pointsEarned > 0 && (
                <span className="text-[11px] text-amber-400 font-medium">
                  +{booking.pointsEarned} pts
                </span>
              )}
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-baseline gap-1.5">
                <span className="text-xs font-medium text-[var(--rogym-text-secondary)]">Tổng cộng:</span>
                <span
                  className={`text-xl font-display font-bold ${
                    isSuccess ? 'text-[var(--rogym-primary)]' : 'text-white'
                  }`}
                >
                  {booking.totalAmount.toLocaleString('vi-VN')}đ
                </span>
              </div>

              {canCancel && (
                <Button
                  variant="outline-white"
                  size="sm"
                  className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50"
                  onClick={onCancelRequest}
                >
                  <Ban className="w-3.5 h-3.5 mr-1.5" />
                  Hủy vé
                </Button>
              )}

              {isSuccess && !isShowtimeFuture && (
                <span className="text-xs text-[var(--rogym-text-muted)] italic">
                  (Đã qua giờ chiếu)
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
