import { Transaction, VersionedTransaction, Keypair } from "@solana/web3.js";
import { loadKeypair } from "./keypair.loader";

export const signTransaction = (transaction: Transaction): Transaction => {
  const keypair = loadKeypair();
  transaction.sign(keypair);
  return transaction;
};

export const signVersionedTransaction = (
  transaction: VersionedTransaction
): VersionedTransaction => {
  const keypair = loadKeypair();
  transaction.sign([keypair]);
  return transaction;
};

export const signAllTransactions = (
  transactions: Transaction[]
): Transaction[] => {
  const keypair = loadKeypair();
  transactions.forEach((tx) => tx.sign(keypair));
  return transactions;
};

export const getKeypair = (): Keypair => {
  return loadKeypair();
};
