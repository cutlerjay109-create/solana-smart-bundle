import { BlockhashInfo } from "./fetcher";
import { SlotState } from "../state/slot.state";
import { config } from "../config";

export class BlockhashTracker {
  private static currentBlockhash: BlockhashInfo | null = null;
  private static expirySlots: number = config.timeouts.blockhashExpirySlots;

  static setBlockhash(info: BlockhashInfo): void {
    this.currentBlockhash = info;
  }

  static getBlockhash(): BlockhashInfo | null {
    return this.currentBlockhash;
  }

  static isExpired(): boolean {
    if (!this.currentBlockhash) return true;

    const currentSlot = SlotState.getCurrentSlot();
    const slotAge = currentSlot - this.currentBlockhash.fetchedSlot;

    return slotAge >= this.expirySlots;
  }

  static getSlotsUntilExpiry(): number {
    if (!this.currentBlockhash) return 0;

    const currentSlot = SlotState.getCurrentSlot();
    const slotAge = currentSlot - this.currentBlockhash.fetchedSlot;
    return Math.max(0, this.expirySlots - slotAge);
  }

  static isCloseToExpiry(threshold: number = 20): boolean {
    return this.getSlotsUntilExpiry() <= threshold;
  }

  static getAge(): number {
    if (!this.currentBlockhash) return Infinity;
    return Date.now() - this.currentBlockhash.fetchedAt;
  }

  static reset(): void {
    this.currentBlockhash = null;
  }
}
