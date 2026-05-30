import {
  Transaction,
  TransactionInstruction,
  PublicKey,
  SystemProgram,
} from "@solana/web3.js";
import { BlockhashInfo } from "../blockhash/fetcher";
import { loadKeypair } from "../wallet/keypair.loader";

export interface TransactionOptions {
  instructions: TransactionInstruction[];
  blockhashInfo: BlockhashInfo;
  feePayer?: PublicKey;
}

export const buildTransaction = (options: TransactionOptions): Transaction => {
  const { instructions, blockhashInfo, feePayer } = options;
  const keypair = loadKeypair();

  const transaction = new Transaction();
  transaction.recentBlockhash = blockhashInfo.blockhash;
  transaction.lastValidBlockHeight = blockhashInfo.lastValidBlockHeight;
  transaction.feePayer = feePayer || keypair.publicKey;

  instructions.forEach((instruction) => {
    transaction.add(instruction);
  });

  return transaction;
};

export const buildTransferTransaction = (
  toAddress: string,
  lamports: number,
  blockhashInfo: BlockhashInfo
): Transaction => {
  const keypair = loadKeypair();
  const toPublicKey = new PublicKey(toAddress);

  const transferInstruction = SystemProgram.transfer({
    fromPubkey: keypair.publicKey,
    toPubkey: toPublicKey,
    lamports,
  });

  return buildTransaction({
    instructions: [transferInstruction],
    blockhashInfo,
  });
};
