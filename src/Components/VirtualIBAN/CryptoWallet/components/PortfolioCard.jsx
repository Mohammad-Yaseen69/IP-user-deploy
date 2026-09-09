import { useState } from "react"
import { useTranslation } from "react-i18next"
import { Eye, EyeOff, Layers, TrendingUp, Users } from "react-feather"
import styles from "../cryptoPage.module.scss"
import { formatCryptoAmount } from "../utils/format"

const RANGES = ["1D", "7D", "1M", "1Y"]

/**
 * Value header. Shows the whole portfolio by default, or the selected
 * wallet's balance when one is open.
 *
 * The portfolio figures and the range tabs are static — there is no
 * valuation endpoint yet. The wallet balance is real.
 */
const PortfolioCard = ({ wallet, walletBalance, onSyncWallet, syncing }) => {
    const { t } = useTranslation()
    const [range, setRange] = useState("7D")
    const [hidden, setHidden] = useState(false)

    const isWalletView = !!wallet
    const code = wallet?.currency?.code

    const label = isWalletView ? t("Wallet balance") : t("Total portfolio value")
    const currency = isWalletView ? code : "EUR"
    const value = isWalletView ? formatCryptoAmount(walletBalance) : "53,180"
    const cents = isWalletView ? "" : ".07"

    return (
        <div className={styles.portfolio}>
            <div className={styles.portfolioTop}>
                <span className={styles.portfolioLabel}>{label}</span>
                <div className={styles.rangeTabs}>
                    {RANGES.map((item) => (
                        <button
                            key={item}
                            type="button"
                            className={`${styles.rangeTab} ${range === item ? styles.rangeTabActive : ""}`}
                            onClick={() => setRange(item)}
                        >
                            {item}
                        </button>
                    ))}
                </div>
            </div>

            <div className={styles.portfolioValueRow}>
                <span className={styles.portfolioValue}>
                    {isWalletView
                        ? <>{hidden ? "••••••" : value} <span className={styles.portfolioCents}>{currency}</span></>
                        : <>{currency} {hidden ? "••••••" : value}{!hidden && <span className={styles.portfolioCents}>{cents}</span>}</>}
                </span>
                <button
                    type="button"
                    className={styles.eyeBtn}
                    onClick={() => setHidden((prev) => !prev)}
                    aria-label={hidden ? t("Show balance") : t("Hide balance")}
                >
                    {hidden ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
            </div>

            {isWalletView ? (
                <div className={styles.delta}>
                    <span>{t("Converted value shown once FX is connected.")}</span>
                </div>
            ) : (
                <div className={styles.delta}>
                    <span className={styles.deltaUp}>
                        <TrendingUp size={14} /> 2.03%
                    </span>
                    <span className={styles.deltaAmount}>+$4,499</span>
                    <span>{t("compared to last month")}</span>
                </div>
            )}

            <div className={styles.portfolioActions}>
                {isWalletView ? (
                    <button
                        type="button"
                        className={styles.chipBtn}
                        onClick={onSyncWallet}
                        disabled={syncing}
                    >
                        {syncing ? t("Syncing...") : t("Sync Balance")}
                    </button>
                ) : null}
                <button type="button" className={styles.chipBtn} disabled title={t("Coming Soon")}>
                    <Layers size={15} />
                    {t("Mass payout")}
                </button>
                <button type="button" className={styles.chipBtn} disabled title={t("Coming Soon")}>
                    <Users size={15} />
                    {t("Beneficiaries")}
                </button>
            </div>
        </div>
    )
}

export default PortfolioCard
