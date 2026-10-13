/**
 * International Payment Flow — Custom State Machine
 *
 * ─── How to add a new step ──────────────────────────────────────────────────
 *  1. Add its key to STEPS.
 *  2. Add its entry to `transitions` (next, back, showBack, onNext, onBack).
 *  3. Update the `next` of the step BEFORE it and the `back` of the step AFTER it.
 *  4. Add its disabled-button validation to `getDisabledState`.
 *  5. Map it to a legacy subStep number in `stepToSubStep` (for anything still
 *     reading the old numeric step outside this machine).
 * ────────────────────────────────────────────────────────────────────────────
 */

// ─── Step name constants ──────────────────────────────────────────────────────

export const STEPS = {
  /** Pick Individual vs Business recipient type */
  TRANSACTION_TYPE: "TRANSACTION_TYPE",

  /** Pick sending account type — only shown when isThirdPartyAllowed */
  SENDING_TYPE: "SENDING_TYPE",

  /** Amount input + destination country + payout channel + payer */
  AMOUNT_DETAILS: "AMOUNT_DETAILS",

  /** Select or search for a saved beneficiary */
  BENEFICIARY: "BENEFICIARY",

  /** Purpose of remittance + optional reference comment */
  PURPOSE: "PURPOSE",

  /** Select funding source: wallet / card / PayPal / mobile wallet */
  PAYMENT_METHOD: "PAYMENT_METHOD",

  /** Card number / expiry / CVC — only shown when payment_type === "card" */
  CARD_DETAILS: "CARD_DETAILS",

  /** Final review screen before transaction is created */
  REVIEW: "REVIEW",

  /** Success receipt screen */
  SUCCESS: "SUCCESS",
};

// ─── Ordered list (useful for progress bars / step indicators) ────────────────

export const STEP_ORDER = [
  STEPS.TRANSACTION_TYPE,
  STEPS.SENDING_TYPE,
  STEPS.AMOUNT_DETAILS,
  STEPS.BENEFICIARY,
  STEPS.PURPOSE,
  STEPS.PAYMENT_METHOD,
  STEPS.CARD_DETAILS,
  STEPS.REVIEW,
  STEPS.SUCCESS,
];

// ─── Transitions ─────────────────────────────────────────────────────────────
//
// Each entry has:
//   next(data)     → STEPS key | null   — Where NEXT goes (null = triggers submit)
//   back(data)     → STEPS key | null   — Where BACK goes (null = exits the flow)
//   showBack(data) → boolean            — Whether the Back button renders at all
//   onNext(data)   → SideEffect         — Data changes applied when moving forward
//   onBack(data)   → SideEffect         — Data changes applied when moving backward
//
// SideEffect shape:
//   { updates: { field: value, ... } }  — dispatch individual field updates
//   { reset: true }                     — dispatch RESET_FIRST_STEP_DATA (full reset)
// ─────────────────────────────────────────────────────────────────────────────

export const transitions = {
  [STEPS.TRANSACTION_TYPE]: {
    next: (data) =>
      data.isThirdPartyAllowed ? STEPS.SENDING_TYPE : STEPS.AMOUNT_DETAILS,

    back: () => null, // null = exit the international flow entirely

    showBack: () => false,

    onNext: (data) => ({
      updates: {
        isRecipientTypeSelected: true,
        // If 3rd party is NOT allowed we skip sending type, so mark
        // transactionTypeSelected immediately so StepOne renders the form.
        ...(!data.isThirdPartyAllowed ? { transactionTypeSelected: true } : {}),
      },
    }),

    onBack: () => ({ updates: {} }),
  },

  // ─────────────────────────────────────────────────────────────────────────

  [STEPS.SENDING_TYPE]: {
    next: () => STEPS.AMOUNT_DETAILS,

    back: () => STEPS.TRANSACTION_TYPE,

    showBack: () => true,

    onNext: () => ({
      updates: {
        isSendingTypeSelected: true,
        transactionTypeSelected: true,
      },
    }),

    onBack: () => ({
      updates: {
        // Un-select recipient type so StepOne renders TransactionTypeSelection
        isRecipientTypeSelected: false,
      },
    }),
  },

  // ─────────────────────────────────────────────────────────────────────────

  [STEPS.AMOUNT_DETAILS]: {
    next: () => STEPS.BENEFICIARY,

    back: (data) =>
      data.isThirdPartyAllowed ? STEPS.SENDING_TYPE : STEPS.TRANSACTION_TYPE,

    showBack: () => true,

    onNext: () => ({ updates: {} }),

    onBack: (data) => {
      if (data.isThirdPartyAllowed) {
        // Step back to SendingTypeSelection — only clear what sending type set
        return {
          updates: {
            transactionTypeSelected: false,
            isSendingTypeSelected: false,
          },
        };
      }
      // Step back to TransactionTypeSelection — full state reset
      return { reset: true };
    },
  },

  // ─────────────────────────────────────────────────────────────────────────

  [STEPS.BENEFICIARY]: {
    next: () => STEPS.PURPOSE,
    back: () => STEPS.AMOUNT_DETAILS,
    showBack: () => true,
    onNext: () => ({ updates: {} }),
    onBack: () => ({ updates: {} }),
  },

  // ─────────────────────────────────────────────────────────────────────────

  [STEPS.PURPOSE]: {
    next: () => STEPS.PAYMENT_METHOD,
    back: () => STEPS.BENEFICIARY,
    showBack: () => true,
    onNext: () => ({ updates: {} }),
    onBack: () => ({ updates: {} }),
  },

  // ─────────────────────────────────────────────────────────────────────────

  [STEPS.PAYMENT_METHOD]: {
    next: (data) =>
      data.payment_type?.value === "card" ? STEPS.CARD_DETAILS : STEPS.REVIEW,

    back: () => STEPS.PURPOSE,

    showBack: () => true,

    onNext: () => ({ updates: {} }),

    // Clearing payment_type when going back mirrors the existing behaviour
    onBack: () => ({
      updates: { payment_type: {} },
    }),
  },

  // ─────────────────────────────────────────────────────────────────────────

  [STEPS.CARD_DETAILS]: {
    next: () => STEPS.REVIEW,
    back: () => STEPS.PAYMENT_METHOD,
    showBack: () => true,

    onNext: () => ({
      updates: { showCard: true },
    }),

    onBack: () => ({
      updates: { payment_type: {}, showCard: false },
    }),
  },

  // ─────────────────────────────────────────────────────────────────────────

  [STEPS.REVIEW]: {
    // null = this is the submit step — triggers createTransaction() in the component
    next: () => null,

    back: (data) =>
      data.payment_type?.value === "card"
        ? STEPS.CARD_DETAILS
        : STEPS.PAYMENT_METHOD,

    showBack: () => true,

    onNext: () => ({ updates: {} }),

    onBack: () => ({ updates: {} }),
  },

  // ─────────────────────────────────────────────────────────────────────────

  [STEPS.SUCCESS]: {
    next: () => null,
    back: () => null,
    showBack: () => false,
    onNext: () => ({ updates: {} }),
    onBack: () => ({ updates: {} }),
  },
};

// ─── Disabled button logic ────────────────────────────────────────────────────
//
// Returns true when the Next / Continue button should be disabled.
//
// @param {string} step         - Current STEPS key
// @param {object} data         - internationalData from reducer
// @param {object} extras       - Runtime values not in the reducer
//   @param {boolean} extras.vendorBalanceLoading
//   @param {object}  extras.userDetails
// ─────────────────────────────────────────────────────────────────────────────

export const getDisabledState = (step, data, extras = {}) => {
  const { vendorBalanceLoading = false, userDetails = {} } = extras;

  switch (step) {
    case STEPS.TRANSACTION_TYPE:
      return !data.transactionType;

    case STEPS.SENDING_TYPE:
      return !data.sendingType;

    case STEPS.AMOUNT_DETAILS: {
      // KYC/KYB gate — if not verified the button is ENABLED but shows a
      // different label ("Identity verification required"). Let the component
      // handle the redirect; do not block the button here.
      const kycApproved =
        userDetails?.account_type === "individual"
          ? userDetails?.user?.kyc_status === "approved"
          : userDetails?.company?.kyb_status === "approved";

      if (!kycApproved) return false;

      return (
        !data.amount ||
        Number(String(data.amount)?.replaceAll(",", "")) < 1 ||
        !data.currency ||
        !data.currency_wallet?.currency?.code ||
        !data.country?.name ||
        !data.payoutChannel?.name ||
        !data.payer?.name ||
        !!data.error ||
        !!data.exchange_rate_error ||
        !(data.exchange_rate?.receiver?.amount > 0) ||
        vendorBalanceLoading
      );
    }

    case STEPS.BENEFICIARY:
      return !data.beneficiary?._id;

    case STEPS.PURPOSE:
      return !data.reason || data.reason.length < 1;

    case STEPS.PAYMENT_METHOD:
      return (
        !data.payment_type?.value ||
        (data.payment_type?.value === "wallet" && !data.wallet?._id) ||
        !!data.ex_extra_error
      );

    case STEPS.CARD_DETAILS: {
      // If a saved card is selected, no manual entry needed
      if (data.selectedSavedCard?._id) return false;

      const [mm, yy] = (data.expiry || "/").split("/").map(Number);
      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear() % 100;
      const isValidExpiry =
        yy > currentYear || (yy === currentYear && mm > currentMonth);

      return (
        !data.cardNumber ||
        !data.expiry ||
        !isValidExpiry ||
        !data.cvc ||
        data.cvc?.length < 3 ||
        !data.cardHolderName
      );
    }

    case STEPS.REVIEW:
    case STEPS.SUCCESS:
      return false;

    default:
      return false;
  }
};

// ─── Legacy subStep mapping ───────────────────────────────────────────────────
//
// Maps the new named step to the old numeric subStep that parts of the UI
// still reference (e.g. the SelectedCard sidebar, ServiceDetails, etc.).
// Remove entries here once those components are migrated.
// ─────────────────────────────────────────────────────────────────────────────

export const stepToSubStep = {
  [STEPS.TRANSACTION_TYPE]: 1,
  [STEPS.SENDING_TYPE]: 1,
  [STEPS.AMOUNT_DETAILS]: 1,
  [STEPS.BENEFICIARY]: 2,
  [STEPS.PURPOSE]: 3,
  [STEPS.PAYMENT_METHOD]: 4,
  [STEPS.CARD_DETAILS]: 5,
  [STEPS.REVIEW]: 6,
  [STEPS.SUCCESS]: 7,
};

// ─── Helper: is this the submit step? ────────────────────────────────────────

export const isSubmitStep = (step) => step === STEPS.REVIEW;

// ─── Helper: is the back button visible? ─────────────────────────────────────

export const showBackButton = (step, data) =>
  transitions[step]?.showBack(data) ?? false;

// ─── Primary navigation helpers ──────────────────────────────────────────────

/**
 * Call when the user presses Next.
 *
 * Returns:
 *   nextStep   — the STEPS key to move to, or null (= submit / exit)
 *   sideEffects — { updates, reset } to apply to the reducer
 */
export const goNext = (currentStep, data) => {
  const t = transitions[currentStep];
  if (!t) return { nextStep: null, sideEffects: { updates: {} } };
  return {
    nextStep: t.next(data),
    sideEffects: t.onNext(data),
  };
};

/**
 * Call when the user presses Back.
 *
 * Returns:
 *   prevStep   — the STEPS key to move to, or null (= exit the flow)
 *   sideEffects — { updates, reset } to apply to the reducer
 */
export const goBack = (currentStep, data) => {
  const t = transitions[currentStep];
  if (!t) return { prevStep: null, sideEffects: { updates: {} } };
  return {
    prevStep: t.back(data),
    sideEffects: t.onBack(data),
  };
};

// ─── Usage example (in index.jsx) ────────────────────────────────────────────
//
//  import { STEPS, goNext, goBack, getDisabledState, showBackButton,
//           stepToSubStep, isSubmitStep } from "../../stateMachines/international"
//
//  const [currentStep, setCurrentStep] = useState(STEPS.TRANSACTION_TYPE)
//
//  // Sync legacy subStep for components that still use it
//  useEffect(() => {
//      setSubStep(stepToSubStep[currentStep])
//  }, [currentStep])
//
//  const handleNext = () => {
//      const { nextStep, sideEffects } = goNext(currentStep, internationalData)
//      if (sideEffects.reset) dispatch({ type: "RESET_FIRST_STEP_DATA" })
//      else Object.entries(sideEffects.updates).forEach(([k, v]) => updateInternationalData(k, v))
//
//      if (nextStep === null) {
//          if (isSubmitStep(currentStep)) createTransaction("", false)
//      } else {
//          setCurrentStep(nextStep)
//      }
//  }
//
//  const handleBack = () => {
//      const { prevStep, sideEffects } = goBack(currentStep, internationalData)
//      if (sideEffects.reset) dispatch({ type: "RESET_FIRST_STEP_DATA" })
//      else Object.entries(sideEffects.updates).forEach(([k, v]) => updateInternationalData(k, v))
//
//      if (prevStep === null) setStep(0)   // exit international flow
//      else setCurrentStep(prevStep)
//  }
//
//  const disabled = getDisabledState(currentStep, internationalData, {
//      vendorBalanceLoading,
//      userDetails,
//  })
//
//  const showBack = showBackButton(currentStep, internationalData)
// ─────────────────────────────────────────────────────────────────────────────
