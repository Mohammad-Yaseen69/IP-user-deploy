import { PAGES } from "../../../stateMachines/copyTrading"
import Accounts from "./Accounts"
import Allocation from "./Allocation"
import Dashboard from "./Dashboard"
import Destination from "./Destination"
import Funding from "./Funding"
import Manage from "./Manage"
import Mandate from "./Mandate"
import Payout from "./Payout"
import PayoutStatus from "./PayoutStatus"
import Release from "./Release"
import Settings from "./Settings"
import Strategies from "./Strategies"
import Withdraw from "./Withdraw"
import Workspace from "./Workspace"

export const PAGE_COMPONENTS = {
    [PAGES.DASHBOARD]: Dashboard,
    [PAGES.STRATEGIES]: Strategies,
    [PAGES.ACCOUNTS]: Accounts,
    [PAGES.ALLOCATION]: Allocation,
    [PAGES.FUNDING]: Funding,
    [PAGES.MANDATE]: Mandate,
    [PAGES.WORKSPACE]: Workspace,
    [PAGES.MANAGE]: Manage,
    [PAGES.WITHDRAW]: Withdraw,
    [PAGES.RELEASE]: Release,
    [PAGES.DESTINATION]: Destination,
    [PAGES.PAYOUT]: Payout,
    [PAGES.PAYOUT_STATUS]: PayoutStatus,
    [PAGES.SETTINGS]: Settings,
}
