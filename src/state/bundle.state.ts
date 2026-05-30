export type BundleStatus =
  | "pending"
  | "submitted"
  | "processed"
  | "confirmed"
  | "finalized"
  | "failed";

export interface BundleRecord {
  id: string;
  signature: string;
  status: BundleStatus;
  submittedAt: number;
  submittedSlot: number;
  processedAt?: number;
  processedSlot?: number;
  confirmedAt?: number;
  confirmedSlot?: number;
  finalizedAt?: number;
  finalizedSlot?: number;
  tipLamports: number;
  failureReason?: string;
  retryCount: number;
}

export class BundleState {
  private static bundles: Map<string, BundleRecord> = new Map();

  static addBundle(bundle: BundleRecord): void {
    this.bundles.set(bundle.id, bundle);
  }

  static updateBundle(id: string, update: Partial<BundleRecord>): void {
    const existing = this.bundles.get(id);
    if (existing) {
      this.bundles.set(id, { ...existing, ...update });
    }
  }

  static getBundle(id: string): BundleRecord | undefined {
    return this.bundles.get(id);
  }

  static getAllBundles(): BundleRecord[] {
    return Array.from(this.bundles.values());
  }

  static getActiveBundles(): BundleRecord[] {
    return this.getAllBundles().filter(
      (b) => b.status !== "failed" && b.status !== "finalized"
    );
  }

  static getFailedBundles(): BundleRecord[] {
    return this.getAllBundles().filter((b) => b.status === "failed");
  }

  static removeBundle(id: string): void {
    this.bundles.delete(id);
  }

  static reset(): void {
    this.bundles.clear();
  }
}
