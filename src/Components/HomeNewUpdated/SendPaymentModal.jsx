import React, { useContext, useEffect, useRef, useState } from "react";
import {
  Button,
  Card,
  CardBody,
  Input,
  Modal,
  ModalBody,
  ModalHeader,
} from "reactstrap";
import { payoutChannelData } from "../PaymentsNewer/PayoutChannel";
import { Link, useNavigate } from "react-router-dom";
import { decryptData } from "../../Helper/EssentilaMethods/Decryption";
import countries from "../PaymentsNewer/CountriesData.json";
import { encryptData } from "../../Helper/EssentilaMethods/Encryption";
import axios from "axios";
import { reasons } from "../PaymentsNewer/AmountAndCurrency";
import styles from "../PaymentsNewer/styles/AmountAndCurrency.module.scss";
import { UserContext } from "../../Context/UserContext";
import { Check, ChevronRight } from "react-feather";
import faded_lines from "../PaymentsNewer/files/faded_lines.png";
import otp_icon from "../PaymentsNewer/files/otp_icon.png";
import Draggable from "react-draggable";
import { useTranslation } from "react-i18next";

const SendPaymentModal = ({ item, showModal, toggle }) => {
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const [payoutChannel, setPayoutChannel] = useState(null);
  const [service, setService] = useState(null);
  const [currency, setCurrency] = useState("USD");
  const [amount, setAmount] = useState(10);
  const [reason, setReason] = useState("");
  const [exchangeRate, setExchangeRate] = useState();
  const [exchangeError, setExchangeError] = useState("");
  const [balance, setBalance] = useState(null);
  const [quotationDetails, setQuotationDetails] = useState(null);
  const [createdQuotation, setCreatedQuotation] = useState(null);
  const [createdTransaction, setCreatedTransaction] = useState(null);
  const [transactionDetails, setTransactionDetails] = useState(null);
  const numberOfFields = 4;
  const [otpValues, setOTPValues] = useState(Array(numberOfFields).fill(""));
  const inputRefs = useRef(Array(numberOfFields).fill(null));
  useEffect(() => {
    if (inputRefs?.current?.[0]) {
      inputRefs?.current?.[0]?.focus();
    }
  }, []);
  const [verified, setVerified] = useState(false);
  const [timer, setTimer] = useState(3);
  const [resendTimer, setResendTimer] = useState(90);
  const [isAnyFieldEmpty, setIsAnyFieldEmpty] = useState(true);
  const [otpError, setOtpError] = useState("");
  const { userDetails, authHeader, userWallets, profileCompleted } =
    useContext(UserContext);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const navigate = useNavigate();

  const [complete, setComplete] = useState(false);
  const pRef = useRef(null);
  const divRef = useRef(null);
  const svgRef = useRef(null);
  const chevRef = useRef(null);
  useEffect(() => {
    if (!profileCompleted) {
      setShowCompletionModal(true);
    }
  }, [profileCompleted]);

  useEffect(() => {
    if (profileCompleted) {
      if (userDetails?.user?.kyc_status) {
        if (userDetails?.user?.kyc_status === "approved") {
          setShowVerificationModal(false);
        } else {
          setShowVerificationModal(true);
        }
      } else {
        setShowVerificationModal(true);
      }
    }
  }, [userDetails]);

  const handleDrag = (e, ui) => {
    const { x } = ui;
    pRef.current.style.transform = `translateX(${(x * 90) / 100}px)`;
    svgRef.current.style.transform = `translateX(${x}px)`;
    const threshold = divRef?.current?.offsetWidth - 72;
    if (x >= threshold) {
      if (showCompletionModal) {
        setTimeout(() => {
          navigate("/settings?tab=basic");
        }, 200);
      } else if (showVerificationModal) {
        setTimeout(() => {
          navigate("/settings?tab=verification");
        }, 200);
      } else {
        setComplete(true);
      }
    }
  };
  useEffect(() => {
    if (complete) {
      const data = {
        additional_information: reason,
        purpose_of_remittance: reason,
        user_id: userDetails?.user?._id,
        beneficiary_id: item._id,
        service: { id: payoutChannel.id },
        transaction_type: item?.beneficiary_type
          ? item?.beneficiary_type === "individual"
            ? "C2C"
            : "C2B"
          : "",
        wallet_id: userWallets?.filter(
          (it) => it?.currency?.code?.toLowerCase() === currency?.toLowerCase(),
        )[0]?._id,
        token: quotationDetails.token,
      };
      // console.log(data)

      const encrypted = encryptData(data);

      axios
        .post(
          `${import.meta.env.VITE_THUNES_API}/createTransaction/${createdQuotation.QuotationID}`,
          {
            data: encrypted,
          },
        )
        .then((res) => {
          const decrypted = decryptData(res.data.data);
          // console.log(decrypted)
          if (decrypted.Message.toLowerCase().includes("created")) {
            setCreatedTransaction(decrypted);
            setStep(4);
          }
        })
        .catch((err) => {
          const decrypted = decryptData(err.response.data.data);
          // console.log(decrypted)
        });
    }
  }, [complete]);

  // errors
  const [countryError, setCountryError] = useState("");
  const [payoutError, setPayoutError] = useState("");
  const [serviceError, setServiceError] = useState("");

  const country =
    countries.filter(
      (coun) => coun.name.toLowerCase() === item?.country?.toLowerCase(),
    )[0] ?? "";

  useEffect(() => {
    setStep(1);
    setPayoutChannel(null);
    setCountryError("");
    setPayoutError("");
    setServiceError("");
    setService(null);
    setCurrency("USD");
    setAmount(10);
    setReason("");
    setExchangeRate(null);
    setExchangeError(null);
    setQuotationDetails(null);
    setCreatedQuotation(null);
    setOTPValues(Array(numberOfFields).fill(""));
    setVerified(false);
    setTimer(3);
    setResendTimer(0);
    setIsAnyFieldEmpty(true);
    setOtpError("");
    setCreatedTransaction(null);
    setTransactionDetails(null);
  }, [showModal]);

  useEffect(() => {
    const getCountries = async () => {
      const res = await fetch(`${import.meta.env.VITE_THUNES_API}/Countries`);
      const data = await res.json();
      const decrypted = decryptData(data.data);
      const isAvailable = decrypted.filter(
        (country) =>
          country.countryName.toLowerCase() === item.country.toLowerCase(),
      );
      // console.log(isAvailable)

      setCountryError(
        isAvailable.length > 0
          ? ""
          : "Payment to this beneficiary's country is not supported.",
      );
    };
    if (item.country) {
      getCountries();
    }
  }, [showModal]);

  useEffect(() => {
    if (payoutChannel) {
      axios
        .get(`${import.meta.env.VITE_THUNES_API}/services/${country.alpha3}`, {
          headers: authHeader,
        })
        .then((res) => {
          const decrypted = decryptData(res.data.data);
          // console.log(decrypted)
          if (decrypted.length < 1) {
            setPayoutError(
              "Country doesn't support any of the beneficiary's payout channel.",
            );
          } else {
            const isAvailable = decrypted.filter(
              (chan) => chan.id === payoutChannel.id,
            );
            setPayoutError(
              isAvailable.length > 0
                ? ""
                : "Payment to this beneficiary's channel is not supported.",
            );

            if (isAvailable.length > 0) {
              const data = { country: country.alpha3, id: payoutChannel.id };
              const encrypted = encryptData(data);
              axios
                .post(
                  `${import.meta.env.VITE_THUNES_API}/payerInfo`,
                  {
                    data: encrypted,
                  },
                  { headers: authHeader },
                )
                .then((res) => {
                  // setSubServices(decryptData(res.data.data))
                  const decrypted = decryptData(res.data.data);
                  const isServiceAvailable = decrypted.filter(
                    (subSer) =>
                      subSer.name.toLowerCase().split(" ").join("") ===
                      item.bank_name.toLowerCase().split(" ").join(""),
                  );
                  setServiceError(
                    isServiceAvailable.length > 0
                      ? ""
                      : `Beneficiary's ${isAvailable[0]?.name?.toLowerCase().includes("mobile") ? "Mobile Wallet" : "Bank"} not found in available services.`,
                  );
                  if (isServiceAvailable.length > 0) {
                    setStep(2);
                    setService(isServiceAvailable[0]);
                  }
                })
                .catch((err) => {
                  // console.log(err)
                });
            }
          }
        })
        .catch((err) => {
          // console.log(err)
        });
    }
  }, [payoutChannel]);

  useEffect(() => {
    if (balance && amount > balance) {
      setExchangeError("1006001");
    } else {
      if (amount.length > 0 && +amount >= 1) {
        const data = {
          wallet_id: userWallets?.filter(
            (item) =>
              item?.currency?.code?.toLowerCase() === currency?.toLowerCase(),
          )[0]?._id,
          transaction_type: "C2C",
          amount: +amount,
        };

        // console.log(data)

        const encrypted = encryptData(data);

        axios
          .post(
            `${import.meta.env.VITE_THUNES_API}/get-rates/${service.id}`,
            {
              data: encrypted,
            },
            {
              headers: authHeader,
            },
          )
          .then((res) => {
            const decrypted = decryptData(res.data.data);
            const data = {
              wholesale_fx_rate: decrypted?.result?.exchange_rate,
              destination: {
                currency: decrypted?.result?.destination_currency,
                amount: decrypted?.result?.converted_amount,
              },
              fee: { amount: decrypted?.result?.fee.toFixed(2) },
            };
            setExchangeRate(data);
            setQuotationDetails(decrypted);
            setExchangeError("");
          })
          .catch((err) => {
            // console.log(decryptData(err.response.data))
            setExchangeError(decryptData(err.response.data.data));
          });
      } else {
        setExchangeError("Invalid Amount..");
      }
    }
  }, [amount, balance, currency]);

  const createQuotation = () => {
    const quotationData = {
      amount: +amount,
      token: quotationDetails.token,
      payer_id: service.id,
      wallet_id: userWallets?.filter(
        (it) => it?.currency?.code?.toLowerCase() === currency?.toLowerCase(),
      )[0]?._id,
      transaction_type: item?.beneficiary_type
        ? item?.beneficiary_type === "individual"
          ? "C2C"
          : "C2B"
        : "",
    };
    const encrypted = encryptData(quotationData);

    axios
      .post(
        `${import.meta.env.VITE_THUNES_API}/createQuotation`,
        {
          data: encrypted,
        },
        {
          headers: authHeader,
        },
      )
      .then((res) => {
        const decrypted = decryptData(res.data.data);
        // console.log(decrypted)
        setCreatedQuotation(decrypted);
        setStep(3);
      })
      .catch((err) => {
        // console.log(decryptData(err.response.data.data))
      });
  };

  useEffect(() => {
    if (verified && timer > 0) {
      const intervalId = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);

      return () => {
        clearInterval(intervalId);
      };
    } else if (verified && timer === 0) {
      setStep((prev) => prev + 1);
    }
  }, [verified, timer]);

  useEffect(() => {
    if (!verified && resendTimer > 0) {
      const intervalId = setInterval(() => {
        setResendTimer((prevTimer) => prevTimer - 1);
      }, 1000);

      return () => {
        clearInterval(intervalId);
      };
    }
  }, [verified, resendTimer]);

  const handleInputChange = (index, value) => {
    let numericValue = value.replace(/[^0-9]/g, "");
    if (numericValue.length > 1) {
      numericValue = numericValue.slice(-1);
    }
    let newOTPValues = [...otpValues];
    newOTPValues[index] = numericValue;
    setOTPValues(newOTPValues);
    if (numericValue && index < numberOfFields - 1) {
      inputRefs.current[index + 1].focus();
    }
    const isEmpty = newOTPValues.some((val) => val === "");
    setIsAnyFieldEmpty(isEmpty);
  };

  const handleInputKeyDown = (index, event) => {
    if (event.key === "Backspace") {
      if (otpValues[index] === "" && index > 0) {
        inputRefs.current[index - 1].focus();
      } else if (index > 0) {
        const newOTPValues = [...otpValues];
        newOTPValues[index] = "";
        setOTPValues(newOTPValues);
        setIsAnyFieldEmpty(true);
      }
    }
  };

  const createTransaction = () => {
    const data = { token: createdTransaction.token };
    const encrypted = encryptData(data);
    axios
      .post(`${import.meta.env.VITE_THUNES_API}/confirmTransaction`, {
        data: encrypted,
      })
      .then((res) => {
        const decrypted = decryptData(res.data.data);
        setTransactionDetails(decrypted);
        // console.log(decrypted)
        if (decrypted.TransactionID) {
          setVerified(true);
        }
      })
      .catch((err) => "a"); // console.log(decryptData(err.response.data.data)))
  };

  const channels = payoutChannelData?.filter((i) => {
    return item?.account_type?.some((j) => {
      return j.toLowerCase() === i.value.toLowerCase();
    });
  });

  return (
    <Modal isOpen={showModal} toggle={toggle}>
      <ModalHeader toggle={toggle}>{t("Send Money")}</ModalHeader>
      <ModalBody
        style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
      >
        {channels.length > 0 ? (
          channels.map((channel) => (
            <>
              {!countryError && !payoutError && !serviceError && step === 1 && (
                <Card
                  key={channel?.name}
                  style={{
                    marginBottom: 0,
                    borderRadius: "12px",
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    setPayoutChannel(channel);
                  }}
                >
                  <CardBody
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: ".5rem",
                      padding: "15px",
                      justifyContent: "space-between",
                      cursor: "pointer",
                      position: "relative",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "20px",
                      }}
                    >
                      <div
                        style={{
                          height: "35px",
                          width: "35px",
                          background:
                            "linear-gradient(-24deg, rgb(210, 60, 122) 0%, rgb(164, 52, 167) 43.66%, rgb(88, 38, 239) 100%)",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          borderRadius: "12px",
                          boxShadow: "0px 4px 7px rgba(172, 53, 159, 0.31)",
                        }}
                      >
                        <img
                          src={channel?.icon}
                          draggable="false"
                          alt={channel?.name[0]}
                          style={{
                            width: "19px",
                            objectFit: "contain",
                            aspectRatio: 1,
                          }}
                        />
                      </div>
                      <h5 style={{ marginBottom: 0, fontSize: "1.2rem" }}>
                        {channel?.name}
                      </h5>
                    </div>
                  </CardBody>
                </Card>
              )}
              {countryError && step === 1 && (
                <span style={{ fontSize: "1rem", fontWeight: 600 }}>
                  {countryError}
                </span>
              )}
              {!countryError && payoutError && step === 1 && (
                <span style={{ fontSize: "1rem", fontWeight: 600 }}>
                  {payoutError}
                </span>
              )}
              {!countryError && !payoutError && serviceError && step === 1 && (
                <span style={{ fontSize: "1rem", fontWeight: 600 }}>
                  {serviceError}
                </span>
              )}

              {step === 2 && service && (
                <div
                  style={{
                    paddingBottom: "0",
                    display: "flex",
                    flexDirection: "column",
                    gap: "14px",
                    borderRadius: "20px",
                    padding: "14px",
                    background: "rgba(0,0,0,.03)",
                    paddingBottom: 0,
                    boxShadow:
                      "0px 18px 15.348464965820312px -15px rgba(89, 38, 240, 0.16)",
                  }}
                >
                  <div
                    style={{
                      background:
                        "linear-gradient(to bottom right, #EC2AB6 0%, #5926F0 100%)",
                      border: "0.5px solid rgba(0, 0, 0, 0.08)",
                      boxShadow:
                        "0px 4.456576347351074px 132.58314514160156px 0px rgba(0, 0, 0, 0.11)",
                      borderRadius: "24px",
                      padding: "12px",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <h4
                      style={{
                        marginBottom: 0,
                        color: "white",
                        fontSize: "1.3rem",
                        fontWeight: 400,
                        transform: "translate(15px, 5px)",
                      }}
                    >
                      {currency === "USD" && "$"}
                      {currency === "EUR" && "€"}
                      {currency === "GBP" && "£"}
                    </h4>
                    <Input
                      type="number"
                      placeholder="Amount"
                      value={amount}
                      onChange={(e) => {
                        setAmount(e.target.value);
                      }}
                      style={{
                        width: "100%",
                        border: "none",
                        flex: 1,
                        background: "transparent",
                        color: "white",
                        fontSize: "2.5rem",
                        paddingLeft: "1.6rem",
                      }}
                      className={`i_t_amount ${styles.input}`}
                    />
                    <Input
                      type="select"
                      style={{
                        borderRadius: "100px",
                        padding: ".3rem .2rem .2rem .6rem",
                        fontSize: ".7rem",
                        appearance: "none",
                        WebkitAppearance: "none",
                        MozAppearance: "none",
                        width: "60px",
                        border: "none",
                        outline: "none",
                      }}
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                    >
                      <option value="USD">{t("USD")}</option>
                      <option value="GBP">{t("GBP")}</option>
                      <option value="EUR">{t("EUR")}</option>
                    </Input>
                  </div>
                  <Input
                    type="select"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="mb-2"
                    style={{
                      background: "rgba(89, 38, 240, 0.04)",
                      borderRadius: "10px",
                      appearance: "menulist",
                      fontSize: "1rem",
                      fontWeight: 600,
                      padding: "1rem 1.25rem",
                    }}
                  >
                    <option value="">{t("Select Remark / Reason")}</option>
                    {reasons.map((item) => (
                      <option value={item.value} key={item.value}>
                        {item.name}
                      </option>
                    ))}
                  </Input>
                  <div
                    style={{
                      padding: ".6rem 1rem",
                      display: "flex",
                      flexDirection: "column",
                      gap: ".4rem",
                      minHeight: "103px",
                    }}
                  >
                    {!exchangeError ? (
                      <>
                        <p
                          style={{
                            marginBottom: "3px",
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <span style={{ color: "#a0a0a0" }}>
                            {t("Exchange Rate:")}
                          </span>
                          <span style={{ color: "#a0a0a0" }}>
                            {+exchangeRate?.wholesale_fx_rate?.toFixed(2) ?? ""}{" "}
                            {exchangeRate?.destination?.currency ?? ""}
                          </span>
                        </p>
                        <p
                          style={{
                            marginBottom: "3px",
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <span style={{ color: "#a0a0a0" }}>{t("Tax")}</span>
                          <span style={{ color: "#a0a0a0" }}>
                            ${+exchangeRate?.fee?.amount ?? ""}
                          </span>
                        </p>
                        <p
                          style={{
                            marginBottom: "3px",
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <span style={{ fontWeight: "600" }}>
                            {t("How much they receive:")}
                          </span>
                          <span style={{ fontWeight: "600" }}>
                            {+exchangeRate?.destination?.amount?.toFixed(2) ??
                              ""}{" "}
                            {exchangeRate?.destination?.currency ?? ""}
                          </span>
                        </p>
                      </>
                    ) : (
                      <>
                        {exchangeError.includes(
                          "strictly positive value expected",
                        ) && (
                          <>
                            <p
                              style={{
                                marginBottom: 0,
                                textAlign: "center",
                                fontSize: ".8rem",
                                fontWeight: 600,
                              }}
                            >
                              {t("Minimum transaction amount should be")}
                            </p>
                            <h2
                              style={{
                                marginBottom: 0,
                                textAlign: "center",
                                fontSize: "1.4rem",
                                fontWeight: 800,
                              }}
                            >
                              {
                                +service?.transaction_types?.C2C
                                  ?.minimum_transaction_amount
                              }{" "}
                              {service?.currency}
                            </h2>
                          </>
                        )}
                        {exchangeError.includes(
                          "over maximum of the selected payer",
                        ) ||
                          (exchangeError.includes("1003012") && (
                            <>
                              {/* <p style={{ marginBottom: 0, textAlign: "center", fontSize: ".8rem", fontWeight: 600 }}>Maximum transaction amount should be</p>
                                        <h2 style={{ marginBottom: 0, textAlign: "center", fontSize: "1.4rem", fontWeight: 800 }}>{+service?.transaction_types?.C2C?.maximum_transaction_amount} {service?.currency}</h2> */}
                              <p
                                style={{
                                  marginBottom: 0,
                                  textAlign: "center",
                                  fontSize: ".8rem",
                                  fontWeight: 600,
                                }}
                              >
                                {t("This amount exceeds our limit of")}{" "}
                                <b>
                                  {
                                    +service?.transaction_types?.C2C?.maximum_transaction_amount.toLocaleString()
                                  }{" "}
                                  {service?.currency}
                                </b>{" "}
                                {t("for a single transfer to")}{" "}
                                <b>{service.name}</b>.
                              </p>
                            </>
                          ))}
                        {exchangeError.includes("1006001") && (
                          <>
                            <p
                              style={{
                                marginBottom: 0,
                                textAlign: "center",
                                fontSize: ".8rem",
                                fontWeight: 600,
                              }}
                            >
                              {t(
                                "You have entered an amount that exceeds our limit at the moment.",
                              )}
                            </p>
                          </>
                        )}
                        {exchangeError.includes("Invalid Amount..") && (
                          <>
                            <h2
                              style={{
                                marginBottom: 0,
                                textAlign: "center",
                                fontSize: "1.4rem",
                                fontWeight: 800,
                              }}
                            >
                              {t("Invalid Amount")}
                            </h2>
                          </>
                        )}
                        {exchangeError.includes("insufficient balance") && (
                          <>
                            <h2
                              style={{
                                marginBottom: 0,
                                textAlign: "center",
                                fontSize: "1.4rem",
                                fontWeight: 800,
                              }}
                            >
                              {t("Insufficient Balance")}
                            </h2>
                          </>
                        )}
                        {exchangeError.includes(
                          "An error occurred while creating the quotation",
                        ) && (
                          <>
                            <h2
                              style={{
                                marginBottom: 0,
                                textAlign: "center",
                                fontSize: "1.4rem",
                                fontWeight: 800,
                              }}
                            >
                              {t("Something went wrong.")}
                            </h2>
                            <p style={{ marginBottom: 0, textAlign: "center" }}>
                              {t("Please try again later")}
                            </p>
                          </>
                        )}
                      </>
                    )}
                  </div>
                  <Button
                    size="sm"
                    style={{
                      border: "none",
                      outline: "none",
                      background:
                        " linear-gradient(to right, rgba(0, 0, 0, 0.40) 0%, rgba(0, 0, 0, 0.40) 100%), linear-gradient(to left, #E64067 0%, #5926F0 55.65%, #4828A0",
                      backgroundBlendMode: "overlay, normal",
                      boxShadow:
                        "0px 11.90068244934082px 8.655041694641113px -5.409400939941406px rgba(89, 38, 240, 0.17)",
                      borderRadius: "6px",
                      display: "flex",
                      alignItems: "center",
                      // maxWidth: "120px"
                      alignSelf: "flex-end",
                    }}
                    className="i_t_button"
                    disabled={!amount || !currency || !reason || exchangeError}
                    onClick={createQuotation}
                  >
                    <span>{t("Confirm")}</span>
                    <ChevronRight size={20} />
                  </Button>
                </div>
              )}
              {step === 3 && (
                <Card
                  style={{
                    height: "100%",
                    marginBottom: 0,
                    boxShadow: "none",
                    gap: "1.3rem",
                  }}
                >
                  <CardBody
                    style={{
                      paddingBottom: "0",
                      display: "flex",
                      flexDirection: "column",
                      borderRadius: "20px",
                      padding: "20px 30px",
                      background: "rgba(0,0,0,.03)",
                      paddingBottom: 0,
                      boxShadow:
                        "0px 18px 15.348464965820312px -15px rgba(89, 38, 240, 0.16)",
                    }}
                    className="conf_cont"
                  >
                    <div
                      style={{
                        background: "rgba(89, 38, 240, 0.08)",
                        borderRadius: "16px",
                        overflow: "hidden",
                      }}
                      className="i_t_selected"
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <span
                          style={{
                            color: "rgba(0,0,0,0.36)",
                            fontSize: ".7rem",
                          }}
                        >
                          {t("Country")}
                        </span>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: ".5rem",
                        }}
                        className="i_t_s_coun"
                      >
                        <img
                          src={country.file_url}
                          alt={country.code}
                          style={{
                            objectFit: "cover",
                            borderRadius: "4px",
                            boxShadow: "0 0 10px rgba(0,0,0,.3)",
                          }}
                          draggable="false"
                        />
                        <span style={{ fontWeight: 700 }}>{country.name}</span>
                      </div>
                    </div>

                    <div
                      style={{
                        background: "rgba(89, 38, 240, 0.08)",
                        borderRadius: "16px",
                      }}
                      className="i_t_selected"
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <span
                          style={{
                            color: "rgba(0,0,0,0.36)",
                            fontSize: ".7rem",
                          }}
                        >
                          {t("Payout Channel")}
                        </span>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: ".6rem",
                        }}
                      >
                        <div
                          style={{
                            minHeight: "35px",
                            minWidth: "35px",
                            background:
                              "linear-gradient(-24deg, rgb(210, 60, 122) 0%, rgb(164, 52, 167) 43.66%, rgb(88, 38, 239) 100%)",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            borderRadius: "12px",
                            boxShadow: "0px 4px 7px rgba(172, 53, 159, 0.31)",
                          }}
                        >
                          <img
                            src={payoutChannel.icon}
                            draggable="false"
                            alt={payoutChannel.name[0]}
                            style={{
                              height: "22px",
                              width: "22px",
                              objectFit: "contain",
                            }}
                          />
                        </div>
                        <span style={{ fontWeight: 500 }}>
                          {payoutChannel.name}
                        </span>
                      </div>
                    </div>
                    <div
                      style={{
                        background: "rgba(89, 38, 240, 0.08)",
                        borderRadius: "16px",
                      }}
                      className="i_t_selected"
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <span
                          style={{
                            color: "rgba(0,0,0,0.36)",
                            fontSize: ".7rem",
                            fontWeight: 700,
                          }}
                        >
                          {t("You are sending")}
                        </span>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: ".6rem",
                        }}
                      >
                        <span style={{ fontWeight: 700, fontSize: "1.4rem" }}>
                          {amount} {currency}
                        </span>
                      </div>
                    </div>

                    <div
                      style={{
                        background: "rgba(89, 38, 240, 0.08)",
                        borderRadius: "16px",
                      }}
                      className="i_t_selected"
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: ".5rem",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: ".2rem",
                              alignItems: "center",
                            }}
                          >
                            <div
                              style={{
                                width: "35px",
                                height: "35px",
                                borderRadius: "25px",
                                display: "grid",
                                placeItems: "center",
                                background:
                                  "linear-gradient(-24deg, rgb(210, 60, 122) 0%, rgb(164, 52, 167) 43.66%, rgb(88, 38, 239) 100%)",
                                color: "white",
                                fontSize: "1rem",
                                fontWeight: 800,
                              }}
                            >
                              {item?.beneficiary_type === "individual"
                                ? item?.first_name?.[0]
                                : (item?.company_name?.[0] ??
                                  item?.user?.first_name[0])}
                            </div>
                          </div>
                          <div>
                            <div
                              style={{
                                display: "flex",
                                gap: ".3rem",
                                alignItems: "center",
                              }}
                            >
                              <h5
                                className="mb-0"
                                style={{ fontSize: ".9rem" }}
                              >
                                {item?.first_name ?? item?.user?.first_name}{" "}
                                {item?.last_name ?? item?.user?.last_name}
                              </h5>
                            </div>
                            <span style={{ fontSize: ".7rem" }}>
                              {" "}
                              {payoutChannel &&
                                payoutChannel?.value === "bank" &&
                                `IBAN: ${item?.bank_iban}`}
                              {payoutChannel &&
                                payoutChannel?.value === "mobile" &&
                                `IBAN: ${item?.mobile_wallet_account_number}`}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div
                      ref={divRef}
                      style={{
                        textAlign: "center",
                        position: "relative",
                        background:
                          "linear-gradient(0deg, rgba(11, 13, 65, 0.16), rgba(11, 13, 65, 0.16)), radial-gradient(182.3% 794.57% at 91.57% -107.9%, #E64067 0%, #5926F0 55.65%, #4828A0 100%)",
                        backgroundBlendMode: "color-burn,normal",
                        boxShadow:
                          "0px 6px 13px -5.4094px rgba(89, 38, 240, 0.17)",
                        borderRadius: "16px",
                        padding: "1rem",
                        width: "85%",
                        margin: "1rem auto 0",
                        overflow: "hidden",
                      }}
                    >
                      <img
                        src={faded_lines}
                        alt="faded"
                        style={{
                          position: "absolute",
                          left: "-130px",
                          display: complete ? "none" : "inherit",
                          width: "130px",
                        }}
                        ref={svgRef}
                      />
                      <Draggable axis="x" bounds="parent" onDrag={handleDrag}>
                        <div
                          style={{
                            position: "absolute",
                            top: "10px",
                            left: "10px",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            border: "3px solid white",
                            height: "40px",
                            width: "40px",
                            borderRadius: "16px",
                            cursor: "pointer",
                            zIndex: 1,
                          }}
                          ref={chevRef}
                        >
                          {complete ? (
                            <Check color="white" size={30} />
                          ) : (
                            <ChevronRight color="white" size={30} />
                          )}
                        </div>
                      </Draggable>
                      <p
                        style={{
                          marginBottom: "0",
                          fontSize: "1.1rem",
                          fontWeight: 500,
                          color: "white",
                          display: complete ? "none" : "inherit",
                        }}
                        ref={pRef}
                      >
                        {showCompletionModal
                          ? t("Complete Your Profile")
                          : showVerificationModal
                            ? t("Verify Your Identity")
                            : t("Slide To Confirm")}
                      </p>
                      {complete && (
                        <p
                          style={{
                            marginBottom: "0",
                            fontSize: "1.1rem",
                            fontWeight: 500,
                            color: "white",
                          }}
                        >
                          {t("Payment Confirmed")}
                        </p>
                      )}
                    </div>
                  </CardBody>
                </Card>
              )}
              {step === 4 && (
                <div
                  style={{
                    height: "100%",
                    marginBottom: 0,
                    boxShadow: "none",
                    gap: "1.3rem",
                    display: "flex",
                    justifyContent: "space-between",
                    flexDirection: "column",
                  }}
                >
                  <div
                    style={{
                      borderRadius: "20px",
                      flex: "1",
                      display: "flex",
                      alignItems: "center",
                      overflow: "hidden",
                      padding: "14px",
                      // gap: '14px',
                      paddingBottom: "1rem",
                      boxShadow:
                        "0px 18px 15.348464965820312px -15px rgba(89, 38, 240, 0.16)",
                    }}
                    className="otp_cont"
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-around",
                        alignItems: "center",
                        maxHeight: "420px",
                        flexDirection: "column",
                        width: "100%",
                        height: "100%",
                      }}
                    >
                      <div
                        style={{
                          border: "2px solid rgba(0, 0, 0, 0.04)",
                          borderRadius: "30px",
                          background: "rgba(255, 255, 255, 0.04)",
                          boxShadow:
                            "0px 11.233247756958008px 19.658184051513672px 0px rgba(172, 53, 159, 0.09)",
                          height: "120px",
                          width: "120px",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <img
                          src={otp_icon}
                          alt="otp"
                          style={{
                            width: "42px",
                            height: "42px",
                            borderRadius: "12px",
                            filter:
                              "drop-shadow(0px 4px 7px 0px rgba(172, 53, 159, 0.31))",
                          }}
                        />
                      </div>
                      <div className="text-center">
                        <h4
                          style={{
                            fontSize: "24px",
                            fontWeight: 700,
                          }}
                        >
                          {verified
                            ? "Verification Code Verified"
                            : "Enter Code"}
                        </h4>
                        <p
                          style={{
                            maxWidth: "212px",
                            fontSize: "14px",
                            fontWeight: 600,
                          }}
                        >
                          {verified
                            ? "Verification code has been verified, You'll be redirected to the next step."
                            : "A Verification code has been sent to your email and number."}
                        </p>
                      </div>
                      {verified ? (
                        <span
                          style={{
                            fontSize: "12px",
                            color: "#aeaeae",
                            fontWeight: 600,
                          }}
                        >
                          {t("Moving To Next Step in")}{" "}
                          <span style={{ color: "#5926f0", fontWeight: 800 }}>
                            {timer}
                          </span>
                        </span>
                      ) : (
                        <>
                          <div style={{ display: "flex", gap: "8px" }}>
                            {otpValues.map((value, index) => (
                              <input
                                key={index}
                                type="number"
                                maxLength={1}
                                value={value}
                                onChange={(e) => {
                                  handleInputChange(index, e.target.value);
                                  setOtpError("");
                                }}
                                onKeyDown={(e) => handleInputKeyDown(index, e)}
                                ref={(input) =>
                                  (inputRefs.current[index] = input)
                                }
                                style={{
                                  width: "36px",
                                  height: "36px",
                                  textAlign: "center",
                                  fontSize: "16px",
                                  border: "1px solid #ccc",
                                  borderRadius: "6px",
                                  outline: "none",
                                }}
                              />
                            ))}
                          </div>
                          {otpError && (
                            <span
                              style={{
                                fontSize: ".8rem",
                                fontWeight: 700,
                                color: "red",
                              }}
                            >
                              {otpError}
                            </span>
                          )}
                          <span
                            style={{
                              fontSize: "12px",
                              color: "#aeaeae",
                              fontWeight: 600,
                            }}
                          >
                            {resendTimer > 0 ? (
                              "Resend available in " + resendTimer + " seconds"
                            ) : (
                              <>
                                {"Didn't receive OTP? "}
                                <span
                                  style={{
                                    color: "#5926f0",
                                    fontWeight: 800,
                                    cursor: "pointer",
                                  }}
                                  onClick={() => setResendTimer(90)}
                                >
                                  {t("Resend Now")}
                                </span>
                              </>
                            )}
                          </span>
                          <Button
                            size="lg"
                            style={{
                              border: "none",
                              outline: "none",
                              background:
                                " linear-gradient(to right, rgba(0, 0, 0, 0.40) 0%, rgba(0, 0, 0, 0.40) 100%), linear-gradient(to left, #E64067 0%, #5926F0 55.65%, #4828A0",
                              backgroundBlendMode: "overlay, normal",
                              boxShadow:
                                "0px 11.90068244934082px 8.655041694641113px -5.409400939941406px rgba(89, 38, 240, 0.17)",
                              borderRadius: "6px",
                              display: "flex",
                              alignItems: "center",
                              fontSize: "18px",
                              opacity: isAnyFieldEmpty ? 0.5 : 1,
                              pointerEvents: isAnyFieldEmpty ? "none" : "auto",
                            }}
                            className="i_t_button"
                            onClick={() => createTransaction()}
                            disabled={isAnyFieldEmpty}
                          >
                            {t("Verify")} <ChevronRight size={24} />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}
              {step === 5 && (
                <>
                  <div style={{ textAlign: "center" }}>
                    <span style={{ color: "#8a8a8a", fontSize: "1.1rem" }}>
                      {t("You are transferring")}
                    </span>
                    <h4 style={{ fontSize: "2rem" }}>
                      {currency} {amount}
                    </h4>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: ".5rem",
                    }}
                  >
                    <div
                      style={{
                        background: "rgba(89,38,240,0.06)",
                        padding: "16px",
                        display: "flex",
                        alignItems: "center",
                        gap: ".5rem",
                        borderRadius: "50px",
                        flex: 1,
                        color: "#8a8a8a",
                        fontSize: window.innerWidth > 1500 ? ".8rem" : ".6rem",
                      }}
                    >
                      {t("Exchange Rate:")}{" "}
                      <span style={{ color: "black", fontWeight: 600 }}>
                        {+transactionDetails?.wholesale_fx_rate.toFixed(2)}{" "}
                        {transactionDetails?.destination?.currency}
                      </span>
                    </div>
                    <div
                      style={{
                        background: "rgba(89,38,240,0.06)",
                        padding: "16px",
                        display: "flex",
                        alignItems: "center",
                        gap: ".5rem",
                        borderRadius: "50px",
                        flex: 1,
                        color: "#8a8a8a",
                        fontSize: window.innerWidth > 1500 ? ".8rem" : ".6rem",
                      }}
                    >
                      {t("Conversion:")}{" "}
                      <span style={{ color: "black", fontWeight: 600 }}>
                        {transactionDetails?.destination?.amount}{" "}
                        {transactionDetails?.destination?.currency}
                      </span>
                    </div>
                  </div>
                  <div
                    style={{
                      background: "rgba(89,38,240,0.06)",
                      padding: "16px",
                      display: "flex",
                      alignItems: "center",
                      gap: ".5rem",
                      borderRadius: "10px",
                    }}
                  >
                    <span style={{ minWidth: "100px", color: "#8a8a8a" }}>
                      {t("To Recipient:")}
                    </span>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: ".6rem",
                      }}
                    >
                      <div
                        style={{
                          width: "30px",
                          height: "30px",
                          borderRadius: "16px",
                          display: "grid",
                          placeItems: "center",
                          background:
                            "linear-gradient(-24deg, rgb(210, 60, 122) 0%, rgb(164, 52, 167) 43.66%, rgb(88, 38, 239) 100%)",
                          color: "white",
                          fontSize: "1rem",
                          fontWeight: 800,
                        }}
                      >
                        {item?.beneficiary_type === "individual"
                          ? item?.first_name[0]?.toUpperCase()
                          : item?.company
                            ? item?.company_name[0]?.toUpperCase()
                            : ""}
                      </div>
                      <span style={{ fontWeight: 600, fontSize: ".8rem" }}>
                        {item?.first_name} {item?.last_name}
                      </span>
                    </div>
                  </div>
                  {/* country */}
                  <div
                    style={{
                      background: "rgba(89,38,240,0.06)",
                      padding: "16px",
                      display: "flex",
                      alignItems: "center",
                      gap: ".5rem",
                      borderRadius: "10px",
                    }}
                  >
                    <span style={{ minWidth: "100px", color: "#8a8a8a" }}>
                      {t("Country")}:
                    </span>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: ".6rem",
                      }}
                    >
                      <img
                        src={country.file_url}
                        alt={country.code}
                        style={{
                          objectFit: "cover",
                          borderRadius: "4px",
                          boxShadow: "0 0 10px rgba(0,0,0,.3)",
                        }}
                        className="i_t_flag"
                        draggable="false"
                      />
                      <span style={{ fontWeight: 600, fontSize: ".8rem" }}>
                        {country.name}
                      </span>
                    </div>
                  </div>
                  {/* payout channel */}
                  <div
                    style={{
                      background: "rgba(89,38,240,0.06)",
                      padding: "16px",
                      display: "flex",
                      alignItems: "center",
                      gap: ".5rem",
                      borderRadius: "10px",
                    }}
                  >
                    <span style={{ minWidth: "100px", color: "#8a8a8a" }}>
                      {t("Via")}:
                    </span>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: ".6rem",
                      }}
                    >
                      <div
                        style={{
                          minHeight: "35px",
                          minWidth: "35px",
                          background:
                            "linear-gradient(-24deg, rgb(210, 60, 122) 0%, rgb(164, 52, 167) 43.66%, rgb(88, 38, 239) 100%)",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          borderRadius: "12px",
                          boxShadow: "0px 4px 7px rgba(172, 53, 159, 0.31)",
                        }}
                      >
                        <img
                          src={payoutChannel.icon}
                          alt={payoutChannel.name[0]}
                          style={{
                            height: "22px",
                            width: "22px",
                            objectFit: "contain",
                          }}
                        />
                      </div>
                      <span style={{ fontWeight: 600, fontSize: ".8rem" }}>
                        {payoutChannel.name}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </>
          ))
        ) : (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              flexDirection: "column",
              width: "max-content",
              margin: "0 auto",
            }}
          >
            <span style={{ fontSize: "1rem", fontWeight: 600 }}>
              {t("Please add payment method to this beneficiary to continue.")}
            </span>
            <Link
              to={`/beneficiaries/edit?user_id=${item._id}`}
              style={{
                alignSelf: "flex-end",
                marginTop: ".4rem",
                textDecoration: "underline",
              }}
            >
              {t("Add Now")}
            </Link>
          </div>
        )}
      </ModalBody>
    </Modal>
  );
};

export default SendPaymentModal;
