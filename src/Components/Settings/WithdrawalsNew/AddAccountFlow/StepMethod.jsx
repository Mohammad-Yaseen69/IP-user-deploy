import { useTranslation } from "react-i18next";
import abf from "../../../VirtualIBAN/Beneficiaries/AddBeneficiaryFlowV2/AddBeneficiaryFlowV2.module.css";
import {
  Alert,
  GroupHeader,
  OptionCard,
} from "../../../VirtualIBAN/Beneficiaries/AddBeneficiaryFlowV2/components";
import {
  GROUPS,
  METHOD_META,
} from "../../../VirtualIBAN/Beneficiaries/AddBeneficiaryFlowV2/constants";
import { MAX_CRYPTO_WALLETS, TRANSFER_METHODS } from "../withdrawalPayload";

const StepMethod = ({
  countryName,
  method,
  available,
  isLoading,
  error,
  usedMethods,
  cryptoCount,
  cryptoInCountry = false,
  onSelect,
}) => {
  const { t } = useTranslation();
  const cryptoFull = cryptoCount >= MAX_CRYPTO_WALLETS;
  const cryptoNote = cryptoInCountry
    ? t("Already added")
    : cryptoFull
      ? t("Limit reached")
      : undefined;

  const renderTransfer = (value) => {
    const meta = METHOD_META[value];
    const service = available.find((item) => item.value === value);
    const alreadyAdded = usedMethods.includes(value);

    const note = alreadyAdded
      ? t("Already added")
      : !service && !isLoading
        ? t("Not available")
        : undefined;

    return (
      <OptionCard
        key={value}
        icon={meta.icon}
        title={t(meta.title)}
        subtitle={t(meta.subtitle).replace("{country}", countryName)}
        timing={t(meta.timing)}
        note={note}
        disabled={!!note || isLoading}
        selected={method === value}
        onSelect={() => onSelect(value, service)}
      />
    );
  };

  return (
    <>
      {error && (
        <Alert variant="error" title={t("We could not load withdrawal methods")}>
          {t("Please go back and pick the country again.")}
        </Alert>
      )}

      <div className={abf.group}>
        <GroupHeader
          icon={GROUPS.transfer.icon}
          title={t("Money transfer")}
          subtitle={t("Local currency to a bank, wallet or cash point")}
        />
        <div className={abf.optionList}>
          {isLoading && (
            <p className={abf.optionSubtitle}>
              {t("Loading methods for {{country}}...", {
                country: countryName,
              })}
            </p>
          )}
          {TRANSFER_METHODS.map(renderTransfer)}
        </div>
      </div>

      <div className={abf.group}>
        <GroupHeader
          icon="coins"
          title={t("Crypto")}
          subtitle={t("Stablecoins to a wallet you own")}
        />
        <div className={abf.optionList}>
          <OptionCard
            icon={METHOD_META.crypto_wallet.icon}
            title={t(METHOD_META.crypto_wallet.title)}
            subtitle={t("USDT on TRON, Ethereum or BNB Smart Chain")}
            timing={t(METHOD_META.crypto_wallet.timing)}
            note={cryptoNote}
            disabled={!!cryptoNote}
            selected={method === "crypto_wallet"}
            onSelect={() => onSelect("crypto_wallet", null)}
          />
        </div>
      </div>
    </>
  );
};

export default StepMethod;
