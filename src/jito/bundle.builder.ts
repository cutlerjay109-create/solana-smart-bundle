import {
  Transaction,
  SystemProgram,
  PublicKey,
} from "@solana/web3.js";
import { loadKeypair } from "../wallet/keypair.loader";
import { fetchRealTipAccounts, getRandomTipAccountSync } from "./tip.fetcher";
import { signTransaction } from "../transaction/signer";
import { BlockhashInfo } from "../blockhash/fetcher";

export interface Bundle {
  transactions: Transaction[];
  tipLamports: number;
  tipAccount: string;
  builtAt: number;
}

export const buildTipTransaction = (
  tipLamports: number,
  blockhashInfo: BlockhashInfo,
  tipAccount: string
): Transaction => {
  const keypair = loadKeypair();
  const tipAccountPubkey = new PublicKey(tipAccount);

  const tipTransaction = new Transaction();
  tipTransaction.recentBlockhash = blockhashInfo.blockhash;
  tipTransaction.lastValidBlockHeight = blockhashInfo.lastValidBlockHeight;
  tipTransaction.feePayer = keypair.publicKey;

  tipTransaction.add(
    SystemProgram.transfer({
      fromPubkey: keypair.publicKey,
      toPubkey: tipAccountPubkey,
      lamports: tipLamports,
    })
  );

  return signTransaction(tipTransaction);
};

export const buildBundle = async (
  transactions: Transaction[],
  tipLamports: number,
  blockhashInfo: BlockhashInfo
): Promise<Bundle> => {
  const keypair = loadKeypair();

  const accounts = await fetchRealTipAccounts();
  const tipAccount = accounts[Math.floor(Math.random() * accounts.length)];
  console.log(`Using tip account: ${tipAccount}`);

  const tipTx = buildTipTransaction(tipLamports, blockhashInfo, tipAccount);

  const signedTransactions = transactions.map((tx) => {
    tx.recentBlockhash = blockhashInfo.blockhash;
    tx.lastValidBlockHeight = blockhashInfo.lastValidBlockHeight;
    tx.feePayer = keypair.publicKey;
    return signTransaction(tx);
  });

  return {
    transactions: [tipTx, ...signedTransactions],
    tipLamports,
    tipAccount,
    builtAt: Date.now(),
  };
};
