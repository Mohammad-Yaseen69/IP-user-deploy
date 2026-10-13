import { useContext, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Modal, ModalBody } from "reactstrap";
import useWindowWidth from "../../../utils/useWindowWidth";
import ContactBox from "../../MyMasterCard/PaymentModal/ContactBox";
import addFundsStyles from "../../MyMasterCard/styles/addFunds.module.scss";
import {
  getContinueLabel,
  getDisabledState,
  goBack,
  goNext,
  isSidebarStepActive,
  isSidebarStepCompleted,
  SIDEBAR_STEPS,
  STEPS,
} from "../../../stateMachines/withdrawBalance";
import AmountStep from "./AmountStep";
import DestinationStep, { shouldShowSaverSpeed } from "./DestinationStep";
import ReviewStep from "./ReviewStep";
import OTPConfirmation from "../../../Common/Component/OtpVerification";
import DoneStep from "./DoneStep";
import styles from "./withdrawBalance.module.scss";
import SidebarProgress from "../VirtualIbanModal/SidebarProgress";
import GpsFix from "../VirtualIbanModal/icons/gpsFix.svg";
import Coins from "../VirtualIbanModal/icons/coins.svg";
import SealCheck from "../VirtualIbanModal/icons/SealCheck.svg";
import { UserContext } from "../../../Context/UserContext";

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
    <path
      d="M5.25 14.25C5.25 12.1789 6.92893 10.5 9 10.5C11.0711 10.5 12.75 12.1789 12.75 14.25"
      stroke="#F8F9FC"
      strokeWidth="1.2"
    />
    <path
      d="M7.5 3.75H10.5"
      stroke="#F8F9FC"
      strokeWidth="1.2"
      strokeLinecap="round"
    />
  </svg>
);

const ArrowRightIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path
      d="M3.75 9H14.25"
      stroke="#F2EEFF"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M9.75 4.5L14.25 9L9.75 13.5"
      stroke="#F2EEFF"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
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
  [STEPS.AMOUNT]: () => (
    <span>
      <img src={Coins} />
    </span>
  ),
  [STEPS.DESTINATION]: () => (
    <span>
      <img src={GpsFix} />
    </span>
  ),
  [STEPS.REVIEW]: () => <IdBadgeIcon />,
  [STEPS.DONE]: () => (
    <span>
      <img src={SealCheck} />
    </span>
  ),
};

const getVirtualIbanNumber = (iban) =>
  iban?.iban ||
  iban?.ibanFull ||
  iban?.account_number ||
  iban?.accountNumber ||
  iban?.virtual_iban ||
  iban?.virtualIban ||
  "";

const getVirtualIbanTitle = (iban, fallbackCurrency = "EUR") =>
  iban?.name ||
  iban?.title ||
  iban?.label ||
  `${iban?.currency || fallbackCurrency} IBAN`;

const getWithdrawalBanks = (withdrawals = []) =>
  (Array.isArray(withdrawals) ? withdrawals : [])
    .filter((withdrawal) => withdrawal?.account_type?.includes("bank"))
    .flatMap((withdrawal) =>
      (withdrawal?.bank_details || []).map((bank, index) => ({
        ...bank,
        id: bank?._id || `${withdrawal?._id || "withdrawal"}-${index}`,
        withdrawalId: withdrawal?._id,
        iso_code: withdrawal?.iso_code,
        withdrawal,
      })),
    );

