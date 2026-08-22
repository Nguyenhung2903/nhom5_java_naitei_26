import { api } from '@/lib/api'

export interface ComboItemRequest {
  comboId: string;
  quantity: number;
}

export interface CreateBookingRequest {
  showtimeId: string;
  seatIds: string[];
  combos: ComboItemRequest[];
  paymentMethod: 'VNPAY';
  paymentTransactionId?: string;
  discountCode?: string;
  vnpayParams?: Record<string, string>;
}

export interface MyBookingResponse {
  id: string;
  bookingCode: string;
  bookingTime: string;
  totalAmount: number;
  bookingStatus: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'EXPIRED';
  paymentStatus: 'UNPAID' | 'PAID' | 'REFUNDED';
  movieTitle: string;
  moviePoster: string;
  ageRating: string;
  theaterName: string;
  roomName: string;
  showtimeStartTime: string;
  showtimeEndTime: string;
  seatNames: string[];
  combos: string[];
}

export const bookingService = {
  createBooking: async (request: CreateBookingRequest): Promise<string> => {
    const res = await api.post<{ message: string }>('/bookings', request)
    return res.message || 'Đặt vé thành công'
  },
  getMyBookings: async (): Promise<MyBookingResponse[]> => {
    const response = await api.get<{ data: MyBookingResponse[] }>('/bookings/my-tickets')
    return response.data
  },
  createVNPayUrl: async (amount: number): Promise<string> => {
    const res = await api.get<{ url: string }>(`/payment/vnpay/create-url?amount=${amount}`)
    return res.url
  }
}
