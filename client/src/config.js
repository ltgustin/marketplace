export const config = {
    API_ENDPOINTS: {
        OPENSEA: 'https://api.opensea.io/api/v2',
    },
    CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
    UPDATE_INTERVALS: {
        TOKENS: 2 * 60 * 60 * 1000, // 2 hours
        ASSETS: 5 * 60 * 1000 // 5 minutes
    },
    DB_COLLECTIONS: {
        USERS: 'mp-users-tokens',
        ADMIN: 'admin-config'
    }
};