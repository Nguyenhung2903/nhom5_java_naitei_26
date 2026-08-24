import { useEffect, useState, type FormEvent } from 'react'
import {
  Users,
  Search,
  Plus,
  Edit,
  Lock,
  RefreshCcw,
  UserCheck,
  Mail,
  Phone,
  KeyRound,
  Image as ImageIcon,
} from 'lucide-react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Input,
  Select,
  Badge,
  Avatar,
  Modal,
  FormField,
  ConfirmDialog,
  Pagination,
  Alert,
  AlertDescription,
  Spinner,
} from '@/components/ui'
import { userService } from '@/services/userService'
import type {
  UserProfile,
  Role,
  UserStatus,
  CreateUserPayload,
  AdminUpdateUserPayload,
} from '@/types/user'

const initialCreateForm: CreateUserPayload = {
  username: '',
  email: '',
  password: '',
  fullName: '',
  phone: '',
  birthday: '',
  gender: 'Nam',
  avatar: '',
  role: 'USER',
  status: 'ACTIVE',
}

const initialEditForm: AdminUpdateUserPayload = {
  username: '',
  fullName: '',
  phone: '',
  birthday: '',
  gender: 'Nam',
  avatar: '',
  role: 'USER',
  status: 'ACTIVE',
  password: '',
}

