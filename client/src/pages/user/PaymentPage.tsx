import { useState, useEffect } from 'react'
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom'
import { bookingService } from '@/services/bookingService'
import { showtimeSeatService } from '@/services/showtimeSeatService'
import {
  Alert,
  AlertDescription,
  Button,
  PageLoader
} from '@/components/ui'
import { AlertCircle, ArrowLeft, CheckCircle2, Clock, CreditCard } from 'lucide-react'

export function PaymentPage() {
  const { showtimeId } = useParams<{ showtimeId: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  
  const { 
    holdExpiration, 
    finalTotalAmount,
    selectedSeatIds,
    selectedCombos,
    discountCode,
    pointsToUse,
    pointsDiscountAmount
  } = location.state || {}

  const isZeroAmount = finalTotalAmount === 0
  const [paymentMethod, setPaymentMethod] = useState<'VNPAY' | 'POINTS' | null>(isZeroAmount ? 'POINTS' : null)
  const [countdown, setCountdown] = useState<number | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isZeroAmount) {
      setPaymentMethod('POINTS')
    }
  }, [isZeroAmount])

  useEffect(() => {
    if (isSuccess) return

    if (!holdExpiration || finalTotalAmount === undefined) {
      navigate(`/user/booking/${showtimeId}/seats`)
      return
    }

    const calculateRemaining = () => {
      const now = new Date().getTime()
      const remainingMs = holdExpiration - now
      return Math.max(0, Math.floor(remainingMs / 1000))
    }

    setCountdown(calculateRemaining())

    const timer = setInterval(() => {
      const remaining = calculateRemaining()
      setCountdown(remaining)
      if (remaining <= 0) {
        clearInterval(timer)
        showtimeSeatService.releaseSeats(showtimeId!, selectedSeatIds).catch(console.error)
        navigate(`/user/booking/${showtimeId}/seats`)
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [holdExpiration, navigate, showtimeId, finalTotalAmount, selectedSeatIds, isSuccess])

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const handlePayment = async () => {
    if (!paymentMethod) {
      setError("Vui lòng chọn phương thức thanh toán")
      return
    }

    setIsProcessing(true)
    setError(null)
    try {
      const combosList = Array.isArray(selectedCombos) 
        ? selectedCombos.map((item: any) => ({ comboId: item.id, quantity: item.quantity }))
        : []

      const bookingPayload = {
        showtimeId: showtimeId!,
        seatIds: selectedSeatIds || [],
        combos: combosList,
        discountCode: discountCode || undefined,
        pointsToUse: pointsToUse || undefined,
      }

      // Xử lý đơn 0 VNĐ (Thanh toán hoàn toàn bằng điểm)
      if (isZeroAmount || paymentMethod === 'POINTS') {
        await bookingService.createBooking({
          ...bookingPayload,
          paymentMethod: 'POINTS',
        })
        setIsSuccess(true)
        setIsProcessing(false)
        return
      }

      // Xử lý thanh toán qua VNPay
      localStorage.setItem('pending_vnpay_booking', JSON.stringify(bookingPayload))

      const url = await bookingService.createVNPayUrl(finalTotalAmount)
      window.location.href = url
    } catch (err: any) {
      setIsProcessing(false)
      setError(err.response?.data?.message || "Đã xảy ra lỗi khi kết nối với cổng thanh toán. Vui lòng thử lại.")
    }
  }

  if (finalTotalAmount === undefined && !isSuccess) return null

  if (isSuccess) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="bg-[var(--rogym-surface)] border border-[var(--rogym-green)]/50 rounded-xl p-8 max-w-md mx-auto shadow-2xl">
          <CheckCircle2 className="w-16 h-16 text-[var(--rogym-green)] mx-auto mb-4 animate-bounce" />
          <h1 className="text-2xl font-bold text-white mb-2">Đặt vé thành công!</h1>
          <p className="text-[var(--rogym-text-muted)] mb-8">
            Cảm ơn bạn đã đặt vé. {pointsDiscountAmount > 0 && `Đã sử dụng ${pointsToUse} điểm thưởng để thanh toán.`} Thông tin vé đã được lưu vào hệ thống.
          </p>
          <div className="space-y-3">
            <Link to="/user/tickets">
              <Button variant="primary" className="w-full font-bold">Xem Vé Của Tôi</Button>
            </Link>
            <Link to="/user">
              <Button variant="secondary" className="w-full">Về Bảng Điều Khiển</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--rogym-border-subtle)] pb-4 mb-8">
        <div className="flex items-center gap-4">
          <Link to={`/user/booking/${showtimeId}/checkout`} state={location.state} className="text-[var(--rogym-text-muted)] hover:text-white transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold font-display uppercase tracking-wide text-white">
              Phương Thức Thanh Toán
            </h1>
            <p className="text-sm text-[var(--rogym-text-muted)] mt-1">
              {isZeroAmount ? 'Đơn hàng của bạn được chi trả hoàn toàn bằng Điểm Thưởng' : 'Chọn phương thức thanh toán phù hợp với bạn.'}
            </p>
          </div>
        </div>
        
        {countdown !== null && (
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${countdown < 60 ? 'bg-red-500/10 border-red-500/30 text-red-500' : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500'}`}>
            <Clock className={`w-5 h-5 ${countdown < 60 ? 'animate-bounce' : 'animate-pulse'}`} />
            <span className="font-mono font-bold text-lg">{formatTime(countdown)}</span>
          </div>
        )}
      </div>

      {error && (
        <Alert tone="error" icon={<AlertCircle className="w-4 h-4" />} className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Lựa chọn phương thức */}
        <div className="md:col-span-7 space-y-4">
          {isZeroAmount ? (
            <div className="border border-[var(--rogym-green)] bg-[var(--rogym-green)]/10 rounded-xl p-6 shadow-[0_0_20px_rgba(6,195,132,0.15)]">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-[var(--rogym-green)]/20 text-[var(--rogym-green)]">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white">Thanh toán bằng Điểm Thưởng</h3>
                  <p className="text-sm text-[var(--rogym-text-secondary)] mt-1">
                    Đã áp dụng {pointsToUse} điểm để giảm 100% số tiền vé. Không cần thanh toán thêm tiền mặt.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div 
              onClick={() => setPaymentMethod((prev) => (prev === 'VNPAY' ? null : 'VNPAY'))}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  setPaymentMethod((prev) => (prev === 'VNPAY' ? null : 'VNPAY'))
                }
              }}
              className={`cursor-pointer border rounded-xl p-6 transition-all select-none ${
                paymentMethod === 'VNPAY' 
                  ? 'border-[var(--rogym-green)] bg-[var(--rogym-green)]/10 shadow-[0_0_20px_rgba(6,195,132,0.15)]' 
                  : 'border-[var(--rogym-border-subtle)] bg-[var(--rogym-surface)] hover:border-[var(--rogym-border-teal-hover)] hover:bg-[var(--rogym-surface-hover)]'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-full transition-colors ${paymentMethod === 'VNPAY' ? 'bg-[var(--rogym-green)]/20 text-[var(--rogym-green)]' : 'bg-[var(--rogym-surface-hover)] text-[var(--rogym-text-muted)]'}`}>
                  <CreditCard className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white">Thanh toán qua VNPAY</h3>
                  <p className="text-sm text-[var(--rogym-text-muted)] mt-1">
                    Thanh toán qua ví điện tử VNPAY hoặc quét mã QR ngân hàng (VNPAY-QR).
                  </p>
                </div>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${paymentMethod === 'VNPAY' ? 'border-[var(--rogym-green)] bg-[var(--rogym-green)]/20' : 'border-[var(--rogym-border-subtle)]'}`}>
                  {paymentMethod === 'VNPAY' && <div className="w-3 h-3 rounded-full bg-[var(--rogym-green)] shadow-sm" />}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tổng kết thanh toán & Nút hành động */}
        <div className="md:col-span-5 space-y-6">
          <div className="bg-[var(--rogym-surface)] border border-[var(--rogym-border-subtle)] rounded-xl p-6 sticky top-6">
            <h3 className="text-xl font-bold text-white mb-4">Tổng số tiền cần thanh toán</h3>
            <div className="text-3xl font-black text-[var(--rogym-green)] mb-2">
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(finalTotalAmount)}
            </div>

            {pointsDiscountAmount > 0 && (
              <p className="text-xs text-[var(--rogym-text-secondary)] mb-4">
                Đã trừ <span className="text-[var(--rogym-green)] font-semibold">-{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(pointsDiscountAmount)}</span> từ {pointsToUse} điểm thưởng
              </p>
            )}

            <Button 
              variant="primary" 
              size="lg"
              className="w-full mt-4 font-bold"
              onClick={handlePayment}
              disabled={!paymentMethod || isProcessing}
            >
              {isProcessing ? <PageLoader ariaLabel="Đang xử lý đặt vé..." className="scale-75" /> : (isZeroAmount ? 'Xác Nhận Đặt Vé Ngay' : 'Thanh Toán Ngay')}
            </Button>
            {!paymentMethod && (
              <p className="text-xs text-[var(--rogym-text-muted)] text-center mt-2">
                Vui lòng chọn phương thức thanh toán để tiếp tục
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
