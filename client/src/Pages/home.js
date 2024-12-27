import React from 'react';
import Header from '../components/Header';
import RightTop from '../components/RightTop';
import ConnectButton from '../components/ConnectButton';
import Asset from '../components/Asset';

const Home = ({address,setAddress,userTokens,assets,assetsNum,error,setError,contract,apikey,multiplier,perDay,timeLeft}) => {
  return (
    <div className="page-wrap home">
      <Header 
        current="home"
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

          {address
            ? 
            <div className="home-inner container">
                <h1 className="hasnum">Your Assets <span className="num">{assetsNum}</span></h1>
                <div className="wallet-contents">
                  {error && <p className="throw_error">{error}</p>}
                  {assets.length >= 1 &&
                    assets.map((asset) => {
                        return (
                          <Asset 
                            key={asset.identifier} 
                            contract={contract}
                            assetId={asset.identifier} 
                            apikey={apikey}
                            error={error}
                            setError={setError}
                            perDay={perDay}
                          />
                        )
                    })
                  }
                </div>
            </div>
            : 
            <div className="connect-to-inner container">
              <h1>Connect to view assets</h1>

              <ConnectButton 
              address={address}
              setAddress={setAddress}
              />
            </div>
          }

      </div>
    </div>
  )
};

export default Home;