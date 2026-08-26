import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import {
  CalendarDays,
  Clock3,
  MapPin,
  MonitorPlay,
  Film,
  ArrowLeft,
  Calendar,
  Clock,
  Sparkles,
  Layers,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'
import {
  Alert,
  AlertDescription,
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  DatePickerInput,
  PageLoader,
} from '@/components/ui'
import { theaterService } from '@/services/theaterService'
import { showtimeService } from '@/services/showtimeService'
import { movieService } from '@/services/movieService'
import type { Theater } from '@/types/theater'
import type { Showtime } from '@/types/showtime'
import type { Movie } from '@/types/movie'

const BUSINESS_TIME_ZONE = 'Asia/Ho_Chi_Minh'

function getBusinessDate(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: BUSINESS_TIME_ZONE }).format(new Date())
}

function formatShowtime(value: string): string {
  return new Intl.DateTimeFormat('vi-VN', {
    timeZone: BUSINESS_TIME_ZONE,
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

interface QuickDateOption {
  dateStr: string
  label: string
  subLabel: string
}

function getUpcomingDays(count = 7): QuickDateOption[] {
  const days: QuickDateOption[] = []
  const today = new Date()

  for (let i = 0; i < count; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() + i)
    const dateStr = new Intl.DateTimeFormat('en-CA', { timeZone: BUSINESS_TIME_ZONE }).format(d)

    let label = ''
    if (i === 0) {
      label = 'Hôm nay'
    } else if (i === 1) {
      label = 'Ngày mai'
    } else {
      const weekday = new Intl.DateTimeFormat('vi-VN', { timeZone: BUSINESS_TIME_ZONE, weekday: 'short' }).format(d)
      label = weekday.charAt(0).toUpperCase() + weekday.slice(1)
    }

    const subLabel = new Intl.DateTimeFormat('vi-VN', {
      timeZone: BUSINESS_TIME_ZONE,
      day: '2-digit',
      month: '2-digit',
    }).format(d)

    days.push({ dateStr, label, subLabel })
  }

  return days
}

function isShowtimePassed(startTimeStr: string, status: string): boolean {
  if (status !== 'OPEN') return true
  const showtimeDate = new Date(startTimeStr)
  return showtimeDate.getTime() <= Date.now()
}

export function MovieShowtimePage() {
  const { movieId } = useParams<{ movieId: string }>()
  const navigate = useNavigate()
  const [movie, setMovie] = useState<Movie | null>(null)
  const [theaters, setTheaters] = useState<Theater[]>([])
  const [selectedTheaterId, setSelectedTheaterId] = useState('')
  const [selectedDate, setSelectedDate] = useState(getBusinessDate)
  const [showtimes, setShowtimes] = useState<Showtime[]>([])
  const [loadingTheaters, setLoadingTheaters] = useState(true)
  const [loadingShowtimes, setLoadingShowtimes] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [posterError, setPosterError] = useState(false)

  const quickDates = useMemo(() => getUpcomingDays(7), [])

  useEffect(() => {
    if (!movieId) return
    setLoadingTheaters(true)
    setError(null)
    setPosterError(false)

    // Fetch movie info
    Promise.resolve(movieService.getMovieById(movieId))
      .then((data) => setMovie(data))
      .catch(() => {
        setMovie(null)
      })

    // Fetch theaters showing this movie
    theaterService
      .getByMovieId(movieId)
      .then((data) => {
        setTheaters(data)
        setSelectedTheaterId(data[0]?.id ?? '')
      })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Không thể tải danh sách rạp'))
      .finally(() => setLoadingTheaters(false))
  }, [movieId])

  useEffect(() => {
    if (!movieId || !selectedTheaterId || !selectedDate) {
      setShowtimes([])
      return
    }
    setLoadingShowtimes(true)
    setError(null)
    showtimeService
      .getByMovieAndTheaterAndDate(movieId, selectedTheaterId, selectedDate)
      .then(setShowtimes)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Không thể tải suất chiếu'))
      .finally(() => setLoadingShowtimes(false))
  }, [movieId, selectedTheaterId, selectedDate])

  if (loadingTheaters) return <PageLoader ariaLabel="Đang tải danh sách rạp..." />

  const selectedTheater = theaters.find((theater) => theater.id === selectedTheaterId)

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Breadcrumb / Back Action */}
      <div className="flex items-center justify-between">
        <Link
          to="/user/movies"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--rogym-text-secondary)] hover:text-[var(--rogym-green)] transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Quay lại danh sách phim</span>
        </Link>

        <Badge
          tone="accent"
          size="sm"
          leftIcon={<span className="w-1.5 h-1.5 rounded-full bg-[var(--rogym-teal)] animate-pulse" />}
        >
          Đặt vé xem phim
        </Badge>
      </div>

      {/* Movie Information Summary Banner */}
      {movie && (
        <Card variant="glass" className="overflow-hidden p-4 sm:p-6 border-[var(--rogym-border-teal-dim)]">
          <div className="flex flex-col sm:flex-row gap-5 items-start">
            {movie.poster && !posterError ? (
              <img
                src={movie.poster}
                alt={movie.title}
                onError={() => setPosterError(true)}
                className="w-24 sm:w-28 h-36 sm:h-40 object-cover rounded-xl border border-white/10 shadow-lg shrink-0 mx-auto sm:mx-0"
              />
            ) : (
              <div className="w-24 sm:w-28 h-36 sm:h-40 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[var(--rogym-text-muted)] shrink-0 mx-auto sm:mx-0">
                <Film className="w-8 h-8" />
              </div>
            )}

            <div className="flex-1 space-y-2.5 text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                {movie.ageRating && (
                  <Badge tone="warning" size="xs">
                    {movie.ageRating}
                  </Badge>
                )}
                {movie.status === 'NOW_SHOWING' && (
                  <Badge tone="success" size="xs">
                    Đang chiếu
                  </Badge>
                )}
                {movie.status === 'COMING_SOON' && (
                  <Badge tone="info" size="xs">
                    Sắp chiếu
                  </Badge>
                )}
              </div>

              <h1 className="font-display text-xl sm:text-2xl lg:text-3xl font-bold uppercase tracking-wide text-white">
                {movie.title}
              </h1>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-[var(--rogym-text-secondary)]">
                {movie.duration > 0 && (
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[var(--rogym-teal)]" />
                    {movie.duration} phút
                  </span>
                )}
                {movie.genres && movie.genres.length > 0 && (
                  <span className="flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-[var(--rogym-teal)]" />
                    {movie.genres.map((g) => g.name).join(', ')}
                  </span>
                )}
                {movie.releaseDate && (
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[var(--rogym-teal)]" />
                    Khởi chiếu: {movie.releaseDate}
                  </span>
                )}
              </div>

              {movie.description && (
                <p className="text-xs text-[var(--rogym-text-muted)] line-clamp-2 leading-relaxed pt-1">
                  {movie.description}
                </p>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Page Header (if no movie loaded) */}
      {!movie && (
        <div className="space-y-1">
          <h1 className="font-display text-2xl sm:text-3xl font-bold uppercase tracking-wide text-white flex items-center gap-2.5">
            <Film className="w-7 h-7 text-[var(--rogym-green)]" />
            <span>Chọn Rạp & Suất Chiếu</span>
          </h1>
          <p className="text-xs text-[var(--rogym-text-secondary)]">
            Vui lòng chọn rạp chiếu, ngày và khung giờ thuận tiện nhất cho bạn
          </p>
        </div>
      )}

      {error && (
        <Alert tone="error">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {theaters.length === 0 ? (
        <Card variant="compact" className="p-12 text-center">
          <MapPin className="mx-auto mb-3 h-10 w-10 text-[var(--rogym-text-muted)]" />
          <p className="text-sm font-medium text-white">Không có rạp nào có suất chiếu</p>
          <p className="text-xs text-[var(--rogym-text-secondary)] mt-1">
            Hiện tại phim này chưa có lịch chiếu tại các cụm rạp của chúng tôi.
          </p>
        </Card>
      ) : (
        <>
          {/* Section 1: Choose Theater */}
          <section className="space-y-3" aria-labelledby="theater-selection-title">
            <div className="flex items-center justify-between gap-3">
              <h2 id="theater-selection-title" className="flex items-center gap-2 text-base sm:text-lg font-bold font-display uppercase tracking-wide text-white">
                <MapPin className="h-5 w-5 text-[var(--rogym-green)]" />
                <span>1. Chọn cụm rạp</span>
              </h2>
              <Badge tone="primary">{theaters.length} rạp có sẵn</Badge>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {theaters.map((theater) => (
                <Card
                  key={theater.id}
                  variant="interactive"
                  selected={theater.id === selectedTheaterId}
                  onClick={() => setSelectedTheaterId(theater.id)}
                  aria-label={`Chọn rạp ${theater.name}`}
                  className="p-4"
                >
                  <CardHeader className="p-0 space-y-1">
                    <CardTitle className="text-sm sm:text-base font-bold text-white flex items-center justify-between">
                      <span>{theater.name}</span>
                      {theater.id === selectedTheaterId && (
                        <span className="w-2 h-2 rounded-full bg-[var(--rogym-green)] animate-pulse" />
                      )}
                    </CardTitle>
                    <CardDescription className="flex items-start gap-1.5 text-xs text-[var(--rogym-text-secondary)]">
                      <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--rogym-teal)]" />
                      <span className="line-clamp-2">{theater.address}</span>
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </section>

          {/* Section 2: Choose Date & Showtimes */}
          <section className="space-y-3" aria-labelledby="showtime-selection-title">
            <h2 id="showtime-selection-title" className="flex items-center gap-2 text-base sm:text-lg font-bold font-display uppercase tracking-wide text-white">
              <Sparkles className="h-5 w-5 text-[var(--rogym-green)]" />
              <span>2. Chọn ngày & giờ chiếu</span>
            </h2>

            {/* Quick Date Selector Bar */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
              {quickDates.map((item) => {
                const isSelected = selectedDate === item.dateStr
                return (
                  <button
                    key={item.dateStr}
                    type="button"
                    onClick={() => setSelectedDate(item.dateStr)}
                    className={`flex flex-col items-center justify-center min-w-[100px] px-3 py-2.5 rounded-xl border text-center transition-all cursor-pointer shrink-0 ${
                      isSelected
                        ? 'bg-[var(--rogym-green)]/15 border-[var(--rogym-green)] shadow-md shadow-[var(--rogym-green)]/10 text-white'
                        : 'bg-white/5 border-white/10 text-[var(--rogym-text-secondary)] hover:border-white/25 hover:text-white'
                    }`}
                  >
                    <span className={`text-xs font-semibold ${isSelected ? 'text-[var(--rogym-green)]' : ''}`}>
                      {item.label}
                    </span>
                    <span className="text-xs text-[var(--rogym-text-muted)] mt-0.5">
                      {item.subLabel}
                    </span>
                  </button>
                )
              })}
            </div>

            <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
              {/* Date Picker Column */}
              <Card variant="glass" className="h-fit p-5 space-y-3">
                <CardHeader className="p-0 space-y-1">
                  <CardTitle className="flex items-center gap-2 text-sm font-bold text-white">
                    <CalendarDays className="h-4 w-4 text-[var(--rogym-teal)]" />
                    <span>Lịch chọn ngày xem</span>
                  </CardTitle>
                  <CardDescription className="text-xs">Giờ chiếu chuẩn Việt Nam (GMT+7)</CardDescription>
                </CardHeader>
                <CardContent className="p-0 pt-2">
                  <DatePickerInput
                    value={selectedDate}
                    onChange={setSelectedDate}
                    aria-label="Ngày chiếu"
                    buttonAriaLabel="Mở lịch chọn ngày chiếu"
                    min={getBusinessDate()}
                  />
                </CardContent>
              </Card>

              {/* Showtimes Column */}
              <Card variant="elevated" className="min-h-56 p-5 sm:p-6 space-y-4">
                <CardHeader className="p-0 space-y-1">
                  <CardTitle className="flex items-center gap-2 text-sm sm:text-base font-bold text-white">
                    <Clock3 className="h-4 w-4 text-[var(--rogym-green)]" />
                    <span>Suất chiếu có sẵn {selectedTheater ? `tại ${selectedTheater.name}` : ''}</span>
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Vui lòng chọn khung giờ để chuyển sang bước chọn vị trí ghế ngồi
                  </CardDescription>
                </CardHeader>

                <CardContent className="p-0 pt-2">
                  {loadingShowtimes ? (
                    <PageLoader ariaLabel="Đang tải suất chiếu..." minHeight="18vh" />
                  ) : showtimes.length === 0 ? (
                    <div className="flex min-h-32 flex-col items-center justify-center gap-2 text-center text-sm text-[var(--rogym-text-muted)] py-8">
                      <MonitorPlay className="h-8 w-8 text-[var(--rogym-text-muted)]" />
                      <p className="font-medium text-white">Không có suất chiếu phù hợp</p>
                      <p className="text-xs text-[var(--rogym-text-secondary)] max-w-sm">
                        Rạp này hiện chưa có lịch chiếu vào ngày đã chọn. Vui lòng chọn ngày hoặc rạp khác.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {showtimes.map((showtime) => {
                        const isPassed = isShowtimePassed(showtime.startTime, showtime.status)
                        const isCancelled = showtime.status === 'CANCELLED'

                        return (
                          <button
                            key={showtime.id}
                            type="button"
                            disabled={isPassed}
                            onClick={() => !isPassed && navigate(`/user/booking/${showtime.id}/seats`)}
                            className={`flex flex-col items-center justify-center p-3.5 rounded-xl border transition-all text-center relative overflow-hidden group ${
                              isPassed
                                ? 'opacity-40 cursor-not-allowed bg-white/[0.02] border-white/5 text-[var(--rogym-text-muted)]'
                                : 'bg-[var(--rogym-bg-surface)] border-[var(--rogym-border-subtle)] hover:border-[var(--rogym-green)] hover:bg-[var(--rogym-green)]/10 hover:shadow-lg hover:shadow-[var(--rogym-green)]/10 cursor-pointer'
                            }`}
                          >
                            <span
                              className={`font-display text-base font-bold transition-colors ${
                                isPassed
                                  ? 'text-[var(--rogym-text-muted)] line-through decoration-rose-500/50'
                                  : 'text-white group-hover:text-[var(--rogym-green)]'
                              }`}
                            >
                              {formatShowtime(showtime.startTime)}
                            </span>

                            <span
                              className={`text-[11px] transition-colors mt-0.5 ${
                                isPassed
                                  ? 'text-[var(--rogym-text-muted)]'
                                  : 'text-[var(--rogym-text-muted)] group-hover:text-white/90'
                              }`}
                            >
                              {showtime.roomName}
                            </span>

                            {isPassed && (
                              <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-semibold text-rose-400">
                                <AlertCircle className="w-3 h-3" />
                                {isCancelled ? 'Đã hủy' : showtime.status === 'FINISHED' ? 'Đã kết thúc' : 'Đã qua giờ'}
                              </span>
                            )}

                            {!isPassed && (
                              <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-medium text-[var(--rogym-green)]/80 opacity-0 group-hover:opacity-100 transition-opacity">
                                <CheckCircle2 className="w-3 h-3" />
                                Đặt vé
                              </span>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </section>
        </>
      )}
    </div>
  )
}

export default MovieShowtimePage