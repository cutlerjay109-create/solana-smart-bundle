import { TipAccountData, getLatestTipData } from "./tip.fetcher";
import { NetworkState } from "../state/network.state";
import { config } from "../config";

export interface TipCalculation {
  tipLamports: number;
  percentileUsed: string;
  congestionScore: number;
  reasoning: string;
}

export const calculateDynamicTip = async (): Promise<TipCalculation> => {
  const tipData = await getLatestTipData();
  const congestionScore = NetworkState.getCongestionScore();
  const health = NetworkState.getHealth();

  let tipLamports: number;
  let percentileUsed: string;
  let reasoning: string;

  if (congestionScore > 80 || health === "congested") {
    tipLamports = Math.floor(tipData.landed_tips_95th_percentile);
    percentileUsed = "95th";
    reasoning = "High congestion detected, using 95th percentile tip";
  } else if (congestionScore > 50 || health === "degraded") {
    tipLamports = Math.floor(tipData.landed_tips_75th_percentile);
    percentileUsed = "75th";
    reasoning = "Moderate congestion detected, using 75th percentile tip";
  } else {
    tipLamports = Math.floor(tipData.landed_tips_50th_percentile);
    percentileUsed = "50th";
    reasoning = "Normal conditions, using 50th percentile tip";
  }

  tipLamports = Math.max(
    config.tip.minLamports,
    Math.min(config.tip.maxLamports, tipLamports)
  );

  return {
    tipLamports,
    percentileUsed,
    congestionScore,
    reasoning,
  };
};

export const calculateTipFromData = (
  tipData: TipAccountData,
  congestionScore: number
): number => {
  let tip: number;

  if (congestionScore > 80) {
    tip = tipData.landed_tips_95th_percentile;
  } else if (congestionScore > 50) {
    tip = tipData.landed_tips_75th_percentile;
  } else {
    tip = tipData.landed_tips_50th_percentile;
  }

  return Math.max(
    config.tip.minLamports,
    Math.min(config.tip.maxLamports, Math.floor(tip))
  );
};
