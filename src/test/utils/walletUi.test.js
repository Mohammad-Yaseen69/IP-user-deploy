import { describe, expect, it } from "vitest";
import {
  bucketByMonth,
  currencySymbol,
  niceMax,
  parseScheduleDate,
  spendingByLabel,
  splitAmount,
  upcoming,
} from "../../Common/WalletUI/utils";

describe("wallet UI helpers", () => {
  const now = new Date(2026, 9, 27); // 27 Oct 2026

  it("buckets completed credits and debits by month", () => {
    const tx = (createdAt, transaction_type, amount, status = "COMPLETED") => ({
      createdAt,
      transaction_type,
      amount,
      status,
    });
    const months = bucketByMonth(
      [
        tx("2026-10-05T10:00:00", "credit", 100),
        tx("2026-10-06T10:00:00", "debit", 40),
        tx("2026-10-07T10:00:00", "credit", 999, "FAILED"),
        tx("2025-11-15T10:00:00", "debit", 7),
        tx("2025-10-15T10:00:00", "credit", 5),
      ],
      now,
    );

    expect(months).toHaveLength(12);
    expect(months[0]).toMatchObject({ in: 0, out: 7 });
    expect(months[11]).toMatchObject({ in: 100, out: 40 });
    expect(months[11].date.getMonth()).toBe(9);
  });

  it("takes currency symbols from the platform, falling back to the code", () => {
    expect(currencySymbol("INR")).toBe("₹");
    expect(currencySymbol("USD")).toBe("$");
    expect(currencySymbol("EUR")).toBe("€");
    expect(currencySymbol("CHF")).toBe("CHF");
    expect(currencySymbol("USDT")).toBe("USDT");
    expect(currencySymbol(undefined)).toBe("");
  });

  it("picks a readable axis maximum", () => {
    expect(niceMax(0)).toBe(100);
    expect(niceMax(18240)).toBe(20000);
    expect(niceMax(20000)).toBe(20000);
    expect(niceMax(4.2)).toBe(5);
  });

  it("splits amounts and parses schedule dates", () => {
    expect(splitAmount("29,842.76")).toEqual(["29,842", ".76"]);
    expect(splitAmount("12")).toEqual(["12", ""]);
    expect(parseScheduleDate("01-11-2026")).toEqual(new Date(2026, 10, 1));
    expect(parseScheduleDate("nonsense")).toBeNull();
  });

  it("keeps active schedules inside the next 14 days, soonest first", () => {
    const rows = upcoming(
      [
        { _id: "late", status: "pending", date: "20-11-2026" },
        { _id: "b", status: "processing", date: "05-11-2026" },
        { _id: "a", status: "pending", date: "27-10-2026" },
        { _id: "past", status: "pending", date: "26-10-2026" },
        { _id: "done", status: "completed", date: "30-10-2026" },
      ],
      now,
    );

    expect(rows.map(({ item }) => item._id)).toEqual(["a", "b"]);
  });
  it("groups a month of completed debits by label and folds the tail into Other", () => {
    const tx = (payment_type, amount, extra = {}) => ({
      createdAt: "2026-10-10T10:00:00",
      transaction_type: "debit",
      status: "completed",
      payment_type,
      amount,
      ...extra,
    });
    const { total, rows } = spendingByLabel(
      [
        tx("a", 50),
        tx("b", 30),
        tx("a", 10),
        tx("c", 6),
        tx("d", 4),
        tx("x", 500, { transaction_type: "credit" }),
        tx("x", 500, { createdAt: "2026-09-10T10:00:00" }),
        tx("x", 500, { status: "failed" }),
      ],
      now,
      (item) => item.payment_type,
      2,
    );

    expect(total).toBe(100);
    expect(rows.map((row) => [row.label, row.value, row.percent])).toEqual([
      ["a", 60, 60],
      ["b", 30, 30],
      ["Other", 10, 10],
    ]);
  });
});
