import { useState, type FormEvent } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { authService } from '@/services/authService'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  FormField,
  Input,
  Button,
  Alert,
  AlertDescription,
  Avatar,
  Badge,
} from '@/components/ui'
import { User, Mail, Phone, Calendar, Lock, Shield, CheckCircle2, AlertCircle } from 'lucide-react'

export function ProfilePage() {
  const { user } = useAuth()

  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({})
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  const handlePasswordChange = async (e: FormEvent) => {
    e.preventDefault()
    setSuccessMsg(null)
    setErrorMsg(null)

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
      setSuccessMsg('Đổi mật khẩu thành công!')
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' })
      setPasswordErrors({})
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message)
      } else {
        setErrorMsg('Không thể đổi mật khẩu. Vui lòng kiểm tra lại.')
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
            name={user?.fullName || 'User'}
            src={user?.avatar}
            size="2xl"
            status="online"
            border
            className="mb-4"
          />
          <h2 className="text-lg font-bold text-white">{user?.fullName}</h2>
          <p className="text-xs text-[var(--rogym-text-muted)]">@{user?.username}</p>

          <div className="flex items-center gap-2 mt-3">
            <Badge tone={user?.role === 'ADMIN' ? 'accent' : 'primary'} size="sm">
              {user?.role === 'ADMIN' ? 'Quản Trị Viên' : 'Khách Hàng'}
            </Badge>
            <Badge tone="success" size="sm">
              {user?.status || 'ACTIVE'}
            </Badge>
          </div>
        </Card>

        {/* Detailed Info & Password Change */}
        <div className="md:col-span-2 space-y-6">
          {/* Detailed Info Card */}
          <Card variant="elevated" className="p-6">
            <CardHeader className="p-0 pb-4">
              <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                <User className="w-4 h-4 text-[var(--rogym-green)]" />
                <span>Thông tin chi tiết</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-[var(--rogym-text-muted)]">Họ và tên:</span>
                <p className="font-semibold text-white">{user?.fullName || '-'}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[var(--rogym-text-muted)]">Địa chỉ Email:</span>
                <p className="font-semibold text-white flex items-center gap-1">
                  <Mail className="w-3 h-3 text-[var(--rogym-teal)]" />
                  {user?.email || '-'}
                </p>
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
              {successMsg && (
                <Alert tone="success" icon={<CheckCircle2 className="w-4 h-4" />}>
                  <AlertDescription>{successMsg}</AlertDescription>
                </Alert>
              )}

              {errorMsg && (
                <Alert tone="error" icon={<AlertCircle className="w-4 h-4" />}>
                  <AlertDescription>{errorMsg}</AlertDescription>
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
