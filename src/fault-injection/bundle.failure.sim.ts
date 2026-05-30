let bundleFailureEnabled = false;

export const enableBundleFailureSim = (): void => {
  bundleFailureEnabled = true;
  console.log("🔴 FAULT INJECTION: Bundle failure simulation enabled");
};

export const disableBundleFailureSim = (): void => {
  bundleFailureEnabled = false;
  console.log("✅ FAULT INJECTION: Bundle failure simulation disabled");
};

export const isBundleFailureSimEnabled = (): boolean => bundleFailureEnabled;

export const simulateBundleFailureError = (): Error => {
  return new Error(
    "Bundle failed: Jito block engine rejected bundle - tip too low"
  );
};
