import { BlockhashTracker } from "../../src/blockhash/tracker";
import { SlotState } from "../../src/state/slot.state";

describe("BlockhashManager", () => {
  beforeEach(() => {
    BlockhashTracker.reset();
    SlotState.reset();
  });

  test("should detect expired blockhash", () => {
    SlotState.updateCurrentSlot(1000);
    BlockhashTracker.setBlockhash({
      blockhash: "testblockhash",
      lastValidBlockHeight: 0,
      fetchedAt: Date.now() - 120000,
      fetchedSlot: 840,
    });
    expect(BlockhashTracker.isExpired()).toBe(true);
  });

  test("should detect valid blockhash", () => {
    SlotState.updateCurrentSlot(1000);
    BlockhashTracker.setBlockhash({
      blockhash: "testblockhash",
      lastValidBlockHeight: 99999,
      fetchedAt: Date.now(),
      fetchedSlot: 990,
    });
    expect(BlockhashTracker.isExpired()).toBe(false);
  });

  test("should detect close to expiry", () => {
    SlotState.updateCurrentSlot(1000);
    BlockhashTracker.setBlockhash({
      blockhash: "testblockhash",
      lastValidBlockHeight: 99999,
      fetchedAt: Date.now(),
      fetchedSlot: 985,
    });
    expect(BlockhashTracker.isCloseToExpiry(20)).toBe(true);
  });

  test("should return null when no blockhash set", () => {
    expect(BlockhashTracker.getBlockhash()).toBeNull();
    expect(BlockhashTracker.isExpired()).toBe(true);
  });
});
