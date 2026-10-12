const COPY_TRADING_PATH = "/copy-trading"

export const PAGES = {
    DASHBOARD: "dashboard",
    STRATEGIES: "strategies",
    ACCOUNTS: "accounts",
    ALLOCATION: "allocation",
    FUNDING: "funding",
    MANDATE: "mandate",
    WORKSPACE: "workspace",
    MANAGE: "manage",
    WITHDRAW: "withdraw",
    RELEASE: "release",
    DESTINATION: "destination",
    PAYOUT: "payout",
    PAYOUT_STATUS: "payout-status",
    SETTINGS: "settings",
}

export const pathFor = (page) => (page === PAGES.DASHBOARD ? COPY_TRADING_PATH : `${COPY_TRADING_PATH}/${page}`)

export const COPY_STATUS = {
    NONE: "none",
    ACTIVATION_PENDING: "activation_pending",
    ACTIVE: "active",
    PAUSE_PENDING: "pause_pending",
    PAUSED: "paused",
    RESUME_PENDING: "resume_pending",
    STOP_PENDING: "stop_pending",
    STOPPED: "stopped",
}

export const OP_STATUS = {
    PROCESSING: "processing",
    COMPLETED: "completed",
    ACTION_REQUIRED: "action_required",
    FAILED: "failed",
    REVERSED: "reversed",
}

export const STAGE = {
    UPCOMING: "upcoming",
    PENDING: "pending",
    DONE: "done",
    FAILED: "failed",
}

export const FUNDING_STAGES = [
    { key: "authorized", label: "Payment authorized", group: "payment" },
    { key: "settled", label: "Payment settled", group: "payment" },
    { key: "credit_requested", label: "Broker credit requested", group: "broker" },
    { key: "credit_confirmed", label: "Broker credit confirmed", group: "broker" },
]

export const RELEASE_STAGES = [
    { key: "release", label: "Release from CopyX", hint: "Tag Markets releases cash from the strategy" },
    { key: "broker_wallet", label: "Broker wallet", hint: "Held in your Tag Markets wallet" },
    { key: "bridge", label: "Transfer to InstaPay", hint: "Credited to your XOF wallet" },
]

export const PAYOUT_STAGES = [
    { key: "submitted", label: "Submitted" },
    { key: "processing", label: "Processing" },
    { key: "delivered", label: "Delivered" },
]

/* Stepper definitions of the three flows in the design. */
export const SETUP_STEPS = ["Strategy", "Accounts", "Allocation", "Funding", "Mandate", "Active"]
export const MANAGE_STEPS = ["Choose action", "Review effect", "Confirm securely", "Broker confirms"]
export const WITHDRAW_STEPS = ["Amount", "Release", "Destination", "Review", "Delivered"]

export const isCopyLive = (status) => ![COPY_STATUS.NONE, COPY_STATUS.ACTIVATION_PENDING].includes(status)

const releaseDone = (state) => state.withdrawal?.release?.status === OP_STATUS.COMPLETED

/* Deep links never skip a required step: each page falls back to the first step still open. */
export const resolvePage = (page, state) => {
    const { draft, profile, funding, copy, withdrawal } = state
    const linked = profile.brokerLink === "linked"

    switch (page) {
        case PAGES.ACCOUNTS:
            return draft.strategyId ? page : PAGES.STRATEGIES
        case PAGES.ALLOCATION:
            if (!draft.strategyId) return PAGES.STRATEGIES
            return linked ? page : PAGES.ACCOUNTS
        case PAGES.FUNDING:
            if (funding) return page
            return draft.method ? page : resolvePage(PAGES.ALLOCATION, state)
        case PAGES.MANDATE:
            if (copy.status === COPY_STATUS.ACTIVATION_PENDING || copy.pending?.type === "amend") return page
            if (funding?.status !== OP_STATUS.COMPLETED) return resolvePage(PAGES.FUNDING, state)
            return isCopyLive(copy.status) && !draft.amendment ? PAGES.WORKSPACE : page
        case PAGES.WORKSPACE:
        case PAGES.MANAGE:
        case PAGES.WITHDRAW:
        case PAGES.RELEASE:
            return copy.status === COPY_STATUS.NONE ? PAGES.DASHBOARD : page
        case PAGES.DESTINATION:
            return releaseDone(state) ? page : PAGES.RELEASE
        case PAGES.PAYOUT:
            if (withdrawal?.payout) return PAGES.PAYOUT_STATUS
            return withdrawal?.destination ? page : resolvePage(PAGES.DESTINATION, state)
        case PAGES.PAYOUT_STATUS:
            return withdrawal?.payout ? page : resolvePage(PAGES.PAYOUT, state)
        default:
            return Object.values(PAGES).includes(page) ? page : PAGES.DASHBOARD
    }
}
