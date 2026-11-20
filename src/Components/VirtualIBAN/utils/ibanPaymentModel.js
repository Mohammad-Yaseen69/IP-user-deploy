import { parseAmount } from "./virtualIbanPreflight";

export const IBAN_FEE_SCHEDULE_CURRENCY = "EUR";

export const IBAN_FEE_IDS = {
  ACTIVATION: ["iban_activation", "activation_fee"],
  MONTHLY: ["monthly_iban_fee"],
};

export const getIbanPaymentModelCurrency = (model) =>
  model?.currency || model?.fee_currency || IBAN_FEE_SCHEDULE_CURRENCY;

const findScheduleItem = (schedule, ids) =>
  (Array.isArray(schedule) ? schedule : []).find((item) => ids.includes(item?.id)) || null;

export const toMoney = (item, currency) => {
  if (!item || !currency) return null;
  return {
    amount: parseAmount(item.flatEuro),
    currency,
    percent: parseAmount(item.percentAmount),
  };
};

export const normalizeIbanPaymentModel = (raw) => {
  const model = raw?.data?.data ?? raw?.data ?? raw ?? null;
  if (!model || typeof model !== "object") return null;
  if (!("name" in model) && !Array.isArray(model.fee_schedule)) return null;

  const currency = getIbanPaymentModelCurrency(model);
  const feeSchedule = Array.isArray(model.fee_schedule) ? model.fee_schedule : [];

  return {
    name: model.name || "",
    currency,
    feeSchedule,
    activationFee: toMoney(findScheduleItem(feeSchedule, IBAN_FEE_IDS.ACTIVATION), currency),
    monthlyFee: toMoney(findScheduleItem(feeSchedule, IBAN_FEE_IDS.MONTHLY), currency),
  };
};

export const formatMoney = (money) => {
  if (!money) return "";
  const amount = Number(money.amount || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${money.currency} ${amount}`;
};

export const formatFeeScheduleItem = (item, currency, t = (s) => s) => {
  const parts = [];
  const flat = parseAmount(item?.flatEuro);
  const percent = parseAmount(item?.percentAmount);
  if (flat > 0) parts.push(t("{{currency}} {{amount}} flat", { currency, amount: flat }));
  if (percent > 0) parts.push(`${percent}%`);
  if (parts.length === 0) return t("Free");
  return parts.join(" + ");
};
