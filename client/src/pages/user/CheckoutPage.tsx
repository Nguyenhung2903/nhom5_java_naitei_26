import { useState, useEffect } from 'react'
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { showtimeSeatService } from '@/services/showtimeSeatService'
import { promotionService } from '@/services/promotionService'
import { showtimeService } from '@/services/showtimeService'
import { movieService } from '@/services/movieService'
import { theaterService } from '@/services/theaterService'
import {
  PageLoader,
  Alert,
  AlertDescription,
  Button,
  Input,
  FormField,
} from '@/components/ui'
import { AlertCircle, ArrowLeft, Clock, Ticket, Film, MapPin, Tag, Award, Sparkles } from 'lucide-react'
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
  
  // Real Data states
  const [showtime, setShowtime] = useState<any>(null)
  const [movie, setMovie] = useState<any>(null)
  const [theater, setTheater] = useState<any>(null)
  const [seats, setSeats] = useState<any[]>([])
  const [isDataLoading, setIsDataLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      if (!showtimeId) return
      try {
        const st = await showtimeService.getById(showtimeId)
        setShowtime(st)
        
        const [m, theaters, allSeats] = await Promise.all([
          movieService.getMovieById(st.movieId),
          theaterService.getAll(),
          showtimeSeatService.getSeats(showtimeId)
        ])
        setMovie(m)
        setTheater(theaters.find(t => t.id === st.theaterId))
        setSeats(allSeats)
      } catch (err) {
        console.error("Failed to fetch booking details", err)
      } finally {
        setIsDataLoading(false)
      }
    }
    
    fetchData()
  }, [showtimeId])

  const formatTimeStr = (isoString?: string) => {
    if (!isoString) return ''
    return new Intl.DateTimeFormat('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(isoString))
  }

  const formatDateStr = (isoString?: string) => {
    if (!isoString) return ''
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(new Date(isoString))
  }
  
  // Form Info
  const [fullName, setFullName] = useState(user?.fullName || user?.username || '')
  const [email, setEmail] = useState(user?.email || '')
  
  // Discount Code
  const [discountCode, setDiscountCode] = useState('')
  const [discountAmount, setDiscountAmount] = useState(0)

  // Reward Points
  const userPoints = user?.points || 0
  const [pointsInput, setPointsInput] = useState('')
  const [pointsToUse, setPointsToUse] = useState(0)

  // Countdown timer state
  const [countdown, setCountdown] = useState<number | null>(null)

  useEffect(() => {
    if (!holdExpiration || !selectedSeatIds || selectedSeatIds.length === 0) {
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
  }, [holdExpiration, navigate, showtimeId, selectedSeatIds])

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const subTotal = (seatsTotalAmount || 0) + (combosTotalAmount || 0)
  const remainingAfterVoucher = Math.max(0, subTotal - discountAmount)
  const maxUsablePoints = Math.min(userPoints, Math.ceil(remainingAfterVoucher / 1000))
  const pointsDiscountAmount = Math.min(remainingAfterVoucher, pointsToUse * 1000)
  const finalTotalAmount = Math.max(0, remainingAfterVoucher - pointsDiscountAmount)
  const estimatedPointsEarned = Math.floor(finalTotalAmount / 10000)

  const handleApplyDiscount = async () => {
    setError(null)
    try {
      const promotion = await promotionService.validateCode(discountCode)
      const amount = promotion.discountType === 'PERCENT'
        ? subTotal * promotion.discountValue / 100
        : promotion.discountValue
      const actualDiscount = Math.min(subTotal, amount)
      setDiscountAmount(actualDiscount)
      
      // Re-validate points if needed
      const newRemaining = Math.max(0, subTotal - actualDiscount)
      const newMaxPoints = Math.min(userPoints, Math.ceil(newRemaining / 1000))
      if (pointsToUse > newMaxPoints) {
        setPointsToUse(newMaxPoints)
        setPointsInput(newMaxPoints > 0 ? String(newMaxPoints) : '')
      }
    } catch (caught: unknown) {
      setDiscountAmount(0)
      setError(caught instanceof Error ? caught.message : 'Mã giảm giá không hợp lệ hoặc đã hết hạn')
    }
  }

  const handleApplyPoints = (val: string) => {
    const parsed = parseInt(val.replace(/\D/g, ''), 10) || 0
    if (parsed < 0) {
      setPointsToUse(0)
      setPointsInput('')
      return
    }
    const clamped = Math.min(parsed, maxUsablePoints)
    setPointsToUse(clamped)
    setPointsInput(clamped > 0 ? String(clamped) : '')
  }

  const handleUseMaxPoints = () => {
    setPointsToUse(maxUsablePoints)
    setPointsInput(maxUsablePoints > 0 ? String(maxUsablePoints) : '')
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
        pointsToUse,
        pointsDiscountAmount,
        finalTotalAmount,
        receiverInfo: {
          fullName,
          email
        }
      }
    })
  }

  if (!selectedSeatIds) return null
  
  const selectedSeatLabels = seats.length > 0 
    ? seats.filter((s: any) => selectedSeatIds.includes(s.id)).map((s: any) => `${s.seatRow}${s.seatNumber}`).join(', ')
    : selectedSeatIds.join(', ')

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
              <FormField label="Email" required>
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

          {/* Dùng Điểm Thưởng */}
          <div className="bg-[var(--rogym-surface)] border border-[var(--rogym-border-subtle)] rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-[var(--rogym-green)]" />
                Điểm thưởng thành viên
              </h2>
              <span className="text-xs px-2.5 py-1 rounded-full bg-[var(--rogym-green)]/10 text-[var(--rogym-green)] border border-[var(--rogym-green)]/30 font-medium">
                Số dư: {userPoints} điểm
              </span>
            </div>
            
            <p className="text-xs text-[var(--rogym-text-secondary)] mb-4">
              Quy đổi: <strong className="text-white">1 điểm = 1.000 VNĐ</strong>. Bạn có thể dùng tối đa {maxUsablePoints} điểm cho đơn hàng này.
            </p>

            {userPoints > 0 ? (
              <div className="space-y-3">
                <div className="flex gap-4">
                  <Input 
                    type="number"
                    min="0"
                    max={maxUsablePoints}
                    value={pointsInput} 
                    onChange={(e) => handleApplyPoints(e.target.value)} 
                    placeholder={`Nhập số điểm (tối đa ${maxUsablePoints})...`}
                    className="flex-1"
                  />
                  <Button 
                    variant="outline-white" 
                    onClick={handleUseMaxPoints}
                    disabled={maxUsablePoints === 0}
                  >
                    Dùng tối đa
                  </Button>
                </div>
                {pointsToUse > 0 && (
                  <p className="text-xs text-[var(--rogym-green)] flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    Đã áp dụng {pointsToUse} điểm để giảm {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(pointsDiscountAmount)}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-xs text-[var(--rogym-text-muted)] italic">
                Bạn chưa có điểm thưởng tích lũy. Đặt vé xem phim ngay để tích lũy 10% giá trị đơn hàng!
              </p>
            )}
          </div>

        </div>

        {/* Cột Phải - Thông tin phim & Thanh toán */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[var(--rogym-surface)] border border-[var(--rogym-border-subtle)] rounded-xl overflow-hidden">
            <div className="p-6 border-b border-[var(--rogym-border-subtle)]">
              {isDataLoading ? (
                <div className="flex justify-center p-4">
                  <PageLoader ariaLabel="Đang tải thông tin phim..." className="scale-75" />
                </div>
              ) : (
                <>
                  <h3 className="text-xl font-bold text-white mb-2">{movie?.title || showtime?.movieTitle} {movie?.ageRating ? `(${movie.ageRating})` : ''}</h3>
                  <p className="text-[var(--rogym-text-muted)] text-sm mb-4">Thời lượng: {movie?.duration ? `${movie.duration} phút` : 'Đang cập nhật'}</p>
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex gap-3 text-white">
                      <Film className="w-5 h-5 text-[var(--rogym-primary)] shrink-0" />
                      <div>
                        <p className="font-medium">{theater?.name || showtime?.theaterName}</p>
                        <p className="text-[var(--rogym-text-muted)] mt-1">{showtime?.roomName} - {formatTimeStr(showtime?.startTime)} - {formatTimeStr(showtime?.endTime)} - {formatDateStr(showtime?.startTime)}</p>
                      </div>
                    </div>
                    <div className="flex gap-3 text-white">
                      <MapPin className="w-5 h-5 text-[var(--rogym-primary)] shrink-0" />
                      <p>{theater?.address || 'Đang cập nhật'}</p>
                    </div>
                    <div className="flex gap-3 text-white">
                      <Ticket className="w-5 h-5 text-[var(--rogym-primary)] shrink-0" />
                      <p>Số ghế: <span className="font-bold text-[var(--rogym-primary)]">{selectedSeatLabels}</span></p>
                    </div>
                  </div>
                </>
              )}
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
                    <span>Mã giảm giá</span>
                    <span>-{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(discountAmount)}</span>
                  </div>
                )}
                {pointsDiscountAmount > 0 && (
                  <div className="flex justify-between text-[var(--rogym-green)]">
                    <span>Điểm thưởng ({pointsToUse} pts)</span>
                    <span>-{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(pointsDiscountAmount)}</span>
                  </div>
                )}
                
                <div className="pt-4 border-t border-[var(--rogym-border-subtle)] flex justify-between items-center">
                  <span className="font-bold text-white">Tổng cộng</span>
                  <span className="text-2xl font-bold text-[var(--rogym-primary)]">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(finalTotalAmount)}
                  </span>
                </div>

                {estimatedPointsEarned > 0 && (
                  <div className="text-xs text-[var(--rogym-text-secondary)] text-right pt-1 flex items-center justify-end gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    Tích lũy: <strong className="text-amber-400">+{estimatedPointsEarned} điểm</strong> sau khi thanh toán
                  </div>
                )}
              </div>

              <Button 
                variant="primary" 
                size="lg"
                className="w-full mt-6"
                onClick={handlePayment}
                disabled={loading}
              >
                {loading ? <PageLoader ariaLabel="Đang xử lý..." className="scale-75" /> : (finalTotalAmount === 0 ? 'Xác Nhận Đặt Vé (0 VNĐ)' : 'Tiến Hành Thanh Toán')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
