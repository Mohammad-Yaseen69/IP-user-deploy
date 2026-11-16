import { useMemo, useState, useContext, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Modal, ModalBody } from "reactstrap";
import axios from "axios";
import useWindowWidth from "../../../utils/useWindowWidth";
import { UserContext } from "../../../Context/UserContext";
import { decryptData } from "../../../Helper/EssentilaMethods/Decryption";
import { CARD_TYPES } from "../../CreditInput/CreditCardTypes";
import PaymentSelect from "../../MyMasterCard/PaymentModal/PaymentSelectStep";
import PaymentStep from "../../MyMasterCard/PaymentModal/PaymentStep";
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
} from "../../../stateMachines/addFundsFlow";
import AmountStep from "./AmountStep";
import ReviewStep from "./ReviewStep";
import DoneStep from "./DoneStep";
import styles from "./addFundsModal.module.scss";
import SidebarProgress from "../VirtualIbanModal/SidebarProgress";
import GpsFix from "../VirtualIbanModal/icons/gpsFix.svg";
import Coins from "../VirtualIbanModal/icons/coins.svg";
import SealCheck from "../VirtualIbanModal/icons/SealCheck.svg";

const IdBadgeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <rect x="3" y="2.25" width="12" height="13.5" rx="1.5" stroke="#F8F9FC" strokeWidth="1.2" />
    <circle cx="9" cy="8.25" r="2.25" stroke="#F8F9FC" strokeWidth="1.2" />
    <path
      d="M5.25 14.25C5.25 12.1789 6.92893 10.5 9 10.5C11.0711 10.5 12.75 12.1789 12.75 14.25"
      stroke="#F8F9FC"
      strokeWidth="1.2"
    />
    <path d="M7.5 3.75H10.5" stroke="#F8F9FC" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

const PlusIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path
      d="M9 3.75V14.25"
      stroke="#F2EEFF"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M3.75 9H14.25"
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
  [STEPS.PAYMENT_METHOD]: () => (
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

const AddFundsModal = ({ isOpen, toggle }) => {
  const { t } = useTranslation();
  const width = useWindowWidth();

  const { userWallets, getUserWallets, userDetails, authHeader } = useContext(UserContext);

  const [currentStep, setCurrentStep] = useState(STEPS.AMOUNT);
  const [amount, setAmount] = useState("2500");
  const [fundingMethod, setFundingMethod] = useState("instapay_wallet");

  const [walletState, setWalletState] = useState({});
  const [saveCard, setSaveCard] = useState(false);
  const [cards, setCards] = useState([]);
  const [selectedSaveCard, setSelectedSaveCard] = useState({});
  const [cardDetail, setCardDetails] = useState({
    cardNumber: "",
    cardExpiry: "",
    cardCVC: "",
    cardHolderName: "",
  });
  const [cardNumberError, setCardNumberError] = useState(null);
  const [cardType, setCardType] = useState({
    type: "placeholder",
    format: "",
    startPattern: "",
    maxCardNumberLength: 16,
    cvcLength: 3,
  });

  useEffect(() => {
    getUserWallets();
  }, []);

  useEffect(() => {
    const getSavedCards = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_IP_DEV_API}/api/trust-payment/get-user-pan-list/${userDetails?._id}`,
          {
            headers: authHeader,
          },
        );
        const dec = decryptData(res.data.data);
        setCards(dec?.panList ?? []);
      } catch {
        setCards([]);
      }
    };
    if (userDetails?._id) {
      getSavedCards();
    }
  }, [userDetails]);

  useEffect(() => {
    const getCardTypeByValue = function getCardTypeByValue(value) {
      return CARD_TYPES.filter(function (cardType) {
        return cardType.startPattern.test(value);
      })[0];
    };
    const type = getCardTypeByValue(cardDetail.cardNumber);
    if (!type || cardDetail.cardNumber.length < type?.maxCardNumberLength) {
      setCardNumberError(t("Invalid Card Number"));
    } else {
      setCardNumberError("");
    }
    setCardType(
      type ?? {
        type: "placeholder",
        format: "",
        startPattern: "",
        maxCardNumberLength: 16,
        cvcLength: 3,
      },
    );
  }, [cardDetail.cardNumber]);

  const filteredWallets = useMemo(() => {
    return userWallets
      ?.filter(
        (item) =>
          item?.wallet_type === "insta" &&
          !item?.blocked &&
          !item?.admin_blocked &&
          item?.status === "active",
      )
      ?.sort((a, b) => (b?.default === true ? 1 : -1))
      ?.map((item) => ({ name: item?.currency?.code, ...item }));
  }, [userWallets]);

  const machineData = useMemo(
    () => ({
      amount,
      fundingMethod,
      walletState,
      selectedSaveCard,
      cardDetail,
      cardNumberError,
    }),
    [amount, fundingMethod, walletState, selectedSaveCard, cardDetail, cardNumberError],
  );

  const disabled = getDisabledState(currentStep, machineData);
  const continueLabel = getContinueLabel(currentStep, t);

  const resetState = () => {
    setCurrentStep(STEPS.AMOUNT);
    setAmount("2500");
    setFundingMethod("instapay_wallet");
    setWalletState({});
    setSelectedSaveCard({});
    setCardDetails({
      cardNumber: "",
      cardExpiry: "",
      cardCVC: "",
      cardHolderName: "",
    });
    setCardNumberError(null);
  };

  const handleClose = () => {
    resetState();
    toggle?.();
  };

  const handleContinue = () => {
    const { nextStep } = goNext(currentStep, machineData);
    if (nextStep) {
      if (
        nextStep === STEPS.REVIEW &&
        fundingMethod === "wallet" &&
        Object.keys(walletState).length === 0
      ) {
        setWalletState(filteredWallets?.[0] || {});
      }
      setCurrentStep(nextStep);
    } else if (currentStep === STEPS.DONE) {
      // "Add more funds" → restart
      resetState();
    }
  };

  const handleBack = () => {
    if (currentStep === STEPS.PAYMENT_METHOD) setFundingMethod("");
    if (currentStep === STEPS.PAYMENT_DETAILS) {
      setWalletState({});
      setSelectedSaveCard({});
    }
    if (currentStep === STEPS.REVIEW && fundingMethod !== "paypal") setWalletState({});

    const { prevStep } = goBack(currentStep, machineData);
    if (prevStep === null) handleClose();
    else setCurrentStep(prevStep);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case STEPS.AMOUNT:
        return <AmountStep amount={amount} setAmount={setAmount} />;
      case STEPS.PAYMENT_METHOD:
        return (
          <PaymentSelect
            styling={{ marginTop: "1rem" }}
            paymentType={fundingMethod}
            setPaymentType={setFundingMethod}
            isInIban
          />
        );
      case STEPS.PAYMENT_DETAILS:
        return (
          <PaymentStep
            cardDetail={cardDetail}
            cardNumberError={cardNumberError}
            cardType={cardType}
            cards={cards}
            disabledBtnS={disabled}
            filteredWallets={filteredWallets}
            paymentType={fundingMethod}
            saveCard={saveCard}
            setCardDetails={setCardDetails}
            setFeeDetails={() => {}}
            setSaveCard={setSaveCard}
            setSelectedSaveCard={setSelectedSaveCard}
            setStep={() => {}}
            setWalletState={setWalletState}
            vvcCardType="standard"
            walletState={walletState}
            setCards={setCards}
            selectedSaveCard={selectedSaveCard}
            applePay={false}
            googlePay={false}
            hideButtons={true}
            marginTop="1rem"
          />
        );
      case STEPS.REVIEW:
        return (
          <ReviewStep amount={amount} fundingMethod={fundingMethod} selectedWallet={walletState} />
        );
      case STEPS.DONE:
        return <DoneStep />;
      default:
        return null;
    }
  };

  const showFooter = width > 1000;
  const isDone = currentStep === STEPS.DONE;

  const renderBody = () => (
    <div className={styles.modalLayout} style={{ flexDirection: width < 1000 ? "column" : "row" }}>
      {width >= 1000 && (
        <div className={addFundsStyles.left}>
          <div>
            <div className={styles.bankHeader}>
              <div className={styles.bankIcon}>
                <PlusIcon />
              </div>
              <h2>{t("Add funds")}</h2>
            </div>
            <div className={addFundsStyles.progressEffect} style={{ marginTop: "2rem" }}>
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
          <div className={addFundsStyles.contactBox}>
            <ContactBox />
          </div>
        </div>
      )}

      <div className={styles.rightPanel} style={{ width: width < 1000 ? "100%" : undefined }}>
        <div className={styles.content}>{renderStepContent()}</div>

        {showFooter && (
          <div className={styles.footer}>
            <button type="button" className={styles.cancelBtn} onClick={handleClose}>
              {t("Cancel")}
            </button>
            <div className={styles.footerNav}>
              {!isDone && (
                <button type="button" className={styles.backBtn} onClick={handleBack}>
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
                {isDone ? (
                  <>
                    {t("Add more funds")}
                    <PlusIcon />
                  </>
                ) : (
                  <>
                    {continueLabel}
                    <ChevronRight />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      <Modal isOpen={isOpen && width > 1000} style={{ minWidth: "900px" }} toggle={handleClose}>
        <ModalBody style={{ padding: "20px" }}>{renderBody()}</ModalBody>
      </Modal>

      {isOpen && width < 1000 && <div style={{ padding: "16px" }}>{renderBody()}</div>}
    </>
  );
};

export default AddFundsModal;
