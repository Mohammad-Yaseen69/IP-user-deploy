import { useTranslation } from "react-i18next"
import { FUNDING_METHODS, MOCK_WALLETS } from "../../../stateMachines/addFundsFlow"
import styles from "./addFundsModal.module.scss"

const WalletIcon = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="2" y="4" width="12" height="10" rx="1.5" stroke="#F2EEFF" strokeWidth="1.2" />
        <path d="M2 6.5H14" stroke="#F2EEFF" strokeWidth="1.2" />
        <circle cx="11.5" cy="9.5" r="1" fill="#F2EEFF" />
    </svg>
)

const CreditCardIcon = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="1.5" y="3.5" width="13" height="9" rx="1.5" stroke="#F2EEFF" strokeWidth="1.2" />
        <path d="M1.5 6.5H14.5" stroke="#F2EEFF" strokeWidth="1.2" />
        <path d="M4 9.5H7" stroke="#F2EEFF" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M4 11H5.5" stroke="#F2EEFF" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
)

const PaypalIcon = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M5.5 14L6.5 8.5H10C12 8.5 13 7 12.5 5C12 3 10.5 2 8.5 2H4.5L2.5 14H5.5Z" stroke="#F2EEFF" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M6.5 11L7 8.5H10.5C12.5 8.5 13.5 7 13 5" stroke="#F2EEFF" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
)

const MobileIcon = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="4" y="1.5" width="8" height="13" rx="1.5" stroke="#F2EEFF" strokeWidth="1.2" />
        <path d="M7 12H9" stroke="#F2EEFF" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M4 10.5H12" stroke="#F2EEFF" strokeWidth="1.2" />
    </svg>
)

const BankIcon = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M2 6.5L8 3L14 6.5" stroke="#F2EEFF" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M3.5 6.5V11" stroke="#F2EEFF" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M6.5 6.5V11" stroke="#F2EEFF" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M9.5 6.5V11" stroke="#F2EEFF" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M12.5 6.5V11" stroke="#F2EEFF" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M2 11H14" stroke="#F2EEFF" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M1.5 13H14.5" stroke="#F2EEFF" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
)

const METHOD_ICONS = {
    wallet: WalletIcon,
    credit_card: CreditCardIcon,
    paypal: PaypalIcon,
    mobile: MobileIcon,
    bank: BankIcon,
}

const MethodStep = ({
    fundingMethod,
    setFundingMethod,
    selectedWallet,
    setSelectedWallet,
}) => {
    const { t } = useTranslation()

    const showWalletSelection = fundingMethod === "instapay_wallet"

    return (
        <div>
            <div className={styles.sectionLabel}>{t("Amount to add")}</div>

            <div className={styles.methodList}>
                {FUNDING_METHODS.map((method) => {
                    const IconComponent = METHOD_ICONS[method.icon]
                    const isSelected = fundingMethod === method.id
                    return (
                        <div
                            key={method.id}
                            className={`${styles.methodOption} ${isSelected ? styles.selected : ""}`}
                            onClick={() => setFundingMethod(method.id)}
                        >
                            <div className={styles.radioBtn} />
                            <div className={styles.methodIconBox}>
                                {IconComponent && <IconComponent />}
                            </div>
                            <span className={styles.methodLabel}>
                                {t(method.label)}
                            </span>
                        </div>
                    )
                })}
            </div>

            {showWalletSelection && (
                <div className={styles.walletList}>
                    {MOCK_WALLETS.map((wallet) => {
                        const isSelected = selectedWallet === wallet.id
                        return (
                            <div
                                key={wallet.id}
                                className={`${styles.walletOption} ${isSelected ? styles.selected : ""}`}
                                onClick={() => setSelectedWallet(wallet.id)}
                            >
                                <div className={styles.walletInfo}>
                                    <div className={styles.radioBtn} />
                                    <div className={styles.walletDetails}>
                                        <h4>{wallet.name}</h4>
                                        <p>{wallet.code}</p>
                                    </div>
                                </div>
                                <div
                                    className={styles.walletCard}
                                    style={{ background: wallet.gradient }}
                                >
                                    <div className={styles.walletCardBalance}>
                                        <span className={styles.balanceLabel}>{t("Balance")}</span>
                                        <span className={styles.balanceAmount}>{wallet.balance}</span>
                                    </div>
                                    <div className={styles.walletCardLimit}>
                                        <span className={styles.limitLabel}>{t("Monthly Limit")}</span>
                                        <span className={styles.limitAmount}>{wallet.monthlyLimit}</span>
                                    </div>
                                    <div className={styles.walletLimitBar}>
                                        <div className={styles.walletLimitFill} style={{ width: "70%" }} />
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

export default MethodStep
