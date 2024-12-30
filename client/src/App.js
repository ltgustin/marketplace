import { useState, useEffect, useMemo } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useOpenSea } from './hooks/useOpenSea'
import { useUserTokens } from './hooks/useUserTokens'
import { client } from './lib/sanity'

// components
import ErrorBoundary from './components/ErrorBoundary'
import ProtectedRoute from './components/ProtectedRoute'
import RaffleManager from './components/RaffleManager'

// pages
import Home from './Pages/home'
import Shop from './Pages/shop'
import Help from './Pages/help'
import Inventory from './Pages/inventory'
import './App.css'

// font awesome
import { library } from '@fortawesome/fontawesome-svg-core'
import { faLink, faLinkSlash, faMagnifyingGlass, faBullhorn, faCircleInfo, faTicket, faStore, faBox, faBell } from '@fortawesome/free-solid-svg-icons'
library.add(faLink, faLinkSlash, faMagnifyingGlass, faBullhorn, faCircleInfo, faTicket, faStore, faBox, faBell)

function App() {
  const [address, setAddress] = useState(localStorage.getItem('userWalletAddress'))
  const [contractConfig, setContractConfig] = useState(null)
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  
  const apiKey = process.env.REACT_APP_OPENSEA_API_KEY

  // Always call the hook, no conditions
  const openSeaData = useOpenSea(address, contractConfig, apiKey)
  const { userData, timeLeft } = useUserTokens(address, openSeaData?.data?.length)

  useEffect(() => {
    let mounted = true

    async function fetchConfig() {
      try {
        const adminConfig = await client.fetch(`*[_type == "adminConfig"][0]`)
        
        if (!adminConfig?.contractInfo) {
          console.error('No contract info found in admin config')
          return
        }

        const newContractConfig = {
          contractName: adminConfig.contractInfo.contractName,
          contractAddress: adminConfig.contractInfo.contractAddress
        }
        
        if (mounted) {
          setContractConfig(newContractConfig)
        }
      } catch (err) {
        console.error('Error fetching config:', err)
        if (mounted) {
          setError('Failed to load configuration')
        }
      } finally {
        if (mounted) {
          setIsLoading(false)
        }
      }
    }

    fetchConfig()
    return () => {
      mounted = false
    }
  }, [])

  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          <Route
            path="/"
            element={
              <Home
                address={address}
                setAddress={setAddress}
                userTokens={userData?.tokens || 0}
                assets={openSeaData?.data || []}
                assetsNum={openSeaData?.data?.length || 0}
                multiplier={userData?.multiplier || 1}
                perDay={userData?.perDay || 0}
                contract={contractConfig?.contractAddress}
                apiKey={apiKey}
                error={error}
                setError={setError}
                timeLeft={timeLeft}
                isLoading={isLoading}
              />
            }
          />
          <Route
            path="/shop"
            element={
              <ProtectedRoute>
                <Shop
                  address={address}
                  setAddress={setAddress}
                  userTokens={userData?.tokens || 0}
                  assets={openSeaData?.data || []}
                  assetsNum={openSeaData?.data?.length || 0}
                  multiplier={userData?.multiplier || 1}
                  perDay={userData?.perDay || 0}
                  contract={contractConfig?.contractAddress}
                  apiKey={apiKey}
                  error={error}
                  setError={setError}
                  timeLeft={timeLeft}
                  isLoading={isLoading}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory"
            element={
              <Inventory
                address={address}
                setAddress={setAddress}
                userTokens={userData?.tokens || 0}
                assets={openSeaData?.data || []}
                assetsNum={openSeaData?.data?.length || 0}
                multiplier={userData?.multiplier || 1}
                perDay={userData?.perDay || 0}
                contract={contractConfig?.contractAddress}
                apiKey={apiKey}
                error={error}
                setError={setError}
                timeLeft={timeLeft}
                isLoading={isLoading}
              />
            }
          />
          <Route
            path="/help"
            element={
              <Help
                address={address}
                setAddress={setAddress}
                userTokens={userData?.tokens || 0}
                assets={openSeaData?.data || []}
                assetsNum={openSeaData?.data?.length || 0}
                multiplier={userData?.multiplier || 1}
                perDay={userData?.perDay || 0}
                contract={contractConfig?.contractAddress}
                apiKey={apiKey}
                error={error}
                setError={setError}
                timeLeft={timeLeft}
                isLoading={isLoading}
              />
            }
          />
        </Routes>
      </Router>
      <RaffleManager />
    </ErrorBoundary>
  )
}

export default App