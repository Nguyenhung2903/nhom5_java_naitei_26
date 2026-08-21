import { useState, useEffect } from 'react'
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom'
import { comboService } from '@/services/comboService'
import type { Combo } from '@/types/combo'
import {
  PageLoader,
  Alert,
  AlertDescription,
  Button,
} from '@/components/ui'
import { AlertCircle, ArrowLeft, Clock, Minus, Plus } from 'lucide-react'

export function ComboPage() {
  const { showtimeId } = useParams<{ showtimeId: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  
  // Retrieve state passed from ShowtimeSeatPage
  const { holdExpiration, selectedSeatIds, seatsTotalAmount } = location.state || {}

  const [combos, setCombos] = useState<Combo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Quantities mapping: combo.id -> quantity
  const [quantities, setQuantities] = useState<Record<string, number>>({})
  
  // Countdown timer state
  const [countdown, setCountdown] = useState<number | null>(null)

  useEffect(() => {
    // If no seat data, user accessed directly -> redirect to seat selection
    if (!holdExpiration || !selectedSeatIds || selectedSeatIds.length === 0) {
      navigate(`/booking/${showtimeId}/seats`)
      return
    }

    setLoading(true)
    comboService.getActiveCombos()
      .then((data) => {
        setCombos(data)
        // Initialize quantities to 0
        const initialQ: Record<string, number> = {}
        data.forEach(c => initialQ[c.id] = 0)
        setQuantities(initialQ)
      })
      .catch((err: Error) => setError(err.message || 'Có lỗi xảy ra khi tải danh sách combo'))
      .finally(() => setLoading(false))
  }, [showtimeId, holdExpiration, selectedSeatIds, navigate])

  // Countdown effect
  useEffect(() => {
    if (!holdExpiration) return

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
        // Timer expired, redirect back to seats
        navigate(`/booking/${showtimeId}/seats`)
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [holdExpiration, navigate, showtimeId])

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const handleUpdateQuantity = (comboId: string, delta: number) => {
    setQuantities(prev => {
      const current = prev[comboId] || 0
      const updated = Math.max(0, current + delta)
      return { ...prev, [comboId]: updated }
    })
  }

  const handleContinue = () => {
    // Collect selected combos
    const selectedCombos = combos
      .filter(c => quantities[c.id] > 0)
      .map(c => ({
        ...c,
        quantity: quantities[c.id]
      }))
    
    const combosTotalAmount = combos.reduce((sum, combo) => {
      const qty = quantities[combo.id] || 0
      return sum + (combo.price * qty)
    }, 0)

    navigate(`/booking/${showtimeId}/checkout`, {
      state: {
        holdExpiration,
        selectedSeatIds,
        seatsTotalAmount,
        selectedCombos,
        combosTotalAmount,
      }
    })
  }

  if (loading) return <PageLoader ariaLabel="Đang tải danh sách combo..." />

  const combosTotalAmount = combos.reduce((sum, combo) => {
    const qty = quantities[combo.id] || 0
    return sum + (combo.price * qty)
  }, 0)

  const finalTotalAmount = (seatsTotalAmount || 0) + combosTotalAmount

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--rogym-border-subtle)] pb-4">
        <div className="flex items-center gap-4">
          <Link to={`/booking/${showtimeId}/seats`} className="text-[var(--rogym-text-muted)] hover:text-white transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold font-display uppercase tracking-wide text-white">
              Chọn Combo
            </h1>
            <p className="text-sm text-[var(--rogym-text-muted)] mt-1">
              Chọn thêm đồ ăn và thức uống để tận hưởng trọn vẹn suất chiếu.
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
        <Alert tone="error" icon={<AlertCircle className="w-4 h-4" />}>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Combo List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-8">
        {combos.map(combo => (
          <div key={combo.id} className="flex gap-4 p-4 rounded-xl bg-[var(--rogym-surface)] border border-[var(--rogym-border-subtle)] hover:border-[var(--rogym-primary)] transition-colors">
            {/* Combo Image */}
            <div className="w-24 h-24 shrink-0 rounded-lg bg-[var(--rogym-surface-hover)] overflow-hidden">
              {combo.image ? (
                <img src={combo.image} alt={combo.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-gray-500 text-center p-2">Không có ảnh</div>
              )}
            </div>
            
            {/* Combo Details */}
            <div className="flex flex-col justify-between flex-1">
              <div>
                <h3 className="text-white font-bold text-lg">{combo.name}</h3>
                <p className="text-sm text-[var(--rogym-text-muted)] line-clamp-2 mt-1">{combo.description}</p>
              </div>
              
              <div className="flex items-center justify-between mt-4">
                <span className="text-[var(--rogym-primary)] font-bold text-lg">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(combo.price)}
                </span>
                
                {/* Quantity Controls */}
                <div className="flex items-center gap-3 bg-[var(--rogym-surface-hover)] p-1 rounded-lg">
                  <button 
                    onClick={() => handleUpdateQuantity(combo.id, -1)}
                    disabled={quantities[combo.id] === 0}
                    className="w-8 h-8 flex items-center justify-center rounded-md bg-[var(--rogym-surface)] text-white disabled:opacity-30 hover:bg-gray-700 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-6 text-center text-white font-semibold">{quantities[combo.id]}</span>
                  <button 
                    onClick={() => handleUpdateQuantity(combo.id, 1)}
                    className="w-8 h-8 flex items-center justify-center rounded-md bg-[var(--rogym-primary)] text-white hover:bg-green-600 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
        {combos.length === 0 && !error && (
          <div className="col-span-full text-center py-12 text-[var(--rogym-text-muted)]">
            Không có combo nào khả dụng lúc này.
          </div>
        )}
      </div>

      {/* Footer actions */}
      <div className="sticky bottom-0 bg-[var(--rogym-surface)] p-4 flex items-center justify-between border-t border-[var(--rogym-border-subtle)] -mx-4 sm:mx-0 px-4 sm:px-6 rounded-t-xl sm:rounded-none">
        <div>
          <div className="text-sm text-[var(--rogym-text-muted)] mb-1">
            Ghế: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(seatsTotalAmount || 0)}
          </div>
          <div className="text-white">
            <span className="text-[var(--rogym-text-muted)] mr-2">Tổng thanh toán:</span>
            <span className="text-2xl font-bold text-[var(--rogym-primary)]">
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(finalTotalAmount)}
            </span>
          </div>
        </div>
        <Button 
          variant="primary" 
          onClick={handleContinue}
        >
          Tiếp tục thanh toán
        </Button>
      </div>
    </div>
  )
}
