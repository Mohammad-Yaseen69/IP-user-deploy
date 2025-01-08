class CardDetails {
    constructor(balance, monthly_limit, completed) {
        this.balance = balance
        this.monthly_limit = monthly_limit
        this.completed = completed
    }

    getRemaining() {
        return this.monthly_limit - this.completed
    }
}

export const cardData = [
    new CardDetails(34000, 10000, 7000),
    new CardDetails(32000, 11000, 7230),
    new CardDetails(17000, 15000, 14570)
]