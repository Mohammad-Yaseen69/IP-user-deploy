import { useEffect, useState } from "react";
import { Modal, ModalBody } from "reactstrap";
import styles from "./styles/index.module.scss";
import { useTranslation } from "react-i18next";
import {
  ButtonForRequests,
  Select,
  TextInput,
} from "../../ReceiptInvoices/UI/FormElements";
import PhoneInput from "../../PhoneInput";
import { reasons } from "../../PaymentsNewer/AmountAndCurrency";
import { toast } from "react-toastify";
import useWindowWidth from "../../../utils/useWindowWidth";
import "./styles/modal.css";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiWrapper } from "../../../utils/Functions/apiWrapper";
import { decryptData } from "../../../Helper/EssentilaMethods/Decryption";
import ErrorModal from "../../PaymentsNewer/InternationalFlow/ErrorModal";
import countriesData from "../../PaymentsNewer/CountriesData.json";
import { verifyPhoneNumber } from "../../../utils/Functions/phoneVerification";
import ShippingDetails from "../../ReceiptInvoices/InvoicePaymentQr/ShippingDetails";
import { WidgetSDK } from "@keabank/websdk";
import CryptoDetailsModal from "../CryptoDetailsModal";
import DateMomentUtils from "@date-io/moment";
import { DatePicker, MuiPickersUtilsProvider } from "@material-ui/pickers";

const sdk = new WidgetSDK({
  integrationId: import.meta.env.VITE_KEABANK_INTEGRATION_ID,
  merchantId: import.meta.env.VITE_KEABANK_MERCHANT_ID,
});

const base_url = window.location.origin || "https://my.insta-pay.ch";

