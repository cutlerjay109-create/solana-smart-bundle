import { buildFailureReasoningPrompt } from "../../src/ai/prompts/failure.reasoning";
import { buildTipIntelligencePrompt } from "../../src/ai/prompts/tip.intelligence";
import { parseFailureDecision } from "../../src/ai/decisions/failure.decision";
import { parseTipDecision } from "../../src/ai/decisions/tip.decision";

describe("AIAgent", () => {
  test("should build failure reasoning prompt", () => {
    const prompt = buildFailureReasoningPrompt({
      bundleId: "bundle-1",
      failureType: "EXPIRED_BLOCKHASH",
      reason: "Blockhash expired",
    });
    expect(prompt).toContain("EXPIRED_BLOCKHASH");
    expect(prompt).toContain("JSON");
  });

  test("should build tip intelligence prompt", () => {
    const prompt = buildTipIntelligencePrompt({
      congestionScore: 50,
      trendDirection: "rising",
    });
    expect(prompt).toContain("tip");
    expect(prompt).toContain("JSON");
  });

  test("should parse failure decision", () => {
    const raw = JSON.stringify({
      failureAnalysis: {
        rootCause: "Blockhash expired",
        severity: "high",
        isRetryable: true,
      },
      retryDecision: {
        shouldRetry: true,
        reasoning: "Refresh blockhash and retry",
        changes: {
          refreshBlockhash: true,
          newTipLamports: 10000,
          waitSlots: 2,
          adjustComputeBudget: false,
        },
      },
      confidenceScore: 90,
    });
    const decision = parseFailureDecision(raw);
    expect(decision.retryDecision.shouldRetry).toBe(true);
    expect(decision.retryDecision.changes.refreshBlockhash).toBe(true);
  });

  test("should parse tip decision", () => {
    const raw = JSON.stringify({
      tipAnalysis: {
        networkCondition: "healthy",
        trendDirection: "stable",
        reasoning: "Normal conditions",
      },
      tipDecision: {
        recommendedTipLamports: 5000,
        percentileUsed: "50th",
        reasoning: "Using 50th percentile",
        confidenceScore: 85,
      },
      riskAssessment: {
        landingProbability: 90,
        costEfficiency: "high",
      },
    });
    const decision = parseTipDecision(raw);
    expect(decision.tipDecision.recommendedTipLamports).toBe(5000);
  });
});
