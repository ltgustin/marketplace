import React, { useEffect, useState, useMemo } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import axios from 'axios';
import './App.css';
import { AssetsSkeleton, UserDataSkeleton } from './components/LoadingSkeleton';
import { SkeletonTheme } from 'react-loading-skeleton';
import ErrorBoundary from './components/ErrorBoundary';
import { config } from './config';
import 'react-loading-skeleton/dist/skeleton.css';
import { setMaxListeners } from 'events';

// pages
import Home from './Pages/home';
import Shop from './Pages/shop';
import Help from './Pages/help';

// font awesome
import { library } from '@fortawesome/fontawesome-svg-core';
import { faLink, faLinkSlash, faMagnifyingGlass, faBullhorn, faCircleInfo, faTicket, faStore } from '@fortawesome/free-solid-svg-icons';
library.add(faLink, faLinkSlash, faMagnifyingGlass, faBullhorn, faCircleInfo, faTicket, faStore);

// firebase
import { db } from './components/Firebase';
import { doc, updateDoc, getDoc, setDoc } from "firebase/firestore/lite";

// utils
import getUserTokens from './utils/getUserTokens';
import {
  saveTokensToLocalStorage,
  loadTokensFromLocalStorage,
  clearLocalStorage,
} from './utils/localStorage';

// Define the user data structure
const initialUserData = {
  baseAmount: 0,
  multiplier: 1,
  perDay: 0,
  tokens: 0,
  lastSync: Date.now()
};

const ProtectedRoute = ({ children }) => {
  const storedUserAddress = localStorage.getItem('userWalletAddress');
  
  if (!storedUserAddress) {
    return <Navigate to="/" />;
  }
  return children;
};

