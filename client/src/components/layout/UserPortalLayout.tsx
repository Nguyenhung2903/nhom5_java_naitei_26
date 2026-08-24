import { useState } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Avatar, Badge } from '@/components/ui'
import {
  LayoutDashboard,
  Film,
  Ticket,
  User,
  LogOut,
  UserCheck,
  Menu,
  X,
} from 'lucide-react'

export function UserPortalLayout() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const userNavItems = [
    { label: 'Tổng quan (Dashboard)', path: '/user', icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: 'Phim & Đặt vé', path: '/user/movies', icon: <Film className="w-4 h-4" /> },
    { label: 'Vé của tôi', path: '/user/tickets', icon: <Ticket className="w-4 h-4" /> },
    { label: 'Hồ sơ cá nhân', path: '/user/profile', icon: <User className="w-4 h-4" /> },
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

      {/* User Portal Sidebar */}
      <aside
        className={`fixed md:sticky top-0 h-screen w-64 bg-[var(--rogym-bg-surface)] border-r border-[var(--rogym-border-subtle)] flex flex-col justify-between z-50 transition-transform duration-200 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div>
          {/* Brand Header */}
          <div className="p-5 border-b border-[var(--rogym-border-subtle)] flex items-center justify-between">
            <Link to="/user" className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-[var(--rogym-green)]/15 border border-[var(--rogym-green)]/30 text-[var(--rogym-green)]">
                <UserCheck className="w-5 h-5" />
              </span>
              <div>
                <span className="font-display font-bold text-base uppercase tracking-wider text-white">
                  Member Hub
                </span>
                <p className="text-[10px] text-[var(--rogym-teal)] font-semibold uppercase tracking-widest">
                  CinemaNest Club
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
              Khu vực Thành viên
            </p>
            {userNavItems.map((item) => {
              const isActive =
                item.path === '/user'
                  ? location.pathname === '/user'
                  : item.path === '/user/movies'
                  ? location.pathname.startsWith('/user/movies') ||
                    location.pathname.startsWith('/user/booking') ||
                    location.pathname.startsWith('/user/payment')
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
                Member Portal
              </Badge>
              <span className="text-xs text-[var(--rogym-text-muted)] hidden sm:inline">
                Cổng thông tin & Bảng điều khiển cá nhân
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-white">{user?.fullName || 'Thành viên'}</p>
              <p className="text-[10px] text-[var(--rogym-teal)] uppercase tracking-wider font-semibold">
                {user?.role === 'ADMIN' ? 'Administrator' : 'CinemaNest Member'}
              </p>
            </div>
            <Avatar
              name={user?.fullName || 'User'}
              src={user?.avatar}
              size="sm"
              border
            />
          </div>
        </header>

        {/* Content Outlet */}
        <main className="flex-1 p-4 sm:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default UserPortalLayout
