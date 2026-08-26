import { useState, useEffect, useMemo, useCallback } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { revenueService } from '@/services/revenueService'
import { movieService } from '@/services/movieService'
import { theaterService } from '@/services/theaterService'
import type {
  RevenueOverview,
  RevenueTimePoint,
  MovieRevenue,
  TheaterRevenue,
  AdminBookingDetail,
} from '@/types/revenue'
import type { MovieOption } from '@/types/movie'
import type { Theater } from '@/types/theater'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  StatCard,
  Button,
  Input,
  Select,
  FormField,
  Badge,
  StatusBadge,
  ResponsiveTable,
  Pagination,
  Modal,
  ModalFooter,
  ProgressBar,
  Alert,
  AlertDescription,
  PageLoader,
} from '@/components/ui'
import {
  TrendingUp,
  DollarSign,
  Ticket,
  Utensils,
  ShoppingBag,
  Download,
  RefreshCw,
  Film,
  MapPin,
  Calendar,
  Search,
  Eye,
  Info,
  Receipt,
  User,
  Clock,
} from 'lucide-react'

function formatVND(amount: number | undefined | null): string {
  if (amount === undefined || amount === null) return '0 đ'
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
}

function formatDate(dateStr: string | undefined | null): string {
  if (!dateStr) return '-'
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return dateStr
  }
}

type TimePreset = '7_DAYS' | '30_DAYS' | 'THIS_MONTH' | 'THIS_YEAR' | 'ALL' | 'CUSTOM'

