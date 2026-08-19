import { Outlet, Link } from 'react-router-dom'
import { Clapperboard, Film, Sparkles } from 'lucide-react'

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-[var(--rogym-bg-base)] text-[var(--rogym-text-primary)] font-body flex flex-col justify-between relative overflow-hidden selection:bg-[var(--rogym-teal)] selection:text-black">
      {/* Background Decorative Neon Glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-[var(--rogym-green)]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[var(--rogym-teal)]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <header className="relative z-10 p-6 md:px-12 flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center gap-2.5 group transition-transform duration-200 hover:scale-105"
        >
          <span className="p-2 rounded-xl bg-[var(--rogym-green)]/20 border border-[var(--rogym-green)]/40 text-[var(--rogym-green)] shadow-lg shadow-[var(--rogym-green)]/20">
            <Clapperboard className="w-6 h-6" />
          </span>
          <div className="flex flex-col">
            <span className="font-display font-bold text-xl uppercase tracking-wider text-white group-hover:text-[var(--rogym-green)] transition-colors">
              CinemaNest
            </span>
            <span className="text-[10px] text-[var(--rogym-text-muted)] tracking-widest uppercase font-semibold">
              Movie Booking Hub
            </span>
          </div>
        </Link>

        <Link
          to="/"
          className="text-xs font-semibold text-[var(--rogym-text-secondary)] hover:text-white transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--rogym-border-subtle)] bg-[var(--rogym-bg-surface)]/50 backdrop-blur"
        >
          <Film className="w-3.5 h-3.5 text-[var(--rogym-teal)]" />
          <span>Về trang chủ</span>
        </Link>
      </header>

      {/* Main Form Area */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-6 text-center text-xs text-[var(--rogym-text-muted)] border-t border-[var(--rogym-border-subtle)]/50">
        <div className="flex items-center justify-center gap-2">
          <span>Hệ thống Đặt vé xem phim Nhóm 5</span>
          <span>•</span>
          <span className="flex items-center gap-1 text-[var(--rogym-teal)] font-medium">
            <Sparkles className="w-3 h-3" /> Sun* Java NAITEI 26
          </span>
        </div>
      </footer>
    </div>
  )
}

export default AuthLayout
