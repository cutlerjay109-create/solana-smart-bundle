import { Keypair } from "@solana/web3.js";
import fs from "fs";
import path from "path";
import { config } from "../config";

export const loadKeypair = (): Keypair => {
  const keypairPath = path.resolve(config.wallet.keypairPath);
  
  if (!fs.existsSync(keypairPath)) {
    throw new Error(`Keypair file not found at: ${keypairPath}`);
  }

  const keypairData = JSON.parse(fs.readFileSync(keypairPath, "utf-8"));
  return Keypair.fromSecretKey(Uint8Array.from(keypairData));
};

export const getPublicKey = (): string => {
  const keypair = loadKeypair();
  return keypair.publicKey.toBase58();
};
