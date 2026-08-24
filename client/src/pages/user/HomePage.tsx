<<<<<<< HEAD
import { Link, useNavigate } from 'react-router-dom'
=======
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
>>>>>>> upstream/master
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
import { Film, Ticket, Sparkles, Clock, Shield, Newspaper, BadgePercent, RefreshCcw } from 'lucide-react'
import { movieService } from '@/services/movieService'
import { newsService } from '@/services/newsService'
import { promotionService } from '@/services/promotionService'
import type { Movie } from '@/types/movie'
import type { News } from '@/types/news'
import type { Promotion } from '@/types/promotion'

const movieStatusMap = {
  NOW_SHOWING: { tone: 'success' as const, label: 'Đang chiếu' },
  COMING_SOON: { tone: 'info' as const, label: 'Sắp chiếu' },
  ENDED: { tone: 'muted' as const, label: 'Ngừng chiếu' },
}

function formatPromotionValue(promotion: Promotion) {
  if (promotion.discountType === 'PERCENT') return `${promotion.discountValue}%`
  return `${promotion.discountValue.toLocaleString('vi-VN')} đ`
}

export function HomePage() {
  const { user, isAuthenticated, isAdmin } = useAuth()
<<<<<<< HEAD
  const navigate = useNavigate()
=======
  const [movies, setMovies] = useState<Movie[]>([])
  const [newsList, setNewsList] = useState<News[]>([])
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
>>>>>>> upstream/master

  const featuredMovies = useMemo(
    () => movies.filter((movie) => movie.status !== 'ENDED').slice(0, 6),
    [movies]
  )

  const activePromotions = useMemo(
    () => promotions.filter((promotion) => promotion.status === 'ACTIVE').slice(0, 3),
    [promotions]
  )

  const latestNews = useMemo(() => newsList.slice(0, 3), [newsList])

  const loadHomeData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [movieData, newsData, promotionData] = await Promise.all([
        movieService.getMovies(),
        newsService.getNews(),
        promotionService.getPromotions({ status: 'ACTIVE' }),
      ])
      setMovies(movieData)
      setNewsList(newsData)
      setPromotions(promotionData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải dữ liệu từ máy chủ')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadHomeData()
  }, [])

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
              Dữ liệu phim được tải trực tiếp từ hệ thống quản trị
            </p>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status="active" label={`${featuredMovies.length} phim`} />
            <Button type="button" variant="secondary" size="sm" onClick={loadHomeData} loading={loading} leftIcon={<RefreshCcw className="w-4 h-4" />}>
              Tải lại
            </Button>
          </div>
        </div>

        {error && (
          <Card variant="danger" padding="sm">
            <p className="text-sm text-red-200">{error}</p>
          </Card>
        )}

        {loading ? (
          <Card variant="elevated" className="py-10 text-center text-sm text-[var(--rogym-text-muted)]">
            Đang tải dữ liệu phim...
          </Card>
        ) : featuredMovies.length === 0 ? (
          <Card variant="elevated" className="py-10 text-center text-sm text-[var(--rogym-text-muted)]">
            Chưa có phim đang hoặc sắp chiếu.
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredMovies.map((movie, index) => (
              <Card
                key={movie.id}
                variant="elevated"
                className="flex flex-col justify-between overflow-hidden border-[var(--rogym-border-subtle)] hover:border-[var(--rogym-border-focus)] transition-all duration-300 group"
              >
                <CardHeader className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge tone={index === 0 ? 'accent' : 'primary'} size="sm">
                      {index === 0 ? 'Nổi bật' : 'CinemaNest'}
                    </Badge>
                    <StatusBadge status={movie.status} statusMap={movieStatusMap} size="sm" />
                  </div>
                  <CardTitle className="text-lg font-bold text-white group-hover:text-[var(--rogym-green)] transition-colors">
                    {movie.title}
                  </CardTitle>
                  <CardDescription className="text-xs text-[var(--rogym-text-secondary)] line-clamp-2">
                    {movie.description || 'Thông tin phim đang được cập nhật.'}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4 pt-2">
                  <div className="flex items-center justify-between text-xs text-[var(--rogym-text-muted)] border-t border-[var(--rogym-border-subtle)] pt-3">
                    <span>{movie.genres.map((genre) => genre.name).join(', ') || movie.language || 'Điện ảnh'}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[var(--rogym-teal)]" />
                      {movie.duration} phút
                    </span>
                  </div>

                  {movie.status === 'NOW_SHOWING' ? (
                    <Link to={`/booking/${movie.id}/showtimes`}>
                      <Button
                        variant="primary"
                        size="md"
                        fullWidth
                        leftIcon={<Ticket className="w-4 h-4" />}
                        className="cursor-pointer"
                      >
                        Đặt vé ngay
                      </Button>
                    </Link>
                  ) : (
                    <Button
                      variant="secondary"
                      size="md"
                      fullWidth
                      disabled
                      leftIcon={<Ticket className="w-4 h-4" />}
                    >
                      Sắp mở bán
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card variant="elevated" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-bold uppercase tracking-wide text-white">
              <BadgePercent className="h-5 w-5 text-[var(--rogym-green)]" />
              Khuyến mãi mới
            </h2>
            <Link to="/promotions" className="text-xs font-semibold text-[var(--rogym-teal)] hover:text-white">
              Xem tất cả
            </Link>
          </div>
          <div className="space-y-3">
            {activePromotions.length === 0 ? (
              <p className="text-sm text-[var(--rogym-text-muted)]">Chưa có khuyến mãi đang hoạt động.</p>
            ) : (
              activePromotions.map((promotion) => (
                <div key={promotion.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-white">{promotion.title}</p>
                      <p className="mt-1 line-clamp-2 text-xs text-[var(--rogym-text-secondary)]">{promotion.description || promotion.code}</p>
                    </div>
                    <Badge tone="success" size="sm">{promotion.code}</Badge>
                  </div>
                  <p className="mt-3 text-xs font-semibold text-[var(--rogym-teal)]">Giảm {formatPromotionValue(promotion)}</p>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card variant="elevated" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-bold uppercase tracking-wide text-white">
              <Newspaper className="h-5 w-5 text-[var(--rogym-green)]" />
              Tin tức
            </h2>
            <Link to="/news" className="text-xs font-semibold text-[var(--rogym-teal)] hover:text-white">
              Xem tất cả
            </Link>
          </div>
          <div className="space-y-3">
            {latestNews.length === 0 ? (
              <p className="text-sm text-[var(--rogym-text-muted)]">Chưa có tin tức nào.</p>
            ) : (
              latestNews.map((news) => (
                <Link key={news.id} to={`/news/${news.id}`} className="grid grid-cols-[72px_minmax(0,1fr)] gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3 transition-colors hover:border-[var(--rogym-border-focus)]">
                  <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-lg bg-white/5">
                    {news.thumbnail ? <img src={news.thumbnail} alt={news.title} className="h-full w-full object-cover" /> : <Newspaper className="h-6 w-6 text-[var(--rogym-text-muted)]" />}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-white">{news.title}</p>
                    <p className="mt-1 line-clamp-2 text-xs text-[var(--rogym-text-secondary)]">{news.content}</p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </Card>
      </section>
    </div>
  )
}

export default HomePage
