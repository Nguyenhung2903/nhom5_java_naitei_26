import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { roomService } from '@/services/roomService'
import { PageLoader } from '@/components/ui'

export function RoomRedirectPage() {
  const { roomId } = useParams<{ roomId: string }>()
  const navigate = useNavigate()

  useEffect(() => {
    if (!roomId) {
      navigate('/admin/theaters', { replace: true })
      return
    }

    let isMounted = true
    void roomService
      .getById(roomId)
      .then((room) => {
        if (isMounted) {
          navigate(`/admin/theaters/${room.theaterId}/rooms/${roomId}`, { replace: true })
        }
      })
      .catch(() => {
        if (isMounted) {
          navigate('/admin/theaters', { replace: true })
        }
      })

    return () => {
      isMounted = false
    }
  }, [roomId, navigate])

  return <PageLoader ariaLabel="Đang chuyển hướng đến phòng chiếu..." />
}

export default RoomRedirectPage

