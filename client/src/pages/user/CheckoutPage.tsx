import { useState, useEffect } from 'react'
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { showtimeSeatService } from '@/services/showtimeSeatService'
import { promotionService } from '@/services/promotionService'
import {
  PageLoader,
  Alert,
  AlertDescription,
  Button,
  Input,
  FormField,
} from '@/components/ui'
import { AlertCircle, ArrowLeft, Clock, Ticket, Film, MapPin, Tag } from 'lucide-react'

// Mock Data cho thông tin phim
const MOCK_MOVIE_INFO = {
  title: "Mai (18+)",
  duration: "131 phút",
  time: "19:00 - 21:11",
  date: "25/10/2026",
  room: "Phòng chiếu 03",
  cinema: "Sun* Cinema Hà Nội",
  address: "Tầng 3, Tòa nhà báo Sinh Viên VN, Yên Hòa, Cầu Giấy, Hà Nội",
}

export function CheckoutPage() {
  const { showtimeId } = useParams<{ showtimeId: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()
  
  // Retrieve state passed from ComboPage
  const { 
    holdExpiration, 
    selectedSeatIds, 
    seatsTotalAmount, 
    selectedCombos, 
    combosTotalAmount 
  } = location.state || {}

  const [loading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Form Info
  const [fullName, setFullName] = useState(user?.fullName || user?.username || '')
  const [phone, setPhone] = useState(user?.phone || '')
  const [email, setEmail] = useState(user?.email || '')
  
  // Discount Code
  const [discountCode, setDiscountCode] = useState('')
  const [discountAmount, setDiscountAmount] = useState(0)

  // Countdown timer state
  const [countdown, setCountdown] = useState<number | null>(null)

  useEffect(() => {
    if (!holdExpiration || !selectedSeatIds || selectedSeatIds.length === 0) {
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
        showtimeSeatService.releaseSeats(showtimeId!, selectedSeatIds).catch(console.error)
        navigate(`/booking/${showtimeId}/seats`)
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [holdExpiration, navigate, showtimeId, selectedSeatIds])

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const handleApplyDiscount = async () => {
    setError(null)
    try {
      const promotion = await promotionService.validateCode(discountCode)
      const subTotal = (seatsTotalAmount || 0) + (combosTotalAmount || 0)
      const amount = promotion.discountType === 'PERCENT'
        ? subTotal * promotion.discountValue / 100
        : promotion.discountValue
      setDiscountAmount(Math.min(subTotal, amount))
    } catch (caught: unknown) {
      setDiscountAmount(0)
      setError(caught instanceof Error ? caught.message : 'Mã giảm giá không hợp lệ hoặc đã hết hạn')
    }
  }

  const handlePayment = () => {
    if (!fullName || !email) {
      setError("Vui lòng điền đầy đủ thông tin nhận vé")
      return
    }
    
    navigate(`/user/booking/${showtimeId}/payment`, {
      state: {
        holdExpiration,
        selectedSeatIds,
        seatsTotalAmount,
        selectedCombos,
        combosTotalAmount,
        discountAmount,
        discountCode,
        finalTotalAmount,
        receiverInfo: {
          fullName,
          phone,
          email
        }
      }
    })
  }

  const subTotal = (seatsTotalAmount || 0) + (combosTotalAmount || 0)
  const finalTotalAmount = Math.max(0, subTotal - discountAmount)

  if (!selectedSeatIds) return null

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--rogym-border-subtle)] pb-4 mb-8">
        <div className="flex items-center gap-4">
          <Link to={`/user/booking/${showtimeId}/combos`} state={location.state} className="text-[var(--rogym-text-muted)] hover:text-white transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold font-display uppercase tracking-wide text-white">
              Thanh Toán
            </h1>
            <p className="text-sm text-[var(--rogym-text-muted)] mt-1">
              Kiểm tra thông tin và tiến hành thanh toán vé.
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Cột Trái - Thông tin người dùng & Mã giảm giá */}
        <div className="lg:col-span-8 space-y-8">
          
          <div className="bg-[var(--rogym-surface)] border border-[var(--rogym-border-subtle)] rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
               Thông tin nhận vé
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField label="Họ và tên" required>
                <Input 
                  value={fullName} 
                  onChange={(e) => setFullName(e.target.value)} 
                  placeholder="Nhập họ và tên"
                />
              </FormField>
              <FormField label="Số điện thoại">
                <Input 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)} 
                  placeholder="Nhập số điện thoại"
                />
              </FormField>
              <FormField label="Email" className="md:col-span-2" required>
                <Input 
                  type="email"
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="Nhập địa chỉ email để nhận mã vé"
                />
              </FormField>
            </div>
          </div>

          <div className="bg-[var(--rogym-surface)] border border-[var(--rogym-border-subtle)] rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Tag className="w-5 h-5 text-[var(--rogym-primary)]" />
              Mã giảm giá
            </h2>
            <div className="flex gap-4">
              <Input 
                value={discountCode} 
                onChange={(e) => setDiscountCode(e.target.value)} 
                placeholder="Nhập mã giảm giá..."
                className="flex-1"
              />
              <Button variant="outline-white" onClick={handleApplyDiscount}>
                Áp dụng
              </Button>
            </div>
          </div>

        </div>

        {/* Cột Phải - Thông tin phim & Thanh toán */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[var(--rogym-surface)] border border-[var(--rogym-border-subtle)] rounded-xl overflow-hidden">
            <div className="p-6 border-b border-[var(--rogym-border-subtle)]">
              <h3 className="text-xl font-bold text-white mb-2">{MOCK_MOVIE_INFO.title}</h3>
              <p className="text-[var(--rogym-text-muted)] text-sm mb-4">Thời lượng: {MOCK_MOVIE_INFO.duration}</p>
              
              <div className="space-y-3 text-sm">
                <div className="flex gap-3 text-white">
                  <Film className="w-5 h-5 text-[var(--rogym-primary)] shrink-0" />
                  <div>
                    <p className="font-medium">{MOCK_MOVIE_INFO.cinema}</p>
                    <p className="text-[var(--rogym-text-muted)] mt-1">{MOCK_MOVIE_INFO.room} - {MOCK_MOVIE_INFO.time} - {MOCK_MOVIE_INFO.date}</p>
                  </div>
                </div>
                <div className="flex gap-3 text-white">
                  <MapPin className="w-5 h-5 text-[var(--rogym-primary)] shrink-0" />
                  <p>{MOCK_MOVIE_INFO.address}</p>
                </div>
                <div className="flex gap-3 text-white">
                  <Ticket className="w-5 h-5 text-[var(--rogym-primary)] shrink-0" />
                  <p>Số ghế: <span className="font-bold text-[var(--rogym-primary)]">{selectedSeatIds.join(', ')}</span></p>
                </div>
              </div>
            </div>
            
            <div className="p-6 bg-[var(--rogym-surface-hover)]">
              <h3 className="text-lg font-bold text-white mb-4">Chi tiết thanh toán</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-white">
                  <span>Vé xem phim ({selectedSeatIds.length} vé)</span>
                  <span>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(seatsTotalAmount || 0)}</span>
                </div>
                <div className="flex justify-between text-white">
                  <span>Đồ ăn & uống</span>
                  <span>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(combosTotalAmount || 0)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-green-400">
                    <span>Giảm giá</span>
                    <span>-{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(discountAmount)}</span>
                  </div>
                )}
                
                <div className="pt-4 border-t border-[var(--rogym-border-subtle)] flex justify-between items-center">
                  <span className="font-bold text-white">Tổng cộng</span>
                  <span className="text-2xl font-bold text-[var(--rogym-primary)]">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(finalTotalAmount)}
                  </span>
                </div>
              </div>

              <Button 
                variant="primary" 
                size="lg"
                className="w-full mt-6"
                onClick={handlePayment}
                disabled={loading}
              >
                {loading ? <PageLoader ariaLabel="Đang xử lý..." className="scale-75" /> : 'Xác Nhận Thanh Toán'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
