export interface FeeTooLowSimConfig {
  artificiallyLowTip: number;
}

let feeTooLowEnabled = false;
let lowTipAmount = 1;

export const enableFeeTooLowSim = (tipAmount: number = 1): void => {
  feeTooLowEnabled = true;
  lowTipAmount = tipAmount;
  console.log(
    `🔴 FAULT INJECTION: Fee too low simulation enabled with tip: ${tipAmount} lamports`
  );
};

export const disableFeeTooLowSim = (): void => {
  feeTooLowEnabled = false;
  console.log("✅ FAULT INJECTION: Fee too low simulation disabled");
};

export const isFeeTooLowSimEnabled = (): boolean => feeTooLowEnabled;

export const getSimulatedLowTip = (): number => lowTipAmount;

export const simulateFeeTooLowError = (): Error => {
  return new Error(
    "Transaction fee too low: prioritization fee below minimum threshold"
  );
};
