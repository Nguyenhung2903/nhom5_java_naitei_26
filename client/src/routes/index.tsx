import { createBrowserRouter } from 'react-router-dom'
import { UserLayout } from '@/components/layout/UserLayout'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { AdminLayout } from '@/components/layout/AdminLayout'

import { ProtectedRoute } from './ProtectedRoute'
import { PublicOnlyRoute } from './PublicOnlyRoute'

// Pages
import { HomePage } from '@/pages/user/HomePage'
import { ProfilePage } from '@/pages/user/ProfilePage'
import { ShowtimeSeatPage } from '@/pages/user/ShowtimeSeatPage'
import { ComboPage } from '@/pages/user/ComboPage'
import { MovieShowtimePage } from '@/pages/user/MovieShowtimePage'
import { LoginPage } from '@/pages/auth/LoginPage'
import { RegisterPage } from '@/pages/auth/RegisterPage'
import { DashboardPage } from '@/pages/admin/DashboardPage'
import { TheaterManagementPage } from '@/pages/admin/TheaterManagementPage'
import { RoomManagementPage } from '@/pages/admin/RoomManagementPage'
import { SeatManagementPage } from '@/pages/admin/SeatManagementPage'
import { ShowtimeManagementPage } from '@/pages/admin/ShowtimeManagementPage'
import { NotFoundPage } from '@/pages/common/NotFoundPage'
import { ForbiddenPage } from '@/pages/common/ForbiddenPage'

export const router = createBrowserRouter([
  // Nhánh 1: Phân hệ Khách hàng (User Module)
  {
    path: '/',
    element: <UserLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'booking/:showtimeId/seats',
        element: <ShowtimeSeatPage />,
      },
      {
        path: 'booking/:showtimeId/combos',
        element: <ComboPage />,
      },
      // Các route khách hàng cần đăng nhập
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: 'booking/:movieId/showtimes',
            element: <MovieShowtimePage />,
          },
          {
            path: 'profile',
            element: <ProfilePage />,
          },
        ],
      },
    ],
  },

  // Nhánh 2: Phân hệ Xác thực (Auth Module - Chặn nếu đã đăng nhập)
  {
    element: <PublicOnlyRoute />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          {
            path: 'login',
            element: <LoginPage />,
          },
          {
            path: 'register',
            element: <RegisterPage />,
          },
        ],
      },
    ],
  },

  // Nhánh 3: Phân hệ Quản trị (Admin Module - Yêu cầu role ADMIN)
  {
    path: '/admin',
    element: <ProtectedRoute allowedRoles={['ADMIN']} />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          {
            index: true,
            element: <DashboardPage />,
          },
          {
            path: 'movies',
            element: <DashboardPage />, // Placeholder cho quản lý phim
          },
          {
            path: 'showtimes',
            element: <ShowtimeManagementPage />,
          },
          {
            path: 'rooms',
            element: <RoomManagementPage />,
          },
          {
            path: 'theaters',
            element: <TheaterManagementPage />,
          },
          {
            path: 'seats',
            element: <SeatManagementPage />,
          },
          {
            path: 'bookings',
            element: <DashboardPage />, // Placeholder cho quản lý đặt vé
          },
          {
            path: 'users',
            element: <DashboardPage />, // Placeholder cho quản lý người dùng
          },
        ],
      },
    ],
  },

  // Phân hệ Lỗi & Điều hướng chung
  {
    path: '/403',
    element: <ForbiddenPage />,
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
])

export default router
