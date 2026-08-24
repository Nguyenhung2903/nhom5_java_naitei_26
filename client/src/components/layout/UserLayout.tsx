import { useState } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Avatar, Badge, ButtonLink } from '@/components/ui'
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
  LayoutDashboard,
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
    setMobileMenuOpen(false)
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
          <nav className="hidden md:flex items-center gap-1.5">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-[var(--rogym-green)]/10 text-[var(--rogym-teal)] border border-[var(--rogym-green)]/20 shadow-sm'
                      : 'text-[var(--rogym-text-secondary)] hover:text-white hover:bg-white/5 border border-transparent'
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
                  aria-expanded={userDropdownOpen}
                  aria-haspopup="true"
                  className="flex items-center gap-2.5 p-1.5 pr-3 rounded-full border border-[var(--rogym-border-subtle)] bg-[var(--rogym-bg-card)] hover:border-[var(--rogym-border-teal-hover)] transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--rogym-teal)]/30"
                >
                  <Avatar
                    name={user.fullName}
                    src={user.avatar}
                    size="sm"
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
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-[var(--rogym-text-muted)] transition-transform duration-200 ${
                      userDropdownOpen ? 'rotate-180 text-white' : ''
                    }`}
                  />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setUserDropdownOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-60 rounded-2xl bg-[var(--rogym-bg-card)] border border-[var(--rogym-border-teal-dim)] shadow-[0_16px_48px_rgba(0,0,0,0.85)] p-2.5 z-50 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-xl">
                      <div className="px-3 py-2.5 border-b border-[var(--rogym-border-subtle)] mb-1">
                        <div className="flex items-center gap-2.5 mb-1">
                          <Avatar
                            name={user.fullName}
                            src={user.avatar}
                            size="xs"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-white truncate">
                              {user.fullName}
                            </p>
                            <p className="text-[11px] text-[var(--rogym-text-secondary)] truncate">
                              {user.email}
                            </p>
                          </div>
                        </div>
                        {isAdmin && (
                          <Badge tone="accent" size="xs" className="mt-1">
                            Quản trị viên (Admin)
                          </Badge>
                        )}
                      </div>

                      <div className="space-y-0.5">
                        <Link
                          to="/user"
                          onClick={() => setUserDropdownOpen(false)}
                          className="rogym-dropdown-item rounded-lg !text-xs !py-2"
                        >
                          <LayoutDashboard className="w-4 h-4 text-[var(--rogym-green)] shrink-0" />
                          <span className="font-semibold text-white">
                            Bảng điều khiển cá nhân
                          </span>
                        </Link>

                        {isAdmin && (
                          <Link
                            to="/admin"
                            onClick={() => setUserDropdownOpen(false)}
                            className="rogym-dropdown-item rounded-lg !text-xs !py-2"
                          >
                            <Shield className="w-4 h-4 text-[var(--rogym-teal)] shrink-0" />
                            <span className="font-semibold text-[var(--rogym-teal)]">
                              Trang Quản trị (Admin)
                            </span>
                          </Link>
                        )}

                        <Link
                          to="/user/profile"
                          onClick={() => setUserDropdownOpen(false)}
                          className="rogym-dropdown-item rounded-lg !text-xs !py-2"
                        >
                          <User className="w-4 h-4 text-[var(--rogym-text-muted)] shrink-0" />
                          <span>Hồ sơ cá nhân</span>
                        </Link>

                        <button
                          type="button"
                          onClick={handleLogout}
                          className="rogym-dropdown-item is-danger rounded-lg !text-xs !py-2 mt-1"
                        >
                          <LogOut className="w-4 h-4 shrink-0" />
                          <span>Đăng xuất</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <ButtonLink to="/login" variant="secondary" size="sm">
                  Đăng nhập
                </ButtonLink>
                <ButtonLink
                  to="/register"
                  variant="primary"
                  size="sm"
                  leftIcon={<Sparkles className="w-3.5 h-3.5" />}
                >
                  Đăng ký
                </ButtonLink>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? 'Đóng menu điều hướng' : 'Mở menu điều hướng'}
              className="p-2 rounded-lg text-[var(--rogym-text-secondary)] hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Backdrop & Dropdown Nav */}
        {mobileMenuOpen && (
          <>
            <div
              className="fixed inset-0 top-16 bg-black/70 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-200"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="relative z-50 md:hidden px-4 pt-3 pb-6 space-y-3 border-t border-[var(--rogym-border-subtle)] bg-[var(--rogym-bg-base)] shadow-2xl animate-in slide-in-from-top-2 duration-200">
              <nav className="space-y-1">
                {navLinks.map((link) => {
                  const isActive = location.pathname === link.path
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-[var(--rogym-green)]/10 text-[var(--rogym-teal)] border border-[var(--rogym-green)]/20'
                          : 'text-[var(--rogym-text-secondary)] hover:text-white hover:bg-white/5 border border-transparent'
                      }`}
                    >
                      {link.icon}
                      <span>{link.label}</span>
                    </Link>
                  )
                })}
              </nav>

              <div className="pt-3 border-t border-[var(--rogym-border-subtle)]">
                {isAuthenticated && user ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-[var(--rogym-bg-surface)] border border-[var(--rogym-border-subtle)]">
                      <Avatar
                        name={user.fullName}
                        src={user.avatar}
                        size="sm"
                        border
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-white truncate">{user.fullName}</p>
                        <p className="text-[11px] text-[var(--rogym-text-muted)] truncate">
                          {user.email}
                        </p>
                      </div>
                      {isAdmin && (
                        <Badge tone="accent" size="xs">
                          Admin
                        </Badge>
                      )}
                    </div>

                    <div className="space-y-1 pt-1">
                      <Link
                        to="/user"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-white hover:bg-white/5 transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4 text-[var(--rogym-green)]" />
                        <span>Bảng điều khiển cá nhân</span>
                      </Link>
                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-[var(--rogym-teal)] hover:bg-white/5 transition-colors"
                        >
                          <Shield className="w-4 h-4" />
                          <span>Trang Quản trị (Admin)</span>
                        </Link>
                      )}
                      <Link
                        to="/user/profile"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-medium text-[var(--rogym-text-secondary)] hover:text-white hover:bg-white/5 transition-colors"
                      >
                        <User className="w-4 h-4" />
                        <span>Hồ sơ cá nhân</span>
                      </Link>
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-medium text-red-400 hover:bg-red-500/10 transition-colors text-left cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Đăng xuất</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <ButtonLink
                      to="/login"
                      variant="secondary"
                      size="sm"
                      fullWidth
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Đăng nhập
                    </ButtonLink>
                    <ButtonLink
                      to="/register"
                      variant="primary"
                      size="sm"
                      fullWidth
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Đăng ký
                    </ButtonLink>
                  </div>
                )}
              </div>
            </div>
          </>
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
            <span className="p-2 rounded-xl bg-[var(--rogym-green)]/15 border border-[var(--rogym-green)]/30 text-[var(--rogym-green)]">
              <Clapperboard className="w-5 h-5" />
            </span>
            <div>
              <p className="font-bold text-white font-display uppercase tracking-wider">CinemaNest</p>
              <p className="text-xs text-[var(--rogym-text-muted)]">
                Hệ thống Đặt vé xem phim Trực tuyến
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-6 text-xs text-[var(--rogym-text-secondary)]">
            <Link to="/" className="hover:text-[var(--rogym-teal)] transition-colors">
              Trang chủ
            </Link>
            <Link to="/#movies" className="hover:text-[var(--rogym-teal)] transition-colors">
              Phim đang chiếu
            </Link>
            <Link to="/#terms" className="hover:text-[var(--rogym-teal)] transition-colors">
              Điều khoản sử dụng
            </Link>
            <Link to="/#privacy" className="hover:text-[var(--rogym-teal)] transition-colors">
              Chính sách bảo mật
            </Link>
          </div>

          <p className="text-xs text-[var(--rogym-text-muted)]">
            © 2026 Nhóm 5 - Sun* Java NAITEI 26. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}

export default UserLayout

