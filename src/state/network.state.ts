export type NetworkHealth = "healthy" | "degraded" | "congested" | "unknown";

export interface NetworkMetrics {
  avgConfirmationMs: number;
  avgSlotTimeMs: number;
  congestionScore: number;
  health: NetworkHealth;
  lastUpdated: number;
}

export class NetworkState {
  private static metrics: NetworkMetrics = {
    avgConfirmationMs: 0,
    avgSlotTimeMs: 400,
    congestionScore: 0,
    health: "unknown",
    lastUpdated: 0,
  };

  private static confirmationTimes: number[] = [];

  static updateConfirmationTime(ms: number): void {
    this.confirmationTimes.push(ms);
    if (this.confirmationTimes.length > 50) {
      this.confirmationTimes.shift();
    }
    this.metrics.avgConfirmationMs =
      this.confirmationTimes.reduce((a, b) => a + b, 0) /
      this.confirmationTimes.length;
    this.updateHealth();
    this.metrics.lastUpdated = Date.now();
  }

  static updateCongestionScore(score: number): void {
    this.metrics.congestionScore = score;
    this.updateHealth();
    this.metrics.lastUpdated = Date.now();
  }

  private static updateHealth(): void {
    const { avgConfirmationMs, congestionScore } = this.metrics;
    if (congestionScore > 80 || avgConfirmationMs > 10000) {
      this.metrics.health = "congested";
    } else if (congestionScore > 50 || avgConfirmationMs > 5000) {
      this.metrics.health = "degraded";
    } else {
      this.metrics.health = "healthy";
    }
  }

  static getMetrics(): NetworkMetrics {
    return this.metrics;
  }

  static getHealth(): NetworkHealth {
    return this.metrics.health;
  }

  static getCongestionScore(): number {
    return this.metrics.congestionScore;
  }

  static reset(): void {
    this.confirmationTimes = [];
    this.metrics = {
      avgConfirmationMs: 0,
      avgSlotTimeMs: 400,
      congestionScore: 0,
      health: "unknown",
      lastUpdated: 0,
    };
  }
}
