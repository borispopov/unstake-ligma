"use client";

import React, { useState, useEffect } from 'react';
import { PublicKey } from '@solana/web3.js';
import { connectWallet, unstakeLigmaTokens } from '../util/unstake';

const Home: React.FC = () => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [amount, setAmount] = useState('')
  const [text, setText] = useState('')

  useEffect(() => {
    const checkIfWalletIsConnected = async () => {
      if ('solana' in window) {
        const { solana } = window as any;
        if (solana.isPhantom) {
          try {
            const response = await solana.connect({ onlyIfTrusted: true });
            console.log('Wallet already connected')
            setWalletAddress(response.publicKey.toString());

          } catch (error) {
            console.error(error)
          }
        }
      }
    };
    checkIfWalletIsConnected();
  }, []);

  const handleConnectWallet = async () => {
    const address = await connectWallet();
    if (address) {
      setWalletAddress(address);
    }
  };

  const handleUnstakeLigma = async () => {
    if (walletAddress) {
      try {
        const signature = await unstakeLigmaTokens(new PublicKey(walletAddress), parseFloat(amount));
        setText('https://solscan.io/tx/' + signature);
      } catch (err) {
        console.error('Transaction failed!', err);
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '100px' }}>
      <h1>Unstake Your Ligma Tokens</h1>
      {!walletAddress ? (
        <button onClick={handleConnectWallet}>Connect Wallet</button>
      ) : (
        <div style={{display: 'flex', flexDirection: 'column', padding: 20, gap: 5, maxWidth: 300}}>
          <label htmlFor="input">xligma token amount</label>
          <input type="text" placeholder='50000' value={amount} onChange={e => setAmount(e.target.value)}/>
          <button onClick={handleUnstakeLigma}>Unstake Ligma</button>
          <p style={{wordWrap: 'break-word'}}>{text}</p>
        </div>
      )}
    </div>
  );
};

export default Home;
