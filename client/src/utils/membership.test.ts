import { describe, it, expect } from 'vitest'
import { calculateMembershipTier } from './membership'

describe('calculateMembershipTier', () => {
  it('handles negative or 0 points as Silver tier', () => {
    const tier0 = calculateMembershipTier(0)
    expect(tier0.key).toBe('SILVER')
    expect(tier0.name).toBe('Bạc (Silver)')
    expect(tier0.shortName).toBe('Bạc')
    expect(tier0.badgeTone).toBe('muted')
    expect(tier0.nextTierName).toBe('Vàng (Gold)')
    expect(tier0.nextTierThreshold).toBe(500)
    expect(tier0.pointsNeeded).toBe(500)
    expect(tier0.progressPercent).toBe(0)

    const tierNeg = calculateMembershipTier(-10)
    expect(tierNeg.key).toBe('SILVER')
    expect(tierNeg.pointsNeeded).toBe(500)
  })

  it('calculates progress accurately for Silver tier with 14 points', () => {
    const tier = calculateMembershipTier(14)
    expect(tier.key).toBe('SILVER')
    expect(tier.currentPoints).toBe(14)
    expect(tier.nextTierThreshold).toBe(500)
    expect(tier.pointsNeeded).toBe(486)
    expect(tier.progressPercent).toBe(3) // 14 / 500 = 2.8% ~ 3%
  })

  it('calculates boundary conditions at 499 and 500 points', () => {
    const tier499 = calculateMembershipTier(499)
    expect(tier499.key).toBe('SILVER')
    expect(tier499.pointsNeeded).toBe(1)
    expect(tier499.progressPercent).toBe(100)

    const tier500 = calculateMembershipTier(500)
    expect(tier500.key).toBe('GOLD')
    expect(tier500.name).toBe('Vàng (Gold)')
    expect(tier500.shortName).toBe('Vàng')
    expect(tier500.badgeTone).toBe('accent')
    expect(tier500.nextTierName).toBe('Kim Cương (Diamond)')
    expect(tier500.nextTierThreshold).toBe(1000)
    expect(tier500.pointsNeeded).toBe(500)
    expect(tier500.progressPercent).toBe(0)
  })

  it('calculates progress for Gold tier with 750 points', () => {
    const tier = calculateMembershipTier(750)
    expect(tier.key).toBe('GOLD')
    expect(tier.currentPoints).toBe(750)
    expect(tier.pointsNeeded).toBe(250)
    expect(tier.progressPercent).toBe(50) // (750 - 500) / 500 = 50%
  })

  it('calculates boundary conditions for Diamond tier at 1000+ points', () => {
    const tier1000 = calculateMembershipTier(1000)
    expect(tier1000.key).toBe('DIAMOND')
    expect(tier1000.name).toBe('Kim Cương (Diamond)')
    expect(tier1000.shortName).toBe('Kim Cương')
    expect(tier1000.badgeTone).toBe('primary')
    expect(tier1000.nextTierName).toBeNull()
    expect(tier1000.nextTierThreshold).toBeNull()
    expect(tier1000.pointsNeeded).toBe(0)
    expect(tier1000.progressPercent).toBe(100)

    const tier5000 = calculateMembershipTier(5000)
    expect(tier5000.key).toBe('DIAMOND')
    expect(tier5000.progressPercent).toBe(100)
  })
})