export function RevenueManagementPage() {
  const [searchParams, setSearchParams] = useSearchParams()

  // Filter States
  const [timePreset, setTimePreset] = useState<TimePreset>(() => {
    return (searchParams.get('preset') as TimePreset) || '30_DAYS'
  })
  const [customStartDate, setCustomStartDate] = useState<string>('')
  const [customEndDate, setCustomEndDate] = useState<string>('')
  const [selectedMovieId, setSelectedMovieId] = useState<string>(() => searchParams.get('movieId') || '')
  const [selectedTheaterId, setSelectedTheaterId] = useState<string>(() => searchParams.get('theaterId') || '')
  const [chartGroupBy, setChartGroupBy] = useState<'day' | 'month'>('day')
  const [chartViewMode, setChartViewMode] = useState<'bar' | 'line'>('bar')

  // Search & Filter for Bookings Table
  const [bookingSearch, setBookingSearch] = useState<string>('')
  const [bookingStatusFilter, setBookingStatusFilter] = useState<string>('ALL')
  const [currentPage, setCurrentPage] = useState<number>(1)
  const pageSize = 8

  // Data States
  const [overview, setOverview] = useState<RevenueOverview | null>(null)
  const [timeSeries, setTimeSeries] = useState<RevenueTimePoint[]>([])
  const [movieRevenues, setMovieRevenues] = useState<MovieRevenue[]>([])
  const [theaterRevenues, setTheaterRevenues] = useState<TheaterRevenue[]>([])
  const [bookings, setBookings] = useState<AdminBookingDetail[]>([])

  // Dropdown Options
  const [movieOptions, setMovieOptions] = useState<MovieOption[]>([])
  const [theaterOptions, setTheaterOptions] = useState<Theater[]>([])

  // UI State
  const [loading, setLoading] = useState<boolean>(true)
  const [refreshing, setRefreshing] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedBookingDetail, setSelectedBookingDetail] = useState<AdminBookingDetail | null>(null)

  // Calculate start & end ISO dates from preset
  const dateRange = useMemo(() => {
    const now = new Date()
    if (timePreset === '7_DAYS') {
      const start = new Date(now)
      start.setDate(start.getDate() - 7)
      start.setHours(0, 0, 0, 0)
      return { startDate: start.toISOString(), endDate: now.toISOString() }
    }
    if (timePreset === '30_DAYS') {
      const start = new Date(now)
      start.setDate(start.getDate() - 30)
      start.setHours(0, 0, 0, 0)
      return { startDate: start.toISOString(), endDate: now.toISOString() }
    }
    if (timePreset === 'THIS_MONTH') {
      const start = new Date(now.getFullYear(), now.getMonth(), 1)
      return { startDate: start.toISOString(), endDate: now.toISOString() }
    }
    if (timePreset === 'THIS_YEAR') {
      const start = new Date(now.getFullYear(), 0, 1)
      return { startDate: start.toISOString(), endDate: now.toISOString() }
    }
    if (timePreset === 'CUSTOM') {
      const start = customStartDate ? new Date(`${customStartDate}T00:00:00Z`).toISOString() : undefined
      const end = customEndDate ? new Date(`${customEndDate}T23:59:59Z`).toISOString() : undefined
      return { startDate: start, endDate: end }
    }
    return { startDate: undefined, endDate: undefined }
  }, [timePreset, customStartDate, customEndDate])

  // Load dropdown lists (Movies & Theaters)
  useEffect(() => {
    Promise.all([movieService.getAll(), theaterService.getAll()])
      .then(([movies, theaters]) => {
        setMovieOptions(movies)
        setTheaterOptions(theaters)
      })
      .catch((err: Error) => {
        console.error('Lỗi tải danh mục phim/rạp:', err)
      })
  }, [])

  // Sync URL query params
  useEffect(() => {
    const params = new URLSearchParams()
    if (timePreset !== '30_DAYS') params.set('preset', timePreset)
    if (selectedMovieId) params.set('movieId', selectedMovieId)
    if (selectedTheaterId) params.set('theaterId', selectedTheaterId)
    setSearchParams(params, { replace: true })
  }, [timePreset, selectedMovieId, selectedTheaterId, setSearchParams])

  // Main Data Fetcher
  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    else setLoading(true)
    setError(null)

    const queryParams = {
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
      movieId: selectedMovieId || undefined,
      theaterId: selectedTheaterId || undefined,
      groupBy: chartGroupBy,
    }

    try {
      const [overviewData, timeSeriesData, moviesData, theatersData, bookingsData] = await Promise.all([
        revenueService.getOverview(queryParams),
        revenueService.getTimeSeries(queryParams),
        revenueService.getRevenueByMovies({ ...queryParams, limit: 10 }),
        revenueService.getRevenueByTheaters(queryParams),
        revenueService.getBookings(queryParams),
      ])

      setOverview(overviewData)
      setTimeSeries(timeSeriesData)
      setMovieRevenues(moviesData)
      setTheaterRevenues(theatersData)
      setBookings(bookingsData)
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Đã xảy ra lỗi khi tải dữ liệu thống kê doanh thu.')
      }
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [dateRange, selectedMovieId, selectedTheaterId, chartGroupBy])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Filter Bookings locally
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      if (bookingStatusFilter !== 'ALL' && b.paymentStatus !== bookingStatusFilter) {
        return false
      }
      if (bookingSearch.trim()) {
        const q = bookingSearch.trim().toLowerCase()
        const matchCode = b.bookingCode?.toLowerCase().includes(q)
        const matchCust = b.customerName?.toLowerCase().includes(q)
        const matchEmail = b.customerEmail?.toLowerCase().includes(q)
        const matchPhone = b.customerPhone?.toLowerCase().includes(q)
        const matchMovie = b.movieTitle?.toLowerCase().includes(q)
        if (!matchCode && !matchCust && !matchEmail && !matchPhone && !matchMovie) {
          return false
        }
      }
      return true
    })
  }, [bookings, bookingSearch, bookingStatusFilter])

  // Paginated bookings
  const paginatedBookings = useMemo(() => {
    const startIdx = (currentPage - 1) * pageSize
    return filteredBookings.slice(startIdx, startIdx + pageSize)
  }, [filteredBookings, currentPage, pageSize])

  const totalPages = Math.ceil(filteredBookings.length / pageSize) || 1

  // Handle Export CSV
  const handleExportCSV = () => {
    if (bookings.length === 0) {
      alert('Không có dữ liệu giao dịch để xuất báo cáo.')
      return
    }

    const headers = [
      'Mã Đơn',
      'Thời Gian Đặt',
      'Khách Hàng',
      'Email',
      'SĐT',
      'Phim',
      'Cụm Rạp',
      'Phòng Chiếu',
      'Suất Chiếu',
      'Ghế Ngồi',
      'Số Vé',
      'Bắp Nước & Combo',
      'Mã Giảm Giá',
      'Tổng Tiền (VNĐ)',
      'Phương Thức',
      'Trạng Thái Thanh Toán',
    ]

    const rows = bookings.map((b) => [
      `"${b.bookingCode}"`,
      `"${formatDate(b.bookingTime)}"`,
      `"${b.customerName || ''}"`,
      `"${b.customerEmail || ''}"`,
      `"${b.customerPhone || ''}"`,
      `"${b.movieTitle || ''}"`,
      `"${b.theaterName || ''}"`,
      `"${b.roomName || ''}"`,
      `"${formatDate(b.showtimeStartTime)}"`,
      `"${b.seats?.join(', ') || ''}"`,
      b.ticketCount || 0,
      `"${b.combos?.map((c) => `${c.comboName} (x${c.quantity})`).join(', ') || 'Không có'}"`,
      `"${b.promotionCode || ''}"`,
      b.totalAmount || 0,
      `"${b.paymentMethod || 'CASH'}"`,
      `"${b.paymentStatus || 'PAID'}"`,
    ])

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `Bao_Cao_Doanh_Thu_CinemaNest_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Chart max calculation
  const maxRevenueValue = useMemo(() => {
    if (timeSeries.length === 0) return 1000000
    const max = Math.max(...timeSeries.map((t) => t.totalRevenue || 0))
    return max > 0 ? max : 1000000
  }, [timeSeries])

  // Bookings Table Columns Definition
  const bookingColumns = [
    {
      key: 'bookingCode',
      header: 'Mã Đơn Vé',
      render: (row: AdminBookingDetail) => (
        <div className="space-y-0.5">
          <span className="font-mono font-bold text-white text-xs">{row.bookingCode}</span>
          <p className="text-[11px] text-[var(--rogym-text-muted)] flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatDate(row.bookingTime)}
          </p>
        </div>
      ),
    },
    {
      key: 'customerName',
      header: 'Khách Hàng',
      render: (row: AdminBookingDetail) => (
        <div className="space-y-0.5">
          <p className="font-semibold text-white text-xs">{row.customerName}</p>
          <span className="text-[11px] text-[var(--rogym-text-secondary)]">{row.customerPhone || row.customerEmail || '—'}</span>
        </div>
      ),
    },
    {
      key: 'movieTitle',
      header: 'Phim & Cụm Rạp',
      render: (row: AdminBookingDetail) => (
        <div className="space-y-0.5 max-w-[200px]">
          <p className="font-semibold text-white text-xs truncate" title={row.movieTitle}>
            {row.movieTitle}
          </p>
          <p className="text-[11px] text-[var(--rogym-teal)] truncate flex items-center gap-1">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            <span>{row.theaterName}</span> • <span className="text-[var(--rogym-text-muted)]">{row.roomName}</span>
          </p>
        </div>
      ),
    },
    {
      key: 'seats',
      header: 'Ghế & Combo',
      render: (row: AdminBookingDetail) => (
        <div className="space-y-1">
          <div className="flex flex-wrap gap-1">
            {row.seats && row.seats.length > 0 ? (
              row.seats.map((s, idx) => (
                <span key={idx} className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-white/10 text-white font-medium">
                  {s}
                </span>
              ))
            ) : (
              <span className="text-[11px] text-[var(--rogym-text-muted)]">—</span>
            )}
          </div>
          {row.combos && row.combos.length > 0 && (
            <p className="text-[10px] text-amber-400 truncate max-w-[140px]" title={row.combos.map((c) => `${c.comboName} (x${c.quantity})`).join(', ')}>
              🍿 {row.combos.map((c) => `${c.comboName} (x${c.quantity})`).join(', ')}
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'totalAmount',
      header: 'Tổng Tiền',
      render: (row: AdminBookingDetail) => (
        <div className="space-y-0.5">
          <span className="font-bold text-xs text-[var(--rogym-green)]">{formatVND(row.totalAmount)}</span>
          <p className="text-[10px] uppercase tracking-wider text-[var(--rogym-text-muted)] font-mono">{row.paymentMethod || 'CASH'}</p>
        </div>
      ),
    },
    {
      key: 'paymentStatus',
      header: 'Trạng Thái',
      render: (row: AdminBookingDetail) => {
        if (row.paymentStatus === 'PAID') return <StatusBadge status="active" label="Đã thanh toán" />
        if (row.paymentStatus === 'UNPAID') return <StatusBadge status="pending" label="Chưa thanh toán" />
        if (row.paymentStatus === 'CANCELLED') return <StatusBadge status="banned" label="Đã hủy" />
        return <Badge tone="info" size="xs">{row.paymentStatus}</Badge>
      },
    },
    {
      key: 'actions',
      header: 'Thao Tác',
      render: (row: AdminBookingDetail) => (
        <Button
          variant="secondary"
          size="xs"
          leftIcon={<Eye className="w-3.5 h-3.5" />}
          onClick={() => setSelectedBookingDetail(row)}
        >
          Chi tiết
        </Button>
      ),
    },
  ]

  if (loading) {
    return <PageLoader ariaLabel="Đang tải dữ liệu báo cáo doanh thu..." />
  }

  return (
    <div className="space-y-8">
      {/* 1. Header & Quick Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display uppercase tracking-wide text-white flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-[var(--rogym-green)]/15 border border-[var(--rogym-green)]/30 text-[var(--rogym-green)]">
              <TrendingUp className="w-6 h-6" />
            </span>
            <span>Báo Cáo & Quản Lý Doanh Thu</span>
          </h1>
          <p className="text-xs text-[var(--rogym-text-secondary)] mt-1">
            Theo dõi, phân tích hiệu suất phòng vé theo phim, cụm rạp và lịch sử giao dịch thời gian thực
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />}
            onClick={() => fetchData(true)}
            disabled={refreshing}
          >
            Làm mới
          </Button>

          <Button
            variant="primary"
            size="sm"
            leftIcon={<Download className="w-4 h-4" />}
            onClick={handleExportCSV}
          >
            Xuất Báo Cáo CSV
          </Button>
        </div>
      </div>

      {error && (
        <Alert tone="error">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* 2. Global Filter Toolbar */}
      <Card variant="elevated" className="p-5 border-[var(--rogym-border-subtle)] space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[var(--rogym-border-subtle)]">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[var(--rogym-teal)]" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">Khoảng thời gian thống kê:</span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {[
              { id: '7_DAYS', label: '7 ngày qua' },
              { id: '30_DAYS', label: '30 ngày qua' },
              { id: 'THIS_MONTH', label: 'Tháng này' },
              { id: 'THIS_YEAR', label: 'Năm nay' },
              { id: 'ALL', label: 'Toàn thời gian' },
              { id: 'CUSTOM', label: 'Tùy chỉnh' },
            ].map((preset) => (
              <Button
                key={preset.id}
                variant={timePreset === preset.id ? 'primary' : 'dark'}
                size="xs"
                onClick={() => setTimePreset(preset.id as TimePreset)}
              >
                {preset.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Custom Date Range if preset is CUSTOM */}
          {timePreset === 'CUSTOM' ? (
            <>
              <FormField label="Từ ngày" htmlFor="customStartDate">
                <Input
                  id="customStartDate"
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                />
              </FormField>

              <FormField label="Đến ngày" htmlFor="customEndDate">
                <Input
                  id="customEndDate"
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                />
              </FormField>
            </>
          ) : null}

          {/* Filter by Movie */}
          <FormField label="Lọc theo Phim">
            <Select
              value={selectedMovieId}
              onValueChange={setSelectedMovieId}
            >
              <option value="">-- Tất cả các phim --</option>
              {movieOptions.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.title}
                </option>
              ))}
            </Select>
          </FormField>

          {/* Filter by Theater */}
          <FormField label="Lọc theo Cụm Rạp">
            <Select
              value={selectedTheaterId}
              onValueChange={setSelectedTheaterId}
            >
              <option value="">-- Tất cả cụm rạp --</option>
              {theaterOptions.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </Select>
          </FormField>

          {/* Group interval */}
          <FormField label="Xem xu hướng theo">
            <Select
              value={chartGroupBy}
              onValueChange={(val) => setChartGroupBy(val as 'day' | 'month')}
            >
              <option value="day">Từng Ngày</option>
              <option value="month">Từng Tháng</option>
            </Select>
          </FormField>
        </div>
      </Card>

      {/* 3. KPI StatCards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-5">
        <StatCard
          label="Tổng doanh thu"
          value={formatVND(overview?.totalRevenue)}
          icon={<DollarSign className="w-5 h-5 text-[var(--rogym-green)]" />}
          trend={{
            value: `${overview?.growthRate !== undefined && overview.growthRate >= 0 ? '+' : ''}${overview?.growthRate || 0}%`,
            isPositive: (overview?.growthRate || 0) >= 0,
          }}
          hint="So với chu kỳ trước"
          accent
        />

        <StatCard
          label="Doanh thu Vé xem phim"
          value={formatVND(overview?.ticketRevenue)}
          icon={<Ticket className="w-5 h-5 text-sky-400" />}
          hint={`${overview?.totalTicketsSold ? overview.totalTicketsSold.toLocaleString('vi-VN') : 0} vé đã xuất`}
        />

        <StatCard
          label="Doanh thu Combo bắp nước"
          value={formatVND(overview?.comboRevenue)}
          icon={<Utensils className="w-5 h-5 text-amber-400" />}
          hint="Dịch vụ kèm theo vé"
        />

        <StatCard
          label="Đơn đặt vé thành công"
          value={`${overview?.totalBookings ? overview.totalBookings.toLocaleString('vi-VN') : 0} đơn`}
          icon={<ShoppingBag className="w-5 h-5 text-emerald-400" />}
          hint="Giao dịch thanh toán"
        />

        <StatCard
          label="Giá trị trung bình/Đơn (AOV)"
          value={formatVND(overview?.averageOrderValue)}
          icon={<Receipt className="w-5 h-5 text-purple-400" />}
          hint="Doanh thu / Đơn hàng"
        />
      </div>

      {/* 4. Interactive Revenue Trend Chart */}
      <Card variant="elevated" className="p-6">
        <CardHeader className="p-0 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[var(--rogym-green)]" />
              <span>Biểu Đồ Xu Hướng Doanh Thu</span>
            </CardTitle>
            <CardDescription className="text-xs text-[var(--rogym-text-secondary)]">
              Biến động tổng doanh thu, doanh thu vé và combo theo từng mốc thời gian
            </CardDescription>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-4 text-xs font-medium">
              <span className="flex items-center gap-1.5 text-white">
                <span className="w-3 h-3 rounded-sm bg-[var(--rogym-green)] inline-block" />
                Tổng doanh thu
              </span>
              <span className="flex items-center gap-1.5 text-sky-400">
                <span className="w-3 h-3 rounded-sm bg-sky-400 inline-block" />
                Thu vé
              </span>
              <span className="flex items-center gap-1.5 text-amber-400">
                <span className="w-3 h-3 rounded-sm bg-amber-400 inline-block" />
                Thu combo
              </span>
            </div>

            <div className="flex items-center border border-[var(--rogym-border-subtle)] rounded-lg p-0.5">
              <button
                type="button"
                onClick={() => setChartViewMode('bar')}
                className={`px-2.5 py-1 text-xs font-semibold rounded cursor-pointer transition-all ${
                  chartViewMode === 'bar'
                    ? 'bg-[var(--rogym-green)] text-black'
                    : 'text-[var(--rogym-text-secondary)] hover:text-white'
                }`}
              >
                Cột
              </button>
              <button
                type="button"
                onClick={() => setChartViewMode('line')}
                className={`px-2.5 py-1 text-xs font-semibold rounded cursor-pointer transition-all ${
                  chartViewMode === 'line'
                    ? 'bg-[var(--rogym-green)] text-black'
                    : 'text-[var(--rogym-text-secondary)] hover:text-white'
                }`}
              >
                Đường
              </button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {timeSeries.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center text-xs text-[var(--rogym-text-muted)]">
              <Info className="w-8 h-8 mb-2 opacity-50" />
              <p>Chưa có dữ liệu giao dịch trong khoảng thời gian đã chọn</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* SVG / HTML Interactive Chart */}
              <div className="h-72 w-full flex items-end gap-2 sm:gap-3 pt-6 pb-2 px-2 border-b border-[var(--rogym-border-subtle)] overflow-x-auto">
                {timeSeries.map((item, index) => {
                  const heightPercent = Math.max(8, Math.round((item.totalRevenue / maxRevenueValue) * 100))
                  const ticketPercent = item.totalRevenue > 0 ? (item.ticketRevenue / item.totalRevenue) * 100 : 80
                  const comboPercent = 100 - ticketPercent

                  return (
                    <div
                      key={index}
                      className="flex-1 min-w-[38px] max-w-[64px] h-full flex flex-col justify-end items-center group relative cursor-pointer"
                    >
                      {/* Hover Tooltip */}
                      <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col z-30 p-2.5 rounded-xl bg-black/90 border border-[var(--rogym-border-subtle)] shadow-2xl text-[11px] text-white whitespace-nowrap pointer-events-none backdrop-blur-md">
                        <span className="font-bold text-[var(--rogym-teal)] border-b border-white/10 pb-1 mb-1">
                          {item.dateLabel}
                        </span>
                        <div className="space-y-0.5">
                          <p className="flex justify-between gap-3">
                            <span className="text-[var(--rogym-text-muted)]">Tổng:</span>
                            <strong className="text-[var(--rogym-green)]">{formatVND(item.totalRevenue)}</strong>
                          </p>
                          <p className="flex justify-between gap-3 text-sky-300">
                            <span>Vé:</span>
                            <span>{formatVND(item.ticketRevenue)} ({item.ticketCount} vé)</span>
                          </p>
                          <p className="flex justify-between gap-3 text-amber-300">
                            <span>Combo:</span>
                            <span>{formatVND(item.comboRevenue)}</span>
                          </p>
                        </div>
                      </div>

                      {/* Bar Visualization */}
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className="w-full rounded-t-md overflow-hidden flex flex-col justify-end transition-all duration-300 group-hover:brightness-125 shadow-lg group-hover:shadow-[var(--rogym-green)]/20"
                      >
                        <div
                          style={{ height: `${comboPercent}%` }}
                          className="w-full bg-amber-400"
                        />
                        <div
                          style={{ height: `${ticketPercent}%` }}
                          className="w-full bg-[var(--rogym-green)]"
                        />
                      </div>

                      <span className="text-[10px] font-mono text-[var(--rogym-text-muted)] mt-2 group-hover:text-white transition-colors truncate max-w-full">
                        {item.dateLabel.length > 5 ? item.dateLabel.slice(0, 5) : item.dateLabel}
                      </span>
                    </div>
                  )
                })}
              </div>

              <div className="flex items-center justify-between text-xs text-[var(--rogym-text-muted)] px-2">
                <span>Điểm dữ liệu: {timeSeries.length} mốc</span>
                <span>Doanh thu cao nhất trong kỳ: <strong className="text-white">{formatVND(maxRevenueValue)}</strong></span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 5. Two-column breakdown: Top Movies Box Office & Theaters Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Top Movies Box Office */}
        <Card variant="elevated" className="p-6 flex flex-col justify-between">
          <div>
            <CardHeader className="p-0 pb-4 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                  <Film className="w-5 h-5 text-[var(--rogym-green)]" />
                  <span>Xếp Hạng Phim Ăn Khách (Top Box Office)</span>
                </CardTitle>
                <CardDescription className="text-xs text-[var(--rogym-text-secondary)]">
                  Top các bộ phim có doanh thu phòng vé cao nhất trong kỳ
                </CardDescription>
              </div>
              <Badge tone="accent" size="xs">Top 10</Badge>
            </CardHeader>

            <CardContent className="p-0 divide-y divide-[var(--rogym-border-subtle)]">
              {movieRevenues.length === 0 ? (
                <div className="py-12 text-center text-xs text-[var(--rogym-text-muted)]">
                  Chưa có số liệu doanh thu phim
                </div>
              ) : (
                movieRevenues.map((m, rankIdx) => (
                  <div key={m.movieId} className="py-3.5 space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Rank Badge */}
                        <span
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold font-mono ${
                            rankIdx === 0
                              ? 'bg-amber-400 text-black shadow-md shadow-amber-400/30'
                              : rankIdx === 1
                              ? 'bg-slate-300 text-black'
                              : rankIdx === 2
                              ? 'bg-amber-700 text-white'
                              : 'bg-white/10 text-white'
                          }`}
                        >
                          {rankIdx + 1}
                        </span>

                        <div className="min-w-0">
                          <Link
                            to={`/admin/movies/${m.movieId}`}
                            className="font-bold text-xs text-white hover:text-[var(--rogym-green)] transition-colors truncate block"
                          >
                            {m.title}
                          </Link>
                          <p className="text-[11px] text-[var(--rogym-text-muted)]">
                            {m.ticketsSold.toLocaleString('vi-VN')} vé • {m.genre || 'Phim rạp'}
                          </p>
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <span className="font-bold text-xs text-[var(--rogym-green)]">
                          {formatVND(m.totalRevenue)}
                        </span>
                        <p className="text-[10px] text-[var(--rogym-text-muted)]">
                          {m.percentage}% tổng thu
                        </p>
                      </div>
                    </div>

                    <ProgressBar value={m.percentage} max={100} tone="primary" size="sm" />
                  </div>
                ))
              )}
            </CardContent>
          </div>
        </Card>

        {/* Right: Theaters Breakdown */}
        <Card variant="elevated" className="p-6 flex flex-col justify-between">
          <div>
            <CardHeader className="p-0 pb-4 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-[var(--rogym-teal)]" />
                  <span>Cơ Cấu Doanh Thu Theo Cụm Rạp</span>
                </CardTitle>
                <CardDescription className="text-xs text-[var(--rogym-text-secondary)]">
                  Đóng góp doanh thu và lượng vé bán ra của từng cụm rạp
                </CardDescription>
              </div>
              <Badge tone="primary" size="xs">Cụm Rạp</Badge>
            </CardHeader>

            <CardContent className="p-0 divide-y divide-[var(--rogym-border-subtle)]">
              {theaterRevenues.length === 0 ? (
                <div className="py-12 text-center text-xs text-[var(--rogym-text-muted)]">
                  Chưa có số liệu doanh thu cụm rạp
                </div>
              ) : (
                theaterRevenues.map((t) => (
                  <div key={t.theaterId} className="py-3.5 space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <Link
                          to={`/admin/theaters/${t.theaterId}`}
                          className="font-bold text-xs text-white hover:text-[var(--rogym-teal)] transition-colors truncate block"
                        >
                          {t.theaterName}
                        </Link>
                        <p className="text-[11px] text-[var(--rogym-text-muted)] truncate max-w-[280px]">
                          {t.address} • {t.totalRooms} phòng chiếu • {t.ticketsSold.toLocaleString('vi-VN')} vé
                        </p>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <span className="font-bold text-xs text-[var(--rogym-teal)]">
                          {formatVND(t.totalRevenue)}
                        </span>
                        <p className="text-[10px] text-[var(--rogym-text-muted)]">
                          {t.percentage}% tỷ trọng
                        </p>
                      </div>
                    </div>

                    <ProgressBar value={t.percentage} max={100} tone="cyan" size="sm" />
                  </div>
                ))
              )}
            </CardContent>
          </div>
        </Card>
      </div>

      {/* 6. Bookings & Transactions Management Table */}
      <Card variant="elevated" className="p-6 space-y-4">
        <CardHeader className="p-0 pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-base font-bold text-white flex items-center gap-2">
              <Receipt className="w-5 h-5 text-[var(--rogym-green)]" />
              <span>Đối Soát & Quản Lý Đơn Đặt Vé</span>
            </CardTitle>
            <CardDescription className="text-xs text-[var(--rogym-text-secondary)]">
              Danh sách chi tiết toàn bộ các đơn đặt vé và giao dịch phát sinh trong kỳ ({filteredBookings.length} đơn)
            </CardDescription>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="w-64">
              <Input
                placeholder="Tìm mã vé, khách hàng, phim..."
                value={bookingSearch}
                onChange={(e) => {
                  setBookingSearch(e.target.value)
                  setCurrentPage(1)
                }}
                leftIcon={<Search className="w-4 h-4" />}
              />
            </div>

            {/* Status Filter */}
            <div className="w-40">
              <Select
                value={bookingStatusFilter}
                onValueChange={(val) => {
                  setBookingStatusFilter(val)
                  setCurrentPage(1)
                }}
              >
                <option value="ALL">Tất cả trạng thái</option>
                <option value="PAID">Đã thanh toán</option>
                <option value="UNPAID">Chưa thanh toán</option>
                <option value="CANCELLED">Đã hủy</option>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <ResponsiveTable
            data={paginatedBookings}
            columns={bookingColumns}
            keyExtractor={(item) => item.bookingId}
            emptyTitle="Không có đơn đặt vé nào khớp với tiêu chí tìm kiếm"
          />

          {totalPages > 1 && (
            <div className="pt-4 flex justify-end">
              <Pagination
                page={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* 7. Modal Xem Chi Tiết Đơn Đặt Vé (RoGym Standard Modal) */}
      <Modal
        open={selectedBookingDetail !== null}
        onClose={() => setSelectedBookingDetail(null)}
        title={`Chi Tiết Đơn Vé: #${selectedBookingDetail?.bookingCode || ''}`}
        size="lg"
      >
        {selectedBookingDetail && (
          <div className="space-y-5 text-xs">
            {/* Customer & Showtime Info Card */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-white/5 border border-[var(--rogym-border-subtle)]">
              <div className="space-y-2">
                <div className="flex items-center gap-2 font-bold text-white border-b border-white/10 pb-1">
                  <User className="w-4 h-4 text-[var(--rogym-green)]" />
                  <span>Thông tin Khách hàng</span>
                </div>
                <div className="space-y-1 text-[var(--rogym-text-secondary)]">
                  <p><strong className="text-white">Tên khách:</strong> {selectedBookingDetail.customerName}</p>
                  <p><strong className="text-white">Email:</strong> {selectedBookingDetail.customerEmail || '—'}</p>
                  <p><strong className="text-white">Số điện thoại:</strong> {selectedBookingDetail.customerPhone || '—'}</p>
                  <p><strong className="text-white">Thời gian đặt:</strong> {formatDate(selectedBookingDetail.bookingTime)}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 font-bold text-white border-b border-white/10 pb-1">
                  <Film className="w-4 h-4 text-[var(--rogym-teal)]" />
                  <span>Thông tin Suất Chiếu</span>
                </div>
                <div className="space-y-1 text-[var(--rogym-text-secondary)]">
                  <p><strong className="text-white">Phim:</strong> {selectedBookingDetail.movieTitle}</p>
                  <p><strong className="text-white">Cụm rạp:</strong> {selectedBookingDetail.theaterName}</p>
                  <p><strong className="text-white">Phòng chiếu:</strong> {selectedBookingDetail.roomName}</p>
                  <p><strong className="text-white">Giờ chiếu:</strong> {formatDate(selectedBookingDetail.showtimeStartTime)}</p>
                </div>
              </div>
            </div>

            {/* Seat & Combo Detail */}
            <div className="space-y-3">
              <h4 className="font-bold text-white flex items-center gap-2">
                <Ticket className="w-4 h-4 text-sky-400" />
                <span>Danh sách ghế đã đặt ({selectedBookingDetail.ticketCount} ghế)</span>
              </h4>

              <div className="flex flex-wrap gap-2">
                {selectedBookingDetail.seats.map((seat, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 rounded-lg bg-[var(--rogym-green)]/15 border border-[var(--rogym-green)]/30 text-white font-mono font-bold"
                  >
                    Ghế {seat}
                  </span>
                ))}
              </div>
            </div>

            {/* Combos breakdown */}
            {selectedBookingDetail.combos && selectedBookingDetail.combos.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-bold text-white flex items-center gap-2">
                  <Utensils className="w-4 h-4 text-amber-400" />
                  <span>Bắp nước & Combo đi kèm</span>
                </h4>

                <div className="rounded-xl border border-[var(--rogym-border-subtle)] divide-y divide-[var(--rogym-border-subtle)] overflow-hidden bg-white/5">
                  {selectedBookingDetail.combos.map((c, i) => (
                    <div key={i} className="p-2.5 flex items-center justify-between">
                      <span className="text-white font-medium">{c.comboName} (Số lượng: {c.quantity})</span>
                      <span className="font-mono text-amber-400 font-bold">{formatVND(c.price)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Payment Summary */}
            <div className="p-4 rounded-xl bg-black/40 border border-[var(--rogym-border-subtle)] space-y-2">
              {selectedBookingDetail.promotionCode && (
                <div className="flex items-center justify-between text-[var(--rogym-text-secondary)]">
                  <span>Mã khuyến mãi:</span>
                  <Badge tone="accent" size="xs">{selectedBookingDetail.promotionCode}</Badge>
                </div>
              )}
              <div className="flex items-center justify-between text-[var(--rogym-text-secondary)]">
                <span>Phương thức thanh toán:</span>
                <span className="font-mono uppercase text-white font-semibold">{selectedBookingDetail.paymentMethod || 'CASH'}</span>
              </div>
              <div className="flex items-center justify-between text-[var(--rogym-text-secondary)]">
                <span>Trạng thái thanh toán:</span>
                <StatusBadge status={selectedBookingDetail.paymentStatus === 'PAID' ? 'active' : 'banned'} label={selectedBookingDetail.paymentStatus === 'PAID' ? 'Đã thanh toán thành công' : selectedBookingDetail.paymentStatus} />
              </div>
              <div className="border-t border-white/10 pt-2 flex items-center justify-between text-sm">
                <span className="font-bold text-white">Tổng tiền thanh toán:</span>
                <span className="font-display font-bold text-lg text-[var(--rogym-green)]">
                  {formatVND(selectedBookingDetail.totalAmount)}
                </span>
              </div>
            </div>

            <ModalFooter>
              <Button variant="secondary" type="button" onClick={() => setSelectedBookingDetail(null)}>
                Đóng
              </Button>
            </ModalFooter>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default RevenueManagementPage
