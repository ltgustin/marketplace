import { useState, useEffect } from 'react'
import { client } from '../lib/sanity'
import { calculateTokens, updateUserMultiplier } from '../utils/tokenUtils'

export function useUserTokens(address, assetsCount) {
  const [userData, setUserData] = useState(null)
  const [timeLeft, setTimeLeft] = useState(0)
  const [adminConfig, setAdminConfig] = useState(null)

  // Fetch admin config and initial user data
  useEffect(() => {
    async function fetchInitialData() {
      try {
        const config = await client.fetch(`*[_type == "adminConfig"][0]`)
        setAdminConfig(config)

        if (address) {
          const user = await client.fetch(`*[_type == "user" && walletAddress == $address][0]`, {
            address
          })
          if (user) {
            setUserData(user)
            
            // Calculate time remaining based on global last update
            const lastGlobalUpdate = new Date(config.tokenSystem.lastGlobalUpdate)
            const now = new Date()
            const interval = config.tokenSystem.updateInterval
            const timeSinceLastUpdate = now - lastGlobalUpdate
            const timeRemaining = interval - (timeSinceLastUpdate % interval)
            
            console.log('Timer initialization:', {
              interval,
              lastGlobalUpdate: lastGlobalUpdate.toISOString(),
              timeSinceLastUpdate,
              timeRemaining
            })
            
            setTimeLeft(timeRemaining)
          }
        }
      } catch (err) {
        console.error('Error fetching initial data:', err)
      }
    }
    fetchInitialData()
  }, [address])

  // Handle countdown and token updates
  useEffect(() => {
    if (!address || !adminConfig || !userData) return

    const interval = adminConfig.tokenSystem.updateInterval
    const checkInterval = Math.min(60000, Math.floor(interval / 15))

    console.log('Setting up countdown with:', {
      updateInterval: interval,
      checkInterval,
      currentTimeLeft: timeLeft,
      lastGlobalUpdate: adminConfig.tokenSystem.lastGlobalUpdate
    })

    const countdownId = setInterval(() => {
      setTimeLeft(prev => {
        const newTime = Math.max(0, prev - checkInterval)
        
        if (newTime === 0) {
          // When timer hits zero, check if we're actually due for an update
          const now = new Date()
          const lastGlobalUpdate = new Date(adminConfig.tokenSystem.lastGlobalUpdate)
          const timeSinceGlobalUpdate = now - lastGlobalUpdate
          
          if (timeSinceGlobalUpdate >= interval) {
            console.log('Global update interval reached, calculating tokens...')
            calculateTokens(userData, adminConfig).then(updatedUser => {
              if (updatedUser) {
                setUserData(updatedUser)
                // Fetch fresh admin config to get new lastGlobalUpdate
                client.fetch(`*[_type == "adminConfig"][0]`).then(newConfig => {
                  if (newConfig) {
                    setAdminConfig(newConfig)
                    const newTimeLeft = newConfig.tokenSystem.updateInterval
                    setTimeLeft(newTimeLeft)
                  }
                })
              }
            })
          } else {
            // If we hit zero but global update hasn't happened yet, recalculate remaining time
            const timeRemaining = interval - (timeSinceGlobalUpdate % interval)
            setTimeLeft(timeRemaining)
          }
        }
        
        return newTime
      })
    }, checkInterval)

    return () => clearInterval(countdownId)
  }, [address, adminConfig, userData])

  // Update multiplier when assets count changes
  useEffect(() => {
    if (!userData || assetsCount === undefined || !adminConfig) return

    const debounceTimeout = setTimeout(async () => {
      try {
        const updatedUser = await updateUserMultiplier(userData, assetsCount)
        setUserData(updatedUser)
      } catch (err) {
        console.error('Error updating multiplier:', err)
      }
    }, 5000)

    return () => clearTimeout(debounceTimeout)
  }, [assetsCount, userData?._id, adminConfig])

  return { userData, timeLeft }
}