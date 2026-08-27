import { useState, useEffect, useMemo, type FormEvent } from 'react'
import { format, parse, isValid } from 'date-fns'
import { ApiError } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'
import { authService } from '@/services/authService'
import { userService } from '@/services/userService'
import { bookingService, type MyBookingResponse } from '@/services/bookingService'
import {
  Page,
  PageHeader,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  FormField,
  Input,
  Select,
  DatePickerInput,
  Button,
  Alert,
  AlertTitle,
  AlertDescription,
  Avatar,
  Badge,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
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
  Award,
  Ticket,
  Sparkles,
  ShieldCheck,
  Check,
} from 'lucide-react'

// Avatar Presets curated for quick selection
const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
]

function formatDisplayDate(dateStr?: string): string {
  if (!dateStr) return 'Chưa cập nhật'
  try {
    const parsed = parse(dateStr, 'yyyy-MM-dd', new Date())
    if (isValid(parsed)) {
      return format(parsed, 'dd/MM/yyyy')
    }
  } catch {
    // fallback
  }
  return dateStr
}

export interface ProfilePageProps {
  showMemberStats?: boolean
}

export function ProfilePage({ showMemberStats }: ProfilePageProps = {}) {
  const { user, refreshProfile, setUserSession } = useAuth()

  const shouldShowMemberStats = showMemberStats ?? (user?.role !== 'ADMIN')

  // Active tab state
  const [activeTab, setActiveTab] = useState('personal')

  // Bookings & Membership statistics state
  const [bookings, setBookings] = useState<MyBookingResponse[]>([])

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
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({})
  const [passwordSuccessMsg, setPasswordSuccessMsg] = useState<string | null>(null)
  const [passwordErrorMsg, setPasswordErrorMsg] = useState<string | null>(null)
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  // Tự động đồng bộ lại thông tin hồ sơ và điểm thưởng mới nhất từ server khi vào trang
  useEffect(() => {
    void refreshProfile()
  }, [refreshProfile])

  // Fetch bookings for membership calculations only when needed
  useEffect(() => {
    if (!shouldShowMemberStats) return

    const fetchBookings = async () => {
      try {
        const data = await bookingService.getMyBookings()
        setBookings(data || [])
      } catch {
        setBookings([])
      }
    }
    fetchBookings()
  }, [shouldShowMemberStats])

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

  // Compute membership stats
  const membershipPoints = user?.points ?? 0

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
    } else if (profileForm.username.trim().length > 50) {
      errors.username = 'Tên đăng nhập không được vượt quá 50 ký tự'
    }

    if (!profileForm.fullName.trim()) {
      errors.fullName = 'Họ và tên không được để trống'
    } else if (profileForm.fullName.trim().length > 255) {
      errors.fullName = 'Họ và tên không được vượt quá 255 ký tự'
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
      const authData = await userService.updateMyProfile({
        username: profileForm.username.trim(),
        fullName: profileForm.fullName.trim(),
        phone: profileForm.phone.trim() || undefined,
        birthday: profileForm.birthday || undefined,
        gender: profileForm.gender || undefined,
        avatar: profileForm.avatar.trim() || undefined,
      })

      if (setUserSession) {
        setUserSession(authData)
      } else {
        await refreshProfile()
      }

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
    if (!passwordData.currentPassword) {
      errors.currentPassword = 'Vui lòng nhập mật khẩu hiện tại'
    }
    if (!passwordData.newPassword) {
      errors.newPassword = 'Vui lòng nhập mật khẩu mới'
    } else if (passwordData.newPassword.length < 6) {
      errors.newPassword = 'Mật khẩu mới phải có ít nhất 6 ký tự'
    } else if (
      passwordData.currentPassword &&
      passwordData.newPassword === passwordData.currentPassword
    ) {
      errors.newPassword = 'Mật khẩu mới không được trùng với mật khẩu hiện tại'
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
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        confirmPassword: passwordData.confirmPassword,
      })
      setPasswordSuccessMsg('Đổi mật khẩu thành công!')
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setPasswordErrors({})
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        const responseData = err.data as { errors?: Array<{ field: string; message: string }> } | undefined
        if (responseData?.errors && Array.isArray(responseData.errors) && responseData.errors.length > 0) {
          const fieldErrors: Record<string, string> = {}
          for (const item of responseData.errors) {
            if (item.field && item.message) {
              fieldErrors[item.field] = item.message
            }
          }
          setPasswordErrors(fieldErrors)
          setPasswordErrorMsg(err.message || 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.')
        } else {
          setPasswordErrorMsg(err.message)
        }
      } else if (err instanceof Error) {
        setPasswordErrorMsg(err.message)
      } else {
        setPasswordErrorMsg('Không thể đổi mật khẩu. Vui lòng kiểm tra lại.')
      }
    } finally {
      setIsChangingPassword(false)
    }
  }

  const todayStr = useMemo(() => format(new Date(), 'yyyy-MM-dd'), [])

  return (
    <Page className="max-w-6xl">
      {/* Page Header */}
      <PageHeader
        eyebrow="Member Portal"
        title="Hồ Sơ Cá Nhân"
        description="Quản lý thông tin tài khoản, cấp bậc thành viên và thiết lập bảo mật"
      />

      {/* Main Grid: Left Hub Column & Right Content Column */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Membership VIP Hub Card (4/12 on lg) */}
        <div className="lg:col-span-4 space-y-5">
          {/* Main VIP Membership Profile Card */}
          <Card
            variant="glass"
            padding="lg"
            className="relative overflow-hidden flex flex-col items-center text-center border-[var(--rogym-green)]/20 shadow-xl"
          >
            {/* Background Accent Glow */}
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-[var(--rogym-green)]/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-[var(--rogym-teal)]/15 rounded-full blur-3xl pointer-events-none" />

            <div className="relative mb-4">
              <Avatar
                name={isEditing ? profileForm.fullName || 'User' : user?.fullName || 'User'}
                src={isEditing ? profileForm.avatar || undefined : user?.avatar || undefined}
                size="2xl"
                border
                className="ring-4 ring-[var(--rogym-green)]/20 shadow-lg"
              />
            </div>

            <h2 className="text-xl font-bold text-white font-display tracking-tight">
              {isEditing ? profileForm.fullName || user?.fullName : user?.fullName}
            </h2>
            <p className="text-xs text-[var(--rogym-text-secondary)] font-mono mt-0.5">
              @{isEditing ? profileForm.username || user?.username : user?.username}
            </p>

            {/* Badges */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 mt-3">
              <Badge tone={user?.role === 'ADMIN' ? 'accent' : 'primary'} size="sm">
                {user?.role === 'ADMIN' ? 'Quản Trị Viên' : 'Khách Hàng'}
              </Badge>
              <Badge tone="success" size="sm">
                {user?.status || 'ACTIVE'}
              </Badge>
            </div>

            {/* Quick Member Stats */}
            {shouldShowMemberStats && (
              <div className="w-full grid grid-cols-2 gap-2.5 mt-6 pt-4 border-t border-white/10">
                <Card variant="compact" padding="xs" className="bg-white/[0.03] border-white/5 flex flex-col items-center justify-center text-center">
                  <div className="flex items-center justify-center gap-1 text-[11px] text-[var(--rogym-text-muted)]">
                    <Ticket className="w-3.5 h-3.5 text-[var(--rogym-green)]" />
                    <span>Vé đã xem</span>
                  </div>
                  <p className="text-base font-bold text-white mt-1">{bookings.length}</p>
                </Card>

                <Card variant="compact" padding="xs" className="bg-white/[0.03] border-white/5 flex flex-col items-center justify-center text-center">
                  <div className="flex items-center justify-center gap-1 text-[11px] text-[var(--rogym-text-muted)]">
                    <Award className="w-3.5 h-3.5 text-[var(--rogym-teal)]" />
                    <span>Điểm thưởng</span>
                  </div>
                  <p className="text-base font-bold text-[var(--rogym-green)] mt-1">
                    {membershipPoints} pts
                  </p>
                </Card>
              </div>
            )}
          </Card>

          {/* Account Security Tip Alert */}
          <Alert
            variant="subtle"
            tone="info"
            icon={<ShieldCheck className="w-4 h-4 shrink-0 text-[var(--rogym-green)]" />}
            className="border-white/5 bg-white/[0.02]"
          >
            <AlertTitle className="text-xs font-semibold text-white">
              Tài khoản bảo vệ an toàn
            </AlertTitle>
            <AlertDescription className="text-[11px] text-[var(--rogym-text-muted)] leading-relaxed">
              Thông tin cá nhân & giao dịch vé được mã hóa bảo mật theo chuẩn CinemaNest.
            </AlertDescription>
          </Alert>
        </div>

        {/* RIGHT COLUMN: Unified Card with Tabs Header (8/12 on lg) */}
        <div className="lg:col-span-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} variant="pills">
            <Card variant="elevated" padding="lg">
              {/* Header with Title and Integrated Tabs/Actions */}
              <CardHeader className="p-0 pb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/5 mb-5">
                <div>
                  <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                    <UserIcon className="w-4 h-4 text-[var(--rogym-green)]" />
                    <span>{user?.role === 'ADMIN' ? 'Hồ Sơ Quản Trị Viên' : 'Hồ Sơ Thành Viên'}</span>
                  </CardTitle>
                  <CardDescription className="text-xs text-[var(--rogym-text-secondary)] mt-0.5">
                    {activeTab === 'personal'
                      ? isEditing
                        ? 'Chỉnh sửa thông tin cá nhân và ảnh đại diện của bạn'
                        : user?.role === 'ADMIN'
                          ? 'Chi tiết thông tin tài khoản quản trị CinemaNest'
                          : 'Chi tiết thông tin đăng ký thành viên CinemaNest'
                      : 'Thiết lập và đổi mật khẩu bảo mật tài khoản'}
                  </CardDescription>
                </div>

                <div className="flex items-center gap-2.5 flex-wrap">
                  <TabsList className="bg-black/40 p-1 border-white/10">
                    <TabsTrigger
                      value="personal"
                      leftIcon={<UserIcon className="w-3.5 h-3.5" />}
                      className="cursor-pointer text-xs py-1 px-2.5"
                    >
                      Thông tin
                    </TabsTrigger>
                    <TabsTrigger
                      value="security"
                      leftIcon={<Lock className="w-3.5 h-3.5" />}
                      className="cursor-pointer text-xs py-1 px-2.5"
                    >
                      Đổi mật khẩu
                    </TabsTrigger>
                  </TabsList>

                  {activeTab === 'personal' && !isEditing && (
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      leftIcon={<Edit3 className="w-3.5 h-3.5" />}
                      onClick={handleStartEdit}
                      className="cursor-pointer text-xs"
                    >
                      Chỉnh sửa
                    </Button>
                  )}
                </div>
              </CardHeader>

              <CardContent className="p-0">
                {/* TAB 1: Personal Information */}
                <TabsContent value="personal" className="mt-0">
                  <div className="space-y-5">
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
                      /* VIEW MODE: Structured Info Cards */
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        {/* Full Name */}
                        <Card variant="compact" padding="sm" className="bg-white/[0.02] border-white/5 hover:border-white/10 transition-colors">
                          <div className="flex items-center gap-2 text-xs text-[var(--rogym-text-muted)] mb-1">
                            <UserIcon className="w-3.5 h-3.5 text-[var(--rogym-green)]" />
                            <span>Họ và tên</span>
                          </div>
                          <p className="text-sm font-semibold text-white">{user?.fullName || '-'}</p>
                        </Card>

                        {/* Username */}
                        <Card variant="compact" padding="sm" className="bg-white/[0.02] border-white/5 hover:border-white/10 transition-colors">
                          <div className="flex items-center gap-2 text-xs text-[var(--rogym-text-muted)] mb-1">
                            <Sparkles className="w-3.5 h-3.5 text-[var(--rogym-green)]" />
                            <span>Tên đăng nhập</span>
                          </div>
                          <p className="text-sm font-semibold text-white font-mono">@{user?.username || '-'}</p>
                        </Card>

                        {/* Email */}
                        <Card variant="compact" padding="sm" className="bg-white/[0.02] border-white/5 hover:border-white/10 transition-colors">
                          <div className="flex items-center gap-2 text-xs text-[var(--rogym-text-muted)] mb-1">
                            <Mail className="w-3.5 h-3.5 text-[var(--rogym-teal)]" />
                            <span>Địa chỉ Email</span>
                          </div>
                          <p className="text-sm font-semibold text-white break-all">{user?.email || '-'}</p>
                        </Card>

                        {/* Phone */}
                        <Card variant="compact" padding="sm" className="bg-white/[0.02] border-white/5 hover:border-white/10 transition-colors">
                          <div className="flex items-center gap-2 text-xs text-[var(--rogym-text-muted)] mb-1">
                            <Phone className="w-3.5 h-3.5 text-[var(--rogym-teal)]" />
                            <span>Số điện thoại</span>
                          </div>
                          <p className="text-sm font-semibold text-white">
                            {user?.phone || <span className="text-[var(--rogym-text-muted)] font-normal italic">Chưa cập nhật</span>}
                          </p>
                        </Card>

                        {/* Gender */}
                        <Card variant="compact" padding="sm" className="bg-white/[0.02] border-white/5 hover:border-white/10 transition-colors">
                          <div className="flex items-center gap-2 text-xs text-[var(--rogym-text-muted)] mb-1">
                            <UserIcon className="w-3.5 h-3.5 text-[var(--rogym-green)]" />
                            <span>Giới tính</span>
                          </div>
                          <p className="text-sm font-semibold text-white">{user?.gender || 'Chưa cập nhật'}</p>
                        </Card>

                        {/* Birthday */}
                        <Card variant="compact" padding="sm" className="bg-white/[0.02] border-white/5 hover:border-white/10 transition-colors">
                          <div className="flex items-center gap-2 text-xs text-[var(--rogym-text-muted)] mb-1">
                            <Calendar className="w-3.5 h-3.5 text-[var(--rogym-teal)]" />
                            <span>Ngày sinh</span>
                          </div>
                          <p className="text-sm font-semibold text-white">
                            {user?.birthday ? (
                              formatDisplayDate(user.birthday)
                            ) : (
                              <span className="text-[var(--rogym-text-muted)] font-normal italic">Chưa cập nhật</span>
                            )}
                          </p>
                        </Card>
                      </div>
                    ) : (
                      /* EDIT MODE FORM */
                      <form onSubmit={handleProfileSubmit} className="space-y-5">
                        {/* Avatar Picker & Preview Section */}
                        <Card variant="compact" padding="sm" className="bg-white/[0.02] border-white/5 space-y-3">
                          <label className="text-xs font-semibold text-white flex items-center gap-1.5">
                            <ImageIcon className="w-4 h-4 text-[var(--rogym-green)]" />
                            <span>Ảnh đại diện (Avatar)</span>
                          </label>

                          <div className="flex flex-col sm:flex-row items-center gap-4">
                            <Avatar
                              name={profileForm.fullName || 'User'}
                              src={profileForm.avatar || undefined}
                              size="xl"
                              border
                              className="shrink-0 ring-2 ring-[var(--rogym-green)]/30"
                            />
                            <div className="flex-1 w-full space-y-2">
                              <Input
                                id="editAvatar"
                                placeholder="Dán link ảnh đại diện (URL) hoặc chọn mẫu bên dưới..."
                                value={profileForm.avatar}
                                onChange={(e) => setProfileForm({ ...profileForm, avatar: e.target.value })}
                                disabled={isSavingProfile}
                              />
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-[11px] text-[var(--rogym-text-muted)]">Gợi ý mẫu:</span>
                                {AVATAR_PRESETS.map((presetUrl, idx) => (
                                  <button
                                    key={idx}
                                    type="button"
                                    onClick={() => setProfileForm({ ...profileForm, avatar: presetUrl })}
                                    className={`w-7 h-7 rounded-full overflow-hidden border-2 transition-all cursor-pointer ${profileForm.avatar === presetUrl
                                        ? 'border-[var(--rogym-green)] scale-110 shadow-md'
                                        : 'border-white/20 opacity-70 hover:opacity-100'
                                      }`}
                                    title={`Mẫu ảnh ${idx + 1}`}
                                  >
                                    <img src={presetUrl} alt="Preset" className="w-full h-full object-cover" />
                                  </button>
                                ))}
                                {profileForm.avatar && (
                                  <Button
                                    type="button"
                                    variant="text"
                                    size="xs"
                                    onClick={() => setProfileForm({ ...profileForm, avatar: '' })}
                                    className="text-red-400 hover:text-red-300 ml-1 px-1 py-0 h-auto cursor-pointer"
                                  >
                                    Xóa ảnh
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </Card>

                        {/* Text Fields */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                              className="opacity-60 cursor-not-allowed bg-black/40"
                            />
                          </FormField>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <FormField
                            label="Ngày sinh"
                            htmlFor="editBirthday"
                          >
                            <DatePickerInput
                              value={profileForm.birthday}
                              onChange={(val) => setProfileForm({ ...profileForm, birthday: val })}
                              placeholder="DD/MM/YYYY"
                              min="1900-01-01"
                              max={todayStr}
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

                        {/* Action Buttons */}
                        <CardFooter className="flex items-center justify-end gap-3 p-0 pt-3 border-t border-white/5">
                          <Button
                            type="button"
                            variant="secondary"
                            size="md"
                            leftIcon={<X className="w-4 h-4" />}
                            onClick={handleCancelEdit}
                            disabled={isSavingProfile}
                            className="cursor-pointer"
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
                            className="cursor-pointer"
                          >
                            Lưu thay đổi
                          </Button>
                        </CardFooter>
                      </form>
                    )}
                  </div>
                </TabsContent>

                {/* TAB 2: Security & Password */}
                <TabsContent value="security" className="mt-0">
                  <div className="space-y-5">
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

                    <form onSubmit={handlePasswordChange} className="space-y-4 max-w-xl">
                      <FormField
                        label="Mật khẩu hiện tại"
                        htmlFor="currentPassword"
                        required
                        error={passwordErrors.currentPassword}
                      >
                        <Input
                          id="currentPassword"
                          type="password"
                          autoComplete="current-password"
                          showPasswordToggle
                          placeholder="Nhập mật khẩu đang sử dụng"
                          value={passwordData.currentPassword}
                          onChange={(e) => {
                            setPasswordData({ ...passwordData, currentPassword: e.target.value })
                            if (passwordErrors.currentPassword)
                              setPasswordErrors({ ...passwordErrors, currentPassword: '' })
                            if (passwordSuccessMsg) setPasswordSuccessMsg(null)
                            if (passwordErrorMsg) setPasswordErrorMsg(null)
                          }}
                          error={!!passwordErrors.currentPassword}
                          disabled={isChangingPassword}
                        />
                      </FormField>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField
                          label="Mật khẩu mới"
                          htmlFor="newPassword"
                          required
                          error={passwordErrors.newPassword}
                        >
                          <Input
                            id="newPassword"
                            type="password"
                            autoComplete="new-password"
                            showPasswordToggle
                            placeholder="Tối thiểu 6 ký tự"
                            value={passwordData.newPassword}
                            onChange={(e) => {
                              setPasswordData({ ...passwordData, newPassword: e.target.value })
                              if (passwordErrors.newPassword)
                                setPasswordErrors({ ...passwordErrors, newPassword: '' })
                              if (passwordSuccessMsg) setPasswordSuccessMsg(null)
                              if (passwordErrorMsg) setPasswordErrorMsg(null)
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
                            autoComplete="new-password"
                            showPasswordToggle
                            placeholder="Nhập lại mật khẩu mới"
                            value={passwordData.confirmPassword}
                            onChange={(e) => {
                              setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                              if (passwordErrors.confirmPassword)
                                setPasswordErrors({ ...passwordErrors, confirmPassword: '' })
                              if (passwordSuccessMsg) setPasswordSuccessMsg(null)
                              if (passwordErrorMsg) setPasswordErrorMsg(null)
                            }}
                            error={!!passwordErrors.confirmPassword}
                            disabled={isChangingPassword}
                          />
                        </FormField>
                      </div>

                      {/* Password tips as Alert */}
                      <Alert
                        variant="subtle"
                        tone="neutral"
                        icon={<Check className="w-4 h-4 text-[var(--rogym-green)]" />}
                        className="border-white/5 bg-white/[0.02]"
                      >
                        <AlertTitle className="text-xs font-semibold text-white">
                          Yêu cầu mật khẩu an toàn:
                        </AlertTitle>
                        <AlertDescription className="text-[11px] text-[var(--rogym-text-muted)] mt-1">
                          <ul className="list-disc list-inside space-y-0.5 pl-1">
                            <li>Độ dài ít nhất 6 ký tự</li>
                            <li>Nên kết hợp chữ cái hoa, chữ thường và số</li>
                          </ul>
                        </AlertDescription>
                      </Alert>

                      <div className="pt-2">
                        <Button
                          type="submit"
                          variant="primary"
                          size="md"
                          loading={isChangingPassword}
                          loadingText="Đang cập nhật..."
                          leftIcon={<Shield className="w-4 h-4" />}
                          className="cursor-pointer"
                        >
                          Cập nhật mật khẩu
                        </Button>
                      </div>
                    </form>
                  </div>
                </TabsContent>
              </CardContent>
            </Card>
          </Tabs>
        </div>
      </div>
    </Page>
  )
}

export default ProfilePage
