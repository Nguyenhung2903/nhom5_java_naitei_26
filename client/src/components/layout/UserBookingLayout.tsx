import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Avatar, Badge } from '@/components/ui'
import { Clapperboard, ArrowLeft } from 'lucide-react'

export function UserBookingLayout() {
  const { user } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col bg-[var(--rogym-bg-base)] text-[var(--rogym-text-primary)] font-body selection:bg-[var(--rogym-teal)] selection:text-black">
      {/* Focused Booking Header */}
      <header className="sticky top-0 z-50 bg-[var(--rogym-bg-base)]/90 backdrop-blur-md border-b border-[var(--rogym-border-subtle)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Logo */}
            <Link to="/user" className="flex items-center gap-2.5 group">
              <span className="p-2 rounded-xl bg-[var(--rogym-green)]/15 border border-[var(--rogym-green)]/30 text-[var(--rogym-green)] group-hover:scale-105 transition-transform">
                <Clapperboard className="w-5 h-5" />
              </span>
              <div className="flex flex-col">
                <span className="font-display font-bold text-base uppercase tracking-wider text-white group-hover:text-[var(--rogym-green)] transition-colors">
                  CinemaNest
                </span>
                <span className="text-[9px] text-[var(--rogym-text-muted)] tracking-widest uppercase font-semibold">
                  Cổng Đặt Vé
                </span>
              </div>
            </Link>

            <div className="hidden sm:block h-5 w-[1px] bg-white/10" />

            <button
              type="button"
              onClick={() => navigate(-1)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--rogym-text-secondary)] hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Quay lại</span>
            </button>
          </div>

          {/* User Status */}
          <div className="flex items-center gap-3">
            <Link
              to="/user"
              className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--rogym-border-subtle)] bg-[var(--rogym-bg-card)] hover:border-[var(--rogym-border-teal-hover)] transition-all"
            >
              <Avatar
                name={user?.fullName || 'User'}
                src={user?.avatar}
                size="xs"
              />
              <div className="text-left hidden md:block">
                <p className="text-xs font-bold text-white max-w-[120px] truncate">
                  {user?.fullName || 'Thành viên'}
                </p>
              </div>
              <Badge tone="accent" size="xs">
                Member
              </Badge>
            </Link>
          </div>
        </div>
      </header>

      {/* Booking Content Outlet */}
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}

export default UserBookingLayout
