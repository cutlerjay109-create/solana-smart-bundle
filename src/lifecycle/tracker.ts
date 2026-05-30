import { v4 as uuidv4 } from "uuid";
import { LifecycleStage, StageRecord } from "./stages";
import { calculateLatency, LatencyMetrics } from "./latency.calculator";
import { SlotState } from "../state/slot.state";

export interface LifecycleEntry {
  id: string;
  bundleId: string;
  signature: string;
  tipLamports: number;
  stages: Partial<Record<LifecycleStage, StageRecord>>;
  currentStage: LifecycleStage;
  failureReason?: string;
  latency?: LatencyMetrics;
  createdAt: number;
}

export class LifecycleTracker {
  private static entries: Map<string, LifecycleEntry> = new Map();

  static createEntry(
    bundleId: string,
    signature: string,
    tipLamports: number
  ): LifecycleEntry {
    const entry: LifecycleEntry = {
      id: uuidv4(),
      bundleId,
      signature,
      tipLamports,
      stages: {},
      currentStage: LifecycleStage.PENDING,
      createdAt: Date.now(),
    };

    this.entries.set(bundleId, entry);
    return entry;
  }

  static updateStage(
    bundleId: string,
    stage: LifecycleStage,
    slot?: number
  ): void {
    const entry = this.entries.get(bundleId);
    if (!entry) return;

    const stageRecord: StageRecord = {
      stage,
      slot: slot || SlotState.getCurrentSlot(),
      timestamp: Date.now(),
    };

    entry.stages[stage] = stageRecord;
    entry.currentStage = stage;

    entry.latency = calculateLatency(
      entry.stages[LifecycleStage.SUBMITTED]?.timestamp,
      entry.stages[LifecycleStage.PROCESSED]?.timestamp,
      entry.stages[LifecycleStage.CONFIRMED]?.timestamp,
      entry.stages[LifecycleStage.FINALIZED]?.timestamp
    );

    this.entries.set(bundleId, entry);
  }

  static markFailed(bundleId: string, reason: string): void {
    const entry = this.entries.get(bundleId);
    if (!entry) return;

    entry.currentStage = LifecycleStage.FAILED;
    entry.failureReason = reason;
    entry.stages[LifecycleStage.FAILED] = {
      stage: LifecycleStage.FAILED,
      slot: SlotState.getCurrentSlot(),
      timestamp: Date.now(),
    };

    this.entries.set(bundleId, entry);
  }

  static getEntry(bundleId: string): LifecycleEntry | undefined {
    return this.entries.get(bundleId);
  }

  static getAllEntries(): LifecycleEntry[] {
    return Array.from(this.entries.values());
  }

  static getFailedEntries(): LifecycleEntry[] {
    return this.getAllEntries().filter(
      (e) => e.currentStage === LifecycleStage.FAILED
    );
  }

  static reset(): void {
    this.entries.clear();
  }
}
