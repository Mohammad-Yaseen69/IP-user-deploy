import { useTranslation } from "react-i18next";
import abf from "../../../VirtualIBAN/Beneficiaries/AddBeneficiaryFlowV2/AddBeneficiaryFlowV2.module.css";
import {
  Alert,
  ContextCard,
} from "../../../VirtualIBAN/Beneficiaries/AddBeneficiaryFlowV2/components";
import { METHOD_AVATAR_ICON } from "../../../VirtualIBAN/Beneficiaries/AddBeneficiaryFlowV2/constants";
import { METHOD_LABELS } from "../withdrawalAccounts";
import AddressDetails from "./details/AddressDetails";
import BankDetails from "./details/BankDetails";
import CashDetails from "./details/CashDetails";
import CryptoDetails from "./details/CryptoDetails";
import WalletDetails from "./details/WalletDetails";

const StepDetails = ({
  method,
  country,
  holderName,
  channel,
  setChannel,
  payers,
  identifiers,
  requirementsLoading,
  requirementsError,
  takenNumbers,
  takenAddresses,
  walletError,
  onValidChange,
  onChange,
  addressFields = [],
  optionalAddress = [],
  address = {},
  onAddressChange,
}) => {
  const { t } = useTranslation();
  const isCrypto = method === "crypto_wallet";

  const renderPanel = () => {
    if (!isCrypto && requirementsLoading) {
      return <p className={abf.optionSubtitle}>{t("Loading the details this method needs...")}</p>;
    }
    if (!isCrypto && requirementsError) {
      return (
        <Alert variant="error" title={t("We could not load the required details")}>
          {t("Please pick the method again, or try another one.")}
        </Alert>
      );
    }

    switch (method) {
      case "bank_account":
        return (
          <BankDetails
            channel={channel}
            setChannel={setChannel}
            payers={payers}
            identifiers={identifiers}
            onValidChange={onValidChange}
          />
        );
      case "mobile_wallet":
        return (
          <WalletDetails
            channel={channel}
            setChannel={setChannel}
            payers={payers}
            country={country}
            takenNumbers={takenNumbers}
            error={walletError}
            onValidChange={onValidChange}
          />
        );
      case "cash_pickup":
        return (
          <CashDetails
            channel={channel}
            setChannel={setChannel}
            payers={payers}
            identifiers={identifiers}
            onValidChange={onValidChange}
          />
        );
      case "crypto_wallet":
        return (
          <CryptoDetails
            channel={channel}
            setChannel={setChannel}
            takenAddresses={takenAddresses}
            onValidChange={onValidChange}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      <ContextCard
        icon={METHOD_AVATAR_ICON[method]}
        name={
          isCrypto
            ? t(METHOD_LABELS[method])
            : `${country?.name ?? ""} · ${t(METHOD_LABELS[method])}`
        }
        meta={
          isCrypto
            ? t("Paid out in USDT · Owner: {{name}}", { name: holderName })
            : t("In your name: {{name}}", { name: holderName })
        }
        actionLabel={onChange ? t("Change") : undefined}
        onAction={onChange}
      />
      {renderPanel()}
      {!isCrypto && !requirementsLoading && !requirementsError && (
        <AddressDetails
          names={addressFields}
          optional={optionalAddress}
          values={address}
          onChange={onAddressChange}
          country={country}
        />
      )}
    </>
  );
};

export default StepDetails;
