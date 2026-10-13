import { useTranslation } from "react-i18next";
import Callout from "../components/Callout";
import CoinMark from "../components/CoinMark";
import styles from "../cryptoWallet.module.scss";
import { CheckIcon } from "../components/icons";

const NEXT_STEPS = [
  {
    title: "Provisioning with the provider",
    text: "Your wallet request has been sent to BVNK. This usually takes a few moments.",
  },
  {
    title: "Deposit addresses generated",
    text: "A receiving address is created for every network this asset supports.",
  },
  {
    title: "Ready to receive",
    text: "The wallet switches from Pending to Active and you can start receiving funds.",
  },
];

/**
 * Final step: the initiate request succeeded and the wallet is being
 * provisioned. Replaces the old success toast.
 */
const InitiatedStep = ({ asset }) => {
  const { t } = useTranslation();

  return (
    <>
      <div className={styles.successBlock}>
        <span className={styles.successBadge}>
          <CheckIcon />
        </span>
        <h3 className={styles.successTitle}>{t("Wallet activation initiated")}</h3>
        <p className={styles.successText}>
          {t(
            "Your {{asset}} wallet is being created. It appears in your accounts right away and turns active once the provider finishes setting it up.",
            {
              asset: t(asset?.name || ""),
            },
          )}
        </p>
      </div>

      <div className={styles.summaryCard}>
        <CoinMark symbol={asset?.symbol} color={asset?.color} size="sm" />
        <div className={styles.summaryCardMain}>
          <div className={styles.summaryCardTitle}>{t(asset?.name || "")}</div>
          <p className={styles.summaryCardSub}>{asset?.networks}</p>
        </div>
        <span className={styles.statusChip}>{t("Pending")}</span>
      </div>

      <div>
        <div className={styles.timelineHeading}>{t("What happens next")}</div>
        <ol className={styles.timeline}>
          {NEXT_STEPS.map((item, index) => (
            <li className={styles.timelineItem} key={item.title}>
              <span className={styles.timelineDot}>{index + 1}</span>
              <div>
                <div className={styles.timelineTitle}>{t(item.title)}</div>
                <p className={styles.timelineText}>{t(item.text)}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <Callout>
        {t(
          "You can close this window — activation continues in the background and the wallet updates on its own.",
        )}
      </Callout>
    </>
  );
};

export default InitiatedStep;
