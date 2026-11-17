import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Check, ChevronRight, Copy } from "react-feather";
import styles from "./styles/EMB.module.css";

const LEARN_MORE_URL = "https://insta-pay.ch/affiliation-program";

const EarnMoneyBanner = ({
  height,
  showLink = true,
  headSize,
  textSize,
  radius,
  minWidth,
  code = "",
  rewardsEarned = 0,
  friendsJoined = 0,
}) => {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const showStats = Boolean(code);

  const handleCopy = async () => {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
    } catch (error) {
      console.error("Copy failed:", error);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formattedRewards = Number(rewardsEarned).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <div className={styles.banner} style={{ height, minWidth, borderRadius: radius }}>
      <div className={styles.content}>
        <h2 style={{ fontSize: headSize }}>{t("Earn with the InstaPay Partner Program")}</h2>
        <p style={{ fontSize: textSize }}>
          {t(
            "Share your code. You earn a share of every fee your friends pay, paid monthly into your wallet.",
          )}
        </p>
      </div>

      <div className={styles.footer}>
        {showStats && (
          <div className={styles.stats}>
            <div>
              <span>{t("Rewards earned")}</span>
              <strong>{formattedRewards} USD</strong>
            </div>
            <div>
              <span>{t("Friends joined")}</span>
              <strong>{friendsJoined}</strong>
            </div>
          </div>
        )}

        <div className={styles.actions}>
          {showStats && (
            <div className={styles.code}>
              <span>{code}</span>
              <button type="button" onClick={handleCopy}>
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? t("Copied") : t("Copy code")}
              </button>
            </div>
          )}

          {showLink && (
            <a href={LEARN_MORE_URL} target="_blank" rel="noreferrer" className={styles.cta}>
              {t("See how it works")}
              <ChevronRight size={16} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default EarnMoneyBanner;
