import { config } from "../config";
import { RetryState } from "../state/retry.state";

export interface RetryLimitResult {
  canRetry: boolean;
  attempts: number;
  reason?: string;
}

export const checkRetryLimit = (bundleId: string): RetryLimitResult => {
  const maxRetries = config.retry.maxRetries;
  const attempts = RetryState.getAttempts(bundleId);

  if (attempts >= maxRetries) {
    return {
      canRetry: false,
      attempts,
      reason: `Max retries (${maxRetries}) reached`,
    };
  }

  if (!RetryState.isReadyForRetry(bundleId)) {
    const retry = RetryState.getRetry(bundleId);
    const waitMs = retry ? retry.nextRetryAt - Date.now() : 0;
    return {
      canRetry: false,
      attempts,
      reason: `Not ready for retry, wait ${waitMs}ms`,
    };
  }

  return {
    canRetry: true,
    attempts,
  };
};

export const incrementRetry = (
  bundleId: string,
  failureReason: string
): void => {
  RetryState.addRetry(bundleId, failureReason);
};
