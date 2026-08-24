import { useEffect, useState } from 'react'
import { MapPin, Phone, Clapperboard } from 'lucide-react'
import { Alert, AlertDescription, Card, CardContent, CardHeader, CardTitle, PageLoader } from '@/components/ui'
import { theaterService } from '@/services/theaterService'
import type { Theater } from '@/types/theater'

export function CinemasPage() {
  const [theaters, setTheaters] = useState<Theater[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    theaterService.getAll()
      .then(setTheaters)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Không thể tải danh sách rạp'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <PageLoader ariaLabel="Đang tải danh sách rạp..." />

  return (
    <div className="mx-auto max-w-6xl space-y-7 px-4 py-8 sm:px-6 lg:px-8">
      <header className="space-y-2 border-b border-[var(--rogym-border-subtle)] pb-5">
        <div className="flex items-center gap-2 text-[var(--rogym-teal)]">
          <Clapperboard className="h-5 w-5" />
          <span className="text-xs font-semibold uppercase tracking-[0.18em]">CinemaNest</span>
        </div>
        <h1 className="font-display text-2xl font-bold uppercase tracking-wide text-white sm:text-3xl">Hệ thống rạp chiếu</h1>
        <p className="text-sm text-[var(--rogym-text-secondary)]">Tìm rạp gần bạn và tận hưởng những bộ phim yêu thích.</p>
      </header>

      {error && (
        <Alert tone="error">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {theaters.length === 0 ? (
        <Card variant="compact" className="p-8 text-center">
          <MapPin className="mx-auto mb-3 h-8 w-8 text-[var(--rogym-text-muted)]" />
          <p className="text-sm text-[var(--rogym-text-secondary)]">Hiện chưa có rạp chiếu nào.</p>
        </Card>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {theaters.map((theater) => (
            <Card key={theater.id} variant="elevated">
              <CardHeader className="flex-row items-start gap-3 space-y-0">
                <div className="rounded-xl bg-[var(--rogym-green)]/10 p-3 text-[var(--rogym-green)]">
                  <MapPin className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <CardTitle className="text-lg text-white">{theater.name}</CardTitle>
                  <p className="mt-2 flex items-start gap-2 text-sm text-[var(--rogym-text-secondary)]">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[var(--rogym-teal)]" />
                    {theater.address}
                  </p>
                  {theater.phone && (
                    <p className="mt-2 flex items-center gap-2 text-sm text-[var(--rogym-text-secondary)]">
                      <Phone className="h-4 w-4 text-[var(--rogym-teal)]" />
                      {theater.phone}
                    </p>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="border-t border-[var(--rogym-border-subtle)] pt-4 text-xs text-[var(--rogym-text-muted)]">
                  Chọn phim để xem suất chiếu tại rạp này.
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default CinemasPage
