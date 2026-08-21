import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Edit, Film, Plus, RefreshCcw, Search, Trash2 } from 'lucide-react'
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Input, Select, Textarea } from '@/components/ui'
import { movieService } from '@/services/movieService'
import type { Movie, MoviePayload, MovieStatus } from '@/types/movie'

const MOVIE_STATUSES: MovieStatus[] = ['COMING_SOON', 'NOW_SHOWING', 'ENDED']

const emptyForm = {
  title: '',
  description: '',
  duration: '',
  director: '',
  castMembers: '',
  language: '',
  ageRating: '',
  releaseDate: '',
  poster: '',
  trailer: '',
  status: 'COMING_SOON' as MovieStatus,
  genreIds: '',
}

type MovieFormState = typeof emptyForm

export function MovieManagementPage() {
  const [movies, setMovies] = useState<Movie[]>([])
  const [form, setForm] = useState<MovieFormState>(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [keyword, setKeyword] = useState('')
  const [statusFilter, setStatusFilter] = useState<MovieStatus | ''>('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const editingMovie = useMemo(
    () => movies.find((movie) => movie.id === editingId) ?? null,
    [movies, editingId]
  )

  const loadMovies = async () => {
    setLoading(true)
    setError(null)
    try {
      setMovies(await movieService.getMovies({ keyword, status: statusFilter }))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải danh sách phim')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadMovies()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const updateField = (field: keyof MovieFormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const resetForm = () => {
    setForm(emptyForm)
    setEditingId(null)
  }

  const startEdit = (movie: Movie) => {
    setEditingId(movie.id)
    setForm({
      title: movie.title,
      description: movie.description ?? '',
      duration: String(movie.duration),
      director: movie.director ?? '',
      castMembers: movie.castMembers ?? '',
      language: movie.language ?? '',
      ageRating: movie.ageRating ?? '',
      releaseDate: movie.releaseDate ?? '',
      poster: movie.poster ?? '',
      trailer: movie.trailer ?? '',
      status: movie.status,
      genreIds: movie.genres.map((genre) => genre.id).join(', '),
    })
  }

  const buildPayload = (): MoviePayload => ({
    title: form.title.trim(),
    description: form.description.trim() || undefined,
    duration: Number(form.duration),
    director: form.director.trim() || undefined,
    castMembers: form.castMembers.trim() || undefined,
    language: form.language.trim() || undefined,
    ageRating: form.ageRating.trim() || undefined,
    releaseDate: form.releaseDate || undefined,
    poster: form.poster.trim() || undefined,
    trailer: form.trailer.trim() || undefined,
    status: form.status,
    genreIds: form.genreIds
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean),
  })

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const payload = buildPayload()
      if (editingId) {
        await movieService.updateMovie(editingId, payload)
      } else {
        await movieService.createMovie(payload)
      }
      resetForm()
      await loadMovies()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể lưu phim')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (movie: Movie) => {
    if (!window.confirm(`Xóa phim "${movie.title}"?`)) return
    setError(null)
    try {
      await movieService.deleteMovie(movie.id)
      await loadMovies()
      if (editingId === movie.id) resetForm()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể xóa phim')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold uppercase tracking-wide text-white">
            <Film className="h-6 w-6 text-[var(--rogym-green)]" />
            Quản lý phim
          </h1>
          <p className="mt-1 text-xs text-[var(--rogym-text-secondary)]">
            CRUD phim, trạng thái công chiếu và thông tin truyền thông.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="Tìm tên, đạo diễn, thể loại"
            leftIcon={<Search className="h-4 w-4" />}
          />
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as MovieStatus | '')}>
            <option value="">Tất cả trạng thái</option>
            {MOVIE_STATUSES.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </Select>
          <Button type="button" variant="secondary" onClick={loadMovies} loading={loading} leftIcon={<RefreshCcw className="h-4 w-4" />}>
            Lọc
          </Button>
        </div>
      </div>

      {error && (
        <Card variant="danger" padding="sm">
          <p className="text-sm text-red-200">{error}</p>
        </Card>
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <Card variant="elevated" className="overflow-hidden">
          <CardHeader>
            <CardTitle>Danh sách phim</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {movies.length === 0 ? (
              <p className="py-10 text-center text-sm text-[var(--rogym-text-muted)]">
                Chưa có phim nào.
              </p>
            ) : (
              movies.map((movie) => (
                <div
                  key={movie.id}
                  className="grid gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4 md:grid-cols-[96px_minmax(0,1fr)_auto]"
                >
                  <div className="flex h-28 w-24 items-center justify-center overflow-hidden rounded-lg bg-white/5">
                    {movie.poster ? (
                      <img src={movie.poster} alt={movie.title} className="h-full w-full object-cover" />
                    ) : (
                      <Film className="h-8 w-8 text-[var(--rogym-text-muted)]" />
                    )}
                  </div>
                  <div className="min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="truncate text-base font-bold text-white">{movie.title}</h2>
                      <Badge tone={movie.status === 'NOW_SHOWING' ? 'success' : movie.status === 'COMING_SOON' ? 'info' : 'muted'} size="sm">
                        {movie.status}
                      </Badge>
                    </div>
                    <p className="line-clamp-2 text-xs text-[var(--rogym-text-secondary)]">
                      {movie.description || 'Chưa có mô tả'}
                    </p>
                    <div className="flex flex-wrap gap-2 text-xs text-[var(--rogym-text-muted)]">
                      <span>{movie.duration} phút</span>
                      {movie.releaseDate && <span>Khởi chiếu: {movie.releaseDate}</span>}
                      {movie.director && <span>Đạo diễn: {movie.director}</span>}
                    </div>
                    {movie.genres.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {movie.genres.map((genre) => (
                          <Badge key={genre.id} tone="outline" size="xs">{genre.name}</Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 md:flex-col">
                    <Button type="button" variant="secondary" size="sm" leftIcon={<Edit className="h-4 w-4" />} onClick={() => startEdit(movie)}>
                      Sửa
                    </Button>
                    <Button type="button" variant="danger" size="sm" leftIcon={<Trash2 className="h-4 w-4" />} onClick={() => void handleDelete(movie)}>
                      Xóa
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card variant="accent">
          <CardHeader>
            <CardTitle>{editingMovie ? `Sửa phim: ${editingMovie.title}` : 'Tạo phim mới'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-3" onSubmit={handleSubmit}>
              <Input value={form.title} onChange={(event) => updateField('title', event.target.value)} placeholder="Tên phim" required />
              <Textarea value={form.description} onChange={(event) => updateField('description', event.target.value)} placeholder="Mô tả" rows={4} />
              <div className="grid grid-cols-2 gap-3">
                <Input value={form.duration} onChange={(event) => updateField('duration', event.target.value)} placeholder="Thời lượng" type="number" min={1} required />
                <Select value={form.status} onValueChange={(value) => updateField('status', value)}>
                  {MOVIE_STATUSES.map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </Select>
              </div>
              <Input value={form.director} onChange={(event) => updateField('director', event.target.value)} placeholder="Đạo diễn" />
              <Textarea value={form.castMembers} onChange={(event) => updateField('castMembers', event.target.value)} placeholder="Diễn viên" rows={2} />
              <div className="grid grid-cols-2 gap-3">
                <Input value={form.language} onChange={(event) => updateField('language', event.target.value)} placeholder="Ngôn ngữ" />
                <Input value={form.ageRating} onChange={(event) => updateField('ageRating', event.target.value)} placeholder="Độ tuổi" />
              </div>
              <Input value={form.releaseDate} onChange={(event) => updateField('releaseDate', event.target.value)} type="date" />
              <Input value={form.poster} onChange={(event) => updateField('poster', event.target.value)} placeholder="URL poster" />
              <Input value={form.trailer} onChange={(event) => updateField('trailer', event.target.value)} placeholder="URL trailer" />
              <Textarea value={form.genreIds} onChange={(event) => updateField('genreIds', event.target.value)} placeholder="Genre UUIDs, phân tách bằng dấu phẩy" rows={2} />
              <div className="flex gap-2 pt-2">
                <Button type="submit" loading={saving} leftIcon={<Plus className="h-4 w-4" />}>
                  {editingId ? 'Cập nhật' : 'Tạo mới'}
                </Button>
                {editingId && (
                  <Button type="button" variant="secondary" onClick={resetForm}>
                    Hủy
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default MovieManagementPage
