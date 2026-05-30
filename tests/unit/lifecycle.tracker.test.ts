import { LifecycleTracker } from "../../src/lifecycle/tracker";
import { LifecycleStage } from "../../src/lifecycle/stages";
import { SlotState } from "../../src/state/slot.state";

describe("LifecycleTracker", () => {
  beforeEach(() => {
    LifecycleTracker.reset();
    SlotState.updateCurrentSlot(1000);
  });

  test("should create lifecycle entry", () => {
    const entry = LifecycleTracker.createEntry("bundle-1", "sig-1", 5000);
    expect(entry.bundleId).toBe("bundle-1");
    expect(entry.signature).toBe("sig-1");
    expect(entry.tipLamports).toBe(5000);
    expect(entry.currentStage).toBe(LifecycleStage.PENDING);
  });

  test("should update stage correctly", () => {
    LifecycleTracker.createEntry("bundle-1", "sig-1", 5000);
    LifecycleTracker.updateStage("bundle-1", LifecycleStage.SUBMITTED, 1001);
    const entry = LifecycleTracker.getEntry("bundle-1");
    expect(entry?.currentStage).toBe(LifecycleStage.SUBMITTED);
    expect(entry?.stages[LifecycleStage.SUBMITTED]?.slot).toBe(1001);
  });

  test("should mark entry as failed", () => {
    LifecycleTracker.createEntry("bundle-1", "sig-1", 5000);
    LifecycleTracker.markFailed("bundle-1", "Test failure");
    const entry = LifecycleTracker.getEntry("bundle-1");
    expect(entry?.currentStage).toBe(LifecycleStage.FAILED);
    expect(entry?.failureReason).toBe("Test failure");
  });

  test("should get failed entries", () => {
    LifecycleTracker.createEntry("bundle-1", "sig-1", 5000);
    LifecycleTracker.createEntry("bundle-2", "sig-2", 5000);
    LifecycleTracker.markFailed("bundle-1", "Failed");
    const failed = LifecycleTracker.getFailedEntries();
    expect(failed.length).toBe(1);
    expect(failed[0].bundleId).toBe("bundle-1");
  });
});
