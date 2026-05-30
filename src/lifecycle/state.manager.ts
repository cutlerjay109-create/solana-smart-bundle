import { LifecycleTracker, LifecycleEntry } from "./tracker";
import { LifecycleStage } from "./stages";

export class LifecycleStateManager {
  static getActiveEntries(): LifecycleEntry[] {
    return LifecycleTracker.getAllEntries().filter(
      (e) =>
        e.currentStage !== LifecycleStage.FINALIZED &&
        e.currentStage !== LifecycleStage.FAILED
    );
  }

  static getPendingEntries(): LifecycleEntry[] {
    return LifecycleTracker.getAllEntries().filter(
      (e) => e.currentStage === LifecycleStage.PENDING
    );
  }

  static getCompletedEntries(): LifecycleEntry[] {
    return LifecycleTracker.getAllEntries().filter(
      (e) => e.currentStage === LifecycleStage.FINALIZED
    );
  }

  static getSummary(): object {
    const all = LifecycleTracker.getAllEntries();
    return {
      total: all.length,
      pending: all.filter((e) => e.currentStage === LifecycleStage.PENDING).length,
      submitted: all.filter((e) => e.currentStage === LifecycleStage.SUBMITTED).length,
      processed: all.filter((e) => e.currentStage === LifecycleStage.PROCESSED).length,
      confirmed: all.filter((e) => e.currentStage === LifecycleStage.CONFIRMED).length,
      finalized: all.filter((e) => e.currentStage === LifecycleStage.FINALIZED).length,
      failed: all.filter((e) => e.currentStage === LifecycleStage.FAILED).length,
    };
  }
}
