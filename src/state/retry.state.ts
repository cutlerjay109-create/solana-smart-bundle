export interface RetryRecord {
  bundleId: string;
  attempts: number;
  lastAttemptAt: number;
  lastFailureReason: string;
  nextRetryAt: number;
}

export class RetryState {
  private static retries: Map<string, RetryRecord> = new Map();

  static addRetry(bundleId: string, failureReason: string): void {
    const existing = this.retries.get(bundleId);
    const attempts = existing ? existing.attempts + 1 : 1;
    const delay = Math.pow(2, attempts) * 1000;

    this.retries.set(bundleId, {
      bundleId,
      attempts,
      lastAttemptAt: Date.now(),
      lastFailureReason: failureReason,
      nextRetryAt: Date.now() + delay,
    });
  }

  static getRetry(bundleId: string): RetryRecord | undefined {
    return this.retries.get(bundleId);
  }

  static getAttempts(bundleId: string): number {
    return this.retries.get(bundleId)?.attempts || 0;
  }

  static canRetry(bundleId: string, maxRetries: number): boolean {
    const attempts = this.getAttempts(bundleId);
    return attempts < maxRetries;
  }

  static isReadyForRetry(bundleId: string): boolean {
    const retry = this.retries.get(bundleId);
    if (!retry) return true;
    return Date.now() >= retry.nextRetryAt;
  }

  static removeRetry(bundleId: string): void {
    this.retries.delete(bundleId);
  }

  static reset(): void {
    this.retries.clear();
  }
}
