import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import styles from "../cryptoPage.module.scss";
import SendCryptoPanel from "./SendCryptoPanel";
import WithdrawCryptoPanel from "./WithdrawCryptoPanel";
import ConvertCryptoPanel from "./ConvertCryptoPanel";
import useEffectivePermission, {
  PERMISSIONS,
} from "../../../../hooks/GeneralUse/useEffectivePermission";

const TABS = ["Send", "Convert", "Withdraw"];

const InstapayActionRail = ({ wallets = [], wallet, onSelectWallet, onActionComplete }) => {
  const { t } = useTranslation();
  const [tab, setTab] = useState("Send");
  const hasPermission = useEffectivePermission();
  const canWithdrawCrypto = hasPermission(PERMISSIONS.CRYPTO_WITHDRAWAL);
  const canConvert = hasPermission(PERMISSIONS.WALLET_TO_CRYPTO_CONVERSION);
  const canSendCrypto = hasPermission(PERMISSIONS.CRYPTO_PAYOUT);
  const allowedTabs = TABS.filter(
    (item) =>
      (item !== "Send" || canSendCrypto) &&
      (item !== "Convert" || canConvert) &&
      (item !== "Withdraw" || canWithdrawCrypto),
  );
  const activeTab = allowedTabs.includes(tab) ? tab : allowedTabs[0];
  const railRef = useRef(null);

  useEffect(() => {
    const fit = () => {
      const rail = railRef.current;
      if (!rail) return;
      const top = Math.max(rail.getBoundingClientRect().top, 16);
      rail.style.setProperty("--rail-max", `${window.innerHeight - top - 16}px`);
    };
    fit();
    window.addEventListener("resize", fit);
    document.addEventListener("scroll", fit, { capture: true, passive: true });
    return () => {
      window.removeEventListener("resize", fit);
      document.removeEventListener("scroll", fit, { capture: true });
    };
  }, []);

  if (!activeTab) return null;

  return (
    <aside ref={railRef} className={styles.rail}>
      <div className={styles.railTabs}>
        {allowedTabs.map((item) => (
          <button
            key={item}
            type="button"
            className={`${styles.railTab} ${activeTab === item ? styles.railTabActive : ""}`}
            onClick={() => setTab(item)}
          >
            {t(item)}
          </button>
        ))}
      </div>

      {activeTab === "Send" ? (
        <SendCryptoPanel
          wallets={wallets}
          wallet={wallet}
          onSelectWallet={onSelectWallet}
          onActionComplete={onActionComplete}
        />
      ) : activeTab === "Withdraw" ? (
        <WithdrawCryptoPanel
          wallets={wallets}
          wallet={wallet}
          onSelectWallet={onSelectWallet}
          onActionComplete={onActionComplete}
        />
      ) : (
        <ConvertCryptoPanel key={wallet?._id} wallet={wallet} onActionComplete={onActionComplete} />
      )}
    </aside>
  );
};

export default InstapayActionRail;
