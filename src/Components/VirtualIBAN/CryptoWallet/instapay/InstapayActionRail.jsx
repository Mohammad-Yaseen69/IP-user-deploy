import { useState } from "react"
import { useTranslation } from "react-i18next"
import styles from "../cryptoPage.module.scss"
import SendCryptoPanel from "./SendCryptoPanel"
import ConvertCryptoPanel from "./ConvertCryptoPanel"

const TABS = ["Send", "Withdraw", "Convert"]

/**
 * Send / Withdraw / Convert for InstaPay crypto wallets. Send is the crypto payout
 * drawn in place, Convert the wallet conversion held to crypto <-> fiat; Withdraw is
 * still to come.
 */
const InstapayActionRail = ({ wallets = [], wallet, onSelectWallet }) => {
    const { t } = useTranslation()
    const [tab, setTab] = useState("Send")

    return (
        <aside className={styles.rail}>
            <div className={styles.railTabs}>
                {TABS.map((item) => (
                    <button
                        key={item}
                        type="button"
                        className={`${styles.railTab} ${tab === item ? styles.railTabActive : ""}`}
                        onClick={() => setTab(item)}
                    >
                        {t(item)}
                    </button>
                ))}
            </div>

            {tab === "Send" ? (
                <SendCryptoPanel wallets={wallets} wallet={wallet} onSelectWallet={onSelectWallet} />
            ) : tab === "Convert" ? (
                <ConvertCryptoPanel key={wallet?._id} wallet={wallet} />
            ) : (
                <div className={styles.railBody}>
                    <div className={styles.placeholder}>
                        <h5 className={styles.placeholderTitle}>{t(tab)}</h5>
                        <p className={styles.placeholderText}>{t("Coming Soon")}</p>
                    </div>
                </div>
            )}
        </aside>
    )
}

export default InstapayActionRail
