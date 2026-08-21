import { api } from '@/lib/api'

export interface ComboItemRequest {
  comboId: string;
  quantity: number;
}

export interface CreateBookingRequest {
  showtimeId: string;
  seatIds: string[];
  combos: ComboItemRequest[];
  paymentMethod: 'PAYPAL' | 'COUNTER';
  paymentTransactionId?: string;
  discountCode?: string;
}

export const bookingService = {
  createBooking: async (request: CreateBookingRequest): Promise<string> => {
    const res = await api.post<{ message: string }>('/bookings', request)
    return res.message || 'Đặt vé thành công'
  },
}
