import { formatCurrency } from "../../../Helper/AmountFormat";

export const getAmountNumber = (value) => {
  const amount = Number(String(value ?? "").replace(/[^\d.-]/g, ""));
  return Number.isFinite(amount) ? amount : 0;
};

export const getCurrencySymbol = (currencyCode = "EUR") => {
  switch (currencyCode) {
    case "USD":
      return "$";
    case "GBP":
      return "\u00A3";
    case "INR":
      return "\u20B9";
    default:
      return "\u20AC";
  }
};

export const formatAmountValue = (value, blur = true) =>
  formatCurrency(String(value ?? ""), blur) || "";

export const QUICK_AMOUNT_PERCENTAGES = [10, 50, 70, 100];

export const getQuickAmountsFromBalance = (balance) => {
  const availableBalance = getAmountNumber(balance);

  return QUICK_AMOUNT_PERCENTAGES.map((percent) => ({
    percent,
    value: Number(((availableBalance * percent) / 100).toFixed(2)),
  })).filter(({ value }) => value > 0);
};

export const isSameAmount = (firstValue, secondValue) =>
  Math.abs(getAmountNumber(firstValue) - getAmountNumber(secondValue)) < 0.01;

export const getAmountInputSize = (value) =>
  Math.max(String(value || "0.00").length, 1);

export const handleAmountInputChange = (event, setAmount) => {
  const value = event.target.value.replace(/[^\d.,]/g, "");
  setAmount(value);
  event.target.size = getAmountInputSize(value);
};

export const handleAmountInputKeyUp = (event, setAmount) => {
  formatCurrency(event.target.value, false, setAmount);
  event.target.size = getAmountInputSize(event.target.value);
};

export const handleAmountInputBlur = (event, setAmount) => {
  formatCurrency(event.target.value, true, setAmount, true, event);
  event.target.size = getAmountInputSize(event.target.value);
};
