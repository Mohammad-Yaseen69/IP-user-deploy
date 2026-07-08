import { ArrowLeft, ChevronDown, Copy, CreditCard, RefreshCcw } from "react-feather";
import Magicsvg from "../magicsvg";
import styles from "../style/ActivateAccount.module.css";

const paymentMethods = [
    {
        id: "bank",
        title: "Bank transfer",
        subtitle: "SEPA | SWIFT",
    },
    {
        id: "card",
        title: "Card",
        subtitle: "Visa | Mastercard",
    },
    {
        id: "openbanking",
        title: "Open banking",
        subtitle: "Plaid",
    },
    {
        id: "crypto",
        title: "Crypto",
        subtitle: "USDC / USDT",
    },
];

const ActivateAccount = ({ onBack, onNext, t }) => {
    return (
        <div className={styles.onboardingLayout}>
            <div className={styles.mainArea}>
                <div className={styles.header}>
                    <div className={styles.headerTitle}>
                        <div className={styles.cont}>
                            <Magicsvg />
                        </div>

                        <h2>{t("Activate your account")}</h2>
                    </div>

                    <p>
                        {t(
                            "Pay the one-off IBAN activation fee to generate your IBAN, choose how you'd like to pay."
                        )}
                    </p>
                </div>

                <div className={styles.paymentMethods}>
                    {paymentMethods.map((item) => (
                        <button
                            key={item.id}
                            className={`${styles.paymentCard} ${item.id === "crypto" ? styles.activePayment : ""
                                }`}
                        >
                            <div className={styles.paymentIcon}>
                                <CreditCard size={16} />
                            </div>

                            <div style={{
                                textAlign: "start",
                            }}>
                                <h5>{t(item.title)}</h5>
                                <span>{t(item.subtitle)}</span>
                            </div>
                        </button>
                    ))}
                </div>

                <div className={styles.summary}>
                    <div className={styles.summaryRow}>
                        <span>{t("IBAN activation fee")}</span>
                        <strong>€500.00</strong>
                    </div>

                    <div className={styles.summaryRow}>
                        <span>{t("IBAN monthly fee")}</span>
                        <strong>$120 - billed after activation</strong>
                    </div>
                </div>

                <div className={styles.dueCard}>
                    <span>{t("Due today")}</span>

                    <h3>€500.00</h3>
                </div>

                <div className={styles.paymentSection}>
                    <div className={styles.leftSide}>
                        <label>{t("ASSET")}</label>

                        <div className={styles.assetSelector}>
                            <button className={`${styles.assetCard} ${styles.activeAsset}`}>
                                <div className={styles.assetIcon}>🟦</div>

                                <div>
                                    <h5>USDC</h5>
                                    <span>USD Coin</span>
                                </div>
                            </button>

                            <button className={styles.assetCard}>
                                <div className={styles.assetIcon}>🟩</div>

                                <div>
                                    <h5>USDT</h5>
                                    <span>Tether</span>
                                </div>
                            </button>
                        </div>

                        <label>{t("NETWORK")}</label>

                        <button className={styles.networkSelector}>
                            <span>Ethereum (ERC-20)</span>

                            <ChevronDown size={18} />
                        </button>

                        <div className={styles.infoRows}>
                            <div className={styles.infoRow}>
                                <span>{t("Activation fee")}</span>

                                <strong>€500.00</strong>
                            </div>

                            <div className={styles.infoRow}>
                                <span>{t("Send exactly")}</span>

                                <strong className={styles.purple}>43.00 USDC</strong>
                            </div>
                        </div>

                        <div className={styles.warning}>
                            <span>⚠</span>

                            <p>
                                {t(
                                    "Send only USDC on the selected network. Wrong-network transfers cannot be recovered."
                                )}
                            </p>
                        </div>
                    </div>

                    <div className={styles.rightSide}>
                        <div className={styles.qrCard}>
                            <div className={styles.qrBox}></div>


                            <label>{t("DEPOSIT ADDRESS")}</label>
                            <div className={styles.addressBox}>
                                <span>
                                    0xF3F2A91AEfE45ECd11352af709f6a744c2458eB91
                                </span>

                                <button>
                                    <Copy size={14} />
                                </button>
                            </div>


                        </div>
                        <div className={styles.awaiting}>
                            <div className={styles.dot}>
                                <RefreshCcw size={20} />
                            </div>

                            <span>{t("Awaiting network confirmation")}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.navigationFooter}>
                <button onClick={onBack} className={styles.backButton}>
                    <ArrowLeft size={16} />
                    {t("Back")}
                </button>

                <button onClick={onNext} className={styles.continueButton}>
                    {t("Pay €500.00")}
                </button>
            </div>
        </div>
    );
};

export default ActivateAccount;