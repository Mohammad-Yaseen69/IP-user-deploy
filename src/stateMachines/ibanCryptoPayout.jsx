export const STEPS = {
    AMOUNT: "AMOUNT",
    RECIPIENT: "RECIPIENT",
    REVIEW: "REVIEW",
    OTP: "OTP",
    DONE: "DONE",
}

export const SIDEBAR_STEPS = [
    { stepName: STEPS.AMOUNT, stepLabel: "STEP 01", label: "Amount" },
    { stepName: STEPS.RECIPIENT, stepLabel: "STEP 02", label: "Recipient" },
    { stepName: STEPS.REVIEW, stepLabel: "STEP 03", label: "Review & Confirm" },
]

export const MIN_AMOUNT = 10

export const PAYOUT_ASSETS = ["USDT", "USDC"]

const ORDER = [STEPS.AMOUNT, STEPS.RECIPIENT, STEPS.REVIEW, STEPS.OTP, STEPS.DONE]

const transitions = {
    [STEPS.AMOUNT]: { next: () => STEPS.RECIPIENT, back: () => null },
    [STEPS.RECIPIENT]: { next: () => STEPS.REVIEW, back: () => STEPS.AMOUNT },
    [STEPS.REVIEW]: { next: () => STEPS.OTP, back: () => STEPS.RECIPIENT },
    [STEPS.OTP]: { next: () => STEPS.DONE, back: () => STEPS.REVIEW },
    [STEPS.DONE]: { next: () => null, back: () => null },
}

export const goNext = (stepName) => ({ nextStep: transitions[stepName]?.next() ?? null })

export const goBack = (stepName) => ({ prevStep: transitions[stepName]?.back() ?? null })

const getAmountNumber = (amount) => {
    const value = Number(String(amount ?? "").replace(/[^\d.-]/g, ""))
    return Number.isFinite(value) ? value : 0
}

export const getDisabledState = (stepName, data) => {
    const amount = getAmountNumber(data.amount)
    const availableBalance = getAmountNumber(data.availableBalance)

    switch (stepName) {
        case STEPS.AMOUNT:
            return !data.amount || amount < MIN_AMOUNT || amount > availableBalance
        case STEPS.RECIPIENT:
            return !data.selectedBeneficiary || !data.address || !data.protocol || data.isAddressInvalid
        case STEPS.REVIEW:
            return !data.feeDetails?.token || data.quoteExpired || !data.confirmedNetwork
        default:
            return false
    }
}

export const getContinueLabel = (stepName, t) => {
    switch (stepName) {
        case STEPS.RECIPIENT:
            return t("Get Fee Quote")
        case STEPS.REVIEW:
            return t("Confirm & Send")
        default:
            return t("Next")
    }
}

export const isSidebarStepActive = (sidebarItem, currentStep) =>
    sidebarItem.stepName === currentStep || (sidebarItem.stepName === STEPS.REVIEW && currentStep === STEPS.OTP)

export const isSidebarStepCompleted = (sidebarItem, currentStep) => {
    const currentRank = ORDER.indexOf(currentStep)
    const itemRank = ORDER.indexOf(sidebarItem.stepName)
    return itemRank >= 0 && itemRank < currentRank
}
