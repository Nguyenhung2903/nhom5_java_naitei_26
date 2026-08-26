import { useEffect, useState, useCallback, useMemo, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Film,
  Plus,
  Trash2,
  Settings,
  CheckCircle2,
  Clock,
} from 'lucide-react'
import {
  Alert,
  AlertDescription,
  Badge,
  Button,
  Card,
  Checkbox,
  ConfirmDialog,
  FilterDropdown,
  FormField,
  Input,
  Modal,
  ModalFooter,
  ResponsiveTable,
  SearchToolbar,
  Select,
  Textarea,
  type ColumnDef,
} from '@/components/ui'
import { movieService } from '@/services/movieService'
import type { Genre, Movie, MoviePayload, MovieStatus } from '@/types/movie'

const MOVIE_STATUSES: { value: MovieStatus; label: string }[] = [
  { value: 'NOW_SHOWING', label: 'NOW_SHOWING (Đang chiếu)' },
  { value: 'COMING_SOON', label: 'COMING_SOON (Sắp chiếu)' },
  { value: 'ENDED', label: 'ENDED (Ngừng chiếu)' },
]

const FILTER_STATUS_OPTIONS: { value: MovieStatus | ''; label: string }[] = [
  { value: '', label: 'Mọi trạng thái' },
  { value: 'NOW_SHOWING', label: 'Đang chiếu' },
  { value: 'COMING_SOON', label: 'Sắp chiếu' },
  { value: 'ENDED', label: 'Ngừng chiếu' },
]

