import { Transaction } from "@solana/web3.js";
import { BlockhashTracker } from "../blockhash/tracker";

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export const validateTransaction = (
  transaction: Transaction
): ValidationResult => {
  const errors: string[] = [];

  if (!transaction.recentBlockhash) {
    errors.push("Missing recentBlockhash");
  }

  if (!transaction.feePayer) {
    errors.push("Missing feePayer");
  }

  if (transaction.instructions.length === 0) {
    errors.push("No instructions in transaction");
  }

  if (BlockhashTracker.isExpired()) {
    errors.push("Blockhash is expired");
  }

  if (transaction.instructions.length > 10) {
    errors.push("Too many instructions (max 10)");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

export const assertValidTransaction = (transaction: Transaction): void => {
  const result = validateTransaction(transaction);
  if (!result.valid) {
    throw new Error(
      `Invalid transaction: ${result.errors.join(", ")}`
    );
  }
};
