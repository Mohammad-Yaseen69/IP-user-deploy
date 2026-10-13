import { describe, it, expect } from "vitest";
import {
  STEPS,
  getDisabledState,
  getSidebarSteps,
  goBack,
  goNext,
  isSidebarStepCompleted,
} from "../../stateMachines/virtualIbanPayment";

describe("virtualIbanPayment PRICING step", () => {
  it("goes PAYMENT_DETAILS -> PRICING -> SUMMARY -> PENDING for wallet payments", () => {
    const data = { paymentType: "wallet", kycApproved: true };
    expect(goNext(STEPS.PAYMENT_DETAILS, data).nextStep).toBe(STEPS.PRICING);
    expect(goNext(STEPS.PRICING, data).nextStep).toBe(STEPS.SUMMARY);
    expect(goNext(STEPS.SUMMARY, data).nextStep).toBe(STEPS.PENDING);
  });

  it("goes PAYMENT_METHOD -> PRICING for paypal and back again", () => {
    const data = { paymentType: "paypal", kycApproved: true };
    expect(goNext(STEPS.PAYMENT_METHOD, data).nextStep).toBe(STEPS.PRICING);
    expect(goBack(STEPS.PRICING, data).prevStep).toBe(STEPS.PAYMENT_METHOD);
  });

  it("skips the payment steps but still shows PRICING when skipPaymentStep is set", () => {
    const approved = { skipPaymentStep: true, kycApproved: true };
    expect(goNext(STEPS.FEES, approved).nextStep).toBe(STEPS.PRICING);
    expect(goBack(STEPS.PRICING, approved).prevStep).toBe(STEPS.FEES);

    const unverified = { skipPaymentStep: true, kycApproved: false };
    expect(goNext(STEPS.FEES, unverified).nextStep).toBe(STEPS.VERIFICATION);
    expect(goNext(STEPS.VERIFICATION, unverified).nextStep).toBe(STEPS.PRICING);
    expect(goBack(STEPS.PRICING, unverified).prevStep).toBe(STEPS.VERIFICATION);
  });

  it("always returns from SUMMARY to PRICING", () => {
    expect(goBack(STEPS.SUMMARY, { paymentType: "wallet" }).prevStep).toBe(STEPS.PRICING);
    expect(goBack(STEPS.SUMMARY, { skipPaymentStep: true }).prevStep).toBe(STEPS.PRICING);
  });

  it("blocks Next on PRICING until the pricing is accepted", () => {
    expect(getDisabledState(STEPS.PRICING, { pricingAccepted: false })).toBe(true);
    expect(getDisabledState(STEPS.PRICING, { pricingAccepted: true })).toBe(false);
  });

  it("lists Pricing between Payment and Done in the sidebar", () => {
    const names = getSidebarSteps({}).map((s) => s.stepName);
    expect(names).toEqual([
      STEPS.JURISDICTION,
      STEPS.FEES,
      STEPS.VERIFICATION,
      STEPS.PAYMENT_METHOD,
      STEPS.PRICING,
      STEPS.DONE,
    ]);
    expect(getSidebarSteps({}).map((s) => s.stepLabel)).toEqual([
      "STEP 01",
      "STEP 02",
      "STEP 03",
      "STEP 04",
      "STEP 05",
      "STEP 06",
    ]);
  });

  it("marks Payment completed while on PRICING and Pricing completed only after SUMMARY", () => {
    const data = { kycApproved: true };
    const steps = getSidebarSteps(data);
    const payment = steps.find((s) => s.stepName === STEPS.PAYMENT_METHOD);
    const pricing = steps.find((s) => s.stepName === STEPS.PRICING);

    expect(isSidebarStepCompleted(payment, STEPS.PRICING, data)).toBe(true);
    expect(isSidebarStepCompleted(pricing, STEPS.PRICING, data)).toBe(false);
    expect(isSidebarStepCompleted(pricing, STEPS.SUMMARY, data)).toBe(false);
    expect(isSidebarStepCompleted(pricing, STEPS.PENDING, data)).toBe(true);
  });
});
