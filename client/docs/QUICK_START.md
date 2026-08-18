# RoGym Design System Kit — Quick Start Guide

> **Bắt đầu nhanh trong 5 phút.** Hướng dẫn từng bước cách sử dụng RoGym Design System Kit trong dự án React + Tailwind CSS của bạn.

---

## 1. Cấu Trúc & Quy Ước Import

Toàn bộ UI Components, utilities và token values đều được export từ Single Entry Point:

```tsx
import {
  // Components
  Button,
  Input,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Table,
  ResponsiveTable,
  Modal,
  ConfirmDialog,
  Alert,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Stepper,
  DatePickerInput,
  DateTimePickerInput,
  Select,
  Switch,
  Checkbox,
  Badge,
  StatusBadge,
  Avatar,
  ProgressBar,
  Skeleton,
  
  // Utilities
  cn,
  
  // Token Values cho Chart & Canvas
  TOKEN_COLORS,
} from '@/design-system' // Hoặc './design-system' tùy theo alias dự án
```

---

## 2. Tạo Trang Dashboard & Bảng Dữ Liệu (Ví Dụ Mẫu)

```tsx
import { useState } from 'react'
import {
  Page,
  PageHeader,
  ResponsiveTable,
  Button,
  StatusBadge,
  Card,
  type ColumnDef,
} from '@/design-system'
import { Plus, RefreshCw, User } from 'lucide-react'

interface UserItem {
  id: string
  name: string
  email: string
  status: string
  role: string
}

export function UserManagementPage() {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<UserItem[]>([
    { id: '1', name: 'Nguyễn Văn A', email: 'a@example.com', status: 'active', role: 'Admin' },
    { id: '2', name: 'Trần Thị B', email: 'b@example.com', status: 'pending', role: 'Member' },
  ])

  const columns: ColumnDef<UserItem>[] = [
    {
      key: 'name',
      header: 'Họ và tên',
      render: (item) => (
        <div className="flex items-center gap-2 font-medium">
          <User size={16} className="text-rogym-teal" />
          <span>{item.name}</span>
        </div>
      ),
    },
    { key: 'email', header: 'Email' },
    { key: 'role', header: 'Vai trò' },
    {
      key: 'status',
      header: 'Trạng thái',
      render: (item) => <StatusBadge status={item.status} size="sm" />,
    },
  ]

  return (
    <Page>
      <PageHeader
        title="Quản Lý Người Dùng"
        description="Danh sách tài khoản và phân quyền trong hệ thống"
        actions={
          <div className="flex gap-2">
            <Button variant="outline-white" leftIcon={<RefreshCw size={16} />}>
              Làm mới
            </Button>
            <Button variant="primary" leftIcon={<Plus size={16} />}>
              Thêm người dùng
            </Button>
          </div>
        }
      />

      <Card variant="default">
        <ResponsiveTable
          columns={columns}
          data={data}
          keyExtractor={(item) => item.id}
          loading={loading}
          emptyTitle="Chưa có người dùng nào"
          onRowClick={(item) => console.log('Click item:', item)}
        />
      </Card>
    </Page>
  )
}
```

---

## 3. Tạo Form Nhập Liệu & Modal Xác Nhận

```tsx
import { useState } from 'react'
import {
  FormField,
  Input,
  Select,
  DatePickerInput,
  Button,
  ConfirmDialog,
} from '@/design-system'

export function CreateUserForm() {
  const [fullName, setFullName] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [role, setRole] = useState('member')
  const [showConfirm, setShowConfirm] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setShowConfirm(true)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <FormField label="Họ và tên" required>
        <Input
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Nhập họ và tên"
        />
      </FormField>

      <FormField label="Ngày sinh">
        <DatePickerInput
          value={birthDate}
          onChange={setBirthDate}
          placeholder="DD/MM/YYYY"
        />
      </FormField>

      <FormField label="Vai trò">
        <Select
          value={role}
          onValueChange={setRole}
        >
          <option value="admin">Quản trị viên (Admin)</option>
          <option value="member">Hội viên (Member)</option>
          <option value="guest">Khách vãng lai</option>
        </Select>
      </FormField>

      <Button type="submit" variant="primary" fullWidth>
        Lưu thông tin
      </Button>

      <ConfirmDialog
        open={showConfirm}
        onOpenChange={setShowConfirm}
        title="Xác nhận lưu dữ liệu"
        description={`Bạn có chắc muốn thêm người dùng ${fullName}?`}
        confirmLabel="Đồng ý"
        cancelLabel="Hủy"
        onConfirm={() => {
          console.log('Saved!')
          setShowConfirm(false)
        }}
      />
    </form>
  )
}
```

---

## 4. Hệ Thống Màu Sắc & Class Tiện Ích Tailwind

### A. Màu Sắc Thương Hiệu (`colors.rogym`)
- `bg-rogym-bg-base`: Nền chính siêu tối (`#080e0b`).
- `bg-rogym-bg-card`: Nền thẻ card (`#0f1c16`).
- `bg-rogym-bg-elevated`: Nền dropdown / popover (`#1a2520`).
- `text-rogym-green` / `bg-rogym-green`: Xanh ngọc lục bảo phát sáng (`#06c384`).
- `text-rogym-teal`: Xanh biển ngọc điểm nhấn (`#42e09e`).
- `text-rogym-text-primary`: Chữ trắng nổi bật (`#ffffff`).
- `text-rogym-text-secondary`: Chữ ngọc xám (`#bbcabf`).
- `text-rogym-text-muted`: Chữ mờ (`#8ab89c`).

### B. Sử Dụng Màu Sắc Trong Charts (Recharts / ChartJS)
```tsx
import { TOKEN_COLORS } from '@/design-system'
import { LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts'

export function ChartExample({ data }: { data: any[] }) {
  return (
    <LineChart data={data} width={500} height={300}>
      <XAxis dataKey="date" stroke={TOKEN_COLORS.textMuted} />
      <YAxis stroke={TOKEN_COLORS.textMuted} />
      <Tooltip contentStyle={{ backgroundColor: TOKEN_COLORS.bgCard }} />
      <Line
        type="monotone"
        dataKey="value"
        stroke={TOKEN_COLORS.green}
        strokeWidth={2}
      />
    </LineChart>
  )
}
```

---

## 5. Tra Cứu Toàn Diện

Để xem đặc tả chi tiết từng component, các biến thể (variants), props và accessibility, vui lòng mở file [`UI_COMPONENTS.md`](./UI_COMPONENTS.md).
