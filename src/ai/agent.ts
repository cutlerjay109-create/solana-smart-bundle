import axios from "axios";
import { aiConfig } from "../config/ai";
import { FailureRecord } from "../failure/types";
import { buildFailureReasoningPrompt } from "./prompts/failure.reasoning";
import { buildTipIntelligencePrompt } from "./prompts/tip.intelligence";
import { buildSubmissionTimingPrompt } from "./prompts/submission.timing";
import { buildRetryDecisionPrompt } from "./prompts/retry.decision";
import { parseFailureDecision, FailureDecision } from "./decisions/failure.decision";
import { parseTipDecision, TipDecision } from "./decisions/tip.decision";
import { parseTimingDecision, TimingDecision } from "./decisions/timing.decision";
import { parseRetryDecision, RetryDecision } from "./decisions/retry.decision";
import { logReasoning } from "./reasoning.logger";
import { getRecentTipHistory } from "../tip/history.fetcher";
import { analyzeTipTrend } from "../tip/trend.analyzer";
import { calculateCongestionScore } from "../tip/congestion.scorer";
import { analyzeLeaderWindow } from "../timing/leader.analyzer";
import { scoreSubmissionConditions } from "../timing/condition.scorer";
import { NetworkState } from "../state/network.state";
import { SlotState } from "../state/slot.state";

const callAI = async (prompt: string): Promise<string> => {
  const response = await axios.post(
    aiConfig.apiUrl,
    {
      model: aiConfig.model,
      messages: [
        { role: "system", content: aiConfig.systemPrompt },
        { role: "user", content: prompt },
      ],
      max_tokens: aiConfig.maxTokens,
      temperature: aiConfig.temperature,
    },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${aiConfig.apiKey}`,
      },
      timeout: 60000,
    }
  );

  return response.data.choices[0].message.content;
};

export const analyzeFailure = async (
  bundleId: string,
  failureRecord: FailureRecord
): Promise<FailureDecision> => {
  console.log(`AI Agent analyzing failure for bundle ${bundleId}...`);

  const input = {
    bundleId,
    failureType: failureRecord.failureType,
    reason: failureRecord.reason,
    slot: failureRecord.slot,
    timestamp: new Date(failureRecord.timestamp).toISOString(),
    networkHealth: NetworkState.getHealth(),
    currentSlot: SlotState.getCurrentSlot(),
  };

  const prompt = buildFailureReasoningPrompt(input);
  const rawResponse = await callAI(prompt);
  const decision = parseFailureDecision(rawResponse);

  logReasoning(
    bundleId,
    "FAILURE_REASONING",
    input,
    decision.retryDecision.reasoning,
    decision
  );

  console.log(`AI Decision: ${decision.retryDecision.shouldRetry ? "RETRY" : "ABORT"}`);
  console.log(`AI Reasoning: ${decision.retryDecision.reasoning}`);

  return decision;
};

export const decideTip = async (bundleId: string): Promise<TipDecision> => {
  console.log(`AI Agent deciding tip for bundle ${bundleId}...`);

  const history = await getRecentTipHistory(10);
  const trend = analyzeTipTrend(history);
  const congestion = calculateCongestionScore();
  const networkMetrics = NetworkState.getMetrics();

  const input = {
    bundleId,
    tipHistory: history.slice(-5),
    trend,
    congestion,
    networkMetrics,
    currentSlot: SlotState.getCurrentSlot(),
  };

  const prompt = buildTipIntelligencePrompt(input);
  const rawResponse = await callAI(prompt);
  const decision = parseTipDecision(rawResponse);

  logReasoning(
    bundleId,
    "TIP_INTELLIGENCE",
    input,
    decision.tipDecision.reasoning,
    decision
  );

  console.log(
    `AI Tip Decision: ${decision.tipDecision.recommendedTipLamports} lamports`
  );
  console.log(`AI Reasoning: ${decision.tipDecision.reasoning}`);

  return decision;
};

export const decideSubmissionTiming = async (
  bundleId: string
): Promise<TimingDecision> => {
  console.log(`AI Agent deciding submission timing for bundle ${bundleId}...`);

  const leaderWindow = await analyzeLeaderWindow();
  const conditions = scoreSubmissionConditions();
  const networkMetrics = NetworkState.getMetrics();

  const input = {
    bundleId,
    leaderWindow,
    conditions,
    networkMetrics,
    currentSlot: SlotState.getCurrentSlot(),
    slotAge: SlotState.getSlotAge(),
  };

  const prompt = buildSubmissionTimingPrompt(input);
  const rawResponse = await callAI(prompt);
  const decision = parseTimingDecision(rawResponse);

  logReasoning(
    bundleId,
    "SUBMISSION_TIMING",
    input,
    decision.submissionDecision.reasoning,
    decision
  );

  console.log(
    `AI Timing Decision: ${decision.submissionDecision.submitNow ? "SUBMIT NOW" : `WAIT ${decision.submissionDecision.waitSlots} slots`}`
  );
  console.log(`AI Reasoning: ${decision.submissionDecision.reasoning}`);

  return decision;
};

export const decideRetry = async (
  bundleId: string,
  failureRecord: FailureRecord,
  attemptNumber: number
): Promise<RetryDecision> => {
  console.log(`AI Agent deciding retry strategy for bundle ${bundleId}...`);

  const history = await getRecentTipHistory(5);
  const congestion = calculateCongestionScore();

  const input = {
    bundleId,
    attemptNumber,
    failureType: failureRecord.failureType,
    failureReason: failureRecord.reason,
    slot: failureRecord.slot,
    networkHealth: NetworkState.getHealth(),
    congestionScore: congestion.score,
    recentTips: history.slice(-3),
    currentSlot: SlotState.getCurrentSlot(),
  };

  const prompt = buildRetryDecisionPrompt(input);
  const rawResponse = await callAI(prompt);
  const decision = parseRetryDecision(rawResponse);

  logReasoning(
    bundleId,
    "RETRY_DECISION",
    input,
    decision.retryPlan.reasoning,
    decision
  );

  console.log(
    `AI Retry Decision: ${decision.retryPlan.shouldRetry ? "RETRY" : "ABORT"}`
  );
  console.log(`AI Reasoning: ${decision.retryPlan.reasoning}`);
  console.log(
    `Expected success probability: ${decision.expectedOutcome.successProbability}%`
  );

  return decision;
};
