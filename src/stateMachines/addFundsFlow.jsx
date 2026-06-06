

export const STEPS = {
    AMOUNT: "AMOUNT",
    PAYMENT_METHOD: "PAYMENT_METHOD",
    PAYMENT_DETAILS: "PAYMENT_DETAILS",
    REVIEW: "REVIEW",
    DONE: "DONE",
}

export const SIDEBAR_STEPS = [
    { stepName: STEPS.AMOUNT, stepLabel: "STEP 01", label: "Amount" },
    { 
        stepName: STEPS.PAYMENT_METHOD, 
        stepLabel: "STEP 02", 
        label: "Method",
        alsoActiveFor: [STEPS.PAYMENT_DETAILS, STEPS.REVIEW]
    },
    { stepName: STEPS.DONE, stepLabel: "STEP 03", label: "Done" },
]

export const transitions = {
    [STEPS.AMOUNT]: {
        next: () => STEPS.PAYMENT_METHOD,
        back: () => null,
    },
    [STEPS.PAYMENT_METHOD]: {
        next: (data) => data.fundingMethod === "paypal" ? STEPS.REVIEW : STEPS.PAYMENT_DETAILS,
        back: () => STEPS.AMOUNT,
    },
    [STEPS.PAYMENT_DETAILS]: {
        next: () => STEPS.REVIEW,
        back: () => STEPS.PAYMENT_METHOD,
    },
    [STEPS.REVIEW]: {
        next: () => STEPS.DONE,
        back: (data) => data.fundingMethod === "paypal" ? STEPS.PAYMENT_METHOD : STEPS.PAYMENT_DETAILS,
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
        case STEPS.PAYMENT_METHOD:
            return !data.fundingMethod
        case STEPS.PAYMENT_DETAILS:
            if (data.fundingMethod === "wallet") {
                return !data.walletState?.wallet_id
            }
            if (data.fundingMethod === "card") {
                if (data.selectedSaveCard?._id) return false
                return (
                    !data.cardDetail?.cardNumber ||
                    !data.cardDetail?.cardExpiry ||
                    !data.cardDetail?.cardCVC ||
                    !data.cardDetail?.cardHolderName ||
                    data.cardNumberError
                )
            }
            return false
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
            return t("Next")
        default:
            return t("Next")
    }
}

export const isSidebarStepActive = (sidebarItem, currentStep) => {
    if (sidebarItem.alsoActiveFor?.includes(currentStep)) return true
    return sidebarItem.stepName === currentStep
}

export const isSidebarStepCompleted = (sidebarItem, currentStep) => {
    const order = [STEPS.AMOUNT, STEPS.PAYMENT_METHOD, STEPS.DONE]
    const currentRank =
        currentStep === STEPS.REVIEW || currentStep === STEPS.PAYMENT_DETAILS
            ? order.indexOf(STEPS.PAYMENT_METHOD)
            : order.indexOf(currentStep)
    const itemRank = order.indexOf(sidebarItem.stepName)
    return itemRank >= 0 && itemRank < currentRank
}

// Funding methods from Figma
export const FUNDING_METHODS = [
    {
        id: "instapay_wallet",
        label: "Instapay wallet",
        icon: "wallet",
    },
    {
        id: "card",
        label: "Card Payments",
        icon: "credit_card",
    },
    {
        id: "paypal",
        label: "Paypal",
        icon: "paypal",
    },
    {
        id: "mobile_money",
        label: "Mobile money",
        icon: "mobile",
    },
    {
        id: "bank_transfer",
        label: "Bank transfer",
        icon: "bank",
    },
]

// Mock wallet data
export const MOCK_WALLETS = [
    {
        id: "inr",
        name: "INR Wallet",
        code: "3MKTGFY7",
        balance: "$900.00",
        monthlyLimit: "$3,500.00/$5,000.00",
        limitUsed: "$3,500.00",
        gradient: "linear-gradient(135deg, #5926F0 0%, #7B4BF5 100%)",
    },
    {
        id: "usd",
        name: "USD Wallet",
        code: "3MKTGFY7",
        balance: "$900.00",
        monthlyLimit: "$3,500.00/$5,000.00",
        limitUsed: "$3,500.00",
        gradient: "linear-gradient(135deg, #E64067 0%, #FFB803 100%)",
    },
    {
        id: "eur",
        name: "EUR Wallet",
        code: "3MKTGFY7",
        balance: "$900.00",
        monthlyLimit: "$3,500.00/$5,000.00",
        limitUsed: "$3,500.00",
        gradient: "linear-gradient(135deg, #E64067 0%, #FFB803 100%)",
    },
]
