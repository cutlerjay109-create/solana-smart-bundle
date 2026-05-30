import { Connection } from "@solana/web3.js";

export interface BlockhashInfo {
  blockhash: string;
  lastValidBlockHeight: number;
  fetchedAt: number;
  fetchedSlot: number;
}

const getDevnetConnection = () => {
  return new Connection("https://api.devnet.solana.com", "confirmed");
};

export const fetchLatestBlockhash = async (): Promise<BlockhashInfo> => {
  const connection = getDevnetConnection();

  const { blockhash, lastValidBlockHeight } =
    await connection.getLatestBlockhash("confirmed");

  const slot = await connection.getSlot("confirmed");

  return {
    blockhash,
    lastValidBlockHeight,
    fetchedAt: Date.now(),
    fetchedSlot: slot,
  };
};

export const fetchBlockhashWithRetry = async (
  maxRetries: number = 3
): Promise<BlockhashInfo> => {
  let lastError: Error | null = null;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fetchLatestBlockhash();
    } catch (error) {
      lastError = error as Error;
      console.warn(`Blockhash fetch attempt ${i + 1} failed:`, error);
      await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)));
    }
  }

  throw lastError || new Error("Failed to fetch blockhash");
};
