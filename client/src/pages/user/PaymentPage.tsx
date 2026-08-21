import { useState, useEffect } from 'react'
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom'
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js'
import { bookingService } from '@/services/bookingService'
import {
  PageLoader,
  Alert,
  AlertDescription,
  Button,
} from '@/components/ui'
import { AlertCircle, ArrowLeft, Clock, CreditCard, Store } from 'lucide-react'

// Tỉ giá giả lập: 1 USD = 25.000 VNĐ
const VND_TO_USD_RATE = 25000

export function PaymentPage() {
  const { showtimeId } = useParams<{ showtimeId: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  
  const { 
    holdExpiration, 
    finalTotalAmount,
    selectedSeatIds,
    selectedCombos,
    discountCode
  } = location.state || {}

  const [paymentMethod, setPaymentMethod] = useState<'COUNTER' | 'PAYPAL'>('COUNTER')
  const [countdown, setCountdown] = useState<number | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!holdExpiration || finalTotalAmount === undefined) {
      navigate(`/booking/${showtimeId}/seats`)
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
        navigate(`/booking/${showtimeId}/seats`)
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [holdExpiration, navigate, showtimeId, finalTotalAmount])

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  // Xử lý thanh toán tại quầy
  const handleCounterPayment = async () => {
    setIsProcessing(true)
    try {
      const combosList = Array.isArray(selectedCombos) 
        ? selectedCombos.map((item: any) => ({ comboId: item.id, quantity: item.quantity }))
        : []

      await bookingService.createBooking({
        showtimeId: showtimeId!,
        seatIds: selectedSeatIds || [],
        combos: combosList,
        paymentMethod: 'COUNTER',
        discountCode: discountCode
      })

      alert("Đặt vé thành công! Vui lòng thanh toán tại quầy trước giờ chiếu 15 phút.")
      navigate('/')
    } catch (err: any) {
      setError(err.response?.data?.message || "Đã xảy ra lỗi khi tạo đơn hàng.")
    } finally {
      setIsProcessing(false)
    }
  }

  // Chuyển đổi VNĐ sang USD cho PayPal
  const finalTotalUSD = (finalTotalAmount / VND_TO_USD_RATE).toFixed(2)

  if (finalTotalAmount === undefined) return null

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--rogym-border-subtle)] pb-4 mb-8">
        <div className="flex items-center gap-4">
          <Link to={`/booking/${showtimeId}/checkout`} state={location.state} className="text-[var(--rogym-text-muted)] hover:text-white transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold font-display uppercase tracking-wide text-white">
              Phương Thức Thanh Toán
            </h1>
            <p className="text-sm text-[var(--rogym-text-muted)] mt-1">
              Chọn phương thức thanh toán phù hợp với bạn.
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
          
          <div 
            onClick={() => setPaymentMethod('COUNTER')}
            className={`cursor-pointer border rounded-xl p-6 transition-all ${
              paymentMethod === 'COUNTER' 
                ? 'border-[var(--rogym-primary)] bg-[var(--rogym-primary)]/10' 
                : 'border-[var(--rogym-border-subtle)] bg-[var(--rogym-surface)] hover:bg-[var(--rogym-surface-hover)]'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-full ${paymentMethod === 'COUNTER' ? 'bg-[var(--rogym-primary)]/20 text-[var(--rogym-primary)]' : 'bg-[var(--rogym-surface-hover)] text-[var(--rogym-text-muted)]'}`}>
                <Store className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white">Thanh toán tại quầy</h3>
                <p className="text-sm text-[var(--rogym-text-muted)] mt-1">
                  Đến rạp lấy vé và thanh toán bằng tiền mặt hoặc thẻ tín dụng.
                </p>
              </div>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'COUNTER' ? 'border-[var(--rogym-primary)]' : 'border-[var(--rogym-border-subtle)]'}`}>
                {paymentMethod === 'COUNTER' && <div className="w-3 h-3 rounded-full bg-[var(--rogym-primary)]" />}
              </div>
            </div>
          </div>

          <div 
            onClick={() => setPaymentMethod('PAYPAL')}
            className={`cursor-pointer border rounded-xl p-6 transition-all ${
              paymentMethod === 'PAYPAL' 
                ? 'border-[var(--rogym-primary)] bg-[var(--rogym-primary)]/10' 
                : 'border-[var(--rogym-border-subtle)] bg-[var(--rogym-surface)] hover:bg-[var(--rogym-surface-hover)]'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-full ${paymentMethod === 'PAYPAL' ? 'bg-[var(--rogym-primary)]/20 text-[var(--rogym-primary)]' : 'bg-[var(--rogym-surface-hover)] text-[var(--rogym-text-muted)]'}`}>
                <CreditCard className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white">Thanh toán qua PayPal</h3>
                <p className="text-sm text-[var(--rogym-text-muted)] mt-1">
                  Thanh toán an toàn, tiện lợi qua cổng thanh toán quốc tế PayPal.
                </p>
              </div>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'PAYPAL' ? 'border-[var(--rogym-primary)]' : 'border-[var(--rogym-border-subtle)]'}`}>
                {paymentMethod === 'PAYPAL' && <div className="w-3 h-3 rounded-full bg-[var(--rogym-primary)]" />}
              </div>
            </div>
          </div>

        </div>

        {/* Tổng kết thanh toán & Nút hành động */}
        <div className="md:col-span-5 space-y-6">
          <div className="bg-[var(--rogym-surface)] border border-[var(--rogym-border-subtle)] rounded-xl p-6 sticky top-6">
            <h3 className="text-xl font-bold text-white mb-4">Tổng số tiền</h3>
            <div className="text-3xl font-black text-[var(--rogym-primary)] mb-6">
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(finalTotalAmount)}
            </div>

            {paymentMethod === 'COUNTER' && (
              <Button 
                variant="primary" 
                size="lg"
                className="w-full"
                onClick={handleCounterPayment}
                disabled={isProcessing}
              >
                {isProcessing ? <PageLoader ariaLabel="Đang xử lý..." className="scale-75" /> : 'Xác Nhận Đặt Vé'}
              </Button>
            )}

            {paymentMethod === 'PAYPAL' && (
              <div className="mt-4">
                <PayPalScriptProvider options={{ "clientId": "test", currency: "USD" }}>
                  <PayPalButtons 
                    style={{ layout: "vertical", color: "gold", shape: "rect", label: "pay" }}
                    createOrder={(_data, actions) => {
                      return actions.order.create({
                        intent: "CAPTURE",
                        purchase_units: [
                          {
                            amount: {
                              currency_code: "USD",
                              value: finalTotalUSD,
                            },
                          },
                        ],
                      });
                    }}
                    onApprove={(_data, actions) => {
                      return actions.order!.capture().then(async (details) => {
                        try {
                          const combosList = Array.isArray(selectedCombos) 
                            ? selectedCombos.map((item: any) => ({ comboId: item.id, quantity: item.quantity }))
                            : []

                          await bookingService.createBooking({
                            showtimeId: showtimeId!,
                            seatIds: selectedSeatIds || [],
                            combos: combosList,
                            paymentMethod: 'PAYPAL',
                            paymentTransactionId: details.id,
                            discountCode: discountCode
                          })

                          const payerName = details.payer?.name?.given_name || 'PayPal'
                          alert(`Thanh toán thành công bởi ${payerName}!`)
                          navigate('/')
                        } catch (err: any) {
                          setError(err.response?.data?.message || "Lưu thông tin đặt vé thất bại. Vui lòng liên hệ hỗ trợ.")
                        }
                      });
                    }}
                    onError={(err) => {
                      console.error("PayPal Checkout onError", err);
                      setError("Thanh toán PayPal bị lỗi hoặc đã bị huỷ.");
                    }}
                  />
                </PayPalScriptProvider>
                <div className="text-xs text-center text-[var(--rogym-text-muted)] mt-4">
                  (Số tiền thanh toán: ~ ${finalTotalUSD} USD)
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
