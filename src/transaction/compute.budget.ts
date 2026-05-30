import {
  TransactionInstruction,
  ComputeBudgetProgram,
} from "@solana/web3.js";

export interface ComputeBudgetOptions {
  unitLimit?: number;
  unitPrice?: number;
}

export const createComputeBudgetInstructions = (
  options: ComputeBudgetOptions = {}
): TransactionInstruction[] => {
  const instructions: TransactionInstruction[] = [];
  const { unitLimit = 200000, unitPrice = 1000 } = options;

  instructions.push(
    ComputeBudgetProgram.setComputeUnitLimit({
      units: unitLimit,
    })
  );

  instructions.push(
    ComputeBudgetProgram.setComputeUnitPrice({
      microLamports: unitPrice,
    })
  );

  return instructions;
};

export const estimateComputeUnits = async (
  instructions: TransactionInstruction[]
): Promise<number> => {
  const baseUnits = 200000;
  const perInstructionUnits = 20000;
  return baseUnits + instructions.length * perInstructionUnits;
};
