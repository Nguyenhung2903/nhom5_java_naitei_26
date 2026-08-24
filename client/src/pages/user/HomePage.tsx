import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { movieService } from '@/services/movieService'
import { newsService } from '@/services/newsService'
import { promotionService } from '@/services/promotionService'
import type { Movie } from '@/types/movie'
import type { News } from '@/types/news'
import type { Promotion } from '@/types/promotion'
import {
  Card,
  Badge,
  Button,
  ButtonLink,
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui'
import {
  Film,
  Ticket,
  Sparkles,
  Clock,
  Newspaper,
  BadgePercent,
  RefreshCcw,
  UserCheck,
  Tv,
  Headphones,
  Crown,
  Star,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
  MapPin,
  Flame,
} from 'lucide-react'

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
  const { user, isAuthenticated } = useAuth()
  const [movies, setMovies] = useState<Movie[]>([])
  const [newsList, setNewsList] = useState<News[]>([])
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [loading, setLoading] = useState(true)
  const [movieFilter, setMovieFilter] = useState<'ALL' | 'NOW_SHOWING' | 'COMING_SOON'>('ALL')

  const filteredMovies = useMemo(() => {
    let list = movies.filter((m) => m.status !== 'ENDED')
    if (movieFilter === 'NOW_SHOWING') {
      list = list.filter((m) => m.status === 'NOW_SHOWING')
    } else if (movieFilter === 'COMING_SOON') {
      list = list.filter((m) => m.status === 'COMING_SOON')
    }
    return list
  }, [movies, movieFilter])

  const activePromotions = useMemo(
    () => promotions.filter((promotion) => promotion.status === 'ACTIVE').slice(0, 3),
    [promotions]
  )

  const latestNews = useMemo(() => newsList.slice(0, 3), [newsList])

  const loadHomeData = async () => {
    setLoading(true)
    try {
      const [movieData, newsData, promotionData] = await Promise.all([
        movieService.getMovies(),
        newsService.getNews(),
        promotionService.getPromotions({ status: 'ACTIVE' }),
      ])
      setMovies(movieData || [])
      setNewsList(newsData || [])
      setPromotions(promotionData || [])
    } catch {
      // Fallback gracefully
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadHomeData()
  }, [])

  return (
    <div className="space-y-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* 1. Hero Showcase Banner */}
      <section className="relative overflow-hidden rounded-3xl border border-[var(--rogym-border-teal-dim)] bg-gradient-to-r from-[var(--rogym-bg-card)] via-black to-[var(--rogym-bg-card)] p-8 md:p-14 shadow-2xl">
        <img
          src="/cover.jpg"
          alt="Cinema Showcase"
          className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none z-0 opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/85 to-black/50 z-0 pointer-events-none" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-[var(--rogym-green)]/15 rounded-full blur-3xl pointer-events-none z-0" />

        <div className="relative z-10 max-w-2xl space-y-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--rogym-green)]/15 border border-[var(--rogym-green)]/35 text-[var(--rogym-teal)] text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Nền Tảng Điện Ảnh & Đặt Vé Chuẩn Quốc Tế</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-display tracking-tight text-white uppercase leading-tight">
            Trải Nghiệm Điện Ảnh <span className="text-[var(--rogym-green)]">Đỉnh Cao</span>
          </h1>

          <p className="text-sm sm:text-base text-[var(--rogym-text-secondary)] leading-relaxed">
            Hệ thống rạp chiếu chuẩn quốc tế với phòng chiếu IMAX, âm thanh Dolby Atmos 360°, ghế VIP Suite cao cấp và tiện ích đặt vé trực tuyến siêu tốc.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <a href="#movies">
              <Button variant="primary" size="lg" leftIcon={<Ticket className="w-5 h-5" />}>
                Xem phim & Đặt vé ngay
              </Button>
            </a>

            {isAuthenticated && user ? (
              <ButtonLink to="/user" variant="outline-white" size="lg" leftIcon={<UserCheck className="w-5 h-5" />}>
                Bảng điều khiển cá nhân
              </ButtonLink>
            ) : (
              <ButtonLink to="/register" variant="outline-white" size="lg">
                Đăng ký thành viên
              </ButtonLink>
            )}
          </div>
        </div>
      </section>

      {/* 2. Highlights Stat Bar */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 rounded-2xl bg-[var(--rogym-bg-surface)] border border-[var(--rogym-border-subtle)]">
        <div className="flex items-center gap-3.5 p-2">
          <div className="p-3 rounded-xl bg-[var(--rogym-green)]/10 text-[var(--rogym-green)]">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xl font-bold font-display text-white">12+ Cụm Rạp</p>
            <p className="text-xs text-[var(--rogym-text-muted)]">Toàn quốc hiện đại</p>
          </div>
        </div>

        <div className="flex items-center gap-3.5 p-2">
          <div className="p-3 rounded-xl bg-[var(--rogym-teal)]/10 text-[var(--rogym-teal)]">
            <Tv className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xl font-bold font-display text-white">50+ Phòng Chiếu</p>
            <p className="text-xs text-[var(--rogym-text-muted)]">IMAX, 4DX, VIP</p>
          </div>
        </div>

        <div className="flex items-center gap-3.5 p-2">
          <div className="p-3 rounded-xl bg-amber-400/10 text-amber-400">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xl font-bold font-display text-white">150+ Suất/Ngày</p>
            <p className="text-xs text-[var(--rogym-text-muted)]">Khung giờ vàng linh hoạt</p>
          </div>
        </div>

        <div className="flex items-center gap-3.5 p-2">
          <div className="p-3 rounded-xl bg-purple-400/10 text-purple-400">
            <Star className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xl font-bold font-display text-white">99.8%</p>
            <p className="text-xs text-[var(--rogym-text-muted)]">Khách hàng hài lòng</p>
          </div>
        </div>
      </section>

      {/* 3. Featured Movies Showcase */}
      <section id="movies" className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--rogym-border-subtle)] pb-4">
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold font-display text-white uppercase tracking-wide flex items-center gap-2">
              <Flame className="w-6 h-6 text-[var(--rogym-green)]" />
              <span>Phim Đang Công Chiếu & Sắp Chiếu</span>
            </h2>
            <p className="text-xs text-[var(--rogym-text-muted)]">
              Chọn phim yêu thích để xem lịch chiếu chi tiết và chọn vị trí ngồi đẹp nhất
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex p-1 rounded-xl bg-white/5 border border-white/10 text-xs">
              <button
                type="button"
                onClick={() => setMovieFilter('ALL')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                  movieFilter === 'ALL'
                    ? 'bg-[var(--rogym-green)] text-black'
                    : 'text-[var(--rogym-text-secondary)] hover:text-white'
                }`}
              >
                Tất cả ({movies.length})
              </button>
              <button
                type="button"
                onClick={() => setMovieFilter('NOW_SHOWING')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                  movieFilter === 'NOW_SHOWING'
                    ? 'bg-[var(--rogym-green)] text-black'
                    : 'text-[var(--rogym-text-secondary)] hover:text-white'
                }`}
              >
                Đang chiếu
              </button>
              <button
                type="button"
                onClick={() => setMovieFilter('COMING_SOON')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                  movieFilter === 'COMING_SOON'
                    ? 'bg-[var(--rogym-green)] text-black'
                    : 'text-[var(--rogym-text-secondary)] hover:text-white'
                }`}
              >
                Sắp chiếu
              </button>
            </div>
            <Button
              type="button"
              variant="outline-white"
              size="sm"
              onClick={loadHomeData}
              loading={loading}
              leftIcon={<RefreshCcw className="w-4 h-4" />}
            >
              Làm mới
            </Button>
          </div>
        </div>

        {filteredMovies.length === 0 ? (
          <Card variant="glass" className="p-12 text-center">
            <Film className="w-12 h-12 text-[var(--rogym-text-muted)] mx-auto mb-3" />
            <p className="text-sm text-[var(--rogym-text-secondary)]">Không tìm thấy phim phù hợp.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMovies.map((movie) => (
              <Card
                key={movie.id}
                variant="interactive"
                className="overflow-hidden flex flex-col justify-between border-[var(--rogym-border-subtle)] hover:border-[var(--rogym-border-teal-hover)]"
                padding="none"
              >
                <div>
                  <div className="relative aspect-[16/10] bg-[var(--rogym-bg-surface)] overflow-hidden">
                    {movie.poster ? (
                      <img
                        src={movie.poster}
                        alt={movie.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[var(--rogym-text-muted)]">
                        <Film className="w-10 h-10" />
                      </div>
                    )}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <Badge tone={movieStatusMap[movie.status]?.tone || 'primary'} size="xs">
                        {movieStatusMap[movie.status]?.label || movie.status}
                      </Badge>
                      {movie.ageRating && (
                        <Badge tone="accent" size="xs">
                          {movie.ageRating}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    <div>
                      <h3 className="text-base font-bold text-white group-hover:text-[var(--rogym-teal)] transition-colors line-clamp-1">
                        {movie.title}
                      </h3>
                      <p className="text-xs text-[var(--rogym-text-muted)] mt-0.5">
                        {movie.genres?.map((g) => g.name).join(', ') || 'Điện ảnh'}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-[var(--rogym-text-secondary)]">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-[var(--rogym-teal)]" />
                        {movie.duration} phút
                      </span>
                    </div>

                    <p className="text-xs text-[var(--rogym-text-secondary)] line-clamp-2 leading-relaxed">
                      {movie.description || 'Chưa có mô tả chi tiết cho bộ phim này.'}
                    </p>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <ButtonLink
                    to={`/user/booking/${movie.id}/showtimes`}
                    variant="primary"
                    size="sm"
                    className="w-full justify-center shadow-md shadow-[var(--rogym-green)]/15"
                    leftIcon={<Ticket className="w-4 h-4" />}
                  >
                    Đặt vé ngay
                  </ButtonLink>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* 4. Next-Gen Cinema Technologies */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-white uppercase tracking-wide">
            Công Nghệ Phòng Chiếu <span className="text-[var(--rogym-teal)]">Đột Phá</span>
          </h2>
          <p className="text-xs text-[var(--rogym-text-secondary)]">
            Tận hưởng hình ảnh và âm thanh sống động đến từng chi tiết với công nghệ hàng đầu thế giới
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card variant="elevated" className="p-6 space-y-4 border-[var(--rogym-border-subtle)]">
            <div className="w-12 h-12 rounded-2xl bg-[var(--rogym-green)]/10 text-[var(--rogym-green)] flex items-center justify-center">
              <Tv className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">IMAX with Laser</h3>
            <p className="text-xs text-[var(--rogym-text-secondary)] leading-relaxed">
              Màn hình cong khổng lồ, công nghệ máy chiếu laser 4K thế hệ mới mang lại độ sáng vượt trội và độ tương phản chân thực tối đa.
            </p>
          </Card>

          <Card variant="elevated" className="p-6 space-y-4 border-[var(--rogym-border-subtle)]">
            <div className="w-12 h-12 rounded-2xl bg-[var(--rogym-teal)]/10 text-[var(--rogym-teal)] flex items-center justify-center">
              <Headphones className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Dolby Atmos Surround 360°</h3>
            <p className="text-xs text-[var(--rogym-text-secondary)] leading-relaxed">
              Hệ thống âm thanh đa chiều chuyển động quanh bạn, tái tạo từng rung cảm từ tiếng mưa rơi nhẹ đến tiếng nổ siêu thực.
            </p>
          </Card>

          <Card variant="elevated" className="p-6 space-y-4 border-[var(--rogym-border-subtle)]">
            <div className="w-12 h-12 rounded-2xl bg-amber-400/10 text-amber-400 flex items-center justify-center">
              <Crown className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">VIP Suite & Ghế Da Điện</h3>
            <p className="text-xs text-[var(--rogym-text-secondary)] leading-relaxed">
              Ghế đôi bọc da cao cấp điều chỉnh ngả lưng 180 độ, tích hợp cổng sạc không dây và dịch vụ phục vụ bắp nước tận chỗ ngồi.
            </p>
          </Card>
        </div>
      </section>

      {/* 5. Membership Tier Benefits */}
      <section className="p-8 rounded-3xl bg-gradient-to-br from-[var(--rogym-bg-surface)] to-[var(--rogym-bg-card)] border border-[var(--rogym-border-subtle)] space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-[var(--rogym-green)] uppercase tracking-wider">CinemaNest Club</span>
            <h2 className="text-2xl font-bold font-display text-white mt-1">Đặc Quyền Thành Viên Hội Viên</h2>
            <p className="text-xs text-[var(--rogym-text-secondary)]">Tích điểm nhận vé miễn phí và vô vàn quà tặng độc quyền</p>
          </div>
          <Link to="/register">
            <Button variant="primary" size="sm" leftIcon={<UserCheck className="w-4 h-4" />}>
              Gia nhập hội viên ngay
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-gray-300">Hạng Bạc (Silver)</span>
              <Badge tone="muted" size="xs">0+ Điểm</Badge>
            </div>
            <ul className="space-y-2 text-xs text-[var(--rogym-text-secondary)]">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[var(--rogym-green)]" /> Tích lũy 5% giá trị mỗi vé đặt</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[var(--rogym-green)]" /> Giảm giá bắp nước ngày Member Day</li>
            </ul>
          </div>

          <div className="p-5 rounded-2xl bg-[var(--rogym-green)]/[0.04] border border-[var(--rogym-green)]/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-amber-300">Hạng Vàng (Gold)</span>
              <Badge tone="accent" size="xs">500+ Điểm</Badge>
            </div>
            <ul className="space-y-2 text-xs text-[var(--rogym-text-secondary)]">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[var(--rogym-green)]" /> Tích lũy 8% giá trị mỗi vé đặt</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[var(--rogym-green)]" /> Tặng 01 Vé 2D miễn phí dịp sinh nhật</li>
            </ul>
          </div>

          <div className="p-5 rounded-2xl bg-[var(--rogym-teal)]/[0.04] border border-[var(--rogym-teal)]/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-[var(--rogym-teal)]">Kim Cương (Diamond)</span>
              <Badge tone="primary" size="xs">1.000+ Điểm</Badge>
            </div>
            <ul className="space-y-2 text-xs text-[var(--rogym-text-secondary)]">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[var(--rogym-green)]" /> Tích lũy 10% giá trị mỗi vé đặt</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[var(--rogym-green)]" /> Miễn phí nâng hạng ghế VIP Suite</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 6. Active Promotions & Latest News */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Promotions */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--rogym-border-subtle)] pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <BadgePercent className="w-4 h-4 text-[var(--rogym-teal)]" />
              <span>Khuyến Mãi Đang Diễn Ra</span>
            </h3>
            <Link to="/promotions" className="text-xs font-semibold text-[var(--rogym-teal)] hover:text-white">
              Xem tất cả →
            </Link>
          </div>

          <div className="space-y-3">
            {activePromotions.map((promo) => (
              <div
                key={promo.id}
                className="p-4 rounded-xl border border-white/10 bg-white/[0.02] flex items-center justify-between gap-4"
              >
                <div>
                  <Badge tone="primary" size="xs">{promo.code}</Badge>
                  <p className="text-sm font-bold text-white mt-1">{promo.title}</p>
                  <p className="text-xs text-[var(--rogym-text-secondary)] line-clamp-1">{promo.description}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-sm font-bold text-[var(--rogym-green)]">
                    {formatPromotionValue(promo)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Latest News */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--rogym-border-subtle)] pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Newspaper className="w-4 h-4 text-[var(--rogym-green)]" />
              <span>Tin Tức & Sự Kiện Điện Ảnh</span>
            </h3>
            <Link to="/news" className="text-xs font-semibold text-[var(--rogym-teal)] hover:text-white">
              Xem tất cả →
            </Link>
          </div>

          <div className="space-y-3">
            {latestNews.map((news) => (
              <Link
                key={news.id}
                to={`/news/${news.id}`}
                className="grid grid-cols-[80px_minmax(0,1fr)] gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-3 transition-colors hover:border-[var(--rogym-border-focus)]"
              >
                <div className="aspect-[4/3] rounded-lg bg-[var(--rogym-bg-surface)] overflow-hidden">
                  {news.thumbnail ? (
                    <img src={news.thumbnail} alt={news.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[var(--rogym-text-muted)]">
                      <Newspaper className="w-4 h-4" />
                    </div>
                  )}
                </div>
                <div className="flex flex-col justify-center">
                  <h4 className="text-xs font-bold text-white line-clamp-1 hover:text-[var(--rogym-teal)]">{news.title}</h4>
                  <p className="text-[11px] text-[var(--rogym-text-secondary)] line-clamp-2 mt-1">{news.content}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* 7. FAQ Interactive Accordion */}
      <section id="faq" className="space-y-6 max-w-3xl mx-auto">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold font-display text-white uppercase tracking-wide flex items-center justify-center gap-2">
            <HelpCircle className="w-6 h-6 text-[var(--rogym-green)]" />
            <span>Câu Hỏi Thường Gặp (FAQ)</span>
          </h2>
          <p className="text-xs text-[var(--rogym-text-secondary)]">Giải đáp nhanh các thắc mắc về quy trình đặt vé và chính sách rạp</p>
        </div>

        <Accordion type="single" collapsible defaultValue="faq-1" variant="separated">
          <AccordionItem value="faq-1">
            <AccordionTrigger>Làm thế nào để đặt vé xem phim trực tuyến?</AccordionTrigger>
            <AccordionContent>
              Bạn chỉ cần chọn bộ phim muốn xem ở danh sách phía trên, nhấp vào &quot;Đặt vé ngay&quot;, chọn suất chiếu và phòng chiếu phù hợp, sau đó chọn ghế ngồi và tiến hành thanh toán an toàn qua cổng VNPay.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="faq-2">
            <AccordionTrigger>Sau khi thanh toán thành công, tôi nhận vé bằng cách nào?</AccordionTrigger>
            <AccordionContent>
              Mã vé điện tử và mã QR sẽ hiển thị ngay tại trang xác nhận và được lưu trữ trong mục &quot;Vé của tôi&quot; tại Bảng điều khiển cá nhân (`/user/tickets`). Bạn chỉ cần đưa mã QR cho nhân viên rạp quét khi vào phòng chiếu.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="faq-3">
            <AccordionTrigger>Tôi có thể hoàn hủy hoặc đổi suất chiếu không?</AccordionTrigger>
            <AccordionContent>
              Vé đã thanh toán thành công theo quy định hiện tại không hỗ trợ hoàn tiền trực tiếp, tuy nhiên quý khách có thể liên hệ tổng đài 1900 6868 trước giờ chiếu 60 phút để được hỗ trợ chuyển đổi suất chiếu linh hoạt.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="faq-4">
            <AccordionTrigger>Làm sao để tích điểm và nâng hạng thành viên?</AccordionTrigger>
            <AccordionContent>
              Mỗi giao dịch đặt vé khi đăng nhập tài khoản sẽ tự động tích lũy điểm thưởng (10.000 VNĐ = 1 điểm). Điểm thưởng có thể dùng để đổi vé xem phim hoặc bắp nước miễn phí.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>

      {/* 8. Bottom CTA */}
      <section className="relative overflow-hidden rounded-3xl p-8 md:p-12 text-center bg-gradient-to-r from-[var(--rogym-green)]/15 via-[var(--rogym-teal)]/15 to-transparent border border-[var(--rogym-green)]/30 space-y-4">
        <h2 className="text-2xl sm:text-3xl font-bold font-display text-white uppercase">
          Sẵn Sàng Thưởng Thức Siêu Phẩm?
        </h2>
        <p className="text-xs sm:text-sm text-[var(--rogym-text-secondary)] max-w-xl mx-auto">
          Tạo tài khoản CinemaNest ngay hôm nay để nhận ngay voucher giảm 20% cho lần đặt vé đầu tiên.
        </p>
        <div className="pt-2">
          <Link to="/register">
            <Button variant="primary" size="lg" leftIcon={<ArrowRight className="w-5 h-5" />}>
              Đăng ký tài khoản miễn phí
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}

export default HomePage
