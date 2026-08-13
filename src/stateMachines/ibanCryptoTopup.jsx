export const STEPS = {
    AMOUNT: "AMOUNT",
    REVIEW: "REVIEW",
    DONE: "DONE",
}

export const SIDEBAR_STEPS = [
    { stepName: STEPS.AMOUNT, stepLabel: "STEP 01", label: "Enter Amount" },
    { stepName: STEPS.REVIEW, stepLabel: "STEP 02", label: "Review & Confirm" },
]

export const transitions = {
    [STEPS.AMOUNT]: {
        next: () => STEPS.REVIEW,
        back: () => null,
    },
    [STEPS.REVIEW]: {
        next: () => STEPS.DONE,
        back: () => STEPS.AMOUNT,
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

export const getAmountNumber = (amount) => {
    const value = Number(String(amount ?? "").replace(/[^\d.-]/g, ""))
    return Number.isFinite(value) ? value : 0
}

const MIN_CRYPTO_TOPUP_AMOUNT = 5
const MAX_CRYPTO_TOPUP_AMOUNT = 50000

export const getDisabledState = (stepName, data) => {
    const amount = getAmountNumber(data.amount)

    switch (stepName) {
        case STEPS.AMOUNT:
            return !data.amount || amount <= 0 || amount < MIN_CRYPTO_TOPUP_AMOUNT || amount > MAX_CRYPTO_TOPUP_AMOUNT
        case STEPS.REVIEW:
            return !data.feeDetails?.token
        case STEPS.DONE:
            return false
        default:
            return false
    }
}

export const getContinueLabel = (stepName, t) => {
    switch (stepName) {
        case STEPS.AMOUNT:
            return t("Get Fee Quote")
        case STEPS.REVIEW:
            return t("Confirm & Pay")
        case STEPS.DONE:
            return t("Done")
        default:
            return t("Next")
    }
}

export const isSidebarStepActive = (sidebarItem, currentStep) => {
    return sidebarItem.stepName === currentStep
}

export const isSidebarStepCompleted = (sidebarItem, currentStep) => {
    const order = [STEPS.AMOUNT, STEPS.REVIEW, STEPS.DONE]
    const currentRank = order.indexOf(currentStep)
    const itemRank = order.indexOf(sidebarItem.stepName)
    return itemRank >= 0 && itemRank < currentRank
}
