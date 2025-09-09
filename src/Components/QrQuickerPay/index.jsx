import { useEffect, useReducer } from "react"
import ip from "../PaymentAddressPublic/instapay_black.svg"
import styles from "./styles/index.module.scss"
import { paymentConfirmOptions } from "../MyMasterCard/PaymentModal/SuccessStep"
import { useNavigate, useParams } from "react-router"
import { decryptData } from "../../Helper/EssentilaMethods/Decryption"
import { toast } from "react-toastify"
import { startAuthentication } from "@simplewebauthn/browser"
import { ArrowLeft } from "react-feather"
import InstaPayLoader from "../Loader"
import { LimitsErrorMessage } from "../PaymentsNewer/OTPConfirmation"
import NotFound from "../NotFound";
import { useTranslation } from "react-i18next";
import localforage from "localforage"
import ErrorModal from "./components/ErrorModal";
import { useMutation } from "@tanstack/react-query"
import StepThree from "./components/StepThree";
import UserDets from "./components/UserDets";
import AmontBox from "./components/AmontBox";
import DetsModal from "./components/DetsModal";
import useCountryLocation from "../../hooks/GeneralUse/useCountryLocation"
import FeeScreen from "./components/FeeScreen"
import { getWalletDetails, sendOtpSkip, confirmTransaction, getFeeDetails, biometricVerification1, biometricVerification2 } from "./queries"

const initialData = {
  step: 1,
  amount: 0.00,
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
  feeData: null
}

function reducer(state, action) {
  switch (action.type) {
    case "UPDATE_FIELD":
      return {
        ...state,
        [action.field]: action.value
      };
    case "RESET":
      return { ...initialData }
    default:
      return state;
  }
}

