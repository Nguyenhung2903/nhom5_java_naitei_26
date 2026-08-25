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
} from 'lucide-react'

export function DashboardPage() {
  const stats = [
    {
      label: 'Tổng doanh thu tháng',
      value: '245.800.000 đ',
      icon: <DollarSign className="w-5 h-5" />,
      trend: { value: '18.4%', isPositive: true },
      hint: 'Tăng so với tháng trước',
    },
    {
      label: 'Vé đã bán hôm nay',
      value: '1.240 vé',
      icon: <Ticket className="w-5 h-5" />,
      trend: { value: '12%', isPositive: true },
      hint: 'Chiếm 82% công suất ghế',
    },
    {
      label: 'Phim đang công chiếu',
      value: '14 phim',
      icon: <Film className="w-5 h-5" />,
      hint: '2 phim bom tấn mới',
    },
    {
      label: 'Thành viên mới',
      value: '382 người',
      icon: <Users className="w-5 h-5" />,
      trend: { value: '5.6%', isPositive: true },
      hint: 'Tài khoản khách hàng',
    },
  ]

  const recentActivities = [
    { id: 1, action: 'Suất chiếu mới', target: 'Avengers: Secret Wars - Phòng VIP 01 (20:30)', time: '5 phút trước' },
    { id: 2, action: 'Đơn đặt vé thành công', target: 'Mã vé #TK-9824 - Khách hàng: Nguyễn Văn A', time: '12 phút trước' },
    { id: 3, action: 'Thêm phim mới', target: 'Dune: Part Three (Khởi chiếu 25/12)', time: '1 giờ trước' },
    { id: 4, action: 'Cập nhật giá vé', target: 'Khung giờ Vàng cuối tuần (Standard/VIP)', time: '3 giờ trước' },
  ]

  return (
    <div className="space-y-8">
      {/* Top Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-white uppercase tracking-wide flex items-center gap-2.5">
            <Shield className="w-7 h-7 text-[var(--rogym-green)]" />
            <span>Bảng Điều Khiển Quản Trị</span>
          </h1>
          <p className="text-xs text-[var(--rogym-text-secondary)] mt-1">
            Tổng quan tình hình kinh doanh, suất chiếu và hoạt động hệ thống
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/admin/movies">
            <Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
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

      {/* Recent Activity & System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activities */}
        <Card variant="elevated" className="lg:col-span-2 p-6">
          <CardHeader className="p-0 pb-4 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[var(--rogym-teal)]" />
                <span>Nhật ký hoạt động gần đây</span>
              </CardTitle>
              <CardDescription className="text-xs text-[var(--rogym-text-muted)]">
                Các sự kiện quản lý và giao dịch vé thời gian thực
              </CardDescription>
            </div>
            <Badge tone="primary" size="xs">Live Feed</Badge>
          </CardHeader>

          <CardContent className="p-0 divide-y divide-[var(--rogym-border-subtle)]">
            {recentActivities.map((act) => (
              <div key={act.id} className="py-3 flex items-center justify-between text-xs">
                <div className="space-y-0.5">
                  <p className="font-semibold text-white">{act.target}</p>
                  <span className="text-[var(--rogym-text-secondary)]">{act.action}</span>
                </div>
                <span className="text-[var(--rogym-text-muted)] whitespace-nowrap">{act.time}</span>
              </div>
            ))}
          </CardContent>
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
    </div>
  )
}

export default DashboardPage
