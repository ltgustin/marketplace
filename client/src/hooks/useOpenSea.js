import { useState, useEffect } from 'react'
import axios from 'axios'
import { client } from '../lib/sanity'
import { config } from '../config'

const CACHE_KEY = 'userNFTAssets'
const CACHE_DURATION = 15 * 60 * 1000 // 15 minutes to match token interval

export function useOpenSea(storedUserAddress, contractConfig, apiKey) {
  const [assets, setAssets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isMounted = true

    async function fetchAssets() {
      // Return early if we don't have all required data
      if (!storedUserAddress || !contractConfig?.contractName || !apiKey) {
        console.log('Missing required data:', { 
          hasAddress: !!storedUserAddress, 
          hasContract: !!contractConfig,
          contractName: contractConfig?.contractName,
          hasApiKey: !!apiKey 
        })
        return
      }

      // Check cache first
      const cachedData = localStorage.getItem(CACHE_KEY)
      if (cachedData) {
        const { assets: cachedAssets, timestamp, address } = JSON.parse(cachedData)
        const isStale = Date.now() - timestamp > CACHE_DURATION
        const isSameUser = address === storedUserAddress

        if (!isStale && isSameUser && cachedAssets) {
          console.log('Using cached NFT assets')
          setAssets(cachedAssets)
          setLoading(false)
          return
        }
      }

      setLoading(true)
      try {
        console.log('Fetching fresh NFT data for:', {
          address: storedUserAddress,
          contractName: contractConfig.contractName
        })

        const response = await axios({
          method: 'GET',
          url: `${config.API_ENDPOINTS.OPENSEA}/chain/ethereum/account/${storedUserAddress}/nfts`,
          params: {
            collection: contractConfig.contractName,
            limit: '200',
          },
          headers: { 
            'Accept': 'application/json',
            'x-api-key': apiKey
          }
        })

        const fetchedAssets = response.data.nfts || []
        
        if (isMounted) {
          console.log('OpenSea response:', response.data)
          setAssets(fetchedAssets)
          
          // Cache the assets
          localStorage.setItem(CACHE_KEY, JSON.stringify({
            assets: fetchedAssets,
            timestamp: Date.now(),
            address: storedUserAddress
          }))
        }
      } catch (err) {
        console.error('OpenSea fetch error:', err)
        if (isMounted) setError(err.message)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchAssets()
    return () => {
      isMounted = false
    }
  }, [storedUserAddress, contractConfig, apiKey])

  // Listen for token update interval to refresh assets
  useEffect(() => {
    const tokenUpdateListener = (event) => {
      if (event.detail?.type === 'TOKEN_UPDATE') {
        console.log('Token update detected, refreshing NFT assets')
        localStorage.removeItem(CACHE_KEY) // Force fresh fetch on next render
      }
    }

    window.addEventListener('tokenUpdate', tokenUpdateListener)
    return () => window.removeEventListener('tokenUpdate', tokenUpdateListener)
  }, [])

  return {
    data: assets,
    loading,
    error
  }
} 