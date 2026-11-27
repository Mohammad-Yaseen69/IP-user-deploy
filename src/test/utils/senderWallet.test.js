import { describe, it, expect } from "vitest";
import { getDefaultSenderWallet } from "../../utils/Functions/senderWallet";

const wallet = (code, extra = {}) => ({
  _id: code,
  wallet_type: "insta",
  status: "active",
  currency: { code },
  ...extra,
});

describe("getDefaultSenderWallet", () => {
  it("skips an inactive first wallet instead of returning nothing", () => {
    const wallets = [wallet("XOF", { status: "inactive" }), wallet("AED"), wallet("USD")];
    expect(getDefaultSenderWallet(wallets)?.currency.code).toBe("AED");
  });

  it("keeps the first wallet when it is usable", () => {
    expect(getDefaultSenderWallet([wallet("EUR"), wallet("USD")])?.currency.code).toBe("EUR");
  });

  it("skips blocked and non-insta wallets", () => {
    const wallets = [
      wallet("PKR", { blocked: true }),
      wallet("GBP", { admin_blocked: true }),
      wallet("USD", { wallet_type: "crypto" }),
      wallet("EUR"),
    ];
    expect(getDefaultSenderWallet(wallets)?.currency.code).toBe("EUR");
  });

  it("falls back to the wallet marked default, and to nothing when there is none", () => {
    expect(
      getDefaultSenderWallet([wallet("USD", { status: "inactive", default: true })])?.currency.code,
    ).toBe("USD");
    expect(getDefaultSenderWallet([wallet("USD", { status: "inactive" })])).toBeUndefined();
    expect(getDefaultSenderWallet()).toBeUndefined();
  });
});
