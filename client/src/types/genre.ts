export interface Genre {
  id: string
  name: string
  description?: string | null
  movieCount?: number
  createdAt?: string
  updatedAt?: string
}

export interface GenrePayload {
  name: string
  description?: string | null
}
