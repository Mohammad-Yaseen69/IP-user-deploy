import { formatCurrency } from "../../../Helper/AmountFormat"

export const getAmountNumber = (value) => {
    const amount = Number(String(value ?? "").replace(/,/g, ""))
    return Number.isFinite(amount) ? amount : 0
}

export const getCurrencySymbol = (currencyCode = "EUR") => {
    switch (currencyCode) {
        case "USD":
            return "$"
        case "GBP":
            return "£"
        case "INR":
            return "₹"
        default:
            return "€"
    }
}

export const formatAmountValue = (value, blur = true) =>
    formatCurrency(String(value ?? ""), blur) || ""

export const handleAmountInputChange = (event, setAmount) => {
    const value = event.target.value.replace(/[^\d.,]/g, "")
    setAmount(value)
}

export const handleAmountInputKeyUp = (event, setAmount) => {
    formatCurrency(event.target.value, false, setAmount)
}

export const handleAmountInputBlur = (event, setAmount) => {
    formatCurrency(event.target.value, true, setAmount)
}