function App() {
  // Get stored address and add setter
  const [address, setAddress] = useState(localStorage.getItem('userWalletAddress'));
  const storedUserAddress = address; // Use the state value instead of direct localStorage
  const dbName = config.DB_COLLECTIONS.USERS;

  // Add effect to handle address changes
  useEffect(() => {
    if (address) {
      localStorage.setItem('userWalletAddress', address);
    } else {
      localStorage.removeItem('userWalletAddress');
    }
  }, [address]);

  // Combined state management
  const [userState, setUserState] = useState({
    userData: null,
    tokens: 0,
    assets: [],
    assetsCount: 0
  });

  // Loading states
  const [loadingStates, setLoadingStates] = useState({
    userData: false,
    assets: false,
    tokens: false
  });

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [dataReady, setDataReady] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [adminConfig, setAdminConfig] = useState(null);
  const [contractConfig, setContractConfig] = useState(null);

  const apiKey = process.env.REACT_APP_OPENSEA_API_KEY;
  
  // Memoized user metrics
  const userMetrics = useMemo(() => {
    const { userData, assets } = userState;
    if (!userData || !assets) return null;

    return {
      totalValue: assets.length * (userData.baseAmount || 0),
      projectedEarnings: userData.perDay * 30,
      currentMultiplier: userData.multiplier,
      totalAssets: assets.length
    };
  }, [userState]);

  // OpenSea API call with caching
  const getCollectionAssets = useMemo(() => {
    const contractName = contractConfig?.contractName;
    if (!storedUserAddress || !contractName) return null;

    const cachedData = localStorage.getItem('cachedAssets');
    const cachedTime = localStorage.getItem('cachedAssetsTime');
    
    if (cachedData && cachedTime && 
        Date.now() - parseInt(cachedTime) < config.CACHE_DURATION) {
      return { cached: true, data: JSON.parse(cachedData) };
    }

    return {
      cached: false,
      config: {
        method: 'GET',
        url: `${config.API_ENDPOINTS.OPENSEA}/chain/ethereum/account/${storedUserAddress}/nfts`,
        params: {
          collection: contractName,
          limit: '200',
        },
        headers: { accept: 'application/json', 'X-API-KEY': apiKey }
      }
    };
  }, [storedUserAddress, contractConfig, apiKey]);

  // Sanitize data before saving
  const saveUserData = async (newData) => {
    if (!storedUserAddress || !newData) return;
    
    const sanitizedData = {
      ...newData,
      tokens: parseFloat(newData.tokens) || 0,
      multiplier: parseFloat(newData.multiplier) || 1,
      perDay: parseFloat(newData.perDay) || 0,
      lastUpdated: Date.now()
    };
    
    try {
      const userRef = doc(db, dbName, storedUserAddress);
      await updateDoc(userRef, sanitizedData);
      setUserState(prev => ({
        ...prev,
        userData: sanitizedData
      }));
      localStorage.setItem('userData', JSON.stringify(sanitizedData));
    } catch (error) {
      console.error('Error saving user data:', error);
      setError('Failed to save user data');
    }
  };

  // Function to fetch admin configs
  const fetchAdminConfig = async () => {
    try {
      // Fetch tokenSystem config
      const tokenSystemRef = doc(db, 'admin-config', 'tokenSystem');
      const tokenSystemSnap = await getDoc(tokenSystemRef);
      
      // Fetch contractConfig
      const contractConfigRef = doc(db, 'admin-config', 'contractConfig');
      const contractConfigSnap = await getDoc(contractConfigRef);
      
      if (tokenSystemSnap.exists()) {
        setAdminConfig(tokenSystemSnap.data());
      }
      
      if (contractConfigSnap.exists()) {
        setContractConfig(contractConfigSnap.data());
      }
    } catch (error) {
      console.error('Error fetching admin configs:', error);
    }
  };

  // Load admin configs on mount
  useEffect(() => {
    fetchAdminConfig();
  }, []);

  // Get contract details from contractConfig
  const contract = contractConfig?.contract;
  const contractName = contractConfig?.contractName;

  // Add this useEffect at the start of the component
  useEffect(() => {
    // Increase the limit for the entire process if available
    if (typeof process !== 'undefined' && process.setMaxListeners) {
      process.setMaxListeners(20);
    }
    
    // Cleanup when component unmounts
    return () => {
      if (typeof process !== 'undefined' && process.setMaxListeners) {
        process.setMaxListeners(10); // Reset to default
      }
    };
  }, []);

  // Update timer effect
  useEffect(() => {
    if (!storedUserAddress || !adminConfig) return;

    let isSubscribed = true;
    const resetTimer = adminConfig.updateInterval;
    
    // Calculate an appropriate check interval based on the reset timer
    const checkInterval = resetTimer > 3600000 ? 300000 : 5000; // 5 minutes for long intervals, 5 seconds for short
    
    // Initialize lastResetTime if not set
    let lastResetTime = parseInt(localStorage.getItem('lastResetTime'), 10);
    if (!lastResetTime) {
      lastResetTime = Date.now();
      localStorage.setItem('lastResetTime', lastResetTime.toString());
    }

    const updateDisplayTime = () => {
      const now = Date.now();
      const elapsed = now - lastResetTime;
      const timeUntilNext = resetTimer - (elapsed % resetTimer);
      setTimeLeft(timeUntilNext);
    };

    const tokenInterval = setInterval(async () => {
      if (!isSubscribed) return;

      const now = Date.now();
      const elapsed = now - lastResetTime;
      
      // Only update if at least one full interval has passed
      if (elapsed >= resetTimer) {

        if (!isLoading && isSubscribed) {
          console.log('Triggering token update...');
          await dailyTokens();
          lastResetTime = lastResetTime + resetTimer;
          localStorage.setItem('lastResetTime', lastResetTime.toString());
          if (isSubscribed) {
            updateDisplayTime();
          }
        }
      }
    }, checkInterval); // Use dynamic check interval

    // Initial display update
    updateDisplayTime();
    const displayInterval = setInterval(() => {
      if (!isSubscribed) return;
      updateDisplayTime();
    }, resetTimer > 3600000 ? 60000 : 1000); // Update display every minute for long intervals, every second for short

    // Cleanup function
    return () => {
      isSubscribed = false;
      clearInterval(displayInterval);
      clearInterval(tokenInterval);
    };
  }, [storedUserAddress, isLoading, adminConfig]);

  // Update loadUserData to handle no user case
  const loadUserData = async () => {
    if (!storedUserAddress) {
      setIsLoading(false);
      setDataReady(true);
      return;
    }

    setIsLoading(true);
    try {
      const startTime = Date.now();
      
      // Load data as normal
      const cachedData = localStorage.getItem('userData');
      if (cachedData) {
        const parsed = JSON.parse(cachedData);
        setUserState(prev => ({
          ...prev,
          userData: parsed,
          tokens: parsed.tokens || 0
        }));
      }

      const userRef = doc(db, dbName, storedUserAddress);
      const docSnap = await getDoc(userRef);

      if (docSnap.exists()) {
        const firebaseData = docSnap.data();
        setUserState(prev => ({
          ...prev,
          userData: firebaseData,
          tokens: firebaseData.tokens || 0
        }));
        localStorage.setItem('userData', JSON.stringify(firebaseData));
      } else {
        await setDoc(userRef, initialUserData);
        setUserState(prev => ({
          ...prev,
          userData: initialUserData
        }));
        localStorage.setItem('userData', JSON.stringify(initialUserData));
      }

      // Calculate how long the loading took
      const loadTime = Date.now() - startTime;
      const minimumLoadTime = 2000; // 2 seconds minimum loading time

      // If loading was too fast, wait the remaining time
      if (loadTime < minimumLoadTime) {
        await new Promise(resolve => setTimeout(resolve, minimumLoadTime - loadTime));
      }

      setDataReady(true);
    } catch (error) {
      console.error('Error loading user data:', error);
      setError('Failed to load user data');
    } finally {
      setIsLoading(false);
    }
  };

  // Update useEffect to handle no user case
  useEffect(() => {
    loadUserData();
  }, [storedUserAddress]);

  // Update dailyTokens with more debugging
  const dailyTokens = async () => {
    if (!isLoading && adminConfig) {
      try {
        const userRef = doc(db, dbName, storedUserAddress);
        const docSnap = await getDoc(userRef);
        
        if (docSnap.exists()) {
          const currentData = docSnap.data();
          
          const currentTokens = parseFloat(currentData.tokens) || 0;
          const tokensToAdd = parseFloat(currentData.perDay) || 0;
          const newTokens = currentTokens + tokensToAdd;

          try {
            await updateDoc(userRef, {
              tokens: newTokens,
              lastSync: Date.now()
            });


            setUserState(prev => {
              return {
                ...prev,
                tokens: newTokens,
                userData: {
                  ...prev.userData,
                  tokens: newTokens
                }
              };
            });

            // Update the global lastGlobalUpdate in admin config
            const tokenSystemRef = doc(db, 'admin-config', 'tokenSystem');
            await updateDoc(tokenSystemRef, {
              lastGlobalUpdate: Date.now()
            });
          } catch (updateError) {
            console.error('Error updating tokens:', updateError);
          }
        }
      } catch (error) {
        console.error('Error in dailyTokens:', error);
      }
    }
  };

  const fetchUserTokens = async () => {
    try {
      const userRef = doc(db, dbName, storedUserAddress);
      const docSnap = await getDoc(userRef);
      
      if (docSnap.exists()) {
        const tokens = docSnap.data().tokens;
        setUserState(prev => ({
          ...prev,
          tokens: tokens
        }));
      }
    } catch (error) {
      console.error('Error fetching user tokens:', error);
    }
  };

  useEffect(() => {
    if (!getCollectionAssets) return;

    if (getCollectionAssets.cached) {
      // Use cached data
      setUserState(prev => ({
        ...prev,
        assets: getCollectionAssets.data,
        assetsCount: getCollectionAssets.data.length
      }));
      return;
    }

    // Make API request if no cache
    axios
      .request(getCollectionAssets.config)
      .then((response) => {
        setUserState(prev => ({
          ...prev,
          assets: response.data.nfts,
          assetsCount: response.data.nfts.length
        }));

        // Cache the assets data
        localStorage.setItem('cachedAssets', JSON.stringify(response.data.nfts));
        localStorage.setItem('cachedAssetsTime', Date.now().toString());

        if (response.data.nfts.length === 0) {
          setError('No assets of this collection in your wallet.');
        }
      })
      .catch((error) => {
        console.error('Error getting assets:', error);
        setError('Error getting assets from wallet. ' + error);
      });

    fetchUserTokens();
  }, [getCollectionAssets]);

  // Update multiplier calculation with admin config rates
  useEffect(() => {
    if (userState.assetsCount > 0 && adminConfig) {
      let newMultiplier = adminConfig.baseRewardRate;
      
      if (userState.assetsCount > 1 && userState.assetsCount <= 10) {
        newMultiplier = adminConfig.multiplierRates.tier1;
      } else if (userState.assetsCount > 10 && userState.assetsCount <= 20) {
        newMultiplier = adminConfig.multiplierRates.tier2;
      } else if (userState.assetsCount > 20 && userState.assetsCount <= 30) {
        newMultiplier = adminConfig.multiplierRates.tier3;
      } else if (userState.assetsCount > 30 && userState.assetsCount <= 50) {
        newMultiplier = adminConfig.multiplierRates.tier4;
      } else if (userState.assetsCount > 50) {
        newMultiplier = adminConfig.multiplierRates.tier5;
      }

      // Update userData with new multiplier and calculate perDay
      const newPerDay = userState.assetsCount * newMultiplier;
      
      setUserState(prev => ({
        ...prev,
        userData: {
          ...prev.userData,
          multiplier: newMultiplier,
          perDay: newPerDay
        }
      }));

      // Save to Firebase
      saveUserData({
        ...userState.userData,
        multiplier: newMultiplier,
        perDay: newPerDay
      });
    }
  }, [userState.assetsCount, adminConfig]);

  return (
    <ErrorBoundary>
      <SkeletonTheme baseColor="#202020" highlightColor="#444">
        <Router>
          {(isLoading || !dataReady) ? (
            <div className="loading-container">
              <UserDataSkeleton />
              <AssetsSkeleton />
            </div>
          ) : (
            <Routes>
              <Route
                exact
                path="/"
                element={
                  <Home
                    address={storedUserAddress}
                    setAddress={setAddress}
                    userTokens={userState.tokens}
                    assets={userState.assets}
                    assetsNum={userState.assetsCount}
                    multiplier={userState.userData?.multiplier}
                    perDay={userState.userData?.perDay}
                    userMetrics={userMetrics}
                    contract={contract}
                    apikey={apiKey}
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
                      address={storedUserAddress}
                      setAddress={setAddress}
                      userTokens={userState.tokens}
                      assets={userState.assets}
                      assetsNum={userState.assetsCount}
                      multiplier={userState.userData?.multiplier}
                      perDay={userState.userData?.perDay}
                      userMetrics={userMetrics}
                      contract={contract}
                      apikey={apiKey}
                      error={error}
                      setError={setError}
                      timeLeft={timeLeft}
                      isLoading={isLoading}
                    />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/help"
                element={
                  <Help
                    address={storedUserAddress}
                    setAddress={setAddress}
                    userTokens={userState.tokens}
                    assets={userState.assets}
                    assetsNum={userState.assetsCount}
                    multiplier={userState.userData?.multiplier}
                    perDay={userState.userData?.perDay}
                    userMetrics={userMetrics}
                    contract={contract}
                    apikey={apiKey}
                    error={error}
                    setError={setError}
                    timeLeft={timeLeft}
                    isLoading={isLoading}
                  />
                }
              />
            </Routes>
          )}
        </Router>
      </SkeletonTheme>
    </ErrorBoundary>
  );
}

// Remove console.logs in production
if (process.env.NODE_ENV !== 'development') {
  console.log = () => {};
  console.error = () => {};
  console.warn = () => {};
}

export default App;