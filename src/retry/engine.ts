import { FailureRecord, FailureType } from "../failure/types";
import { checkRetryLimit, incrementRetry } from "./limit.handler";
import { sleepWithBackoff } from "./backoff";
import { refreshBlockhash } from "../blockhash/refresher";
import { calculateDynamicTip } from "../jito/tip.calculator";
import { LifecycleTracker } from "../lifecycle/tracker";
import { LifecycleStage } from "../lifecycle/stages";
import { RetryState } from "../state/retry.state";

export interface RetryContext {
  bundleId: string;
  signature: string;
  failureRecord: FailureRecord;
  onRetry: (context: RetryContext) => Promise<void>;
}

export interface RetryResult {
  attempted: boolean;
  success: boolean;
  attempts: number;
  reason?: string;
}

export const executeRetry = async (
  context: RetryContext
): Promise<RetryResult> => {
  const { bundleId, failureRecord } = context;

  const limitCheck = checkRetryLimit(bundleId);

  if (!limitCheck.canRetry) {
    console.log(`Cannot retry bundle ${bundleId}: ${limitCheck.reason}`);
    LifecycleTracker.markFailed(bundleId, limitCheck.reason || "Max retries reached");
    return {
      attempted: false,
      success: false,
      attempts: limitCheck.attempts,
      reason: limitCheck.reason,
    };
  }

  incrementRetry(bundleId, failureRecord.reason);
  const attempts = RetryState.getAttempts(bundleId);

  console.log(`Retrying bundle ${bundleId}, attempt ${attempts}`);
  await sleepWithBackoff(attempts - 1);

  if (failureRecord.failureType === FailureType.EXPIRED_BLOCKHASH) {
    console.log("Refreshing blockhash for retry...");
    await refreshBlockhash();
  }

  if (
    failureRecord.failureType === FailureType.FEE_TOO_LOW ||
    failureRecord.failureType === FailureType.BUNDLE_FAILURE
  ) {
    console.log("Recalculating tip for retry...");
    const tipCalc = await calculateDynamicTip();
    console.log(`New tip: ${tipCalc.tipLamports} lamports - ${tipCalc.reasoning}`);
  }

  try {
    await context.onRetry(context);
    return {
      attempted: true,
      success: true,
      attempts,
    };
  } catch (error) {
    return {
      attempted: true,
      success: false,
      attempts,
      reason: (error as Error).message,
    };
  }
};
