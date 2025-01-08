import { createSlice } from "@reduxjs/toolkit";


class CardDetails {
    constructor(balance, monthly_limit, completed, wallet_number) {
        this.balance = balance
        this.monthly_limit = monthly_limit
        this.completed = completed
        this.wallet_number = wallet_number

    }

    getRemaining() {
        return this.monthly_limit - this.completed
    }
}

const accountsSlice = createSlice({
    name: "accounts",
    initialState: [
        new CardDetails(34000, 10000, 7000, "INSTA- ABC1234D"),
        new CardDetails(32000, 11000, 7230, "INSTA- D4321CBA"),
        new CardDetails(17000, 15000, 14570, "INSTA- AD3421BC"),
        new CardDetails(13000, 50000, 8000, "INSTA- CB4312AD")
    ]
})

export default accountsSlice.reducer