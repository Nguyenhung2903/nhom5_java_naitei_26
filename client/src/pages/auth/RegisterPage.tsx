import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  FormField,
  Input,
  Button,
  Alert,
  AlertDescription,
  Select,
} from '@/components/ui'
import {
  UserPlus,
  User,
  Mail,
  Lock,
  Phone,
  Calendar,
  Sparkles,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'

export function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    phone: '',
    gender: '',
    birthday: '',
  })

  const [showOptionalFields, setShowOptionalFields] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [serverError, setServerError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validate = (): boolean => {
    const nextErrors: Record<string, string> = {}

    // Họ và tên
    if (!formData.fullName.trim()) {
      nextErrors.fullName = 'Họ và tên không được để trống'
    } else if (formData.fullName.trim().length > 100) {
      nextErrors.fullName = 'Họ và tên không vượt quá 100 ký tự'
    }

    // Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!formData.email.trim()) {
      nextErrors.email = 'Email không được để trống'
    } else if (!emailRegex.test(formData.email.trim())) {
      nextErrors.email = 'Email không đúng định dạng (VD: ten@gmail.com)'
    }

    // Username
    const usernameRegex = /^[a-zA-Z0-9._-]+$/
    if (!formData.username.trim()) {
      nextErrors.username = 'Tên đăng nhập không được để trống'
    } else if (formData.username.trim().length < 3 || formData.username.trim().length > 50) {
      nextErrors.username = 'Tên đăng nhập phải có từ 3 đến 50 ký tự'
    } else if (!usernameRegex.test(formData.username.trim())) {
      nextErrors.username = 'Tên đăng nhập chỉ chứa chữ cái, số, dấu chấm, gạch dưới và gạch nối'
    }

    // Password
    if (!formData.password) {
      nextErrors.password = 'Mật khẩu không được để trống'
    } else if (formData.password.length < 6) {
      nextErrors.password = 'Mật khẩu phải có từ 6 ký tự trở lên'
    }

    // Confirm Password
    if (!formData.confirmPassword) {
      nextErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu'
    } else if (formData.password !== formData.confirmPassword) {
      nextErrors.confirmPassword = 'Mật khẩu xác nhận không khớp'
    }

    // Phone (Optional)
    if (formData.phone.trim()) {
      const phoneRegex = /^(0|\+84)[0-9]{9}$/
      if (!phoneRegex.test(formData.phone.trim())) {
        nextErrors.phone = 'Số điện thoại không đúng định dạng (10 chữ số)'
      }
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setServerError(null)

    if (!validate()) return

    setIsSubmitting(true)
    try {
      await register({
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        username: formData.username.trim(),
        password: formData.password,
        phone: formData.phone.trim() || undefined,
        gender: formData.gender || undefined,
        birthday: formData.birthday || undefined,
      })

      // Đăng ký thành công -> Tự động đăng nhập và về trang chủ
      navigate('/', { replace: true })
    } catch (err: unknown) {
      if (err instanceof Error) {
        setServerError(err.message)
      } else {
        setServerError('Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card variant="glass" className="border-[var(--rogym-border-focus)] shadow-2xl p-2 sm:p-4 my-4">
      <CardHeader className="text-center pb-4">
        <div className="mx-auto w-12 h-12 rounded-2xl bg-[var(--rogym-green)]/15 border border-[var(--rogym-green)]/40 flex items-center justify-center text-[var(--rogym-green)] mb-3 shadow-lg shadow-[var(--rogym-green)]/10">
          <UserPlus className="w-6 h-6" />
        </div>
        <CardTitle className="text-2xl font-bold uppercase tracking-wide text-white">
          Đăng Ký Thành Viên
        </CardTitle>
        <CardDescription className="text-xs text-[var(--rogym-text-secondary)] mt-1">
          Tạo tài khoản khách hàng mới để tích điểm và nhận ưu đãi đặt vé
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {serverError && (
          <Alert tone="error" icon={<AlertCircle className="w-4 h-4" />}>
            <AlertDescription>{serverError}</AlertDescription>
          </Alert>
        )}

        <form id="register-form" onSubmit={handleSubmit} className="space-y-3.5">
          {/* Họ và tên */}
          <FormField
            label="Họ và tên"
            htmlFor="fullName"
            required
            error={errors.fullName}
          >
            <Input
              id="fullName"
              name="fullName"
              placeholder="VD: Nguyễn Văn A"
              value={formData.fullName}
              onChange={(e) => {
                setFormData({ ...formData, fullName: e.target.value })
                if (errors.fullName) setErrors({ ...errors, fullName: '' })
              }}
              leftIcon={<User className="w-4 h-4 text-[var(--rogym-text-muted)]" />}
              error={!!errors.fullName}
              disabled={isSubmitting}
              autoComplete="name"
            />
          </FormField>

          {/* Email */}
          <FormField
            label="Địa chỉ Email"
            htmlFor="email"
            required
            error={errors.email}
          >
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="VD: nguyenvana@gmail.com"
              value={formData.email}
              onChange={(e) => {
                setFormData({ ...formData, email: e.target.value })
                if (errors.email) setErrors({ ...errors, email: '' })
              }}
              leftIcon={<Mail className="w-4 h-4 text-[var(--rogym-text-muted)]" />}
              error={!!errors.email}
              disabled={isSubmitting}
              autoComplete="email"
            />
          </FormField>

          {/* Username */}
          <FormField
            label="Tên đăng nhập"
            htmlFor="username"
            required
            hint="Dùng để đăng nhập (3-50 ký tự, không dấu)"
            error={errors.username}
          >
            <Input
              id="username"
              name="username"
              placeholder="VD: nguyen_van_a"
              value={formData.username}
              onChange={(e) => {
                setFormData({ ...formData, username: e.target.value })
                if (errors.username) setErrors({ ...errors, username: '' })
              }}
              leftIcon={<User className="w-4 h-4 text-[var(--rogym-text-muted)]" />}
              error={!!errors.username}
              disabled={isSubmitting}
              autoComplete="username"
            />
          </FormField>

          {/* Mật khẩu & Xác nhận */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField
              label="Mật khẩu"
              htmlFor="password"
              required
              error={errors.password}
            >
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Tối thiểu 6 ký tự"
                value={formData.password}
                onChange={(e) => {
                  setFormData({ ...formData, password: e.target.value })
                  if (errors.password) setErrors({ ...errors, password: '' })
                }}
                leftIcon={<Lock className="w-4 h-4 text-[var(--rogym-text-muted)]" />}
                showPasswordToggle
                error={!!errors.password}
                disabled={isSubmitting}
                autoComplete="new-password"
              />
            </FormField>

            <FormField
              label="Xác nhận mật khẩu"
              htmlFor="confirmPassword"
              required
              error={errors.confirmPassword}
            >
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Nhập lại mật khẩu"
                value={formData.confirmPassword}
                onChange={(e) => {
                  setFormData({ ...formData, confirmPassword: e.target.value })
                  if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' })
                }}
                leftIcon={<Lock className="w-4 h-4 text-[var(--rogym-text-muted)]" />}
                showPasswordToggle
                error={!!errors.confirmPassword}
                disabled={isSubmitting}
                autoComplete="new-password"
              />
            </FormField>
          </div>

          {/* Collapsible Optional Information */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setShowOptionalFields(!showOptionalFields)}
              className="flex items-center justify-between w-full py-2 px-3 text-xs font-semibold text-[var(--rogym-teal)] bg-white/5 hover:bg-white/10 rounded-lg border border-[var(--rogym-border-subtle)] transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                {showOptionalFields ? 'Thu gọn thông tin cá nhân' : 'Bổ sung thông tin cá nhân (Tùy chọn)'}
              </span>
              {showOptionalFields ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>

            {showOptionalFields && (
              <div className="space-y-3 pt-3 p-3 mt-2 rounded-xl bg-black/20 border border-[var(--rogym-border-subtle)] animate-in fade-in zoom-in-95 duration-150">
                {/* Số điện thoại */}
                <FormField
                  label="Số điện thoại"
                  htmlFor="phone"
                  error={errors.phone}
                >
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="VD: 0912345678"
                    value={formData.phone}
                    onChange={(e) => {
                      setFormData({ ...formData, phone: e.target.value })
                      if (errors.phone) setErrors({ ...errors, phone: '' })
                    }}
                    leftIcon={<Phone className="w-4 h-4 text-[var(--rogym-text-muted)]" />}
                    error={!!errors.phone}
                    disabled={isSubmitting}
                    autoComplete="tel"
                  />
                </FormField>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Giới tính */}
                  <FormField label="Giới tính" htmlFor="gender">
                    <Select
                      value={formData.gender}
                      onValueChange={(val) => setFormData({ ...formData, gender: val })}
                      disabled={isSubmitting}
                    >
                      <option value="">Chọn giới tính</option>
                      <option value="Nam">Nam</option>
                      <option value="Nữ">Nữ</option>
                      <option value="Khác">Khác</option>
                    </Select>
                  </FormField>

                  {/* Ngày sinh */}
                  <FormField label="Ngày sinh" htmlFor="birthday">
                    <Input
                      id="birthday"
                      name="birthday"
                      type="date"
                      value={formData.birthday}
                      onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
                      leftIcon={<Calendar className="w-4 h-4 text-[var(--rogym-text-muted)]" />}
                      disabled={isSubmitting}
                      className="text-xs"
                    />
                  </FormField>
                </div>
              </div>
            )}
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={isSubmitting}
            loadingText="Đang đăng ký tài khoản..."
            leftIcon={<UserPlus className="w-4 h-4" />}
            className="mt-4 shadow-lg shadow-[var(--rogym-green)]/25 hover:shadow-[var(--rogym-green)]/40 transition-all cursor-pointer"
          >
            Đăng ký tài khoản ngay
          </Button>
        </form>
      </CardContent>

      <CardFooter className="flex flex-col gap-2 pt-4 border-t border-[var(--rogym-border-subtle)] text-center">
        <p className="text-xs text-[var(--rogym-text-secondary)]">
          Đã có tài khoản thành viên?{' '}
          <Link
            to="/login"
            className="text-[var(--rogym-teal)] font-semibold hover:underline"
          >
            Đăng nhập ngay
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}

export default RegisterPage
