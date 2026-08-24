import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Badge,
  Button,
  StatusBadge,
} from '@/components/ui'
import { Film, Ticket, Sparkles, Star, Clock, Shield } from 'lucide-react'

export function HomePage() {
  const { user, isAuthenticated, isAdmin } = useAuth()
  const navigate = useNavigate()

  const featuredMovies = [
    {
      id: 1,
      title: 'Avengers: Secret Wars',
      tagline: 'Trận chiến định đoạt toàn bộ đa vũ trụ Marvel',
      genre: 'Hành Động, Viễn Tưởng',
      duration: '165 phút',
      rating: '9.5',
      badge: 'Bom Tấn',
      status: 'Đang chiếu',
    },
    {
      id: 2,
      title: 'Dune: Part Three',
      tagline: 'Hành trình trỗi dậy của vị hoàng đế sa mạc Arrakis',
      genre: 'Phiêu Lưu, Viễn Tưởng',
      duration: '155 phút',
      rating: '9.2',
      badge: 'Hot',
      status: 'Đang chiếu',
    },
    {
      id: 3,
      title: 'Thám Tử Lừng Danh Conan',
      tagline: 'Vụ án bí ẩn tại lâu đài sương mù Tokyo',
      genre: 'Hoạt Hình, Trinh Thám',
      duration: '110 phút',
      rating: '8.9',
      badge: 'Sắp chiếu',
      status: 'Sắp chiếu',
    },
  ]

  return (
    <div className="space-y-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Welcome Banner */}
      <section className="relative overflow-hidden rounded-3xl border border-[var(--rogym-border-focus)] bg-gradient-to-r from-[var(--rogym-bg-surface)] via-black to-[var(--rogym-bg-surface)] p-8 md:p-12 shadow-2xl">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-[var(--rogym-green)]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--rogym-green)]/10 border border-[var(--rogym-green)]/30 text-[var(--rogym-teal)] text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Hệ thống Đặt vé Rạp chiếu phim Hiện đại</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black font-display tracking-tight text-white uppercase leading-tight">
            Trải Nghiệm Điện Ảnh <span className="text-[var(--rogym-green)]">Đỉnh Cao</span>
          </h1>

          <p className="text-sm sm:text-base text-[var(--rogym-text-secondary)] leading-relaxed">
            Đặt vé trực tuyến nhanh chóng, chọn chỗ ngồi đẹp nhất, ưu đãi thành viên và tận hưởng các siêu phẩm bom tấn toàn cầu.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-3">
                <span className="text-xs text-[var(--rogym-text-secondary)]">
                  Xin chào, <strong className="text-white">{user.fullName}</strong>!
                </span>
                {isAdmin && (
                  <Link to="/admin">
                    <Button variant="primary" size="sm" leftIcon={<Shield className="w-4 h-4" />}>
                      Vào trang Quản trị (Admin)
                    </Button>
                  </Link>
                )}
                <Link to="/profile">
                  <Button variant="secondary" size="sm">
                    Xem hồ sơ
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/register">
                  <Button variant="primary" size="lg" leftIcon={<Ticket className="w-4 h-4" />}>
                    Đăng ký thành viên ngay
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="secondary" size="lg">
                    Đăng nhập
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Featured Movies Showcase */}
      <section id="movies" className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold font-display text-white uppercase tracking-wide flex items-center gap-2">
              <Film className="w-5 h-5 text-[var(--rogym-green)]" />
              <span>Phim Nổi Bật Đang Chiếu</span>
            </h2>
            <p className="text-xs text-[var(--rogym-text-muted)]">
              Danh sách các tác phẩm điện ảnh ăn khách nhất tuần
            </p>
          </div>
          <StatusBadge status="active" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredMovies.map((movie) => (
            <Card
              key={movie.id}
              variant="elevated"
              className="flex flex-col justify-between overflow-hidden border-[var(--rogym-border-subtle)] hover:border-[var(--rogym-border-focus)] transition-all duration-300 group"
            >
              <CardHeader className="space-y-2">
                <div className="flex items-center justify-between">
                  <Badge tone={movie.badge === 'Bom Tấn' ? 'accent' : 'primary'} size="sm">
                    {movie.badge}
                  </Badge>
                  <div className="flex items-center gap-1 text-xs font-bold text-amber-400">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>{movie.rating}</span>
                  </div>
                </div>
                <CardTitle className="text-lg font-bold text-white group-hover:text-[var(--rogym-green)] transition-colors">
                  {movie.title}
                </CardTitle>
                <CardDescription className="text-xs text-[var(--rogym-text-secondary)] line-clamp-2">
                  {movie.tagline}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4 pt-2">
                <div className="flex items-center justify-between text-xs text-[var(--rogym-text-muted)] border-t border-[var(--rogym-border-subtle)] pt-3">
                  <span>{movie.genre}</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[var(--rogym-teal)]" />
                    {movie.duration}
                  </span>
                </div>

                <Button
                  variant="primary"
                  size="md"
                  fullWidth
                  leftIcon={<Ticket className="w-4 h-4" />}
                  className="cursor-pointer"
                  onClick={() => navigate(`/booking/${movie.id}/showtimes`)}
                >
                  Đặt vé ngay
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}

export default HomePage
