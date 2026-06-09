

export const STEPS = {
    AMOUNT: "AMOUNT",
    DESTINATION: "DESTINATION",
    SPEED: "SPEED",
    REVIEW: "REVIEW",
    DONE: "DONE",
}

export const SIDEBAR_STEPS = [
    { stepName: STEPS.AMOUNT, stepLabel: "STEP 01", label: "Amount" },
    {
        stepName: STEPS.DESTINATION,
        stepLabel: "STEP 02",
        label: "Destination",
        alsoActiveFor: [STEPS.SPEED],
    },
    { stepName: STEPS.REVIEW, stepLabel: "STEP 03", label: "Review & Confirm" },
    { stepName: STEPS.DONE, stepLabel: "STEP 04", label: "Done" },
]

export const transitions = {
    [STEPS.AMOUNT]: {
        next: () => STEPS.SPEED,
        back: () => null,
    },
    [STEPS.SPEED]: {
        next: () => STEPS.DESTINATION,
        back: () => STEPS.AMOUNT,
    },
    [STEPS.DESTINATION]: {
        next: () => STEPS.REVIEW,
        back: () => STEPS.SPEED,
    },
    [STEPS.REVIEW]: {
        next: () => STEPS.DONE,
        back: () => STEPS.SPEED,
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

const getAmountNumber = (amount) => {
    const value = Number(String(amount ?? "").replace(/[^\d.-]/g, ""))
    return Number.isFinite(value) ? value : 0
}

export const getDisabledState = (stepName, data) => {
    const amount = getAmountNumber(data.amount)
    const availableBalance = getAmountNumber(data.availableBalance ?? SOURCE_IBAN.balance)

    switch (stepName) {
        case STEPS.AMOUNT:
            return !data.amount || amount <= 0 || amount > availableBalance
        case STEPS.DESTINATION:
            return !data.selectedBank
        case STEPS.SPEED:
            return !data.transferSpeed
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
            return t("Authenticate and confirm")
        default:
            return t("Next")
    }
}

export const isSidebarStepActive = (sidebarItem, currentStep) => {
    if (sidebarItem.alsoActiveFor?.includes(currentStep)) return true
    return sidebarItem.stepName === currentStep
}

export const isSidebarStepCompleted = (sidebarItem, currentStep) => {
    const order = [STEPS.AMOUNT, STEPS.DESTINATION, STEPS.REVIEW, STEPS.DONE]
    const currentRank =
        currentStep === STEPS.SPEED
            ? order.indexOf(STEPS.DESTINATION)
            : order.indexOf(currentStep)
    const itemRank = order.indexOf(sidebarItem.stepName)
    return itemRank >= 0 && itemRank < currentRank
}

// Mock data for the source IBAN
export const SOURCE_IBAN = {
    title: "Malta IBAN",
    iban: "MT89 37 · · · 0130 00",
    ibanFull: "MT89 3704 0044 0532 0130 00",
    balance: "53,180.07",
    currency: "EUR",
}

// Mock linked bank accounts
export const LINKED_BANKS = [
    {
        id: "cib",
        name: "CIB",
        lastFour: "4821",
        conversion: "EUR to EGP",
        country: "EG",
        selected: true,
    },
    {
        id: "federal",
        name: "Federal Bank",
        lastFour: "9204",
        conversion: "EUR to INR",
        country: "IN",
        selected: false,
    },
]

// Transfer speed options
export const TRANSFER_SPEEDS = [
    {
        id: "instant",
        label: "Instant",
        description: "Arrives in seconds",
        fee: "0.50",
        icon: "lightning",
    },
    {
        id: "saver",
        label: "Saver",
        description: "Arrives in 2-3 business days",
        fee: "0",
        icon: "speedometer",
    },
]
