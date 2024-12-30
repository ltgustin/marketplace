export const storage = {
  // User data
  saveUserData: (data) => {
    localStorage.setItem('userWalletAddress', data.walletAddress)
    localStorage.setItem('tokens', data.tokens)
    localStorage.setItem('lastCalculationTimestamp', Date.now())
  },

  loadUserData: () => ({
    walletAddress: localStorage.getItem('userWalletAddress'),
    tokens: localStorage.getItem('tokens'),
    lastCalculationTimestamp: localStorage.getItem('lastCalculationTimestamp'),
  }),

  // Asset caching
  saveAssetCache: (assets) => {
    localStorage.setItem('cachedAssets', JSON.stringify(assets))
    localStorage.setItem('cachedAssetsTime', Date.now())
  },

  loadAssetCache: () => ({
    assets: JSON.parse(localStorage.getItem('cachedAssets') || 'null'),
    timestamp: localStorage.getItem('cachedAssetsTime'),
  }),

  // Clear functions
  clearUserData: () => {
    localStorage.removeItem('userWalletAddress')
    localStorage.removeItem('tokens')
    localStorage.removeItem('lastCalculationTimestamp')
  },

  clearAssetCache: () => {
    localStorage.removeItem('cachedAssets')
    localStorage.removeItem('cachedAssetsTime')
  },

  clearAll: () => {
    localStorage.clear()
  }
}