import { useEffect, useReducer } from "react";
import ip from "../PaymentAddressPublic/instapay_black.svg";
import styles from "./styles/index.module.scss";
import { paymentConfirmOptions } from "../MyMasterCard/PaymentModal/SuccessStep";
import { useNavigate, useParams } from "react-router";
import { decryptData } from "../../Helper/EssentilaMethods/Decryption";
import { toast } from "react-toastify";
import { ArrowLeft } from "react-feather";
import InstaPayLoader from "../Loader";
import { LimitsErrorMessage } from "../../utils/Functions/paymentLimits";
import NotFound from "../NotFound";
import { useTranslation } from "react-i18next";
import ErrorModal from "./components/ErrorModal";
import { useMutation } from "@tanstack/react-query";
import StepThree from "./components/StepThree";
import UserDets from "./components/UserDets";
import AmontBox from "./components/AmontBox";
import DetsModal from "./components/DetsModal";
import useCountryLocation from "../../hooks/GeneralUse/useCountryLocation";
import FeeScreen from "./components/FeeScreen";
import { getWalletDetails, sendOtpSkip, confirmTransaction } from "./queries";
import useBiometricVerifications from "../../hooks/GeneralUse/useBiometricVerfications";
import useFXNew from "../../hooks/Payments/useFXNew";
import { apiErrorMessage } from "../PaymentsNewer/InternationalFlow";

const initialData = {
  step: 1,
  amount: 0.0,
  isPressed: false,
  userDetails: {},
  token: null,
  showDetsModal: false,
  phone: "",
  password: "",
  recipientDets: {},
  showModal: false,
  error: "",
  limitErrors: false,
  showPassword: false,
  notFound: false,
  loading: true,
  feeData: null,
};

function reducer(state, action) {
  switch (action.type) {
    case "UPDATE_FIELD":
      return {
        ...state,
        [action.field]: action.value,
      };
    case "RESET":
      return { ...initialData };
    default:
      return state;
  }
}

