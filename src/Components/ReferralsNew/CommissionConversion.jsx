import React, { useContext, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, Input, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";
import { UserContext } from "../../Context/UserContext";
import { NumberInputValidator } from "../../Helper/NumberInput";
import Draggable from "react-draggable";
import { Check, ChevronRight } from "react-feather";
import { encryptData } from "../../Helper/EssentilaMethods/Encryption";
import axios from "axios";
import { decryptData } from "../../Helper/EssentilaMethods/Decryption";
import { toast } from "react-toastify";
import faded_lines from "../PaymentsNewer/files/faded_lines.png";
import OTPConfirmation from "../../Common/Component/OtpVerification";
import { useNavigate } from "react-router";
import InstaPayLoader from "../Loader";
import { LimitsErrorMessage } from "../../utils/Functions/paymentLimits";

const CommissionConversion = ({
  isOpen,
  toggle,
  referralBalance = 0,
  defaultCurrency,
  setSuccess,
  getReferralCommission,
  toggleWithdrawModal,
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [amount, setAmount] = useState(1);
  const [currency, setCurrency] = useState(defaultCurrency || "USD");
  const { userWallets, authHeader, userDetails, setProfileLockTime } = useContext(UserContext);
  const [token, setToken] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [complete, setComplete] = useState(false);
  const pRef = useRef(null);
  const divRef = useRef(null);
  const svgRef = useRef(null);
  const chevRef = useRef(null);
  const [saving, setSaving] = useState(false);
  const [codeType, setCodeType] = useState("sms");
  const [otpMethods, setOtpMethods] = useState(null);
  const [loading, setLoading] = useState("");

  useEffect(() => {
    setCodeType(
      userDetails?.tfa
        ? "authenticator"
        : userDetails?.email_verification
          ? "email"
          : userDetails?.whatsapp_verification
            ? "whatsapp"
            : "sms",
    );
  }, [userDetails]);

  const handleDrag = (e, ui) => {
    const { x } = ui;
    pRef.current.style.transform = `translateX(${(x * 90) / 100}px)`;
    svgRef.current.style.transform = `translateX(${x}px)`;
    const threshold = divRef?.current?.offsetWidth - 72;
    if (x >= threshold) {
      setComplete(true);
    } else {
      setConfirmed(false);
    }
  };

  const sendOtp = async (codeTypeArg) => {
    try {
      const wallet = userWallets?.find((it) => it?.currency?.code === currency);
      const data = {
        data: {
          account_id: userDetails?._id,
          amount,
          receiving_wallet: wallet?._id,
        },
        type: codeTypeArg ?? codeType,
      };
      const encrypted = encryptData(data);
      const res = await axios.post(
        `${import.meta.env.VITE_IP_DEV_API}/api/wallet/send-otp`,
        {
          data: encrypted,
        },
        {
          headers: authHeader,
        },
      );

      const dec = decryptData(res.data.data);
      console.log(dec);
      setOtpMethods(dec);
      if (!codeTypeArg) setCodeType(dec?.otp_sent_on || "sms");
      setConfirmed(true);
      setToken(dec?.token);
    } catch (error) {
      toast.error(t("Something went wrong while confirming the transaction!"));
      console.log(decryptData(error?.response?.data?.data));
    }
  };

  useEffect(() => {
    if (complete) {
      sendOtp();
    }
  }, [complete]);

  const convertCommission = (setter, type, otp, setOtpError) => {
    setSaving(true);
    const data = {
      token,
      otp,
      type: codeType,
    };
    // console.log(data)
    axios
      .post(
        `${import.meta.env.VITE_IP_DEV_API}/api/invitation/move-commissions`,
        { data: encryptData(data) },
        {
          headers: authHeader,
        },
      )
      .then((res) => {
        const decrypted = decryptData(res.data.data);
        // console.log(decrypted)
        getReferralCommission();
        setter(true);
        toggle();
      })
      .catch((err) => {
        const decrypted = decryptData(err.response.data.data);
        setOtpError(
          decrypted?.message ??
            "We cannot process your request at the moment, please try again later.",
        );
        if (decrypted.message?.toLowerCase()?.includes("account is locked")) {
          const time = decrypted?.message?.split(" in ")?.[1]?.split(" ")?.[0] ?? "0:00";
          const timeInSec = +time?.split(":")?.[0] * 60 + +time?.split(":")?.[1];
          setProfileLockTime(timeInSec);
          const coun = localStorage.getItem("ip_country");
          localStorage.clear();
          localStorage.setItem("ip_country", coun);
          navigate("/login");
        }
        // console.log(decryptData(err.response.data.data))
      })
      .finally(() => setSaving(false));
  };

  const [step, setStep] = useState(1);
  const [fx, setFx] = useState({});
  const [fxError, setFxError] = useState("");

  useEffect(() => {
    setLoading(true);
    setFxError("");
    const getCommissionRates = async () => {
      setFx({});
      try {
        const wallet = userWallets?.find((it) => it?.currency?.code === currency);
        const res = await axios.get(
          `${import.meta.env.VITE_IP_DEV_API}/api/invitation/get-withdrawal-rates/USD/${userDetails?.level?._id}/${amount}/${wallet?._id}`,
        );
        const dec = decryptData(res.data.data);
        setFx(dec?.data);
      } catch (error) {
        const err = decryptData(error?.response?.data?.data);
        setFxError(err?.message ?? "Something went wrong while getting rates.");
        const er = LimitsErrorMessage(err?.code ?? err?.message);
        if (er) {
          setFxError(er);
        }
      } finally {
        setLoading(false);
      }
    };

    if (currency) {
      if (currency !== "USD") {
        getCommissionRates();
      } else {
        setFx({
          recipient: {
            value: amount,
            currency: "USD",
          },
        });
        setLoading(false);
      }
    }
  }, [currency, step]);

  return (
    <Modal isOpen={isOpen}>
      <ModalHeader toggle={toggle}>
        {t("Convert Referral Commission to Wallet Balance")}
      </ModalHeader>
      <ModalBody>
        {!confirmed ? (
          <>
            {step === 1 ? (
              <div
                style={{
                  position: "relative",
                  display: "flex",
                  gap: "1rem",
                }}
              >
                <Input
                  value={amount}
                  type="number"
                  onChange={(e) => {
                    const { value } = e.target;
                    if (value > referralBalance) return;
                    setAmount(value.replace(/[^0-9]/g, ""));
                  }}
                  style={{
                    paddingRight: "1.5rem",
                  }}
                  // onKeyPress={NumberInputValidator}
                />
                <span
                  style={{
                    position: "absolute",
                    top: "50%",
                    right: "10px",
                    transform: "translateY(-50%)",
                    fontSize: ".7rem",
                    fontWeight: 800,
                    cursor: "pointer",
                    color: "#5926f0",
                  }}
                  onClick={() => setAmount(referralBalance)}
                >
                  {t("MAX")}
                </span>
              </div>
            ) : step === 2 ? (
              <>
                <Input type="select" value={currency} onChange={(e) => setCurrency(e.target.value)}>
                  {userWallets
                    ?.filter(
                      (item) =>
                        item?.wallet_type === "insta" &&
                        !item?.blocked &&
                        !item?.admin_blocked &&
                        !item?.blocked &&
                        !item?.admin_blocked &&
                        item?.status === "active",
                    )
                    ?.map((item) => (
                      <option value={item?.currency?.code}>{item?.currency?.code} </option>
                    ))}
                </Input>
                {fxError ? (
                  <div
                    style={{
                      margin: "1rem",
                      textAlign: "center",
                      color: "red",
                      fontSize: ".9rem",
                      fontWeight: "600",
                    }}
                  >
                    {t(fxError)}
                  </div>
                ) : loading ? (
                  <div
                    style={{
                      height: "50px",
                      width: "50px",
                      margin: "1rem auto",
                    }}
                  >
                    <InstaPayLoader />
                  </div>
                ) : (
                  <>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "1rem",
                        marginTop: "1rem",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          gap: "1rem",
                        }}
                      >
                        <span>{t("Converting")}</span>
                        <span>
                          {Number(amount)?.toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                          {t("USD")}
                        </span>
                      </div>
                      {currency !== "USD" && (
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: "1rem",
                          }}
                        >
                          <span>{t("Exchange Rate")}</span>
                          <span>
                            {t("1.00 USD =")}
                            {Number(fx?.exchange_rate?.value)?.toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}{" "}
                            {fx?.exchange_rate?.currency}
                          </span>
                        </div>
                      )}
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          gap: "1rem",
                        }}
                      >
                        <span>{t("You will Get")}</span>
                        <span>
                          {Number(fx?.recipient?.value)?.toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}{" "}
                          {fx?.recipient?.currency}
                        </span>
                      </div>

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
                            {t("Payment Confirmed")}
                          </p>
                        )}
                      </div>
                    </div>
                    {/* {
                                                                amount > userDetails?.used_limits?.daily_receiving_limit
                                                                    ?
                                                                    <div style={{ marginTop: "1rem" }}>
                                                                        <span>Entered amount exceeds your daily receiving limit.Do you want to <span
                                                                            style={{ color: "#5926f0", fontWeight: "700", textDecoration: "underline", cursor: "pointer" }}
                                                                            onClick={() => {
                                                                                toggle()
                                                                                toggleWithdrawModal()
                                                                            }}
                                                                        >Withdraw Externally</span> or <span
                                                                            style={{ color: "#5926f0", fontWeight: "700", textDecoration: "underline", cursor: "pointer" }}
                                                                            onClick={() => {
                                                                                setStep(1)
                                                                            }}
                                                                        >Adjust Amount</span>?</span>
                                                                    </div>
                                                                    : ""
                                                            } */}
                  </>
                )}
              </>
            ) : (
              ""
            )}
          </>
        ) : (
          <OTPConfirmation
            variant="card"
            callback={convertCommission}
            setter={setSuccess}
            setterValue={true}
            hideOtp={() => {}}
            processing={saving}
            resendHandler={sendOtp}
            authType={codeType}
            setAuthType={setCodeType}
            methods={otpMethods}
          />
        )}
      </ModalBody>
      {step === 1 && (
        <ModalFooter>
          <Button
            color="primary"
            style={{ borderRadius: "8px" }}
            onClick={() => setStep(2)}
            disabled={amount <= 0 || !amount || amount > referralBalance}
          >
            {t("Next")}
          </Button>
        </ModalFooter>
      )}
    </Modal>
  );
};

export default CommissionConversion;
