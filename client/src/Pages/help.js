import React from 'react';
import Header from '../components/Header';
import RightTop from '../components/RightTop';

const Help = ({address,setAddress,userTokens,assets,assetsNum,error,setError,contract,apikey,multiplier,perDay,timeLeft}) => {
  return (
    <div className="page-wrap help">
      <Header 
      current="help"
      />

      <div className="right-wrap">

        <RightTop 
          assetsNum={assetsNum}
          address={address}
          setAddress={setAddress}
          userTokens={userTokens}
          multiplier={multiplier}
          perDay={perDay}
          timeLeft={timeLeft}
        />

        <div className="home-inner container">
          <h1>Help & Support</h1>

          <p>FAQs and whatnot</p>
        </div>
      </div>
    </div>
  )
};

export default Help;