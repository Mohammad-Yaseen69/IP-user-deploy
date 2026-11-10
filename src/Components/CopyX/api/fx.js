import { apiWrapper } from "../../../utils/Functions/apiWrapper";
import countries from "../../CitiesDropDown/CitiesData.json";

/* Last-resort units per USD, used only if the InstaPay rate endpoint does not answer. */
const FALLBACK_PER_USD = {
  USD: 1,
  XOF: 600,
  XAF: 600,
  EUR: 0.92,
  GBP: 0.79,
  CHF: 0.88,
  CAD: 1.37,
  AUD: 1.52,
  AED: 3.67,
  NGN: 1500,
  KES: 129,
  GHS: 15.5,
  ZAR: 18.2,
  PKR: 280,
  INR: 84,
  MAD: 10,
  EGP: 48,
  TRY: 34,
  USDT: 1,
  USDC: 1,
};

const cache = new Map();

const fallbackRate = (from, to) => (FALLBACK_PER_USD[to] ?? 1) / (FALLBACK_PER_USD[from] ?? 1);

/* How many `to` units one `from` unit buys, from InstaPay's own exchange-rate service. */
export const getRate = async (from, to) => {
  if (!from || !to || from === to) return 1;
  const key = `${from}-${to}`;
  if (cache.has(key)) return cache.get(key);
  try {
    const res = await apiWrapper({
      endpoint: `/api/wallet/get-plain-exchange-rate?from=${from}&to=${to}&amount=1`,
    });
    const rate = Number(res?.exchangeRate?.result ?? res?.exchangeRate?.exchanged_amount);
    if (!Number.isFinite(rate) || rate <= 0) throw new Error("invalid rate");
    cache.set(key, rate);
    return rate;
  } catch {
    return fallbackRate(from, to);
  }
};

export const currencyForCountry = (iso3) =>
  countries.find((item) => item.iso3 === iso3)?.currency || "USD";
