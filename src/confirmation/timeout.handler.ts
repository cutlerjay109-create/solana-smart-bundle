export interface TimeoutConfig {
  timeoutMs: number;
  onTimeout: () => void;
}

export class TimeoutHandler {
  private timer: NodeJS.Timeout | null = null;
  private startTime: number = 0;

  start(config: TimeoutConfig): void {
    this.startTime = Date.now();
    this.timer = setTimeout(() => {
      config.onTimeout();
    }, config.timeoutMs);
  }

  clear(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  getElapsedMs(): number {
    return Date.now() - this.startTime;
  }

  isExpired(timeoutMs: number): boolean {
    return this.getElapsedMs() >= timeoutMs;
  }
}

export const withTimeout = async <T>(
  promise: Promise<T>,
  timeoutMs: number,
  errorMessage: string = "Operation timed out"
): Promise<T> => {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error(errorMessage)), timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]);
};
