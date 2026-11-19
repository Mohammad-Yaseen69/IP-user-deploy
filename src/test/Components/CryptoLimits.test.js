import { describe, it, expect, vi } from "vitest";

/* Only the pure mappers are under test; skip the network and payment-flow imports. */
vi.mock("../../utils/Functions/apiWrapper", () => ({ apiWrapper: vi.fn() }));
vi.mock("../../utils/Functions/handlePaymentApiError", () => ({ handlePaymentApiError: vi.fn() }));

import { toAccountLimits } from "../../Components/VirtualIBAN/CryptoWallet/instapay/useWalletLimits";
import { LimitsErrorMessage } from "../../utils/Functions/paymentLimits";

describe("toAccountLimits", () => {
  const data = toAccountLimits({
    currency: "USDT",
    limits: {
      account_balance_limit: 300,
      transaction_amount_limit: 20,
      daily_sending_limit: 30,
      daily_transaction_count: 3,
    },
    used: { daily_sending_limit: 10, daily_transaction_count: 1 },
    remaining: { daily_sending_limit: 20, daily_transaction_count: 2 },
    balance: { held: 216.74, remaining: 83.25 },
  });

  it("uses held/remaining from balance and skips top-up caps", () => {
    expect(data.balance_limits.used).toContain("216.74");
    expect(data.balance_limits.remaining).toContain("83.25");
    expect(data.min_topup_amount).toBeUndefined();
  });

  it("keeps counts unformatted and money in the wallet currency", () => {
    const [sending, count] = data.others;
    expect(sending.limits.daily.remaining).toMatch(/20.*USDT/);
    expect(count.limits.daily).toEqual({ total: 3, used: 1, remaining: 2 });
    expect(data.others).toHaveLength(2);
  });
});

describe("LimitsErrorMessage with a server message", () => {
  it("prefers the server text for a coded limit error", () => {
    const message = "This amount exceeds your daily sending crypto limit. Remaining: 20.00 USD.";
    expect(LimitsErrorMessage("sdl400", message)).toBe(message);
    expect(LimitsErrorMessage("sdl400")).toBe("Daily Sending Limit exceeded");
  });

  it("falls back to the local text for legacy code-only messages and ignores non-limit errors", () => {
    expect(LimitsErrorMessage("sdl400", "sdl400")).toBe("Daily Sending Limit exceeded");
    expect(LimitsErrorMessage("x", "insufficient_funds")).toBe(false);
  });
});
