import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { CalendarDays, Clock3, MapPin, MonitorPlay, Ticket } from 'lucide-react'
import { Alert, AlertDescription, Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, DatePickerInput, PageLoader } from '@/components/ui'
import { theaterService } from '@/services/theaterService'
import { showtimeService } from '@/services/showtimeService'
import type { Theater } from '@/types/theater'
import type { Showtime } from '@/types/showtime'

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

export function MovieShowtimePage() {
  const { movieId } = useParams<{ movieId: string }>()
  const navigate = useNavigate()
  const [theaters, setTheaters] = useState<Theater[]>([])
  const [selectedTheaterId, setSelectedTheaterId] = useState('')
  const [selectedDate, setSelectedDate] = useState(getBusinessDate)
  const [showtimes, setShowtimes] = useState<Showtime[]>([])
  const [loadingTheaters, setLoadingTheaters] = useState(true)
  const [loadingShowtimes, setLoadingShowtimes] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!movieId) return
    setLoadingTheaters(true)
    setError(null)
    theaterService.getByMovieId(movieId)
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
    showtimeService.getByMovieAndTheaterAndDate(movieId, selectedTheaterId, selectedDate)
      .then(setShowtimes)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Không thể tải suất chiếu'))
      .finally(() => setLoadingShowtimes(false))
  }, [movieId, selectedTheaterId, selectedDate])

  if (loadingTheaters) return <PageLoader ariaLabel="Đang tải danh sách rạp..." />

  const selectedTheater = theaters.find((theater) => theater.id === selectedTheaterId)

  return (
    <div className="mx-auto max-w-6xl space-y-7 px-4 py-8 sm:px-6 lg:px-8">
      <header className="space-y-2 border-b border-[var(--rogym-border-subtle)] pb-5">
        <div className="flex items-center gap-2 text-[var(--rogym-teal)]">
          <Ticket className="h-5 w-5" />
          <span className="text-xs font-semibold uppercase tracking-[0.18em]">Đặt vé</span>
        </div>
        <h1 className="font-display text-2xl font-bold uppercase tracking-wide text-white sm:text-3xl">
          Chọn rạp và suất chiếu
        </h1>
        <p className="text-sm text-[var(--rogym-text-secondary)]">
          Chọn rạp, ngày chiếu và khung giờ phù hợp với bạn.
        </p>
      </header>

      {error && (
        <Alert tone="error">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {theaters.length === 0 ? (
        <Card variant="compact" className="p-8 text-center">
          <MapPin className="mx-auto mb-3 h-8 w-8 text-[var(--rogym-text-muted)]" />
          <p className="text-sm text-[var(--rogym-text-secondary)]">Không có rạp nào có suất chiếu cho phim này.</p>
        </Card>
      ) : (
        <>
          <section className="space-y-3" aria-labelledby="theater-selection-title">
            <div className="flex items-center justify-between gap-3">
              <h2 id="theater-selection-title" className="flex items-center gap-2 text-lg font-semibold text-white">
                <MapPin className="h-5 w-5 text-[var(--rogym-green)]" />
                Chọn rạp
              </h2>
              <Badge tone="primary">{theaters.length} rạp</Badge>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {theaters.map((theater) => (
                <Card
                  key={theater.id}
                  variant="interactive"
                  selected={theater.id === selectedTheaterId}
                  onClick={() => setSelectedTheaterId(theater.id)}
                  aria-label={`Chọn rạp ${theater.name}`}
                >
                  <CardHeader className="p-0">
                    <CardTitle className="text-base text-white">{theater.name}</CardTitle>
                    <CardDescription className="flex items-start gap-2 text-xs">
                      <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      {theater.address}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </section>

          <section className="grid gap-5 md:grid-cols-[minmax(220px,280px)_1fr]" aria-labelledby="showtime-selection-title">
            <Card variant="glass" className="h-fit">
              <CardHeader className="p-0">
                <CardTitle className="flex items-center gap-2 text-base text-white">
                  <CalendarDays className="h-4 w-4 text-[var(--rogym-teal)]" />
                  Chọn ngày
                </CardTitle>
                <CardDescription className="text-xs">Ngày được quy đổi theo giờ Việt Nam.</CardDescription>
              </CardHeader>
              <CardContent className="p-0 pt-4">
                <DatePickerInput
                  value={selectedDate}
                  onChange={setSelectedDate}
                  aria-label="Ngày chiếu"
                  buttonAriaLabel="Mở lịch chọn ngày chiếu"
                  min={getBusinessDate()}
                />
              </CardContent>
            </Card>

            <Card variant="elevated" className="min-h-56">
              <CardHeader className="p-0">
                <CardTitle id="showtime-selection-title" className="flex items-center gap-2 text-base text-white">
                  <Clock3 className="h-4 w-4 text-[var(--rogym-green)]" />
                  Suất chiếu{selectedTheater ? ` tại ${selectedTheater.name}` : ''}
                </CardTitle>
                <CardDescription className="text-xs">Các suất chiếu trong ngày đã chọn.</CardDescription>
              </CardHeader>
              <CardContent className="p-0 pt-5">
                {loadingShowtimes ? (
                  <PageLoader ariaLabel="Đang tải suất chiếu..." minHeight="20vh" />
                ) : showtimes.length === 0 ? (
                  <div className="flex min-h-32 flex-col items-center justify-center gap-2 text-center text-sm text-[var(--rogym-text-muted)]">
                    <MonitorPlay className="h-7 w-7" />
                    <p>Không có suất chiếu phù hợp trong ngày đã chọn.</p>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-3">
                    {showtimes.map((showtime) => (
                      <Button
                        key={showtime.id}
                        variant="secondary"
                        size="md"
                        leftIcon={<Clock3 className="h-4 w-4" />}
                        onClick={() => navigate(`/user/booking/${showtime.id}/seats`)}
                      >
                        {formatShowtime(showtime.startTime)}
                        <span className="ml-1 text-xs text-[var(--rogym-text-muted)]">{showtime.roomName}</span>
                      </Button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </section>
        </>
      )}
    </div>
  )
}