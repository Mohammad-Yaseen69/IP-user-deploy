import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { ArrowLeft, Cpu, Plus } from "react-feather"
import AddCryptoWalletFlow from "./index"
import ActionRail from "./components/ActionRail"
import PortfolioCard from "./components/PortfolioCard"
import WalletCard from "./components/WalletCard"
import WalletDetail from "./WalletDetail"
import useCryptoWallets from "./hooks/useCryptoWallets"
import useWalletBalance from "./hooks/useWalletBalance"
import styles from "./cryptoPage.module.scss"


const CryptoStablecoins = () => {
    const { t } = useTranslation()
    const { cryptoWallets } = useCryptoWallets()

    const [showAddFlow, setShowAddFlow] = useState(false)
    const [selectedWalletId, setSelectedWalletId] = useState(null)

    const selectedWallet = cryptoWallets.find((w) => w?._id === selectedWalletId)
    const balance = useWalletBalance(selectedWallet)

    useEffect(() => {
        if (selectedWalletId && !selectedWallet) setSelectedWalletId(null)
    }, [selectedWalletId, selectedWallet])

    return (
        <div className={styles.page}>
            <div className={styles.layout}>
                <div className={styles.mainCol}>
                    <PortfolioCard
                        wallet={selectedWallet}
                        walletBalance={balance.available}
                        onSyncWallet={() => balance.refresh()}
                        syncing={balance.syncing}
                    />

                    {selectedWallet ? (
                        <section>
                            <button
                                type="button"
                                className={styles.backLink}
                                onClick={() => setSelectedWalletId(null)}
                            >
                                <ArrowLeft size={15} />
                                {t("Your accounts")}
                            </button>
                            <div style={{ marginTop: 14 }}>
                                <WalletDetail
                                    wallet={selectedWallet}
                                    pending={balance.pending}
                                    isStale={balance.isStale}
                                />
                            </div>
                        </section>
                    ) : (
                        <section>
                            <div className={styles.sectionHead}>
                                <div>
                                    <h2 className={styles.sectionTitle}>{t("Your accounts")}</h2>
                                    <p className={styles.sectionSub}>{t("Crypto wallets, virtual IBANs and card")}</p>
                                </div>
                                <button
                                    type="button"
                                    className={styles.addBtn}
                                    onClick={() => setShowAddFlow(true)}
                                >
                                    <Plus size={16} />
                                    {t("Add crypto wallet")}
                                </button>
                            </div>

                            {cryptoWallets.length === 0 ? (
                                <div className={styles.empty}>
                                    <span className={styles.emptyIcon}><Cpu size={26} /></span>
                                    <h3 className={styles.emptyTitle}>{t("No crypto wallets yet")}</h3>
                                    <p className={styles.emptyText}>
                                        {t("Add your first crypto wallet to receive USDT, ETH or BTC. Activation is a one-time charge with no recurring fee.")}
                                    </p>
                                    <button
                                        type="button"
                                        className={styles.primaryBtn}
                                        onClick={() => setShowAddFlow(true)}
                                    >
                                        {t("Add crypto wallet")}
                                    </button>
                                </div>
                            ) : (
                                <div className={styles.grid}>
                                    {cryptoWallets.map((wallet) => (
                                        <WalletCard
                                            key={wallet?._id}
                                            wallet={wallet}
                                            onOpen={(w) => setSelectedWalletId(w?._id)}
                                        />
                                    ))}
                                </div>
                            )}
                        </section>
                    )}
                </div>

                <ActionRail />
            </div>

            <AddCryptoWalletFlow
                isOpen={showAddFlow}
                toggle={() => setShowAddFlow(false)}
                startAtAsset
            />
        </div>
    )
}

export default CryptoStablecoins
