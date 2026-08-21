export type DiscountType = 'PERCENT' | 'FIXED'
export type PromotionStatus = 'ACTIVE' | 'INACTIVE'

export interface Promotion {
  id: string
  title: string
  description?: string
  discountType: DiscountType
  discountValue: number
  startDate: string
  endDate: string
  status: PromotionStatus
  code: string
  createdAt?: string
  updatedAt?: string
}

export interface PromotionPayload {
  title: string
  description?: string
  discountType: DiscountType
  discountValue: number
  startDate: string
  endDate: string
  status: PromotionStatus
  code: string
}
