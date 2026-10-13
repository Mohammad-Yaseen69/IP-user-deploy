import { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { AlertTriangle, Clock } from "react-feather";
import { toast } from "react-toastify";
import { UserContext } from "../../../../Context/UserContext";
import {
  createCryptoWalletChannel,
  getWalletNetworks,
} from "../api/cryptoWallets";
import styles from "../cryptoPage.module.scss";
import {
  formatCryptoAmount,
  getAssetFullName,
  getWalletAccentColor,
} from "../utils/format";
import DepositAddress from "./DepositAddress";
import NetworkSelector from "./NetworkSelector";

/**
 * Networks and deposit address for one crypto wallet.
 * The balance itself lives in the value header above the page.
 */
const WalletDetail = ({ wallet, pending = 0, isStale = false }) => {
  const { t } = useTranslation();
  const { getUserWallets } = useContext(UserContext);

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [generating, setGenerating] = useState(false);

  const walletId = wallet?._id;
  const code = wallet?.currency?.code;
  const isPending = wallet?.status === "pending";
  const isActive = wallet?.status === "active";

  const networks = getWalletNetworks(wallet);
  const currentNetwork = networks[selectedIndex] || networks[0];

  useEffect(() => {
    setSelectedIndex(0);
  }, [walletId]);

  const generateChannel = async () => {
    if (!walletId) return;
    setGenerating(true);
    try {
      const res = await createCryptoWalletChannel(walletId);
      if (res?.status) {
        toast.success(t("Deposit channel created successfully."));
        getUserWallets?.();
      }
    } catch {
      toast.error(
        t("Failed to create deposit channel. Please try again later."),
      );
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className={styles.detail}>
      <div className={styles.detailHead}>
        <span
          className={styles.detailMark}
          style={{ background: getWalletAccentColor(code) }}
        >
          {code}
        </span>
        <div>
          <h4 className={styles.detailTitle}>
            {code} {t(getAssetFullName(code))}
          </h4>
          <p className={styles.detailSub}>
            {t("Custodial BVNK Wallet")} •{" "}
            {isActive ? t("Active") : t("Pending")}
          </p>
        </div>

        {Number(pending) > 0 ? (
          <div className={styles.detailBalance}>
            <div>
              <div className={styles.balanceLabel}>{t("Pending")}</div>
              <div
                className={styles.pendingAmount}
                style={{ textAlign: "right", marginTop: 2 }}
              >
                + {formatCryptoAmount(pending)} {code}
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {isStale ? (
        <div className={`${styles.notice} ${styles.noticeStale}`}>
          <AlertTriangle size={16} style={{ flexShrink: 0 }} />
          <span>
            {t(
              "Live balance check temporarily delayed. Showing latest cached balance.",
            )}
          </span>
        </div>
      ) : null}

      {isPending ? (
        <div className={styles.placeholder}>
          <span className={styles.placeholderIcon}>
            <Clock size={28} />
          </span>
          <h5 className={styles.placeholderTitle}>
            {t("Wallet Activation in Progress")}
          </h5>
          <p className={styles.placeholderText}>
            {t(
              "Your custodial crypto wallet request has been submitted to BVNK. It is currently being provisioned. Once approved, your deposit addresses and networks will automatically appear here.",
            )}
          </p>
        </div>
      ) : networks.length === 0 ? (
        <div className={styles.placeholder}>
          <p className={styles.placeholderText}>
            {t("No deposit channels generated yet for this wallet.")}
          </p>
          <button
            type="button"
            className={styles.primaryBtn}
            onClick={generateChannel}
            disabled={generating}
          >
            {generating ? t("Generating...") : t("Generate Deposit Channel")}
          </button>
        </div>
      ) : (
        <>
          <NetworkSelector
            networks={networks}
            selectedIndex={selectedIndex}
            onSelect={setSelectedIndex}
          />
          <DepositAddress currencyCode={code} network={currentNetwork} />
        </>
      )}
    </div>
  );
};

export default WalletDetail;
