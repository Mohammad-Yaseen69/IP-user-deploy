import { useContext, useState } from "react"
import { useTranslation } from "react-i18next"
import { Eye, EyeOff, Layers, TrendingUp, Users } from "react-feather"
import styles from "../cryptoPage.module.scss"
import { formatCryptoAmount } from "../utils/format"
import { useQuery } from "@tanstack/react-query"
import { apiWrapper } from "../../../../utils/Functions/apiWrapper"
import { UserContext } from "../../../../Context/UserContext"
import { formatCurrency } from "../../../../Helper/AmountFormat"


const PortfolioCard = ({ wallet, walletBalance, onSyncWallet, syncing }) => {
    const { t } = useTranslation()
    const [hidden, setHidden] = useState(false)
    const { userDetails } = useContext(UserContext)

    const isWalletView = !!wallet
    const code = wallet?.currency?.code

    const { data, isLoading } = useQuery({
        queryKey: ["crypto", "portfolio"],
        queryFn: () => apiWrapper({
            endpoint: `/api/wallet/get-crypto-balance/${userDetails?._id}?currency=USD`,
            isDecrypted: true,
        }).then(dec => dec?.data)
    })



    const label = isWalletView ? t("Wallet balance") : t("Total crypto portfolio value")
    const currency = isWalletView ? code : "USD"
    const value = isWalletView ? formatCryptoAmount(walletBalance) : formatCurrency(data?.total, true, false)




    return (
        <div className={styles.portfolio}>
            <div className={styles.portfolioTop}>
                <span className={styles.portfolioLabel}>{label}</span>
            </div>

            <div className={styles.portfolioValueRow}>
                <span className={styles.portfolioValue}>
                    {isLoading ? <>
                        <span style={{fontSize: "25px"}}>
                            {t("Loading Balance...")}
                        </span>
                    </> : <>
                        {isWalletView
                            ? <>{hidden ? "••••••" : value} <span className={styles.portfolioCents}>{currency}</span></>
                            : <>{currency} {hidden ? "••••••" : value}</>}
                    </>
                    }
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

            {isWalletView && onSyncWallet && (
                <div className={styles.delta}>
                    <span>{t("Converted value shown once FX is connected.")}</span>
                </div>
            )}

            <div className={styles.portfolioActions}>
                {isWalletView && onSyncWallet ? (
                    <button
                        type="button"
                        className={styles.chipBtn}
                        onClick={onSyncWallet}
                        disabled={syncing}
                    >
                        {syncing ? t("Syncing...") : t("Sync Balance")}
                    </button>
                ) : null}
                {/* <button type="button" className={styles.chipBtn} disabled title={t("Coming Soon")}>
                    <Layers size={15} />
                    {t("Mass payout")}
                </button>
                <button type="button" className={styles.chipBtn} disabled title={t("Coming Soon")}>
                    <Users size={15} />
                    {t("Beneficiaries")}
                </button> */}
            </div>
        </div>
    )
}

export default PortfolioCard
