import { useContext, useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router"
import { toast } from "react-toastify"
import { Check, Copy } from "react-feather"
import { UserContext } from "../../../../Context/UserContext"
import { usePermission } from "../../../../hooks/GeneralUse/usePermission"
import { apiWrapper } from "../../../../utils/Functions/apiWrapper"
import { handlePaymentApiError } from "../../../../utils/Functions/handlePaymentApiError"
import AccountLimits from "../../../WalletsNew/AccountLimits"
import TransactionsTable from "../../../WalletsNew/TransactionTable"
import DownloadStatement from "../../../WalletsNew/DownloadStatement"
import txStyles from "../../../TransactionsNewApi/styles/index.module.scss"
import add_funds from "../../../WalletsNew/files/top_up.svg"
import download from "../../../WalletsNew/files/down_load.svg"
import block from "../../../WalletsNew/files/block.svg"
import styles from "../cryptoPage.module.scss"
import { formatCryptoAmount, getAssetFullName, getAssetSymbol, getWalletAccentColor } from "../utils/format"
import useWalletLimits from "./useWalletLimits"
import { getWalletStatus, isWalletBlocked } from "./wallets"

/**
 * One InstaPay crypto wallet opened: the same limits, transactions and management
 * actions My Wallets gives it, laid out on this page.
 */
const InstapayWalletDetail = ({ wallet }) => {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const can = usePermission()
    const { getUserWallets, setProfileLockTime } = useContext(UserContext)

    const [copied, setCopied] = useState(false)
    const [busy, setBusy] = useState("")
    const [showStatement, setShowStatement] = useState(false)
    const [filtered, setFiltered] = useState([])

    const limits = useWalletLimits(wallet)

    const walletId = wallet?._id
    const code = wallet?.currency?.code
    const status = getWalletStatus(wallet)
    const blocked = isWalletBlocked(wallet)
    const isActive = wallet?.status === "active"
    const isDefault = !!wallet?.default
    const reserved = Number(wallet?.balance?.reserved || 0)

    useEffect(() => {
        setBusy("")
    }, [walletId])

    const copyWalletId = () => {
        if (!wallet?.wallet_id) return
        navigator.clipboard.writeText(String(wallet.wallet_id).toUpperCase())
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    /* Both switches call a wallet endpoint and then re-read the wallet list, which is
       where every other screen takes the new state from. */
    const runWalletAction = async (key, { endpoint, method }) => {
        if (!walletId || busy) return
        setBusy(key)
        try {
            /* The reply carries nothing worth reading; the wallet list is the source of truth. */
            await apiWrapper({ endpoint, method, isDecrypted: false })
            await getUserWallets?.(true)
        } catch (error) {
            handlePaymentApiError({
                error,
                navigate,
                setProfileLockTime,
                fallback: t("We cannot process your request at the moment, please try again later."),
                setError: (message) => toast.error(message),
            })
        } finally {
            setBusy("")
        }
    }

    const toggleStatus = () => runWalletAction("status", {
        endpoint: `/api/wallet/${isActive ? "deactivate" : "activate"}-wallet/${walletId}`,
        method: "GET",
    })

    const toggleBlock = () => runWalletAction("block", {
        endpoint: `/api/wallet/${wallet?.blocked ? "unblock" : "block"}-wallet-user/${walletId}`,
        method: "POST",
    })

    const defaultHint = t("This currency wallet is currently set as your default and cannot be changed. Set a different wallet as your default first.")

    return (
        <div className={styles.detailStack}>
            <div className={styles.detail}>
                <div className={styles.detailHead}>
                    <span className={styles.detailMark} style={{ background: getWalletAccentColor(code) }}>
                        {getAssetSymbol(code)}
                    </span>
                    <div>
                        <h4 className={styles.detailTitle}>
                            {code} {t(getAssetFullName(code))}
                        </h4>
                        <p className={styles.detailSub}>
                            {t("InstaPay Wallet")} • {t(status.label)}
                            {isDefault ? ` • ${t("Default")}` : ""}
                        </p>
                    </div>

                    <div className={styles.detailBalance}>
                        <div>
                            <div className={styles.balanceLabel}>{t("Wallet ID")}</div>
                            <button type="button" className={styles.walletIdBtn} onClick={copyWalletId}>
                                <span>{wallet?.wallet_id || "-"}</span>
                                {copied ? <Check size={13} /> : <Copy size={13} />}
                            </button>
                        </div>
                    </div>
                </div>

                {reserved > 0 && (
                    <div className={`${styles.notice} ${styles.noticeStale}`}>
                        <span>
                            {t("Blocked balance")}: <strong>{formatCryptoAmount(reserved)} {code}</strong>
                        </span>
                    </div>
                )}

                <div>
                    <div className={styles.sectionLabel}>{t("Wallet Management")}</div>
                    <div className={styles.manageGrid}>
                        {can("wallet.payment.topup") && (
                            <button
                                type="button"
                                className={styles.manageBtn}
                                disabled={blocked}
                                title={blocked ? t("This currency wallet is currently blocked/disabled and funds cannot be added.") : undefined}
                                onClick={() => navigate(`/add-funds?type=crypto&wallet_address=${wallet?.wallet_id}`)}
                            >
                                <img src={add_funds} alt="" />
                                {t("Add Funds")}
                            </button>
                        )}

                        {can("transactions.wallet.export") && (
                            <button
                                type="button"
                                className={styles.manageBtn}
                                disabled={blocked}
                                title={blocked ? t("This currency wallet is currently blocked/disabled and you cannot download the statement.") : undefined}
                                onClick={() => setShowStatement(true)}
                            >
                                <img src={download} alt="" />
                                {t("Download Statement")}
                            </button>
                        )}

                        {can("wallet.status.update") && (
                            <button
                                type="button"
                                className={`${styles.manageBtn} ${styles.manageBtnStatus}`}
                                disabled={isDefault || !!busy}
                                title={isDefault ? defaultHint : undefined}
                                onClick={toggleStatus}
                            >
                                {busy === "status" ? t("Updating...") : t("Wallet Status")}
                                <span className={`${styles.toggle} ${isActive ? styles.toggleOn : ""}`}>
                                    <span className={styles.toggleThumb} />
                                </span>
                            </button>
                        )}

                        {can("wallet.status.update") && (
                            <button
                                type="button"
                                className={`${styles.manageBtn} ${styles.manageBtnDanger}`}
                                disabled={isDefault || !!wallet?.admin_blocked || !!busy}
                                title={isDefault ? defaultHint : undefined}
                                onClick={toggleBlock}
                            >
                                <img src={block} alt="" />
                                {busy === "block"
                                    ? t("Updating...")
                                    : wallet?.admin_blocked
                                        ? t("Blocked By Admin")
                                        : wallet?.blocked
                                            ? t("Unblock The Wallet")
                                            : t("Block the Wallet")}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {can("wallet.limits.view") && (
                <div className={styles.detail}>
                    <div className={styles.sectionLabel}>{t("Account limits")}</div>
                    <AccountLimits
                        currentWallet={wallet}
                        data={limits.data}
                        loading={limits.loading}
                        error={limits.error}
                    />
                </div>
            )}

            {can("transactions.wallet.list") && (
                <div
                    className={`${styles.detail} ${window.innerWidth > 1000 ? txStyles.container : txStyles.mobile}`}
                    style={{ padding: 24, minHeight: 0, display: "block" }}
                >
                    {/* The table hides its desktop or mobile rows by which of these wraps it. */}
                    <TransactionsTable currentWallet={wallet} filtered={filtered} setFiltered={setFiltered} />
                </div>
            )}

            <DownloadStatement showModal={showStatement} setShowModal={setShowStatement} wallet={wallet} />
        </div>
    )
}

export default InstapayWalletDetail
