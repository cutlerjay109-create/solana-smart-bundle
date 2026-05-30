export class SlotState {
  private static currentSlot: number = 0;
  private static slotHistory: number[] = [];
  private static lastUpdated: number = 0;

  static updateCurrentSlot(slot: number): void {
    this.currentSlot = slot;
    this.lastUpdated = Date.now();
    this.slotHistory.push(slot);
    if (this.slotHistory.length > 100) {
      this.slotHistory.shift();
    }
  }

  static getCurrentSlot(): number {
    return this.currentSlot;
  }

  static getSlotHistory(): number[] {
    return this.slotHistory;
  }

  static getLastUpdated(): number {
    return this.lastUpdated;
  }

  static getSlotAge(): number {
    return Date.now() - this.lastUpdated;
  }

  static isStale(maxAgeMs: number = 5000): boolean {
    return this.getSlotAge() > maxAgeMs;
  }

  static reset(): void {
    this.currentSlot = 0;
    this.slotHistory = [];
    this.lastUpdated = 0;
  }
}
