import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useSanityUser } from '../hooks/useSanityUser'
import { storage } from '../utils/localStorage'

function ConnectButton({address, setAddress}) {
  const { userData, loading, error, createUser } = useSanityUser(address)
  const [walletConnectBtn, setConnectText] = useState("Connect Wallet");
  const [disconnect, setDisconnect] = useState(false);
  const [wallet, setWallet] = useState(null)

  // truncate the wallet address
  const truncateRegex = /^(0x[a-zA-Z0-9]{4})[a-zA-Z0-9]+([a-zA-Z0-9]{4})$/
  const truncateEthAddress = function (address) {
    const match = address.match(truncateRegex)
    if (!match) return address
    return match[1] + "\u2026" + match[2]
  }

  // DISCONNECT WALLET
  const disconnectWallet = async () => {
    try {
      setWallet(null)
      storage.clearUserData()
      setAddress(null)
      setConnectText("Connect Wallet")
    } catch (error) {
      console.error('Error disconnecting wallet:', error)
    }
  }

  // CONNECT WALLET
  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        // Request account access
        const accounts = await window.ethereum.request({ 
          method: 'eth_requestAccounts' 
        })
        
        const userAddress = accounts[0]

        // Create user in Sanity if they don't exist
        if (userAddress && !userData) {
          await createUser({
            walletAddress: userAddress,
            baseAmount: 0,
            multiplier: 1,
            perDay: 0,
            tokens: 0,
            lastSync: new Date().toISOString()
          })
        }

        setAddress(userAddress)
        setWallet(userAddress)
        setConnectText(truncateEthAddress(userAddress))
        storage.saveUserData({ 
          walletAddress: userAddress, 
          tokens: 0, 
          lastCalculationTimestamp: Date.now() 
        })
      } catch (error) {
        console.error('Error connecting wallet:', error)
      }
    } else {
      alert('No wallet detected. Please install MetaMask.')
    }
  }

  // Load wallet from storage on mount
  useEffect(() => {
    const { walletAddress } = storage.loadUserData()
    if (walletAddress) {
      setWallet(walletAddress)
      setAddress(walletAddress)
      setConnectText(truncateEthAddress(walletAddress))
    }
  }, [])

  // Handle account changes
  useEffect(() => {
    if (typeof window.ethereum !== 'undefined') {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
          disconnectWallet()
        } else {
          const newAddress = accounts[0]
          setAddress(newAddress)
          setWallet(newAddress)
          setConnectText(truncateEthAddress(newAddress))
          storage.saveUserData({ 
            walletAddress: newAddress, 
            tokens: 0, 
            lastCalculationTimestamp: Date.now() 
          })
        }
      })
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged')
      }
    }
  }, [])

  return (
    <>
      {wallet ? (
        <div className="wallet-buttons">
          <button 
            className="btn connect-wallet small"
            onClick={() => {
              setDisconnect(value => !value)
            }}
          >
            <FontAwesomeIcon icon="link" />
            {walletConnectBtn}
          </button>
          <button 
            className={`btn disconnect-wallet ${disconnect ? "display" : ""}`}
            onClick={() => {
              disconnectWallet()
            }}
          >
            <FontAwesomeIcon icon="link-slash" />
            Disconnect
          </button>
        </div>
      ) : (
        <button 
          className="btn connect-wallet small"
          onClick={() => {
            connectWallet()
          }}
        >
          <FontAwesomeIcon icon="link" />
          {walletConnectBtn}
        </button>
      )}
    </>
  );
}

export default ConnectButton;