import { client } from '../lib/sanity'
import { storage } from './localStorage'

export async function calculateTokens(userData, adminConfig) {
  if (!userData?._id) return null

  const now = new Date()
  
  // Calculate perDay based on baseRewardRate and multiplier
  const userAssets = userData.baseAmount
  const multiplier = userData.multiplier || 1
  const perDay = userAssets * multiplier

  // Add exactly one interval's worth of tokens
  const currentTokens = userData.tokens || 0
  const newTokens = currentTokens + perDay

  console.log('Token calculation:', {
    currentTokens,
    userAssets,
    multiplier,
    perDay,
    newTokens
  })

  try {
    // Update user document in Sanity
    const updatedUser = await client.patch(userData._id)
      .set({
        tokens: newTokens,
        perDay: perDay,
        lastSync: now.toISOString()
      })
      .commit()

    // Optionally save to localStorage
    localStorage.setItem(`userTokens_${userData.walletAddress}`, JSON.stringify({
      tokens: newTokens,
      lastSync: now.toISOString()
    }))

    return updatedUser
  } catch (err) {
    console.error('Error updating tokens:', err)
    return null
  }
}

export async function updateUserMultiplier(userData, assetsNum) {
  if (!userData || assetsNum === undefined) return userData

  const adminConfig = await client.fetch(`*[_type == "adminConfig"][0]`)
  const { baseRewardRate, multiplierRates } = adminConfig.tokenSystem
  
  // Calculate multiplier based on token amount
  let newMultiplier = multiplierRates.tier1
  if (userAssets >= 10) newMultiplier = multiplierRates.tier2
  if (userAssets >= 25) newMultiplier = multiplierRates.tier3
  if (userAssets >= 50) newMultiplier = multiplierRates.tier4
  if (userAssets >= 100) newMultiplier = multiplierRates.tier5

    const perDay = userAssets * newMultiplier

  return client
    .patch(userData._id)
    .set({
      baseAmount,
      multiplier: newMultiplier,
      perDay
    })
    .commit()
}

export function getTimeUntilNextUpdate(lastSync, updateInterval) {
  if (!lastSync || !updateInterval) return 0
  
  const now = Date.now()
  const lastUpdate = new Date(lastSync).getTime()
  const nextUpdate = lastUpdate + updateInterval
  const timeLeft = nextUpdate - now

  return Math.max(0, timeLeft)
}

// Helper function to format time remaining
export function formatTimeLeft(ms) {
  if (ms <= 0) return '0:00'
  
  const minutes = Math.floor(ms / 60000)
  const seconds = Math.floor((ms % 60000) / 1000)
  
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
} 