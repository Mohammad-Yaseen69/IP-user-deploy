export const STEPS = {
  ACCOUNT_TYPE: "ACCOUNT_TYPE",
  ASSET: "ASSET",
  ACTIVATION: "ACTIVATION",
  INITIATED: "INITIATED",
};

// The step bar only covers the two steps the user actually fills in.
export const TOTAL_STEPS = 2;

export const STEP_META = {
  [STEPS.ASSET]: { index: 1, name: "Asset" },
  [STEPS.ACTIVATION]: { index: 2, name: "Pricing" },
};
