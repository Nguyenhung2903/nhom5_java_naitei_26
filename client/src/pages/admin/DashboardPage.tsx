import { useState, useEffect, useCallback, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  StatCard,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Badge,
  Button,
  ProgressBar,
  Alert,
  AlertDescription,
  PageLoader,
} from '@/components/ui'
import {
  Film,
  CalendarDays,
  Ticket,
  Users,
  DollarSign,
  TrendingUp,
  Plus,
  Shield,
  MapPin,
  BarChart3,
  RefreshCw,
  Clock,
  ExternalLink,
} from 'lucide-react'
import { revenueService } from '@/services/revenueService'
import { movieService } from '@/services/movieService'
import { userService } from '@/services/userService'
import type {
  RevenueOverview,
  RevenueTimePoint,
  MovieRevenue,
  AdminBookingDetail,
} from '@/types/revenue'

function formatVND(amount: number | undefined | null): string {
  if (amount === undefined || amount === null) return '0 đ'
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
}

function formatRelativeTime(dateStr?: string | null): string {
  if (!dateStr) return '-'
  try {
    const diffMs = Date.now() - new Date(dateStr).getTime()
    const diffSec = Math.floor(diffMs / 1000)
    if (diffSec < 60) return 'Vừa xong'
    const diffMin = Math.floor(diffSec / 60)
    if (diffMin < 60) return `${diffMin} phút trước`
    const diffHour = Math.floor(diffMin / 60)
    if (diffHour < 24) return `${diffHour} giờ trước`
    const diffDays = Math.floor(diffHour / 24)
    if (diffDays === 1) return 'Hôm qua'
    if (diffDays < 7) return `${diffDays} ngày trước`
    return new Date(dateStr).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
  } catch {
    return dateStr
  }
}

