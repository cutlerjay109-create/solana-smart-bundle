import { getRecentTipHistory } from "./history.fetcher";
import { analyzeTipTrend } from "./trend.analyzer";
import { calculateCongestionScore } from "./congestion.scorer";
import { config } from "../config";

export interface OptimalTipResult {
  tipLamports: number;
  reasoning: string;
  congestionScore: number;
  trendDirection: string;
  percentileUsed: string;
}

export const calculateOptimalTip = async (): Promise<OptimalTipResult> => {
  const history = await getRecentTipHistory(10);
  const trend = analyzeTipTrend(history);
  const congestion = calculateCongestionScore();

  const latestTip = history[history.length - 1];
  let tipLamports: number;
  let percentileUsed: string;

  if (congestion.level === "critical") {
    tipLamports = latestTip.landed_tips_99th_percentile;
    percentileUsed = "99th";
  } else if (congestion.level === "high") {
    tipLamports = latestTip.landed_tips_95th_percentile;
    percentileUsed = "95th";
  } else if (congestion.level === "medium" || trend.direction === "rising") {
    tipLamports = latestTip.landed_tips_75th_percentile;
    percentileUsed = "75th";
  } else {
    tipLamports = latestTip.landed_tips_50th_percentile;
    percentileUsed = "50th";
  }

  tipLamports = Math.max(
    config.tip.minLamports,
    Math.min(config.tip.maxLamports, Math.floor(tipLamports))
  );

  const reasoning = [
    `Congestion: ${congestion.level} (score: ${congestion.score})`,
    `Trend: ${trend.direction} (${trend.changePercent.toFixed(1)}%)`,
    `Using ${percentileUsed} percentile: ${tipLamports} lamports`,
    trend.recommendation,
  ].join(" | ");

  return {
    tipLamports,
    reasoning,
    congestionScore: congestion.score,
    trendDirection: trend.direction,
    percentileUsed,
  };
};
