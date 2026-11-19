// Pure helpers for the redesigned Wallets and Dashboard pages.

// Symbol for an ISO currency code from the browser's own currency data ("INR" -> "₹", "CHF" -> "CHF").
// The backend's currency.symbol is not reliable (INR arrives as the Bengali word for taka), and codes
// Intl does not know (USDT) fall back to the code itself.
export const currencySymbol = (code = "") => {
  try {
    return new Intl.NumberFormat("en", {
      style: "currency",
      currency: code,
      currencyDisplay: "narrowSymbol",
    })
      .formatToParts(0)
      .find((part) => part.type === "currency").value;
  } catch {
    return code ?? "";
  }
};

// Splits a formatted amount so the decimals can be dimmed like the design.
export const splitAmount = (value) => {
  const [whole, decimals] = String(value ?? "0.00").split(".");
  return [whole, decimals ? `.${decimals}` : ""];
};

// Rounds the tallest bar up to 1, 2 or 5 times a power of ten so the axis reads cleanly.
export const niceMax = (value) => {
  if (!(value > 0)) return 100;
  const pow = 10 ** Math.floor(Math.log10(value));
  return [1, 2, 5, 10].map((step) => step * pow).find((step) => step >= value);
};

const monthKey = (d) => `${d.getFullYear()}-${d.getMonth()}`;

// Completed credits/debits summed per calendar month, oldest first (same rules as the old Stats card).
export const bucketByMonth = (transactions = [], now = new Date(), months = 12) => {
  const buckets = new Map();
  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    buckets.set(monthKey(date), { date, in: 0, out: 0 });
  }

  transactions.forEach((tx) => {
    if (tx?.status?.toLowerCase() !== "completed") return;
    const bucket = buckets.get(monthKey(new Date(tx.createdAt)));
    if (!bucket) return;
    const amount = Math.abs(Number(tx.amount) || 0);
    if (tx.transaction_type === "credit") bucket.in += amount;
    else if (tx.transaction_type === "debit") bucket.out += amount;
  });

  return [...buckets.values()];
};

// The API stores schedule dates as DD-MM-YYYY.
export const parseScheduleDate = (value) => {
  const [, day, month, year] = /^(\d{1,2})-(\d{1,2})-(\d{4})$/.exec(value ?? "") ?? [];
  const date = year ? new Date(+year, +month - 1, +day) : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

// Active scheduled payments due from today up to `days` ahead, soonest first.
export const upcoming = (items = [], now = new Date(), days = 14, max = 5) => {
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const end = new Date(start);
  end.setDate(end.getDate() + days);

  return items
    .filter((item) => ["pending", "processing"].includes(item?.status?.toLowerCase()))
    .map((item) => ({ item, date: parseScheduleDate(item?.date) }))
    .filter(({ date }) => date && date >= start && date <= end)
    .sort((a, b) => a.date - b.date)
    .slice(0, max);
};

// Completed debits of one calendar month grouped by a label, largest first, capped at `max` rows (+ "Other").
export const spendingByLabel = (transactions = [], month = new Date(), labelOf, max = 4) => {
  const totals = new Map();
  transactions.forEach((tx) => {
    const date = new Date(tx?.createdAt);
    if (
      tx?.status?.toLowerCase() !== "completed" ||
      tx?.transaction_type !== "debit" ||
      date.getFullYear() !== month.getFullYear() ||
      date.getMonth() !== month.getMonth()
    )
      return;
    const label = labelOf(tx);
    totals.set(label, (totals.get(label) ?? 0) + Math.abs(Number(tx.amount) || 0));
  });

  const rows = [...totals]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);
  const rest = rows.slice(max).reduce((sum, row) => sum + row.value, 0);
  const top = rest > 0 ? [...rows.slice(0, max), { label: "Other", value: rest }] : rows;
  const total = top.reduce((sum, row) => sum + row.value, 0);

  return {
    total,
    rows: top.map((row) => ({ ...row, percent: total ? (row.value / total) * 100 : 0 })),
  };
};
