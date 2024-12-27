import React, { useState, useEffect, useRef } from 'react';
import WalletContents from './components/WalletContents';
import ConnectButton from './components/ConnectButton';
import { getUserWalletAddress } from './components/Utils';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

function GM(props) {
    const canvasRef = useRef(null)
    const canvas = canvasRef.current
    let theTrait = null
    
    const [collapsed, setCollapsed] = useState(false);
    const [tokenId, setTokenId] = useState('');
    const [imageURL, setImageURL] = useState('');
    const [plainImage, setPlainImage] = useState('');
    const [error, setError] = useState('');
    const [toggled, setToggle] = useState('image');
    const [savedTrait, setSavedTrait] = useState('');
    
    const theSize = props.size;
    const gm = props.gm;
    const userAddress = getUserWalletAddress();
    let x = 0, y = 0, IMG_WIDTH = theSize, IMG_HEIGHT = theSize;
    const regExp = /^0[0-9].*$/;

    useEffect(() => {
      if (userAddress) {
        setCollapsed(true)
        props.setAddress(userAddress)
      }
    }, [props.address]);

    // TOGGLE IMAGE
    let toggleButton = (type) => {
      setToggle(type)

      if(type === 'mug') {
        rerunFetchImage(null,imageURL,savedTrait,'mug')
      } else {
        rerunFetchImage(null,imageURL,null,'image')
      }
    }

    // FETCH IMAGE
    let fetchImage = (source, total, current) => {
      return new Promise(resolve => {
        let image = new Image();
        image.src = source;
        image.onload = () => {
          canvas.getContext('2d').globalAlpha = 1;
          canvas.getContext('2d').drawImage(image, x, y, IMG_WIDTH, IMG_HEIGHT);
          resolve();
        }  
        image.setAttribute('crossorigin', 'anonymous');

        setTimeout(() => {
          setImageURL(image);
        }, 500)
      });
    }

    const rerunFetchImage = (newData,newImage,newTrait,type) => {
      // Load the asset image first
      if(type === 'mug') {
        let trait = require('./images/gm/'+props.component+'/hand_'+newTrait+'.png')                
        
        if(trait !== null) {
          fetchImage(trait, 2, 1);
        }
      // ELSE IMAGE
      } else {
        fetchImage(plainImage, 1, 0)
      }

    } // fetch image

    const handleSubmit = async (e) => {
      e.preventDefault();

      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if(tokenId === '') {
          setError('ID cannot be blank');
      } else if(regExp.test(tokenId) == true) {
          setError('Remove the 0 at the beginning');
      } else if(tokenId > 7774) {
          setError('Choose an ID between 1 and 7774');
      } else {
        // GOOD TO GOOOOOO
        try {
          setToggle('image')
          const osApiKey = props.apikey;
          const osContract = props.contract;
                
          const axiosConfig = {
            method: 'GET',
            headers: {accept: 'application/json', 'X-API-KEY': `${osApiKey}`}
          }

          const response = await axios.get(`https://api.opensea.io/v2/chain/ethereum/contract/${osContract}/nfts/${tokenId}`, axiosConfig);
          
          let data = response.data;
          let imageURL  = data.nft.image_url;
          let image_resized = imageURL.replace('w=500', 'w=' + props.size);

          data.nft.traits.map((type) => {
            if(type.trait_type == props.trait) {
              const cleanTrait = type.value.replace(/\s+/g, '-').toLowerCase()
              setSavedTrait(cleanTrait)
            }
          }) // map 

          // rerunFetchImage(data,imageURL,null,'image')
          setImageURL(image_resized)
          setPlainImage(image_resized)

          fetchImage(image_resized, 1, 0)

          setError('');
        } catch (err) {
          setImageURL('');
          setError('Error fetching image. Please check the token ID.');
        }
      }
    };

    const downloadAsset = () => {
        const dataURL = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = dataURL;
        a.download = 'download.png';

        a.click();
    }

    return (
        <div className="gm-wrapper">
          <div className="page-intro">
            <h1>Unlock the Art of <strong>{props.name}</strong></h1>
            <p>Enter your token ID below or connect your wallet to generate a downloadable hi-res version of your {props.name}!</p>
          </div>

          <div className="gm">

            <div className="download-left">
              <div 
                className={
                  (collapsed ? "collapsed " : "") + "inner top"
                }
              >
                <form id="download-form" name="download-form" onSubmit={handleSubmit}>
                  <h2>Find Asset by <strong>Token ID</strong></h2>
                  <div className="field number">
                    <input
                      name="theid" 
                      id="theid" 
                      placeholder="Token ID" 
                      pattern="\d{1,4}" 
                      maxLength="4"
                      value={tokenId}
                      onChange={(e) => setTokenId(e.target.value)}
                    />
                  <button className="btn" type="submit"><span>Generate Image</span></button>
                  </div>{/* FIELD */}
                  {error && <p className="throw_error">{error}</p>}
                </form>{/* FORM */}
                  {props.address && (
                    <button 
                      className="btn toggle-top"
                      onClick={() => setCollapsed(false)}
                    ><FontAwesomeIcon icon="fa-solid fa-magnifying-glass" />Find Asset by Token</button>
                  )}
                </div>{/* INNER */}

                {props.address
                  ? 
                  <div className="inner bottom">
                    <h2>Find Asset by <strong>Wallet Contents</strong></h2>

                    <WalletContents 
                      wallet={props.address} 
                      apikey={props.apikey}
                      contract={props.contract}
                      size={theSize}
                      imageURL={imageURL}
                      setImageURL={setImageURL}
                      plainImage={plainImage}
                      setPlainImage={setPlainImage}
                      gm={gm}
                      component={props.component}
                      trait={props.trait}
                      toggled={toggled}
                      setToggle={setToggle}
                      savedTrait={savedTrait}
                      setSavedTrait={setSavedTrait}
                    />
                  </div>
                  : 
                  <div className="connect-to-inner">
                    <p>Want to choose from your wallet instead?</p>
                    <ConnectButton 
                    address={props.address}
                    setAddress={props.setAddress}
                    />
                  </div>
                }
            </div>{/* LEFT */}

            <div className="canvas-outter-wrap">
              <div id="canvas-wrap">
                  {imageURL && gm && 
                      <div className="image-toggle">
                        <button 
                          className={toggled == 'image' ? "active" : ""}
                          onClick={() => toggleButton('image')}
                        >Image Only</button>

                        <button 
                          className={toggled == 'mug' ? "active" : ""}
                          onClick={() => toggleButton('mug')}
                        >Add a Mug</button>
                      </div>
                  }
                  <canvas
                    ref={canvasRef}
                    id="imageCanvas"
                    width={theSize}
                    height={theSize}
                    style={{backgroundImage: `url(${props.bg})`}}
                  ></canvas>
                {imageURL && (
                  <>
                  <img
                    crossOrigin="anonymous"
                    src={imageURL}
                    alt="Token"
                    style={{ display: 'none' }}
                  />
                  </>
                )}
              </div>{/* CANVAS WRAP */}
                {imageURL && (
                  <button 
                    className="download btn blue"
                    onClick={downloadAsset}
                  >Download Image</button>
                )}
            </div>

          </div>{/* GM */}
        </div>
    )
}

export default GM;