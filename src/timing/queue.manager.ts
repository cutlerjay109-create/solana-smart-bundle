import { scoreSubmissionConditions } from "./condition.scorer";
import { analyzeLeaderWindow } from "./leader.analyzer";
import { sleep } from "../retry/backoff";

export interface QueuedSubmission {
  id: string;
  payload: any;
  queuedAt: number;
  attempts: number;
}

export class QueueManager {
  private static queue: QueuedSubmission[] = [];
  private static isProcessing: boolean = false;

  static enqueue(id: string, payload: any): void {
    this.queue.push({
      id,
      payload,
      queuedAt: Date.now(),
      attempts: 0,
    });
    console.log(`Queued submission ${id}, queue length: ${this.queue.length}`);
  }

  static dequeue(): QueuedSubmission | undefined {
    return this.queue.shift();
  }

  static getQueueLength(): number {
    return this.queue.length;
  }

  static async waitForFavorableConditions(
    maxWaitMs: number = 30000
  ): Promise<boolean> {
    const startTime = Date.now();

    while (Date.now() - startTime < maxWaitMs) {
      const conditions = scoreSubmissionConditions();
      const leaderWindow = await analyzeLeaderWindow();

      if (conditions.isFavorable && leaderWindow.isGoodWindow) {
        console.log("Favorable conditions detected, proceeding with submission");
        return true;
      }

      console.log(
        `Waiting for favorable conditions... Score: ${conditions.score}, Leader: ${leaderWindow.recommendation}`
      );
      await sleep(2000);
    }

    console.warn("Max wait time reached, proceeding anyway");
    return false;
  }

  static isQueueEmpty(): boolean {
    return this.queue.length === 0;
  }

  static clearQueue(): void {
    this.queue = [];
  }
}
