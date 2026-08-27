import { useEffect, useState, useCallback, useMemo, type FormEvent } from 'react'
import {
  Tags,
  Plus,
  Edit2,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Film,
  RefreshCcw,
  Sparkles,
} from 'lucide-react'
import {
  Alert,
  AlertDescription,
  Badge,
  Button,
  Card,
  ConfirmDialog,
  FormField,
  Input,
  Modal,
  ModalFooter,
  ResponsiveTable,
  SearchToolbar,
  Textarea,
  type ColumnDef,
} from '@/components/ui'
import { genreService } from '@/services/genreService'
import type { Genre, GenrePayload } from '@/types/genre'

interface GenreFormState {
  name: string
  description: string
}

const emptyGenreForm: GenreFormState = {
  name: '',
  description: '',
}

export function GenreManagementPage() {
  const [genres, setGenres] = useState<Genre[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)

  // Modal Tạo mới Thể loại
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [createForm, setCreateForm] = useState<GenreFormState>(emptyGenreForm)
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  // Modal Chỉnh sửa Thể loại
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Genre | null>(null)
  const [editForm, setEditForm] = useState<GenreFormState>(emptyGenreForm)
  const [updating, setUpdating] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)

  // Modal Xóa Thể loại
  const [deleteTarget, setDeleteTarget] = useState<Genre | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Load danh sách thể loại
  const fetchGenres = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await genreService.getGenres(searchQuery)
      setGenres(data)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể tải danh sách thể loại'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [searchQuery])

  useEffect(() => {
    fetchGenres()
  }, [fetchGenres])

  // Xử lý tạo mới thể loại
  const handleCreateSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!createForm.name.trim()) {
      setCreateError('Tên thể loại không được để trống')
      return
    }

    setCreating(true)
    setCreateError(null)

    try {
      const payload: GenrePayload = {
        name: createForm.name.trim(),
        description: createForm.description.trim() || null,
      }
      await genreService.createGenre(payload)
      setCreateModalOpen(false)
      setCreateForm(emptyGenreForm)
      setFeedback('Tạo thể loại phim mới thành công!')
      fetchGenres()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Tạo thể loại thất bại'
      setCreateError(msg)
    } finally {
      setCreating(false)
    }
  }

  // Mở modal chỉnh sửa
  const openEditModal = (genre: Genre) => {
    setEditTarget(genre)
    setEditForm({
      name: genre.name,
      description: genre.description || '',
    })
    setEditError(null)
    setEditModalOpen(true)
  }

  // Xử lý cập nhật thể loại
  const handleEditSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!editTarget) return

    if (!editForm.name.trim()) {
      setEditError('Tên thể loại không được để trống')
      return
    }

    setUpdating(true)
    setEditError(null)

    try {
      const payload: GenrePayload = {
        name: editForm.name.trim(),
        description: editForm.description.trim() || null,
      }
      await genreService.updateGenre(editTarget.id, payload)
      setEditModalOpen(false)
      setEditTarget(null)
      setEditForm(emptyGenreForm)
      setFeedback('Cập nhật thông tin thể loại thành công!')
      fetchGenres()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Cập nhật thể loại thất bại'
      setEditError(msg)
    } finally {
      setUpdating(false)
    }
  }

  // Xử lý xóa thể loại
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return

    if ((deleteTarget.movieCount ?? 0) > 0) {
      setError(`Không thể xóa thể loại "${deleteTarget.name}" vì đang có ${deleteTarget.movieCount} bộ phim liên kết. Vui lòng gỡ thể loại khỏi các phim trước.`)
      setDeleteTarget(null)
      return
    }

    setDeleting(true)
    try {
      await genreService.deleteGenre(deleteTarget.id)
      setDeleteTarget(null)
      setFeedback(`Đã xóa thể loại "${deleteTarget.name}" thành công!`)
      fetchGenres()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Xóa thể loại thất bại'
      setError(msg)
      setDeleteTarget(null)
    } finally {
      setDeleting(false)
    }
  }

  // Cấu hình bảng hiển thị (Bỏ binding ID, Thêm binding Description)
  const columns = useMemo<ColumnDef<Genre>[]>(
    () => [
      {
        key: 'name',
        header: 'Tên thể loại',
        render: (genre) => (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[var(--rogym-green)]/15 border border-[var(--rogym-green)]/30 flex items-center justify-center text-[var(--rogym-green)] shrink-0">
              <Tags className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-white text-sm">{genre.name}</p>
            </div>
          </div>
        ),
      },
      {
        key: 'description',
        header: 'Mô tả chi tiết',
        render: (genre) => (
          <p className="text-xs text-[var(--rogym-text-secondary)] line-clamp-2 max-w-md">
            {genre.description || <span className="italic text-[var(--rogym-text-muted)]">Chưa có mô tả</span>}
          </p>
        ),
      },
      {
        key: 'movieCount',
        header: 'Phim liên kết',
        render: (genre) => {
          const count = genre.movieCount ?? 0
          return (
            <div className="flex items-center gap-1.5">
              <Film className="w-3.5 h-3.5 text-[var(--rogym-text-muted)]" />
              <Badge tone={count > 0 ? 'accent' : 'muted'} size="sm">
                {count} phim
              </Badge>
            </div>
          )
        },
      },
      {
        key: 'actions',
        header: 'Thao tác',
        className: 'text-right',
        render: (genre) => {
          const hasMovies = (genre.movieCount ?? 0) > 0
          return (
            <div className="flex items-center justify-end gap-1">
              <Button
                variant="text"
                size="sm"
                onClick={() => openEditModal(genre)}
                className="hover:text-[var(--rogym-green)] text-[var(--rogym-text-secondary)]"
                title="Chỉnh sửa thông tin thể loại"
              >
                <Edit2 className="w-4 h-4" />
              </Button>
              <Button
                variant="text"
                size="sm"
                onClick={() => setDeleteTarget(genre)}
                className={hasMovies ? 'hover:text-amber-400 opacity-80' : 'hover:text-red-400'}
                title={
                  hasMovies
                    ? `Không thể xóa: Có ${genre.movieCount} phim đang gán thể loại này`
                    : 'Xóa thể loại này'
                }
              >
                <Trash2 className={`w-4 h-4 ${hasMovies ? 'text-zinc-500 hover:text-amber-400' : 'text-red-400/80 hover:text-red-400'}`} />
              </Button>
            </div>
          )
        },
      },
    ],
    []
  )

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[var(--rogym-green)]/15 border border-[var(--rogym-green)]/30 text-[var(--rogym-green)]">
              <Tags className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-display text-white">Quản lý Thể loại phim</h1>
              <p className="text-xs text-[var(--rogym-text-muted)]">
                Quản lý các thể loại phim và mô tả chi tiết được phân loại trong hệ thống CinemaNest
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => fetchGenres()}
            disabled={loading}
            className="flex items-center gap-1.5"
          >
            <RefreshCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Làm mới</span>
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setCreateForm(emptyGenreForm)
              setCreateError(null)
              setCreateModalOpen(true)
            }}
            className="flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm thể loại</span>
          </Button>
        </div>
      </div>

      {/* Feedback Messages */}
      {feedback && (
        <Alert tone="success" variant="subtle" className="animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <AlertDescription className="flex items-center justify-between w-full">
            <span>{feedback}</span>
            <button
              onClick={() => setFeedback(null)}
              className="text-xs underline hover:text-white ml-4 cursor-pointer"
            >
              Đóng
            </button>
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert tone="error" variant="subtle" className="animate-fade-in">
          <AlertCircle className="w-4 h-4 text-red-400" />
          <AlertDescription className="flex items-center justify-between w-full">
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="text-xs underline hover:text-white ml-4 cursor-pointer"
            >
              Đóng
            </button>
          </AlertDescription>
        </Alert>
      )}

      {/* Search Toolbar */}
      <Card className="p-4 bg-[var(--rogym-bg-surface)] border-[var(--rogym-border-subtle)]">
        <SearchToolbar
          value={searchQuery}
          onChange={(val) => setSearchQuery(val)}
          placeholder="Tìm kiếm theo tên thể loại hoặc mô tả..."
        />
      </Card>

      {/* Genres Table */}
      <Card className="overflow-hidden bg-[var(--rogym-bg-surface)] border-[var(--rogym-border-subtle)]">
        <ResponsiveTable
          columns={columns}
          data={genres}
          keyExtractor={(item) => item.id}
          loading={loading}
          emptyTitle={
            searchQuery
              ? `Không tìm thấy thể loại nào phù hợp với từ khóa "${searchQuery}"`
              : 'Chưa có thể loại phim nào trong hệ thống'
          }
        />
      </Card>

      {/* Modal Thêm Thể loại Mới */}
      <Modal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Thêm thể loại phim mới"
        size="md"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          {createError && (
            <Alert tone="error" variant="subtle">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <AlertDescription>{createError}</AlertDescription>
            </Alert>
          )}

          <FormField label="Tên thể loại" required>
            <Input
              value={createForm.name}
              onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
              placeholder="VD: Hành Động, Khoa Học Viễn Tưởng..."
              autoFocus
              maxLength={100}
              required
            />
          </FormField>

          <FormField label="Mô tả chi tiết" hint="Mô tả tóm tắt nội dung đặc trưng của thể loại này">
            <Textarea
              value={createForm.description}
              onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
              placeholder="VD: Phim có tiết tấu nhanh, nhiều pha rượt đuổi và võ thuật kịch tính..."
              rows={3}
              maxLength={500}
            />
          </FormField>

          <ModalFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setCreateModalOpen(false)}
              disabled={creating}
            >
              Hủy
            </Button>
            <Button type="submit" variant="primary" loading={creating}>
              Tạo thể loại
            </Button>
          </ModalFooter>
        </form>
      </Modal>

      {/* Modal Chỉnh sửa Thể loại */}
      <Modal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Chỉnh sửa thể loại phim"
        size="md"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          {editError && (
            <Alert tone="error" variant="subtle">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <AlertDescription>{editError}</AlertDescription>
            </Alert>
          )}

          {editTarget && (editTarget.movieCount ?? 0) > 0 && (
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-start gap-2">
              <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                Thể loại này đang được gắn cho <strong>{editTarget.movieCount} bộ phim</strong>. Cập nhật thông tin sẽ tự động phản ánh chính xác trên tất cả các bộ phim liên quan.
              </span>
            </div>
          )}

          <FormField label="Tên thể loại" required>
            <Input
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              placeholder="Tên thể loại"
              maxLength={100}
              required
            />
          </FormField>

          <FormField label="Mô tả chi tiết" hint="Mô tả tóm tắt nội dung đặc trưng của thể loại này">
            <Textarea
              value={editForm.description}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              placeholder="Mô tả chi tiết thể loại..."
              rows={3}
              maxLength={500}
            />
          </FormField>

          <ModalFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setEditModalOpen(false)}
              disabled={updating}
            >
              Hủy
            </Button>
            <Button type="submit" variant="primary" loading={updating}>
              Lưu thay đổi
            </Button>
          </ModalFooter>
        </form>
      </Modal>

      {/* Confirm Dialog Xóa Thể loại */}
      <ConfirmDialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title={`Xác nhận xóa thể loại "${deleteTarget?.name}"?`}
        description={
          deleteTarget && (deleteTarget.movieCount ?? 0) > 0
            ? `CẢNH BÁO: Thể loại này hiện đang được liên kết với ${deleteTarget.movieCount} bộ phim trong hệ thống. Bạn KHÔNG THỂ XÓA thể loại này cho đến khi đã gỡ bỏ thể loại khỏi toàn bộ các bộ phim đang liên kết.`
            : `Bạn có chắc chắn muốn xóa thể loại "${deleteTarget?.name}" khỏi hệ thống? Hành động này không thể hoàn tác.`
        }
        confirmLabel={(deleteTarget?.movieCount ?? 0) > 0 ? 'Đã hiểu' : 'Xóa thể loại'}
        cancelLabel="Đóng"
        variant="danger"
        loading={deleting}
      />
    </div>
  )
}

export default GenreManagementPage
