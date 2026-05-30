export interface BackpressureConfig {
  highWaterMark: number;
  lowWaterMark: number;
  drainTimeoutMs: number;
}

const defaultConfig: BackpressureConfig = {
  highWaterMark: 100,
  lowWaterMark: 10,
  drainTimeoutMs: 5000,
};

export class BackpressureHandler {
  private queue: any[] = [];
  private processing: boolean = false;
  private config: BackpressureConfig;

  constructor(config: BackpressureConfig = defaultConfig) {
    this.config = config;
  }

  push(item: any): boolean {
    if (this.queue.length >= this.config.highWaterMark) {
      console.warn("Backpressure: queue is full, dropping item");
      return false;
    }
    this.queue.push(item);
    return true;
  }

  async drain(processor: (item: any) => Promise<void>): Promise<void> {
    if (this.processing) return;
    this.processing = true;

    while (this.queue.length > 0) {
      const item = this.queue.shift();
      try {
        await processor(item);
      } catch (error) {
        console.error("Error processing queue item:", error);
      }
    }

    this.processing = false;
  }

  getQueueLength(): number {
    return this.queue.length;
  }

  isUnderPressure(): boolean {
    return this.queue.length >= this.config.highWaterMark;
  }
}
