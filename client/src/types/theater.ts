export interface Theater {
  id: string
  name: string
  address: string
  phone: string | null
  latitude: number | null
  longitude: number | null
}

export interface TheaterRequest {
  name: string
  address: string
  phone?: string
  latitude?: number
  longitude?: number
}
