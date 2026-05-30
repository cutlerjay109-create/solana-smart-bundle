import { RetryState } from "../../src/state/retry.state";
import { checkRetryLimit, incrementRetry } from "../../src/retry/limit.handler";

describe("RetryFlow", () => {
  beforeEach(() => {
    RetryState.reset();
  });

  test("should track retry attempts correctly", () => {
    expect(RetryState.getAttempts("bundle-1")).toBe(0);
    incrementRetry("bundle-1", "failure 1");
    expect(RetryState.getAttempts("bundle-1")).toBe(1);
    incrementRetry("bundle-1", "failure 2");
    expect(RetryState.getAttempts("bundle-1")).toBe(2);
  });

  test("should stop retrying after max attempts", () => {
    incrementRetry("bundle-1", "failure");
    incrementRetry("bundle-1", "failure");
    incrementRetry("bundle-1", "failure");
    const result = checkRetryLimit("bundle-1");
    expect(result.canRetry).toBe(false);
    expect(result.reason).toContain("Max retries");
  });
});
