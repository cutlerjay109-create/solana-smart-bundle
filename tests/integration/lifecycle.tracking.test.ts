import { LifecycleTracker } from "../../src/lifecycle/tracker";
import { LifecycleStage } from "../../src/lifecycle/stages";
import { SlotState } from "../../src/state/slot.state";

describe("LifecycleTracking", () => {
  beforeEach(() => {
    LifecycleTracker.reset();
    SlotState.updateCurrentSlot(1000);
  });

  test("should track full lifecycle", () => {
    const entry = LifecycleTracker.createEntry("bundle-1", "sig-1", 5000);
    LifecycleTracker.updateStage("bundle-1", LifecycleStage.SUBMITTED, 1001);
    LifecycleTracker.updateStage("bundle-1", LifecycleStage.PROCESSED, 1003);
    LifecycleTracker.updateStage("bundle-1", LifecycleStage.CONFIRMED, 1005);
    LifecycleTracker.updateStage("bundle-1", LifecycleStage.FINALIZED, 1033);

    const updated = LifecycleTracker.getEntry("bundle-1");
    expect(updated?.currentStage).toBe(LifecycleStage.FINALIZED);
    expect(updated?.latency?.totalLatency).toBeGreaterThan(0);
  });
});
