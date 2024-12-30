import { useEffect } from 'react'
import { checkEndedRaffles } from '../utils/raffleUtils'

export function RaffleManager() {
  useEffect(() => {
    // Check for ended raffles on component mount
    checkEndedRaffles()

    // Set up interval to check every 5 minutes
    const interval = setInterval(checkEndedRaffles, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [])

  // This is a background component, so it doesn't render anything
  return null
}

export default RaffleManager 