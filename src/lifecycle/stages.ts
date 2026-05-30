export enum LifecycleStage {
  PENDING = "pending",
  SUBMITTED = "submitted",
  PROCESSED = "processed",
  CONFIRMED = "confirmed",
  FINALIZED = "finalized",
  FAILED = "failed",
}

export interface StageRecord {
  stage: LifecycleStage;
  slot: number;
  timestamp: number;
}

export const STAGE_ORDER = [
  LifecycleStage.PENDING,
  LifecycleStage.SUBMITTED,
  LifecycleStage.PROCESSED,
  LifecycleStage.CONFIRMED,
  LifecycleStage.FINALIZED,
];

export const getNextStage = (
  current: LifecycleStage
): LifecycleStage | null => {
  const index = STAGE_ORDER.indexOf(current);
  if (index === -1 || index === STAGE_ORDER.length - 1) return null;
  return STAGE_ORDER[index + 1];
};

export const isTerminalStage = (stage: LifecycleStage): boolean => {
  return (
    stage === LifecycleStage.FINALIZED || stage === LifecycleStage.FAILED
  );
};
