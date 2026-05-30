import { TipAccountData } from "../jito/tip.fetcher";

export interface TipTrend {
  direction: "rising" | "falling" | "stable";
  changePercent: number;
  avgTip50th: number;
  minTip50th: number;
  maxTip50th: number;
  recommendation: string;
}

export const analyzeTipTrend = (history: TipAccountData[]): TipTrend => {
  if (history.length < 2) {
    return {
      direction: "stable",
      changePercent: 0,
      avgTip50th: history[0]?.landed_tips_50th_percentile || 5000,
      minTip50th: history[0]?.landed_tips_50th_percentile || 5000,
      maxTip50th: history[0]?.landed_tips_50th_percentile || 5000,
      recommendation: "Insufficient data, use default tip",
    };
  }

  const tips = history.map((h) => h.landed_tips_50th_percentile);
  const avgTip50th = tips.reduce((a, b) => a + b, 0) / tips.length;
  const minTip50th = Math.min(...tips);
  const maxTip50th = Math.max(...tips);

  const recent = tips.slice(-3);
  const older = tips.slice(0, -3);
  const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
  const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;

  const changePercent = ((recentAvg - olderAvg) / olderAvg) * 100;

  let direction: "rising" | "falling" | "stable";
  let recommendation: string;

  if (changePercent > 10) {
    direction = "rising";
    recommendation = "Tips are rising, use 75th percentile to ensure landing";
  } else if (changePercent < -10) {
    direction = "falling";
    recommendation = "Tips are falling, 50th percentile should be sufficient";
  } else {
    direction = "stable";
    recommendation = "Tips are stable, use 50th percentile";
  }

  return {
    direction,
    changePercent,
    avgTip50th,
    minTip50th,
    maxTip50th,
    recommendation,
  };
};
