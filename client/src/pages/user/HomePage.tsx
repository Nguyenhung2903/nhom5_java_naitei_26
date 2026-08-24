import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { movieService } from '@/services/movieService'
import type { Movie, MovieStatus } from '@/types/movie'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardMedia,
  Badge,
  ButtonLink,
  Skeleton,
  PageEmptyState,
  Alert,
  AlertDescription,
  Tabs,
  TabsList,
  TabsTrigger,
} from '@/components/ui'
import { Film, Ticket, Sparkles, Clock, Shield, Calendar, AlertCircle } from 'lucide-react'

export function HomePage() {
  const { user, isAuthenticated, isAdmin } = useAuth()
  const [movies, setMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeStatusTab, setActiveStatusTab] = useState<MovieStatus>('NOW_SHOWING')

  useEffect(() => {
    let isMounted = true
    setLoading(true)
    setError(null)

    movieService
      .getMovies()
      .then((data) => {
        if (isMounted) {
          setMovies(data)
        }
      })
      .catch((err: unknown) => {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Không thể tải danh sách phim từ hệ thống')
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [])

  const filteredMovies = movies.filter((m) => m.status === activeStatusTab)

  return (
    <div className="space-y-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Welcome Banner */}
      <section className="relative overflow-hidden rounded-3xl border border-[var(--rogym-border-teal-dim)] bg-gradient-to-r from-[var(--rogym-bg-card)] via-black to-[var(--rogym-bg-card)] p-8 md:p-12 shadow-2xl">
        {/* Background Image & Overlay */}
        <img
          src="/cover.jpg"
          alt="Hero Background"
          className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none z-0 opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/80 to-black/40 z-0 pointer-events-none" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-[var(--rogym-green)]/15 rounded-full blur-3xl pointer-events-none z-0" />

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
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs text-[var(--rogym-text-secondary)]">
                  Xin chào, <strong className="text-white">{user.fullName}</strong>!
                </span>
                {isAdmin && (
                  <ButtonLink to="/admin" variant="primary" size="sm" leftIcon={<Shield className="w-4 h-4" />}>
                    Vào trang Quản trị (Admin)
                  </ButtonLink>
                )}
                <ButtonLink to="/profile" variant="secondary" size="sm">
                  Xem hồ sơ
                </ButtonLink>
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-3">
                <ButtonLink to="/register" variant="primary" size="lg" leftIcon={<Ticket className="w-4 h-4" />}>
                  Đăng ký thành viên ngay
                </ButtonLink>
                <ButtonLink to="/login" variant="secondary" size="lg">
                  Đăng nhập
                </ButtonLink>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Featured Movies Showcase */}
      <section id="movies" className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--rogym-border-subtle)] pb-4">
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold font-display text-white uppercase tracking-wide flex items-center gap-2">
              <Film className="w-5 h-5 text-[var(--rogym-green)]" />
              <span>Phim Nổi Bật</span>
            </h2>
            <p className="text-xs text-[var(--rogym-text-muted)]">
              Danh sách các tác phẩm điện ảnh cập nhật từ hệ thống
            </p>
          </div>

          {/* Status Tabs */}
          <Tabs
            value={activeStatusTab}
            onValueChange={(val) => setActiveStatusTab(val as MovieStatus)}
            variant="pills"
            size="sm"
          >
            <TabsList>
              <TabsTrigger value="NOW_SHOWING">Phim Đang Chiếu</TabsTrigger>
              <TabsTrigger value="COMING_SOON">Phim Sắp Chiếu</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert tone="error">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Skeleton Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} variant="elevated" className="overflow-hidden border-[var(--rogym-border-subtle)] p-4 space-y-4">
                <Skeleton className="w-full aspect-[16/9] rounded-xl" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
                <Skeleton className="h-10 w-full rounded-xl" />
              </Card>
            ))}
          </div>
        )}

        {/* Empty Data State */}
        {!loading && !error && filteredMovies.length === 0 && (
          <PageEmptyState
            title="Chưa có phim ở danh mục này"
            description={
              activeStatusTab === 'NOW_SHOWING'
                ? 'Hiện chưa có phim nào đang chiếu trong hệ thống.'
                : 'Hiện chưa có phim nào trong danh sách sắp chiếu.'
            }
          />
        )}

        {/* Movie Cards List */}
        {!loading && !error && filteredMovies.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredMovies.map((movie) => {
              const genreNames =
                movie.genres && movie.genres.length > 0
                  ? movie.genres.map((g) => g.name).join(', ')
                  : 'Chưa cập nhật'

              const isNowShowing = movie.status === 'NOW_SHOWING'

              return (
                <Card
                  key={movie.id}
                  variant="elevated"
                  className="flex flex-col justify-between overflow-hidden border-[var(--rogym-border-subtle)] hover:border-[var(--rogym-border-teal-hover)] transition-all duration-300 group"
                >
                  {/* Poster Media / Fallback */}
                  <div className="relative aspect-[16/9] sm:aspect-[4/3] overflow-hidden bg-[var(--rogym-bg-card-darker)]">
                    {movie.poster ? (
                      <CardMedia
                        src={movie.poster}
                        alt={movie.title}
                        aspectRatio="16/9"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-[var(--rogym-bg-card-hover)] to-[var(--rogym-bg-deep)] text-[var(--rogym-text-muted)]">
                        <Film className="w-10 h-10 mb-2 opacity-50 text-[var(--rogym-teal)]" />
                        <span className="text-xs font-semibold text-center text-white/70 line-clamp-1">
                          {movie.title}
                        </span>
                      </div>
                    )}
                    <div className="absolute top-3 left-3 z-10">
                      <Badge
                        tone={isNowShowing ? 'primary' : 'warning'}
                        size="sm"
                      >
                        {isNowShowing ? 'Đang chiếu' : 'Sắp chiếu'}
                      </Badge>
                    </div>
                  </div>

                  <CardHeader className="space-y-1.5 p-4 sm:p-5">
                    <CardTitle className="text-base sm:text-lg font-bold text-white group-hover:text-[var(--rogym-teal)] transition-colors line-clamp-1">
                      {movie.title}
                    </CardTitle>
                    <CardDescription className="text-xs text-[var(--rogym-text-secondary)] line-clamp-2 min-h-[36px]">
                      {movie.description || 'Chưa có thông tin mô tả cho bộ phim này.'}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4 px-4 sm:px-5 pb-4 sm:pb-5 pt-0">
                    <div className="flex items-center justify-between text-xs text-[var(--rogym-text-muted)] border-t border-[var(--rogym-border-subtle)] pt-3">
                      <span className="truncate max-w-[60%] font-medium">{genreNames}</span>
                      <span className="flex items-center gap-1 shrink-0 font-medium text-[var(--rogym-teal)]">
                        <Clock className="w-3.5 h-3.5" />
                        {movie.duration} phút
                      </span>
                    </div>

                    <ButtonLink
                      to={`/booking/${movie.id}/showtimes`}
                      variant={isNowShowing ? 'primary' : 'outline-green'}
                      size="md"
                      fullWidth
                      leftIcon={isNowShowing ? <Ticket className="w-4 h-4" /> : <Calendar className="w-4 h-4" />}
                    >
                      {isNowShowing ? 'Đặt vé ngay' : 'Xem suất chiếu'}
                    </ButtonLink>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}

export default HomePage


