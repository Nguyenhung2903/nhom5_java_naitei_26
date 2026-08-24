import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { movieService } from '@/services/movieService'
import type { Movie } from '@/types/movie'
import { Card, Badge, Button, PageLoader } from '@/components/ui'
import { Film, Ticket, RefreshCcw, Flame, Clock, Calendar, AlertCircle } from 'lucide-react'

const movieStatusMap = {
  NOW_SHOWING: { tone: 'success' as const, label: 'Đang chiếu' },
  COMING_SOON: { tone: 'info' as const, label: 'Sắp chiếu' },
  ENDED: { tone: 'muted' as const, label: 'Ngừng chiếu' },
}

export function UserMoviesPage() {
  const [movies, setMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)
  const [movieFilter, setMovieFilter] = useState<'ALL' | 'NOW_SHOWING' | 'COMING_SOON'>('ALL')

  const fetchMovies = async () => {
    try {
      setLoading(true)
      const data = await movieService.getMovies()
      setMovies(data || [])
    } catch {
      setMovies([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void fetchMovies()
  }, [])

  const filteredMovies = useMemo(() => {
    let list = movies.filter((m) => m.status !== 'ENDED')
    if (movieFilter === 'NOW_SHOWING') {
      list = list.filter((m) => m.status === 'NOW_SHOWING')
    } else if (movieFilter === 'COMING_SOON') {
      list = list.filter((m) => m.status === 'COMING_SOON')
    }
    return list
  }, [movies, movieFilter])

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-white uppercase tracking-wide flex items-center gap-2.5">
            <Film className="w-7 h-7 text-[var(--rogym-green)]" />
            <span>Phim Đang Chiếu & Lịch Chiếu</span>
          </h1>
          <p className="text-xs text-[var(--rogym-text-secondary)] mt-1">
            Chọn phim bạn yêu thích để xem lịch chiếu chi tiết, phòng chiếu và chọn chỗ ngồi
          </p>
        </div>

        <div className="flex items-center gap-3">
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
              Tất cả ({movies.filter((m) => m.status !== 'ENDED').length})
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
              Đang chiếu ({movies.filter((m) => m.status === 'NOW_SHOWING').length})
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
              Sắp chiếu ({movies.filter((m) => m.status === 'COMING_SOON').length})
            </button>
          </div>

          <Button
            type="button"
            variant="outline-white"
            size="sm"
            onClick={fetchMovies}
            loading={loading}
            leftIcon={<RefreshCcw className="w-4 h-4" />}
          >
            Làm mới
          </Button>
        </div>
      </div>

      {/* Movies Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-24">
          <PageLoader ariaLabel="Đang tải danh sách phim..." />
        </div>
      ) : filteredMovies.length === 0 ? (
        <Card variant="glass" className="p-12 text-center space-y-3">
          <AlertCircle className="w-12 h-12 text-[var(--rogym-text-muted)] mx-auto" />
          <p className="text-sm font-semibold text-white">Không tìm thấy phim phù hợp</p>
          <p className="text-xs text-[var(--rogym-text-secondary)]">
            Vui lòng thử lại với bộ lọc khác hoặc kiểm tra lại sau.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredMovies.map((movie) => {
            const isNowShowing = movie.status === 'NOW_SHOWING'
            return (
              <Card
                key={movie.id}
                variant="interactive"
                className="overflow-hidden flex flex-col justify-between border-[var(--rogym-border-subtle)] hover:border-[var(--rogym-border-teal-hover)] group"
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

                  <div className="p-4 space-y-3">
                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-[var(--rogym-teal)] transition-colors line-clamp-1">
                        {movie.title}
                      </h3>
                      <p className="text-xs text-[var(--rogym-text-muted)] mt-0.5">
                        {movie.genres?.map((g) => g.name).join(', ') || 'Điện ảnh'}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-[var(--rogym-text-secondary)]">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-[var(--rogym-teal)]" />
                        {movie.duration} phút
                      </span>
                      {movie.releaseDate && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-[var(--rogym-teal)]" />
                          {new Date(movie.releaseDate).toLocaleDateString('vi-VN')}
                        </span>
                      )}
                    </div>

                    {movie.description && (
                      <p className="text-xs text-[var(--rogym-text-secondary)] line-clamp-2 leading-relaxed">
                        {movie.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="p-4 pt-0">
                  {isNowShowing ? (
                    <Link to={`/user/booking/${movie.id}/showtimes`} className="block w-full">
                      <Button
                        variant="primary"
                        size="sm"
                        className="w-full"
                        leftIcon={<Ticket className="w-4 h-4" />}
                      >
                        Đặt vé ngay
                      </Button>
                    </Link>
                  ) : (
                    <Button
                      variant="outline-white"
                      size="sm"
                      className="w-full cursor-not-allowed opacity-75"
                      disabled
                      leftIcon={<Flame className="w-4 h-4" />}
                    >
                      Sắp công chiếu
                    </Button>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default UserMoviesPage
