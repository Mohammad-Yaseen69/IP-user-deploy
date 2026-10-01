import { useState } from "react"
import { useTranslation } from "react-i18next"
import styles from "../cryptoPage.module.scss"
import SendCryptoPanel from "./SendCryptoPanel"
import WithdrawCryptoPanel from "./WithdrawCryptoPanel"
import ConvertCryptoPanel from "./ConvertCryptoPanel"

const TABS = ["Send", "Withdraw", "Convert"]

/**
 * Send / Withdraw / Convert for InstaPay crypto wallets. Send is the crypto payout
 * to a beneficiary, Withdraw the payout to the user's own saved crypto withdrawal
 * account, Convert the wallet conversion held to crypto <-> fiat.
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
            ) : tab === "Withdraw" ? (
                <WithdrawCryptoPanel wallets={wallets} wallet={wallet} onSelectWallet={onSelectWallet} />
            ) : (
                <ConvertCryptoPanel key={wallet?._id} wallet={wallet} />
            )}
        </aside>
    )
}

export default InstapayActionRail
