import { USE_MOCK_API } from "./config"
import * as http from "./http"
import * as mock from "./mock"

/* Single entry point for the screens. Switch implementations in api/config.js. */
const service = USE_MOCK_API ? mock : http

export const {
    loadCatalog,
    linkBrokerAccount,
    createFundingQuote,
    submitFunding,
    retryFunding,
    submitMandate,
    submitCopyAction,
    requestRelease,
    createPayoutQuote,
    submitPayout,
    retryPayout,
    resumePendingWork,
} = service

export {
    clearWithdrawal,
    ensureRate,
    isQuoteExpired,
    selectStrategy,
    setAllocation,
    setFundingMethod,
    setFundingWallet,
    setPayoutDestination,
    setWithdrawDraft,
    startAmendment,
} from "./draft"
