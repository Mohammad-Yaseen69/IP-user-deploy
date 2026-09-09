export const STEPS = {
    ACCOUNT_TYPE: "ACCOUNT_TYPE",
    ASSET: "ASSET",
    ACTIVATION: "ACTIVATION",
}

// The step bar only covers the crypto part of the flow.
export const TOTAL_STEPS = 2

export const STEP_META = {
    [STEPS.ASSET]: { index: 1, name: "Asset" },
    [STEPS.ACTIVATION]: { index: 2, name: "Pricing" },
}
