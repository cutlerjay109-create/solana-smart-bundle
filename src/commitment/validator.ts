import { Commitment } from "@solana/web3.js";
import { getCommitmentWeight } from "./levels";

export const validateCommitment = (commitment: string): commitment is Commitment => {
  return ["processed", "confirmed", "finalized"].includes(commitment);
};

export const assertCommitmentReached = (
  current: Commitment,
  required: Commitment
): void => {
  if (getCommitmentWeight(current) < getCommitmentWeight(required)) {
    throw new Error(
      `Commitment level ${current} does not meet required level ${required}`
    );
  }
};

export const isCommitmentSufficient = (
  current: Commitment,
  required: Commitment
): boolean => {
  return getCommitmentWeight(current) >= getCommitmentWeight(required);
};
