import { calculateDynamicTip, calculateTipFromData } from "../../src/jito/tip.calculator";
import { NetworkState } from "../../src/state/network.state";

describe("TipCalculator", () => {
  beforeEach(() => {
    NetworkState.reset();
  });

  test("should return minimum tip when network is healthy", async () => {
    NetworkState.updateCongestionScore(10);
    const result = await calculateDynamicTip();
    expect(result.tipLamports).toBeGreaterThan(0);
    expect(result.percentileUsed).toBe("50th");
  });

  test("should return higher tip when network is congested", async () => {
    NetworkState.updateCongestionScore(85);
    const result = await calculateDynamicTip();
    expect(result.percentileUsed).toBe("95th");
  });

  test("should respect min and max tip bounds", async () => {
    const result = await calculateDynamicTip();
    expect(result.tipLamports).toBeGreaterThanOrEqual(1000);
    expect(result.tipLamports).toBeLessThanOrEqual(1000000);
  });

  test("should calculate tip from data correctly", () => {
    const tipData = {
      time: new Date().toISOString(),
      landed_tips_25th_percentile: 1000,
      landed_tips_50th_percentile: 5000,
      landed_tips_75th_percentile: 10000,
      landed_tips_95th_percentile: 50000,
      landed_tips_99th_percentile: 100000,
      ema_landed_tips_50th_percentile: 5000,
    };
    const tip = calculateTipFromData(tipData, 30);
    expect(tip).toBe(5000);
  });
});
