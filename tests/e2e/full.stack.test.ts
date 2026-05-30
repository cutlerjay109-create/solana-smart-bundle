import { LifecycleTracker } from "../../src/lifecycle/tracker";
import { SlotState } from "../../src/state/slot.state";
import { NetworkState } from "../../src/state/network.state";
import { RetryState } from "../../src/state/retry.state";
import { BlockhashTracker } from "../../src/blockhash/tracker";

describe("FullStack", () => {
  beforeEach(() => {
    LifecycleTracker.reset();
    SlotState.reset();
    NetworkState.reset();
    RetryState.reset();
    BlockhashTracker.reset();
  });

  test("should initialize all state correctly", () => {
    expect(SlotState.getCurrentSlot()).toBe(0);
    expect(NetworkState.getHealth()).toBe("unknown");
    expect(LifecycleTracker.getAllEntries().length).toBe(0);
  });

  test("should update network state correctly", () => {
    NetworkState.updateConfirmationTime(1500);
    NetworkState.updateCongestionScore(20);
    expect(NetworkState.getHealth()).toBe("healthy");
  });
});
