import { useTranslation } from "react-i18next";
import PageHeader from "../../../Common/PageHeader";
import CryptoStablecoins from "./CryptoStablecoins";
import InstapayCryptoWallets from "./instapay/InstapayCryptoWallets";
import styles from "./cryptoPage.module.scss";

const USE_INSTAPAY_CRYPTO_WALLETS = true;

const CryptoWalletsPage = () => {
  const { t } = useTranslation();

  return (
    <div style={{ position: "relative" }} className={styles.routePage}>
      <PageHeader
        title={t("Crypto Hub")}
        subtitle={t("Create and manage your crypto hub in one place.")}
      />

      {USE_INSTAPAY_CRYPTO_WALLETS ? <InstapayCryptoWallets /> : <CryptoStablecoins />}
    </div>
  );
};

export default CryptoWalletsPage;
