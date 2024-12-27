import React from 'react';
import ConnectButton from '../components/ConnectButton';

function RightTop({ address, setAddress, userTokens, multiplier, perDay, timeLeft }) {
  const formatTime = (milliseconds) => {
    if (isNaN(milliseconds)) {
      return '0m';
    }
    
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds / (1000 * 60)) % 60);
    
    // Always show hours and minutes for 2-hour timer
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="right-top d-flex gap-30">
      <div className="stats-wrap d-flex">
        <div className="stat">Points: <strong>{userTokens.toLocaleString()}</strong></div>
        <div className="stat">Multiplier: <strong>{multiplier}x</strong></div>
        <div className="stat">Per Day: <strong>{perDay}</strong></div>
        <div className="stat">Next Points: <strong>{formatTime(timeLeft)}</strong></div>
      </div>

      <ConnectButton 
        address={address}
        setAddress={setAddress}
      />
    </div>
  );
}

export default RightTop;