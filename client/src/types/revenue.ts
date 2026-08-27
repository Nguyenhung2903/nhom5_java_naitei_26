export interface RevenueOverview {
  totalRevenue: number
  ticketRevenue: number
  comboRevenue: number
  totalTicketsSold: number
  totalBookings: number
  averageOrderValue: number
  growthRate: number
}

export interface RevenueTimePoint {
  dateLabel: string
  totalRevenue: number
  ticketRevenue: number
  comboRevenue: number
  ticketCount: number
  bookingCount: number
}

export interface MovieRevenue {
  movieId: string
  title: string
  posterUrl: string | null
  genre: string
  releaseDate: string | null
  ticketsSold: number
  ticketRevenue: number
  comboRevenue: number
  totalRevenue: number
  percentage: number
}

export interface TheaterRevenue {
  theaterId: string
  theaterName: string
  address: string
  city: string
  totalRooms: number
  ticketsSold: number
  ticketRevenue: number
  comboRevenue: number
  totalRevenue: number
  percentage: number
}

export interface AdminBookingComboItem {
  comboName: string
  quantity: number
  price: number
}

export interface AdminBookingDetail {
  bookingId: string
  bookingCode: string
  bookingTime: string
  customerId: string | null
  customerName: string
  customerEmail: string
  customerPhone: string
  movieTitle: string
  moviePosterUrl: string | null
  theaterName: string
  roomName: string
  showtimeStartTime: string | null
  seats: string[]
  ticketCount: number
  combos: AdminBookingComboItem[]
  promotionCode: string | null
  pointsUsed?: number
  pointsDiscountAmount?: number
  pointsEarned?: number
  totalAmount: number
  paymentMethod: string
  paymentStatus: 'PAID' | 'UNPAID' | 'CANCELLED' | 'REFUNDED' | string
  bookingStatus: 'CONFIRMED' | 'PENDING' | 'CANCELLED' | string
}

export interface RevenueFilterParams {
  startDate?: string
  endDate?: string
  movieId?: string
  theaterId?: string
  groupBy?: 'day' | 'month'
  search?: string
  status?: string
  limit?: number
}
