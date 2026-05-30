import { NetworkState } from "../state/network.state";
import { SlotState } from "../state/slot.state";

export interface CongestionScore {
  score: number;
  level: "low" | "medium" | "high" | "critical";
  factors: string[];
}

export const calculateCongestionScore = (): CongestionScore => {
  const factors: string[] = [];
  let score = 0;

  const networkMetrics = NetworkState.getMetrics();

  if (networkMetrics.avgConfirmationMs > 10000) {
    score += 40;
    factors.push("Very high confirmation times");
  } else if (networkMetrics.avgConfirmationMs > 5000) {
    score += 25;
    factors.push("High confirmation times");
  } else if (networkMetrics.avgConfirmationMs > 2000) {
    score += 10;
    factors.push("Moderate confirmation times");
  }

  const slotAge = SlotState.getSlotAge();
  if (slotAge > 5000) {
    score += 30;
    factors.push("Slot stream is stale");
  } else if (slotAge > 2000) {
    score += 15;
    factors.push("Slot stream slightly delayed");
  }

  if (networkMetrics.avgSlotTimeMs > 600) {
    score += 20;
    factors.push("Slow slot times detected");
  } else if (networkMetrics.avgSlotTimeMs > 450) {
    score += 10;
    factors.push("Slightly slow slot times");
  }

  score = Math.min(100, score);
  NetworkState.updateCongestionScore(score);

  let level: "low" | "medium" | "high" | "critical";
  if (score >= 75) level = "critical";
  else if (score >= 50) level = "high";
  else if (score >= 25) level = "medium";
  else level = "low";

  return { score, level, factors };
};
