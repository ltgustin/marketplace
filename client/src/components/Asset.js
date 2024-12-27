import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Asset({assetId,contract,apikey,setError}) {
  const [asset, setAsset] = useState('');
  const [rarity, setRarity] = useState('');
  const [rarityScale, setRarityScale] = useState();
  const [assetDaily, setAssetDaily] = useState(1);
  // collection rarity
  const collectionSize = 4999;
  const legendaryMax = Math.trunc(collectionSize * 0.01);
  const rareMax = Math.trunc(collectionSize * 0.1);
  const uncommonMax = Math.trunc(collectionSize * 0.5);

  const clickAsset = (id) => {
    alert('clicked'+id);
  };

  const getSingleAsset = {
    method: 'GET',
    url: 'https://api.opensea.io/api/v2/chain/ethereum/contract/'+contract+'/nfts/'+assetId,
    headers: {accept: 'application/json', 'X-API-KEY': apikey}
  };

  useEffect(() => {
    axios
      .request(getSingleAsset)
      .then(function (response) {
        setAsset(response.data.nft);
        const rarityForMath = response.data.nft.rarity.rank;
        setRarity(rarityForMath);

        //per day
        // setPerDay((perDay) => perDay + assetDaily)

        if(rarityForMath >= uncommonMax && rarityForMath <= collectionSize) {
          setRarityScale('common');
        }
        if(rarityForMath >= rareMax && rarityForMath <= uncommonMax) {
          setRarityScale('uncommon');
        }
        if(rarityForMath > legendaryMax && rarityForMath < rareMax) {
          setRarityScale('rare');
        }
        if(rarityForMath >= 1 && rarityForMath <= legendaryMax) {
          setRarityScale('legendary');
        }

        if(response.data.nft.length === 0) {
          setError('Incorrect ID somehow');
        }
      })
      .catch(function (error) {
        setError('Error: '+error);
    });
  }, []);

  return (
    <div 
      onClick={() => clickAsset(assetId)}
      className="asset"
    >
      <div className="img-wrap">
        <img src={asset.image_url} id={asset.identifier} />
        <span className={`rank ${rarityScale}`}>Rank: <strong>{rarity}</strong></span>
      </div>

      <div className="asset-bottom">
        <p>ID# <strong>{asset.identifier}</strong></p>
        <p>Daily Tokens: <strong>{assetDaily}</strong></p>
      </div>
    </div>
  );
}

export default Asset;