export interface Combo {
  id: string
  name: string
  description: string
  price: number
  image: string | null
  status: 'ACTIVE' | 'INACTIVE'
}

export interface ComboPayload {
  name: string
  description?: string
  price: number
  image?: string
  status: 'ACTIVE' | 'INACTIVE'
}

export interface ComboSelection extends Combo {
  quantity: number
}
