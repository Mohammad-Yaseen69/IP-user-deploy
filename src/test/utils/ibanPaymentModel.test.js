import { describe, it, expect } from "vitest";
import {
  formatFeeScheduleItem,
  formatMoney,
  normalizeIbanPaymentModel,
} from "../../Components/VirtualIBAN/utils/ibanPaymentModel";

const RAW = {
  data: {
    name: "Growth Pack",
    fee_schedule: [
      {
        id: "iban_activation",
        name: "IBAN Activation Fee (One-Time)",
        flatEuro: 500,
        percentAmount: 0,
      },
      { id: "monthly_iban_fee", name: "Monthly IBAN Fee", flatEuro: 50, percentAmount: 0 },
      { id: "swift_outward", name: "SWIFT Outward Transfer", flatEuro: 15, percentAmount: 0.2 },
      { id: "sepa_inward", name: "SEPA Inward Transfer", flatEuro: 0, percentAmount: 0 },
    ],
  },
};

describe("normalizeIbanPaymentModel", () => {
  it("keeps amount and currency together for activation and monthly fees", () => {
    const model = normalizeIbanPaymentModel(RAW);
    expect(model.name).toBe("Growth Pack");
    expect(model.currency).toBe("EUR");
    expect(model.activationFee).toMatchObject({ amount: 500, currency: "EUR" });
    expect(model.monthlyFee).toMatchObject({ amount: 50, currency: "EUR" });
    expect(model.feeSchedule).toHaveLength(4);
  });

  it("prefers an explicit currency from the pack when present", () => {
    const model = normalizeIbanPaymentModel({ data: { ...RAW.data, currency: "GBP" } });
    expect(model.activationFee.currency).toBe("GBP");
    expect(model.monthlyFee.currency).toBe("GBP");
  });

  it("returns null fees instead of zero when a row is missing", () => {
    const model = normalizeIbanPaymentModel({ data: { name: "Empty", fee_schedule: [] } });
    expect(model.activationFee).toBeNull();
    expect(model.monthlyFee).toBeNull();
  });

  it("returns null for an empty response", () => {
    expect(normalizeIbanPaymentModel(null)).toBeNull();
    expect(normalizeIbanPaymentModel({})).toBeNull();
  });
});

describe("formatting", () => {
  it("formats money with the currency code", () => {
    expect(formatMoney({ amount: 50, currency: "EUR" })).toBe("EUR 50.00");
    expect(formatMoney(null)).toBe("");
  });

  it("formats flat, percent, combined and free schedule rows", () => {
    const [activation, , swift, sepa] = RAW.data.fee_schedule;
    expect(formatFeeScheduleItem(activation, "EUR")).toBe("{{currency}} {{amount}} flat");
    const t = (key, vars) => (vars ? `${vars.currency} ${vars.amount} flat` : key);
    expect(formatFeeScheduleItem(activation, "EUR", t)).toBe("EUR 500 flat");
    expect(formatFeeScheduleItem(swift, "EUR", t)).toBe("EUR 15 flat + 0.2%");
    expect(formatFeeScheduleItem(sepa, "EUR", t)).toBe("Free");
  });
});
