import { useTranslation } from "react-i18next";
import styles from "../billPayments.module.scss";
import OtpVerification from "../../../Common/Component/OtpVerification";
import { formatWalletAmount } from "../../VirtualIBAN/CryptoWallet/instapay/wallets";
import { getPaymentMethod } from "../data/paymentMethods";
import { PAY_STEPS } from "../hooks/usePayBillFlow";

const money = (amount) => `${formatWalletAmount(amount?.value)} ${amount?.currency || ""}`;

const ConfirmStep = ({ flow }) => {
  const { t } = useTranslation();
  const { quote, identifiers, requiredFields } = flow;

  const rows = [
    [t("Biller"), flow.biller?.name],
    [t("Bill"), quote?.product?.name],
    requiredFields.includes("account_number") && [t("Account"), identifiers.account_number],
    requiredFields.includes("mobile_number") && [t("Mobile"), `+${identifiers.mobile_number}`],
    [
      t("Paying from"),
      flow.isIban
        ? `${t(getPaymentMethod(flow.paymentMethodId)?.title)} · ${flow.iban?.currency} ·· ${String(flow.iban?.iban || "").slice(-4)}`
        : `${t(getPaymentMethod(flow.paymentMethodId)?.title)} · ${flow.wallet?.currency?.code}`,
    ],
    identifiers.statement_reference && [t("Bill reference"), identifiers.statement_reference],
    quote?.bill_amount && [t("Biller receives"), money(quote.bill_amount)],
    [t("Bill amount"), money(quote?.sending)],
    [t("Fee"), money(quote?.fee)],
    [t("Total"), money(quote?.total)],
  ].filter(Boolean);

  return (
    <div className={styles.drawerBody}>
      <div className={styles.summary}>
        {rows.map(([label, value]) => (
          <div className={styles.summaryRow} key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>

      <OtpVerification
        variant="buttons"
        methods={flow.otpMethods}
        setter={flow.setStep}
        setterValue={PAY_STEPS.DONE}
        hideOtp={() => {}}
        onCancel={flow.back}
        callback={flow.confirmPayment}
        processing={flow.isConfirming}
        resendHandler={flow.requestOtp}
        authType={flow.authType}
        setAuthType={flow.setAuthType}
      />
    </div>
  );
};

export default ConfirmStep;
