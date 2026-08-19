import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
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
} from '@/components/ui'
import { User, Lock, LogIn, Sparkles, AlertCircle } from 'lucide-react'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirectUrl = searchParams.get('redirect')

  const [formData, setFormData] = useState({
    usernameOrEmail: '',
    password: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [serverError, setServerError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validate = (): boolean => {
    const nextErrors: Record<string, string> = {}

    if (!formData.usernameOrEmail.trim()) {
      nextErrors.usernameOrEmail = 'Vui lòng nhập tên đăng nhập hoặc email'
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

    if (!validate()) return

    setIsSubmitting(true)
    try {
      const user = await login({
        usernameOrEmail: formData.usernameOrEmail.trim(),
        password: formData.password,
      })

      // Điều hướng sau khi đăng nhập thành công
      if (redirectUrl) {
        navigate(redirectUrl, { replace: true })
      } else if (user.role === 'ADMIN') {
        navigate('/admin', { replace: true })
      } else {
        navigate('/', { replace: true })
      }
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
          Nhập tài khoản để trải nghiệm đặt vé và quản lý hệ thống
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {serverError && (
          <Alert tone="error" icon={<AlertCircle className="w-4 h-4" />}>
            <AlertDescription>{serverError}</AlertDescription>
          </Alert>
        )}

        <form id="login-form" onSubmit={handleSubmit} className="space-y-4">
          <FormField
            label="Tên đăng nhập hoặc Email"
            htmlFor="usernameOrEmail"
            required
            error={errors.usernameOrEmail}
          >
            <Input
              id="usernameOrEmail"
              name="usernameOrEmail"
              placeholder="VD: admin hoặc nguyenvana@gmail.com"
              value={formData.usernameOrEmail}
              onChange={(e) => {
                setFormData({ ...formData, usernameOrEmail: e.target.value })
                if (errors.usernameOrEmail) setErrors({ ...errors, usernameOrEmail: '' })
              }}
              leftIcon={<User className="w-4 h-4 text-[var(--rogym-text-muted)]" />}
              error={!!errors.usernameOrEmail}
              disabled={isSubmitting}
              autoComplete="username"
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
