import { useContext, useEffect, useMemo, useState } from "react";
import { ArrowLeft, Check, CreditCard, Shield, AlertTriangle } from "react-feather";
import axios from "axios";
import { toast } from "react-toastify";
import Magicsvg from "../magicsvg";
import styles from "../style/ActivateAccount.module.css";
import { UserContext } from "../../../../Context/UserContext";
import { decryptData } from "../../../../Helper/EssentilaMethods/Decryption";
import { encryptData } from "../../../../Helper/EssentilaMethods/Encryption";

const paymentMethods = [
    {
        id: "wallet",
        title: "Wallet",
        subtitle: "Instapay Wallet",
        active: true,
    },
    {
        id: "bank",
        title: "Bank transfer",
        subtitle: "SEPA | SWIFT",
        active: false,
    },
    {
        id: "card",
        title: "Card",
        subtitle: "Visa | Mastercard",
        active: false,
    },
    {
        id: "crypto",
        title: "Crypto",
        subtitle: "USDC / USDT",
        active: false,
    },
];

const ActivateAccount = ({ onBack, onNext, t, selectedWallet, setSelectedWallet, feeDetails, setFeeDetails, onSubmitPayment }) => {
    const { userWallets, getUserWallets, authHeader } = useContext(UserContext);
    const [loadingRates, setLoadingRates] = useState(false);

    useEffect(() => {
        getUserWallets();
    }, []);

    const activeWallets = useMemo(() => {
        return (userWallets || [])
            .filter((item) => item?.wallet_type === "insta" && !item?.blocked && !item?.admin_blocked && item?.status === "active")
            .sort((a, b) => (b?.default === true ? 1 : -1));
    }, [userWallets]);

    useEffect(() => {
        if (activeWallets.length > 0 && !selectedWallet?._id) {
            setSelectedWallet(activeWallets[0]);
        }
    }, [activeWallets]);

    useEffect(() => {
        if (!selectedWallet?._id) return;

        const walletCurr = selectedWallet?.currency?.code || "EUR";
        if (walletCurr === "EUR") {
            setFeeDetails({
                baseAmount: 500,
                convertedAmount: 500,
                currency: "EUR",
                exchangeRate: 1,
            });
            return;
        }

        const fetchMarkupRates = async () => {
            setLoadingRates(true);
            try {
                const payload = encryptData({ wallet_id: selectedWallet._id });
                const res = await axios.post(
                    `${import.meta.env.VITE_IP_DEV_API}/api/iban-fees/markup-rates`,
                    { data: payload },
                    { headers: authHeader }
                );
                const dec = decryptData(res.data?.data);
                if (dec?.data) {
                    setFeeDetails({
                        baseAmount: dec.data.base_amount || 500,
                        convertedAmount: dec.data.converted_amount || 500,
                        currency: dec.data.wallet_currency || walletCurr,
                        exchangeRate: dec.data.exchange_rate || 1,
                    });
                }
            } catch (err) {
                const decErr = decryptData(err?.response?.data?.data);
                toast.error(decErr?.message || t("Unable to fetch markup conversion rate"));
            } finally {
                setLoadingRates(false);
            }
        };

        fetchMarkupRates();
    }, [selectedWallet?._id]);

    const isInsufficient = useMemo(() => {
        if (!selectedWallet) return false;
        const available = selectedWallet.balance?.available || 0;
        const required = feeDetails?.convertedAmount || 500;
        return available < required;
    }, [selectedWallet, feeDetails]);

    const handleWalletSelect = (wallet) => {
        setSelectedWallet(wallet);
    };

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
                            "Pay the one-off IBAN activation fee using your Instapay wallet to activate your dedicated IBAN account."
                        )}
                    </p>
                </div>

                <div className={styles.paymentMethods}>
                    {paymentMethods.map((item) => (
                        <button
                            key={item.id}
                            type="button"
                            disabled={!item.active}
                            className={`${styles.paymentCard} ${item.id === "wallet" ? styles.activePayment : ""}`}
                            style={{
                                opacity: item.active ? 1 : 0.45,
                                cursor: item.active ? "pointer" : "not-allowed",
                            }}
                        >
                            <div className={styles.paymentIcon}>
                                <CreditCard size={16} />
                            </div>
                            <div style={{ textAlign: "start" }}>
                                <h5>
                                    {t(item.title)} {!item.active && <small>({t("Disabled")})</small>}
                                </h5>
                                <span>{t(item.subtitle)}</span>
                            </div>
                        </button>
                    ))}
                </div>

                <div className={styles.summary}>
                    <div className={styles.summaryRow}>
                        <span>{t("IBAN activation fee (EUR)")}</span>
                        <strong>€{feeDetails?.baseAmount || 500}.00</strong>
                    </div>

                    {feeDetails?.currency !== "EUR" && (
                        <div className={styles.summaryRow}>
                            <span>{t("Converted payable amount")}</span>
                            <strong style={{ color: "#5926F0" }}>
                                {feeDetails?.convertedAmount} {feeDetails?.currency}
                            </strong>
                        </div>
                    )}
                </div>

                <div className={styles.dueCard}>
                    <span>{t("Due today")}</span>
                    <h3>
                        {feeDetails?.currency !== "EUR"
                            ? `${feeDetails?.convertedAmount || 500} ${feeDetails?.currency}`
                            : `€${feeDetails?.baseAmount || 500}.00`}
                    </h3>
                </div>

                <div className={styles.paymentSection} style={{ flexDirection: "column", gap: "1rem" }}>
                    <label style={{ fontWeight: 600, fontSize: "14px", textTransform: "uppercase", color: "#666" }}>
                        {t("Select your Instapay Wallet")}
                    </label>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "12px", width: "100%" }}>
                        {activeWallets.map((wallet) => {
                            const isSelected = selectedWallet?._id === wallet._id;
                            return (
                                <div
                                    key={wallet._id}
                                    onClick={() => handleWalletSelect(wallet)}
                                    style={{
                                        border: isSelected ? "2px solid #5926F0" : "1px solid #E2E8F0",
                                        borderRadius: "12px",
                                        padding: "14px",
                                        background: isSelected ? "rgba(89, 38, 240, 0.04)" : "#FFFFFF",
                                        cursor: "pointer",
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        transition: "all 0.2s ease",
                                    }}
                                >
                                    <div>
                                        <h5 style={{ margin: 0, fontSize: "16px", fontWeight: 700 }}>
                                            {wallet.currency?.code} Wallet
                                        </h5>
                                        <span style={{ fontSize: "12px", color: "#64748B" }}>
                                            ID: {wallet.wallet_id}
                                        </span>
                                        <div style={{ marginTop: "4px", fontSize: "13px", fontWeight: 600, color: "#1E293B" }}>
                                            {t("Available")}: {wallet.currency?.symbol || ""}{wallet.balance?.available ?? 0} {wallet.currency?.code}
                                        </div>
                                    </div>
                                    {isSelected && (
                                        <div style={{ background: "#5926F0", borderRadius: "50%", padding: "4px", display: "flex" }}>
                                            <Check size={14} color="#FFF" />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {isInsufficient && (
                        <div style={{ background: "#FEF2F2", border: "1px solid #FCA5A5", borderRadius: "8px", padding: "12px", display: "flex", gap: "10px", alignItems: "center", marginTop: "10px" }}>
                            <AlertTriangle color="#DC2626" size={20} />
                            <span style={{ color: "#991B1B", fontSize: "13px", fontWeight: 600 }}>
                                {t("Insufficient wallet balance. Please select a wallet with enough balance or add funds.")}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            <div className={styles.navigationFooter}>
                <button onClick={onBack} className={styles.backButton}>
                    <ArrowLeft size={16} />
                    {t("Back")}
                </button>

                <button
                    onClick={onSubmitPayment}
                    disabled={isInsufficient || !selectedWallet?._id || loadingRates}
                    className={styles.continueButton}
                    style={{
                        opacity: isInsufficient || !selectedWallet?._id || loadingRates ? 0.5 : 1,
                        cursor: isInsufficient || !selectedWallet?._id || loadingRates ? "not-allowed" : "pointer",
                    }}
                >
                    {loadingRates
                        ? t("Calculating...")
                        : `${t("Pay")} ${feeDetails?.currency !== "EUR" ? `${feeDetails?.convertedAmount} ${feeDetails?.currency}` : `€${feeDetails?.baseAmount || 500}.00`}`}
                </button>
            </div>
        </div>
    );
};

export default ActivateAccount;