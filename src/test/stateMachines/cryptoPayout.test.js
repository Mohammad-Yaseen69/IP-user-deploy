import { describe, it, expect } from "vitest";
import {
  buildPayoutConfirmPayload,
  DEFAULT_PAYOUT_PURPOSE,
  DOCUMENT_REFERENCE_MAX_LENGTH,
  getAmountError,
  getPurposeOptions,
  getQuickAmounts,
  getSpendableBalance,
  isVerbatimPayoutError,
  PAYOUT_PURPOSE_CODES,
} from "../../stateMachines/cryptoPayout";

const EXCEEDS = "Amount exceeds your available balance.";

describe("getSpendableBalance", () => {
  it("rounds the balance down to cents", () => {
    expect(getSpendableBalance(36.2799)).toBe(36.27);
  });

  it("keeps an exact cent balance despite float noise", () => {
    expect(getSpendableBalance(36.28)).toBe(36.28);
    expect(getSpendableBalance(36.279999999999)).toBe(36.28);
    expect(getSpendableBalance(0.1 + 0.2)).toBe(0.3);
  });
});

describe("getAmountError", () => {
  it("allows sending the full balance", () => {
    expect(getAmountError("36.28", 36.28, "USDT")).toBe("");
    expect(getAmountError("36.28", 36.279999999999, "USDT")).toBe("");
  });

  it("rejects an amount above the spendable balance", () => {
    expect(getAmountError("36.28", 36.2799, "USDT")).toBe(EXCEEDS);
    expect(getAmountError("36.29", 36.28, "USDT")).toBe(EXCEEDS);
  });
});

describe("getQuickAmounts", () => {
  it("never offers more than the balance", () => {
    const quick = getQuickAmounts(36.2799, [25, 50, 75, 100]);
    expect(quick.find((q) => q.percent === 100).value).toBe(36.27);
    quick.forEach(({ value }) => expect(value).toBeLessThanOrEqual(36.2799));
  });

  it("makes 100% pass validation", () => {
    const balance = 36.2799;
    const full = getQuickAmounts(balance, [100])[0].value;
    expect(getAmountError(String(full), balance, "USDT")).toBe("");
  });
});

describe("crypto payout confirm details", () => {
  const base = {
    token: "otp-token",
    otp: "123456",
    type: "sms",
    cryptoCurrency: "USDT",
    protocol: "TRC20",
    address: "TXyz",
  };

  it("offers the 34 remittance purpose codes with OTHER as the default", () => {
    expect(PAYOUT_PURPOSE_CODES).toHaveLength(34);
    expect(PAYOUT_PURPOSE_CODES).toContain(DEFAULT_PAYOUT_PURPOSE);
    expect(DEFAULT_PAYOUT_PURPOSE).toBe("OTHER");
    expect(getPurposeOptions()[0]).toEqual({
      value: expect.any(String),
      label: expect.any(String),
    });
  });

  it("sends the saved wallet details and the purpose on confirm", () => {
    expect(buildPayoutConfirmPayload({ ...base, purpose: "EDUCATION" })).toEqual({
      token: "otp-token",
      otp: "123456",
      type: "sms",
      crypto_currency: "USDT",
      protocol: "TRC20",
      address: "TXyz",
      purpose: "EDUCATION",
    });
  });

  it("falls back to OTHER for a purpose that is not a remittance code", () => {
    expect(buildPayoutConfirmPayload({ ...base, purpose: "" }).purpose).toBe("OTHER");
    expect(buildPayoutConfirmPayload({ ...base, purpose: "NOT_A_CODE" }).purpose).toBe("OTHER");
  });

  it("leaves out an empty document reference", () => {
    const payload = buildPayoutConfirmPayload({ ...base, documentReference: "   " });
    expect(payload).not.toHaveProperty("document_reference");
  });

  it("trims the document reference and caps it at 64 characters", () => {
    const payload = buildPayoutConfirmPayload({
      ...base,
      documentReference: `  ${"A".repeat(70)}  `,
    });
    expect(payload.document_reference).toBe("A".repeat(DOCUMENT_REFERENCE_MAX_LENGTH));
    expect(DOCUMENT_REFERENCE_MAX_LENGTH).toBe(64);
  });
});

describe("isVerbatimPayoutError", () => {
  it("keeps the minimum and missing-details messages", () => {
    expect(isVerbatimPayoutError("Minimum payout is 6 USDT after fees.")).toBe(true);
    expect(
      isVerbatimPayoutError("Missing details required for crypto payouts: relation, address"),
    ).toBe(true);
  });

  it("does not catch other errors", () => {
    expect(isVerbatimPayoutError("Insufficient balance")).toBe(false);
    expect(isVerbatimPayoutError(undefined)).toBe(false);
  });
});
