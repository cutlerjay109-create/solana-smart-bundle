import { simulateBlockhashExpiry } from "../../src/fault-injection/blockhash.expiry.sim";
import { enableFeeTooLowSim, disableFeeTooLowSim, isFeeTooLowSimEnabled } from "../../src/fault-injection/fee.too.low.sim";
import { enableBundleFailureSim, disableBundleFailureSim, isBundleFailureSimEnabled } from "../../src/fault-injection/bundle.failure.sim";
import { BlockhashTracker } from "../../src/blockhash/tracker";
import { SlotState } from "../../src/state/slot.state";

describe("FaultInjection", () => {
  beforeEach(() => {
    BlockhashTracker.reset();
    SlotState.updateCurrentSlot(1000);
    disableFeeTooLowSim();
    disableBundleFailureSim();
  });

  test("should simulate blockhash expiry", () => {
    simulateBlockhashExpiry();
    expect(BlockhashTracker.isExpired()).toBe(true);
  });

  test("should enable and disable fee too low sim", () => {
    expect(isFeeTooLowSimEnabled()).toBe(false);
    enableFeeTooLowSim();
    expect(isFeeTooLowSimEnabled()).toBe(true);
    disableFeeTooLowSim();
    expect(isFeeTooLowSimEnabled()).toBe(false);
  });

  test("should enable and disable bundle failure sim", () => {
    expect(isBundleFailureSimEnabled()).toBe(false);
    enableBundleFailureSim();
    expect(isBundleFailureSimEnabled()).toBe(true);
    disableBundleFailureSim();
    expect(isBundleFailureSimEnabled()).toBe(false);
  });
});
