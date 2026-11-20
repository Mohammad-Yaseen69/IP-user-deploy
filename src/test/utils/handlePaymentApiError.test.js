import { describe, it, expect, vi } from "vitest";

vi.mock("../../Components/PaymentsNewer/InternationalFlow", () => ({
  apiErrorMessage: () => null,
}));
vi.mock("../../utils/Functions/paymentLimits", () => ({ LimitsErrorMessage: () => null }));

import {
  handlePaymentApiError,
  NETWORK_ERROR_MESSAGE,
} from "../../utils/Functions/handlePaymentApiError.js";

const fallback = "We could not save this beneficiary.";

describe("handlePaymentApiError without an encrypted body", () => {
  it("reports a network error when the request never got a response", () => {
    const error = { isAxiosError: true, code: "ERR_NETWORK", response: undefined };
    expect(handlePaymentApiError({ error, fallback })).toBe(NETWORK_ERROR_MESSAGE);
  });

  it("reports a network error when a gateway answers with HTML", () => {
    const error = { isAxiosError: true, response: { status: 504, data: "<html>" } };
    expect(handlePaymentApiError({ error, fallback })).toBe(NETWORK_ERROR_MESSAGE);
  });

  it("keeps the fallback for a raw 500, since the server did answer", () => {
    const error = { isAxiosError: true, response: { status: 500, data: { success: false } } };
    expect(handlePaymentApiError({ error, fallback })).toBe(fallback);
  });

  it("keeps the caller's fallback for a plain frontend error", () => {
    expect(handlePaymentApiError({ error: new Error("boom"), fallback })).toBe(fallback);
  });
});
