import { useEffect, useState, useCallback, useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft,
  Film,
  Save,
  Trash2,
  CalendarDays,
  Image as ImageIcon,
  FileText,
  CheckCircle2,
  Clock,
  Sparkles,
  ExternalLink,
  RotateCcw,
  TrendingUp,
} from 'lucide-react'
import {
  Alert,
  AlertDescription,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Checkbox,
  ConfirmDialog,
  FormField,
  Input,
  PageLoader,
  ResponsiveTable,
  Select,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
  type ColumnDef,
} from '@/components/ui'
import { movieService } from '@/services/movieService'
import { showtimeService } from '@/services/showtimeService'
import type { Genre, Movie, MoviePayload, MovieStatus } from '@/types/movie'
import type { Showtime } from '@/types/showtime'
import { SHOWTIME_STATUS_CONFIG } from '@/types/showtime'

const MOVIE_STATUSES: { value: MovieStatus; label: string }[] = [
  { value: 'NOW_SHOWING', label: 'NOW_SHOWING (Đang chiếu)' },
  { value: 'COMING_SOON', label: 'COMING_SOON (Sắp chiếu)' },
  { value: 'ENDED', label: 'ENDED (Ngừng chiếu)' },
]

interface MovieFormState {
  title: string
  description: string
  duration: string
  director: string
  castMembers: string
  language: string
  ageRating: string
  releaseDate: string
  poster: string
  trailer: string
  status: MovieStatus
  genreIds: string[]
}

const emptyFormState: MovieFormState = {
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
  status: 'NOW_SHOWING',
  genreIds: [],
}

/**
 * Trích xuất YouTube Embed URL an toàn từ nhiều định dạng URL khác nhau
 */
function getYouTubeEmbedUrl(url?: string): string | null {
  if (!url) return null
  const trimmed = url.trim()
  try {
    // Regex hỗ trợ: youtube.com/watch?v=ID, youtu.be/ID, youtube.com/embed/ID, youtube.com/v/ID
    const match = trimmed.match(
      /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/
    )
    if (match && match[1]) {
      return `https://www.youtube-nocookie.com/embed/${match[1]}?autoplay=0&rel=0`
    }
  } catch {
    return null
  }
  return null
}

