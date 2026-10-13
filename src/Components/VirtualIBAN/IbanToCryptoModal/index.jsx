import {
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { Modal, ModalBody } from "reactstrap";
import { toast } from "react-toastify";
import useWindowWidth from "../../../utils/useWindowWidth";
import { UserContext } from "../../../Context/UserContext";
import ContactBox from "../../MyMasterCard/PaymentModal/ContactBox";
import addFundsStyles from "../WithdrawBalanceModal/withdrawBalance.module.scss";
import styles from "../ConvertFundsModal/convertFunds.module.scss";
import AmountStep from "../ConvertFundsModal/AmountStep";
import SidebarProgress from "../VirtualIbanModal/SidebarProgress";
import MobileStepProgress from "../VirtualIbanModal/MobileStepProgress";
import MobileFooter from "../../../Common/Component/MobileFooter";
import StepsDrawer from "../../../Common/Component/StepsDrawer";
import { getAmountNumber } from "../utils/amount";
import { isWalletBlocked } from "../CryptoWallet/instapay/wallets";
import {
  useExecuteVirtualIbanCryptoTransfer,
  useVirtualIbanCryptoTransferFee,
} from "../../../hooks/useVirtualIban";
import { useIdempotency } from "../../../hooks/Payments/useIdempotency";
import { handlePaymentApiError } from "../../../utils/Functions/handlePaymentApiError";
import {
  getContinueLabel,
  getDisabledState,
  goBack,
  isSidebarStepActive,
  isSidebarStepCompleted,
  MIN_AMOUNT,
  SIDEBAR_STEPS,
  STEPS,
} from "../../../stateMachines/ibanToCrypto";
import DestinationNote from "./DestinationNote";
import ReviewStep from "./ReviewStep";
import ProcessingStep from "./ProcessingStep";

const TARGET_CURRENCY = "USDT";
const QUOTE_LIFETIME_MS = 10 * 60 * 1000;

const STALE_QUOTE = /expired|already been used|does not match|invalid quote/i;

const CoinsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <circle cx="6.75" cy="6.75" r="4.5" stroke="#F8F9FC" strokeWidth="1.2" />
    <circle cx="11.25" cy="11.25" r="4.5" stroke="#F8F9FC" strokeWidth="1.2" />
  </svg>
);

const DiamondIcon = ({ color = "#F8F9FC" }) => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path
      d="M9 1.125L15.1875 9L9 16.875L2.8125 9L9 1.125Z"
      stroke={color}
      strokeWidth="1.3"
      strokeLinejoin="round"
    />
    <path
      d="M15.1875 9L9 11.8125L2.8125 9"
      stroke={color}
      strokeWidth="1.3"
      strokeLinejoin="round"
    />
  </svg>
);

const IdBadgeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <rect
      x="3"
      y="2.25"
      width="12"
      height="13.5"
      rx="1.5"
      stroke="#F8F9FC"
      strokeWidth="1.2"
    />
    <circle cx="9" cy="8.25" r="2.25" stroke="#F8F9FC" strokeWidth="1.2" />
  </svg>
);

