import { BlockhashTracker } from "../blockhash/tracker";
import { BlockhashInfo } from "../blockhash/fetcher";
import { SlotState } from "../state/slot.state";

export const simulateBlockhashExpiry = (): BlockhashInfo => {
  console.log("🔴 FAULT INJECTION: Simulating blockhash expiry...");

  const currentSlot = SlotState.getCurrentSlot();
  const expiredBlockhash: BlockhashInfo = {
    blockhash: "ExpiredBlockhashSimulated111111111111111111111",
    lastValidBlockHeight: 0,
    fetchedAt: Date.now() - 120000,
    fetchedSlot: currentSlot - 160,
  };

  BlockhashTracker.setBlockhash(expiredBlockhash);

  console.log(
    `🔴 FAULT INJECTION: Blockhash set to expired (slot age: 160 slots)`
  );

  return expiredBlockhash;
};

export const isBlockhashExpired = (): boolean => {
  return BlockhashTracker.isExpired();
};