interface CreateMovieFormState {
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

const emptyCreateForm: CreateMovieFormState = {
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

export function MovieManagementPage() {
  const navigate = useNavigate()

  const [movies, setMovies] = useState<Movie[]>([])
  const [allGenres, setAllGenres] = useState<Genre[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<MovieStatus | ''>('')
  const [tempStatusFilter, setTempStatusFilter] = useState<MovieStatus | ''>('')
  const [genreFilter, setGenreFilter] = useState<string>('')
  const [tempGenreFilter, setTempGenreFilter] = useState<string>('')
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)

  // Modal Tạo phim mới
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [createForm, setCreateForm] = useState<CreateMovieFormState>(emptyCreateForm)
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  // Modal Xóa phim
  const [deleteTarget, setDeleteTarget] = useState<Movie | null>(null)
  const [deleting, setDeleting] = useState(false)

  const loadMovies = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await movieService.getMovies({
        keyword: searchQuery.trim() || undefined,
        status: statusFilter || undefined,
        genreId: genreFilter || undefined,
      })
      setMovies(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải danh sách phim')
    } finally {
      setLoading(false)
    }
  }, [searchQuery, statusFilter, genreFilter])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadMovies()
    }, 150)
    return () => window.clearTimeout(timer)
  }, [loadMovies])

  useEffect(() => {
    movieService.getGenres().then(setAllGenres).catch(() => {})
  }, [])

  const handleFilterOpenChange = (open: boolean) => {
    if (open) {
      setTempStatusFilter(statusFilter)
      setTempGenreFilter(genreFilter)
    }
    setIsFilterOpen(open)
  }

  const handleApplyFilter = () => {
    setStatusFilter(tempStatusFilter)
    setGenreFilter(tempGenreFilter)
    setIsFilterOpen(false)
  }

  const updateCreateField = (field: keyof Omit<CreateMovieFormState, 'genreIds'>, value: string) => {
    setCreateForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleToggleCreateGenre = (genreId: string) => {
    setCreateForm((prev) => {
      const exists = prev.genreIds.includes(genreId)
      const nextGenreIds = exists
        ? prev.genreIds.filter((id) => id !== genreId)
        : [...prev.genreIds, genreId]
      return { ...prev, genreIds: nextGenreIds }
    })
  }

  const handleOpenCreateModal = () => {
    setCreateForm(emptyCreateForm)
    setCreateError(null)
    setCreateModalOpen(true)
  }

  const handleCreateSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!createForm.title.trim()) {
      setCreateError('Vui lòng nhập tên phim.')
      return
    }
    if (!createForm.duration || Number(createForm.duration) <= 0) {
      setCreateError('Thời lượng phim phải lớn hơn 0 phút.')
      return
    }
    if (createForm.genreIds.length === 0) {
      setCreateError('Vui lòng chọn ít nhất 1 thể loại cho phim.')
      return
    }

    setCreating(true)
    setCreateError(null)
    try {
      const payload: MoviePayload = {
        title: createForm.title.trim(),
        description: createForm.description.trim() || undefined,
        duration: Number(createForm.duration),
        director: createForm.director.trim() || undefined,
        castMembers: createForm.castMembers.trim() || undefined,
        language: createForm.language.trim() || undefined,
        ageRating: createForm.ageRating.trim() || undefined,
        releaseDate: createForm.releaseDate || undefined,
        poster: createForm.poster.trim() || undefined,
        trailer: createForm.trailer.trim() || undefined,
        status: createForm.status,
        genreIds: createForm.genreIds,
      }

      const created = await movieService.createMovie(payload)
      setCreateModalOpen(false)
      setFeedback(`Đã tạo thành công phim "${created.title}"`)
      setTimeout(() => setFeedback(null), 4000)
      await loadMovies()
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Tạo phim mới thất bại')
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    setError(null)
    try {
      await movieService.deleteMovie(deleteTarget.id)
      setDeleteTarget(null)
      setFeedback(`Đã xóa phim "${deleteTarget.title}"`)
      setTimeout(() => setFeedback(null), 4000)
      await loadMovies()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Xóa phim thất bại')
    } finally {
      setDeleting(false)
    }
  }

  const columns: ColumnDef<Movie>[] = useMemo(
    () => [
      {
        key: 'title',
        header: 'Phim & Đạo diễn',
        render: (item) => (
          <div className="flex items-center gap-3 py-1">
            <div className="h-14 w-10 shrink-0 overflow-hidden rounded-md bg-white/5 border border-white/10 flex items-center justify-center">
              {item.poster ? (
                <img src={item.poster} alt={item.title} className="h-full w-full object-cover" />
              ) : (
                <Film className="h-5 w-5 text-[var(--rogym-text-muted)]" />
              )}
            </div>
            <div className="min-w-0">
              <Link
                to={`/admin/movies/${item.id}`}
                className="font-bold text-white hover:text-[var(--rogym-teal)] transition-colors block truncate max-w-xs sm:max-w-sm"
                title={item.title}
              >
                {item.title}
              </Link>
              <p className="text-xs text-[var(--rogym-text-muted)] truncate max-w-xs">
                {item.director ? `Đạo diễn: ${item.director}` : 'Chưa cập nhật đạo diễn'}
              </p>
            </div>
          </div>
        ),
      },
      {
        key: 'genres',
        header: 'Thể loại',
        render: (item) => (
          <div className="flex flex-wrap gap-1 max-w-[200px]">
            {item.genres && item.genres.length > 0 ? (
              item.genres.map((g) => (
                <Badge key={g.id} tone="outline" size="xs">
                  {g.name}
                </Badge>
              ))
            ) : (
              <span className="text-xs text-[var(--rogym-text-muted)]">—</span>
            )}
          </div>
        ),
      },
      {
        key: 'duration',
        header: 'Thời lượng & Độ tuổi',
        render: (item) => (
          <div className="space-y-0.5">
            <div className="flex items-center gap-1 text-xs text-white">
              <Clock className="h-3.5 w-3.5 text-[var(--rogym-teal)]" />
              <span>{item.duration} phút</span>
            </div>
            {item.ageRating && (
              <Badge tone="warning" size="xs">
                {item.ageRating}
              </Badge>
            )}
          </div>
        ),
      },
      {
        key: 'releaseDate',
        header: 'Ngày khởi chiếu',
        render: (item) => (
          <span className="text-xs text-[var(--rogym-text-secondary)]">
            {item.releaseDate ? item.releaseDate.split('T')[0] : '—'}
          </span>
        ),
      },
      {
        key: 'status',
        header: 'Trạng thái',
        render: (item) => (
          <Badge
            tone={
              item.status === 'NOW_SHOWING'
                ? 'success'
                : item.status === 'COMING_SOON'
                ? 'info'
                : 'muted'
            }
            size="sm"
          >
            {item.status === 'NOW_SHOWING'
              ? 'ĐANG CHIẾU'
              : item.status === 'COMING_SOON'
              ? 'SẮP CHIẾU'
              : 'NGỪNG CHIẾU'}
          </Badge>
        ),
      },
      {
        key: 'actions',
        header: 'Hành động',
        render: (item) => (
          <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
            <Button
              variant="secondary"
              size="xs"
              leftIcon={<Settings className="h-3.5 w-3.5" />}
              onClick={() => navigate(`/admin/movies/${item.id}`)}
              title="Xem chi tiết và chỉnh sửa phim"
            >
              Chi tiết & Sửa
            </Button>
            <Button
              variant="danger"
              size="xs"
              leftIcon={<Trash2 className="h-3.5 w-3.5" />}
              onClick={() => setDeleteTarget(item)}
              title="Xóa phim"
            >
              Xóa
            </Button>
          </div>
        ),
      },
    ],
    [navigate]
  )

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="flex items-center gap-2.5 text-2xl font-bold uppercase tracking-wide text-white">
              <Film className="h-6 w-6 text-[var(--rogym-green)]" />
              <span>Quản lý phim</span>
            </h1>
            <Badge tone={movies.length > 0 ? 'accent' : 'muted'} size="sm">
              {movies.length} phim
            </Badge>
          </div>
          <p className="mt-1 text-xs text-[var(--rogym-text-secondary)]">
            Danh mục phim, trạng thái công chiếu và các thông số hiển thị hệ thống.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          leftIcon={<Plus className="h-4 w-4" />}
          onClick={handleOpenCreateModal}
        >
          Thêm phim mới
        </Button>
      </div>

      {/* Alerts */}
      {feedback && (
        <Alert tone="success" icon={<CheckCircle2 className="h-4 w-4" />}>
          <AlertDescription>{feedback}</AlertDescription>
        </Alert>
      )}
      {error && (
        <Alert tone="error">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Toolbar Tìm kiếm & Lọc */}
      <SearchToolbar
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Tìm kiếm theo tên phim, đạo diễn..."
        layout="row"
        filters={
          <FilterDropdown
            open={isFilterOpen}
            onOpenChange={handleFilterOpenChange}
            activeCount={(statusFilter ? 1 : 0) + (genreFilter ? 1 : 0)}
            onApply={handleApplyFilter}
            title="Bộ lọc"
          >
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--rogym-text-secondary)]">
                  Trạng thái
                </label>
                <Select
                  value={tempStatusFilter}
                  onValueChange={(val) => setTempStatusFilter(val as MovieStatus | '')}
                >
                  {FILTER_STATUS_OPTIONS.map((st) => (
                    <option key={st.value} value={st.value}>
                      {st.label}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--rogym-text-secondary)]">
                  Thể loại
                </label>
                <Select
                  value={tempGenreFilter}
                  onValueChange={setTempGenreFilter}
                >
                  <option value="">Mọi thể loại</option>
                  {allGenres.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
          </FilterDropdown>
        }
      />

      {/* Bảng Dữ liệu Phim */}
      <Card variant="elevated" className="overflow-hidden">
        <ResponsiveTable
          data={movies}
          columns={columns}
          keyExtractor={(item) => item.id}
          loading={loading}
          error={error}
          onRetry={() => void loadMovies()}
          emptyTitle="Chưa có dữ liệu phim nào"
          emptyDescription="Không tìm thấy phim phù hợp với bộ lọc hoặc hệ thống chưa có phim nào."
          onRowClick={(item) => navigate(`/admin/movies/${item.id}`)}
        />
      </Card>

      {/* Modal Thêm Phim Mới */}
      <Modal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Thêm phim mới vào hệ thống"
        size="lg"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          {createError && (
            <Alert tone="error">
              <AlertDescription>{createError}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <FormField label="Tên phim" htmlFor="create-title" required>
                <Input
                  id="create-title"
                  value={createForm.title}
                  onChange={(e) => updateCreateField('title', e.target.value)}
                  placeholder="VD: Avatar: Dòng chảy của nước"
                  required
                />
              </FormField>
            </div>
            <div>
              <FormField label="Trạng thái" htmlFor="create-status" required>
                <Select
                  value={createForm.status}
                  onValueChange={(val) => updateCreateField('status', val as MovieStatus)}
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

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <FormField label="Thời lượng (phút)" htmlFor="create-duration" required>
              <Input
                id="create-duration"
                type="number"
                min={1}
                value={createForm.duration}
                onChange={(e) => updateCreateField('duration', e.target.value)}
                placeholder="VD: 120"
                required
              />
            </FormField>
            <FormField label="Ngày khởi chiếu" htmlFor="create-releaseDate">
              <Input
                id="create-releaseDate"
                type="date"
                value={createForm.releaseDate}
                onChange={(e) => updateCreateField('releaseDate', e.target.value)}
              />
            </FormField>
            <FormField label="Độ tuổi" htmlFor="create-ageRating">
              <Input
                id="create-ageRating"
                value={createForm.ageRating}
                onChange={(e) => updateCreateField('ageRating', e.target.value)}
                placeholder="VD: P, 13+, 16+, 18+"
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField label="Đạo diễn" htmlFor="create-director">
              <Input
                id="create-director"
                value={createForm.director}
                onChange={(e) => updateCreateField('director', e.target.value)}
                placeholder="Tên đạo diễn"
              />
            </FormField>
            <FormField label="Ngôn ngữ" htmlFor="create-language">
              <Input
                id="create-language"
                value={createForm.language}
                onChange={(e) => updateCreateField('language', e.target.value)}
                placeholder="VD: Tiếng Việt"
              />
            </FormField>
          </div>

          <FormField label="Diễn viên chính" htmlFor="create-cast">
            <Input
              id="create-cast"
              value={createForm.castMembers}
              onChange={(e) => updateCreateField('castMembers', e.target.value)}
              placeholder="VD: Trấn Thành, Tuấn Trần..."
            />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField label="URL Poster" htmlFor="create-poster">
              <Input
                id="create-poster"
                value={createForm.poster}
                onChange={(e) => updateCreateField('poster', e.target.value)}
                placeholder="https://..."
              />
            </FormField>
            <FormField label="URL Trailer" htmlFor="create-trailer">
              <Input
                id="create-trailer"
                value={createForm.trailer}
                onChange={(e) => updateCreateField('trailer', e.target.value)}
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
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 p-3.5 rounded-xl border border-[var(--rogym-border-subtle)] bg-white/5">
                {allGenres.map((g) => {
                  const isChecked = createForm.genreIds.includes(g.id)
                  return (
                    <Checkbox
                      key={g.id}
                      id={`create-genre-${g.id}`}
                      label={g.name}
                      checked={isChecked}
                      onChange={() => handleToggleCreateGenre(g.id)}
                      checkboxSize="sm"
                    />
                  )
                })}
              </div>
            )}
            {createForm.genreIds.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-2">
                <span className="text-xs text-[var(--rogym-text-muted)]">
                  Đã chọn ({createForm.genreIds.length}):
                </span>
                {allGenres
                  .filter((g) => createForm.genreIds.includes(g.id))
                  .map((g) => (
                    <Badge key={g.id} tone="accent" size="xs">
                      {g.name}
                    </Badge>
                  ))}
              </div>
            )}
          </FormField>

          <FormField label="Mô tả tóm tắt" htmlFor="create-desc">
            <Textarea
              id="create-desc"
              rows={3}
              value={createForm.description}
              onChange={(e) => updateCreateField('description', e.target.value)}
              placeholder="Mô tả tóm tắt nội dung phim..."
            />
          </FormField>

          <ModalFooter>
            <Button
              variant="secondary"
              type="button"
              onClick={() => setCreateModalOpen(false)}
            >
              Hủy
            </Button>
            <Button variant="primary" type="submit" loading={creating}>
              Tạo phim
            </Button>
          </ModalFooter>
        </form>
      </Modal>

      {/* Modal Xác nhận Xóa */}
      <ConfirmDialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => void handleDelete()}
        title="Xác nhận xóa phim"
        description={`Bạn có chắc chắn muốn xóa phim "${deleteTarget?.title}" khỏi hệ thống? Thao tác này không thể hoàn tác.`}
        variant="danger"
        confirmLabel="Xóa phim"
        cancelLabel="Hủy"
        loading={deleting}
      />
    </div>
  )
}

export default MovieManagementPage
