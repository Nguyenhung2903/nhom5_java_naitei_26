import { useEffect, useState, useRef } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { bookingService } from '@/services/bookingService'
import { showtimeSeatService } from '@/services/showtimeSeatService'
import { useAuth } from '@/hooks/useAuth'
import { PageLoader, Alert, AlertDescription, Button } from '@/components/ui'
import { AlertCircle, CheckCircle2 } from 'lucide-react'

export function VNPayReturnPage() {
  const [searchParams] = useSearchParams()
  const { refreshProfile } = useAuth()
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const isProcessingRef = useRef(false)

  useEffect(() => {
    const processReturn = async () => {
      if (isProcessingRef.current) return
      isProcessingRef.current = true
      const vnpayParams: Record<string, string> = {}
      searchParams.forEach((value, key) => {
        vnpayParams[key] = value
      })

      const transactionNo = searchParams.get('vnp_TransactionNo')
      
      const pendingStr = localStorage.getItem('pending_vnpay_booking')
      if (!pendingStr) {
        setStatus('error')
        setErrorMessage('Không tìm thấy thông tin đặt vé lưu tạm. Vui lòng liên hệ hỗ trợ.')
        return
      }

      let pendingBooking
      try {
        pendingBooking = JSON.parse(pendingStr)
      } catch (e) {
        setStatus('error')
        setErrorMessage('Dữ liệu vé lưu tạm bị lỗi.')
        return
      }

      try {
        await bookingService.createBooking({
          ...pendingBooking,
          paymentMethod: 'VNPAY',
          paymentTransactionId: transactionNo,
          vnpayParams: vnpayParams
        })

        localStorage.removeItem('pending_vnpay_booking')
        try {
          await refreshProfile()
        } catch (e) {
          console.error('Failed to refresh profile after VNPay return:', e)
        }
        setStatus('success')
      } catch (err: any) {
        setStatus('error')
        setErrorMessage(err.response?.data?.message || 'Thanh toán không thành công hoặc bị hủy. Mã giao dịch: ' + transactionNo)
        
        if (pendingBooking && pendingBooking.showtimeId && pendingBooking.seatIds) {
          showtimeSeatService.releaseSeats(pendingBooking.showtimeId, pendingBooking.seatIds).catch(console.error)
        }
      }
    }

    processReturn()
  }, [searchParams, refreshProfile])

  return (
    <div className="max-w-3xl mx-auto px-4 py-16 text-center">
      {status === 'loading' && (
        <div className="flex flex-col items-center gap-4">
          <PageLoader ariaLabel="Đang xử lý kết quả thanh toán..." />
          <p className="text-[var(--rogym-text-muted)]">Vui lòng không đóng trình duyệt lúc này...</p>
        </div>
      )}

      {status === 'success' && (
        <div className="bg-[var(--rogym-surface)] border border-[var(--rogym-primary)]/50 rounded-xl p-8 max-w-md mx-auto">
          <CheckCircle2 className="w-16 h-16 text-[var(--rogym-primary)] mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Thanh toán thành công!</h1>
          <p className="text-[var(--rogym-text-muted)] mb-8">
            Cảm ơn bạn đã đặt vé. Thông tin vé đã được lưu vào hệ thống và sẵn sàng trong mục Vé của tôi.
          </p>
          <div className="space-y-2">
            <Link to="/user/tickets">
              <Button variant="primary" className="w-full">Xem Vé Của Tôi</Button>
            </Link>
            <Link to="/user">
              <Button variant="secondary" className="w-full">Về Bảng Điều Khiển</Button>
            </Link>
          </div>
        </div>
      )}

      {status === 'error' && (
        <div className="bg-[var(--rogym-surface)] border border-red-500/50 rounded-xl p-8 max-w-md mx-auto">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Thanh toán thất bại</h1>
          <Alert tone="error" className="mb-8 mt-4 text-left">
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
          <Link to="/user">
            <Button variant="secondary" className="w-full">Về Bảng Điều Khiển</Button>
          </Link>
        </div>
      )}
    </div>
  )
}
