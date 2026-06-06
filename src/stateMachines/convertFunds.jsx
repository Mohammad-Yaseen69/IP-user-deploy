
export const STEPS = {
    AMOUNT: "AMOUNT",
    WALLET: "WALLET",
    REVIEW: "REVIEW",
    DONE: "DONE",
}

export const SIDEBAR_STEPS = [
    { stepName: STEPS.AMOUNT, stepLabel: "STEP 01", label: "Amount" },
    { stepName: STEPS.WALLET, stepLabel: "STEP 02", label: "Select wallets" },
    { stepName: STEPS.REVIEW, stepLabel: "STEP 03", label: "Review & Confirm" },
    { stepName: STEPS.DONE, stepLabel: "STEP 04", label: "Done" },
]

export const transitions = {
    [STEPS.AMOUNT]: {
        next: () => STEPS.WALLET,
        back: () => null,
    },
    [STEPS.WALLET]: {
        next: () => STEPS.REVIEW,
        back: () => STEPS.AMOUNT,
    },
    [STEPS.REVIEW]: {
        next: () => STEPS.DONE,
        back: () => STEPS.WALLET,
    },
    [STEPS.DONE]: {
        next: () => null,
        back: () => null,
    },
}

export const goNext = (stepName, data) => {
    const t = transitions[stepName]
    if (!t) return { nextStep: null }
    return { nextStep: t.next(data) }
}

export const goBack = (stepName, data) => {
    const t = transitions[stepName]
    if (!t) return { prevStep: null }
    return { prevStep: t.back(data) }
}

export const getDisabledState = (stepName, data) => {
    switch (stepName) {
        case STEPS.AMOUNT:
            return !data.amount || parseFloat(data.amount) <= 0
        case STEPS.WALLET:
            return !data.fromWallet || !data.toWallet || data.fromWallet === data.toWallet
        case STEPS.REVIEW:
        case STEPS.DONE:
            return false
        default:
            return false
    }
}

export const getContinueLabel = (stepName, t) => {
    switch (stepName) {
        case STEPS.REVIEW:
            return t("Convert")
        default:
            return t("Next")
    }
}

export const isSidebarStepActive = (sidebarItem, currentStep) => {
    return sidebarItem.stepName === currentStep
}

export const isSidebarStepCompleted = (sidebarItem, currentStep) => {
    const order = [STEPS.AMOUNT, STEPS.WALLET, STEPS.REVIEW, STEPS.DONE]
    const currentRank = order.indexOf(currentStep)
    const itemRank = order.indexOf(sidebarItem.stepName)
    return itemRank >= 0 && itemRank < currentRank
}

// Mock exchange rates
export const EXCHANGE_RATES = {
    "EUR-USD": { rate: 1.0847, inverse: 0.9219 },
    "EUR-GBP": { rate: 0.8612, inverse: 1.1611 },
    "EUR-INR": { rate: 90.42, inverse: 0.01106 },
    "USD-EUR": { rate: 0.9219, inverse: 1.0847 },
    "USD-GBP": { rate: 0.7940, inverse: 1.2594 },
    "USD-INR": { rate: 83.37, inverse: 0.01200 },
    "GBP-EUR": { rate: 1.1611, inverse: 0.8612 },
    "GBP-USD": { rate: 1.2594, inverse: 0.7940 },
    "GBP-INR": { rate: 105.01, inverse: 0.00952 },
    "INR-EUR": { rate: 0.01106, inverse: 90.42 },
    "INR-USD": { rate: 0.01200, inverse: 83.37 },
    "INR-GBP": { rate: 0.00952, inverse: 105.01 },
}

export const getExchangeRate = (from, to) => {
    const key = `${from}-${to}`
    return EXCHANGE_RATES[key] || { rate: 1, inverse: 1 }
}