export function DashboardPage() {
  const [overview, setOverview] = useState<RevenueOverview | null>(null)
  const [nowShowingCount, setNowShowingCount] = useState<number>(0)
  const [totalUsersCount, setTotalUsersCount] = useState<number>(0)
  const [recentBookings, setRecentBookings] = useState<AdminBookingDetail[]>([])
  const [weeklyTrend, setWeeklyTrend] = useState<RevenueTimePoint[]>([])
  const [topMovies, setTopMovies] = useState<MovieRevenue[]>([])

  const [loading, setLoading] = useState<boolean>(true)
  const [refreshing, setRefreshing] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const fetchDashboardData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    else setLoading(true)
    setError(null)

    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    const nowIso = now.toISOString()

    const sevenDaysAgo = new Date(now)
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    sevenDaysAgo.setHours(0, 0, 0, 0)
    const sevenDaysIso = sevenDaysAgo.toISOString()

    try {
      const [
        overviewData,
        moviesData,
        usersData,
        bookingsData,
        weeklyData,
        topMoviesData,
      ] = await Promise.all([
        revenueService.getOverview({ startDate: startOfMonth, endDate: nowIso }),
        movieService.getMovies({ status: 'NOW_SHOWING' }).catch(() => []),
        userService.getUsers({ size: 1 }).catch(() => ({ totalElements: 0 })),
        revenueService.getBookings({ limit: 6 }).catch(() => []),
        revenueService.getTimeSeries({ startDate: sevenDaysIso, endDate: nowIso, groupBy: 'day' }).catch(() => []),
        revenueService.getRevenueByMovies({ startDate: startOfMonth, endDate: nowIso, limit: 4 }).catch(() => []),
      ])

      setOverview(overviewData)
      setNowShowingCount(moviesData.length)
      setTotalUsersCount(usersData?.totalElements || 0)
      setRecentBookings(bookingsData.slice(0, 6))
      setWeeklyTrend(weeklyData)
      setTopMovies(topMoviesData)
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Không thể tải dữ liệu Dashboard. Vui lòng thử lại!')
      }
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  const maxWeeklyRevenue = useMemo(() => {
    if (weeklyTrend.length === 0) return 1000000
    const max = Math.max(...weeklyTrend.map((t) => t.totalRevenue || 0))
    return max > 0 ? max : 1000000
  }, [weeklyTrend])

  if (loading) {
    return <PageLoader ariaLabel="Đang tải dữ liệu Bảng điều khiển Quản trị..." />
  }

  return (
    <div className="space-y-8">
      {/* 1. Top Welcome & Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-white uppercase tracking-wide flex items-center gap-2.5">
            <Shield className="w-7 h-7 text-[var(--rogym-green)]" />
            <span>Bảng Điều Khiển Quản Trị</span>
          </h1>
          <p className="text-xs text-[var(--rogym-text-secondary)] mt-1">
            Tổng quan tình hình kinh doanh, suất chiếu và hoạt động hệ thống thời gian thực
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />}
            onClick={() => fetchDashboardData(true)}
            disabled={refreshing}
          >
            Làm mới
          </Button>

          <Link to="/admin/revenue">
            <Button variant="primary" size="sm" leftIcon={<BarChart3 className="w-4 h-4" />}>
              Báo cáo doanh thu
            </Button>
          </Link>
          <Link to="/admin/movies">
            <Button variant="secondary" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
              Thêm phim mới
            </Button>
          </Link>
          <Link to="/admin/showtimes">
            <Button variant="secondary" size="sm" leftIcon={<CalendarDays className="w-4 h-4" />}>
              Tạo suất chiếu
            </Button>
          </Link>
        </div>
      </div>

      {error && (
        <Alert tone="error">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* 2. Stat Cards Grid (Real Data) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          label="Tổng doanh thu tháng này"
          value={formatVND(overview?.totalRevenue)}
          icon={<DollarSign className="w-5 h-5 text-[var(--rogym-green)]" />}
          trend={{
            value: `${overview?.growthRate !== undefined && overview.growthRate >= 0 ? '+' : ''}${overview?.growthRate || 0}%`,
            isPositive: (overview?.growthRate || 0) >= 0,
          }}
          hint="So với tháng trước"
          accent
        />

        <StatCard
          label="Vé đã bán tháng này"
          value={`${overview?.totalTicketsSold ? overview.totalTicketsSold.toLocaleString('vi-VN') : 0} vé`}
          icon={<Ticket className="w-5 h-5 text-sky-400" />}
          hint={`${overview?.totalBookings ? overview.totalBookings.toLocaleString('vi-VN') : 0} đơn đặt thành công`}
        />

        <StatCard
          label="Phim đang công chiếu"
          value={`${nowShowingCount} phim`}
          icon={<Film className="w-5 h-5 text-emerald-400" />}
          hint="Đang mở bán vé trực tuyến"
        />

        <StatCard
          label="Thành viên hệ thống"
          value={`${totalUsersCount.toLocaleString('vi-VN')} tài khoản`}
          icon={<Users className="w-5 h-5 text-purple-400" />}
          hint="Tổng người dùng đăng ký"
        />
      </div>

      {/* 3. Middle Section: Recent Live Activities & Quick Shortcuts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Real Transactions Feed */}
        <Card variant="elevated" className="lg:col-span-2 p-6 flex flex-col justify-between">
          <div>
            <CardHeader className="p-0 pb-4 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[var(--rogym-teal)]" />
                  <span>Nhật ký giao dịch gần đây</span>
                </CardTitle>
                <CardDescription className="text-xs text-[var(--rogym-text-muted)]">
                  Các đơn đặt vé mới nhất từ khách hàng trên toàn hệ thống
                </CardDescription>
              </div>
              <Link to="/admin/revenue">
                <Badge tone="primary" size="xs" className="cursor-pointer hover:opacity-80">
                  Xem tất cả đơn →
                </Badge>
              </Link>
            </CardHeader>

            <CardContent className="p-0 divide-y divide-[var(--rogym-border-subtle)]">
              {recentBookings.length === 0 ? (
                <div className="py-8 text-center text-xs text-[var(--rogym-text-muted)]">
                  Chưa có giao dịch đặt vé nào trong hệ thống
                </div>
              ) : (
                recentBookings.map((b) => (
                  <div key={b.bookingId} className="py-3 flex items-center justify-between text-xs gap-3">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-white text-xs">{b.bookingCode}</span>
                        <span className="text-[11px] text-[var(--rogym-text-muted)]">•</span>
                        <span className="text-white font-medium truncate">{b.customerName}</span>
                      </div>
                      <p className="text-[11px] text-[var(--rogym-text-secondary)] truncate">
                        Phim: <strong className="text-white">{b.movieTitle}</strong> ({b.theaterName} - {b.roomName})
                      </p>
                    </div>

                    <div className="text-right flex-shrink-0 space-y-1">
                      <span className="font-bold text-xs text-[var(--rogym-green)] block">
                        {formatVND(b.totalAmount)}
                      </span>
                      <span className="text-[10px] text-[var(--rogym-text-muted)] flex items-center justify-end gap-1">
                        <Clock className="w-3 h-3" />
                        {formatRelativeTime(b.bookingTime)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </div>
        </Card>

        {/* Quick Management Shortcuts */}
        <Card variant="glass" className="p-6 flex flex-col justify-between">
          <CardHeader className="p-0 pb-4">
            <CardTitle className="text-base font-bold text-white">Lối tắt quản lý</CardTitle>
            <CardDescription className="text-xs text-[var(--rogym-text-muted)]">
              Truy cập nhanh các phân hệ chính
            </CardDescription>
          </CardHeader>

          <CardContent className="p-0 space-y-2.5">
            <Link
              to="/admin/revenue"
              className="flex items-center justify-between p-3 rounded-xl bg-[var(--rogym-green)]/10 hover:bg-[var(--rogym-green)]/20 border border-[var(--rogym-green)]/30 text-xs font-semibold text-white transition-all"
            >
              <span className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[var(--rogym-green)]" />
                Báo cáo & Thống kê Doanh thu
              </span>
              <span className="text-[var(--rogym-green)]">→</span>
            </Link>

            <Link
              to="/admin/movies"
              className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-[var(--rogym-border-subtle)] text-xs font-semibold text-white transition-all"
            >
              <span className="flex items-center gap-2">
                <Film className="w-4 h-4 text-[var(--rogym-green)]" />
                Quản lý kho Phim
              </span>
              <span className="text-[var(--rogym-teal)]">→</span>
            </Link>

            <Link
              to="/admin/showtimes"
              className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-[var(--rogym-border-subtle)] text-xs font-semibold text-white transition-all"
            >
              <span className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-[var(--rogym-teal)]" />
                Lịch & Suất chiếu
              </span>
              <span className="text-[var(--rogym-teal)]">→</span>
            </Link>

            <Link
              to="/admin/theaters"
              className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-[var(--rogym-border-subtle)] text-xs font-semibold text-white transition-all"
            >
              <span className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-400" />
                Quản lý Cụm Rạp & Phòng Chiếu
              </span>
              <span className="text-[var(--rogym-teal)]">→</span>
            </Link>

            <Link
              to="/admin/users"
              className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-[var(--rogym-border-subtle)] text-xs font-semibold text-white transition-all"
            >
              <span className="flex items-center gap-2">
                <Users className="w-4 h-4 text-sky-400" />
                Quản lý Người dùng
              </span>
              <span className="text-[var(--rogym-teal)]">→</span>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* 4. Bottom Section: Mini 7-Day Revenue Trend & Top 4 Movies */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Revenue Trend Bars */}
        <Card variant="elevated" className="p-6">
          <CardHeader className="p-0 pb-4 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[var(--rogym-green)]" />
                <span>Xu Hướng Doanh Thu 7 Ngày Qua</span>
              </CardTitle>
              <CardDescription className="text-xs text-[var(--rogym-text-muted)]">
                Biến động doanh thu theo từng ngày gần nhất
              </CardDescription>
            </div>
            <Link to="/admin/revenue">
              <Button variant="dark" size="xs" rightIcon={<ExternalLink className="w-3 h-3" />}>
                Xem chi tiết
              </Button>
            </Link>
          </CardHeader>

          <CardContent className="p-0">
            {weeklyTrend.length === 0 ? (
              <div className="h-44 flex items-center justify-center text-xs text-[var(--rogym-text-muted)]">
                Chưa có số liệu doanh thu trong 7 ngày qua
              </div>
            ) : (
              <div className="h-44 flex items-end gap-2 sm:gap-3 pt-6 pb-2 px-2 border-b border-[var(--rogym-border-subtle)]">
                {weeklyTrend.map((t, idx) => {
                  const h = Math.max(10, Math.round((t.totalRevenue / maxWeeklyRevenue) * 100))
                  return (
                    <div
                      key={idx}
                      className="flex-1 h-full flex flex-col justify-end items-center group relative cursor-pointer"
                    >
                      {/* Tooltip */}
                      <div className="absolute bottom-full mb-1 hidden group-hover:flex flex-col z-20 p-2 rounded-lg bg-black/90 border border-white/10 text-[10px] text-white whitespace-nowrap shadow-xl">
                        <span className="font-bold text-[var(--rogym-teal)]">{t.dateLabel}</span>
                        <span className="text-[var(--rogym-green)]">{formatVND(t.totalRevenue)}</span>
                        <span className="text-[var(--rogym-text-muted)]">{t.ticketCount} vé</span>
                      </div>

                      <div
                        style={{ height: `${h}%` }}
                        className="w-full bg-[var(--rogym-green)] rounded-t-md group-hover:brightness-125 transition-all shadow-md group-hover:shadow-[var(--rogym-green)]/30"
                      />

                      <span className="text-[10px] font-mono text-[var(--rogym-text-muted)] mt-1.5 truncate max-w-full">
                        {t.dateLabel.slice(0, 5)}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top 4 Movies of the Month */}
        <Card variant="elevated" className="p-6 flex flex-col justify-between">
          <div>
            <CardHeader className="p-0 pb-4 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                  <Film className="w-4 h-4 text-amber-400" />
                  <span>Top Phim Ăn Khách Tháng Này</span>
                </CardTitle>
                <CardDescription className="text-xs text-[var(--rogym-text-muted)]">
                  Các bộ phim có doanh thu cao nhất trong tháng
                </CardDescription>
              </div>
              <Badge tone="accent" size="xs">Top 4</Badge>
            </CardHeader>

            <CardContent className="p-0 divide-y divide-[var(--rogym-border-subtle)]">
              {topMovies.length === 0 ? (
                <div className="py-8 text-center text-xs text-[var(--rogym-text-muted)]">
                  Chưa có số liệu doanh thu phim tháng này
                </div>
              ) : (
                topMovies.map((m, idx) => (
                  <div key={m.movieId} className="py-2.5 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-5 h-5 rounded-full bg-white/10 text-white font-mono font-bold flex items-center justify-center text-[10px]">
                          {idx + 1}
                        </span>
                        <span className="font-bold text-white truncate max-w-[180px] sm:max-w-xs">{m.title}</span>
                      </div>
                      <span className="font-bold text-[var(--rogym-green)]">{formatVND(m.totalRevenue)}</span>
                    </div>
                    <ProgressBar value={m.percentage} max={100} tone="primary" size="xs" />
                  </div>
                ))
              )}
            </CardContent>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default DashboardPage
