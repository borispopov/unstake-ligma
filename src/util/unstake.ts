import {
  Connection,
  PublicKey,
  TransactionInstruction,
  VersionedTransaction,
  ComputeBudgetProgram,
  TransactionMessage,
} from '@solana/web3.js';
import { getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from '@solana/spl-token';

// Constants
const RPC_URL = 'https://solana-mainnet.core.chainstack.com/c66e6078957a0376aae2632af596dd66/';
const LIGMA_PROGRAM_ID = new PublicKey("pLigmFBt3J3gLeZv1tehqZ3RhWcMmTkGart6oN9tqkX");
const LIGMA_ADDRESS = new PublicKey("node3SHFNF7h6N9jbztfVcXrZcvAJdns1xAV8CbYFLG");
const XLIGMA_ADDRESS = new PublicKey("xNodeyB1u8WNrKQJqfucbKDMq7LYcAQfYXmqVdDj9M5");
const CONSTANT_ACCOUNT = new PublicKey("ENz6c4ZVYedrcK5V4fh7vwDA1SvZDNDQb1j3KKQbbo8Q");

export const connectWallet = async (): Promise<string | null> => {
  if ('solana' in window) {
    const { solana } = window as any;
    if (solana.isPhantom) {
      try {
        const response = await solana.connect();
        console.log('Connected to wallet')
        return response.publicKey.toString();
      } catch (err) {
        console.error('Connection to wallet failed!', err);
        return null;
      }
    } else {
      alert('Phantom wallet not found! Please install it.');
      return null;
    }
  }
  return null;
};

export const unstakeLigmaTokens = async (payer: PublicKey, amount: number) => {
  const connection = new Connection(RPC_URL, 'finalized');

  const xligmaTokenAccount = await getAssociatedTokenAddress(XLIGMA_ADDRESS, payer);
  const ligmaTokenAccount = await getAssociatedTokenAddress(LIGMA_ADDRESS, payer);

  const dataFunctionName = '5a5f6b2acd7c32e1fe';
  const splAmount = Buffer.alloc(8);
  splAmount.writeBigUInt64LE(BigInt(amount * 1_000_000)); // Example amount

  const buyInstruction = new TransactionInstruction({
    programId: LIGMA_PROGRAM_ID,
    keys: [
      { pubkey: LIGMA_ADDRESS, isSigner: false, isWritable: false },
      { pubkey: XLIGMA_ADDRESS, isSigner: false, isWritable: true },
      { pubkey: xligmaTokenAccount, isSigner: false, isWritable: true },
      { pubkey: payer, isSigner: true, isWritable: true },
      { pubkey: CONSTANT_ACCOUNT, isSigner: false, isWritable: true },
      { pubkey: ligmaTokenAccount, isSigner: false, isWritable: true },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    ],
    data: Buffer.from(dataFunctionName + splAmount.toString('hex'), 'hex'),
  });

  const computeBudget = ComputeBudgetProgram.setComputeUnitLimit({ units: 100_000 });
  const computeBudgetPriority = ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 1_000_000 });

  const { blockhash } = await connection.getLatestBlockhash('finalized');

  const message = new TransactionMessage({
    payerKey: payer,
    recentBlockhash: blockhash,
    instructions: [computeBudget, computeBudgetPriority, buyInstruction],
  }).compileToV0Message();

  const transaction = new VersionedTransaction(message);

  const { solana } = window as any;
  const signedTransaction = await solana.signTransaction(transaction);
  const signature = await connection.sendTransaction(signedTransaction);

  return signature;
};
