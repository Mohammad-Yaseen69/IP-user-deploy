import { useContext, useEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { ArrowLeft, Inbox, Plus } from "react-feather"
import { UserContext } from "../../../../Context/UserContext"
import { usePermission } from "../../../../hooks/GeneralUse/usePermission"
import AddCryptoWalletModal from "./AddCryptoWalletModal"
import PortfolioCard from "../components/PortfolioCard"
import styles from "../cryptoPage.module.scss"
import InstapayActionRail from "./InstapayActionRail"
import InstapayWalletCard from "./InstapayWalletCard"
import InstapayWalletDetail from "./InstapayWalletDetail"
import { getWalletAvailable, isLiveCryptoWallet } from "./wallets"

/**
 * Crypto Wallets page on InstaPay balances.
 *
 * The portfolio value sits on top, the wallets underneath, and the Send / Withdraw /
 * Convert rail on the right. Opening a wallet swaps the grid for that wallet's balance,
 * limits, transactions and management actions; the rail keeps working throughout.
 */
const InstapayCryptoWallets = () => {
    const { t } = useTranslation()
    const can = usePermission()
    const { userWallets, getUserWallets } = useContext(UserContext)

    const wallets = useMemo(() => (userWallets || []).filter(isLiveCryptoWallet), [userWallets])

    const [selectedWalletId, setSelectedWalletId] = useState(null)
    const [sendWalletId, setSendWalletId] = useState(null)
    const [showAddCurrency, setShowAddCurrency] = useState(false)

    const selectedWallet = wallets.find((w) => w?._id === selectedWalletId) || null
    const sendWallet = wallets.find((w) => w?._id === sendWalletId) || selectedWallet || wallets[0] || null

    const hasWallets = wallets.length > 0

    useEffect(() => {
        getUserWallets?.()
    }, [])

    useEffect(() => {
        if (selectedWalletId && !selectedWallet) setSelectedWalletId(null)
    }, [selectedWalletId, selectedWallet])

    const openWallet = (wallet) => {
        setSelectedWalletId(wallet?._id)
        setSendWalletId(wallet?._id)
    }

    const walletsSection = selectedWallet ? (
        <section>
            <button type="button" className={styles.backLink} onClick={() => setSelectedWalletId(null)}>
                <ArrowLeft size={15} />
                {t("My crypto wallets")}
            </button>
            <div style={{ marginTop: 14 }}>
                <InstapayWalletDetail wallet={selectedWallet} />
            </div>
        </section>
    ) : (
        <section>
            <div className={styles.sectionHead}>
                <div>
                    <h2 className={styles.sectionTitle}>{t("My crypto wallets")}</h2>
                    <p className={styles.sectionSub}>
                        {t("Hold, send and convert crypto from your InstaPay balances.")}
                    </p>
                </div>
                {hasWallets && can("wallet.currencies.add") && (
                    <button type="button" className={styles.addBtn} onClick={() => setShowAddCurrency(true)}>
                        <Plus size={16} />
                        {t("Add crypto wallet")}
                    </button>
                )}
            </div>

            {hasWallets ? (
                <div className={styles.grid}>
                    {wallets.map((wallet) => (
                        <InstapayWalletCard
                            key={wallet?._id}
                            wallet={wallet}
                            onOpen={openWallet}
                            onSend={(w) => setSendWalletId(w?._id)}
                        />
                    ))}
                </div>
            ) : (
                <div className={styles.empty}>
                    <span className={styles.emptyIcon}><Inbox size={30} /></span>
                    <h3 className={styles.emptyTitle}>{t("No crypto wallet yet")}</h3>
                    <p className={styles.emptyText}>
                        {t("Add a crypto currency to start holding, sending and converting crypto with InstaPay.")}
                    </p>
                    {can("wallet.currencies.add") && (
                        <button
                            type="button"
                            className={`${styles.addBtn} ${styles.emptyCta}`}
                            onClick={() => setShowAddCurrency(true)}
                        >
                            <Plus size={16} />
                            {t("Add crypto wallet")}
                        </button>
                    )}
                </div>
            )}
        </section>
    )

    return (
        <div className={styles.page}>
            <div className={hasWallets ? styles.layout : undefined}>
                <div className={styles.mainCol}>
                    <PortfolioCard
                        wallet={selectedWallet}
                        walletBalance={getWalletAvailable(selectedWallet)}
                    />

                    {walletsSection}
                </div>

                {hasWallets && (
                    <InstapayActionRail
                        wallets={wallets}
                        wallet={sendWallet}
                        onSelectWallet={setSendWalletId}
                    />
                )}
            </div>

            <AddCryptoWalletModal isOpen={showAddCurrency} toggle={() => setShowAddCurrency(false)} />
        </div>
    )
}

export default InstapayCryptoWallets
