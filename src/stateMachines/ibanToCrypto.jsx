export const STEPS = {
  AMOUNT: "AMOUNT",
  REVIEW: "REVIEW",
  DONE: "DONE",
};

export const SIDEBAR_STEPS = [
  { stepName: STEPS.AMOUNT, stepLabel: "STEP 01", label: "Amount" },
  { stepName: STEPS.REVIEW, stepLabel: "STEP 02", label: "Review & Confirm" },
];

export const MIN_AMOUNT = 10;

const ORDER = [STEPS.AMOUNT, STEPS.REVIEW, STEPS.DONE];

const transitions = {
  [STEPS.AMOUNT]: { next: () => STEPS.REVIEW, back: () => null },
  [STEPS.REVIEW]: { next: () => STEPS.DONE, back: () => STEPS.AMOUNT },
  [STEPS.DONE]: { next: () => null, back: () => null },
};

export const goNext = (stepName) => ({
  nextStep: transitions[stepName]?.next() ?? null,
});

export const goBack = (stepName) => ({
  prevStep: transitions[stepName]?.back() ?? null,
});

const getAmountNumber = (amount) => {
  const value = Number(String(amount ?? "").replace(/[^\d.-]/g, ""));
  return Number.isFinite(value) ? value : 0;
};

export const getDisabledState = (stepName, data) => {
  const amount = getAmountNumber(data.amount);
  const availableBalance = getAmountNumber(data.availableBalance);

  switch (stepName) {
    case STEPS.AMOUNT:
      return (
        !data.wallet?._id ||
        !data.amount ||
        amount < MIN_AMOUNT ||
        amount > availableBalance
      );
    case STEPS.REVIEW:
      return !data.feeDetails?.token || data.quoteExpired;
    default:
      return false;
  }
};

export const getContinueLabel = (stepName, t) =>
  stepName === STEPS.REVIEW ? t("Convert") : t("Next");

export const isSidebarStepActive = (sidebarItem, currentStep) =>
  sidebarItem.stepName === currentStep;

export const isSidebarStepCompleted = (sidebarItem, currentStep) => {
  const currentRank = ORDER.indexOf(currentStep);
  const itemRank = ORDER.indexOf(sidebarItem.stepName);
  return itemRank >= 0 && itemRank < currentRank;
};
