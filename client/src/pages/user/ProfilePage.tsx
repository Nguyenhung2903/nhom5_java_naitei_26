import { useState, useEffect, type FormEvent } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { authService } from '@/services/authService'
import { userService } from '@/services/userService'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  FormField,
  Input,
  Select,
  Button,
  Alert,
  AlertDescription,
  Avatar,
  Badge,
} from '@/components/ui'
import {
  User as UserIcon,
  Mail,
  Phone,
  Calendar,
  Lock,
  Shield,
  CheckCircle2,
  AlertCircle,
  Edit3,
  X,
  Save,
  Image as ImageIcon,
} from 'lucide-react'

export function ProfilePage() {
  const { user, refreshProfile } = useAuth()

  // Profile Edit State
  const [isEditing, setIsEditing] = useState(false)
  const [profileForm, setProfileForm] = useState({
    username: '',
    fullName: '',
    phone: '',
    birthday: '',
    gender: 'Nam',
    avatar: '',
  })
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({})
  const [profileSuccessMsg, setProfileSuccessMsg] = useState<string | null>(null)
  const [profileErrorMsg, setProfileErrorMsg] = useState<string | null>(null)
  const [isSavingProfile, setIsSavingProfile] = useState(false)

  // Password Change State
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({})
  const [passwordSuccessMsg, setPasswordSuccessMsg] = useState<string | null>(null)
  const [passwordErrorMsg, setPasswordErrorMsg] = useState<string | null>(null)
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  useEffect(() => {
    if (user) {
      setProfileForm({
        username: user.username || '',
        fullName: user.fullName || '',
        phone: user.phone || '',
        birthday: user.birthday || '',
        gender: user.gender || 'Nam',
        avatar: user.avatar || '',
      })
    }
  }, [user])

  const handleStartEdit = () => {
    if (user) {
      setProfileForm({
        username: user.username || '',
        fullName: user.fullName || '',
        phone: user.phone || '',
        birthday: user.birthday || '',
        gender: user.gender || 'Nam',
        avatar: user.avatar || '',
      })
    }
    setProfileErrors({})
    setProfileSuccessMsg(null)
    setProfileErrorMsg(null)
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    if (user) {
      setProfileForm({
        username: user.username || '',
        fullName: user.fullName || '',
        phone: user.phone || '',
        birthday: user.birthday || '',
        gender: user.gender || 'Nam',
        avatar: user.avatar || '',
      })
    }
    setProfileErrors({})
    setProfileErrorMsg(null)
    setIsEditing(false)
  }

  const handleProfileSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setProfileSuccessMsg(null)
    setProfileErrorMsg(null)

    const errors: Record<string, string> = {}
    if (!profileForm.username.trim()) {
      errors.username = 'Tên đăng nhập không được để trống'
    } else if (profileForm.username.trim().length < 3) {
      errors.username = 'Tên đăng nhập phải có ít nhất 3 ký tự'
    }

    if (!profileForm.fullName.trim()) {
      errors.fullName = 'Họ và tên không được để trống'
    }

    if (profileForm.phone && !/^(0|\+84)[0-9]{9}$/.test(profileForm.phone.trim())) {
      errors.phone = 'Số điện thoại không đúng định dạng Việt Nam (10 chữ số)'
    }

    if (Object.keys(errors).length > 0) {
      setProfileErrors(errors)
      return
    }

    setIsSavingProfile(true)
    try {
      await userService.updateMyProfile({
        username: profileForm.username.trim(),
        fullName: profileForm.fullName.trim(),
        phone: profileForm.phone.trim() || undefined,
        birthday: profileForm.birthday || undefined,
        gender: profileForm.gender || undefined,
        avatar: profileForm.avatar.trim() || undefined,
      })

      await refreshProfile()
      setProfileSuccessMsg('Cập nhật thông tin hồ sơ thành công!')
      setProfileErrors({})
      setIsEditing(false)
    } catch (err: unknown) {
      if (err instanceof Error) {
        setProfileErrorMsg(err.message)
      } else {
        setProfileErrorMsg('Không thể cập nhật hồ sơ. Vui lòng thử lại.')
      }
    } finally {
      setIsSavingProfile(false)
    }
  }

  const handlePasswordChange = async (e: FormEvent) => {
    e.preventDefault()
    setPasswordSuccessMsg(null)
    setPasswordErrorMsg(null)

    const errors: Record<string, string> = {}
    if (!passwordData.oldPassword) {
      errors.oldPassword = 'Vui lòng nhập mật khẩu hiện tại'
    }
    if (!passwordData.newPassword) {
      errors.newPassword = 'Vui lòng nhập mật khẩu mới'
    } else if (passwordData.newPassword.length < 6) {
      errors.newPassword = 'Mật khẩu mới phải có ít nhất 6 ký tự'
    }
    if (!passwordData.confirmPassword) {
      errors.confirmPassword = 'Vui lòng xác nhận mật khẩu mới'
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = 'Mật khẩu xác nhận không khớp'
    }

    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors)
      return
    }

    setIsChangingPassword(true)
    try {
      await authService.changePassword({
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword,
        confirmPassword: passwordData.confirmPassword,
      })
      setPasswordSuccessMsg('Đổi mật khẩu thành công!')
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' })
      setPasswordErrors({})
    } catch (err: unknown) {
      if (err instanceof Error) {
        setPasswordErrorMsg(err.message)
      } else {
        setPasswordErrorMsg('Không thể đổi mật khẩu. Vui lòng kiểm tra lại.')
      }
    } finally {
      setIsChangingPassword(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold font-display text-white uppercase tracking-wide">
          Hồ Sơ Cá Nhân
        </h1>
        <p className="text-xs text-[var(--rogym-text-secondary)]">
          Quản lý thông tin tài khoản và bảo mật
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User Info Summary Card */}
        <Card variant="glass" className="md:col-span-1 p-6 flex flex-col items-center text-center">
          <Avatar
            name={isEditing ? profileForm.fullName || 'User' : user?.fullName || 'User'}
            src={isEditing ? profileForm.avatar || undefined : user?.avatar || undefined}
            size="2xl"
            status="online"
            border
            className="mb-4"
          />
          <h2 className="text-lg font-bold text-white">
            {isEditing ? profileForm.fullName || user?.fullName : user?.fullName}
          </h2>
          <p className="text-xs text-[var(--rogym-text-muted)]">
            @{isEditing ? profileForm.username || user?.username : user?.username}
          </p>

          <div className="flex items-center gap-2 mt-3">
            <Badge tone={user?.role === 'ADMIN' ? 'accent' : 'primary'} size="sm">
              {user?.role === 'ADMIN' ? 'Quản Trị Viên' : 'Khách Hàng'}
            </Badge>
            <Badge tone={user?.status === 'ACTIVE' ? 'success' : 'danger'} size="sm">
              {user?.status || 'ACTIVE'}
            </Badge>
          </div>
        </Card>

        {/* Detailed Info & Password Change */}
        <div className="md:col-span-2 space-y-6">
          {/* Detailed Info Card */}
          <Card variant="elevated" className="p-6">
            <CardHeader className="p-0 pb-4 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                  <UserIcon className="w-4 h-4 text-[var(--rogym-green)]" />
                  <span>Thông tin chi tiết</span>
                </CardTitle>
                <CardDescription className="text-xs text-[var(--rogym-text-secondary)] mt-0.5">
                  {isEditing ? 'Chỉnh sửa thông tin cá nhân của bạn' : 'Thông tin tài khoản đã đăng ký'}
                </CardDescription>
              </div>

              {!isEditing && (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  leftIcon={<Edit3 className="w-3.5 h-3.5" />}
                  onClick={handleStartEdit}
                >
                  Chỉnh sửa
                </Button>
              )}
            </CardHeader>

            <CardContent className="p-0 space-y-4 pt-2">
              {profileSuccessMsg && (
                <Alert tone="success" icon={<CheckCircle2 className="w-4 h-4" />}>
                  <AlertDescription>{profileSuccessMsg}</AlertDescription>
                </Alert>
              )}

              {profileErrorMsg && (
                <Alert tone="error" icon={<AlertCircle className="w-4 h-4" />}>
                  <AlertDescription>{profileErrorMsg}</AlertDescription>
                </Alert>
              )}

              {!isEditing ? (
                /* View Mode */
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1">
                    <span className="text-[var(--rogym-text-muted)]">Tên đăng nhập:</span>
                    <p className="font-semibold text-white">@{user?.username || '-'}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[var(--rogym-text-muted)]">Địa chỉ Email:</span>
                    <p className="font-semibold text-white flex items-center gap-1">
                      <Mail className="w-3 h-3 text-[var(--rogym-teal)]" />
                      {user?.email || '-'}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[var(--rogym-text-muted)]">Họ và tên:</span>
                    <p className="font-semibold text-white">{user?.fullName || '-'}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[var(--rogym-text-muted)]">Số điện thoại:</span>
                    <p className="font-semibold text-white flex items-center gap-1">
                      <Phone className="w-3 h-3 text-[var(--rogym-teal)]" />
                      {user?.phone || 'Chưa cập nhật'}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[var(--rogym-text-muted)]">Giới tính:</span>
                    <p className="font-semibold text-white">{user?.gender || 'Chưa cập nhật'}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[var(--rogym-text-muted)]">Ngày sinh:</span>
                    <p className="font-semibold text-white flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-[var(--rogym-teal)]" />
                      {user?.birthday || 'Chưa cập nhật'}
                    </p>
                  </div>
                </div>
              ) : (
                /* Edit Mode Form */
                <form onSubmit={handleProfileSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <FormField
                      label="Tên đăng nhập"
                      htmlFor="editUsername"
                      required
                      error={profileErrors.username}
                    >
                      <Input
                        id="editUsername"
                        value={profileForm.username}
                        onChange={(e) => {
                          setProfileForm({ ...profileForm, username: e.target.value })
                          if (profileErrors.username) setProfileErrors({ ...profileErrors, username: '' })
                        }}
                        disabled={isSavingProfile}
                      />
                    </FormField>

                    <FormField
                      label="Địa chỉ Email (Cố định)"
                      htmlFor="editEmail"
                    >
                      <Input
                        id="editEmail"
                        value={user?.email || ''}
                        disabled
                        className="opacity-60 cursor-not-allowed"
                      />
                    </FormField>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <FormField
                      label="Họ và tên"
                      htmlFor="editFullName"
                      required
                      error={profileErrors.fullName}
                    >
                      <Input
                        id="editFullName"
                        value={profileForm.fullName}
                        onChange={(e) => {
                          setProfileForm({ ...profileForm, fullName: e.target.value })
                          if (profileErrors.fullName) setProfileErrors({ ...profileErrors, fullName: '' })
                        }}
                        disabled={isSavingProfile}
                      />
                    </FormField>

                    <FormField
                      label="Số điện thoại"
                      htmlFor="editPhone"
                      error={profileErrors.phone}
                    >
                      <Input
                        id="editPhone"
                        placeholder="0912345678"
                        value={profileForm.phone}
                        onChange={(e) => {
                          setProfileForm({ ...profileForm, phone: e.target.value })
                          if (profileErrors.phone) setProfileErrors({ ...profileErrors, phone: '' })
                        }}
                        disabled={isSavingProfile}
                      />
                    </FormField>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <FormField
                      label="Ngày sinh"
                      htmlFor="editBirthday"
                    >
                      <Input
                        id="editBirthday"
                        type="date"
                        value={profileForm.birthday}
                        onChange={(e) => setProfileForm({ ...profileForm, birthday: e.target.value })}
                        disabled={isSavingProfile}
                      />
                    </FormField>

                    <FormField
                      label="Giới tính"
                      htmlFor="editGender"
                    >
                      <Select
                        value={profileForm.gender}
                        onValueChange={(val) => setProfileForm({ ...profileForm, gender: val })}
                        disabled={isSavingProfile}
                      >
                        <option value="Nam">Nam</option>
                        <option value="Nữ">Nữ</option>
                        <option value="Khác">Khác</option>
                      </Select>
                    </FormField>
                  </div>

                  <FormField
                    label="URL Ảnh đại diện"
                    htmlFor="editAvatar"
                  >
                    <Input
                      id="editAvatar"
                      placeholder="https://example.com/avatar.jpg"
                      leftIcon={<ImageIcon className="w-4 h-4" />}
                      value={profileForm.avatar}
                      onChange={(e) => setProfileForm({ ...profileForm, avatar: e.target.value })}
                      disabled={isSavingProfile}
                    />
                  </FormField>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <Button
                      type="button"
                      variant="secondary"
                      size="md"
                      leftIcon={<X className="w-4 h-4" />}
                      onClick={handleCancelEdit}
                      disabled={isSavingProfile}
                    >
                      Hủy
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      size="md"
                      loading={isSavingProfile}
                      loadingText="Đang lưu..."
                      leftIcon={<Save className="w-4 h-4" />}
                    >
                      Lưu thay đổi
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>

          {/* Change Password Card */}
          <Card variant="elevated" className="p-6">
            <CardHeader className="p-0 pb-4">
              <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-[var(--rogym-green)]" />
                <span>Đổi mật khẩu</span>
              </CardTitle>
              <CardDescription className="text-xs text-[var(--rogym-text-secondary)]">
                Để bảo mật tài khoản, vui lòng không chia sẻ mật khẩu cho người khác
              </CardDescription>
            </CardHeader>

            <CardContent className="p-0 space-y-4 pt-2">
              {passwordSuccessMsg && (
                <Alert tone="success" icon={<CheckCircle2 className="w-4 h-4" />}>
                  <AlertDescription>{passwordSuccessMsg}</AlertDescription>
                </Alert>
              )}

              {passwordErrorMsg && (
                <Alert tone="error" icon={<AlertCircle className="w-4 h-4" />}>
                  <AlertDescription>{passwordErrorMsg}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handlePasswordChange} className="space-y-3">
                <FormField
                  label="Mật khẩu hiện tại"
                  htmlFor="oldPassword"
                  required
                  error={passwordErrors.oldPassword}
                >
                  <Input
                    id="oldPassword"
                    type="password"
                    showPasswordToggle
                    value={passwordData.oldPassword}
                    onChange={(e) => {
                      setPasswordData({ ...passwordData, oldPassword: e.target.value })
                      if (passwordErrors.oldPassword)
                        setPasswordErrors({ ...passwordErrors, oldPassword: '' })
                    }}
                    error={!!passwordErrors.oldPassword}
                    disabled={isChangingPassword}
                  />
                </FormField>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <FormField
                    label="Mật khẩu mới"
                    htmlFor="newPassword"
                    required
                    error={passwordErrors.newPassword}
                  >
                    <Input
                      id="newPassword"
                      type="password"
                      showPasswordToggle
                      value={passwordData.newPassword}
                      onChange={(e) => {
                        setPasswordData({ ...passwordData, newPassword: e.target.value })
                        if (passwordErrors.newPassword)
                          setPasswordErrors({ ...passwordErrors, newPassword: '' })
                      }}
                      error={!!passwordErrors.newPassword}
                      disabled={isChangingPassword}
                    />
                  </FormField>

                  <FormField
                    label="Xác nhận mật khẩu mới"
                    htmlFor="confirmPassword"
                    required
                    error={passwordErrors.confirmPassword}
                  >
                    <Input
                      id="confirmPassword"
                      type="password"
                      showPasswordToggle
                      value={passwordData.confirmPassword}
                      onChange={(e) => {
                        setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                        if (passwordErrors.confirmPassword)
                          setPasswordErrors({ ...passwordErrors, confirmPassword: '' })
                      }}
                      error={!!passwordErrors.confirmPassword}
                      disabled={isChangingPassword}
                    />
                  </FormField>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  loading={isChangingPassword}
                  loadingText="Đang cập nhật..."
                  leftIcon={<Shield className="w-4 h-4" />}
                  className="mt-2 cursor-pointer"
                >
                  Cập nhật mật khẩu
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