const QrQuickerPay = () => {
  const { wallet_id } = useParams()
  const [data, dispatch] = useReducer(reducer, initialData)
  const navigate = useNavigate()
  const { country } = useCountryLocation()

  // handlers
  const dataHandler = (field, value) => {
    dispatch({ type: "UPDATE_FIELD", field, value })
  }

  const { mutateAsync: getWalletDetailsMutation, isPending: walletLoading } = useMutation({
    mutationFn: (payload) => getWalletDetails(payload),
    onSuccess: (recipientDets) => {
      dataHandler("recipientDets", recipientDets)
    }
  })

  useEffect(() => {
    const getWalletDetails = async () => {
      try {
        await getWalletDetailsMutation({ wallet_id })
      } catch (error) {
        const dec = decryptData(error.response.data.data)
        if (dec.message.toLowerCase().includes("not found")) {
          dataHandler("notFound", true)
        }
      }
    }

    if (wallet_id) {
      getWalletDetails()
    }
  }, [wallet_id, getWalletDetailsMutation])


  const { mutateAsync: getFeeDetailsMutation, isPending: feeLoading } = useMutation({
    mutationFn: (payload) => getFeeDetails(payload)
  });

  const handleGetFeeDetails = async (sender_wallet_id, from, tokenApi, account_id, level) => {
    dataHandler("feeData", {})
    console.log(Number(data.amount?.replace(",", "")))

    try {
      const payload = {
        sender_wallet_id,
        from,
        tokenApi,
        account_id,
        level,
        amount: data.amount,
        recipientDets: data.recipientDets,
        userDetails: data.userDetails
      }
      const exchange_rate_details = await getFeeDetailsMutation(payload)
      dataHandler("feeData", exchange_rate_details);
    } catch (error) {
      const dec = decryptData(error?.response?.data?.data);
      if (typeof dec?.message === "object") {
        if (dec?.message?.[0]?.code === "1003007") {
          toast.error("Payer unavailable");
          return;
        }
        toast.error("Something went wrong");
        return;
      }
      const err = LimitsErrorMessage(dec.code)

      if (err) {
        dataHandler("error", err)
        dataHandler("showModal", true)
        return
      }
      if (dec?.message?.toLowerCase()?.includes("insufficient")) {
        toast.error("Insufficient balance");
        return;
      }
      if (
        dec?.message?.toLowerCase()?.includes("exceeds max") ||
        dec?.message?.toLowerCase()?.includes("above the max")
      ) {
        toast.error("Amount exceeds maximum allowed");
        return;
      }
      if (
        dec?.message?.toLowerCase()?.includes("below the min") ||
        dec?.message?.toLowerCase()?.includes("below the max")
      ) {
        toast.error("Amount below minimum allowed");
        return;
      }
      toast.error(dec?.message || "Something went wrong");
      dataHandler("feeData", null);
      return;
    }
  };

  const { mutateAsync: confirmTransactionMutation } = useMutation({
    mutationFn: ({ payload, apiHeaders }) => confirmTransaction(apiHeaders, payload)
  })

  const handleConfirmTransaction = async (token, apiHeaders) => {
    const requestData = {
      token,
      otp: "11212",
      type: "authenticator",
      auth_type: "biometric"
    }

    try {
      const dec = await confirmTransactionMutation({ apiHeaders, payload: requestData })
      dataHandler("step", data.step + 1)
      console.log(dec)
    } catch (error) {
      console.log(error)
    }
  }

  const { mutateAsync: sendOtpSkipMutation, isPending: sendOtpLoading } = useMutation({
    mutationFn: (payload) => sendOtpSkip(payload.token, payload)
  })

  const handleSendOtpSkip = async () => {
    dataHandler("isPressed", true)
    const apiHeaders = {
      "Authorization": `Bearer ${data.token}`,
      "source": "user"
    }
    try {
      const payload = {
        "data": {
          "receiver_wallet_id": data.recipientDets?.wallet_id,
          "sender_wallet_id": data.userDetails?.walletDetails?._id,
          "purpose": "OTHERS",
          "amount": Number(data.amount?.toString()?.replaceAll(",", "")),
          "type": "instant",
          "payment_type": "qr_pay",
          "description": "",
          "token": data.feeData?.token
        },
        "type": "authenticator",
        "auth_type": "biometric"
      }

      console.log(payload)
      const dec = await sendOtpSkipMutation({ token: data.token, ...payload })
      await handleConfirmTransaction(dec.token, apiHeaders)
      console.log(dec)
    } catch (error) {
      console.log(error)
      const dec = decryptData(error.response.data.data)
      const err = LimitsErrorMessage(dec.message)

      if (err) {
        dataHandler("error", err)
        dataHandler("limitErrors", true)
        dataHandler("showModal", true)
        return
      }
      if (dec?.message?.toLowerCase()?.includes("exceeded")) {
        dataHandler("error", "The transaction amount exceeds your QR payment threshold amount.")
        dataHandler("showModal", true)
        return
      }
      toast.error(dec.message || "Something went wrong")
    }
    finally {
      dataHandler("isPressed", false)
    }
  }


  const { mutateAsync: biometricVerification1Mutation } = useMutation({
    mutationFn: (payload) => biometricVerification1(payload)
  })

  const { mutateAsync: biometricVerification2Mutation } = useMutation({
    mutationFn: (payload) => biometricVerification2(payload)
  })

  const handleBiometricVerification = async () => {
    try {
      dataHandler("isPressed", true)
      const localPhone = await localforage.getItem("phone");
      const loginPhone = await localforage.getItem("loginData")

      const storedCredentials = localPhone || loginPhone?.credentials || null

      const payload = {
        qr_quicker_pay: true
      }
      if (data.phone && data.password) {
        payload.phone = data.phone;
        payload.password = data.password;
      }
      else if (storedCredentials) {
        payload.phone = storedCredentials;
        payload.localstorage = true;
      }

      const dec1 = await biometricVerification1Mutation(payload)
      const credentials = await startAuthentication(dec1.options)
      console.log(dec1)
      const dec2 = await biometricVerification2Mutation(credentials)

      console.log(dec2)

      if (dec2.user?.username === data.recipientDets?.username) {
        toast.error("You cannot send money to your own wallet")
        dataHandler("isPressed", false)
        return
      } else {
        dataHandler("step", data.step + 1)
        handleGetFeeDetails(dec2?.user?.walletDetails?._id, dec2?.user?.walletDetails?.currency?.code, dec2?.token, dec2?.user?._id, dec2?.user?.level_id)
        dataHandler("showDetsModal", false)
        dataHandler("token", dec2.token)
        dataHandler("userDetails", dec2.user)
      }
    } catch (error) {
      dataHandler("isPressed", false)
      console.log("Biometric verification error:", error)

      const dec = error?.response?.data?.data ? decryptData(error?.response?.data?.data) : error.response?.data
      console.log("Decrypted error:", dec)

      if (dec?.message?.toLowerCase()?.includes("cookie")) {
        dataHandler("showDetsModal", true)
        return
      }
      if (dec?.message?.toLowerCase()?.includes("user not found")) {
        return toast.error("You have entered wrong phone number/ password")
      }
      if (dec?.message?.toLowerCase()?.includes("password")) {
        return toast.error("You have entered wrong phone number/ password")
      }
      if (dec?.message?.toLowerCase()?.includes("quickerqrpay is disabled")) {
        dataHandler("error", "Quicker QR pay is inactive in your account, please enable it from settings/payment threshold for quick payments.")
        dataHandler("showModal", true)
        return
      }

      console.log(dec)
      toast.error("Biometric verification failed");
    }
    finally {
      dataHandler("isPressed", false)
    }
  };
  const { t } = useTranslation()

  return (
    <div style={{ position: 'relative' }} className={styles.cont}>

      {walletLoading ? <InstaPayLoader /> :
        <>
          {data.notFound ? <NotFound key={"User"} /> :
            <>
              <ErrorModal
                toggle={() => {
                  dataHandler("step", 1)
                  dataHandler("showModal", false)
                  dataHandler("limitErrors", false)
                  dataHandler("error", "")
                }}
                error={data.error}
                limitErrors={data.limitErrors}
                showModal={data.showModal}
                url={`/q/${wallet_id}?login_flow=true`}
              />

              {data.step === 2 &&
                <div
                  style={{ position: "absolute", top: "20px", left: "20px", cursor: "pointer" }}
                  onClick={() => {
                    dataHandler("step", 1)
                    dataHandler("feeData", null)

                  }}
                >
                  <ArrowLeft />
                </div>
              }
              <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <img src={ip} alt="" />
                <h1>{t("Quicker QR Pay")}</h1>
                {data.step === 1 &&
                  <div className={styles.detsText}>
                    <h3>{t("Merchant Details")}</h3>
                    <p>{t("Please take a few moments to carefully verify the information to your payee details.")}</p>
                  </div>
                }


                {data.step === 3 &&
                  <StepThree />
                }


                {data.step !== 1 && <span className={styles.label}>{t("Recipient Details")}:</span>}

                <UserDets
                  step={data.step}
                  recipientDets={data.recipientDets}
                />

                {data.step === 1 &&
                  <AmontBox
                    amount={data.amount}
                    code={data.recipientDets?.currency?.code}
                    setAmount={(value) => dataHandler("amount", value)}
                  />
                }

                {data.step !== 1 &&
                  <FeeScreen
                    feeData={data.feeData}
                    step={data.step}
                    userDetails={data.userDetails}
                  />
                }

                {data.step === 3 &&
                  <div className={styles.options}>
                    {paymentConfirmOptions.map(option => (
                      <div onClick={() => !option.link && navigate(option.navigate)} key={option.text}>
                        <img src={option.icon} alt="" />
                        <span>
                          {option.link ? <a style={{ color: "black" }} href={option.navigate}>{option.text}</a> : option.text}
                        </span>
                      </div>
                    ))}
                  </div>
                }
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
              />

              <div className={styles.btns}>
                {data.step !== 3 &&
                  <button
                    disabled={data.isPressed || !data.amount || /^0+$/.test(data.amount.toString().replace(/\./g, '')) || feeLoading || sendOtpLoading}
                    style={{ opacity: (data.isPressed || !data.amount || /^0+$/.test(data.amount.toString().replace(/\./g, '')) || feeLoading || sendOtpLoading) && ".5" }}
                    onClick={() => {
                      if (data.step === 1) {
                        if (!data.userDetails._id) {
                          handleBiometricVerification()
                        }
                        else {
                          handleGetFeeDetails(
                            data.userDetails?.walletDetails?._id,
                            data.userDetails?.walletDetails?.currency?.code,
                            data.token,
                            data.userDetails?._id,
                            data.userDetails?.level_id
                          )
                          dataHandler("step", data.step + 1)
                        }
                      }
                      else {
                        handleSendOtpSkip()
                      }
                    }}>
                    {data.step !== 1 ? t("Next") : t("Authenticate & Proceed")}
                  </button>
                }
                {data.step === 1 &&
                  <p onClick={() => navigate(`/q/${wallet_id}?login_flow=true`)} style={{ marginTop: "10px", fontWeight: 600, fontSize: "12px", cursor: "pointer", textAlign: "center", color: "#5926f0" }}>
                    {t("Quicker QR pay not active? login and continue.")}
                  </p>
                }
              </div>
            </>
          }
        </>
      }
    </div>
  )
}

export default QrQuickerPay