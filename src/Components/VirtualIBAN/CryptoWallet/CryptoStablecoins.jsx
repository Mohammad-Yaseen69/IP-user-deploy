import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Inbox, Plus } from "react-feather";
import AddCryptoWalletFlow from "./index";
import ActionRail from "./components/ActionRail";
import PortfolioCard from "./components/PortfolioCard";
import WalletCard from "./components/WalletCard";
import WalletDetail from "./WalletDetail";
import useCryptoWallets from "./hooks/useCryptoWallets";
import useWalletBalance from "./hooks/useWalletBalance";
import styles from "./cryptoPage.module.scss";

/**
 * Crypto & Stablecoins page.
 *
 * With no wallets it is the single-column "No crypto wallet yet" default
 * screen; once a wallet exists the accounts grid and the Send/Request/Convert
 * rail appear.
 */
const CryptoStablecoins = () => {
  const { t } = useTranslation();
  const { cryptoWallets } = useCryptoWallets();

  const [showAddFlow, setShowAddFlow] = useState(false);
  const [selectedWalletId, setSelectedWalletId] = useState(null);

  const selectedWallet = cryptoWallets.find((w) => w?._id === selectedWalletId);
  const balance = useWalletBalance(selectedWallet);

  const hasWallets = cryptoWallets.length > 0;

  useEffect(() => {
    if (selectedWalletId && !selectedWallet) setSelectedWalletId(null);
  }, [selectedWalletId, selectedWallet]);

  const walletsSection = selectedWallet ? (
    <section>
      <button
        type="button"
        className={styles.backLink}
        onClick={() => setSelectedWalletId(null)}
      >
        <ArrowLeft size={15} />
        {t("Your crypto wallets")}
      </button>
      <div style={{ marginTop: 14 }}>
        <WalletDetail
          wallet={selectedWallet}
          pending={balance.pending}
          isStale={balance.isStale}
        />
      </div>
    </section>
  ) : (
    <section>
      <div className={styles.sectionHead}>
        <div>
          <h2 className={styles.sectionTitle}>{t("Your crypto wallets")}</h2>
          <p className={styles.sectionSub}>
            {t("Hold, receive and manage crypto across supported networks.")}
          </p>
        </div>
        {hasWallets && (
          <button
            type="button"
            className={styles.addBtn}
            onClick={() => setShowAddFlow(true)}
          >
            <Plus size={16} />
            {t("Add crypto wallet")}
          </button>
        )}
      </div>

      {hasWallets ? (
        <div className={styles.grid}>
          {cryptoWallets.map((wallet) => (
            <WalletCard
              key={wallet?._id}
              wallet={wallet}
              onOpen={(w) => setSelectedWalletId(w?._id)}
            />
          ))}
        </div>
      ) : (
        <div className={styles.empty}>
          <span className={styles.emptyIcon}>
            <Inbox size={30} />
          </span>
          <h3 className={styles.emptyTitle}>{t("No crypto wallet yet")}</h3>
          <p className={styles.emptyText}>
            {t(
              "Add your first crypto wallet to start holding, receiving and converting crypto with InstaPay.",
            )}
          </p>
          <button
            type="button"
            className={`${styles.addBtn} ${styles.emptyCta}`}
            onClick={() => setShowAddFlow(true)}
          >
            <Plus size={16} />
            {t("Add crypto wallet")}
          </button>
        </div>
      )}
    </section>
  );

  return (
    <div className={styles.page}>
      <div className={hasWallets ? styles.layout : undefined}>
        <div className={styles.mainCol}>
          <PortfolioCard
            wallet={selectedWallet}
            walletBalance={balance.available}
            onSyncWallet={() => balance.refresh()}
            syncing={balance.syncing}
          />

          {walletsSection}
        </div>

        {hasWallets && <ActionRail />}
      </div>

      <AddCryptoWalletFlow
        isOpen={showAddFlow}
        toggle={() => setShowAddFlow(false)}
        startAtAsset
      />
    </div>
  );
};

export default CryptoStablecoins;
