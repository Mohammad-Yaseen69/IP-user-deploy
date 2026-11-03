export const STEPS = {
  AMOUNT: "AMOUNT",
  BENEFICIARY: "BENEFICIARY",
  REVIEW: "REVIEW",
  OTP: "OTP",
  DONE: "DONE",
};

export const SIDEBAR_STEPS = [
  { stepName: STEPS.AMOUNT, stepLabel: "STEP 01", label: "Enter Amount" },
  {
    stepName: STEPS.BENEFICIARY,
    stepLabel: "STEP 02",
    label: "Select Beneficiary",
  },
  { stepName: STEPS.REVIEW, stepLabel: "STEP 03", label: "Review & Confirm" },
  { stepName: STEPS.DONE, stepLabel: "STEP 04", label: "Done" },
];

const ORDER = [STEPS.AMOUNT, STEPS.BENEFICIARY, STEPS.REVIEW, STEPS.OTP, STEPS.DONE];

export const transitions = {
  [STEPS.AMOUNT]: { next: () => STEPS.BENEFICIARY, back: () => null },
  [STEPS.BENEFICIARY]: { next: () => STEPS.REVIEW, back: () => STEPS.AMOUNT },
  [STEPS.REVIEW]: { next: () => STEPS.OTP, back: () => STEPS.BENEFICIARY },
  [STEPS.OTP]: { next: () => STEPS.DONE, back: () => STEPS.REVIEW },
  [STEPS.DONE]: { next: () => null, back: () => null },
};

export const goNext = (stepName, data) => {
  const transition = transitions[stepName];
  if (!transition) return { nextStep: null };
  return { nextStep: transition.next(data) };
};

export const goBack = (stepName, data) => {
  const transition = transitions[stepName];
  if (!transition) return { prevStep: null };
  return { prevStep: transition.back(data) };
};

export const getAmountNumber = (value) => {
  const amount = Number(String(value ?? "").replace(/[^\d.-]/g, ""));
  return Number.isFinite(amount) ? amount : 0;
};

export const MIN_PAYOUT_AMOUNT = 10;

const toCents = (value) => Math.round(getAmountNumber(value) * 100);
const toSpendableCents = (balance) => Math.floor(getAmountNumber(balance) * 100 + 1e-6);

export const getSpendableBalance = (availableBalance) => toSpendableCents(availableBalance) / 100;

export const getQuickAmounts = (availableBalance, percentages) => {
  const spendableCents = toSpendableCents(availableBalance);
  return percentages
    .map((percent) => ({
      percent,
      value: Math.floor((spendableCents * percent) / 100) / 100,
    }))
    .filter(({ value }) => value > 0);
};

export const getAmountError = (amount, availableBalance, cryptoCurrency = "") => {
  const value = getAmountNumber(amount);
  if (!String(amount ?? "").trim()) return "";
  if (value <= 0) return "Enter an amount greater than zero.";
  if (value < MIN_PAYOUT_AMOUNT) return `Minimum amount is ${MIN_PAYOUT_AMOUNT} ${cryptoCurrency}.`;
  if (toCents(value) > toSpendableCents(availableBalance))
    return "Amount exceeds your available balance.";
  return "";
};

export const getDisabledState = (stepName, data) => {
  switch (stepName) {
    case STEPS.AMOUNT: {
      const amount = getAmountNumber(data.amount);
      return (
        amount <= 0 || !!getAmountError(data.amount, data.availableBalance, data.cryptoCurrency)
      );
    }
    case STEPS.BENEFICIARY:
      return !data.selectedBeneficiary || !data.address || !data.protocol || data.isAddressInvalid;
    case STEPS.REVIEW:
      return !data.feeDetails?.token || !data.confirmedNetwork || !!data.isQuoteExpired;
    default:
      return false;
  }
};

export const getContinueLabel = (stepName, t) => {
  switch (stepName) {
    case STEPS.AMOUNT:
      return t("Continue");
    case STEPS.BENEFICIARY:
      return t("Get Fee Quote");
    case STEPS.REVIEW:
      return t("Confirm & Send");
    default:
      return t("Next");
  }
};

export const isSidebarStepActive = (sidebarItem, currentStep) =>
  sidebarItem.stepName === currentStep ||
  (sidebarItem.stepName === STEPS.REVIEW && currentStep === STEPS.OTP);

export const isSidebarStepCompleted = (sidebarItem, currentStep) => {
  const currentRank = ORDER.indexOf(currentStep);
  const itemRank = ORDER.indexOf(sidebarItem.stepName);
  return itemRank >= 0 && itemRank < currentRank;
};
