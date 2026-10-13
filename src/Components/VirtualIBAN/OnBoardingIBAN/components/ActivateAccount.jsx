import { useContext, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Check,
  CreditCard,
  Shield,
  AlertTriangle,
} from "react-feather";
import axios from "axios";
import { toast } from "react-toastify";
import Magicsvg from "../magicsvg";
import styles from "../style/ActivateAccount.module.css";
import { UserContext } from "../../../../Context/UserContext";
import { decryptData } from "../../../../Helper/EssentilaMethods/Decryption";
import { encryptData } from "../../../../Helper/EssentilaMethods/Encryption";
import { CircularProgress, useMediaQuery } from "@mui/material";
import { BankIcon, CryptoIcon, OpenBanking } from "./SvgIcons";

const paymentMethods = [
  {
    id: "wallet",
    title: "Wallet",
    subtitle: "Instapay Wallet",
    active: true,
    Icon: OpenBanking,
  },
  {
    id: "bank",
    title: "Bank transfer",
    subtitle: "SEPA | SWIFT",
    active: false,
    Icon: BankIcon,
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
    Icon: CryptoIcon,
  },
];

const ActivateAccount = ({
  onBack,
  onNext,
  t,
  selectedWallet,
  setSelectedWallet,
  feeDetails,
  setFeeDetails,
  onSubmitPayment,
}) => {
  const { userWallets, getUserWallets, authHeader } = useContext(UserContext);
  const [loadingRates, setLoadingRates] = useState(false);
  const isMobile = useMediaQuery("(max-width:600px)");

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
    getUserWallets();
  }, []);

  const activeWallets = useMemo(() => {
    return (userWallets || [])
      .filter(
        (item) =>
          item?.wallet_type === "insta" &&
          !item?.blocked &&
          !item?.admin_blocked &&
          item?.status === "active",
      )
      .sort((a, b) => (b?.default === true ? 1 : -1));
  }, [userWallets]);

  useEffect(() => {
    if (activeWallets.length > 0 && !selectedWallet?._id) {
      setSelectedWallet(activeWallets[0]);
    }
  }, [activeWallets]);

  useEffect(() => {
    if (!selectedWallet?._id) return;

    const walletCurr = selectedWallet?.currency?.code;

    const fetchMarkupRates = async () => {
      setLoadingRates(true);
      // Drop the previous wallet's quote so its amount/currency is never shown for this one.
      setFeeDetails(null);
      try {
        const payload = encryptData({ wallet_id: selectedWallet._id });
        const res = await axios.post(
          `${import.meta.env.VITE_IP_DEV_API}/api/iban-fees/markup-rates`,
          { data: payload },
          { headers: authHeader },
        );
        const dec = decryptData(res.data?.data);
        const currency = dec?.data?.wallet_currency || walletCurr;
        if (dec?.data?.converted_amount == null || !currency) {
          toast.error(t("Unable to fetch markup conversion rate"));
          return;
        }
        if (dec?.data) {
          setFeeDetails({
            baseAmount: dec.data.base_amount,
            convertedAmount: dec.data.converted_amount,
            currency,
            exchangeRate: dec.data.exchange_rate || 1,
            activationFee: dec.data.activation_fee ?? dec.data.base_amount,
            kybFee: dec.data.kyb_fee || 0,
            isKybIncluded: dec.data.is_kyb_included || false,
            kybFeeBreakdown: dec.data.kyb_fee_breakdown || null,
          });
        }
      } catch (err) {
        const decErr = decryptData(err?.response?.data?.data);
        toast.error(
          decErr?.message || t("Unable to fetch markup conversion rate"),
        );
      } finally {
        setLoadingRates(false);
      }
    };

    fetchMarkupRates();
  }, [selectedWallet?._id]);

  const isFeeReady =
    !loadingRates &&
    feeDetails?.convertedAmount != null &&
    !!feeDetails?.currency;

  const totalDueLabel = !isFeeReady
    ? ""
    : feeDetails.currency !== "EUR"
      ? `${feeDetails.convertedAmount} ${feeDetails.currency}`
      : `€${feeDetails.baseAmount ?? feeDetails.convertedAmount}.00`;

  const isInsufficient = useMemo(() => {
    if (!selectedWallet || !isFeeReady) return false;
    const available = selectedWallet.balance?.available || 0;
    return available < feeDetails.convertedAmount;
  }, [selectedWallet, feeDetails, isFeeReady]);

  const handleWalletSelect = (wallet) => {
    setSelectedWallet(wallet);
  };

  return (
    <div className={styles.onboardingLayout}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: "28px",
          width: "100%",
          alignItems: "start",
        }}
      >
        <div className={styles.mainArea}>
          <div className={styles.header}>
            <div className={styles.headerTitle}>
              {!isMobile && (
                <>
                  <div className={styles.cont}>
                    <Magicsvg />
                  </div>
                  <h2>{t("Activate your account")}</h2>
                </>
              )}
            </div>
            <p>
              {t(
                "Pay the one-off IBAN activation fee using your Instapay wallet to activate your dedicated IBAN account.",
              )}
            </p>
          </div>

          <div>
            {!isMobile && (
              <label
                style={{
                  fontWeight: 700,
                  fontSize: "12px",
                  textTransform: "uppercase",
                  color: "#6b7280",
                  letterSpacing: "0.05em",
                  marginBottom: "10px",
                  display: "block",
                }}
              >
                {t("Payment Method")}
              </label>
            )}
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
                    {item?.Icon && isMobile ? (
                      <item.Icon color={item.active ? "#FFFFFF" : "#6E7687"} />
                    ) : (
                      <CreditCard size={16} />
                    )}
                  </div>
                  <div style={{ textAlign: "start" }}>
                    <h5>
                      {t(item.title)}{" "}
                      {!item.active && <small>({t("Disabled")})</small>}
                    </h5>
                    <span>{t(item.subtitle)}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              flexDirection: isMobile ? "column" : "row",
              gap: isMobile && 20,
            }}
          >
            <div
              style={{ marginTop: "10px", width: isMobile ? "100%" : "auto" }}
            >
              <label
                style={{
                  fontWeight: 700,
                  fontSize: "12px",
                  textTransform: "uppercase",
                  color: "#6b7280",
                  letterSpacing: "0.05em",
                  marginBottom: "12px",
                  display: "block",
                }}
              >
                {t("Select your Instapay Wallet")}
              </label>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                  gap: "14px",
                  width: "100%",
                }}
              >
                {activeWallets.map((wallet) => {
                  const isSelected = selectedWallet?._id === wallet._id;
                  return (
                    <div
                      key={wallet._id}
                      onClick={() => handleWalletSelect(wallet)}
                      style={{
                        border: isSelected
                          ? "2px solid #4A32E3"
                          : "1px solid #E2E8F0",
                        borderRadius: "12px",
                        padding: "16px",
                        background: isSelected
                          ? "rgba(74, 50, 227, 0.04)"
                          : "#FFFFFF",
                        cursor: "pointer",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        transition: "all 0.2s ease",
                        boxShadow: isSelected
                          ? "0 4px 12px rgba(74, 50, 227, 0.08)"
                          : "none",
                      }}
                    >
                      <div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                          }}
                        >
                          <span
                            style={{
                              background: "#eff6ff",
                              color: "#2563eb",
                              fontWeight: 700,
                              fontSize: "12px",
                              padding: "2px 6px",
                              borderRadius: "4px",
                            }}
                          >
                            {wallet.currency?.code}
                          </span>
                          <h5
                            style={{
                              margin: 0,
                              fontSize: "15px",
                              fontWeight: 700,
                              color: "#111827",
                            }}
                          >
                            {wallet.currency?.code}
                            {t("Wallet")}
                          </h5>
                        </div>
                        <div
                          style={{
                            marginTop: "6px",
                            fontSize: "12px",
                            color: "#64748B",
                          }}
                        >
                          {t("ID:")}
                          {wallet.wallet_id}
                        </div>
                        <div
                          style={{
                            marginTop: "8px",
                            fontSize: "14px",
                            fontWeight: 700,
                            color: "#1E293B",
                          }}
                        >
                          {t("Balance")}: {wallet.currency?.symbol || ""}
                          {wallet.balance?.available ?? 0}{" "}
                          {wallet.currency?.code}
                        </div>
                      </div>
                      {isSelected && (
                        <div
                          style={{
                            background: "#4A32E3",
                            borderRadius: "50%",
                            padding: "5px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Check size={14} color="#FFF" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            <div
              style={{
                background: "#F8FAFC",
                border: "1px solid #E2E8F0",
                borderRadius: "16px",
                padding: "24px",
                display: "flex",
                flexDirection: "column",
                gap: "20px",
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontSize: "18px",
                  fontWeight: 700,
                  color: "#0F172A",
                }}
              >
                {t("Payment Summary")}
              </h3>

              <div
                className={styles.summary}
                style={{
                  borderBottom: "1px dashed #CBD5E1",
                  paddingBottom: "16px",
                }}
              >
                <div className={styles.summaryRow}>
                  <span>{t("IBAN activation fee")}</span>
                  <strong>
                    {isFeeReady && feeDetails?.activationFee != null ? (
                      `€${feeDetails.activationFee}.00`
                    ) : (
                      <CircularProgress size={14} />
                    )}
                  </strong>
                </div>

                {feeDetails?.isKybIncluded && (
                  <div
                    className={styles.summaryRow}
                    style={{ marginTop: "8px" }}
                  >
                    <span>{t("KYB Verification Fee")}</span>
                    <strong>
                      ${feeDetails?.kybFee || 0}
                      {t(".00 USD")}
                    </strong>
                  </div>
                )}
              </div>

              <div
                className={styles.dueCard}
                style={{
                  background:
                    "linear-gradient(135deg, #4A32E3 0%, #5926F0 100%)",
                  color: "#fff",
                  padding: "20px",
                  borderRadius: "12px",
                }}
              >
                <span
                  style={{
                    color: "rgba(255, 255, 255, 0.85)",
                    fontSize: "14px",
                    fontWeight: 600,
                  }}
                >
                  {t("Total Due Today")}
                </span>
                <h3
                  style={{
                    color: "#fff",
                    margin: "6px 0 0 0",
                    fontSize: "28px",
                    fontWeight: 700,
                  }}
                >
                  {isFeeReady ? (
                    totalDueLabel
                  ) : (
                    <CircularProgress size={24} sx={{ color: "#fff" }} />
                  )}
                </h3>
              </div>

              {isInsufficient && (
                <div
                  style={{
                    background: "#FEF3C7",
                    border: "1px solid #FCD34D",
                    borderRadius: "10px",
                    padding: "14px",
                    display: "flex",
                    gap: "10px",
                    alignItems: "center",
                  }}
                >
                  <AlertTriangle
                    color="#D97706"
                    size={18}
                    style={{ flexShrink: 0 }}
                  />
                  <span
                    style={{
                      color: "#92400E",
                      fontSize: "13px",
                      fontWeight: 600,
                      lineHeight: 1.4,
                    }}
                  >
                    {t("Amount will be deducted later")}
                  </span>
                </div>
              )}

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  background: "#EFF6FF",
                  border: "1px solid #BFDBFE",
                  padding: "12px 14px",
                  borderRadius: "10px",
                  fontSize: "12px",
                  color: "#1D4ED8",
                  fontWeight: 600,
                }}
              >
                <Shield size={16} color="#2563EB" style={{ flexShrink: 0 }} />
                <span>
                  {t(
                    "Encrypted instant payment. Your dedicated IBAN will be submitted for compliance processing immediately.",
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.navigationFooter}>
        <button onClick={onBack} className={styles.backButton}>
          <ArrowLeft size={16} />
          {t("Back")}
        </button>

        <button
          onClick={onSubmitPayment}
          disabled={!selectedWallet?._id || !isFeeReady}
          className={styles.continueButton}
          style={{
            opacity: !selectedWallet?._id || !isFeeReady ? 0.5 : 1,
            cursor:
              !selectedWallet?._id || !isFeeReady ? "not-allowed" : "pointer",
          }}
        >
          {!isFeeReady
            ? t("Calculating...")
            : isInsufficient
              ? t("Confirm & Activate IBAN")
              : `${t("Pay")} ${totalDueLabel}`}
        </button>
      </div>
    </div>
  );
};

export default ActivateAccount;
