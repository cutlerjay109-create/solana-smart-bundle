let slotSkipEnabled = false;

export const enableSlotSkipSim = (): void => {
  slotSkipEnabled = true;
  console.log("🔴 FAULT INJECTION: Slot skip simulation enabled");
};

export const disableSlotSkipSim = (): void => {
  slotSkipEnabled = false;
  console.log("✅ FAULT INJECTION: Slot skip simulation disabled");
};

export const isSlotSkipSimEnabled = (): boolean => slotSkipEnabled;

export const simulateSlotSkipError = (): Error => {
  return new Error(
    "Bundle dropped: Jito leader skipped their slot, bundle not included"
  );
};
