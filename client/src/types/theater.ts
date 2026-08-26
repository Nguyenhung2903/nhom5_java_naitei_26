export interface Theater {
  id: string
  name: string
  address: string
  phone: string | null
}

export interface TheaterRequest {
  name: string
  address: string
  phone?: string
}
