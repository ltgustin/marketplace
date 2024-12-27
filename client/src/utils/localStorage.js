export const saveTokensToLocalStorage = (tokens) => {
  localStorage.setItem('tokens', tokens);
  localStorage.setItem('lastCalculationTimestamp', Date.now());
};

export const loadTokensFromLocalStorage = () => {
  return {
    tokens: localStorage.getItem('tokens'),
    lastCalculationTimestamp: localStorage.getItem('lastCalculationTimestamp'),
  };
};

export const clearLocalStorage = () => {
  localStorage.removeItem('tokens');
  localStorage.removeItem('lastCalculationTimestamp');
};