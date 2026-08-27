import { getAmountNumber } from "../Components/VirtualIBAN/utils/amount"
import { isValidBic, isValidDescription, validateSwiftBeneficiary } from "../Components/VirtualIBAN/utils/swiftValidation"

export const MIN_AMOUNT = 5
export const MAX_AMOUNT = 1_500_000

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
    { stepName: SIDEBAR_STEP_NAMES.PURPOSE, stepLabel: "STEP 04", label: "Purpose & charges" },
    { stepName: SIDEBAR_STEP_NAMES.REVIEW, stepLabel: "STEP 05", label: "Review & confirm" },
    { stepName: SIDEBAR_STEP_NAMES.DONE, stepLabel: "STEP 06", label: "Done", alsoActiveFor: [STEPS.OTP] },
]

export const PURPOSE_OPTIONS = [
    "Goods purchased - trade",
    "Services rendered",
    "Salary or payroll",
    "Supplier payment",
    "Invoice settlement",
    "Refund",
]

export const CHARGE_BEARER_OPTIONS = [
    {
        id: "SHA",
        label: "Shared (SHA)",
        description: "You pay outgoing fees; recipient pays any local bank charges.",
    },
    {
        id: "OUR",
        label: "Sender pays all (OUR)",
        description: "You cover all correspondent-bank fees. Recipient gets the full amount.",
    },
    {
        id: "BEN",
        label: "Recipient pays all (BEN)",
        description: "All fees deducted from the recipient's end. You send the gross amount.",
    },
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
            return !data.amount || amount <= 0 || amount < MIN_AMOUNT || amount > MAX_AMOUNT || amount > availableBalance
        case STEPS.BENEFICIARY: {
            if (!data.selectedBeneficiary) return true
            const { isValid } = validateSwiftBeneficiary(data.selectedBeneficiary)
            return !isValid
        }
        case STEPS.ADD_BENEFICIARY: {
            if (beneficiaryForm.type === "business" && !hasValue(beneficiaryForm.legalName)) return true
            if (beneficiaryForm.type !== "business" && (!hasValue(beneficiaryForm.firstName) || !hasValue(beneficiaryForm.lastName))) return true
            if (!isValidBic(beneficiaryForm.swift_code)) return true
            if (!hasValue(beneficiaryForm.bankName)) return true
            if (!hasValue(beneficiaryForm.bankAddress)) return true
            if (!hasValue(beneficiaryForm.bankCity)) return true
            if (!hasValue(beneficiaryForm.bankPostal)) return true
            if (!hasValue(beneficiaryForm.beneficiaryAddress)) return true
            if (!hasValue(beneficiaryForm.beneficiaryCity)) return true
            if (!hasValue(beneficiaryForm.beneficiaryPostal)) return true
            return false
        }
        case STEPS.PURPOSE: {
            return !hasValue(data.purpose) || !isValidDescription(data.description)
        }
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
