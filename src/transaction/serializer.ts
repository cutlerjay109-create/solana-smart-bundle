import { Transaction, VersionedTransaction } from "@solana/web3.js";

export const serializeTransaction = (
  transaction: Transaction,
  requireAllSignatures: boolean = true
): Buffer => {
  return transaction.serialize({
    requireAllSignatures,
    verifySignatures: requireAllSignatures,
  });
};

export const serializeVersionedTransaction = (
  transaction: VersionedTransaction
): Buffer => {
  return Buffer.from(transaction.serialize());
};

export const serializeToBase64 = (transaction: Transaction): string => {
  return serializeTransaction(transaction, false).toString("base64");
};

export const serializeToBase58 = (transaction: Transaction): string => {
  const bs58 = require("bs58");
  return bs58.encode(serializeTransaction(transaction, false));
};
