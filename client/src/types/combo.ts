export interface Combo {
  id: string
  name: string
  description: string
  price: number
  image: string | null
}

export interface ComboSelection extends Combo {
  quantity: number
}