const ChevronLeft = () => (
  <svg width="14" height="14" viewBox="0 0 14 15" fill="none">
    <path
      d="M8.75 11L5.25 7.5L8.75 4"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ChevronRight = () => (
  <svg width="14" height="14" viewBox="0 0 14 15" fill="none">
    <path
      d="M5.25 11L8.75 7.5L5.25 4"
      stroke="white"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const SIDEBAR_ICONS = {
  [STEPS.AMOUNT]: () => <CoinsIcon />,
  [STEPS.REVIEW]: () => <IdBadgeIcon />,
};

const getQuoteExpiry = (token) => {
  let exp;
  try {
    exp = JSON.parse(
      atob(String(token).split(".")[1].replace(/-/g, "+").replace(/_/g, "/")),
    )?.exp;
  } catch {
    exp = null;
  }
  return exp ? exp * 1000 : Date.now() + QUOTE_LIFETIME_MS;
};

const IbanToCryptoModal = forwardRef(
  ({ isOpen, toggle, selectedIban, availableBalance, isPage = false }, ref) => {
    const { t } = useTranslation();
    const width = useWindowWidth();
    const isMobile = width <= 600;
    const navigate = useNavigate();
    const { userWallets, getUserWallets, setProfileLockTime } =
      useContext(UserContext);
    const { getKey, reset: resetIdempotency } = useIdempotency();

    const [showDrawer, setShowDrawer] = useState(false);
    const [currentStep, setCurrentStep] = useState(STEPS.AMOUNT);
    const [amount, setAmount] = useState("");
    const [feeDetails, setFeeDetails] = useState(null);
    const [quoteExpiresAt, setQuoteExpiresAt] = useState(null);
    const [result, setResult] = useState(null);
    const confirmingRef = useRef(false);

    const feeQuote = useVirtualIbanCryptoTransferFee();
    const executeTransfer = useExecuteVirtualIbanCryptoTransfer();

    const ibanId = selectedIban?._id || selectedIban?.id;
    const ibanCurrency = selectedIban?.currency || "EUR";
    const sourceBalance = availableBalance ?? selectedIban?.balance ?? 0;
    const active = isPage || isOpen;

    useEffect(() => {
      if (active) getUserWallets();
    }, [active]);

    const wallet = useMemo(
      () =>
        (userWallets || [])
          .filter(
            (item) =>
              item?.wallet_type === "crypto" &&
              String(item?.currency?.code || "").toUpperCase() ===
                TARGET_CURRENCY &&
              !isWalletBlocked(item),
          )
          .sort((a, b) => Number(!!b?.default) - Number(!!a?.default))[0] ??
        null,
      [userWallets],
    );

    const quoteExpired = !!quoteExpiresAt && quoteExpiresAt <= Date.now();
    const disabled = getDisabledState(currentStep, {
      amount,
      wallet,
      availableBalance: sourceBalance,
      feeDetails,
      quoteExpired,
    });

    const resetState = () => {
      setCurrentStep(STEPS.AMOUNT);
      setAmount("");
      setFeeDetails(null);
      setQuoteExpiresAt(null);
      setResult(null);
      confirmingRef.current = false;
      resetIdempotency();
    };

    const handleClose = () => {
      resetState();
      toggle?.();
    };

    const showError = (error, fallback) => {
      const message = handlePaymentApiError({
        error,
        setProfileLockTime,
        navigate,
        fallback: t(fallback),
      });
      if (message) toast.error(t(message));
      return message || "";
    };

    const fetchQuote = useCallback(async () => {
      const res = await feeQuote.mutateAsync({
        iban_id: ibanId,
        wallet_id: wallet?._id,
        amount: getAmountNumber(amount),
      });
      const data = res?.data;
      setFeeDetails(data);
      setQuoteExpiresAt(getQuoteExpiry(data?.token));
      resetIdempotency();
      return data;
    }, [ibanId, wallet, amount]);

    const refreshQuote = useCallback(async () => {
      try {
        await fetchQuote();
      } catch (error) {
        showError(error, "We couldn't refresh the quote. Please try again.");
      }
    }, [fetchQuote]);

    const confirm = async () => {
      if (confirmingRef.current) return;
      confirmingRef.current = true;
      try {
        const res = await executeTransfer.mutateAsync({
          iban_id: ibanId,
          wallet_id: wallet?._id,
          amount: feeDetails?.total?.value,
          token: feeDetails?.token,
          idempotencyKey: getKey(),
        });
        setResult(res?.data);
        setCurrentStep(STEPS.DONE);
      } catch (error) {
        if (error?.response?.status === 409) {
          toast.info(t("This conversion is already being processed."));
          return;
        }
        const message = showError(
          error,
          "We couldn't start the conversion. Please try again.",
        );
        if (STALE_QUOTE.test(message) || error?.response?.status === 502) {
          await refreshQuote();
        }
      } finally {
        confirmingRef.current = false;
      }
    };

    const handleContinue = async () => {
      if (!selectedIban) {
        toast.error(t("Please select a virtual IBAN first"));
        return;
      }

      if (currentStep === STEPS.DONE) {
        handleClose();
        return;
      }

      if (currentStep === STEPS.REVIEW) {
        await confirm();
        return;
      }

      try {
        await fetchQuote();
        setCurrentStep(STEPS.REVIEW);
      } catch (error) {
        showError(error, "We couldn't get a quote. Please try again.");
      }
    };

    const handleBack = () => {
      if (currentStep === STEPS.DONE) {
        handleClose();
        return;
      }
      const { prevStep } = goBack(currentStep);
      if (prevStep === null) handleClose();
      else setCurrentStep(prevStep);
    };

    useImperativeHandle(ref, () => ({ back: handleBack }));

    const renderStepContent = () => {
      switch (currentStep) {
        case STEPS.AMOUNT:
          return (
            <>
              <AmountStep
                amount={amount}
                setAmount={setAmount}
                currencyCode={ibanCurrency}
                availableBalance={sourceBalance}
                label={t("Amount to convert")}
                min={MIN_AMOUNT}
                minQuickAmount={MIN_AMOUNT}
              />
              <DestinationNote
                wallet={wallet}
                onCreate={() => {
                  handleClose();
                  navigate("/crypto-wallets");
                }}
              />
            </>
          );
        case STEPS.REVIEW:
          return (
            <ReviewStep
              feeDetails={feeDetails}
              quoteExpiresAt={quoteExpiresAt}
              wallet={wallet}
              iban={selectedIban}
              onRefreshQuote={refreshQuote}
              isRefreshing={feeQuote.isPending}
            />
          );
        case STEPS.DONE:
          return <ProcessingStep result={result} />;
        default:
          return null;
      }
    };

    const isDone = currentStep === STEPS.DONE;
    const isBusy = feeQuote.isPending || executeTransfer.isPending;
    const footerDisabled = (!isDone && disabled) || isBusy || !selectedIban;
    const primaryLabel = isBusy
      ? t("Processing...")
      : isDone
        ? t("Close")
        : getContinueLabel(currentStep, t);

    const content = (
      <div
        className={styles.modalLayout}
        style={{ flexDirection: width < 1000 ? "column" : "row" }}
      >
        {!isMobile && (
          <div className={addFundsStyles.left}>
            <div style={{ width: "100%" }}>
              <div className={styles.bankHeader}>
                <div className={styles.bankIcon}>
                  <DiamondIcon color="#F2EEFF" />
                </div>
                {width > 700 ? (
                  <h2>
                    {t("Convert IBAN to")}
                    <br />
                    {t("crypto wallet")}
                  </h2>
                ) : (
                  <h2>{t("Convert IBAN to crypto wallet")}</h2>
                )}
              </div>
              <div
                className={addFundsStyles.progressEffect}
                style={{ marginTop: "2rem" }}
              >
                {SIDEBAR_STEPS.map((item, index) => (
                  <SidebarProgress
                    key={item.stepName}
                    stepLabel={item.stepLabel}
                    label={item.label}
                    Icon={SIDEBAR_ICONS[item.stepName]}
                    isActive={isSidebarStepActive(item, currentStep)}
                    isCompleted={isSidebarStepCompleted(item, currentStep)}
                    showBar={index < SIDEBAR_STEPS.length - 1}
                  />
                ))}
              </div>
            </div>
            {width > 700 && (
              <div className={addFundsStyles.contactBox}>
                <ContactBox />
              </div>
            )}
          </div>
        )}

        <div
          className={styles.rightPanel}
          style={{ width: width < 1000 ? "100%" : undefined }}
        >
          <div className={styles.content}>{renderStepContent()}</div>
          {isMobile ? (
            <MobileFooter
              label={primaryLabel}
              handleBack={!isDone && handleBack}
              handleAction={handleContinue}
              disabled={footerDisabled}
            />
          ) : (
            <div
              className={styles.footer}
              style={isDone ? { justifyContent: "flex-end" } : undefined}
            >
              {isDone ? (
                <button
                  type="button"
                  className={styles.nextBtn}
                  onClick={handleClose}
                >
                  {t("Close")}
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    className={styles.cancelBtn}
                    onClick={handleClose}
                  >
                    {t("Cancel")}
                  </button>
                  <div className={styles.footerNav}>
                    <button
                      type="button"
                      className={styles.backBtn}
                      disabled={isBusy}
                      onClick={handleBack}
                    >
                      <ChevronLeft />
                      {t("Back")}
                    </button>
                    <button
                      type="button"
                      className={styles.nextBtn}
                      disabled={footerDisabled}
                      onClick={handleContinue}
                    >
                      {primaryLabel}
                      <ChevronRight />
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    );

    return (
      <>
        {isPage ? (
          <div>
            {isMobile && (
              <MobileStepProgress
                handleClick={() => setShowDrawer(true)}
                currentStep={currentStep}
                isSidebarStepActive={isSidebarStepActive}
                isSidebarStepCompleted={isSidebarStepCompleted}
                SIDEBAR_STEPS={SIDEBAR_STEPS}
              />
            )}
            {content}
          </div>
        ) : (
          <Modal
            isOpen={isOpen}
            style={{ minWidth: width > 1000 ? "900px" : "0px" }}
            toggle={handleClose}
          >
            <ModalBody style={{ padding: "20px" }}>{content}</ModalBody>
          </Modal>
        )}
        <StepsDrawer
          open={showDrawer}
          currentStep={currentStep}
          isSidebarStepActive={isSidebarStepActive}
          isSidebarStepCompleted={isSidebarStepCompleted}
          SIDEBAR_STEPS={SIDEBAR_STEPS}
          toggleDrawer={(val) => setShowDrawer(val)}
        />
      </>
    );
  },
);

IbanToCryptoModal.displayName = "IbanToCryptoModal";

export default IbanToCryptoModal;
