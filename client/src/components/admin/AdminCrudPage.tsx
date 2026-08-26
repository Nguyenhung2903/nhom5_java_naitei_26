import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { Alert, AlertDescription, Button, Card, ConfirmDialog, Modal, ModalFooter, ResponsiveTable, SearchInput, type ButtonVariant } from '@/components/ui'
import type { ColumnDef } from '@/components/ui/ResponsiveTable'
import { CheckCircle2, Edit, Plus, Trash2 } from 'lucide-react'

interface CrudService<T, TForm> {
  getAll: () => Promise<T[]>
  create: (payload: TForm) => Promise<T>
  update: (id: string, payload: TForm) => Promise<T>
  delete: (id: string) => Promise<void>
}

interface AdminCrudPageProps<T extends { id: string }, TForm> {
  title: string
  subtitle: string
  icon: ReactNode
  addLabel: string
  editLabel: string
  columns: ColumnDef<T>[]
  service: CrudService<T, TForm>
  initialForm: TForm
  renderForm: (form: TForm, update: <K extends keyof TForm>(field: K, value: TForm[K]) => void, isEditing: boolean) => ReactNode
  toForm: (item: T) => TForm
  getSearchText: (item: T) => string
  toolbar?: ReactNode
  searchPlaceholder?: string
  onEdit?: (item: T) => void
  onCreated?: (item: T) => void
  onRowClick?: (item: T) => void
  editButtonText?: string
  editButtonIcon?: ReactNode
  editButtonVariant?: ButtonVariant
}

export function AdminCrudPage<T extends { id: string }, TForm>({
  title,
  subtitle,
  icon,
  addLabel,
  editLabel,
  columns,
  service,
  initialForm,
  renderForm,
  toForm,
  getSearchText,
  toolbar,
  searchPlaceholder,
  onEdit,
  onCreated,
  onRowClick,
  editButtonText = 'Sửa',
  editButtonIcon = <Edit className="h-3.5 w-3.5" />,
  editButtonVariant = 'secondary',
}: AdminCrudPageProps<T, TForm>) {

  const [items, setItems] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [tableError, setTableError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [form, setForm] = useState<TForm>(initialForm)
  const [editing, setEditing] = useState<T | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<T | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Auto-dismiss thông báo sau 5 giây
  useEffect(() => {
    if (!feedback && !actionError) return
    const timer = setTimeout(() => {
      setFeedback(null)
      setActionError(null)
    }, 5000)
    return () => clearTimeout(timer)
  }, [feedback, actionError])

  const loadItems = useCallback(async () => {
    setLoading(true)
    setTableError(null)
    try {
      setItems(await service.getAll())
    } catch (caught: unknown) {
      setTableError(caught instanceof Error ? caught.message : 'Không thể tải dữ liệu')
    } finally {
      setLoading(false)
    }
  }, [service])

  useEffect(() => {
    const timer = window.setTimeout(() => void loadItems(), 0)
    return () => window.clearTimeout(timer)
  }, [loadItems])

  const openCreate = () => {
    setEditing(null)
    setForm(initialForm)
    setActionError(null)
    setFeedback(null)
    setModalOpen(true)
  }

  const openEdit = (item: T) => {
    setEditing(item)
    setForm(toForm(item))
    setActionError(null)
    setFeedback(null)
    setModalOpen(true)
  }

  const updateForm = <K extends keyof TForm>(field: K, value: TForm[K]) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitting(true)
    setActionError(null)
    setFeedback(null)
    try {
      if (editing) {
        await service.update(editing.id, form)
        setFeedback('Cập nhật thành công')
      } else {
        const created = await service.create(form)
        setFeedback('Tạo mới thành công')
        if (onCreated && created) {
          onCreated(created)
          return
        }
      }
      setModalOpen(false)
      await loadItems()
    } catch (caught: unknown) {
      setActionError(caught instanceof Error ? caught.message : 'Thao tác thất bại')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setSubmitting(true)
    setActionError(null)
    setFeedback(null)
    try {
      await service.delete(deleteTarget.id)
      setFeedback('Xóa thành công')
      await loadItems()
    } catch (caught: unknown) {
      setActionError(caught instanceof Error ? caught.message : 'Xóa thất bại')
    } finally {
      setDeleteTarget(null)
      setSubmitting(false)
    }
  }

  const filteredItems = items.filter((item) => getSearchText(item).toLowerCase().includes(searchQuery.toLowerCase()))
  const actionColumns: ColumnDef<T>[] = [
    ...columns,
    {
      key: 'actions',
      header: 'Hành động',
      align: 'right',
      render: (item) => (
        <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
          <Button
            variant={editButtonVariant}
            size="xs"
            leftIcon={editButtonIcon}
            onClick={() => (onEdit ? onEdit(item) : openEdit(item))}
          >
            {editButtonText}
          </Button>
          <Button
            variant="danger"
            size="xs"
            leftIcon={<Trash2 className="h-3.5 w-3.5" />}
            onClick={() => setDeleteTarget(item)}
          >
            Xóa
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="flex items-center gap-2.5 text-2xl font-bold uppercase tracking-wide text-white">
            {icon}
            <span>{title}</span>
          </h1>
          <p className="mt-1 text-xs text-[var(--rogym-text-secondary)]">{subtitle}</p>
        </div>
        <Button variant="primary" size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate}>
          {addLabel}
        </Button>
      </div>

      {feedback && <Alert tone="success" icon={<CheckCircle2 className="h-4 w-4" />}><AlertDescription>{feedback}</AlertDescription></Alert>}
      {actionError && <Alert tone="error"><AlertDescription>{actionError}</AlertDescription></Alert>}

      <Card variant="glass" className="p-3.5 sm:p-4">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder={searchPlaceholder || 'Tìm kiếm...'}
          inputSize="sm"
        />
      </Card>
      {toolbar}
      <Card variant="elevated" className="overflow-hidden">
        <ResponsiveTable
          data={filteredItems}
          columns={actionColumns}
          keyExtractor={(item) => item.id}
          loading={loading}
          error={tableError}
          onRetry={() => void loadItems()}
          emptyTitle="Không có dữ liệu phù hợp"
          onRowClick={onRowClick}
        />
      </Card>


      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? editLabel : addLabel} size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          {renderForm(form, updateForm, editing !== null)}
          <ModalFooter>
            <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>Hủy</Button>
            <Button variant="primary" type="submit" loading={submitting}>Lưu</Button>
          </ModalFooter>
        </form>
      </Modal>

      <ConfirmDialog open={deleteTarget !== null} onClose={() => setDeleteTarget(null)} onConfirm={() => void handleDelete()} title="Xác nhận xóa" description="Dữ liệu sẽ bị xóa khỏi hệ thống. Bạn có chắc chắn muốn tiếp tục?" variant="danger" confirmLabel="Xóa" cancelLabel="Hủy" loading={submitting} />
    </div>
  )
}