const QrQuickerPay = () => {
  const { wallet_id } = useParams();
  const [data, dispatch] = useReducer(reducer, initialData);
  const navigate = useNavigate();
  const { country } = useCountryLocation();

  // handlers
  const dataHandler = (field, value) => {
    dispatch({ type: "UPDATE_FIELD", field, value });
  };

  // Custom hooks
  const { handleGetFeeDetails, feeLoading } = useFXNew(data, dataHandler);
  const { handleBiometricVerification } = useBiometricVerifications(
    data,
    dataHandler,
    handleGetFeeDetails,
  );

  const { mutateAsync: getWalletDetailsMutation, isPending: walletLoading } = useMutation({
    mutationFn: (payload) => getWalletDetails(payload),
    onSuccess: (recipientDets) => {
      dataHandler("recipientDets", recipientDets);
    },
  });

  useEffect(() => {
    const getWalletDetails = async () => {
      try {
        await getWalletDetailsMutation({ wallet_id });
      } catch (error) {
        const dec = decryptData(error?.response?.data?.data);
        if (dec.message.toLowerCase().includes("not found")) {
          dataHandler("notFound", true);
        }
      }
    };

    if (wallet_id) {
      getWalletDetails();
    }
  }, [wallet_id, getWalletDetailsMutation]);

  const { mutateAsync: confirmTransactionMutation } = useMutation({
    mutationFn: ({ payload, apiHeaders }) => confirmTransaction(apiHeaders, payload),
    onError: (error) => {
      const dec = decryptData(error?.response?.data?.data);
      const err = apiErrorMessage(dec.message);
      const err2 = LimitsErrorMessage(dec.message);
      dataHandler(
        "error",
        err2 || err || dec?.message || "We are unable to process your request at the moment.",
      );
      dataHandler("showModal", true);
    },
  });

  const handleConfirmTransaction = async (token, apiHeaders) => {
    const requestData = {
      token,
      otp: "11212",
      type: "authenticator",
      auth_type: "biometric",
    };

    try {
      const dec = await confirmTransactionMutation({
        apiHeaders,
        payload: requestData,
      });
      dataHandler("step", data.step + 1);
      console.log(dec);
    } catch (error) {
      console.log(error);
    }
  };

  const { mutateAsync: sendOtpSkipMutation, isPending: sendOtpLoading } = useMutation({
    mutationFn: (payload) => sendOtpSkip(payload.token, payload),
  });

  const handleSendOtpSkip = async () => {
    dataHandler("isPressed", true);
    const apiHeaders = {
      Authorization: `Bearer ${data.token}`,
      source: "user",
    };
    try {
      const payload = {
        data: {
          receiver_wallet_id: data.recipientDets?.wallet_id,
          sender_wallet_id: data.userDetails?.walletDetails?._id,
          purpose: "OTHERS",
          amount: Number(data.amount?.toString()?.replaceAll(",", "")),
          type: "instant",
          payment_type: "qr_pay",
          description: "",
          token: data.feeData?.token,
        },
        type: "authenticator",
        auth_type: "biometric",
      };

      console.log(payload);
      const dec = await sendOtpSkipMutation({ token: data.token, ...payload });
      await handleConfirmTransaction(dec.token, apiHeaders);
      console.log(dec);
    } catch (error) {
      console.log(error);
      const dec = decryptData(error?.response?.data?.data);
      const err = LimitsErrorMessage(dec.message);

      if (err) {
        dataHandler("error", err);
        dataHandler("limitErrors", true);
        dataHandler("showModal", true);
        return;
      }
      if (dec?.message?.toLowerCase()?.includes("exceeded")) {
        dataHandler("error", "The transaction amount exceeds your QR payment threshold amount.");
        dataHandler("showModal", true);
        return;
      }
      toast.error(dec.message || "Something went wrong");
    } finally {
      dataHandler("isPressed", false);
    }
  };

  useEffect(() => {
    if (country) {
      dataHandler("country", country);
    }
  }, [country]);
  const { t } = useTranslation();

  console.log(data.error);
  return (
    <div style={{ position: "relative" }} className={styles.cont}>
      {walletLoading ? (
        <InstaPayLoader />
      ) : (
        <>
          {data.notFound ? (
            <NotFound key={"User"} />
          ) : (
            <>
              <ErrorModal
                toggle={() => {
                  dataHandler("step", 1);
                  dataHandler("showModal", false);
                  dataHandler("limitErrors", false);
                  dataHandler("error", "");
                }}
                error={data.error}
                limitErrors={data.limitErrors}
                showModal={data.showModal}
                url={`/q/${wallet_id}?login_flow=true`}
              />

              {data.step === 2 && (
                <div
                  style={{
                    position: "absolute",
                    top: "20px",
                    left: "20px",
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    dataHandler("step", 1);
                    dataHandler("feeData", null);
                  }}
                >
                  <ArrowLeft />
                </div>
              )}
              <div
                style={{
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <img src={ip} alt="" loading="lazy" />
                <h1>{t("Quicker QR Pay")}</h1>
                {data.step === 1 && (
                  <div className={styles.detsText}>
                    <h3>{t("Merchant Details")}</h3>
                    <p>
                      {t(
                        "Please take a few moments to carefully verify the information to your payee details.",
                      )}
                    </p>
                  </div>
                )}

                {data.step === 3 && <StepThree />}

                {data.step !== 1 && <span className={styles.label}>{t("Recipient Details")}:</span>}

                <UserDets step={data.step} recipientDets={data.recipientDets} />

                {data.step === 1 && (
                  <AmontBox
                    amount={data.amount}
                    code={data.recipientDets?.currency?.code}
                    setAmount={(value) => dataHandler("amount", value)}
                  />
                )}

                {data.step !== 1 && (
                  <FeeScreen
                    feeData={data.feeData}
                    step={data.step}
                    userDetails={data.userDetails}
                  />
                )}

                {data.step === 3 && (
                  <div className={styles.options}>
                    {paymentConfirmOptions.map((option) => (
                      <div
                        onClick={() => !option.link && navigate(option.navigate)}
                        key={option.text}
                      >
                        <img src={option.icon} alt="" loading="lazy" />
                        <span>
                          {option.link ? (
                            <a style={{ color: "black" }} href={option.navigate}>
                              {option.text}
                            </a>
                          ) : (
                            option.text
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <DetsModal
                toggle={() => dataHandler("showDetsModal", !data.showDetsModal)}
                isOpen={data.showDetsModal}
                country={country}
                handleBiometricVerification={handleBiometricVerification}
                isPressed={data.isPressed}
                password={data.password}
                phone={data.phone}
                setPassword={(value) => dataHandler("password", value)}
                setPhone={(value) => dataHandler("phone", value)}
                setShowPassword={(value) => dataHandler("showPassword", value)}
                showPassword={data.showPassword}
                setCountry={(value) => dataHandler("country", value)}
              />

              <div className={styles.btns}>
                {data.step !== 3 && (
                  <button
                    disabled={
                      data.isPressed ||
                      !data.amount ||
                      /^0+$/.test(data.amount.toString().replace(/\./g, "")) ||
                      feeLoading ||
                      sendOtpLoading
                    }
                    style={{
                      opacity:
                        (data.isPressed ||
                          !data.amount ||
                          /^0+$/.test(data.amount.toString().replace(/\./g, "")) ||
                          feeLoading ||
                          sendOtpLoading) &&
                        ".5",
                    }}
                    onClick={async () => {
                      if (data.step === 1) {
                        if (!data.userDetails._id) {
                          await handleBiometricVerification();
                        } else {
                          handleGetFeeDetails(
                            data.userDetails?.walletDetails?._id,
                            data.userDetails?.walletDetails?.currency?.code,
                            data.token,
                            data.userDetails?._id,
                            data.userDetails?.level_id,
                          );
                          dataHandler("step", data.step + 1);
                        }
                      } else {
                        handleSendOtpSkip();
                      }
                    }}
                  >
                    {data.step !== 1 ? t("Next") : t("Authenticate & Proceed")}
                  </button>
                )}
                {data.step === 1 && (
                  <p
                    onClick={() => navigate(`/q/${wallet_id}?login_flow=true`)}
                    style={{
                      marginTop: "10px",
                      fontWeight: 600,
                      fontSize: "12px",
                      cursor: "pointer",
                      textAlign: "center",
                      color: "#5926f0",
                    }}
                  >
                    {t("Quicker QR pay not active? login and continue.")}
                  </p>
                )}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default QrQuickerPay;