const WithdrawBalanceModal = ({
  isOpen,
  toggle,
  selectedIban,
  availableBalance,
}) => {
  const { t } = useTranslation();
  const width = useWindowWidth();
  const { userWithdrawals, getWithdrawals } = useContext(UserContext);
  const [currentStep, setCurrentStep] = useState(STEPS.AMOUNT);
  const [amount, setAmount] = useState("");
  const [transferSpeed, setTransferSpeed] = useState("instant");
  const [selectedBank, setSelectedBank] = useState(null);
  const [authType, setAuthType] = useState("authenticator");
  const sourceAvailableBalance = availableBalance ?? selectedIban?.balance ?? 0;
  const currencyCode = selectedIban?.currency || "EUR";
  const savedBanks = useMemo(
    () => getWithdrawalBanks(userWithdrawals || []),
    [userWithdrawals],
  );
  const sourceIban = useMemo(
    () => ({
      title: getVirtualIbanTitle(selectedIban, currencyCode),
      iban: getVirtualIbanNumber(selectedIban),
    }),
    [selectedIban, currencyCode],
  );

  const machineData = useMemo(
    () => ({
      amount,
      transferSpeed,
      selectedBank,
      savedBanks,
      availableBalance: sourceAvailableBalance,
    }),
    [amount, transferSpeed, selectedBank, savedBanks, sourceAvailableBalance],
  );

  const disabled = getDisabledState(currentStep, machineData);
  const continueLabel = getContinueLabel(currentStep, t);

  const resetState = () => {
    setCurrentStep(STEPS.AMOUNT);
    setAmount("");
    setTransferSpeed("instant");
    setSelectedBank(null);
    setAuthType("authenticator");
  };

  useEffect(() => {
    if (isOpen && userWithdrawals === undefined) {
      getWithdrawals?.();
    }
  }, [isOpen, userWithdrawals, getWithdrawals]);

  useEffect(() => {
    if (!selectedBank?.id) return;

    const nextSelectedBank = savedBanks.find(
      (bank) => bank.id === selectedBank.id,
    );

    if (!nextSelectedBank) {
      setSelectedBank(null);
      setTransferSpeed("instant");
    } else if (nextSelectedBank !== selectedBank) {
      setSelectedBank(nextSelectedBank);
    }
  }, [savedBanks, selectedBank]);

  useEffect(() => {
    if (transferSpeed === "saver" && !shouldShowSaverSpeed(selectedBank)) {
      setTransferSpeed("instant");
    }
  }, [selectedBank, transferSpeed]);

  const handleClose = () => {
    resetState();
    toggle?.();
  };

  const handleContinue = () => {
    const { nextStep } = goNext(currentStep, machineData);
    if (nextStep) {
      setCurrentStep(nextStep);
    } else if (currentStep === STEPS.DONE) {
      // "Withdraw more" → restart
      resetState();
    }
  };

  const handleBack = () => {
    const { prevStep } = goBack(currentStep, machineData);
    if (prevStep === null) handleClose();
    else setCurrentStep(prevStep);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case STEPS.AMOUNT:
        return (
          <AmountStep
            amount={amount}
            setAmount={setAmount}
            availableBalance={sourceAvailableBalance}
            currencyCode={currencyCode}
            sourceIban={sourceIban}
          />
        );
      case STEPS.DESTINATION:
        return (
          <DestinationStep
            amount={amount}
            currencyCode={currencyCode}
            transferSpeed={transferSpeed}
            setTransferSpeed={setTransferSpeed}
            selectedBank={selectedBank}
            setSelectedBank={setSelectedBank}
            savedBanks={savedBanks}
          />
        );
      case STEPS.REVIEW:
        return (
          <ReviewStep
            amount={amount}
            transferSpeed={transferSpeed}
            selectedBank={selectedBank}
            selectedIban={sourceIban}
            currencyCode={currencyCode}
          />
        );
      case STEPS.OTP:
        return (
          <OTPConfirmation
            setter={setCurrentStep}
            setterValue={STEPS.DONE}
            hideOtp={() => {}}
            callback={async (setter) => setter(true)}
            resendHandler={() => {}}
            authType={authType}
            setAuthType={setAuthType}
            onCancel={handleClose}
          />
        );
      case STEPS.DONE:
        return <DoneStep />;
      default:
        return null;
    }
  };

  const showFooter = currentStep !== STEPS.OTP;
  const isDone = currentStep === STEPS.DONE;

  const renderBody = () => (
    <div
      className={styles.modalLayout}
      style={{ flexDirection: width < 1000 ? "column" : "row" }}
    >
      {/* {width >= 1000 && ( */}
      <div className={styles.left}>
        <div
          style={{
            width: width > 1000 ? "100%" : "100%",
          }}
        >
          <div className={styles.bankHeader}>
            <div className={styles.bankIcon}>
              <ArrowRightIcon />
            </div>
            <h2>{t("Withdraw balance")}</h2>
          </div>
          <div className={styles.progressEffect} style={{ marginTop: "2rem" }}>
            {SIDEBAR_STEPS.map((item, index) => {
              const IconComponent = SIDEBAR_ICONS[item.stepName];
              return (
                <SidebarProgress
                  key={item.stepName}
                  stepLabel={item.stepLabel}
                  label={item.label}
                  Icon={IconComponent}
                  isActive={isSidebarStepActive(item, currentStep)}
                  isCompleted={isSidebarStepCompleted(item, currentStep)}
                  showBar={index < SIDEBAR_STEPS.length - 1}
                />
              );
            })}
          </div>
        </div>
        {width > 700 && (
          <div className={addFundsStyles.contactBox}>
            <ContactBox />
          </div>
        )}
      </div>
      {/* )} */}

      <div
        className={styles.rightPanel}
        style={{ width: width < 1000 ? "100%" : undefined }}
      >
        <div className={styles.content}>{renderStepContent()}</div>

        {showFooter && (
          <div className={styles.footer}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={handleClose}
            >
              {t("Cancel")}
            </button>
            <div className={styles.footerNav}>
              {!isDone && (
                <button
                  type="button"
                  className={styles.backBtn}
                  onClick={handleBack}
                >
                  <ChevronLeft />
                  {t("Back")}
                </button>
              )}
              <button
                type="button"
                className={styles.nextBtn}
                disabled={disabled}
                onClick={handleContinue}
              >
                {isDone ? t("Withdraw more") : continueLabel}
                <ChevronRight />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      <Modal
        isOpen={isOpen}
        style={{
          minWidth: width > 1000 ? "900px" : "0%",
          // marginLeft: width > 1000 ? "0px" : "29px",
          // padding: "10px",
        }}

        toggle={handleClose}
      >
        <ModalBody style={{ padding: "20px" }}>{renderBody()}</ModalBody>
      </Modal>

      {/* {isOpen && width < 1000 && (
                <div style={{ padding: "16px" }}>{renderBody()}</div>
            )} */}
    </>
  );
};

export default WithdrawBalanceModal;
