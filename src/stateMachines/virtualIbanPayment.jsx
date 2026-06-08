

export const STEPS = {
    JURISDICTION: "JURISDICTION",
    FEES: "FEES",
    VERIFICATION: "VERIFICATION",
    PAYMENT_METHOD: "PAYMENT_METHOD",
    PAYMENT_DETAILS: "PAYMENT_DETAILS",
    SUMMARY: "SUMMARY",
    PENDING: "PENDING",
    DONE: "DONE",
}

export const JURISDICTIONS = {
    MT: {
        id: "MT",
        title: "Malta IBAN",
        subtitle: "MT jurisdiction · Regulated by MFSA",
        header: "Malta IBAN · MT jurisdiction",
        iban: "MT89 3704 0044 0532 0130 00",
        bic: "IPT12345",
        currency: "Euro - EUR",
        currencyCode: "EUR",
        activationFee: "9.99",
        monthlyFee: "4.99",
        included: [
            "Dedicated MT IBAN registered in your name",
            "SEPA + SWIFT receiving worldwide",
            "Funds safeguarded with regulated tier-1 partner bank",
            "Real-time notifications + monthly PDF statements",
        ],
    },
    GB: {
        id: "GB",
        title: "United Kingdom IBAN",
        subtitle: "GB jurisdiction · Regulated by FCA",
        header: "United Kingdom IBAN · GB jurisdiction",
        iban: "GB89 3704 0044 0532 0130 00",
        bic: "IPT12345",
        currency: "Pound Sterling - GBP",
        currencyCode: "GBP",
        activationFee: "9.99",
        monthlyFee: "4.99",
        included: [
            "Dedicated GB IBAN registered in your name",
            "Faster Payments + SWIFT receiving",
            "Funds safeguarded with regulated tier-1 partner bank",
            "Real-time notifications + monthly PDF statements",
        ],
    },
}

export const SIDEBAR_STEPS = [
    { stepName: STEPS.JURISDICTION, stepLabel: "STEP 01", label: "Jurisdiction" },
    { stepName: STEPS.FEES, stepLabel: "STEP 02", label: "Fees" },
    { stepName: STEPS.VERIFICATION, stepLabel: "STEP 03", label: "Verification" },
    {
        stepName: STEPS.PAYMENT_METHOD,
        stepLabel: "STEP 04",
        label: "Payment",
        alsoActiveFor: [STEPS.PAYMENT_DETAILS, STEPS.SUMMARY],
    },
    { stepName: STEPS.DONE, stepLabel: "STEP 05", label: "Done" },
]

export const getSidebarSteps = (data = {}) => {
    const hiddenSteps = data?.kycApproved ? [STEPS.VERIFICATION] : []

    return SIDEBAR_STEPS
        .filter((item) => !hiddenSteps.includes(item.stepName))
        .map((item, index) => ({
            ...item,
            stepLabel: `STEP ${String(index + 1).padStart(2, "0")}`,
        }))
}

export const transitions = {
    [STEPS.JURISDICTION]: {
        next: () => STEPS.FEES,
        back: () => null,
    },
    [STEPS.FEES]: {
        next: (data) => data?.kycApproved ? STEPS.PAYMENT_METHOD : STEPS.VERIFICATION,
        back: () => STEPS.JURISDICTION,
    },
    [STEPS.VERIFICATION]: {
        next: () => STEPS.PAYMENT_METHOD,
        back: () => STEPS.FEES,
    },
    [STEPS.PAYMENT_METHOD]: {
        next: (data) => data?.paymentType === "paypal" ? STEPS.SUMMARY : STEPS.PAYMENT_DETAILS,
        back: (data) => data?.kycApproved ? STEPS.FEES : STEPS.VERIFICATION,
    },
    [STEPS.PAYMENT_DETAILS]: {
        next: () => STEPS.SUMMARY,
        back: () => STEPS.PAYMENT_METHOD,
    },
    [STEPS.SUMMARY]: {
        next: () => STEPS.PENDING,
        back: (data) => data?.paymentType === "paypal" ? STEPS.PAYMENT_METHOD : STEPS.PAYMENT_DETAILS,
    },
    [STEPS.PENDING]: {
        next: () => STEPS.DONE,
        back: () => null,
    },
    [STEPS.DONE]: {
        next: () => null,
        back: () => null,
    },
}

export const getDisabledState = (stepName, data) => {
    switch (stepName) {
        case STEPS.JURISDICTION:
            return !data.jurisdiction
        case STEPS.FEES:
            return !data.feesAccepted
        case STEPS.PAYMENT_METHOD:
            return !data.paymentType
        case STEPS.PAYMENT_DETAILS:
            if (data.paymentType === "wallet") {
                return !data.walletState?.wallet_id
            }
            if (data.paymentType === "card") {
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
        case STEPS.VERIFICATION:
        case STEPS.SUMMARY:
        case STEPS.PENDING:
        case STEPS.DONE:
            return false
        default:
            return false
    }
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

export const getContinueLabel = (stepName, t) => {
    switch (stepName) {
        case STEPS.SUMMARY:
            return t("Proceed To Payment")
        case STEPS.VERIFICATION:
            return t("Verify identity")
        default:
            return t("Next")
    }
}

export const isSidebarStepActive = (sidebarItem, currentStep) => {
    if (sidebarItem.alsoActiveFor?.includes(currentStep)) return true
    return sidebarItem.stepName === currentStep
}

export const isSidebarStepCompleted = (sidebarItem, currentStep, data = {}) => {
    const order = getSidebarSteps(data).map((item) => item.stepName)
    const currentRank =
        currentStep === STEPS.SUMMARY || currentStep === STEPS.PAYMENT_DETAILS
            ? order.indexOf(STEPS.PAYMENT_METHOD)
            : currentStep === STEPS.PENDING
                ? order.indexOf(STEPS.DONE)
            : order.indexOf(currentStep)
    const itemRank = order.indexOf(sidebarItem.stepName)
    return itemRank >= 0 && itemRank < currentRank
}

export const getJurisdiction = (id) => JURISDICTIONS[id] ?? JURISDICTIONS.MT

export const buildMockFeeDetails = (jurisdiction, paymentType) => {
    const info = getJurisdiction(jurisdiction)
    return {
        fee: info.activationFee,
        currency: info.currencyCode,
        totalFee: info.activationFee,
        feeDetails: {
            amount: info.activationFee,
            fee: "0.00",
            totalAmount: info.activationFee,
            currency: info.currencyCode,
            amountToTopup: info.activationFee,
        },
        paymentType,
    }
}

export const MOCK_WALLET_STATE = {
    _id: "mock-wallet",
    name: "EUR",
    wallet_id: "EUR-WALLET-001",
}
