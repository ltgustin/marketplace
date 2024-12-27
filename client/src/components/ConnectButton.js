import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

function ConnectButton({address,setAddress}) {
  const [walletConnectBtn, setConnectText] = useState("Connect Wallet");
  const [disconnect, setDisconnect] = useState(false);

  const web3 = new Web3(window.ethereum);
  const [wallet, setWallet] = useState(null)
  const userAddress = '';

  // truncate the wallet address
  var truncateRegex = /^(0x[a-zA-Z0-9]{4})[a-zA-Z0-9]+([a-zA-Z0-9]{4})$/;
  var truncateEthAddress = function (address) {
    var match = address.match(truncateRegex);
      if (!match)
        return address;
    return match[1] + "\u2026" + match[2];
  };

  // DISCONNECT WALLET
  const disconnectWallet = async () => {
    try {
      if (typeof window.ethereum !== 'undefined') {
        setWallet(null);
        localStorage.removeItem('userWalletAddress')
        setConnectText("Connect Wallet")
      }
    } catch (error) {
      alert('Error disconnecting wallet:', error);
    }
  }

  useEffect(() => {
    const storedWalletAddress = localStorage.getItem('userWalletAddress');
    if (storedWalletAddress) {
      setWallet(storedWalletAddress)
      setConnectText(truncateEthAddress(storedWalletAddress))
    }
  }, []);

  useEffect(() => {
    const handleAccountsChanged = (accounts) => {
      if (accounts.length > 0) {
        setAddress(accounts[0]);
        setConnectText(truncateEthAddress(accounts[0]));
      } else {
        setAddress(null);
        setConnectText("Connect Wallet");
      }
    };

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
    }

    // Cleanup function to remove the event listener
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }, [setAddress]);

  // CONNECT WALLET
  async function connectWallet() {
    // already stored address
    if(wallet) {
      setConnectText(truncateEthAddress(wallet))
    // nothing stored - grab it from the wallet
    } else {
      if (typeof window.ethereum !== 'undefined') {
        try {
          await window.ethereum.request({ method: 'eth_requestAccounts' });

          const web3 = new Web3(window.ethereum);

          const accounts = await web3.eth.getAccounts();
          const userAddress = accounts[0];

          setConnectText(truncateEthAddress(userAddress))

          // lets save it to local storage
          if (userAddress) {
            setAddress(userAddress)
            localStorage.setItem('userWalletAddress', userAddress);
          }
        } catch (error) {
          console.error(error);
        }
      } else {
        alert('No wallet detected. Please install MetaMask.');
      }
    }
  }

  // WALLET CHANGE
  if (typeof window.ethereum !== 'undefined') {
    window.ethereum.on('accountsChanged', (accounts) => {
      if (accounts.length === 0) {
        disconnectWallet();
      }
    });
  }

  const toggleDisconnect = () => {

  }

  return (
    <>
    {wallet
    ?
      <div className="wallet-buttons">
        <button 
          className="btn connect-wallet small"
          onClick={() => {
            setDisconnect(value => !value);
          }}
        ><FontAwesomeIcon icon="link" />{walletConnectBtn}</button>
        <button 
          className={"btn disconnect-wallet " 
          + (disconnect ? "display" : "")}
          onClick={disconnectWallet}
        ><FontAwesomeIcon icon="link-slash" />Disconnect</button>
      </div>
    :
      <button 
        className="btn connect-wallet small"
        onClick={connectWallet}
      ><FontAwesomeIcon icon="link" />{walletConnectBtn}</button>
    }
    </>
  );
}

export default ConnectButton;