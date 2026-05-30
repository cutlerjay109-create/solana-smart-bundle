import { checkRetryLimit, incrementRetry } from "../../src/retry/limit.handler";
import { RetryState } from "../../src/state/retry.state";
import { calculateBackoff } from "../../src/retry/backoff";

describe("RetryEngine", () => {
  beforeEach(() => {
    RetryState.reset();
  });

  test("should allow retry when under limit", () => {
    const result = checkRetryLimit("bundle-1");
    expect(result.canRetry).toBe(true);
    expect(result.attempts).toBe(0);
  });

  test("should block retry when over limit", () => {
    incrementRetry("bundle-1", "failure");
    incrementRetry("bundle-1", "failure");
    incrementRetry("bundle-1", "failure");
    const result = checkRetryLimit("bundle-1");
    expect(result.canRetry).toBe(false);
  });

  test("should calculate exponential backoff", () => {
    const delay0 = calculateBackoff(0, { initialDelayMs: 1000, maxDelayMs: 30000, multiplier: 2, jitter: false });
    const delay1 = calculateBackoff(1, { initialDelayMs: 1000, maxDelayMs: 30000, multiplier: 2, jitter: false });
    const delay2 = calculateBackoff(2, { initialDelayMs: 1000, maxDelayMs: 30000, multiplier: 2, jitter: false });
    expect(delay0).toBe(1000);
    expect(delay1).toBe(2000);
    expect(delay2).toBe(4000);
  });

  test("should respect max delay", () => {
    const delay = calculateBackoff(10, { initialDelayMs: 1000, maxDelayMs: 30000, multiplier: 2, jitter: false });
    expect(delay).toBe(30000);
  });
});
