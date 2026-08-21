export interface MovieOption {
  id: string
  title: string
}

export type MovieStatus = 'COMING_SOON' | 'NOW_SHOWING' | 'ENDED'

export interface Genre {
  id: string
  name: string
}

export interface Movie {
  id: string
  title: string
  description?: string
  duration: number
  director?: string
  castMembers?: string
  language?: string
  ageRating?: string
  releaseDate?: string
  poster?: string
  trailer?: string
  status: MovieStatus
  genres: Genre[]
  createdAt?: string
  updatedAt?: string
}

export interface MoviePayload {
  title: string
  description?: string
  duration: number
  director?: string
  castMembers?: string
  language?: string
  ageRating?: string
  releaseDate?: string
  poster?: string
  trailer?: string
  status: MovieStatus
  genreIds: string[]
}