export function MovieDetailManagementPage() {
  const { movieId } = useParams<{ movieId: string }>()
  const navigate = useNavigate()

  const [movie, setMovie] = useState<Movie | null>(null)
  const [allGenres, setAllGenres] = useState<Genre[]>([])
  const [showtimes, setShowtimes] = useState<Showtime[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('info')

  const [form, setForm] = useState<MovieFormState>(emptyFormState)

  const populateFormFromMovie = useCallback((data: Movie) => {
    setForm({
      title: data.title || '',
      description: data.description || '',
      duration: data.duration ? String(data.duration) : '',
      director: data.director || '',
      castMembers: data.castMembers || '',
      language: data.language || '',
      ageRating: data.ageRating || '',
      releaseDate: data.releaseDate ? data.releaseDate.split('T')[0] : '',
      poster: data.poster || '',
      trailer: data.trailer || '',
      status: data.status || 'NOW_SHOWING',
      genreIds: data.genres ? data.genres.map((g) => g.id) : [],
    })
  }, [])

  const loadData = useCallback(async () => {
    if (!movieId) return
    setLoading(true)
    setError(null)
    try {
      const [movieData, allShowtimes, genresData] = await Promise.all([
        movieService.getMovieById(movieId),
        showtimeService.getAll().catch(() => [] as Showtime[]),
        movieService.getGenres().catch(() => [] as Genre[]),
      ])
      setMovie(movieData)
      setAllGenres(genresData)
      populateFormFromMovie(movieData)
      setShowtimes(allShowtimes.filter((s) => s.movieId === movieId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải dữ liệu chi tiết phim')
    } finally {
      setLoading(false)
    }
  }, [movieId, populateFormFromMovie])

  useEffect(() => {
    void loadData()
  }, [loadData])

  const updateField = (field: keyof Omit<MovieFormState, 'genreIds'>, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleToggleGenre = (genreId: string) => {
    setForm((prev) => {
      const exists = prev.genreIds.includes(genreId)
      const nextGenreIds = exists
        ? prev.genreIds.filter((id) => id !== genreId)
        : [...prev.genreIds, genreId]
      return { ...prev, genreIds: nextGenreIds }
    })
  }

  const handleResetForm = () => {
    if (movie) {
      populateFormFromMovie(movie)
      setSuccessMsg(null)
      setError(null)
    }
  }

  const buildPayload = (): MoviePayload => {
    return {
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      duration: Number(form.duration) || 0,
      director: form.director.trim() || undefined,
      castMembers: form.castMembers.trim() || undefined,
      language: form.language.trim() || undefined,
      ageRating: form.ageRating.trim() || undefined,
      releaseDate: form.releaseDate || undefined,
      poster: form.poster.trim() || undefined,
      trailer: form.trailer.trim() || undefined,
      status: form.status,
      genreIds: form.genreIds,
    }
  }

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!movieId) return

    if (!form.title.trim()) {
      setError('Vui lòng nhập tên phim.')
      return
    }

    if (!form.duration || Number(form.duration) <= 0) {
      setError('Thời lượng phim phải lớn hơn 0 phút.')
      return
    }

    if (form.genreIds.length === 0) {
      setError('Vui lòng chọn ít nhất 1 thể loại cho phim.')
      return
    }

    setSaving(true)
    setError(null)
    setSuccessMsg(null)

    try {
      const payload = buildPayload()
      const updated = await movieService.updateMovie(movieId, payload)
      setMovie(updated)
      populateFormFromMovie(updated)
      setSuccessMsg('Đã lưu thông tin phim thành công!')
      setTimeout(() => setSuccessMsg(null), 4000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Cập nhật phim thất bại')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!movieId) return
    setDeleting(true)
    setError(null)
    try {
      await movieService.deleteMovie(movieId)
      navigate('/admin/movies', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể xóa phim này')
      setShowDeleteConfirm(false)
      setDeleting(false)
    }
  }

  // Cột cho bảng Suất chiếu (Tab 3)
  const showtimeColumns: ColumnDef<Showtime>[] = useMemo(
    () => [
      {
        key: 'theaterName',
        header: 'Cụm rạp',
        render: (item) => (
          <span className="font-semibold text-white">{item.theaterName || 'N/A'}</span>
        ),
      },
      {
        key: 'roomName',
        header: 'Phòng chiếu',
        render: (item) => (
          <Badge tone="outline" size="sm">
            {item.roomName || 'N/A'}
          </Badge>
        ),
      },
      {
        key: 'startTime',
        header: 'Bắt đầu',
        render: (item) => (
          <span className="text-xs text-[var(--rogym-text-primary)]">
            {item.startTime ? new Date(item.startTime).toLocaleString('vi-VN') : 'N/A'}
          </span>
        ),
      },
      {
        key: 'endTime',
        header: 'Kết thúc',
        render: (item) => (
          <span className="text-xs text-[var(--rogym-text-secondary)]">
            {item.endTime ? new Date(item.endTime).toLocaleString('vi-VN') : 'N/A'}
          </span>
        ),
      },
      {
        key: 'status',
        header: 'Trạng thái',
        render: (item) => {
          const config = SHOWTIME_STATUS_CONFIG[item.status] || {
            label: item.status,
            tone: 'muted' as const,
          }
          return (
            <Badge tone={config.tone} size="sm">
              {config.label}
            </Badge>
          )
        },
      },
    ],
    []
  )

  const youtubeEmbedUrl = useMemo(() => getYouTubeEmbedUrl(form.trailer), [form.trailer])

  if (loading && !movie) {
    return <PageLoader ariaLabel="Đang tải thông tin chi tiết phim..." />
  }

  if (!movie && !loading) {
    return (
      <div className="max-w-3xl mx-auto py-16 px-4 text-center space-y-4">
        <p className="text-red-400 font-semibold">{error || 'Không tìm thấy bộ phim yêu cầu'}</p>
        <Button variant="primary" onClick={() => navigate('/admin/movies')}>
          Quay lại danh sách phim
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header & Breadcrumb Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--rogym-border-subtle)] pb-4">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/movies"
            className="p-2 rounded-xl bg-[var(--rogym-bg-card)] border border-[var(--rogym-border-subtle)] text-[var(--rogym-text-muted)] hover:text-white hover:border-[var(--rogym-teal)] transition-all"
            title="Quay lại danh sách phim"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2 text-xs text-[var(--rogym-text-muted)]">
              <Link to="/admin/movies" className="hover:underline">
                Quản lý phim
              </Link>
              <span>/</span>
              <span className="text-white font-medium truncate max-w-xs">{movie?.title}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold uppercase tracking-wide text-white mt-0.5 flex items-center gap-2.5">
              <Film className="w-6 h-6 text-[var(--rogym-green)]" />
              <span className="truncate">{movie?.title}</span>
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link to={`/admin/revenue?movieId=${movieId}`}>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              leftIcon={<TrendingUp className="w-4 h-4 text-[var(--rogym-green)]" />}
            >
              Doanh thu phim
            </Button>
          </Link>
          <Button
            type="button"
            variant="danger"
            size="sm"
            leftIcon={<Trash2 className="w-4 h-4" />}
            onClick={() => setShowDeleteConfirm(true)}
          >
            Xóa phim
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            leftIcon={<Save className="w-4 h-4" />}
            loading={saving}
            onClick={() => void handleSave()}
          >
            Lưu thay đổi
          </Button>
        </div>
      </div>

      {/* Thông báo Feedback */}
      {error && (
        <Alert tone="error">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {successMsg && (
        <Alert tone="success" icon={<CheckCircle2 className="w-4 h-4" />}>
          <AlertDescription>{successMsg}</AlertDescription>
        </Alert>
      )}

      {/* Banner Tóm tắt Nhanh */}
      <Card variant="glass" className="p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="h-20 w-16 shrink-0 rounded-lg overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center">
            {form.poster ? (
              <img src={form.poster} alt={form.title} className="h-full w-full object-cover" />
            ) : (
              <Film className="w-6 h-6 text-[var(--rogym-text-muted)]" />
            )}
          </div>
          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-bold text-white truncate">{form.title || 'Chưa đặt tên'}</h2>
              <Badge
                tone={
                  form.status === 'NOW_SHOWING'
                    ? 'success'
                    : form.status === 'COMING_SOON'
                    ? 'info'
                    : 'muted'
                }
                size="sm"
              >
                {form.status === 'NOW_SHOWING'
                  ? 'ĐANG CHIẾU'
                  : form.status === 'COMING_SOON'
                  ? 'SẮP CHIẾU'
                  : 'NGỪNG CHIẾU'}
              </Badge>
              {form.ageRating && (
                <Badge tone="warning" size="sm">
                  {form.ageRating}
                </Badge>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--rogym-text-secondary)]">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[var(--rogym-teal)]" />
                {form.duration || 0} phút
              </span>
              {form.director && <span>Đạo diễn: {form.director}</span>}
              {form.releaseDate && <span>Khởi chiếu: {form.releaseDate}</span>}
              <span className="flex items-center gap-1">
                <CalendarDays className="w-3.5 h-3.5 text-purple-400" />
                {showtimes.length} suất chiếu
              </span>
            </div>
            {movie && movie.genres && movie.genres.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {movie.genres.map((g) => (
                  <Badge key={g.id} tone="outline" size="xs">
                    {g.name}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Tab Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} variant="pills" size="md">
        <TabsList className="mb-6">
          <TabsTrigger value="info" leftIcon={<FileText className="w-4 h-4" />}>
            Thông tin & Chỉnh sửa
          </TabsTrigger>
          <TabsTrigger value="media" leftIcon={<ImageIcon className="w-4 h-4" />}>
            Xem trước Media (Poster/Trailer)
          </TabsTrigger>
          <TabsTrigger
            value="showtimes"
            leftIcon={<CalendarDays className="w-4 h-4" />}
            badge={showtimes.length}
          >
            Lịch chiếu của phim
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: THÔNG TIN & FORM CHỈNH SỬA */}
        <TabsContent value="info">
          <form onSubmit={handleSave} className="space-y-6">
            <Card variant="elevated">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[var(--rogym-teal)]" />
                  Thông tin Chi tiết Phim
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <FormField label="Tên phim" htmlFor="movie-title" required>
                      <Input
                        id="movie-title"
                        value={form.title}
                        onChange={(e) => updateField('title', e.target.value)}
                        placeholder="Nhập tên phim"
                        required
                      />
                    </FormField>
                  </div>
                  <div>
                    <FormField label="Trạng thái công chiếu" htmlFor="movie-status" required>
                      <Select
                        value={form.status}
                        onValueChange={(val) => updateField('status', val as MovieStatus)}
                        required
                      >
                        {MOVIE_STATUSES.map((st) => (
                          <option key={st.value} value={st.value}>
                            {st.label}
                          </option>
                        ))}
                      </Select>
                    </FormField>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <FormField label="Thời lượng (phút)" htmlFor="movie-duration" required>
                    <Input
                      id="movie-duration"
                      type="number"
                      min={1}
                      value={form.duration}
                      onChange={(e) => updateField('duration', e.target.value)}
                      placeholder="VD: 120"
                      required
                    />
                  </FormField>
                  <FormField label="Ngày khởi chiếu" htmlFor="movie-releaseDate">
                    <Input
                      id="movie-releaseDate"
                      type="date"
                      value={form.releaseDate}
                      onChange={(e) => updateField('releaseDate', e.target.value)}
                    />
                  </FormField>
                  <FormField label="Phân loại độ tuổi" htmlFor="movie-ageRating">
                    <Input
                      id="movie-ageRating"
                      value={form.ageRating}
                      onChange={(e) => updateField('ageRating', e.target.value)}
                      placeholder="VD: P, 13+, 16+, 18+"
                    />
                  </FormField>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="Đạo diễn" htmlFor="movie-director">
                    <Input
                      id="movie-director"
                      value={form.director}
                      onChange={(e) => updateField('director', e.target.value)}
                      placeholder="Tên đạo diễn"
                    />
                  </FormField>
                  <FormField label="Ngôn ngữ" htmlFor="movie-language">
                    <Input
                      id="movie-language"
                      value={form.language}
                      onChange={(e) => updateField('language', e.target.value)}
                      placeholder="VD: Tiếng Việt, Phụ đề Tiếng Anh"
                    />
                  </FormField>
                </div>

                <FormField label="Diễn viên chính" htmlFor="movie-cast">
                  <Textarea
                    id="movie-cast"
                    rows={2}
                    value={form.castMembers}
                    onChange={(e) => updateField('castMembers', e.target.value)}
                    placeholder="Danh sách diễn viên, phân cách bằng dấu phẩy"
                  />
                </FormField>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="URL Poster hình ảnh" htmlFor="movie-poster">
                    <Input
                      id="movie-poster"
                      value={form.poster}
                      onChange={(e) => updateField('poster', e.target.value)}
                      placeholder="https://..."
                    />
                  </FormField>
                  <FormField label="URL Trailer video (YouTube/MP4)" htmlFor="movie-trailer">
                    <Input
                      id="movie-trailer"
                      value={form.trailer}
                      onChange={(e) => updateField('trailer', e.target.value)}
                      placeholder="https://www.youtube.com/watch?v=..."
                    />
                  </FormField>
                </div>

                <FormField
                  label="Thể loại phim"
                  required
                  hint="Chọn 1 hoặc nhiều thể loại phù hợp với nội dung phim"
                >
                  {allGenres.length === 0 ? (
                    <div className="p-3 text-xs text-[var(--rogym-text-muted)] italic">
                      Đang tải danh sách thể loại...
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 p-3.5 rounded-xl border border-[var(--rogym-border-subtle)] bg-white/5">
                      {allGenres.map((g) => {
                        const isChecked = form.genreIds.includes(g.id)
                        return (
                          <Checkbox
                            key={g.id}
                            id={`detail-genre-${g.id}`}
                            label={g.name}
                            checked={isChecked}
                            onChange={() => handleToggleGenre(g.id)}
                            checkboxSize="sm"
                          />
                        )
                      })}
                    </div>
                  )}
                  {form.genreIds.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-2">
                      <span className="text-xs text-[var(--rogym-text-muted)]">
                        Đã chọn ({form.genreIds.length}):
                      </span>
                      {allGenres
                        .filter((g) => form.genreIds.includes(g.id))
                        .map((g) => (
                          <Badge key={g.id} tone="accent" size="xs">
                            {g.name}
                          </Badge>
                        ))}
                    </div>
                  )}
                </FormField>

                <FormField label="Mô tả tóm tắt nội dung phim" htmlFor="movie-desc">
                  <Textarea
                    id="movie-desc"
                    rows={4}
                    value={form.description}
                    onChange={(e) => updateField('description', e.target.value)}
                    placeholder="Nhập mô tả tóm tắt nội dung phim..."
                  />
                </FormField>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleResetForm}
                    leftIcon={<RotateCcw className="w-4 h-4" />}
                  >
                    Khôi phục ban đầu
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    loading={saving}
                    leftIcon={<Save className="w-4 h-4" />}
                  >
                    Lưu thay đổi
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        </TabsContent>

        {/* TAB 2: XEM TRƯỚC MEDIA (POSTER & TRAILER) */}
        <TabsContent value="media">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Cột trái: Poster Preview */}
            <div className="lg:col-span-5 space-y-4">
              <Card variant="elevated">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-[var(--rogym-teal)]" />
                    Poster Phim
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="aspect-[2/3] w-full max-w-sm mx-auto rounded-2xl overflow-hidden bg-black/40 border border-white/10 shadow-2xl flex items-center justify-center relative group">
                    {form.poster ? (
                      <img
                        src={form.poster}
                        alt={form.title}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          ;(e.currentTarget as HTMLImageElement).src = ''
                        }}
                      />
                    ) : (
                      <div className="text-center p-6 space-y-2">
                        <ImageIcon className="w-12 h-12 text-[var(--rogym-text-muted)] mx-auto" />
                        <p className="text-xs text-[var(--rogym-text-muted)]">Chưa có ảnh poster</p>
                      </div>
                    )}
                  </div>
                  {form.poster && (
                    <div className="flex justify-center">
                      <a
                        href={form.poster}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-[var(--rogym-teal)] hover:underline inline-flex items-center gap-1"
                      >
                        <span>Mở ảnh gốc trong tab mới</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Cột phải: Trailer Player Preview */}
            <div className="lg:col-span-7 space-y-4">
              <Card variant="elevated">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Film className="w-4 h-4 text-purple-400" />
                    Trailer Phim
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {youtubeEmbedUrl ? (
                    <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black/60 border border-white/10 shadow-2xl">
                      <iframe
                        src={youtubeEmbedUrl}
                        title={`Trailer: ${form.title}`}
                        className="w-full h-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  ) : form.trailer ? (
                    <div className="p-8 text-center rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
                      <Film className="w-10 h-10 text-purple-400 mx-auto" />
                      <p className="text-sm font-semibold text-white">Trailer URL:</p>
                      <a
                        href={form.trailer}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-[var(--rogym-teal)] break-all hover:underline inline-flex items-center gap-1.5"
                      >
                        <span>{form.trailer}</span>
                        <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                      </a>
                    </div>
                  ) : (
                    <div className="aspect-video w-full rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col items-center justify-center p-6 text-center space-y-2">
                      <Film className="w-12 h-12 text-[var(--rogym-text-muted)]" />
                      <p className="text-sm text-[var(--rogym-text-muted)]">Chưa có liên kết Trailer</p>
                      <p className="text-xs text-[var(--rogym-text-muted)]">
                        Bạn có thể bổ sung đường dẫn YouTube trong tab Thông tin.
                      </p>
                    </div>
                  )}

                  <div className="p-3.5 rounded-xl bg-[var(--rogym-bg-elevated)] border border-white/5 text-xs text-[var(--rogym-text-secondary)] space-y-1">
                    <p className="font-semibold text-white">💡 Hướng dẫn nhúng Trailer:</p>
                    <p>• Hỗ trợ link YouTube: https://www.youtube.com/watch?v=... hoặc https://youtu.be/...</p>
                    <p>• Hệ thống sẽ tự động phát hiện mã video và nhúng trình phát chất lượng cao.</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* TAB 3: LỊCH CHIẾU CỦA PHIM */}
        <TabsContent value="showtimes">
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-[var(--rogym-green)]" />
                  Danh sách Suất Chiếu của "{movie?.title}"
                </h3>
                <p className="text-xs text-[var(--rogym-text-secondary)] mt-0.5">
                  Tổng cộng có {showtimes.length} suất chiếu được thiết lập cho phim này.
                </p>
              </div>
              <Link to="/admin/showtimes">
                <Button variant="secondary" size="sm" leftIcon={<ExternalLink className="w-4 h-4" />}>
                  Quản lý Suất Chiếu Hệ Thống
                </Button>
              </Link>
            </div>

            <Card variant="elevated" className="overflow-hidden">
              <ResponsiveTable
                data={showtimes}
                columns={showtimeColumns}
                keyExtractor={(item) => item.id}
                emptyTitle="Chưa có suất chiếu nào cho bộ phim này"
                emptyDescription="Bạn có thể tạo thêm suất chiếu cho phim này trong mục Quản lý Suất chiếu."
              />
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Modal Xác nhận Xóa */}
      <ConfirmDialog
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={() => void handleDelete()}
        title="Xác nhận xóa phim"
        description={`Bạn có chắc chắn muốn xóa bộ phim "${movie?.title}" khỏi hệ thống? Hành động này không thể hoàn tác.`}
        variant="danger"
        confirmLabel="Xác nhận xóa"
        cancelLabel="Hủy bỏ"
        loading={deleting}
      />
    </div>
  )
}

export default MovieDetailManagementPage
