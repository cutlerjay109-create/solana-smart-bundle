import { Commitment, Connection } from "@solana/web3.js";
import { createConnection } from "../config/rpc";
import { CommitmentLevels } from "./levels";

export const waitForCommitment = async (
  signature: string,
  commitment: Commitment = CommitmentLevels.CONFIRMED,
  timeoutMs: number = 60000
): Promise<boolean> => {
  const connection = createConnection(commitment);

  const startTime = Date.now();

  while (Date.now() - startTime < timeoutMs) {
    const status = await connection.getSignatureStatus(signature, {
      searchTransactionHistory: true,
    });

    if (status?.value?.confirmationStatus === commitment) {
      return true;
    }

    if (status?.value?.err) {
      throw new Error(
        `Transaction failed: ${JSON.stringify(status.value.err)}`
      );
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  throw new Error(`Timeout waiting for ${commitment} commitment`);
};

export const getTransactionStatus = async (
  signature: string
): Promise<string | null> => {
  const connection = createConnection();
  const status = await connection.getSignatureStatus(signature, {
    searchTransactionHistory: true,
  });

  return status?.value?.confirmationStatus || null;
};
