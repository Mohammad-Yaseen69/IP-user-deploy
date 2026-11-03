import { describe, it, expect } from "vitest";
import { getPaymentReference } from "../../Components/VirtualIBAN/utils/virtualIban";

describe("getPaymentReference", () => {
  it("uses Ref {virtualIbanId} when virtualIbanId exists on iban", () => {
    const iban = { virtualIbanId: "VIBAN-987654" };
    const userDetails = { username: "john_doe" };
    expect(getPaymentReference(iban, userDetails)).toBe("Ref VIBAN-987654");
  });

  it("uses Ref {username} when virtualIbanId is empty or not present", () => {
    const iban = { virtualIbanId: "" };
    const userDetails = { username: "john_doe" };
    expect(getPaymentReference(iban, userDetails)).toBe("Ref john_doe");
  });

  it("uses Ref {username} when virtualIbanId is undefined", () => {
    const iban = {};
    const userDetails = { username: "alice_smith" };
    expect(getPaymentReference(iban, userDetails)).toBe("Ref alice_smith");
  });

  it("checks nested username properties on userDetails or iban when virtualIbanId does not exist", () => {
    const iban1 = {};
    const userDetails1 = { user: { username: "nested_user" } };
    expect(getPaymentReference(iban1, userDetails1)).toBe("Ref nested_user");

    const iban2 = { account: { username: "account_user" } };
    expect(getPaymentReference(iban2, {})).toBe("Ref account_user");

    const iban3 = { username: "direct_iban_user" };
    expect(getPaymentReference(iban3, {})).toBe("Ref direct_iban_user");
  });

  it("does not duplicate Ref prefix if virtualIbanId or username already includes it", () => {
    const iban = { virtualIbanId: "Ref 123456" };
    expect(getPaymentReference(iban, {})).toBe("Ref 123456");

    const ibanWithout = { virtualIbanId: "" };
    const userDetails = { username: "ref special_ref" };
    expect(getPaymentReference(ibanWithout, userDetails)).toBe("ref special_ref");
  });

  it("falls back to iban id if neither virtualIbanId nor username exists", () => {
    const iban = { _id: "65f123456789abcdef" };
    expect(getPaymentReference(iban, {})).toBe("Ref 65f123456789abcdef");
  });

  it("returns Ref if no identifiers exist", () => {
    expect(getPaymentReference(null, null)).toBe("Ref");
    expect(getPaymentReference({}, {})).toBe("Ref");
  });
});
