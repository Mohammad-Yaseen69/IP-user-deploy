import { Modal, ModalBody } from "reactstrap";
import { useTranslation } from "react-i18next";
import styles from "./styles/index.module.css";
import { useEffect, useMemo, useReducer, useState } from "react";
import StepOne from "./StepOne";
import { Link } from "react-router-dom";
import { ChevronRight, HelpCircle, X } from "react-feather";
import Country from "./Country";
import CreditCard from "../../PaymentsNewer/InternationalFlow/CreditCard";
import axios from "axios";
import { decryptData } from "../../../Helper/EssentilaMethods/Decryption";
import InstaPayLoader from "../../Loader";
import { encryptData } from "../../../Helper/EssentilaMethods/Encryption";
import TrustpaymentPage from "../../AddFunds/WalletFund/CreditTransaction";
import int_styles from "../../PaymentsNewer/Mobile/styles/International.module.css";
import paym_styles from "../../PaymentsNewer/InternationalFlow/styles/index.module.css";
import ErrorModal from "../../PaymentsNewer/InternationalFlow/ErrorModal";
import { createShambeToken } from "../../../Helper/CreateToken";
import NotFoundModal from "../../NotFound/NotFoundModal";
import logo from "../instapay_black.svg";
import { LimitsErrorMessage } from "../../PaymentsNewer/OTPConfirmation";
import { apiErrorMessage } from "../../PaymentsNewer/InternationalFlow";

import BankDeposit from "../../AddFunds/WalletFundsFlow/BankDeposit";
import PaymentDetails from "./PaymentDetails";
import RecipientDetails from "./RecipientDetails";
import PaypalDetails from "./PaypalDetails";
import MobileWalletStatus from "./MobileWalletStatus";
import PlaidBankTransfer from "../../AddFunds/WalletFundsFlow/PlaidBankTransfer";
import { isCardValid, isPersonalInfoValid, isShippingValid } from "../../../utils/Functions/validations";

const initialState = {
  loading: false,
  step: 1,
  payment_type: {},
  country: {},
  cardNumber: "",
  expiry: "",
  cvc: "",
  cardHolderName: "",
  cardError: "",
  cardTransactionDetails: {},
  fullName: "",
  phone: "",
  email: "",
  exchange_rate: {},
  exchange_rate_error: "",
  paypal_fx: {},
  error: "",
  phone_error: "",
  dob: "",
  paymentRef: "",
  shippingDetails: {
    houseNo: "",
    street: "",
    city: "",
    state: "",
    country: null,
    zipCode: "",
  },
  bankStep: 1,
  mobileWalletSuccess: false,
  transactionId: "",
  subscriptionToken: "",
};

function reducer(state, action) {
  switch (action.type) {
    case "UPDATE_FIELD":
      return {
        ...state,
        [action.field]: action.value,
      };
    default:
      return state;
  }
}

