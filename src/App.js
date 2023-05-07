import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { contractAbi, contractAddress } from './Constant/constant.js'
import Login from './Components/login.jsx'
import Connected from './Components/connected.jsx';
import './App.css';

function App() {
  const [provider, setProvider] = useState(null);
  const [account, setAccount] = useState(null);
  const [isConnected, setConnected] = useState(false);
  const [elections, setElections] = useState([]);

  useEffect(() => {
    if (window.ethereum) {
        window.ethereum.on('accountsChanged', handleAccountsChanged);
    }
  },[]);

  function handleAccountsChanged(accounts) {
    if (accounts.length > 0 && account !== accounts[0]) {
      setAccount(accounts[0]);
    } else {
      setConnected(false);
      setAccount(null);
    }
  }

  async function connectToMetamask() {
    if (window.ethereum) {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        setProvider(provider);
        await provider.send("eth_requestAccounts",[]);
        const signer = provider.getSigner();

        const contractInstance = new ethers.Contract (
          contractAddress, contractAbi, signer
        );
    
        const elections =  await contractInstance.getAllElection();
    
        setElections(elections);

        const addr = await signer.getAddress();
        console.log('metamask connected: ',addr);
        setConnected(true);

        console.log(elections);

        setAccount(addr);
      }
      catch (error) {
        console.error(error);
      }
    }
    else {
      console.error('Metamask is not detected in browser');
    }
  }

  if (isConnected) {
    return ( <Connected account = {account} elections = {elections} />);
  }
  else {
    return (<Login connectWallet = {connectToMetamask} />);
  }

}

export default App;
