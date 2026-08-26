import { useState } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Avatar, Badge } from '@/components/ui'
import {
  LayoutDashboard,
  Film,
  CalendarDays,
  MapPin,
  Users,
  LogOut,
  Shield,
  Menu,
  Newspaper,
  BadgePercent,
  Utensils,
  X,
  User,
  TrendingUp,
} from 'lucide-react'

export function AdminLayout() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const adminNavItems = [
    { label: 'Tổng quan (Dashboard)', path: '/admin', icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: 'Báo cáo Doanh thu', path: '/admin/revenue', icon: <TrendingUp className="w-4 h-4" /> },
    { label: 'Quản lý Phim', path: '/admin/movies', icon: <Film className="w-4 h-4" /> },
    { label: 'Quản lý Tin tức', path: '/admin/news', icon: <Newspaper className="w-4 h-4" /> },
    { label: 'Quản lý Khuyến mãi', path: '/admin/promotions', icon: <BadgePercent className="w-4 h-4" /> },
    { label: 'Quản lý Combo', path: '/admin/combos', icon: <Utensils className="w-4 h-4" /> },
    { label: 'Quản lý Suất chiếu', path: '/admin/showtimes', icon: <CalendarDays className="w-4 h-4" /> },
    { label: 'Quản lý Cụm Rạp & Phòng Chiếu', path: '/admin/theaters', icon: <MapPin className="w-4 h-4" /> },
    { label: 'Quản lý Người dùng', path: '/admin/users', icon: <Users className="w-4 h-4" /> },
    { label: 'Hồ sơ cá nhân', path: '/admin/profile', icon: <User className="w-4 h-4" /> },
  ]

  return (
    <div className="min-h-screen bg-[var(--rogym-bg-base)] text-[var(--rogym-text-primary)] font-body flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/70 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Admin Sidebar */}
      <aside
        className={`fixed md:sticky top-0 h-screen w-64 bg-[var(--rogym-bg-surface)] border-r border-[var(--rogym-border-subtle)] flex flex-col justify-between z-50 transition-transform duration-200 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div>
          {/* Brand Header */}
          <div className="p-5 border-b border-[var(--rogym-border-subtle)] flex items-center justify-between">
            <Link to="/admin" className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-[var(--rogym-green)]/15 border border-[var(--rogym-green)]/30 text-[var(--rogym-green)]">
                <Shield className="w-5 h-5" />
              </span>
              <div>
                <span className="font-display font-bold text-base uppercase tracking-wider text-white">
                  Admin Hub
                </span>
                <p className="text-[10px] text-[var(--rogym-teal)] font-semibold uppercase tracking-widest">
                  CinemaNest Manager
                </p>
              </div>
            </Link>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="md:hidden text-[var(--rogym-text-muted)] hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="p-3 space-y-1">
            <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-[var(--rogym-text-muted)]">
              Quản trị hệ thống
            </p>
            {adminNavItems.map((item) => {
              const isActive =
                item.path === '/admin'
                  ? location.pathname === '/admin'
                  : location.pathname.startsWith(item.path)
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-[var(--rogym-green)] text-black shadow-lg shadow-[var(--rogym-green)]/20'
                      : 'text-[var(--rogym-text-secondary)] hover:text-white hover:bg-white/5'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="p-3 border-t border-[var(--rogym-border-subtle)] space-y-1">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-red-400 hover:bg-red-500/10 transition-colors text-left cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="sticky top-0 z-30 h-16 bg-[var(--rogym-bg-base)]/80 backdrop-blur-md border-b border-[var(--rogym-border-subtle)] px-4 sm:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 rounded-lg text-[var(--rogym-text-secondary)] hover:text-white hover:bg-white/5"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <Badge tone="accent" size="sm">
                Admin Panel
              </Badge>
              <span className="text-xs text-[var(--rogym-text-muted)] hidden sm:inline">
                Hệ thống Quản lý Rạp chiếu phim
              </span>
            </div>
          </div>

          <Link
            to="/admin/profile"
            title="Xem hồ sơ cá nhân"
            className="flex items-center gap-3 p-1.5 -mr-1.5 rounded-xl hover:bg-white/5 transition-colors group cursor-pointer"
          >
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-white group-hover:text-[var(--rogym-green)] transition-colors">
                {user?.fullName || 'Administrator'}
              </p>
              <p className="text-[10px] text-[var(--rogym-teal)] uppercase tracking-wider font-semibold">
                {user?.role || 'ADMIN'}
              </p>
            </div>
            <Avatar
              name={user?.fullName || 'Admin'}
              src={user?.avatar}
              size="sm"
              border
            />
          </Link>
        </header>

        {/* Content Outlet */}
        <main className="flex-1 p-4 sm:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
