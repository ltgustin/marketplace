import Header from '../components/Header';
import RightTop from '../components/RightTop';

const Shop = ({address,setAddress,userTokens,assets,assetsNum,error,setError,contract,apikey,multiplier,perDay,timeLeft}) => {

  return (
    <div className="page-wrap shop">
      <Header 
      current="shop"
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
          <h1>Spend Tokens</h1>
          <p>SPEND YOUR TOKENS HERE</p>
        </div>
      </div>
    </div>
  )
};

export default Shop;