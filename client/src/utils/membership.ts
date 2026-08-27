export type MembershipTierKey = 'SILVER' | 'GOLD' | 'DIAMOND'

export interface MembershipTierInfo {
  key: MembershipTierKey
  name: string
  shortName: string
  badgeTone: 'muted' | 'accent' | 'primary'
  currentPoints: number
  nextTierName: string | null
  nextTierThreshold: number | null
  pointsNeeded: number
  progressPercent: number
  benefits: string[]
}

/**
 * Tính toán cấp bậc thành viên, tiến trình thăng hạng và đặc quyền dựa trên số điểm thưởng tích lũy.
 *
 * - Hạng Bạc (Silver): 0 - 499 điểm (Mục tiêu 500 điểm)
 * - Hạng Vàng (Gold): 500 - 999 điểm (Mục tiêu 1.000 điểm)
 * - Hạng Kim Cương (Diamond): >= 1.000 điểm (Mức cao nhất)
 */
export function calculateMembershipTier(points: number = 0): MembershipTierInfo {
  const safePoints = Math.max(0, points || 0)

  if (safePoints >= 1000) {
    return {
      key: 'DIAMOND',
      name: 'Kim Cương (Diamond)',
      shortName: 'Kim Cương',
      badgeTone: 'primary',
      currentPoints: safePoints,
      nextTierName: null,
      nextTierThreshold: null,
      pointsNeeded: 0,
      progressPercent: 100,
      benefits: [
        'Tích lũy 10% giá trị mỗi vé đặt',
        'Miễn phí nâng hạng ghế VIP Suite',
        'Ưu tiên giữ chỗ tại các suất chiếu Sneak Show',
      ],
    }
  }

  if (safePoints >= 500) {
    const currentTierBase = 500
    const nextTierTarget = 1000
    const pointsNeeded = nextTierTarget - safePoints
    const progressPercent = Math.min(
      100,
      Math.max(0, Math.round(((safePoints - currentTierBase) / (nextTierTarget - currentTierBase)) * 100))
    )

    return {
      key: 'GOLD',
      name: 'Vàng (Gold)',
      shortName: 'Vàng',
      badgeTone: 'accent',
      currentPoints: safePoints,
      nextTierName: 'Kim Cương (Diamond)',
      nextTierThreshold: nextTierTarget,
      pointsNeeded,
      progressPercent,
      benefits: [
        'Tích lũy 8% giá trị mỗi vé đặt',
        'Tặng 01 Vé 2D miễn phí dịp sinh nhật',
        'Giảm giá bắp nước ngày Member Day',
      ],
    }
  }

  const nextTierTarget = 500
  const pointsNeeded = nextTierTarget - safePoints
  const progressPercent = Math.min(
    100,
    Math.max(0, Math.round((safePoints / nextTierTarget) * 100))
  )

  return {
    key: 'SILVER',
    name: 'Bạc (Silver)',
    shortName: 'Bạc',
    badgeTone: 'muted',
    currentPoints: safePoints,
    nextTierName: 'Vàng (Gold)',
    nextTierThreshold: nextTierTarget,
    pointsNeeded,
    progressPercent,
    benefits: [
      'Tích lũy 5% giá trị mỗi vé đặt',
      'Giảm giá bắp nước ngày Member Day',
      'Nhận thông báo ưu đãi sớm nhất',
    ],
  }
}
