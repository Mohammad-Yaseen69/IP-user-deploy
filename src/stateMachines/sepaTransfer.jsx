import { getAmountNumber } from "../Components/VirtualIBAN/utils/amount"

export const STEPS = {
    AMOUNT: "AMOUNT",
    BENEFICIARY: "BENEFICIARY",
    ADD_BENEFICIARY: "ADD_BENEFICIARY",
    PURPOSE: "PURPOSE",
    REVIEW: "REVIEW",
    OTP: "OTP",
    DONE: "DONE",
}

export const SIDEBAR_STEP_NAMES = {
    PAYMENT_RAIL: "PAYMENT_RAIL",
    AMOUNT: STEPS.AMOUNT,
    BENEFICIARY: STEPS.BENEFICIARY,
    PURPOSE: STEPS.PURPOSE,
    REVIEW: STEPS.REVIEW,
    DONE: STEPS.DONE,
}

export const SIDEBAR_STEPS = [
    { stepName: SIDEBAR_STEP_NAMES.PAYMENT_RAIL, stepLabel: "STEP 01", label: "Payment Rail" },
    { stepName: SIDEBAR_STEP_NAMES.AMOUNT, stepLabel: "STEP 02", label: "Amount" },
    {
        stepName: SIDEBAR_STEP_NAMES.BENEFICIARY,
        stepLabel: "STEP 03",
        label: "Recipient details",
        alsoActiveFor: [STEPS.ADD_BENEFICIARY],
    },
    { stepName: SIDEBAR_STEP_NAMES.PURPOSE, stepLabel: "STEP 04", label: "Purpose & details" },
    { stepName: SIDEBAR_STEP_NAMES.REVIEW, stepLabel: "STEP 05", label: "Review & confirm" },
    { stepName: SIDEBAR_STEP_NAMES.DONE, stepLabel: "STEP 06", label: "Done", alsoActiveFor: [STEPS.OTP] },
]

export const SEPA_TRANSFER_SPEEDS = [
    {
        id: "standard",
        rail: "SEPA_CT",
        label: "Standard",
        description: "SEPA Credit Transfer. Settles within 1-2 business days.",
        feeLabel: "0.4% fee",
        feeAmount: 0.004,
        default: true,
    },
    {
        id: "instant",
        rail: "SEPA_INST",
        label: "Instant",
        description: "Real-time SEPA. Arrives in seconds, 24/7 - including weekends.",
        feeLabel: "0.4% + 0.2 EUR fee",
        feeAmount: 0.2,
    },
]

export const PURPOSE_OPTIONS = [
    "Goods purchased - trade",
    "Services rendered",
    "Salary or payroll",
    "Supplier payment",
    "Refund",
]

export const getPurposeCode = (label) =>
    String(label || "")
        .toUpperCase()
        .replace(/[^A-Z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "")

export const transitions = {
    [STEPS.AMOUNT]: {
        next: () => STEPS.BENEFICIARY,
        back: () => null,
    },
    [STEPS.BENEFICIARY]: {
        next: () => STEPS.PURPOSE,
        back: () => STEPS.AMOUNT,
    },
    [STEPS.ADD_BENEFICIARY]: {
        next: () => STEPS.PURPOSE,
        back: () => STEPS.BENEFICIARY,
    },
    [STEPS.PURPOSE]: {
        next: () => STEPS.REVIEW,
        back: (data) => (data?.isAddingBeneficiary ? STEPS.ADD_BENEFICIARY : STEPS.BENEFICIARY),
    },
    [STEPS.REVIEW]: {
        next: () => STEPS.OTP,
        back: () => STEPS.PURPOSE,
    },
    [STEPS.OTP]: {
        next: () => STEPS.DONE,
        back: () => STEPS.REVIEW,
    },
    [STEPS.DONE]: {
        next: () => null,
        back: () => null,
    },
}

export const goNext = (stepName, data) => {
    const transition = transitions[stepName]
    if (!transition) return { nextStep: null }
    return { nextStep: transition.next(data) }
}

export const goBack = (stepName, data) => {
    const transition = transitions[stepName]
    if (!transition) return { prevStep: null }
    return { prevStep: transition.back(data) }
}

const hasValue = (value) => String(value ?? "").trim().length > 0

export const getDisabledState = (stepName, data = {}) => {
    const amount = getAmountNumber(data.amount)
    const availableBalance = getAmountNumber(data.availableBalance)
    const beneficiaryForm = data.beneficiaryForm || {}

    switch (stepName) {
        case STEPS.AMOUNT:
            return !data.amount || amount <= 0 || amount > availableBalance || !data.transferSpeed
        case STEPS.BENEFICIARY:
            return !data.selectedBeneficiary
        case STEPS.ADD_BENEFICIARY:
            if (beneficiaryForm.type === "business" && !hasValue(beneficiaryForm.legalName)) return true
            if (beneficiaryForm.type !== "business" && (!hasValue(beneficiaryForm.firstName) || !hasValue(beneficiaryForm.lastName))) return true
            return !hasValue(beneficiaryForm.iban) || !hasValue(beneficiaryForm.reference)
        case STEPS.PURPOSE:
            return !hasValue(data.purpose)
        case STEPS.REVIEW:
            return !data.confirmedDetails
        case STEPS.OTP:
        case STEPS.DONE:
            return false
        default:
            return false
    }
}

export const getContinueLabel = (stepName, t) => {
    switch (stepName) {
        case STEPS.REVIEW:
            return t("Confirm & Send")
        case STEPS.DONE:
            return t("Send again")
        default:
            return t("Next")
    }
}

export const getSidebarStepName = (currentStep) => {
    if (currentStep === STEPS.ADD_BENEFICIARY) return SIDEBAR_STEP_NAMES.BENEFICIARY
    if (currentStep === STEPS.OTP) return SIDEBAR_STEP_NAMES.DONE
    return currentStep
}

export const isSidebarStepActive = (sidebarItem, currentStep) => {
    if (sidebarItem.alsoActiveFor?.includes(currentStep)) return true
    return sidebarItem.stepName === getSidebarStepName(currentStep)
}

export const isSidebarStepCompleted = (sidebarItem, currentStep) => {
    const order = SIDEBAR_STEPS.map((item) => item.stepName)
    const currentSidebarStep = getSidebarStepName(currentStep)
    const currentRank = order.indexOf(currentSidebarStep)
    const itemRank = order.indexOf(sidebarItem.stepName)

    if (sidebarItem.stepName === SIDEBAR_STEP_NAMES.PAYMENT_RAIL) {
        return currentStep !== SIDEBAR_STEP_NAMES.PAYMENT_RAIL
    }

    return itemRank >= 0 && currentRank >= 0 && itemRank < currentRank
}
