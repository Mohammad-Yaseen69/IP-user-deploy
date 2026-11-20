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

const InstapayActionRail = ({ wallets = [], wallet, onSelectWallet }) => {
  const { t } = useTranslation();
  const [tab, setTab] = useState("Send");
  const hasPermission = useEffectivePermission();
  const canWithdrawCrypto = hasPermission(PERMISSIONS.CRYPTO_WITHDRAWAL);
  const canConvert = hasPermission(PERMISSIONS.WALLET_TO_CRYPTO_CONVERSION);
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

  return (
    <aside ref={railRef} className={styles.rail}>
      <div className={styles.railTabs}>
        {TABS.map((item) => {
          if (!canWithdrawCrypto && item === "Withdraw") return;
          if (!canConvert && item === "Convert") return;
          return (
            <button
              key={item}
              type="button"
              className={`${styles.railTab} ${tab === item ? styles.railTabActive : ""}`}
              onClick={() => setTab(item)}
            >
              {t(item)}
            </button>
          );
        })}
      </div>

      {tab === "Send" ? (
        <SendCryptoPanel wallets={wallets} wallet={wallet} onSelectWallet={onSelectWallet} />
      ) : tab === "Withdraw" ? (
        <WithdrawCryptoPanel wallets={wallets} wallet={wallet} onSelectWallet={onSelectWallet} />
      ) : (
        <ConvertCryptoPanel key={wallet?._id} wallet={wallet} />
      )}
    </aside>
  );
};

export default InstapayActionRail;
