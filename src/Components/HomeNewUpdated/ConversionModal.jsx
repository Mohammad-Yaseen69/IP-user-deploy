import { Modal, ModalBody, ModalHeader } from "reactstrap";
import styles from "./styles/ConversionModal.module.css";
import faded_lines from "../PaymentsNewer/files/faded_lines.png";
import { useRef, useState, useEffect, useContext } from "react";
import Draggable from "react-draggable";
import { Check, ChevronRight } from "react-feather";
import { useTranslation } from "react-i18next";
import c_vid from "../PaymentsNewer/files/confirm.mp4";
import { UserContext } from "../../Context/UserContext";
import axios from "axios";
import { decryptData } from "../../Helper/EssentilaMethods/Decryption";
import { encryptData } from "../../Helper/EssentilaMethods/Encryption";
import { InactivityContext } from "../../InactivityWrapper";
import { LimitsErrorMessage } from "../../utils/Functions/paymentLimits";
import { useIdempotency } from "../../hooks/Payments/useIdempotency";
import { formatCurrency } from "../../Helper/AmountFormat";

const formatTimeLeft = (seconds) => {
  const safe = Math.max(0, seconds);
  return `${Math.floor(safe / 60)}:${String(safe % 60).padStart(2, "0")}`;
};

const ConversionModal = ({
  isOpen,
  toggleModal,
  amount,
  exchangeAmount,
  currency,
  exchangeCurrency,
  exchangePrice,
  setEnteredCurrency,
  setResultCurrency,
  setUserCurrency,
  setExchangedCurrency,
  exchangeFee,
  fxDet,
  senderWallet = null,
  receiverWallet = null,
  quoteExpiresAt = null,
  isQuoteExpired = false,
  onRefreshQuote = () => {},
  isRefreshing = false,
  onSuccess = () => {},
}) => {
  const { setIsExtended } = useContext(InactivityContext);
  const { t } = useTranslation();
  const { userWallets, authHeader, getUserWallets } = useContext(UserContext);
  const { getKey, reset } = useIdempotency();
  const [complete, setComplete] = useState(false);
  const pRef = useRef(null);
  const divRef = useRef(null);
  const svgRef = useRef(null);
  const chevRef = useRef(null);
  const [step, setStep] = useState(1);

  const [secondsLeft, setSecondsLeft] = useState(0);
  const quoteUnavailable = isQuoteExpired || !fxDet?.exchange_rate;

  useEffect(() => {
    if (step === 2) {
      setIsExtended(true);
    }
  }, [step]);

  useEffect(() => {
    if (!quoteExpiresAt) return undefined;

    const tick = () =>
      setSecondsLeft(Math.max(0, Math.round((quoteExpiresAt - Date.now()) / 1000)));
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [quoteExpiresAt]);

  useEffect(() => {
    if (quoteUnavailable) {
      setComplete(false);
    }
  }, [quoteUnavailable]);

  const currentWallet =
    senderWallet || userWallets.filter((item) => item.currency.code === currency)[0];
  const exchangedWallet =
    receiverWallet || userWallets.filter((item) => item.currency.code === exchangeCurrency)[0];

  const numberOfFields = 6;
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
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setOTPValues(Array(numberOfFields).fill(""));
    setVerified(false);
    setTimer(3);
    setResendTimer(0);
    setStep(1);
    setComplete(false);
    reset();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setStep(1);
    }
  }, [isOpen]);

  useEffect(() => {
    if (verified && timer > 0) {
      const intervalId = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);

      return () => {
        clearInterval(intervalId);
      };
    } else if (verified && timer === 0) {
      setStep(3);
      setIsExtended(false);
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

  // const handleInputChange = (index, value) => {
  //     let numericValue = value.replace(/[^0-9]/g, '');
  //     if (numericValue.length > 1) {
  //         numericValue = numericValue.slice(-1);
  //     }
  //     let newOTPValues = [...otpValues];
  //     newOTPValues[index] = numericValue;
  //     setOTPValues(newOTPValues);
  //     if (numericValue && index < numberOfFields - 1) {
  //         inputRefs.current[index + 1].focus();
  //     }
  //     const isEmpty = newOTPValues.some(val => val === '');
  //     setIsAnyFieldEmpty(isEmpty);
  // };

  // const handleInputKeyDown = (index, event) => {
  //     if (event.key === 'Backspace') {
  //         if (otpValues[index] === '' && index > 0) {
  //             inputRefs.current[index - 1].focus();
  //         } else if (index > 0) {
  //             const newOTPValues = [...otpValues];
  //             newOTPValues[index] = '';
  //             setOTPValues(newOTPValues);
  //             setIsAnyFieldEmpty(true)
  //         }
  //     }
  // };

  const handleDrag = (e, ui) => {
    const { x } = ui;
    pRef.current.style.transform = `translateX(${(x * 90) / 100}px)`;
    svgRef.current.style.transform = `translateX(${x}px)`;
    const threshold = divRef?.current?.offsetWidth - 72;
    if (x >= threshold) {
      setTimeout(() => {
        if (!complete) {
          setComplete(true);
        }
      }, 100);
    }
  };

  // const [token, setToken] = useState("")
  // useEffect(() => {
  //     const sendOtp = async () => {
  //         try {
  //             const data = {
  //                 sender_wallet_id: currentWallet._id,
  //                 receiver_wallet_id: exchangedWallet._id,
  //                 amount: +amount
  //             }
  //             // console.log(data)
  //             const encrypted = encryptData(data)
  //             const res = await axios.post(`${import.meta.env.VITE_IP_DEV_API}/api/wallet/send-otp`, {
  //                 data: encrypted
  //             }, {
  //                 headers: authHeader
  //             })

  //             const dec = decryptData(res.data.data)
  //             setToken(dec?.token)
  //             setStep(prev => prev + 1)
  //     } catch (error) {
  //             // console.log(decryptData(error?.response?.data?.data))
  //         }
  //     }
  //     if (complete) {
  //         sendOtp()
  //     }
  // }, [complete])

  const confirmConversion = () => {
    if (!currentWallet?._id || !exchangedWallet?._id) {
      setError(t("Wallet not found. Please try again."));
      return;
    }
    if (quoteUnavailable) {
      setComplete(false);
      return;
    }
    if (saving) return;

    setSaving(true);
    if (+currentWallet.balance.available < +amount) {
      setError(t("Insufficient Balance"));
      setSaving(false);
      return;
    }

    if (+currentWallet.balance.available >= +amount) {
      const isCryptoConversion =
        currentWallet?.wallet_type === "crypto" || exchangedWallet?.wallet_type === "crypto";

      if (isCryptoConversion && !fxDet?.token) {
        setError(t("The quoted rate has expired, please start again."));
        setSaving(false);
        return;
      }

      const data = {
        sender_wallet_id: currentWallet._id,
        receiver_wallet_id: exchangedWallet._id,
        amount: +amount,
      };

      const encrpted = encryptData(isCryptoConversion ? { token: fxDet?.token, ...data } : data);
      axios
        .post(
          `${import.meta.env.VITE_IP_DEV_API}/api/wallet/insta-wallet-conversion${isCryptoConversion ? "/transfer" : ""}`,
          { data: encrpted },
          {
            headers: {
              ...authHeader,
              "Idempotency-Key": getKey(),
            },
          },
        )
        .then((res) => {
          const decrypted = decryptData(res.data.data);
          console.log(decrypted);
          getUserWallets();
          setStep(2);
          onSuccess(decrypted);
        })
        .catch((err) => {
          const decrypted = decryptData(err.response.data.data);
          if (decrypted.message.toLowerCase() === "feature_not_allowed") {
            setError(
              t(
                "Currency conversion not available in your country at the moment,  please try again later",
              ),
            );
            return;
          }
          const error = LimitsErrorMessage(decrypted?.code ?? decrypted?.message);
          if (error) {
            reset();
            setError(error);
          } else {
            setError(t("We cannot process your request at the moment, please try again later."));
          }
        })
        .finally(() => {
          setSaving(false);
        });
    } else {
      setError(t("Insufficient Balance"));
    }
  };

  useEffect(() => {
    if (complete) {
      confirmConversion();
    }
  }, [complete]);
  return (
    <Modal
      isOpen={isOpen}
      toggle={() => {
        toggleModal();
        setError(null);
      }}
      style={{ maxWidth: "500px", margin: "0 auto", height: "600px" }}
    >
      <ModalHeader
        toggle={() => {
          toggleModal();
          setError(null);
        }}
      >
        {t("Currency Conversion")}
      </ModalHeader>
      <ModalBody style={{ padding: step > 1 ? "0px" : "1rem", overflow: "hidden" }}>
        {step === 1 && (
          <div
            style={{
              minHeight: "500px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              height: "fit-content",
            }}
          >
            <div className={styles.top}>
              <p>{t("You Are Converting")}</p>
              <h4>
                {Number(amount)?.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{" "}
                {currency}
              </h4>
            </div>
            <div className={styles.two_items} style={{ flexWrap: "wrap" }}>
              <div>
                <div className={styles.currency_info}>
                  <span style={{ whiteSpace: "nowrap" }}>{t("From")}:</span>
                  <p style={{ whiteSpace: "nowrap" }}>
                    {currentWallet?.wallet_id} ({currency})
                  </p>
                </div>
              </div>
              <div>
                <div className={styles.currency_info}>
                  <span style={{ whiteSpace: "nowrap" }}>{t("To")}:</span>
                  <p style={{ whiteSpace: "nowrap" }}>
                    {exchangedWallet?.wallet_id} ({exchangeCurrency})
                  </p>
                </div>
              </div>
            </div>
            <div className={styles.two_items} style={{ flexWrap: "wrap" }}>
              <div className={styles.currency_info}>
                <span style={{ whiteSpace: "nowrap" }}>{t("Exchange Rate")}:</span>
                <p style={{ whiteSpace: "nowrap" }}>
                  {Number(fxDet?.exchange_rate)?.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 4,
                  })}{" "}
                  {exchangeCurrency}
                </p>
              </div>
              <div className={styles.currency_info}>
                <span style={{ whiteSpace: "nowrap" }}>{t("Fees")}: </span>
                <p style={{ whiteSpace: "nowrap" }}>
                  {Number(fxDet?.fee?.amount)?.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{" "}
                  {currency}
                </p>
              </div>
            </div>
            <div className={styles.two_items} style={{ flexWrap: "wrap" }}>
              <div className={styles.currency_info}>
                <span style={{ whiteSpace: "nowrap" }}>{t("Amount After Fee")}: </span>
                <p style={{ whiteSpace: "nowrap" }}>
                  {formatCurrency(fxDet?.sending?.amount)} {currency}
                </p>
              </div>
              <div className={styles.currency_info}>
                <span style={{ whiteSpace: "nowrap" }}>{t("You Will Receive")}: </span>
                <p style={{ whiteSpace: "nowrap" }}>
                  {Number(fxDet?.receiver?.amount)?.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{" "}
                  {exchangeCurrency}
                </p>
              </div>
              <div className={styles.currency_info}>
                <span style={{ whiteSpace: "nowrap" }}>{t("Total")}: </span>
                <p style={{ whiteSpace: "nowrap" }}>
                  {Number(fxDet?.total)?.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{" "}
                  {currency}
                </p>
              </div>
            </div>
            {!error && !quoteUnavailable && quoteExpiresAt && (
              <p
                style={{
                  textAlign: "center",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "#6e7687",
                  margin: "1rem 0 0",
                }}
              >
                {t("This rate expires in")}{" "}
                <span style={{ color: "#5926f0", fontWeight: 800 }}>
                  {formatTimeLeft(secondsLeft)}
                </span>
              </p>
            )}
            {error ? (
              <p
                style={{
                  color: "red",
                  fontWeight: 600,
                  fontSize: "14px",
                  textAlign: "center",
                  marginBottom: "0px",
                  marginTop: "20px",
                }}
              >
                {" "}
                {error}{" "}
              </p>
            ) : quoteUnavailable ? (
              <div
                style={{
                  marginTop: "2rem",
                  padding: "1rem",
                  borderRadius: "16px",
                  border: "1px solid #f3c2bd",
                  background: "#fef3f2",
                  textAlign: "center",
                }}
              >
                <p
                  style={{
                    color: "#b42318",
                    fontWeight: 600,
                    fontSize: "14px",
                    marginBottom: "12px",
                  }}
                >
                  {t("This rate has expired. Refresh to get the current rate.")}
                </p>
                <button
                  type="button"
                  onClick={onRefreshQuote}
                  disabled={isRefreshing}
                  style={{
                    border: "none",
                    outline: "none",
                    borderRadius: "8px",
                    padding: ".6rem 1.4rem",
                    fontWeight: 600,
                    color: "white",
                    cursor: isRefreshing ? "not-allowed" : "pointer",
                    opacity: isRefreshing ? 0.7 : 1,
                    background:
                      "linear-gradient(to left, #E64067 0%, #5926F0 55.65%, #4828A0 100%)",
                  }}
                >
                  {isRefreshing ? t("Fetching Rates...") : t("Refresh Rate")}
                </button>
              </div>
            ) : (
              <div
                ref={divRef}
                style={{
                  textAlign: "center",
                  position: "relative",
                  background:
                    "linear-gradient(0deg, rgba(11, 13, 65, 0.16), rgba(11, 13, 65, 0.16)), radial-gradient(182.3% 794.57% at 91.57% -107.9%, #E64067 0%, #5926F0 55.65%, #4828A0 100%)",
                  backgroundBlendMode: "color-burn,normal",
                  boxShadow: "0px 6px 13px -5.4094px rgba(89, 38, 240, 0.17)",
                  borderRadius: "16px",
                  padding: "1rem",
                  width: "100%",
                  margin: "2rem auto 0",
                  overflow: "hidden",
                  pointerEvents: complete ? "none" : "all",
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
                  {t("Slide To Confirm")}
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
                    {saving ? t("Loading") + "..." : t("Conversion Confirmed")}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* {
                    step === 2
                    &&
                    <form
                        style={{
                            marginBottom: 0,
                            boxShadow: 'none',
                            gap: '1.3rem',
                            display: 'flex',
                            justifyContent: 'space-between',
                            flexDirection: 'column',
                            height: "500px"
                        }}
                        onSubmit={e => {
                            e.preventDefault()
                            confirmConversion()
                        }}
                    >
                        <div
                            style={{
                                borderRadius: '20px',
                                flex: '1',
                                display: 'flex',
                                alignItems: "center",
                                overflow: 'hidden',
                                padding: '14px',
                                // gap: '14px',
                                paddingBottom: '1rem',
                                boxShadow: '0px 18px 15.348464965820312px -15px rgba(89, 38, 240, 0.16)',
                            }}
                            className="otp_cont"
                        >
                            <div style={{
                                display: "flex",
                                justifyContent: "space-around",
                                alignItems: "center",
                                flexDirection: "column",
                                width: "100%",
                                height: "100%"
                            }}>
                                <div
                                    style={{
                                        border: '2px solid rgba(0, 0, 0, 0.04)',
                                        borderRadius: '30px',
                                        background: 'rgba(255, 255, 255, 0.04)',
                                        boxShadow: '0px 11.233247756958008px 19.658184051513672px 0px rgba(172, 53, 159, 0.09)',
                                        height: '120px',
                                        width: '120px',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                    }}
                                >
                                    <img
                                        src={otp_icon}
                                        alt="otp"
                                        style={{
                                            width: '42px',
                                            height: '42px',
                                            borderRadius: '12px',
                                            filter: 'drop-shadow(0px 4px 7px 0px rgba(172, 53, 159, 0.31))',
                                        }}
                                    />
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                    <h4 style={{
                                        fontSize: "24px",
                                        fontWeight: 700,
                                        textAlign: "center"
                                    }}>
                                        {
                                            verified
                                                ?
                                                t("Verification Code Verified")
                                                :
                                                t("Enter Code")
                                        }
                                    </h4>
                                    <p style={{ maxWidth: "212px", fontSize: "14px", fontWeight: 600, textAlign: "center" }}>
                                        {
                                            verified
                                                ?
                                                t("Verification Code Confirmed - You'll be redirected to the next step")
                                                :
                                                t("A one-time verification code has been sent to your email address  and phone number.")
                                        }
                                    </p>
                                </div>
                                {
                                    verified
                                        ?
                                        <span style={{ fontSize: "12px", color: "#aeaeae", fontWeight: 600 }}>
                                            {t("Moving To Next Step in")} <span style={{ color: "#5926f0", fontWeight: 800 }}>{timer}</span>
                                        </span>
                                        :
                                        <>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                {otpValues.map((value, index) => (
                                                    <input
                                                        key={index}
                                                        type="number"
                                                        maxLength={1}
                                                        value={value}
                                                        onChange={(e) => handleInputChange(index, e.target.value)}
                                                        onKeyDown={(e) => handleInputKeyDown(index, e)}
                                                        ref={(input) => (inputRefs.current[index] = input)}
                                                        style={{
                                                            width: '36px',
                                                            height: '36px',
                                                            textAlign: 'center',
                                                            fontSize: '16px',
                                                            border: '1px solid #ccc',
                                                            borderRadius: '6px',
                                                            outline: "none"
                                                        }}
                                                    />
                                                ))}
                                            </div>
                                            <span style={{ fontSize: "12px", color: "#aeaeae", fontWeight: 600, textAlign: "center" }}>
                                                {
                                                    resendTimer > 0
                                                        ?
                                                        t("Resend available in") + " " + resendTimer + " seconds"
                                                        :
                                                        <>
                                                            {t("Didn't receive the verification code?") + " "}
                                                            <span style={{ color: "#5926f0", fontWeight: 800, cursor: "pointer" }} onClick={() => setResendTimer(90)}>{t("Resend Now")}</span>
                                                        </>
                                                }

                                            </span>
                                            <Button size="lg" style={{
                                                border: "none",
                                                outline: "none",
                                                background: " linear-gradient(to right, rgba(0, 0, 0, 0.40) 0%, rgba(0, 0, 0, 0.40) 100%), linear-gradient(to left, #E64067 0%, #5926F0 55.65%, #4828A0",
                                                backgroundBlendMode: "overlay, normal",
                                                boxShadow: "0px 11.90068244934082px 8.655041694641113px -5.409400939941406px rgba(89, 38, 240, 0.17)",
                                                borderRadius: "6px",
                                                display: "flex",
                                                alignItems: "center",
                                                fontSize: "18px",
                                                opacity: isAnyFieldEmpty || saving ? 0.5 : 1,
                                                pointerEvents: isAnyFieldEmpty || saving ? 'none' : 'auto'
                                            }}
                                                className="i_t_button"
                                                disabled={isAnyFieldEmpty || saving}
                                            >
                                                {saving ? t("Verifing") : t("Verify")} <ChevronRight size={24} />
                                            </Button>
                                        </>
                                }
                            </div>
                        </div>
                    </form>
                } */}

        {step === 2 && (
          <div
            style={{
              padding: "2rem",
              textAlign: "center",
              display: "flex",
              borderRadius: "12px",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
            className="confirm_container"
          >
            <h4 style={{ color: "#5936f0", wordBreak: "normal" }} className="head_confirm">
              {t("Your funds have been credited to your wallet.")}
            </h4>
            <video
              src={c_vid}
              autoPlay
              loop="true"
              style={{
                width: "74%",
                objectFit: "cover",
                mixBlendMode: "multiply",
                margin: "0 auto",
              }}
            ></video>
            <div className={styles.two_items} style={{ marginBottom: "2rem" }}>
              <div className={styles.currency_info} style={{ flex: 6, justifyContent: "center" }}>
                <p
                  style={{
                    fontSize: window.innerWidth < 420 ? "13px" : "17px",
                    fontWeight: 700,
                  }}
                >
                  {exchangedWallet?.wallet_id}
                </p>
              </div>
              <div className={styles.currency_info} style={{ flex: 4, justifyContent: "center" }}>
                <p
                  style={{
                    fontSize: window.innerWidth < 420 ? "13px" : "17px",
                    fontWeight: 700,
                    whiteSpace: "nowrap",
                  }}
                >
                  {Number(fxDet?.receiver?.amount)?.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{" "}
                  {exchangeCurrency}
                </p>
              </div>
            </div>
            <p>{t("Thanks for using InstaPay")}</p>
          </div>
        )}
      </ModalBody>
    </Modal>
  );
};

export default ConversionModal;
