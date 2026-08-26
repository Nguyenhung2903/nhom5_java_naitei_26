import { Outlet, Link } from 'react-router-dom'
import { ButtonLink } from '@/components/ui'
import { Clapperboard } from 'lucide-react'

export function LandingLayout() {
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

          {/* Right Action / Auth Buttons */}
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
        </div>
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
                <li><a href="#movies" className="hover:text-[var(--rogym-teal)] transition-colors">Phim đang chiếu</a></li>
                <li><a href="#news" className="hover:text-[var(--rogym-teal)] transition-colors">Tin tức điện ảnh</a></li>
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
