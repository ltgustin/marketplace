import { createClient } from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'

export const client = createClient({
  projectId: process.env.REACT_APP_SANITY_PROJECT_ID,
  dataset: process.env.REACT_APP_SANITY_DATASET,
  useCdn: true, // set to false if you want to ensure fresh data
  apiVersion: '2024-03-01', // use current date YYYY-MM-DD
  token: process.env.REACT_APP_SANITY_TOKEN,
})

// Helper function for image URLs
const builder = imageUrlBuilder(client)
export const urlFor = (source) => builder.image(source)

// User-related queries
export const userQueries = {
  getUserByWallet: (walletAddress) => `*[_type == "user" && walletAddress == "${walletAddress}"][0]`,
  createOrUpdateUser: (userData) => ({
    createIfNotExists: {
      _type: 'user',
      walletAddress: userData.walletAddress,
      ...userData
    }
  })
}

// Admin config queries
export const adminQueries = {
  getConfig: `*[_type == "adminConfig"][0]`
}

// Marketplace queries
export const marketplaceQueries = {
  getAvailableItems: `*[_type == "marketplaceItem" && available == true]`
} 