const PayWithCrypto = ({
  data = {},
  dataHandler,
  type = "payment_address",
  invoiceId,
  planId,
  subscriptionId,
  isOpen,
  toggle,
  isShipping,
}) => {
  const { t } = useTranslation();
  const [error, setError] = useState();
  const [loading, setLoading] = useState(false);
  const [country, setCountry] = useState({});
  const [showCryptoDetailsModal, setShowCryptoDetailsModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(true);
  const [cryptoPaymentRef, setCryptoPaymentRef] = useState(null);

  const { data: feeDetails } = useQuery({
    queryKey: ["CryptoFee", data.amount, data.currentWallet?.wallet_id, isOpen],
    queryFn: () => {
      let url = `/api/guest-pay/crypto-fee/${data?.currentWallet?.wallet_id}/${Number(String(data.amount)?.replaceAll(",", ""))}?payment_type=${type}`;
      if (invoiceId) url += `&invoice_id=${invoiceId}`;
      if (planId) url += `&plan_id=${planId}`;
      if (subscriptionId) url += `&subscription_id=${subscriptionId}`;
      return apiWrapper({ endpoint: url }).then((res) => res);
    },
    retry: 2,
    enabled: isOpen,
    staleTime: 0,
    gcTime: 0,
  });

  const mutation = useMutation({
    mutationFn: (payload) =>
      apiWrapper({
        endpoint: "/api/guest-pay/initiate-crypto-payment",
        payload: payload,
        method: "POST",
        isEncrypted: true,
      }),
    onError: (res) => {
      const dec = decryptData(res.response?.data?.data);
      setError(
        dec?.message ??
          "We are unable to process your request at the moment, please try again later.",
      );
    },
  });

  const flagTransaction = useMutation({
    mutationFn: (payload) =>
      apiWrapper({
        endpoint: "/api/transaction/transaction-flag",
        payload: payload,
        method: "PUT",
        isEncrypted: true,
      }),
    onError: (res) => {
      const dec = decryptData(res.data.data);
      setError(
        dec?.message ??
          "We are unable to process your request at the moment, please try again later.",
      );
    },
  });

  const width = useWindowWidth();

  const handleClose = () => {
    toggle();
    setError("");
    dataHandler("cryptoDetails", {
      name: "",
      phone: "",
      reason: "",
      email: "",
      dob: "",
    });
  };

  const handleDateChange = (date) => {
    if (date) {
      const selected = new Date(date);
      const minDate = new Date();
      minDate.setFullYear(minDate.getFullYear() - 15);
      if (selected <= minDate) {
        dataHandler("cryptoDetails", {
          ...data.cryptoDetails,
          dob: date.format
            ? date.format("YYYY-MM-DD")
            : date.toISOString().split("T")[0],
        });
      } else {
        toast.error(
          t("Please select a date at least 15 years ago or earlier."),
        );
      }
    } else {
      dataHandler("cryptoDetails", {
        ...data.cryptoDetails,
        dob: "",
      });
    }
  };

  const cryptoTransactionHandler = async () => {
    const paymentId = `instapay_${Date.now()}`;
    console.log(data.cryptoDetails);

    let formattedDob = data.cryptoDetails?.dob;
    if (formattedDob && formattedDob.includes("-")) {
      const [yyyy, mm, dd] = formattedDob.split("-");
      formattedDob = `${dd}-${mm}-${yyyy}`;
    }

    const payload = {
      token: feeDetails?.token,
      shipping_details: data?.shippingDetails,
      payment_id: paymentId,
      client_reference: data?.cryptoDetails?.paymentRef || "",
      email: data?.cryptoDetails.email,
      phone: data.cryptoDetails.phone,
      name: data?.cryptoDetails?.name,
      dob: formattedDob,
      payment_type: type,
      reason: data?.cryptoDetails?.reason,
      iso_code: country?.alpha3,
      // returnUrl: "https://your-url-here.com/status"
      returnUrl: `${base_url}/add-funds/crypto-success`,
    };

    if (invoiceId) payload.invoice_id = invoiceId;
    if (planId) payload.plan_id = planId;
    if (subscriptionId) payload.subscription_id = subscriptionId;

    const createdTransaction = await mutation.mutateAsync(payload);

    // Save payment reference for the details modal
    setCryptoPaymentRef(
      createdTransaction?.payment_id || data?.cryptoDetails?.paymentRef || "",
    );

    const checkoutUrl =
      createdTransaction?.checkout_url ||
      createdTransaction?.data?.checkout_url;
    if (checkoutUrl) {
      window.location.href = checkoutUrl;
      return;
    }

    // Show crypto details modal instead and close the form modal if no checkoutUrl
    setShowFormModal(false);
    // setShowCryptoDetailsModal(true)
  };

  const clickHandler = async () => {
    setLoading(true);
    const numberCheck = await verifyPhoneNumber(data?.cryptoDetails?.phone);
    setLoading(false);
    if (numberCheck === "Verified") {
      cryptoTransactionHandler();
    } else {
      toast.error(
        t("Incorrect phone number, please enter a correct phone number"),
      );
    }
  };

  useEffect(() => {
    const iso = localStorage.getItem("ip_country") ?? "USA";
    const country = countriesData.find((item) => item.alpha3 === iso);
    console.log("Setting initial country:", country);
    setCountry(country);
  }, []);

  return (
    <>
      <Modal
        centered
        isOpen={isOpen && showFormModal}
        style={{
          minWidth: window.innerWidth > 850 && "800px",
          overflow: "hidden",
          margin: "0px auto",
        }}
        toggle={handleClose}
      >
        <ModalBody
          style={{
            minHeight: width < 850 && "100vh",
            background: width < 850 && "#fafafafa",
          }}
        >
          <div className={styles.container}>
            {width > 850 && (
              <div className={styles.left}>
                <h3>{t("Pay with Crypto")}</h3>
                <span>
                  {t("By sending a payment. You agree to InstaPay:")}{" "}
                  <a
                    href="https://insta-pay.ch/terms-and-conditions"
                    target="_blank"
                    rel="noreferrer"
                  >
                    {t("Terms and conditions")}
                  </a>
                  .
                </span>
              </div>
            )}
            <div className={styles.right}>
              <div className={styles.form}>
                <h3>{t("Personal details")}</h3>
                <p>
                  {t(
                    "Please finalize your payment by entering the required personal information.",
                  )}
                </p>

                <div>
                  <label htmlFor="name">
                    {t("Full Name")}
                    {"*:"}
                  </label>
                  <TextInput
                    styles={{ background: "#f7f7f7" }}
                    id="name"
                    placeholder={t("Enter your Name")}
                    value={data?.cryptoDetails?.name}
                    onChange={(e) =>
                      dataHandler("cryptoDetails", {
                        ...data.cryptoDetails,
                        name: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label htmlFor="">
                    {t("Phone Number with country code")}
                    {"*:"}
                  </label>
                  <PhoneInput
                    phone={data?.cryptoDetails?.phone}
                    setPhone={(e) =>
                      dataHandler("cryptoDetails", {
                        ...data.cryptoDetails,
                        phone: e,
                      })
                    }
                    country={localStorage.getItem("ip_country") ?? "USA"}
                    setCountry={(e) => {
                      console.log("Phone country changed:", e);
                      const country = countriesData.find(
                        (item) => item.alpha3 === e,
                      );
                      if (country) {
                        setCountry(country);
                      }
                    }}
                    customStyles={{
                      background: "#f7f7f7",
                      boxShadow: "none",
                      border: "1px solid rgb(229, 231, 235)",
                      padding: "12px",
                    }}
                  />
                </div>
                <div>
                  <label htmlFor="dob">
                    {t("Date of Birth")}
                    {"*:"}
                  </label>
                  <MuiPickersUtilsProvider utils={DateMomentUtils}>
                    <DatePicker
                      required={true}
                      format="YYYY-MM-DD"
                      className="form-control"
                      style={{ width: "100%" }}
                      value={data?.cryptoDetails?.dob || null}
                      onChange={handleDateChange}
                      placeholder="YYYY-MM-DD"
                      maxDate={
                        new Date(
                          new Date().setFullYear(new Date().getFullYear() - 15),
                        )
                      }
                      disableFuture
                      InputProps={{
                        disableUnderline: true,
                        style: {
                          background: "#f7f7f7",
                          border: "1px solid rgb(229, 231, 235)",
                          borderRadius: "4px",
                          boxShadow: "none",
                          padding: "0 10px",
                          minHeight: "40px",
                          fontFamily: "inherit",
                          fontSize: "1rem",
                        },
                      }}
                    />
                  </MuiPickersUtilsProvider>
                </div>
                <div>
                  <label htmlFor="email">{t("Email (Optional)")}</label>
                  <TextInput
                    styles={{ background: "#f7f7f7" }}
                    id="email"
                    placeholder={"eg: info@google.com"}
                    value={data?.cryptoDetails?.email}
                    onChange={(e) =>
                      dataHandler("cryptoDetails", {
                        ...data.cryptoDetails,
                        email: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <label htmlFor="purpose">
                    {t("Payment Purpose")}
                    {"*:"}
                  </label>
                  <Select
                    placeholder={t("Select Purpose of Payment")}
                    value={data?.cryptoDetails?.reason}
                    onChange={(e) =>
                      dataHandler("cryptoDetails", {
                        ...data.cryptoDetails,
                        reason: e.target.value,
                      })
                    }
                    options={Object.keys(reasons).map((i) => ({
                      value: i,
                      label: t(reasons[i]),
                    }))}
                    id="purpose"
                    style={{
                      background: "#f7f7f7",
                    }}
                  />
                </div>

                <div>
                  <label htmlFor="paymentRef">
                    {t("Payment Reference (Optional)")}
                  </label>
                  <TextInput
                    styles={{ background: "#f7f7f7" }}
                    id="paymentRef"
                    value={data?.cryptoDetails?.paymentRef}
                    onChange={(e) =>
                      dataHandler("cryptoDetails", {
                        ...data.cryptoDetails,
                        paymentRef: e.target.value,
                      })
                    }
                  />
                </div>

                {isShipping && (
                  <ShippingDetails data={data} dataHandler={dataHandler} />
                )}
              </div>

              <div
                style={{
                  display: width > 840 ? "grid" : "flex",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "15px",
                  width: "100%",
                  flexDirection: "column-reverse",
                }}
              >
                <button
                  style={{
                    width: "100%",
                    background: "#e9ecef",
                    border: "none",
                    outline: "none",
                    borderRadius: "4px",
                    padding: "12px",
                  }}
                  onClick={() => handleClose()}
                >
                  {t("Cancel")}
                </button>

                <ButtonForRequests
                  style={{ borderRadius: "4px" }}
                  onClick={clickHandler}
                  isLoading={
                    mutation.isPending ||
                    loading ||
                    !data.cryptoDetails?.reason ||
                    !data.cryptoDetails?.phone ||
                    !data.cryptoDetails?.name ||
                    !data.cryptoDetails?.dob ||
                    (isShipping
                      ? Object.values(data.shippingDetails || {}).some(
                          (val) => !val,
                        )
                      : false)
                  }
                >
                  {t("Next")}
                </ButtonForRequests>
              </div>
            </div>
          </div>

          <ErrorModal
            isOpen={error}
            toggle={() => setError(null)}
            message={error}
            heading={"Crypto Transaction Failed!"}
          />
        </ModalBody>
      </Modal>

      <CryptoDetailsModal
        isOpen={showCryptoDetailsModal}
        toggle={() => {
          setShowCryptoDetailsModal(false);
          handleClose();
        }}
        amount={data.amount}
        currency={data.currentWallet?.currency?.code}
        paymentReference={cryptoPaymentRef}
      />
    </>
  );
};

export default PayWithCrypto;
