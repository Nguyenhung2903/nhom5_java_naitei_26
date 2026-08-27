import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import type { MyBookingResponse } from '@/services/bookingService'
import { bookingService } from '@/services/bookingService'
import {
  StatCard,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Badge,
  Button,
  PageLoader,
} from '@/components/ui'
import {
  Ticket,
  Award,
  CreditCard,
  BadgePercent,
  Film,
  User,
  Clock,
  MapPin,
  TrendingUp,
  Plus,
  UserCheck,
} from 'lucide-react'
import { format } from 'date-fns'

export function UserDashboardPage() {
  const { user } = useAuth()
  const [bookings, setBookings] = useState<MyBookingResponse[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true)
        const data = await bookingService.getMyBookings()
        setBookings(data || [])
      } catch {
        // Fallback gracefully if API is offline or empty
        setBookings([])
      } finally {
        setLoading(false)
      }
    }

    fetchBookings()
  }, [])

  const totalSpent = bookings
    .filter((b) => b.paymentStatus === 'PAID')
    .reduce((sum, b) => sum + (b.totalAmount || 0), 0)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount)
  }

  const membershipPoints = user?.points ?? 0
  const memberTier =
    membershipPoints >= 1000
      ? 'Kim Cương (Diamond)'
      : membershipPoints >= 500
      ? 'Vàng (Gold)'
      : 'Bạc (Silver)'

  const stats = [
    {
      label: 'Vé đã đặt',
      value: `${bookings.length} vé`,
      icon: <Ticket className="w-5 h-5" />,
      hint: 'Lịch sử giao dịch',
    },
    {
      label: 'Điểm tích lũy',
      value: `${membershipPoints} điểm`,
      icon: <Award className="w-5 h-5" />,
      trend: { value: memberTier, isPositive: true },
      hint: 'Hạng thành viên',
    },
    {
      label: 'Tổng chi tiêu',
      value: formatCurrency(totalSpent),
      icon: <CreditCard className="w-5 h-5" />,
      hint: 'Chi tiêu tích lũy',
    },
    {
      label: 'Ưu đãi khả dụng',
      value: '4 Voucher',
      icon: <BadgePercent className="w-5 h-5" />,
      trend: { value: 'Sẵn sàng dùng', isPositive: true },
      hint: 'Khuyến mãi thành viên',
    },
  ]

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24">
        <PageLoader ariaLabel="Đang tải dữ liệu bảng điều khiển..." />
      </div>
    )
  }

  const recentBookings = bookings.slice(0, 4)

  return (
    <div className="space-y-8">
      {/* Top Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-white uppercase tracking-wide flex items-center gap-2.5">
            <UserCheck className="w-7 h-7 text-[var(--rogym-green)]" />
            <span>Bảng Điều Khiển Thành Viên</span>
          </h1>
          <p className="text-xs text-[var(--rogym-text-secondary)] mt-1">
            Chào mừng trở lại, <span className="text-white font-semibold">{user?.fullName || 'Thành viên'}</span>! Quản lý vé xem phim, quyền lợi và điểm thưởng của bạn
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/user/movies">
            <Button variant="primary" size="sm" leftIcon={<Film className="w-4 h-4" />}>
              Đặt vé ngay
            </Button>
          </Link>
          <Link to="/user/profile">
            <Button variant="secondary" size="sm" leftIcon={<User className="w-4 h-4" />}>
              Hồ sơ cá nhân
            </Button>
          </Link>
        </div>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat, i) => (
          <StatCard
            key={i}
            label={stat.label}
            value={stat.value}
            icon={stat.icon}
            trend={stat.trend}
            hint={stat.hint}
            accent
          />
        ))}
      </div>

      {/* Main Content Grid: Recent Bookings & Quick Shortcuts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Bookings Feed */}
        <Card variant="elevated" className="lg:col-span-2 p-6">
          <CardHeader className="p-0 pb-4 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[var(--rogym-teal)]" />
                <span>Vé xem phim gần đây</span>
              </CardTitle>
              <CardDescription className="text-xs text-[var(--rogym-text-muted)]">
                Lịch sử đặt vé và trạng thái suất chiếu
              </CardDescription>
            </div>
            <Link to="/user/tickets">
              <Button variant="outline-white" size="xs">
                Xem tất cả ({bookings.length})
              </Button>
            </Link>
          </CardHeader>

          <CardContent className="p-0">
            {recentBookings.length > 0 ? (
              <div className="divide-y divide-[var(--rogym-border-subtle)]">
                {recentBookings.map((b) => (
                  <div
                    key={b.id || b.bookingCode}
                    className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-14 rounded-lg bg-[var(--rogym-bg-surface)] overflow-hidden shrink-0 border border-[var(--rogym-border-subtle)]">
                        {b.moviePoster ? (
                          <img
                            src={b.moviePoster}
                            alt={b.movieTitle}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[var(--rogym-text-muted)]">
                            <Film className="w-5 h-5" />
                          </div>
                        )}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-white text-sm">{b.movieTitle}</p>
                          <Badge
                            tone={b.paymentStatus === 'PAID' ? 'success' : 'warning'}
                            size="xs"
                          >
                            {b.paymentStatus === 'PAID' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[var(--rogym-text-muted)] text-[11px]">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-[var(--rogym-teal)]" />
                            {b.theaterName} - {b.roomName}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-[var(--rogym-teal)]" />
                            {b.showtimeStartTime
                              ? format(new Date(b.showtimeStartTime), 'HH:mm - dd/MM/yyyy')
                              : 'Chưa có giờ'}
                          </span>
                        </div>
                        <p className="text-[11px] text-[var(--rogym-text-secondary)]">
                          Ghế:{' '}
                          <span className="text-white font-medium">
                            {b.seatNames?.join(', ') || 'N/A'}
                          </span>{' '}
                          | Mã vé:{' '}
                          <span className="text-[var(--rogym-teal)] font-mono font-bold">
                            {b.bookingCode}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="text-right sm:self-center shrink-0">
                      <p className="font-bold text-[var(--rogym-green)] text-sm">
                        {formatCurrency(b.totalAmount || 0)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center space-y-3">
                <div className="mx-auto w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[var(--rogym-text-muted)]">
                  <Ticket className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold text-white">Bạn chưa có đơn đặt vé nào</p>
                <p className="text-xs text-[var(--rogym-text-secondary)] max-w-sm mx-auto">
                  Khám phá danh sách các bộ phim bom tấn đang chiếu và đặt ngay những vị trí ngồi đẹp nhất!
                </p>
                <div className="pt-2">
                  <Link to="/user/movies">
                    <Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
                      Khám phá phim ngay
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Membership Info & Quick Shortcuts */}
        <div className="space-y-6">
          {/* Member Card */}
          <Card
            variant="glass"
            className="p-6 relative overflow-hidden border-[var(--rogym-border-focus)] bg-gradient-to-br from-[var(--rogym-bg-card)] to-white/[0.02]"
          >
            <div className="flex items-center justify-between pb-4 border-b border-[var(--rogym-border-subtle)]">
              <div>
                <p className="text-[10px] uppercase font-bold tracking-widest text-[var(--rogym-teal)]">
                  Thẻ Hội Viên
                </p>
                <p className="text-base font-display font-bold text-white mt-0.5">
                  {user?.fullName || 'CinemaNest Member'}
                </p>
              </div>
              <Badge tone="accent" size="sm">
                {memberTier.split(' ')[0]}
              </Badge>
            </div>

            <div className="pt-4 space-y-2 text-xs">
              <div className="flex justify-between text-[var(--rogym-text-secondary)]">
                <span>Điểm thưởng hiện tại:</span>
                <span className="font-bold text-[var(--rogym-green)] font-mono">
                  {membershipPoints} pts
                </span>
              </div>
              <div className="flex justify-between text-[var(--rogym-text-secondary)]">
                <span>Trạng thái tài khoản:</span>
                <span className="text-emerald-400 font-semibold">Đang hoạt động</span>
              </div>
              <div className="flex justify-between text-[var(--rogym-text-secondary)]">
                <span>Email liên kết:</span>
                <span className="text-white font-mono text-[11px] truncate max-w-[150px]">
                  {user?.email || 'N/A'}
                </span>
              </div>
            </div>
          </Card>

          {/* Quick Shortcuts */}
          <Card variant="glass" className="p-6 flex flex-col justify-between">
            <CardHeader className="p-0 pb-4">
              <CardTitle className="text-base font-bold text-white">Lối tắt thao tác</CardTitle>
              <CardDescription className="text-xs text-[var(--rogym-text-muted)]">
                Truy cập nhanh các tính năng thành viên
              </CardDescription>
            </CardHeader>

            <CardContent className="p-0 space-y-2.5">
              <Link
                to="/user/movies"
                className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-[var(--rogym-border-subtle)] text-xs font-semibold text-white transition-all"
              >
                <span className="flex items-center gap-2">
                  <Film className="w-4 h-4 text-[var(--rogym-green)]" />
                  Xem phim đang chiếu
                </span>
                <span className="text-[var(--rogym-teal)]">→</span>
              </Link>

              <Link
                to="/user/tickets"
                className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-[var(--rogym-border-subtle)] text-xs font-semibold text-white transition-all"
              >
                <span className="flex items-center gap-2">
                  <Ticket className="w-4 h-4 text-amber-400" />
                  Danh sách Vé của tôi
                </span>
                <span className="text-[var(--rogym-teal)]">→</span>
              </Link>

              <Link
                to="/user/profile"
                className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-[var(--rogym-border-subtle)] text-xs font-semibold text-white transition-all"
              >
                <span className="flex items-center gap-2">
                  <User className="w-4 h-4 text-sky-400" />
                  Chỉnh sửa Hồ sơ cá nhân
                </span>
                <span className="text-[var(--rogym-teal)]">→</span>
              </Link>

              <Link
                to="/promotions"
                className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-[var(--rogym-border-subtle)] text-xs font-semibold text-white transition-all"
              >
                <span className="flex items-center gap-2">
                  <BadgePercent className="w-4 h-4 text-pink-400" />
                  Khám phá Khuyến mãi
                </span>
                <span className="text-[var(--rogym-teal)]">→</span>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default UserDashboardPage
