import { useState } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Avatar, Button, Badge } from '@/components/ui'
import {
  Clapperboard,
  Film,
  Newspaper,
  Sparkles,
  User,
  LogOut,
  Shield,
  Menu,
  X,
  ChevronDown,
  TicketIcon,
} from 'lucide-react'

export function UserLayout() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)

  const handleLogout = () => {
    logout()
    setUserDropdownOpen(false)
    navigate('/')
  }

  const navLinks = [
    { label: 'Trang chủ', path: '/', icon: <Film className="w-4 h-4" /> },
    { label: 'Rạp chiếu', path: '/cinemas', icon: <Clapperboard className="w-4 h-4" /> },
    { label: 'Vé của tôi', path: '/my-tickets', icon: <TicketIcon className="w-4 h-4" /> },
    { label: 'Tin tức', path: '/news', icon: <Newspaper className="w-4 h-4" /> },
    { label: 'Khuyến mãi', path: '/promotions', icon: <Sparkles className="w-4 h-4" /> },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-[var(--rogym-bg-base)] text-[var(--rogym-text-primary)] font-body selection:bg-[var(--rogym-teal)] selection:text-black">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 bg-[var(--rogym-bg-base)]/80 backdrop-blur-md border-b border-[var(--rogym-border-subtle)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <span className="p-2 rounded-xl bg-[var(--rogym-green)]/15 border border-[var(--rogym-green)]/30 text-[var(--rogym-green)] group-hover:scale-105 transition-transform">
              <Clapperboard className="w-5 h-5" />
            </span>
            <div className="flex flex-col">
              <span className="font-display font-bold text-lg uppercase tracking-wider text-white group-hover:text-[var(--rogym-green)] transition-colors">
                CinemaNest
              </span>
              <span className="text-[9px] text-[var(--rogym-text-muted)] tracking-widest uppercase font-semibold">
                Movie Booking
              </span>
            </div>
          </Link>

          {/* Desktop Nav Items */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${isActive
                    ? 'text-[var(--rogym-teal)] bg-[var(--rogym-green)]/10 font-semibold'
                    : 'text-[var(--rogym-text-secondary)] hover:text-white hover:bg-white/5'
                    }`}
                >
                  {link.icon}
                  <span>{link.label}</span>
                </Link>
              )
            })}
          </nav>

          {/* Right Action / User Profile */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 p-1.5 pr-3 rounded-full border border-[var(--rogym-border-subtle)] bg-[var(--rogym-bg-surface)] hover:border-[var(--rogym-border-focus)] transition-all cursor-pointer"
                >
                  <Avatar
                    name={user.fullName}
                    src={user.avatar}
                    size="sm"
                    status="online"
                    border
                  />
                  <div className="text-left hidden lg:block">
                    <p className="text-xs font-semibold text-white truncate max-w-[120px]">
                      {user.fullName}
                    </p>
                    <p className="text-[10px] text-[var(--rogym-text-muted)] truncate max-w-[120px]">
                      {user.role}
                    </p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-[var(--rogym-text-muted)]" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setUserDropdownOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 rounded-xl bg-[var(--rogym-bg-surface)] border border-[var(--rogym-border-focus)] shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                      <div className="px-3 py-2 border-b border-[var(--rogym-border-subtle)] mb-1">
                        <p className="text-sm font-semibold text-white">{user.fullName}</p>
                        <p className="text-xs text-[var(--rogym-text-secondary)] truncate">
                          {user.email}
                        </p>
                        {isAdmin && (
                          <Badge tone="accent" size="xs" className="mt-1.5">
                            Quản trị viên (Admin)
                          </Badge>
                        )}
                      </div>

                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-[var(--rogym-teal)] hover:bg-white/5 rounded-lg transition-colors"
                        >
                          <Shield className="w-4 h-4" />
                          <span>Trang Quản trị (Admin)</span>
                        </Link>
                      )}

                      <Link
                        to="/profile"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-xs text-[var(--rogym-text-secondary)] hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                      >
                        <User className="w-4 h-4" />
                        <span>Hồ sơ cá nhân</span>
                      </Link>

                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 rounded-lg transition-colors mt-1 cursor-pointer text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Đăng xuất</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button variant="secondary" size="sm">
                    Đăng nhập
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm" leftIcon={<Sparkles className="w-3.5 h-3.5" />}>
                    Đăng ký
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-[var(--rogym-text-secondary)] hover:text-white hover:bg-white/5"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Nav */}
        {mobileMenuOpen && (
          <div className="md:hidden px-4 pt-2 pb-4 space-y-2 border-t border-[var(--rogym-border-subtle)] bg-[var(--rogym-bg-base)]">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[var(--rogym-text-secondary)] hover:text-white hover:bg-white/5"
              >
                {link.icon}
                <span>{link.label}</span>
              </Link>
            ))}

            <div className="pt-3 border-t border-[var(--rogym-border-subtle)]">
              {isAuthenticated && user ? (
                <div className="space-y-2">
                  <div className="px-3 py-1">
                    <p className="text-sm font-semibold text-white">{user.fullName}</p>
                    <p className="text-xs text-[var(--rogym-text-muted)]">{user.email}</p>
                  </div>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-[var(--rogym-teal)] hover:bg-white/5 rounded-lg"
                    >
                      <Shield className="w-4 h-4" />
                      <span>Trang Quản trị (Admin)</span>
                    </Link>
                  )}
                  <Link
                    to="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-xs text-[var(--rogym-text-secondary)] hover:text-white hover:bg-white/5 rounded-lg"
                  >
                    <User className="w-4 h-4" />
                    <span>Hồ sơ cá nhân</span>
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 rounded-lg text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Đăng xuất</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="secondary" size="sm" fullWidth>
                      Đăng nhập
                    </Button>
                  </Link>
                  <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="primary" size="sm" fullWidth>
                      Đăng ký
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Outlet Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--rogym-border-subtle)] bg-[var(--rogym-bg-surface)] py-10 px-4 sm:px-6 lg:px-8 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-[var(--rogym-text-muted)]">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-lg bg-[var(--rogym-green)]/10 text-[var(--rogym-green)]">
              <Clapperboard className="w-5 h-5" />
            </span>
            <div>
              <p className="font-bold text-white font-display uppercase tracking-wider">CinemaNest</p>
              <p className="text-xs">Hệ thống Đặt vé xem phim Trực tuyến</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-6 text-xs">
            <Link to="/" className="hover:text-white transition-colors">Trang chủ</Link>
            <Link to="/#movies" className="hover:text-white transition-colors">Phim đang chiếu</Link>
            <Link to="/news" className="hover:text-white transition-colors">Tin tức</Link>
            <Link to="/promotions" className="hover:text-white transition-colors">Khuyến mãi</Link>
            <Link to="/#terms" className="hover:text-white transition-colors">Điều khoản sử dụng</Link>
            <Link to="/#privacy" className="hover:text-white transition-colors">Chính sách bảo mật</Link>
          </div>

          <p className="text-xs">
            © 2026 Nhóm 5 - Sun* Java NAITEI 26. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}

export default UserLayout
