import { fetchLatestBlockhash, BlockhashInfo } from "./fetcher";
import { BlockhashTracker } from "./tracker";

export const refreshBlockhash = async (): Promise<BlockhashInfo> => {
  console.log("Refreshing blockhash...");
  const newBlockhash = await fetchLatestBlockhash();
  BlockhashTracker.setBlockhash(newBlockhash);
  console.log(
    `Blockhash refreshed: ${newBlockhash.blockhash} at slot ${newBlockhash.fetchedSlot}`
  );
  return newBlockhash;
};

export const ensureFreshBlockhash = async (): Promise<BlockhashInfo> => {
  if (BlockhashTracker.isExpired() || BlockhashTracker.isCloseToExpiry()) {
    return await refreshBlockhash();
  }

  const current = BlockhashTracker.getBlockhash();
  if (!current) {
    return await refreshBlockhash();
  }

  return current;
};

export const startBlockhashRefresher = (
  intervalMs: number = 30000
): NodeJS.Timeout => {
  return setInterval(async () => {
    if (BlockhashTracker.isCloseToExpiry(30)) {
      try {
        await refreshBlockhash();
      } catch (error) {
        console.error("Auto blockhash refresh failed:", error);
      }
    }
  }, intervalMs);
};
