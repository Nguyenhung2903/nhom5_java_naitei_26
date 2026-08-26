import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { getSafeRedirectUrl } from '@/routes/authRedirect'
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
} from '@/components/ui'
import { Mail, Lock, LogIn, Sparkles, AlertCircle } from 'lucide-react'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirectUrl = searchParams.get('redirect')
  const isLocked = searchParams.get('reason') === 'account_locked' || searchParams.get('locked') === 'true'
  const [showLockedAlert, setShowLockedAlert] = useState(isLocked)

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [serverError, setServerError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validate = (): boolean => {
    const nextErrors: Record<string, string> = {}
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!formData.email.trim()) {
      nextErrors.email = 'Vui lòng nhập địa chỉ email'
    } else if (!emailRegex.test(formData.email.trim())) {
      nextErrors.email = 'Địa chỉ email không đúng định dạng (VD: example@email.com)'
    }

    if (!formData.password) {
      nextErrors.password = 'Vui lòng nhập mật khẩu'
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setServerError(null)
    setShowLockedAlert(false)

    if (!validate()) return

    setIsSubmitting(true)
    try {
      const user = await login({
        email: formData.email.trim(),
        password: formData.password,
      })

      // Điều hướng an toàn theo vai trò của người dùng
      const targetUrl = getSafeRedirectUrl(user.role, redirectUrl)
      navigate(targetUrl, { replace: true })
    } catch (err: unknown) {
      if (err instanceof Error) {
        setServerError(err.message)
      } else {
        setServerError('Đăng nhập thất bại. Vui lòng kiểm tra lại tài khoản hoặc mật khẩu.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card variant="glass" className="border-[var(--rogym-border-focus)] shadow-2xl p-2 sm:p-4">
      <CardHeader className="text-center pb-4">
        <div className="mx-auto w-12 h-12 rounded-2xl bg-[var(--rogym-green)]/15 border border-[var(--rogym-green)]/40 flex items-center justify-center text-[var(--rogym-green)] mb-3 shadow-lg shadow-[var(--rogym-green)]/10">
          <LogIn className="w-6 h-6" />
        </div>
        <CardTitle className="text-2xl font-bold uppercase tracking-wide text-white">
          Đăng Nhập
        </CardTitle>
        <CardDescription className="text-xs text-[var(--rogym-text-secondary)] mt-1">
          Nhập địa chỉ email để trải nghiệm đặt vé và quản lý hệ thống
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {showLockedAlert && !serverError && (
          <Alert tone="error" icon={<AlertCircle className="w-4 h-4" />}>
            <AlertDescription>
              Tài khoản của bạn đã bị khóa hoặc tạm ngưng hoạt động. Vui lòng liên hệ ban quản trị để được hỗ trợ.
            </AlertDescription>
          </Alert>
        )}

        {serverError && (
          <Alert tone="error" icon={<AlertCircle className="w-4 h-4" />}>
            <AlertDescription>{serverError}</AlertDescription>
          </Alert>
        )}

        <form id="login-form" onSubmit={handleSubmit} className="space-y-4">
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
              placeholder="Nhập mật khẩu của bạn"
              value={formData.password}
              onChange={(e) => {
                setFormData({ ...formData, password: e.target.value })
                if (errors.password) setErrors({ ...errors, password: '' })
              }}
              leftIcon={<Lock className="w-4 h-4 text-[var(--rogym-text-muted)]" />}
              showPasswordToggle
              error={!!errors.password}
              disabled={isSubmitting}
              autoComplete="current-password"
            />
          </FormField>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={isSubmitting}
            loadingText="Đang xác thực..."
            leftIcon={<LogIn className="w-4 h-4" />}
            className="mt-2 shadow-lg shadow-[var(--rogym-green)]/25 hover:shadow-[var(--rogym-green)]/40 transition-all cursor-pointer"
          >
            Đăng nhập ngay
          </Button>
        </form>
      </CardContent>

      <CardFooter className="flex flex-col gap-3 pt-4 border-t border-[var(--rogym-border-subtle)] text-center">
        <p className="text-xs text-[var(--rogym-text-secondary)]">
          Chưa có tài khoản khách hàng?{' '}
          <Link
            to="/register"
            className="text-[var(--rogym-teal)] font-semibold hover:underline inline-flex items-center gap-1"
          >
            <Sparkles className="w-3 h-3" /> Đăng ký thành viên mới
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}

export default LoginPage
