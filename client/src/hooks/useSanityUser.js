import { useState, useEffect } from 'react'
import { client, userQueries } from '../lib/sanity'

export function useSanityUser(walletAddress) {
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!walletAddress) {
      setLoading(false)
      return
    }

    const fetchUser = async () => {
      try {
        const user = await client.fetch(userQueries.getUserByWallet(walletAddress))
        setUserData(user)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [walletAddress])

  const updateUser = async (updates) => {
    try {
      setLoading(true)
      const updatedUser = await client
        .patch(userData._id)
        .set(updates)
        .commit()
      
      setUserData(updatedUser)
      return updatedUser
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const createUser = async (initialData) => {
    try {
      setLoading(true)
      const newUser = await client.create({
        _type: 'user',
        walletAddress,
        ...initialData
      })
      
      setUserData(newUser)
      return newUser
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    userData,
    loading,
    error,
    updateUser,
    createUser
  }
} 