const PayAsGuest = ({
  amount,
  isOpen,
  toggle,
  user,
  wallet,
  username,
  isShipping,
  invoiceId,
  type = "payment_address",
  planId,
  subscriptionId
}) => {
  const { t } = useTranslation();
  const [data, dispatch] = useReducer(reducer, initialState);
  const dataHandler = (field, value) => {
    dispatch({ type: "UPDATE_FIELD", field, value });
  };


  const isReferenceRequired = useMemo(() => {
    const usernamesList = ["spmfrance", "usharellc"]
    if (usernamesList.includes(username)) {
      return true
    } else {
      return false
    }
  }, [username])

  useEffect(() => {
    if (type === "subscription") {
      dataHandler("step", 2)
    }
  }, [type])
  const initiatePaypalPayment = async () => {
    dataHandler("loading", true);
    let formattedDob = data.dob;
    if (formattedDob && formattedDob.includes("-")) {
      const [yyyy, mm, dd] = formattedDob.split("-");
      formattedDob = `${dd}-${mm}-${yyyy}`;
    }
    try {
      const payload = {
        token: data.exchange_rate?.paypal_token,
        name: data.fullName,
        email: data.email,
        phone: data.phone,
        dob: formattedDob,
        client_reference: data.paymentRef,
        iso_code: data.country?.alpha3,
        payment_type: type
      };

      if (planId) {
        payload.plan_id = planId
      }
      if (invoiceId) {
        payload.invoice_id = invoiceId;

        if (isShipping) {
          payload.shipping_details = {
            ...data.shippingDetails,
            country: data.shippingDetails?.country?.name,
          };
        }
      }

      if (type === "subscription") {
        payload.subscription_id = subscriptionId;
      }

      const enc = encryptData(payload);

      const res = await axios.post(
        `${import.meta.env.VITE_IP_DEV_API}/api/guest-pay${type === "subscription" ? "/initiate-subscription-paypal" : "/initiate-paypal"}`,
        {
          data: enc,
        }
      );

      const dec = decryptData(res.data.data);
      window.location.href = dec?.url;
    } catch (error) {
      const dec = decryptData(error?.response?.data?.data);
      const err1 = LimitsErrorMessage(dec.code);
      const err2 = apiErrorMessage(dec.message);

      if (err1) {
        dataHandler("error", err1);
      } else if (err2) {
        dataHandler("error", err2);
      } else {
        dataHandler(
          "error",
          dec?.message ??
          "We cannot process your request at the moment, please try again later."
        );
      }
      dataHandler("loading", false);
    }
  };
  const [showCardModal, setShowCardModal] = useState(false);

  const generateInitiatePayload = (isBankTransfer) => {
    let formattedDob = data.dob;
    if (formattedDob && formattedDob.includes("-")) {
      const [yyyy, mm, dd] = formattedDob.split("-");
      formattedDob = `${dd}-${mm}-${yyyy}`;
    }

    const payload = {
      token: data.exchange_rate?.token,
      name: data.fullName,
      email: data.email,
      phone: data.phone,
      iso_code: data.country?.alpha3,
      dob: formattedDob,
      client_reference: data.paymentRef,
      payment_type: type
    };

    if (isBankTransfer) {
      payload.wallet_id = wallet?.wallet_id
    }

    if (planId) {
      payload.plan_id = planId
    }

    if (invoiceId) {
      payload.invoice_id = invoiceId;

      if (isShipping) {
        payload.shipping_details = {
          ...data.shippingDetails,
          country: data.shippingDetails?.country?.name,
        };
      }
    }

    if (type === "subscription") {
      payload.subscription_id = subscriptionId;
    }

    return payload
  }
  const initiateCardPayment = async () => {
    dataHandler("loading", true);
    let formattedDob = data.dob;
    if (formattedDob && formattedDob.includes("-")) {
      const [yyyy, mm, dd] = formattedDob.split("-");
      formattedDob = `${dd}-${mm}-${yyyy}`;
    }

    try {
      const payload = {
        se_shambey: createShambeToken(data),
        token: data.exchange_rate?.token,
        name: data.fullName,
        email: data.email,
        phone: data.phone,
        iso_code: data.country?.alpha3,
        dob: formattedDob,
        client_reference: data.paymentRef,
        payment_type: type,
        customer_town: data.customerTown,
        customer_street: data.customerStreet,
      };

      if (planId) {
        payload.plan_id = planId
      }

      if (invoiceId) {
        payload.invoice_id = invoiceId;

        if (isShipping) {
          payload.shipping_details = {
            ...data.shippingDetails,
            country: data.shippingDetails?.country?.name,
          };
        }
      }

      if (type === "subscription") {
        payload.subscription_id = subscriptionId;
      }

      const enc = encryptData(payload);

      const res = await axios.post(
        `${import.meta.env.VITE_IP_DEV_API
        }/api/guest-pay${type === "subscription" ? "/subscription/initiate-card-payment" : "/initiate-card-payment"}`,
        {
          data: enc,
        }
      );

      const dec = decryptData(res.data.data);
      console.log(dec);
      dataHandler("cardTransactionDetails", dec);
    } catch (error) {
      const dec = decryptData(error?.response?.data?.data);
      const err1 = LimitsErrorMessage(dec.code);
      const err2 = apiErrorMessage(dec.message);

      if (dec?.message === "invalid_card_details") {
        setShowCardModal(true);
      } else if (err1) {
        dataHandler("error", err1);
      } else if (err2) {
        dataHandler("error", err2);
      } else {
        dataHandler(
          "error",
          dec?.message ??
          "We cannot process your request at the moment, please try again later."
        );
      }
      dataHandler("loading", false);
    }
  };

  const initiateMobileWalletPayment = async () => {
    dataHandler("loading", true);


    try {
      const payload = generateInitiatePayload()
      const enc = encryptData(payload);

      const res = await axios.post(
        `${import.meta.env.VITE_IP_DEV_API
        }/api/guest-pay${type === "subscription" ? "/subscription/initiate-wallet-payment" : "/initiate-wallet-payment"}`,
        {
          data: enc,
        }
      );

      const dec = decryptData(res.data.data);

      const subscriptionToken = dec?.data?.subscriptionToken
      const transactionId = dec?.data?.transactionId
      // use these 2 to connect to server

      console.log(dec);
      dataHandler("transactionId", transactionId);
      dataHandler("subscriptionToken", subscriptionToken);
      dataHandler("mobileWalletSuccess", true);
      dataHandler("loading", false);
    } catch (error) {
      const dec = decryptData(error?.response?.data?.data);
      const err1 = LimitsErrorMessage(dec.code);
      const err2 = apiErrorMessage(dec.message);

      if (dec?.message === "invalid_card_details") {
        setShowCardModal(true);
      } else if (err1) {
        dataHandler("error", err1);
      } else if (err2) {
        dataHandler("error", err2);
      } else {
        dataHandler(
          "error",
          dec?.message ??
          "We cannot process your request at the moment, please try again later."
        );
      }
      dataHandler("loading", false);
    }
  };

  const checkIfPhoneIsValid = async (callback) => {
    dataHandler("loading", true);
    dataHandler("phone_error", "");
    try {
      const payload = { number: `+${data.phone}` };
      const enc = encryptData(payload);

      const res = await axios.post(
        `${import.meta.env.VITE_IP_DEV_API}/api/dt/check-number-public`,
        {
          data: enc,
        }
      );
      const decrypted = decryptData(res.data.data);
      console.log(decrypted);
      callback();
    } catch (error) {
      const dec = decryptData(error?.response?.data?.data);
      console.log(dec);
      dataHandler(
        "phone_error",
        "Incorrect phone number, please enter a valid number."
      );
    } finally {
      dataHandler("loading", false);
    }
  };

  const onClickHandler = () => {
    switch (data.step) {
      case 1:
        dataHandler("step", 2);
        break;
      case 2:
        if (type === "subscription" && data.payment_type?.value !== "card") {
          dataHandler("step", 4);

        } else {
          dataHandler("step", 3);
        }
        break;
      case 3:
        if (data.payment_type?.value === "card") {
          if (type === "subscription") {
            dataHandler("step", 5)
          } else {
            dataHandler("step", 4);
          }

        } else {
          checkIfPhoneIsValid(() => {
            dataHandler("step", 4)
            dataHandler("exchange_rate_backup", data.exchange_rate)
          });
        }
        break;
      case 4:
        if (data.payment_type?.value === "paypal") {
          initiatePaypalPayment();
        } else if (data.payment_type?.value === "mobile_wallet") {
          initiateMobileWalletPayment()
        } else {
          checkIfPhoneIsValid(() => dataHandler("step", 5));
        }
        break;
      case 5:
        if (data.payment_type?.value === "card") {
          initiateCardPayment();
        } else {
          // dataHandler("step", 5)
        }
        break;

      default:
        break;
    }
  };
  const onBackClickHandler = () => {
    switch (data.step) {
      case 1:
        toggle();
        break;
      case 2:
        if (type === "subscription") {
          toggle();
        } else {
          dataHandler("step", 1);
          dataHandler("payment_type", {});
        }
        break;
      case 3:
        dataHandler("step", 2);
        break;
      case 4:
        if (type === "subscription") {
          dataHandler("step", 2);
        } else {
          dataHandler("step", 3);
        }
        break;
      case 5:
        if (type === "subscription" && data.payment_type?.value === "card") {
          dataHandler("step", 3);
        } else {
          dataHandler("step", 4);
        }
        break;

      default:
        break;
    }
  };

  useEffect(() => {
    console.log(data);
  }, [data]);
  const disabled = useMemo(() => {
    let disabled = false;

    if (data.step === 1) {
      disabled = !data.country?.name || data?.exchange_rate_error;
    }

    if (data.step === 2) {
      disabled = !data.payment_type?.value;
    }

    if (data.step === 3) {
      if (data.payment_type?.value !== "card") {
        disabled = !isPersonalInfoValid(data, isReferenceRequired) || (isShipping ? !isShippingValid(data.shippingDetails) : false);
      } else {
        return !isCardValid(data);
      }
    }

    if (data.step === 4) {
      if (data.payment_type?.value === "card") {
        disabled = !isPersonalInfoValid(data, false) || !data.customerTown || !data.customerStreet || (isShipping ? !isShippingValid(data.shippingDetails) : false);
      }
    }

    return disabled;
  }, [data, isShipping, isReferenceRequired]);

  const getFeesPaypal = async () => {
    dataHandler("loading", true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_IP_DEV_API}/api/guest-pay/paypal-fee/${wallet?.wallet_id
        }/${amount}?payment_type=${type === "subscription" ? "plan" : type}`
      );
      const dec = decryptData(res.data.data);
      console.log(dec);
      dataHandler("exchange_rate", {
        fee: {
          amount: dec?.data?.fee,
          paymentAddressFee: dec?.data?.paymentAddressFee,
        },
        sending: { currency: wallet?.currency?.code, amount: amount },
        receiver: {
          currency: wallet?.currency?.code,
          amount: dec?.data?.recipient_amount,
        },
        total: dec?.data?.total_amount,
        paypal_token: dec?.data?.token,
        rate: dec?.data?.rate,
      });

      dataHandler("paypal_fx", {
        amount: dec?.data?.converted_amount,
        exchange_rate: dec?.data?.rate,
      });
    } catch (error) {
      const dec = decryptData(error?.response?.data?.data);
      dataHandler(
        "exchange_rate_error",
        dec?.message ??
        "We cannot process your request at the moment, please try again later."
      );
      console.log(dec);
    } finally {
      dataHandler("loading", false);
    }
  };

  const getFeesMobileWallet = async () => {

    dataHandler("loading", true);
    dataHandler("exchange_rate_error", "")
    try {
      const res = await axios.get(`${import.meta.env.VITE_IP_DEV_API}/api/guest-pay/${data.payment_type?.value === "bank_transfer" ? "bank" : "mobile-wallet"}-fee/${wallet?.wallet_id}/${amount}${data.payment_type?.value === "bank_transfer" ? "" : `/${data.country?.alpha3}`}?payment_type=${type === "subscription" ? "plan" : type}&iso_code=${data.country?.alpha3}`);
      const dec = decryptData(res.data.data);

      const apiData = data.payment_type?.value === "bank_transfer" ? dec?.data : dec

      const exchange_rate_details = {
        fee: {
          amount: apiData?.feeDetails ?? apiData?.fee,
          paymentAddressFee: apiData?.paymentAddressFee,
        },
        sending: { currency: wallet?.currency?.code, amount: amount },
        receiver: {
          currency: wallet?.currency?.code,
          amount: apiData?.recipient_amount,
        },
        external_amount: apiData?.external_amount,
        total: apiData?.total ?? apiData?.total_amount,
        token: apiData?.token,
        plaid_amount: apiData?.converted_amount,
        plaid_currency: apiData?.converted_currency,
        plaid_fx: apiData?.rate
      }

      console.log(exchange_rate_details, "data")
      dataHandler("exchange_rate", exchange_rate_details);
    } catch (error) {
      console.log(error)
      const dec = decryptData(error?.response?.data?.data);
      dataHandler("exchange_rate_error", dec?.message ?? "We cannot process your request at the moment, please try again later.");
      console.log(dec);
    } finally {
      dataHandler("loading", false);
    }
  };
  const getFeesCard = async () => {

    dataHandler("loading", true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_IP_DEV_API}/api/guest-pay/card-fee/${wallet?.wallet_id}/${amount}?payment_type=${type === "subscription" ? "plan" : type}&isBank=${data.payment_type?.value === "bank" ? true : false} `
      );
      const dec = decryptData(res.data.data);
      console.log(dec);
      dataHandler("exchange_rate", {
        fee: {
          amount: dec?.feeDetails,
          paymentAddressFee: dec?.paymentAddressFee,
        },
        sending: { currency: wallet?.currency?.code, amount: amount },
        receiver: {
          currency: wallet?.currency?.code,
          amount: dec?.recipient_amount,
        },
        total: dec?.total,
        token: dec?.token,
      });
    } catch (error) {
      const dec = decryptData(error?.response?.data?.data);
      dataHandler(
        "exchange_rate_error",
        dec?.message ??
        "We cannot process your request at the moment, please try again later."
      );
      console.log(dec);
    } finally {
      dataHandler("loading", false);
    }
  };

  useEffect(() => {
    if (data.payment_type?.value === "paypal") {
      getFeesPaypal();
    }
    if (data.payment_type?.value === "card" || data.payment_type?.value === "bank") {
      getFeesCard();
    }
    if (data.payment_type?.value === "mobile_wallet" || data.payment_type?.value === "bank_transfer") {
      getFeesMobileWallet()
    }
  }, [data.payment_type]);

  const [allowed, setAllowed] = useState([]);
  useEffect(() => {
    const getPayouts = async () => {
      dataHandler("loading", true);
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_IP_DEV_API}/api/guest-pay/payment-methods/${user?.level?._id}?accountId=${user?._id}&country_iso_code=${data?.country?.alpha3}${type === "invoice" ? "&isInvoice=true" : ""}`
        );
        const dec = decryptData(res.data.data);
        setAllowed(dec?.data ?? []);
      } catch (error) {
        const dec = decryptData(error?.response?.data?.data);
        dataHandler("error", dec?.message);
      } finally {
        dataHandler("loading", false);
      }
    };

    if (user?.level?._id) {
      getPayouts();
    }
  }, [user, data?.country]);


  return (
    <>
      {showCardModal && (
        <NotFoundModal
          isOpen={showCardModal}
          toggle={() => setShowCardModal(false)}
          buttonText="Close"
          messages={[
            `Oops! It looks like the card you entered isn’t recognized as being issued in ${data.country?.name}.`,
            `For security and compatibility, we currently accept only cards issued in the same country that you selected on first step. Please use a card issued in ${data.country?.name} to complete your transaction.`,
            `Thank you for your understanding!`,
          ]}
          title="Payment Failed"
          reEnter={() => dataHandler("step", 3)}
        />
      )}

      {data.cardTransactionDetails?.transaction_ref && (
        <TrustpaymentPage
          amount={amount}
          card_cvc={data.cvc}
          card_expiry={data.expiry}
          card_number={data.cardNumber}
          currency={wallet?.currency?.code}
          transaction={data.cardTransactionDetails}
          url={`${import.meta.env.VITE_IP_DEV_API
            }/api/guest-pay${type === "subscription" ? "/subscription" : ""}/confirm-card-payment/${data.cardTransactionDetails?.transaction_ref
            }`}
          guestUserName={username}
          guestWallet={wallet}
          guestUser={user}
          guestDetails={{
            name: data.fullName,
            phone: data.phone,
            email: data.email,
          }}
          compareToken={false}
        />
      )}
      {data.error && (
        <ErrorModal
          isOpen={data.error}
          toggle={() => {
            dataHandler("error", "");
          }}
          message={data.error}
        />
      )}
      {window.innerWidth > 1000 ? (
        <Modal
          isOpen={isOpen}
          style={{ width: "100vw", maxWidth: "1000px", margin: "0px auto" }}
          contentClassName={styles.content}
        >
          <ModalBody style={{ position: "relative" }} className={styles.body}>
            <button
              style={{
                all: "unset",
                cursor: "pointer",
                position: "absolute",
                top: "10px",
                right: "10px",
                zIndex: 9999,
              }}
              onClick={toggle}
            >
              <X color="black" />
            </button>
            {data.mobileWalletSuccess ? (
              <MobileWalletStatus
                transactionId={data.transactionId}
                token={data.subscriptionToken}
                toggle={toggle}
              />
            ) : (
              <>
                <div className={styles.left}>
                  <div className={styles.l_top}>
                    <h1>{t("PAY AS A GUEST")}</h1>
                    {data.payment_type?.value !== "bank_transfer" || data.step < 4 ?
                      <h2>
                        {data.step === 1 && t("Select Your Country")}
                        {data.step === 2 && t("Select Payment Type")}
                        {data.step === 3 &&
                          (data.payment_type?.value === "card"
                            ? t("Enter Card Details")
                            : t("Enter Your Personal Details"))}
                        {data.step === 4 &&
                          (data.payment_type?.value === "card"
                            ? t("Enter Your Personal Details")
                            : t("Review Payment"))}
                        {data.step === 5 &&
                          (data.payment_type?.value === "card"
                            ? t("Review Payment")
                            : "")}
                      </h2> :
                      <h2>{t("Bank Transfer")}</h2>
                    }
                  </div>
                  {data.step > 1 && (
                    <div className={styles.l_bottom}>
                      {data.loading ? (
                        <div style={{ height: "200px", width: "200px" }}>
                          <InstaPayLoader />
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>
                <div className={styles.right}>
                  {data.step === 1 && (
                    <Country username={username} data={data} dataHandler={dataHandler} />
                  )}

                  {data.step === 2 && (
                    <StepOne
                      data={data}
                      dataHandler={dataHandler}
                      allowed={allowed}
                      wallet={wallet}
                    />
                  )}
                  {data.step === 3 &&
                    (data.payment_type?.value === "card" ?
                      (
                        <div style={{ height: "100%" }}>
                          <div className={styles.bot_top}>
                            <h5>{t("Payment Details")}</h5>
                            <span>
                              {t(
                                "Complete your payment by providing your payment details"
                              )}
                            </span>
                          </div>
                          <CreditCard
                            showSave={false}
                            data={data}
                            dataHandler={dataHandler}
                            tokenUrl={() => ""}
                            url={""}
                            inGuest={true}
                            showCards={false}
                          />
                        </div>
                      ) :
                      <RecipientDetails
                        data={data}
                        dataHandler={dataHandler}
                        isShipping={isShipping}
                        isReferenceRequired={isReferenceRequired}
                      />
                    )
                  }
                  {data.step === 4 &&
                    (
                      data.payment_type?.value === "paypal" || data.payment_type?.value === "mobile_wallet" ?
                        <PaymentDetails
                          dataHandler={dataHandler}
                          data={data}
                          amount={amount}
                        />
                        :
                        data.payment_type?.value === "card" ?
                          <RecipientDetails
                            data={data}
                            dataHandler={dataHandler}
                            isReferenceRequired={isReferenceRequired}
                            isShipping={isShipping}
                          />
                          :
                          data?.payment_type?.value === "bank_transfer" ?
                            <PlaidBankTransfer
                              type={'payment_address'}
                              data={data}
                              dataHandler={dataHandler}
                              toggle={toggle}
                              initiatePayload={() => {
                                return generateInitiatePayload(true)
                              }}
                            />
                            :
                            <BankDeposit
                              type={'payment_address'}
                              data={{ ...data, wallet }}
                              dataHandler={dataHandler}
                              guestDetails={{
                                name: data.fullName,
                                phone: data.phone,
                                email: data.email,
                                iso_code: data.country?.alpha3
                              }}
                              client_reference={data.paymentRef}
                              toggle={toggle}
                            />
                    )
                  }
                  {data.step === 5 &&
                    (data.payment_type?.value === "card" ? (
                      // <StepFive
                      <PaymentDetails
                        dataHandler={dataHandler}
                        data={data}
                        amount={amount}
                      />
                    ) : (
                      ""
                    ))}

                  {((data.payment_type?.value !== "bank" && data?.payment_type?.value !== "bank_transfer") || data.step < 4) &&
                    <div className={styles.bottom} style={{ marginTop: "auto" }}>
                      <Link
                        to={"https://insta-pay.ch/faqs"}
                        target="_blank"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: ".7rem",
                        }}
                      >
                        <HelpCircle size={16} />
                        {t("Trouble Sending Money")}
                      </Link>
                      <div className={styles?.buttons}>
                        <button
                          className={styles.transparent}
                          disabled={data.loading}
                          onClick={onBackClickHandler}
                        >
                          {t("Back")}
                        </button>
                        {data.loading ? <div style={{ width: "100px" }}> <InstaPayLoader /> </div> :
                          <button
                            disabled={data.loading || disabled}
                            onClick={onClickHandler}
                          >
                            {t("Next")}
                            <ChevronRight size={18} />
                          </button>
                        }
                      </div>
                    </div>
                  }
                </div>
              </>
            )}
          </ModalBody>
        </Modal>
      ) : (
        <div
          style={{ background: "#f1eef9" }}
          className={styles.payment_flow_mobile}
        >
          <div className={int_styles.container}>
            <button
              style={{
                all: "unset",
                cursor: "pointer",
                position: "absolute",
                top: "10px",
                right: "10px",
                zIndex: 9999,
              }}
              onClick={toggle}
            >
              <X color="black" />
            </button>

            {data.mobileWalletSuccess ? (
              <MobileWalletStatus
                transactionId={data.transactionId}
                token={data.subscriptionToken}
                toggle={toggle}
              />
            ) : (
              <>
                <div className={paym_styles.mobile} style={{ marginTop: 0 }}>
                  <div className={paym_styles.m_top}>
                    <img
                      src={logo}
                      style={{ width: "130px", margin: "0px auto 20px auto" }}
                      alt=""
                    />
                    <h1 style={{ color: "#906EF5", letterSpacing: "1.5px" }}>
                      {t("PAY AS A GUEST")}
                    </h1>
                    {data.payment_type?.value !== "bank_transfer" || data.step < 4 ?
                      <h2>
                        {data.step === 1 && t("Select Your Country")}
                        {data.step === 2 && t("Select Payment Type")}
                        {data.step === 3 &&
                          (data.payment_type?.value === "card"
                            ? t("Enter Card Details")
                            : t("Enter Your Personal Details"))}
                        {data.step === 4 &&
                          (data.payment_type?.value === "card"
                            ? t("Enter Your Personal Details")
                            : t("Review Payment"))}
                        {data.step === 5 &&
                          (data.payment_type?.value === "card"
                            ? t("Review Payment")
                            : "")}
                      </h2> :
                      <h2>{t("Bank Transfer")}</h2>
                    }
                  </div>
                </div>
                <div className={paym_styles.flow}>

                  <div
                    className={paym_styles.flow_com}
                    style={{ minHeight: "41vh" }}
                  >
                    {data.step === 1 && (
                      <Country username={username} data={data} dataHandler={dataHandler} />
                    )}
                    {data.step === 2 && (
                      <StepOne
                        data={data}
                        dataHandler={dataHandler}
                        allowed={allowed}
                        wallet={wallet}
                      />
                    )}
                    {data.step === 3 &&
                      (data.payment_type?.value === "card" ?
                        (
                          <div
                            style={{
                              height: "100%",
                              background:
                                "linear-gradient(180deg, #FFF 0%, rgba(255, 255, 255, 0.00) 100%)",
                              borderRadius: "8px",
                              padding: "15px",
                            }}
                          >
                            <div className={styles.bot_top}>
                              <h5>{t("Payment Details")}</h5>
                              <span>
                                {t(
                                  "Complete your payment by providing your payment details"
                                )}
                              </span>
                            </div>
                            <CreditCard
                              showSave={false}
                              data={data}
                              dataHandler={dataHandler}
                              tokenUrl={() => ""}
                              url={""}
                              showCards={false}
                              guest={true}
                              inGuest={true}
                            />
                          </div>
                        ) :
                        (
                          <RecipientDetails
                            data={data}
                            dataHandler={dataHandler}
                            isShipping={isShipping}
                            isReferenceRequired={isReferenceRequired}

                          />
                        ))
                    }

                    {data.step === 4 &&
                      (data.payment_type?.value === "paypal" || data?.payment_type?.value === "mobile_wallet" ?
                        (
                          <>
                            <PaymentDetails
                              dataHandler={dataHandler}
                              data={data}
                              amount={amount}
                            />

                            <PaypalDetails data={data} wallet={wallet} />
                          </>
                        ) :

                        data.payment_type?.value === "card" ?
                          <RecipientDetails
                            data={data}
                            dataHandler={dataHandler}
                            isShipping={isShipping}
                            isReferenceRequired={isReferenceRequired}
                          />
                          :
                          data?.payment_type?.value === "bank_transfer" ?
                            <PlaidBankTransfer
                              type={'payment_address'}
                              data={data}
                              dataHandler={dataHandler}
                              toggle={toggle}
                              initiatePayload={() => {
                                return generateInitiatePayload(true)
                              }}
                            />
                            :
                            <BankDeposit
                              type={'payment_address'}
                              data={{ ...data, wallet }}
                              dataHandler={dataHandler}
                              guestDetails={{
                                name: data.fullName,
                                phone: data.phone,
                                email: data.email,
                                iso_code: data.country?.alpha3
                              }}
                              client_reference={data.paymentRef}
                              toggle={toggle}
                            />
                      )
                    }



                    {data.step === 5 &&
                      (data.payment_type?.value === "card" ? (
                        // <StepFive
                        <PaymentDetails
                          dataHandler={dataHandler}
                          data={data}
                          amount={amount}
                        />
                      ) : (
                        ""
                      ))}
                  </div>

                  {(data.payment_type?.value !== "bank" && data.payment_type?.value !== "bank_transfer" || data.step < 4) &&
                    <div
                      className={paym_styles.bottom}
                      style={{
                        flexDirection: "column",
                        margin: "2rem 0",
                        gap: "1.5rem",
                      }}
                    >
                      <Link
                        to={"https://insta-pay.ch/faqs"}
                        target="_blank"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: ".7rem",
                        }}
                      >
                        <HelpCircle size={16} />
                        {t("Trouble Sending Money")}
                      </Link>
                      <div
                        className={paym_styles?.buttons}
                        style={{ flexDirection: "column" }}
                      >
                        {data.loading ? <div style={{ width: "120px" }}><InstaPayLoader /> </div> : <button
                          disabled={data.loading || disabled}
                          onClick={onClickHandler}
                          style={{ width: "100%", background: "#5926F0" }}
                        >
                          {t("Next")}
                        </button>}
                        <button
                          className={styles.transparent}
                          disabled={data.loading}
                          style={{
                            width: "100%",
                            background: "#EEEEEE",
                            boxShadow: "0px 3.643px 30.052px 0px rgba(0, 0, 0, 0.09)",
                            color: "black",
                          }}
                          onClick={onBackClickHandler}
                        >
                          {t("Go Back")}
                        </button>
                      </div>
                    </div>
                  }
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default PayAsGuest;