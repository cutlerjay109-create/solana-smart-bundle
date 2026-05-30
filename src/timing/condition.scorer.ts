import { NetworkState } from "../state/network.state";
import { SlotState } from "../state/slot.state";
import { calculateCongestionScore } from "../tip/congestion.scorer";

export interface ConditionScore {
  score: number;
  isFavorable: boolean;
  reasons: string[];
}

export const scoreSubmissionConditions = (): ConditionScore => {
  const reasons: string[] = [];
  let score = 100;

  const congestion = calculateCongestionScore();
  if (congestion.level === "critical") {
    score -= 50;
    reasons.push("Critical network congestion");
  } else if (congestion.level === "high") {
    score -= 30;
    reasons.push("High network congestion");
  } else if (congestion.level === "medium") {
    score -= 15;
    reasons.push("Medium network congestion");
  }

  if (SlotState.isStale(5000)) {
    score -= 30;
    reasons.push("Slot stream is stale");
  }

  const health = NetworkState.getHealth();
  if (health === "congested") {
    score -= 20;
    reasons.push("Network health is congested");
  } else if (health === "degraded") {
    score -= 10;
    reasons.push("Network health is degraded");
  }

  score = Math.max(0, score);
  const isFavorable = score >= 60;

  if (isFavorable) {
    reasons.push("Conditions are favorable for submission");
  } else {
    reasons.push("Conditions unfavorable, consider waiting");
  }

  return { score, isFavorable, reasons };
};
