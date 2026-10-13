import { useTranslation } from "react-i18next";
import Callout from "../components/Callout";
import OptionRow from "../components/OptionRow";
import { BankIcon, WalletIcon } from "../components/icons";
import { ACCOUNT_TYPES } from "../data/cryptoWalletOptions";
import styles from "../cryptoWallet.module.scss";

const LEADING_ICONS = {
  bank: BankIcon,
  wallet: WalletIcon,
};

const AddAccountStep = ({ accountType, onSelect }) => {
  const { t } = useTranslation();

  return (
    <>
      <div
        className={styles.optionList}
        role="radiogroup"
        aria-label={t("Account type")}
      >
        {ACCOUNT_TYPES.map((option) => {
          const Icon = LEADING_ICONS[option.icon];
          return (
            <OptionRow
              key={option.id}
              leading={
                <span className={styles.iconTile}>
                  <Icon />
                </span>
              }
              title={t(option.title)}
              description={t(option.description)}
              price={t(option.price)}
              priceNote={t(option.priceNote)}
              selected={accountType === option.id}
              onSelect={() => onSelect(option.id)}
            />
          );
        })}
      </div>

      <Callout>
        {t(
          "Crypto wallets are charged once at activation. There is no monthly or recurring fee.",
        )}
      </Callout>
    </>
  );
};

export default AddAccountStep;
