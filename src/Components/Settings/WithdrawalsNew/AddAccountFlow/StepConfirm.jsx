import { useTranslation } from "react-i18next";
import abf from "../../../VirtualIBAN/Beneficiaries/AddBeneficiaryFlowV2/AddBeneficiaryFlowV2.module.css";
import {
  Alert,
  SummaryRow,
} from "../../../VirtualIBAN/Beneficiaries/AddBeneficiaryFlowV2/components";
import {
  METHOD_LABELS,
  maskAddress,
  maskIban,
  maskNumber,
  maskPhone,
} from "../withdrawalAccounts";

const describeAccount = (method, channel, payers) => {
  const payerName = payers.find(
    (payer) => String(payer.id) === String(channel.payer_id),
  )?.name;
  switch (method) {
    case "bank_account":
      return [
        channel.bank_name || payerName,
        channel.accNumType === "IBAN"
          ? maskIban(channel.bank_iban)
          : maskNumber(channel.bank_account_number),
      ]
        .filter(Boolean)
        .join(" · ");
    case "mobile_wallet":
      return [
        payerName || channel.wallet_name,
        maskPhone(channel.wallet_account_number),
      ]
        .filter(Boolean)
        .join(" · ");
    case "cash_pickup":
      return [payerName, maskNumber(channel.document_number)]
        .filter(Boolean)
        .join(" · ");
    case "crypto_wallet":
      return `USDT · ${maskAddress(channel.wallet_address)}`;
    default:
      return "";
  }
};

const StepConfirm = ({
  method,
  country,
  channel,
  payers,
  holderName,
  address,
}) => {
  const { t } = useTranslation();
  const isCrypto = method === "crypto_wallet";

  return (
    <>
      <div className={abf.summary}>
        {!isCrypto && <SummaryRow label={t("Country")} value={country?.name} />}
        <SummaryRow
          label={t("Method")}
          value={
            isCrypto
              ? `${t(METHOD_LABELS[method])} · ${channel.network}`
              : t(METHOD_LABELS[method])
          }
        />
        <SummaryRow
          label={t("Account")}
          value={describeAccount(method, channel, payers)}
        />
        <SummaryRow label={t("Holder")} value={holderName} />
        {address && (
          <SummaryRow
            label={t("Address")}
            value={[
              address.address,
              address.city,
              address.state_name || address.province_state,
              address.postal_code,
            ]
              .filter(Boolean)
              .join(", ")}
          />
        )}
      </div>

      <Alert variant="info">
        {t(
          "Withdrawals can only go to accounts in your own name. Check the details before you add the account.",
        )}
      </Alert>
    </>
  );
};

export default StepConfirm;
