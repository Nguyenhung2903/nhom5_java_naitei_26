export interface News {
  id: string
  title: string
  content: string
  thumbnail?: string
  createdAt?: string
  updatedAt?: string
}

export interface NewsPayload {
  title: string
  content: string
  thumbnail?: string
}
