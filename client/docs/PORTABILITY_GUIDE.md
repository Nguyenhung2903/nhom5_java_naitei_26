# RoGym Portable Design System Kit — Hướng Dẫn Tích Hợp

Bộ Design System Kit độc lập (Self-contained, Pure UI Kit), hỗ trợ theme Dark Neon Emerald & Modern Glassmorphism, sẵn sàng mang sang bất kỳ dự án React + Tailwind CSS nào chỉ trong 3 bước.

---

## 📦 Danh Sách Thành Phần Có Sẵn

1. **20+ UI Components Chuẩn Production**:
   - `Accordion`, `Alert`, `Avatar`, `Badge`, `Button`, `Card`, `Checkbox`, `ConfirmDialog`, `DatePickerInput`, `DateTimePickerInput`, `FilterDropdown`, `FormField`, `Input`, `Modal`, `PageUI` (`Page`, `PageHeader`, `PageSkeleton`, `PageEmptyState`, `PageErrorState`), `Pagination`, `ProgressBar`, `ResponsiveTable`, `SearchInput`, `SearchToolbar`, `Select`, `Skeleton`, `StatCard`, `StatusBadge`, `Stepper`, `Switch`, `Table`, `Tabs`, `Textarea`.
2. **Tailwind Dual Preset**: Hỗ trợ cả ESM (`preset/index.js`) và CommonJS (`preset/index.cjs`).
3. **CSS Bundle Hoàn Chỉnh**: Gộp Tokens, Typography, Utilities, Animations và Component styles vào 1 file `styles/rogym-theme.css`.
4. **JS Token Colors**: Bridge mã màu cho Recharts, ChartJS và Canvas trong `styles/token-values.ts`.
5. **Tiện ích Tailwind**: Hàm `cn()` độc lập trong `utils/cn.ts`.

---

## 🚀 Hướng Dẫn 3 Bước Tích Hợp Vào Dự Án Mới

### Bước 1: Copy Thư Mục
Copy toàn bộ thư mục `design-system-kit` vào thư mục `src/design-system` của dự án mới:
```text
my-new-project/
└── src/
    └── design-system/
        ├── components/
        ├── styles/
        ├── preset/
        ├── utils/
        └── index.ts
```

---

### Bước 2: Cài Đặt Dependencies Cần Thiết

Chạy lệnh cài đặt các thư viện phụ trợ:
```bash
# 1. Tiện ích class & icons
npm i clsx tailwind-merge lucide-react tw-animate-css

# 2. Primitives & Date Picker
npm i radix-ui react-day-picker date-fns
```

---

### Bước 3: Cấu Hình Tailwind & Import Theme CSS

#### A. Cấu hình `tailwind.config.js` (hoặc `tailwind.config.cjs`)
* **Dự án ESM (Vite / Next.js app router)**:
  ```js
  import rogymPreset from './src/design-system/preset/index.js'

  /** @type {import('tailwindcss').Config} */
  export default {
    presets: [rogymPreset],
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    theme: {
      extend: {},
    },
    plugins: [],
  }
  ```

* **Dự án CommonJS**:
  ```js
  const rogymPreset = require('./src/design-system/preset/index.cjs')

  /** @type {import('tailwindcss').Config} */
  module.exports = {
    presets: [rogymPreset],
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    theme: {
      extend: {},
    },
    plugins: [],
  }
  ```

#### B. Import CSS Bundle trong `main.tsx` hoặc `App.tsx` (hoặc `index.css`)
```tsx
// main.tsx hoặc App.tsx
import './design-system/styles/rogym-theme.css'
```

---

## 💻 Hướng Dẫn Sử Dụng Trong Code

Toàn bộ components, types và utilities đều được export từ Single Entry Point:

```tsx
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Alert,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Stepper,
  DatePickerInput,
  ResponsiveTable,
  cn,
  TOKEN_COLORS,
} from '@/design-system' // hoặc relative './design-system'

export function DashboardExample() {
  return (
    <div className="p-6 space-y-6 bg-rogym-bg-base min-h-screen text-rogym-text-primary">
      <Alert tone="info" title="Chào mừng bạn!">
        Hệ thống Design System đã sẵn sàng hoạt động.
      </Alert>

      <Card variant="default">
        <CardHeader>
          <CardTitle>Bảng Điều Khiển</CardTitle>
        </CardHeader>
        <CardContent>
          <Button variant="primary">Hành Động Chính</Button>
        </CardContent>
      </Card>
    </div>
  )
}
```

---

## 🛡️ Đảm Bảo Tính Độc Lập
- **100% Relative Imports**: Không phụ thuộc vào path alias `@/`.
- **Zero Domain Coupling**: Không phụ thuộc vào API, Redux/Zustand store hay i18n chuyên biệt của dự án gốc.
