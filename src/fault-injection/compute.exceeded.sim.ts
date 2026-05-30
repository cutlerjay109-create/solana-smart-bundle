let computeExceededEnabled = false;

export const enableComputeExceededSim = (): void => {
  computeExceededEnabled = true;
  console.log("🔴 FAULT INJECTION: Compute exceeded simulation enabled");
};

export const disableComputeExceededSim = (): void => {
  computeExceededEnabled = false;
  console.log("✅ FAULT INJECTION: Compute exceeded simulation disabled");
};

export const isComputeExceededSimEnabled = (): boolean => computeExceededEnabled;

export const simulateComputeExceededError = (): Error => {
  return new Error(
    "Transaction exceeded compute budget: ComputationalBudgetExceeded 0x3"
  );
};
