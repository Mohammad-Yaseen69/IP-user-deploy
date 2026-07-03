

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

export const VIRTUAL_IBAN_ACTIVATION_FEE = 4
export const VIRTUAL_IBAN_ACTIVATION_FEE_CURRENCY = "USD"

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
        activationFee: "4.00",
        activationFeeCurrency: VIRTUAL_IBAN_ACTIVATION_FEE_CURRENCY,
        monthlyFee: "4.99",
        monthlyFeeCurrency: VIRTUAL_IBAN_ACTIVATION_FEE_CURRENCY,
        included: [
            "Dedicated MT IBAN registered in your name",
            "SEPA + SWIFT receiving worldwide",
            "Funds safeguarded with regulated tier-1 partner bank",
            "Real-time notifications + monthly PDF statements",
        ],
    },
    // GB: {
    //     id: "GB",
    //     title: "United Kingdom IBAN",
    //     subtitle: "GB jurisdiction · Regulated by FCA",
    //     header: "United Kingdom IBAN · GB jurisdiction",
    //     iban: "GB89 3704 0044 0532 0130 00",
    //     bic: "IPT12345",
    //     currency: "Pound Sterling - GBP",
    //     currencyCode: "GBP",
    //     activationFee: "4.00",
    //     activationFeeCurrency: VIRTUAL_IBAN_ACTIVATION_FEE_CURRENCY,
    //     monthlyFee: "4.99",
    //     monthlyFeeCurrency: VIRTUAL_IBAN_ACTIVATION_FEE_CURRENCY,
    //     included: [
    //         "Dedicated GB IBAN registered in your name",
    //         "Faster Payments + SWIFT receiving",
    //         "Funds safeguarded with regulated tier-1 partner bank",
    //         "Real-time notifications + monthly PDF statements",
    //     ],
    // },
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
    const hiddenSteps = [
        ...(data?.kycApproved ? [STEPS.VERIFICATION] : []),
        ...(data?.skipPaymentStep ? [STEPS.PAYMENT_METHOD] : []),
    ]

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
        next: (data) => data?.kycApproved ? (data?.skipPaymentStep ? STEPS.SUMMARY : STEPS.PAYMENT_METHOD) : STEPS.VERIFICATION,
        back: () => STEPS.JURISDICTION,
    },
    [STEPS.VERIFICATION]: {
        next: (data) => data?.skipPaymentStep ? STEPS.SUMMARY : STEPS.PAYMENT_METHOD,
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
        back: (data) => data?.skipPaymentStep ? (data?.kycApproved ? STEPS.FEES : STEPS.VERIFICATION) : data?.paymentType === "paypal" ? STEPS.PAYMENT_METHOD : STEPS.PAYMENT_DETAILS,
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
        currentStep === STEPS.SUMMARY && data?.skipPaymentStep
            ? order.indexOf(STEPS.DONE)
            : currentStep === STEPS.SUMMARY || currentStep === STEPS.PAYMENT_DETAILS
                ? order.indexOf(STEPS.PAYMENT_METHOD)
                : currentStep === STEPS.PENDING
                    ? order.indexOf(STEPS.DONE)
                    : order.indexOf(currentStep)
    const itemRank = order.indexOf(sidebarItem.stepName)
    return itemRank >= 0 && itemRank < currentRank
}

export const getJurisdiction = (id) => JURISDICTIONS[id] ?? JURISDICTIONS.MT

const formatFeeAmount = (amount) =>
    Number(amount || 0).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })

export const buildMockFeeDetails = (jurisdiction, paymentType, paymentFee = {}) => {
    const info = getJurisdiction(jurisdiction)
    const baseAmount = paymentFee.baseAmount ?? VIRTUAL_IBAN_ACTIVATION_FEE
    const baseCurrency = paymentFee.baseCurrency || info.activationFeeCurrency || VIRTUAL_IBAN_ACTIVATION_FEE_CURRENCY
    const feeAmount = formatFeeAmount(paymentFee.amount ?? baseAmount)
    const feeCurrency = paymentFee.currency || baseCurrency

    return {
        fee: feeAmount,
        currency: feeCurrency,
        totalFee: feeAmount,
        baseFee: formatFeeAmount(baseAmount),
        baseCurrency,
        exchangeRate: paymentFee.exchangeRate,
        feeDetails: {
            amount: feeAmount,
            fee: "0.00",
            totalAmount: feeAmount,
            currency: feeCurrency,
            amountToTopup: feeAmount,
            exchangeRate: paymentFee.exchangeRate,
        },
        paymentType,
    }
}

export const MOCK_WALLET_STATE = {
    _id: "mock-wallet",
    name: "USD",
    wallet_id: "USD-WALLET-001",
}
