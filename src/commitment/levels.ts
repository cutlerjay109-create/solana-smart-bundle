import { Commitment } from "@solana/web3.js";

export const CommitmentLevels = {
  PROCESSED: "processed" as Commitment,
  CONFIRMED: "confirmed" as Commitment,
  FINALIZED: "finalized" as Commitment,
};

export const CommitmentOrder = [
  CommitmentLevels.PROCESSED,
  CommitmentLevels.CONFIRMED,
  CommitmentLevels.FINALIZED,
];

export const getCommitmentWeight = (commitment: Commitment): number => {
  switch (commitment) {
    case "processed":
      return 1;
    case "confirmed":
      return 2;
    case "finalized":
      return 3;
    default:
      return 0;
  }
};

export const isHigherCommitment = (
  a: Commitment,
  b: Commitment
): boolean => {
  return getCommitmentWeight(a) > getCommitmentWeight(b);
};

// Why we never use finalized for blockhash:
// Finalized blocks are typically 32+ slots behind the current slot.
// A blockhash expires after 150 slots.
// Using a finalized blockhash means your transaction
// starts with ~120 slots already consumed, leaving very
// little time to land before expiry.
export const BLOCKHASH_SAFE_COMMITMENT = CommitmentLevels.CONFIRMED;
