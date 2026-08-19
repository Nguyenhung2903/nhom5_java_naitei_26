# 🎬 Movie Ticket Booking - Frontend (Client)

> Dự án Frontend cho hệ thống Đặt vé xem phim (**Movie Ticket Booking**) - Nhóm 5, khóa học Sun* Java NAITEI 26.

---

## 📑 Mục Lục
0. 📘 **[Cẩm Nang Quy Chuẩn Thiết Kế & Phát Triển Frontend (DEVELOPMENT_GUIDELINES.md)](docs/DEVELOPMENT_GUIDELINES.md)** ⭐ *(Bắt buộc đọc khi Onboarding)*
1. [Giới Thiệu & Công Nghệ](#-giới-thiệu--công-nghệ)
2. [Yêu Cầu Môi Trường](#-yêu-cầu-môi-trường)
3. [Hướng Dẫn Cài Đặt & Khởi Chạy](#-hướng-dẫn-cài-đặt--khởi-chạy)
4. [Cấu Hình Môi Trường & Kết Nối Backend](#-cấu-hình-môi-trường--kết-nối-backend)
5. [Cấu Trúc Thư Mục Dự Án](#-cấu-trúc-thư-mục-dự-án)
6. [Hệ Thống RoGym Design System (UI Kit)](#-hệ-thống-rogym-design-system-ui-kit)
7. [Quy Trình Phát Triển Một Chức Năng Mới](#-quy-trình-phát-triển-một-chức-năng-mới)
8. [Quy Chuẩn Code & Best Practices](#-quy-chuẩn-code--best-practices)
9. [Quy Ước Git & Quản Lý Task Trên Redmine](#-quy-ước-git--quản-lý-task-trên-redmine)

---

## 🚀 Giới Thiệu & Công Nghệ

Frontend được xây dựng với công nghệ hiện đại, tối ưu hiệu năng và trải nghiệm người dùng:

- **Core**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite 8](https://vitejs.dev/) (kèm React Compiler & Rolldown Babel Plugin)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) + CSS Variables Design Tokens
- **UI Primitives & Icons**: [Radix UI](https://www.radix-ui.com/), [Lucide React](https://lucide.dev/)
- **Routing**: [React Router v7](https://reactrouter.com/)
- **Date & Utilities**: [date-fns](https://date-fns.org/), `clsx`, `tailwind-merge`
- **Đa ngôn ngữ (i18n)**: [i18next](https://www.i18next.com/) + `react-i18next`
- **Design System**: RoGym Portable UI Kit (27+ components độc lập, chuẩn Production)

---

## 💻 Yêu Cầu Môi Trường

Trước khi bắt đầu, hãy đảm bảo máy tính đã cài đặt:
- **Node.js**: Phiên bản `20.x LTS` hoặc `22.x LTS` trở lên ([Tải Node.js](https://nodejs.org/))
- **Trình quản lý gói**: `npm` (đi kèm Node.js, khuyến nghị `>= 10.x`) hoặc `yarn`/`pnpm`

Kiểm tra phiên bản bằng terminal:
```bash
node -v
npm -v
```

---

## 🛠️ Hướng Dẫn Cài Đặt & Khởi Chạy

### 1. Di chuyển vào thư mục `client`
```bash
cd client
```

### 2. Cài đặt các thư viện phụ thuộc (Dependencies)
```bash
npm install
```

### 3. Tạo file cấu hình môi trường `.env`
Sao chép từ file mẫu `.env.example`:
- **Windows (PowerShell)**:
  ```powershell
  Copy-Item .env.example .env
  ```
- **macOS / Linux / Git Bash**:
  ```bash
  cp .env.example .env
  ```

### 4. Khởi chạy máy chủ phát triển (Development Server)
```bash
npm run dev
```
Sau khi chạy thành công, mở trình duyệt tại: **`http://localhost:5173`**

### 5. Các câu lệnh hữu ích khác
| Câu lệnh | Mô tả |
| :--- | :--- |
| `npm run dev` | Khởi chạy Vite Dev Server với Hot Module Replacement (HMR) |
| `npm run build` | Kiểm tra kiểu dữ liệu TypeScript (`tsc -b`) và biên dịch ra thư mục `dist/` |
| `npm run preview` | Chạy thử bản build production tại máy cục bộ |
| `npm run lint` | Quét kiểm tra lỗi cú pháp và quy chuẩn code với ESLint |

---

## ⚙️ Cấu Hình Môi Trường & Kết Nối Backend

### 1. Biến môi trường (`.env`)
Trong thư mục `client/.env`:
```env
# URL gốc trỏ tới Spring Boot Backend (chạy ở cổng 8080)
VITE_API_BASE_URL=http://localhost:8080/api

# Tên ứng dụng
VITE_APP_NAME="Movie Ticket Booking - Nhom 5"
VITE_APP_ENV=development
```

### 2. Cấu hình Vite Proxy (Tùy chọn cho Local Dev)
Để tránh hoàn toàn lỗi CORS khi dev, bạn có thể thiết lập proxy trong `vite.config.ts`:
```ts
// vite.config.ts
export default defineConfig({
  // ... plugins
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
```

---

## 📂 Cấu Trúc Thư Mục Dự Án

```
client/
├── docs/                      # 📚 Toàn bộ tài liệu chi tiết về Kiến Trúc & Design System
│   ├── DEVELOPMENT_GUIDELINES.md # 🌟 Cẩm nang quy chuẩn thiết kế & phát triển Frontend (Onboarding)
│   ├── DESIGN_TOKENS.md       # Bảng mã màu, CSS variables, typography, motion
│   ├── PORTABILITY_GUIDE.md   # Hướng dẫn tích hợp UI Kit
│   ├── QUICK_START.md         # Hướng dẫn tạo trang, bảng dữ liệu, form nhanh
│   └── UI_COMPONENTS.md       # Đặc tả chi tiết props, variants cho 27 components
├── public/                    # Tài nguyên tĩnh (ảnh, icon, logo, favicon)
├── src/
│   ├── assets/                # Hình ảnh, icon nội bộ dùng trong mã nguồn
│   ├── components/            # Thành phần giao diện (UI Components)
│   │   ├── ui/                # Các Base Components (Button, Input, Card, Modal, Table, Tabs...)
│   │   ├── common/            # Header, Footer, Navbar, Sidebar, Loading, ErrorBoundary
│   │   └── movie/             # Các components nghiệp vụ (MovieCard, SeatGrid, ShowTimePicker...)
│   ├── hooks/                 # Custom React Hooks (useAuth, useFetch, useDebounce...)
│   ├── lib/                   # Tiện ích bổ trợ (ví dụ: utils.ts với hàm cn())
│   ├── locales/               # Tài nguyên đa ngôn ngữ i18n (vi.json, en.json)
│   ├── pages/                 # Các trang giao diện (Home, MovieDetail, Booking, Checkout, Profile...)
│   ├── routes/                # Cấu hình định tuyến React Router
│   ├── services/              # Tầng gọi API Backend (apiClient.ts, movieService.ts, bookingService.ts)
│   ├── styles/                # Định nghĩa style, CSS tokens (rogym-theme.css, index.css)
│   ├── types/                 # Định nghĩa TypeScript interfaces, types (movie.d.ts, user.d.ts...)
│   ├── App.tsx                # Root App Component
│   ├── main.tsx               # Điểm khởi đầu ứng dụng (Mount React DOM)
│   └── index.ts               # Entry export UI Kit
├── .env.example               # Mẫu cấu hình biến môi trường
├── eslint.config.js           # Cấu hình ESLint chuẩn
├── package.json               # Danh sách dependencies và npm scripts
├── tsconfig.json              # Cấu hình TypeScript
└── vite.config.ts             # Cấu hình Vite & Tailwind v4
```

---

## 🎨 Hệ Thống RoGym Design System (UI Kit)

Dự án đã tích hợp sẵn bộ **Design System Kit** độc lập với 27+ components chuẩn production, màu sắc rực rỡ, hỗ trợ Dark/Light mode và Animation mượt mà.

### 1. Cách import và sử dụng UI Components
Tất cả UI components đều được định nghĩa tại `src/components/ui/` hoặc export qua `src/index.ts`:

```tsx
import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const FeaturedMovie = () => {
  return (
    <Card className="overflow-hidden border-border bg-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Avengers: Secret Wars</CardTitle>
          <Badge variant="primary">Hot</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-sm">
          Khởi chiếu từ ngày 25/12 tại tất cả các cụm rạp.
        </p>
        <Button variant="primary" className="mt-4 w-full">
          Đặt vé ngay
        </Button>
      </CardContent>
    </Card>
  )
}
```

### 2. Tra cứu tài liệu Design System
Hãy tham khảo các tài liệu sẵn có trong thư mục `client/docs/`:
- **[QUICK_START.md](file:///c:/Users/An/Documents/GitHub/nhom5_java_naitei_26/client/docs/QUICK_START.md)**: Hướng dẫn tạo trang mới trong 5 phút.
- **[UI_COMPONENTS.md](file:///c:/Users/An/Documents/GitHub/nhom5_java_naitei_26/client/docs/UI_COMPONENTS.md)**: Danh sách đầy đủ props, variants của 27 components.
- **[DESIGN_TOKENS.md](file:///c:/Users/An/Documents/GitHub/nhom5_java_naitei_26/client/docs/DESIGN_TOKENS.md)**: Bảng tra cứu mã màu, shadows, typography.

---

## 🔄 Quy Trình Phát Triển Một Chức Năng Mới

Khi nhận một ticket từ Redmine (ví dụ: *Hiển thị danh sách phim đang chiếu*), các thành viên thực hiện theo 4 bước chuẩn:

### Bước 1: Định nghĩa Interface / Types (`src/types/`)
Tạo file `src/types/movie.ts`:
```ts
export interface Movie {
  id: number
  title: string
  description: string
  posterUrl: string
  durationMinutes: number
  releaseDate: string
  rating: number
  genre: string[]
}
```

### Bước 2: Viết Service gọi API (`src/services/`)
Tạo `src/services/apiClient.ts` và `src/services/movieService.ts`:
```ts
// src/services/apiClient.ts
const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

export async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      // Thêm Authorization token nếu có
    },
    ...options,
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
  }

  const result = await response.json()
  return result.data ?? result
}
```

```ts
// src/services/movieService.ts
import { request } from './apiClient'
import { Movie } from '@/types/movie'

export const movieService = {
  getNowShowingMovies: () => request<Movie[]>('/v1/movies/now-showing'),
  getMovieById: (id: number) => request<Movie>(`/v1/movies/${id}`),
}
```

### Bước 3: Tạo Component & Trang Giao Diện (`src/pages/`)
Tạo `src/pages/MovieList.tsx`:
```tsx
import React, { useEffect, useState } from 'react'
import { movieService } from '@/services/movieService'
import { Movie } from '@/types/movie'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export const MovieListPage = () => {
  const [movies, setMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    movieService.getNowShowingMovies()
      .then(data => setMovies(data))
      .catch(err => console.error('Lỗi tải danh sách phim:', err))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="p-8 text-center text-foreground">Đang tải...</div>

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-foreground">Phim Đang Chiếu</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {movies.map(movie => (
          <Card key={movie.id} className="overflow-hidden">
            <img src={movie.posterUrl} alt={movie.title} className="w-full h-72 object-cover" />
            <CardContent className="p-4">
              <h3 className="font-semibold text-lg line-clamp-1">{movie.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{movie.durationMinutes} phút</p>
              <Button variant="primary" className="w-full mt-3">Chọn vé</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
```

### Bước 4: Đăng ký Route vào ứng dụng
Định tuyến URL trong hệ thống Routing (`App.tsx` hoặc `src/routes/`):
```tsx
<Route path="/movies" element={<MovieListPage />} />
```

---

## 📏 Quy Chuẩn Code & Best Practices

1. **TypeScript**:
   - Luôn định nghĩa đầy đủ interface / type cho props và state.
   - Tuyệt đối **không** dùng kiểu `any` mà không có lý do chính đáng.
2. **Component & Hooks**:
   - Sử dụng Functional Components và React Hooks.
   - Tách nhỏ các UI phức tạp thành các Sub-components tái sử dụng.
   - Quản lý side-effects rõ ràng trong `useEffect` (luôn có cleanup nếu cần).
3. **Styling**:
   - Ưu tiên sử dụng utility classes của Tailwind CSS v4 kết hợp Design Tokens (`bg-card`, `text-foreground`, `text-primary`, v.v.).
   - Dùng hàm `cn(...)` từ `@/lib/utils` khi cần kết hợp dynamic class.
4. **Linter & Formatting**:
   - Luôn chạy `npm run lint` và sửa toàn bộ warning/error trước khi commit code.

---

## 📌 Quy Ước Git & Quản Lý Task Trên Redmine

Tuân thủ nghiêm ngặt quy định của khóa học **Sun* Java NAITEI 26**:

1. **Quy tắc tạo nhánh (Branch)**:
   - Format: `feature/<ticket-id>-<tên-ngắn-gọn>` hoặc `bugfix/<ticket-id>-<tên-ngắn-gọn>`
   - Ví dụ: `feature/1234-movie-list-ui`, `bugfix/1250-fix-seat-selection`
2. **Quy tắc Commit**:
   - Commit rõ ràng, có ý nghĩa: `git commit -m "#1234 Design movie list layout and integrate API"`
3. **Quy tắc tạo Pull Request**:
   - Tiêu đề PR: `#<ticket-id> <Mô tả công việc>` (ví dụ: `#1234 Create Movie List Screen`)
   - Mô tả PR: Dán đường link ticket Redmine tương ứng: `https://edu-redmine.sun-asterisk.vn/issues/1234`
   - Chỉ merge PR sau khi có ít nhất 1 thành viên review và approve.
