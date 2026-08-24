import React, { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { LandingLayout } from '@/components/layout/LandingLayout'
import { UserPortalLayout } from '@/components/layout/UserPortalLayout'
import { UserBookingLayout } from '@/components/layout/UserBookingLayout'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { FullScreenLoader } from '@/components/ui'
import { RouteErrorBoundary } from '@/pages/common/RouteErrorBoundary'

import { ProtectedRoute } from './ProtectedRoute'
import { PublicOnlyRoute } from './PublicOnlyRoute'

// Lazy loaded Pages (Code Splitting)
const HomePage = lazy(() => import('@/pages/user/HomePage').then((m) => ({ default: m.HomePage })))
const CinemasPage = lazy(() => import('@/pages/user/CinemasPage').then((m) => ({ default: m.CinemasPage })))
const PromotionPage = lazy(() => import('@/pages/user/PromotionPage').then((m) => ({ default: m.PromotionPage })))
const NewsPage = lazy(() => import('@/pages/user/NewsPage').then((m) => ({ default: m.NewsPage })))
const NewsDetailPage = lazy(() => import('@/pages/user/NewsPage').then((m) => ({ default: m.NewsDetailPage })))

const LoginPage = lazy(() => import('@/pages/auth/LoginPage').then((m) => ({ default: m.LoginPage })))
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage').then((m) => ({ default: m.RegisterPage })))

const UserDashboardPage = lazy(() => import('@/pages/user/UserDashboardPage').then((m) => ({ default: m.UserDashboardPage })))
const UserMoviesPage = lazy(() => import('@/pages/user/UserMoviesPage').then((m) => ({ default: m.UserMoviesPage })))
const MyTicketsPage = lazy(() => import('@/pages/user/MyTicketsPage').then((m) => ({ default: m.MyTicketsPage })))
const ProfilePage = lazy(() => import('@/pages/user/ProfilePage').then((m) => ({ default: m.ProfilePage })))

const MovieShowtimePage = lazy(() => import('@/pages/user/MovieShowtimePage').then((m) => ({ default: m.MovieShowtimePage })))
const ShowtimeSeatPage = lazy(() => import('@/pages/user/ShowtimeSeatPage').then((m) => ({ default: m.ShowtimeSeatPage })))
const ComboPage = lazy(() => import('@/pages/user/ComboPage').then((m) => ({ default: m.ComboPage })))
const CheckoutPage = lazy(() => import('@/pages/user/CheckoutPage').then((m) => ({ default: m.CheckoutPage })))
const PaymentPage = lazy(() => import('@/pages/user/PaymentPage').then((m) => ({ default: m.PaymentPage })))
const VNPayReturnPage = lazy(() => import('@/pages/user/VNPayReturnPage').then((m) => ({ default: m.VNPayReturnPage })))

const DashboardPage = lazy(() => import('@/pages/admin/DashboardPage').then((m) => ({ default: m.DashboardPage })))
const TheaterManagementPage = lazy(() => import('@/pages/admin/TheaterManagementPage').then((m) => ({ default: m.TheaterManagementPage })))
const RoomManagementPage = lazy(() => import('@/pages/admin/RoomManagementPage').then((m) => ({ default: m.RoomManagementPage })))
const SeatManagementPage = lazy(() => import('@/pages/admin/SeatManagementPage').then((m) => ({ default: m.SeatManagementPage })))
const ShowtimeManagementPage = lazy(() => import('@/pages/admin/ShowtimeManagementPage').then((m) => ({ default: m.ShowtimeManagementPage })))
const MovieManagementPage = lazy(() => import('@/pages/admin/MovieManagementPage').then((m) => ({ default: m.MovieManagementPage })))
const NewsManagementPage = lazy(() => import('@/pages/admin/NewsManagementPage').then((m) => ({ default: m.NewsManagementPage })))
const PromotionManagementPage = lazy(() => import('@/pages/admin/PromotionManagementPage').then((m) => ({ default: m.PromotionManagementPage })))
const UserManagementPage = lazy(() => import('@/pages/admin/UserManagementPage').then((m) => ({ default: m.UserManagementPage })))

const NotFoundPage = lazy(() => import('@/pages/common/NotFoundPage').then((m) => ({ default: m.NotFoundPage })))
const ForbiddenPage = lazy(() => import('@/pages/common/ForbiddenPage').then((m) => ({ default: m.ForbiddenPage })))

function withSuspense(Component: React.ComponentType) {
  return (
    <Suspense fallback={<FullScreenLoader ariaLabel="Đang tải trang..." />}>
      <Component />
    </Suspense>
  )
}

export const router = createBrowserRouter([
  // Nhánh 1: Phân hệ Landing Page (Chỉ dành cho khách chưa đăng nhập)
  {
    element: <PublicOnlyRoute />,
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        path: '/',
        element: <LandingLayout />,
        children: [
          {
            index: true,
            element: withSuspense(HomePage),
          },
          {
            path: 'movies',
            element: withSuspense(HomePage),
          },
          {
            path: 'cinemas',
            element: withSuspense(CinemasPage),
          },
          {
            path: 'promotions',
            element: withSuspense(PromotionPage),
          },
          {
            path: 'news',
            element: withSuspense(NewsPage),
          },
          {
            path: 'news/:newsId',
            element: withSuspense(NewsDetailPage),
          },
          // Redirect tương thích với các link cũ
          {
            path: 'profile',
            element: <Navigate to="/user/profile" replace />,
          },
          {
            path: 'my-tickets',
            element: <Navigate to="/user/tickets" replace />,
          },
        ],
      },
    ],
  },

  // Nhánh 2: Phân hệ Xác thực (Auth Module - Chặn nếu đã đăng nhập)
  {
    element: <PublicOnlyRoute />,
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          {
            path: 'login',
            element: withSuspense(LoginPage),
          },
          {
            path: 'register',
            element: withSuspense(RegisterPage),
          },
        ],
      },
    ],
  },

  // Nhánh 3: Phân hệ Thành viên & Đặt vé (/user/* - Yêu cầu Đăng nhập & Role USER)
  {
    path: '/user',
    element: <ProtectedRoute allowedRoles={['USER']} />,
    errorElement: <RouteErrorBoundary />,
    children: [
      // 3.1: Khu vực Bảng điều khiển & Quản lý cá nhân (Có Sidebar UserPortalLayout)
      {
        element: <UserPortalLayout />,
        children: [
          {
            index: true,
            element: withSuspense(UserDashboardPage),
          },
          {
            path: 'movies',
            element: withSuspense(UserMoviesPage),
          },
          {
            path: 'tickets',
            element: withSuspense(MyTicketsPage),
          },
          {
            path: 'profile',
            element: withSuspense(ProfilePage),
          },
        ],
      },
      // 3.2: Khu vực Quy trình Đặt vé (Header tinh gọn toàn màn hình UserBookingLayout)
      {
        element: <UserBookingLayout />,
        children: [
          {
            path: 'booking/:movieId/showtimes',
            element: withSuspense(MovieShowtimePage),
          },
          {
            path: 'booking/:showtimeId/seats',
            element: withSuspense(ShowtimeSeatPage),
          },
          {
            path: 'booking/:showtimeId/combos',
            element: withSuspense(ComboPage),
          },
          {
            path: 'booking/:showtimeId/checkout',
            element: withSuspense(CheckoutPage),
          },
          {
            path: 'booking/:showtimeId/payment',
            element: withSuspense(PaymentPage),
          },
          {
            path: 'payment/vnpay-return',
            element: withSuspense(VNPayReturnPage),
          },
        ],
      },
    ],
  },

  // Nhánh 4: Phân hệ Quản trị (Admin Module - Yêu cầu role ADMIN)
  {
    path: '/admin',
    element: <ProtectedRoute allowedRoles={['ADMIN']} />,
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          {
            index: true,
            element: withSuspense(DashboardPage),
          },
          {
            path: 'movies',
            element: withSuspense(MovieManagementPage),
          },
          {
            path: 'news',
            element: withSuspense(NewsManagementPage),
          },
          {
            path: 'promotions',
            element: withSuspense(PromotionManagementPage),
          },
          {
            path: 'showtimes',
            element: withSuspense(ShowtimeManagementPage),
          },
          {
            path: 'rooms',
            element: withSuspense(RoomManagementPage),
          },
          {
            path: 'theaters',
            element: withSuspense(TheaterManagementPage),
          },
          {
            path: 'seats',
            element: withSuspense(SeatManagementPage),
          },
          {
            path: 'bookings',
            element: withSuspense(DashboardPage), // Placeholder cho quản lý đặt vé
          },
          {
            path: 'users',
            element: withSuspense(UserManagementPage),
          },
        ],
      },
    ],
  },

  // Phân hệ Lỗi & Điều hướng chung
  {
    path: '/403',
    element: withSuspense(ForbiddenPage),
  },
  {
    path: '*',
    element: withSuspense(NotFoundPage),
  },
])

export default router