export function UserManagementPage() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const [totalPages, setTotalPages] = useState(1)
  const [totalElements, setTotalElements] = useState(0)

  // Filters
  const [keyword, setKeyword] = useState('')
  const [roleFilter, setRoleFilter] = useState<Role | ''>('')
  const [statusFilter, setStatusFilter] = useState<UserStatus | ''>('')

  // State flags
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  // Modal States
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [createForm, setCreateForm] = useState<CreateUserPayload>(initialCreateForm)
  const [createErrors, setCreateErrors] = useState<Record<string, string>>({})

  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingUserId, setEditingUserId] = useState<string | null>(null)
  const [editingUserEmail, setEditingUserEmail] = useState('')
  const [editForm, setEditForm] = useState<AdminUpdateUserPayload>(initialEditForm)
  const [editErrors, setEditErrors] = useState<Record<string, string>>({})

  // Delete / Lock Confirm Dialog State
  const [isLockOpen, setIsLockOpen] = useState(false)
  const [userToLock, setUserToLock] = useState<UserProfile | null>(null)
  const [locking, setLocking] = useState(false)

  const loadUsers = async (targetPage = page) => {
    setLoading(true)
    setError(null)
    try {
      const res = await userService.getUsers({
        keyword: keyword.trim() || undefined,
        role: roleFilter || undefined,
        status: statusFilter || undefined,
        page: targetPage - 1,
        size: pageSize,
        sortBy: 'createdAt',
        sortDir: 'desc',
      })
      setUsers(res.content || [])
      setTotalPages(res.totalPages || 1)
      setTotalElements(res.totalElements || 0)
      setPage(targetPage)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Không thể tải danh sách người dùng')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadUsers(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSearch = (e: FormEvent) => {
    e.preventDefault()
    void loadUsers(1)
  }

  const handlePageChange = (newPage: number) => {
    void loadUsers(newPage)
  }

  // --- Create User Handlers ---
  const handleOpenCreate = () => {
    setCreateForm(initialCreateForm)
    setCreateErrors({})
    setError(null)
    setIsCreateOpen(true)
  }

  const handleCreateSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setCreateErrors({})
    setError(null)

    const errors: Record<string, string> = {}
    if (!createForm.username.trim()) {
      errors.username = 'Tên đăng nhập không được để trống'
    } else if (createForm.username.trim().length < 3) {
      errors.username = 'Tên đăng nhập phải có ít nhất 3 ký tự'
    }

    if (!createForm.email.trim()) {
      errors.email = 'Email không được để trống'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(createForm.email.trim())) {
      errors.email = 'Email không đúng định dạng'
    }

    if (!createForm.password) {
      errors.password = 'Mật khẩu không được để trống'
    } else if (createForm.password.length < 6) {
      errors.password = 'Mật khẩu phải từ 6 ký tự trở lên'
    }

    if (!createForm.fullName.trim()) {
      errors.fullName = 'Họ và tên không được để trống'
    }

    if (createForm.phone && !/^(0|\+84)[0-9]{9}$/.test(createForm.phone.trim())) {
      errors.phone = 'Số điện thoại không đúng định dạng Việt Nam'
    }

    if (Object.keys(errors).length > 0) {
      setCreateErrors(errors)
      return
    }

    setSaving(true)
    try {
      await userService.createUser({
        username: createForm.username.trim(),
        email: createForm.email.trim(),
        password: createForm.password,
        fullName: createForm.fullName.trim(),
        phone: createForm.phone?.trim() || undefined,
        birthday: createForm.birthday || undefined,
        gender: createForm.gender || undefined,
        avatar: createForm.avatar?.trim() || undefined,
        role: createForm.role,
        status: createForm.status,
      })

      setIsCreateOpen(false)
      setSuccessMsg(`Tạo tài khoản @${createForm.username} thành công!`)
      await loadUsers(1)
    } catch (err: unknown) {
      setCreateErrors({
        form: err instanceof Error ? err.message : 'Không thể tạo người dùng. Vui lòng kiểm tra lại.',
      })
    } finally {
      setSaving(false)
    }
  }

  // --- Edit User Handlers ---
  const handleOpenEdit = (user: UserProfile) => {
    setEditingUserId(user.id)
    setEditingUserEmail(user.email)
    setEditForm({
      username: user.username,
      fullName: user.fullName,
      phone: user.phone || '',
      birthday: user.birthday || '',
      gender: user.gender || 'Nam',
      avatar: user.avatar || '',
      role: user.role,
      status: user.status,
      password: '',
    })
    setEditErrors({})
    setError(null)
    setIsEditOpen(true)
  }

  const handleEditSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!editingUserId) return

    setEditErrors({})
    setError(null)

    const errors: Record<string, string> = {}
    if (!editForm.username.trim()) {
      errors.username = 'Tên đăng nhập không được để trống'
    } else if (editForm.username.trim().length < 3) {
      errors.username = 'Tên đăng nhập phải có ít nhất 3 ký tự'
    }

    if (!editForm.fullName.trim()) {
      errors.fullName = 'Họ và tên không được để trống'
    }

    if (editForm.phone && !/^(0|\+84)[0-9]{9}$/.test(editForm.phone.trim())) {
      errors.phone = 'Số điện thoại không đúng định dạng Việt Nam'
    }

    if (editForm.password && editForm.password.length < 6) {
      errors.password = 'Mật khẩu mới phải từ 6 ký tự trở lên'
    }

    if (Object.keys(errors).length > 0) {
      setEditErrors(errors)
      return
    }

    setSaving(true)
    try {
      await userService.updateUser(editingUserId, {
        username: editForm.username.trim(),
        fullName: editForm.fullName.trim(),
        phone: editForm.phone?.trim() || undefined,
        birthday: editForm.birthday || undefined,
        gender: editForm.gender || undefined,
        avatar: editForm.avatar?.trim() || undefined,
        role: editForm.role,
        status: editForm.status,
        password: editForm.password?.trim() || undefined,
      })

      setIsEditOpen(false)
      setSuccessMsg(`Cập nhật tài khoản @${editForm.username} thành công!`)
      await loadUsers(page)
    } catch (err: unknown) {
      setEditErrors({
        form: err instanceof Error ? err.message : 'Không thể cập nhật người dùng. Vui lòng thử lại.',
      })
    } finally {
      setSaving(false)
    }
  }

  // --- Lock / Soft Delete Handlers ---
  const handleOpenLock = (user: UserProfile) => {
    setUserToLock(user)
    setIsLockOpen(true)
  }

  const handleConfirmLock = async () => {
    if (!userToLock) return

    setLocking(true)
    try {
      await userService.deleteUser(userToLock.id)
      setIsLockOpen(false)
      setSuccessMsg(`Đã khóa tài khoản @${userToLock.username} thành công!`)
      await loadUsers(page)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Không thể khóa tài khoản')
    } finally {
      setLocking(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold uppercase tracking-wide text-white">
            <Users className="h-6 w-6 text-[var(--rogym-green)]" />
            Quản lý người dùng
          </h1>
          <p className="mt-1 text-xs text-[var(--rogym-text-secondary)]">
            Tra cứu, phân quyền vai trò, quản trị trạng thái và cấp tài khoản người dùng
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="primary"
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={handleOpenCreate}
          >
            Thêm tài khoản mới
          </Button>
        </div>
      </div>

      {/* Global Alerts */}
      {successMsg && (
        <Alert tone="success" onClose={() => setSuccessMsg(null)}>
          <AlertDescription>{successMsg}</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert tone="error" onClose={() => setError(null)}>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Toolbar / Filters */}
      <Card variant="glass" className="p-4">
        <form onSubmit={handleSearch} className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="flex-1">
            <Input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Tìm kiếm theo tên, username, email, sđt..."
              leftIcon={<Search className="h-4 w-4" />}
            />
          </div>

          <div className="w-full sm:w-44">
            <Select
              value={roleFilter}
              onValueChange={(val) => setRoleFilter(val as Role | '')}
            >
              <option value="">Tất cả vai trò</option>
              <option value="USER">Khách Hàng (USER)</option>
              <option value="ADMIN">Quản Trị Viên (ADMIN)</option>
            </Select>
          </div>

          <div className="w-full sm:w-44">
            <Select
              value={statusFilter}
              onValueChange={(val) => setStatusFilter(val as UserStatus | '')}
            >
              <option value="">Tất cả trạng thái</option>
              <option value="ACTIVE">Hoạt động (ACTIVE)</option>
              <option value="LOCKED">Bị khóa (LOCKED)</option>
            </Select>
          </div>

          <Button
            type="submit"
            variant="secondary"
            loading={loading}
            leftIcon={<RefreshCcw className="h-4 w-4" />}
          >
            Lọc
          </Button>
        </form>
      </Card>

      {/* Data Table */}
      <Card variant="elevated" className="overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 pb-4">
          <CardTitle className="text-base font-bold text-white">
            Danh sách tài khoản ({totalElements})
          </CardTitle>
        </CardHeader>

        <CardContent className="p-0">
          {loading && users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Spinner size={32} className="mb-3" />
              <p className="text-xs text-[var(--rogym-text-muted)]">Đang tải danh sách người dùng...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="py-16 text-center text-sm text-[var(--rogym-text-muted)]">
              Không tìm thấy người dùng nào phù hợp với điều kiện tìm kiếm.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-white/10 bg-white/[0.02] text-[var(--rogym-text-muted)] uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Người dùng</th>
                    <th className="px-4 py-3 font-semibold">Tài khoản & Email</th>
                    <th className="px-4 py-3 font-semibold">Số điện thoại</th>
                    <th className="px-4 py-3 font-semibold">Vai trò</th>
                    <th className="px-4 py-3 font-semibold">Trạng thái</th>
                    <th className="px-4 py-3 font-semibold text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {users.map((item) => (
                    <tr key={item.id} className="transition-colors hover:bg-white/[0.02]">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <Avatar
                            name={item.fullName || item.username}
                            src={item.avatar || undefined}
                            size="md"
                            border
                          />
                          <div className="min-w-0">
                            <p className="font-bold text-white truncate">{item.fullName}</p>
                            <p className="text-[11px] text-[var(--rogym-text-muted)]">
                              {item.gender ? `${item.gender} • ` : ''}
                              {item.birthday || 'Chưa có ngày sinh'}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="space-y-0.5">
                          <p className="font-mono text-white">@{item.username}</p>
                          <p className="flex items-center gap-1 text-[var(--rogym-text-secondary)]">
                            <Mail className="h-3 w-3 text-[var(--rogym-teal)]" />
                            {item.email}
                          </p>
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <span className="flex items-center gap-1 text-white">
                          <Phone className="h-3 w-3 text-[var(--rogym-teal)]" />
                          {item.phone || 'Chưa cập nhật'}
                        </span>
                      </td>

                      <td className="px-4 py-3.5">
                        <Badge tone={item.role === 'ADMIN' ? 'accent' : 'primary'} size="sm">
                          {item.role === 'ADMIN' ? 'Quản Trị Viên' : 'Khách Hàng'}
                        </Badge>
                      </td>

                      <td className="px-4 py-3.5">
                        <Badge tone={item.status === 'ACTIVE' ? 'success' : 'danger'} size="sm">
                          {item.status === 'ACTIVE' ? 'Hoạt động' : 'Bị khóa'}
                        </Badge>
                      </td>

                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            leftIcon={<Edit className="h-3.5 w-3.5" />}
                            onClick={() => handleOpenEdit(item)}
                          >
                            Sửa
                          </Button>
                          {item.status !== 'LOCKED' && (
                            <Button
                              type="button"
                              variant="danger"
                              size="sm"
                              leftIcon={<Lock className="h-3.5 w-3.5" />}
                              onClick={() => handleOpenLock(item)}
                            >
                              Khóa
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          <div className="border-t border-white/5 px-4 py-2">
            <Pagination
              page={page}
              totalPages={totalPages}
              totalItems={totalElements}
              pageSize={pageSize}
              onPageChange={handlePageChange}
              showItemCount
            />
          </div>
        </CardContent>
      </Card>

      {/* Modal Tạo Người Dùng Mới */}
      <Modal
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Thêm tài khoản người dùng mới"
        size="xl"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          {createErrors.form && (
            <Alert tone="error">
              <AlertDescription>{createErrors.form}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField
              label="Tên đăng nhập"
              htmlFor="createUsername"
              required
              error={createErrors.username}
            >
              <Input
                id="createUsername"
                placeholder="staff01"
                value={createForm.username}
                onChange={(e) => setCreateForm({ ...createForm, username: e.target.value })}
                disabled={saving}
              />
            </FormField>

            <FormField
              label="Địa chỉ Email"
              htmlFor="createEmail"
              required
              error={createErrors.email}
            >
              <Input
                id="createEmail"
                type="email"
                placeholder="staff01@cinemanest.vn"
                value={createForm.email}
                onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                disabled={saving}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField
              label="Mật khẩu khởi tạo"
              htmlFor="createPassword"
              required
              error={createErrors.password}
            >
              <Input
                id="createPassword"
                type="password"
                showPasswordToggle
                placeholder="Tối thiểu 6 ký tự"
                value={createForm.password}
                onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                disabled={saving}
              />
            </FormField>

            <FormField
              label="Họ và tên đầy đủ"
              htmlFor="createFullName"
              required
              error={createErrors.fullName}
            >
              <Input
                id="createFullName"
                placeholder="Nguyễn Văn A"
                value={createForm.fullName}
                onChange={(e) => setCreateForm({ ...createForm, fullName: e.target.value })}
                disabled={saving}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField
              label="Số điện thoại"
              htmlFor="createPhone"
              error={createErrors.phone}
            >
              <Input
                id="createPhone"
                placeholder="0912345678"
                value={createForm.phone ?? ''}
                onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                disabled={saving}
              />
            </FormField>

            <FormField
              label="Ngày sinh"
              htmlFor="createBirthday"
            >
              <Input
                id="createBirthday"
                type="date"
                value={createForm.birthday ?? ''}
                onChange={(e) => setCreateForm({ ...createForm, birthday: e.target.value })}
                disabled={saving}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <FormField label="Giới tính" htmlFor="createGender">
              <Select
                value={createForm.gender ?? 'Nam'}
                onValueChange={(val) => setCreateForm({ ...createForm, gender: val })}
                disabled={saving}
              >
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
                <option value="Khác">Khác</option>
              </Select>
            </FormField>

            <FormField label="Vai trò" htmlFor="createRole">
              <Select
                value={createForm.role ?? 'USER'}
                onValueChange={(val) => setCreateForm({ ...createForm, role: val as Role })}
                disabled={saving}
              >
                <option value="USER">Khách Hàng (USER)</option>
                <option value="ADMIN">Quản Trị Viên (ADMIN)</option>
              </Select>
            </FormField>

            <FormField label="Trạng thái" htmlFor="createStatus">
              <Select
                value={createForm.status ?? 'ACTIVE'}
                onValueChange={(val) => setCreateForm({ ...createForm, status: val as UserStatus })}
                disabled={saving}
              >
                <option value="ACTIVE">Hoạt động (ACTIVE)</option>
                <option value="LOCKED">Bị khóa (LOCKED)</option>
              </Select>
            </FormField>
          </div>

          <FormField
            label="URL Ảnh đại diện"
            htmlFor="createAvatar"
          >
            <Input
              id="createAvatar"
              placeholder="https://example.com/avatar.jpg"
              leftIcon={<ImageIcon className="h-4 w-4" />}
              value={createForm.avatar ?? ''}
              onChange={(e) => setCreateForm({ ...createForm, avatar: e.target.value })}
              disabled={saving}
            />
          </FormField>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-white/5">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsCreateOpen(false)}
              disabled={saving}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={saving}
              loadingText="Đang tạo..."
              leftIcon={<Plus className="h-4 w-4" />}
            >
              Tạo tài khoản
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Chỉnh Sửa & Phân Quyền */}
      <Modal
        open={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Chỉnh sửa thông tin & phân quyền"
        size="xl"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          {editErrors.form && (
            <Alert tone="error">
              <AlertDescription>{editErrors.form}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField
              label="Tên đăng nhập"
              htmlFor="editUsername"
              required
              error={editErrors.username}
            >
              <Input
                id="editUsername"
                value={editForm.username}
                onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                disabled={saving}
              />
            </FormField>

            <FormField
              label="Email (Cố định)"
              htmlFor="editEmail"
            >
              <Input
                id="editEmail"
                value={editingUserEmail}
                disabled
                className="opacity-60 cursor-not-allowed"
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField
              label="Họ và tên đầy đủ"
              htmlFor="editFullName"
              required
              error={editErrors.fullName}
            >
              <Input
                id="editFullName"
                value={editForm.fullName}
                onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                disabled={saving}
              />
            </FormField>

            <FormField
              label="Số điện thoại"
              htmlFor="editPhone"
              error={editErrors.phone}
            >
              <Input
                id="editPhone"
                value={editForm.phone ?? ''}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                disabled={saving}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <FormField label="Ngày sinh" htmlFor="editBirthday">
              <Input
                id="editBirthday"
                type="date"
                value={editForm.birthday ?? ''}
                onChange={(e) => setEditForm({ ...editForm, birthday: e.target.value })}
                disabled={saving}
              />
            </FormField>

            <FormField label="Giới tính" htmlFor="editGender">
              <Select
                value={editForm.gender ?? 'Nam'}
                onValueChange={(val) => setEditForm({ ...editForm, gender: val })}
                disabled={saving}
              >
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
                <option value="Khác">Khác</option>
              </Select>
            </FormField>

            <FormField label="Vai trò" htmlFor="editRole">
              <Select
                value={editForm.role}
                onValueChange={(val) => setEditForm({ ...editForm, role: val as Role })}
                disabled={saving}
              >
                <option value="USER">Khách Hàng (USER)</option>
                <option value="ADMIN">Quản Trị Viên (ADMIN)</option>
              </Select>
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField label="Trạng thái tài khoản" htmlFor="editStatus">
              <Select
                value={editForm.status}
                onValueChange={(val) => setEditForm({ ...editForm, status: val as UserStatus })}
                disabled={saving}
              >
                <option value="ACTIVE">Hoạt động (ACTIVE)</option>
                <option value="LOCKED">Bị khóa (LOCKED)</option>
              </Select>
            </FormField>

            <FormField
              label="URL Ảnh đại diện"
              htmlFor="editAvatar"
            >
              <Input
                id="editAvatar"
                placeholder="https://example.com/avatar.jpg"
                leftIcon={<ImageIcon className="h-4 w-4" />}
                value={editForm.avatar ?? ''}
                onChange={(e) => setEditForm({ ...editForm, avatar: e.target.value })}
                disabled={saving}
              />
            </FormField>
          </div>

          {/* Reset Password Optional */}
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 space-y-2">
            <p className="text-xs font-semibold text-white flex items-center gap-1.5">
              <KeyRound className="h-3.5 w-3.5 text-[var(--rogym-teal)]" />
              Đặt lại mật khẩu cho tài khoản (Tùy chọn)
            </p>
            <FormField
              label="Mật khẩu mới (Để trống nếu không muốn đổi)"
              htmlFor="editPassword"
              error={editErrors.password}
            >
              <Input
                id="editPassword"
                type="password"
                showPasswordToggle
                placeholder="Nhập mật khẩu mới..."
                value={editForm.password ?? ''}
                onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                disabled={saving}
              />
            </FormField>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-white/5">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsEditOpen(false)}
              disabled={saving}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={saving}
              loadingText="Đang lưu..."
              leftIcon={<UserCheck className="h-4 w-4" />}
            >
              Lưu thay đổi
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirm Dialog Khóa Người Dùng */}
      <ConfirmDialog
        open={isLockOpen}
        onClose={() => setIsLockOpen(false)}
        onConfirm={handleConfirmLock}
        title="Xác nhận khóa tài khoản người dùng"
        description={
          <span>
            Bạn có chắc chắn muốn khóa tài khoản{' '}
            <strong className="text-white">@{userToLock?.username}</strong> ({userToLock?.fullName})?
            Người dùng này sẽ không thể đăng nhập vào hệ thống sau khi bị khóa.
          </span>
        }
        confirmLabel="Khóa tài khoản"
        variant="danger"
        loading={locking}
      />
    </div>
  )
}

export default UserManagementPage
