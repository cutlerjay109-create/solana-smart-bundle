import { Connection, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { loadKeypair } from "./keypair.loader";

const getDevnetConnection = () => {
  return new Connection("https://api.devnet.solana.com", "confirmed");
};

export const getBalance = async (): Promise<number> => {
  const connection = getDevnetConnection();
  const keypair = loadKeypair();
  const balance = await connection.getBalance(keypair.publicKey);
  return balance;
};

export const getBalanceInSol = async (): Promise<number> => {
  const balance = await getBalance();
  return balance / LAMPORTS_PER_SOL;
};

export const checkMinimumBalance = async (
  minimumLamports: number = 1000000
): Promise<boolean> => {
  const balance = await getBalance();
  if (balance < minimumLamports) {
    console.warn(
      `Low balance warning: ${balance} lamports. Minimum required: ${minimumLamports}`
    );
    return false;
  }
  return true;
};
