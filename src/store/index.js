import { configureStore } from "@reduxjs/toolkit"
import Beneficiaries from "./slices/Beneficiaries";
import Transactions from "./slices/Transactions";
import Pendings from "./slices/Pendings";
import Accounts from "./slices/Accounts";
import Referrals from "./slices/Referrals";
import ChipsInRequests from "./slices/ChipsInRequests";

const store = configureStore({
    reducer: {
        beneficiaries: Beneficiaries,
        transactions: Transactions,
        pendings: Pendings,
        accounts: Accounts,
        referrals: Referrals,
        chipsInRequests: ChipsInRequests
    }
})

export default store;