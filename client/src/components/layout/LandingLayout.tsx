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
  LayoutDashboard,
} from 'lucide-react'

export function LandingLayout() {
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
                    status="online"
                    border
                  />
                  <div className="text-left hidden lg:block">
                    <p className="text-xs font-bold text-white line-clamp-1 max-w-[120px]">
                      {user.fullName}
                    </p>
                    <p className="text-[10px] text-[var(--rogym-teal)] uppercase tracking-wider font-semibold">
                      {user.role}
                    </p>
                  </div>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-[var(--rogym-text-muted)] transition-transform duration-200 ${
                      userDropdownOpen ? 'rotate-180 text-[var(--rogym-teal)]' : ''
                    }`}
                  />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-[var(--rogym-bg-card)] border border-[var(--rogym-border-teal-dim)] shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 py-2 border-b border-[var(--rogym-border-subtle)] mb-1">
                      <p className="text-xs font-bold text-white truncate">{user.fullName}</p>
                      <p className="text-[11px] text-[var(--rogym-text-muted)] truncate">{user.email}</p>
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
                  className="shadow-lg shadow-[var(--rogym-green)]/20"
                >
                  Đăng ký
                </ButtonLink>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex md:hidden items-center gap-2">
            {isAuthenticated && user && (
              <Link to="/user">
                <Avatar name={user.fullName} src={user.avatar} size="xs" />
              </Link>
            )}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-[var(--rogym-text-secondary)] hover:text-white hover:bg-white/5 transition-colors focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-[var(--rogym-border-subtle)] bg-[var(--rogym-bg-base)]/95 backdrop-blur-xl px-4 pt-2 pb-6 space-y-3">
            <nav className="space-y-1">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                      isActive
                        ? 'bg-[var(--rogym-green)]/10 text-[var(--rogym-teal)] border border-[var(--rogym-green)]/20'
                        : 'text-[var(--rogym-text-secondary)] hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {link.icon}
                    <span>{link.label}</span>
                  </Link>
                )
              })}
            </nav>

            {/* Mobile Auth Actions */}
            <div className="pt-3 border-t border-[var(--rogym-border-subtle)]">
              {isAuthenticated && user ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-3 px-3 py-2 bg-white/5 rounded-xl">
                    <Avatar name={user.fullName} src={user.avatar} size="sm" border />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-white truncate">{user.fullName}</p>
                      <p className="text-[10px] text-[var(--rogym-text-muted)] truncate">{user.email}</p>
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
                    className="w-full justify-center"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Đăng nhập
                  </ButtonLink>
                  <ButtonLink
                    to="/register"
                    variant="primary"
                    size="sm"
                    className="w-full justify-center shadow-lg shadow-[var(--rogym-green)]/20"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Đăng ký
                  </ButtonLink>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Page Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Global Footer */}
      <footer className="border-t border-[var(--rogym-border-subtle)] bg-[var(--rogym-bg-surface)] py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <span className="p-1.5 rounded-lg bg-[var(--rogym-green)]/20 text-[var(--rogym-green)]">
                  <Clapperboard className="w-4 h-4" />
                </span>
                <span className="font-display font-bold text-base text-white tracking-wider">
                  CinemaNest
                </span>
              </div>
              <p className="text-xs text-[var(--rogym-text-secondary)] leading-relaxed">
                Nền tảng đặt vé xem phim trực tuyến hiện đại hàng đầu. Đem cả thế giới điện ảnh đến trong tầm tay bạn.
              </p>
            </div>

            <div className="space-y-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">Khám phá</h3>
              <ul className="space-y-1.5 text-xs text-[var(--rogym-text-secondary)]">
                <li><Link to="/" className="hover:text-[var(--rogym-teal)] transition-colors">Trang chủ</Link></li>
                <li><Link to="/#movies" className="hover:text-[var(--rogym-teal)] transition-colors">Phim đang chiếu</Link></li>
                <li><Link to="/cinemas" className="hover:text-[var(--rogym-teal)] transition-colors">Cụm rạp</Link></li>
                <li><Link to="/promotions" className="hover:text-[var(--rogym-teal)] transition-colors">Khuyến mãi</Link></li>
              </ul>
            </div>

            <div className="space-y-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">Chính sách & Hỗ trợ</h3>
              <ul className="space-y-1.5 text-xs text-[var(--rogym-text-secondary)]">
                <li><Link to="/#terms" className="hover:text-[var(--rogym-teal)] transition-colors">Điều khoản dịch vụ</Link></li>
                <li><Link to="/#privacy" className="hover:text-[var(--rogym-teal)] transition-colors">Chính sách bảo mật</Link></li>
                <li><Link to="/#faq" className="hover:text-[var(--rogym-teal)] transition-colors">Câu hỏi thường gặp</Link></li>
              </ul>
            </div>

            <div className="space-y-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">Liên hệ</h3>
              <p className="text-xs text-[var(--rogym-text-secondary)]">Hotline: 1900 6868 (8:00 - 22:00)</p>
              <p className="text-xs text-[var(--rogym-text-secondary)]">Email: support@cinemanest.vn</p>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-[var(--rogym-border-subtle)] text-center text-xs text-[var(--rogym-text-muted)]">
            <p>&copy; {new Date().getFullYear()} CinemaNest Inc. Bản quyền thuộc về Nhóm 5 Java Naitei 26.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingLayout
