import { Drawer } from "@mui/material";
import { useTranslation } from "react-i18next";
import { ArrowLeft, X } from "react-feather";
import styles from "../billPayments.module.scss";
import { PAY_STEPS, usePayBillFlow } from "../hooks/usePayBillFlow";
import BillerStep from "./BillerStep";
import ConfirmStep from "./ConfirmStep";
import DoneStep from "./DoneStep";
import PaymentStep from "./PaymentStep";

const STEP_ORDER = [PAY_STEPS.BILLER, PAY_STEPS.PAYMENT, PAY_STEPS.CONFIRM];

const getHeading = (flow, t, isAdding) => {
  if (isAdding) {
    return flow.step === PAY_STEPS.PAYMENT
      ? [flow.biller?.name, t("Step 2 of 2 · Enter the account to save")]
      : [t("Add a bill"), t("Step 1 of 2 · Choose the biller")];
  }
  switch (flow.step) {
    case PAY_STEPS.PAYMENT:
      return [flow.biller?.name, t("Step 2 of 3 · Choose the bill and how to pay")];
    case PAY_STEPS.CONFIRM:
      return [t("Confirm payment"), t("Step 3 of 3 · Enter the code we sent you")];
    case PAY_STEPS.DONE:
      return [t("Done"), t("Your receipt is saved in your transactions")];
    default:
      return [t("Pay a bill"), t("Step 1 of 3 · Choose who you are paying")];
  }
};

// Mount only while open: unmounting is what resets the flow state.
const PayBillDrawer = ({
  onClose,
  countries,
  wallets,
  initialCountry,
  initialBiller,
  initialWallet,
  savedBill,
  mode,
}) => {
  const { t } = useTranslation();
  const isAdding = mode === "add";
  const flow = usePayBillFlow({
    initialCountry,
    initialBiller,
    initialWallet,
    savedBill,
    onSaved: onClose,
  });
  const steps = isAdding ? STEP_ORDER.slice(0, 2) : STEP_ORDER;

  const [title, subtitle] = getHeading(flow, t, isAdding);
  const isDone = flow.step === PAY_STEPS.DONE;
  const stepIndex = isDone ? steps.length : steps.indexOf(flow.step);
  const canGoBack = !isDone && flow.step !== PAY_STEPS.BILLER;

  return (
    <Drawer anchor="right" open onClose={onClose} PaperProps={{ className: styles.drawerPaper }}>
      <div className={styles.drawer}>
        <div className={styles.drawerHead}>
          {canGoBack && (
            <button
              type="button"
              className={styles.iconBtn}
              onClick={flow.back}
              aria-label={t("Back")}
            >
              <ArrowLeft size={16} />
            </button>
          )}
          <div className={styles.rowMain}>
            <h2>{title}</h2>
            <p>{subtitle}</p>
          </div>
          <button
            type="button"
            className={styles.iconBtn}
            onClick={onClose}
            aria-label={t("Close")}
          >
            <X size={16} />
          </button>
        </div>

        <div className={styles.progress}>
          {steps.map((step, index) => (
            <span key={step} className={index <= stepIndex ? styles.progressOn : ""} />
          ))}
        </div>

        {flow.step === PAY_STEPS.BILLER && (
          <BillerStep flow={flow} countries={countries} isAdding={isAdding} />
        )}
        {flow.step === PAY_STEPS.PAYMENT && (
          <PaymentStep flow={flow} wallets={wallets} isAdding={isAdding} />
        )}
        {flow.step === PAY_STEPS.CONFIRM && <ConfirmStep flow={flow} />}
        {isDone && <DoneStep flow={flow} onClose={onClose} />}
      </div>
    </Drawer>
  );
};

export default PayBillDrawer;
