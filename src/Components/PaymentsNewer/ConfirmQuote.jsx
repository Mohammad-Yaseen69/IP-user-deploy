import { Card, CardBody } from "reactstrap";
import { Check, ChevronRight } from "react-feather";
import { useContext, useEffect, useRef, useState } from "react";
import Draggable from "react-draggable";
import { useTranslation } from "react-i18next";
import SelectedRecipient from "./SelectedRecipient";
import SelectedAmountAndCurrency from "./SelectedAmountAndCurrency";
import SelectedPaymentType from "./SelectedPaymentType";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import faded_lines from "./files/faded_lines.png";
import { FaRegFilePdf, FaRegFileVideo } from "react-icons/fa";
import { encryptData } from "../../Helper/EssentilaMethods/Encryption";
import axios from "axios";
import { UserContext } from "../../Context/UserContext";
import { toast } from "react-toastify";
import { decryptData } from "../../Helper/EssentilaMethods/Decryption";
import { useNavigate } from "react-router";

const ConfirmQuote = ({
  beneficiary,
  amount,
  currency,
  setConfirmed,
  setSubStep,
  title,
  description,
  isBargainable,
  files,
  setBeneficiary,
  quotationDetails,
  setToken,
  totalBalance,
  setOtpResponse = () => {},
}) => {
  const { t } = useTranslation();
  const [complete, setComplete] = useState(false);
  const pRef = useRef(null);
  const divRef = useRef(null);
  const svgRef = useRef(null);
  const chevRef = useRef(null);
  const { userDetails, profileCompleted, authHeader } = useContext(UserContext);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (profileCompleted) {
      if (
        userDetails?.user?.kyc_status &&
        userDetails?.user?.kyc_status !== "approved" &&
        amount > totalBalance
      ) {
        setShowVerificationModal(true);
      } else {
        setShowVerificationModal(false);
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
        setTimeout(() => {
          setConfirmed(true);
        }, 200);
      }
    } else {
      setConfirmed(false);
    }
  };

  useEffect(() => {
    const sendOtp = async () => {
      try {
        const data = {
          data: {
            account_id: quotationDetails?.account_id,
            reciever_id: quotationDetails?.receiver_id,
            title: quotationDetails?.title,
            desc: quotationDetails?.desc,
            amount: quotationDetails?.amount,
            bargain: quotationDetails?.bargain,
            sender_wallet_id: quotationDetails?.sender_wallet_id,
          },
          type: userDetails?.tfa ? "authenticator" : "sms",
        };
        // console.log(data)
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
        // console.log(dec)
        setOtpResponse(dec);
        setConfirmed(true);
        setToken(dec?.token);
      } catch (error) {
        toast.error(t("Something went wrong while confirming the transaction!"));
        // console.log(decryptData(error?.response?.data?.data))
      }
    };
    if (complete) {
      sendOtp();
    }
  }, [complete]);

  return (
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
          justifyContent: "space-between",
          padding: "20px 30px",
          background: "rgba(0,0,0,.03)",
          paddingBottom: 0,
          boxShadow: "0px 18px 15.348464965820312px -15px rgba(89, 38, 240, 0.16)",
        }}
        className="conf_cont"
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "6px",
            overflowY: "auto",
          }}
        >
          <SelectedAmountAndCurrency
            amount={amount}
            currency={currency}
            setSubStep={setSubStep}
            step={2}
            type="Quoting"
          />
          <Swiper
            effect={"cards"}
            grabCursor={true}
            cardsEffect={{
              rotate: false,
            }}
            style={{ width: "100%" }}
            className="mySwiper"
          >
            {beneficiary.map((item, index) => (
              <SwiperSlide key={item.id}>
                <SelectedRecipient
                  index={index}
                  user={item}
                  setSubStep={setSubStep}
                  size={beneficiary.length}
                  step={1}
                  setBeneficiary={setBeneficiary}
                />
              </SwiperSlide>
            ))}
          </Swiper>
          {/* title */}
          <div
            style={{
              background: "rgba(89, 38, 240, 0.08)",
              borderRadius: "16px",
            }}
            className="i_t_selected"
          >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span
                style={{
                  color: "rgba(0,0,0,0.36)",
                  fontSize: ".7rem",
                  fontWeight: 700,
                }}
              >
                {t(`Title`)}
              </span>
              <span
                style={{
                  background: "white",
                  boxShadow:
                    "0px 3.3496174812316895px 11.723660469055176px -3.3496174812316895px rgba(89, 38, 240, 0.25)",
                  borderRadius: "30px",
                  fontSize: ".6rem",
                  padding: "3px 7px",
                  cursor: "pointer",
                  width: "60px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
                onClick={(_) => setSubStep(2)}
              >
                {t("edit")}
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: ".6rem" }}>
              <span style={{ fontWeight: 700, fontSize: "1.4rem" }}>{t(title)}</span>
            </div>
          </div>
          {/* desciption */}
          <div
            style={{
              background: "rgba(89, 38, 240, 0.08)",
              borderRadius: "16px",
            }}
            className="i_t_selected"
          >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span
                style={{
                  color: "rgba(0,0,0,0.36)",
                  fontSize: ".7rem",
                  fontWeight: 700,
                }}
              >
                {t(`Description`)}
              </span>
              <span
                style={{
                  background: "white",
                  boxShadow:
                    "0px 3.3496174812316895px 11.723660469055176px -3.3496174812316895px rgba(89, 38, 240, 0.25)",
                  borderRadius: "30px",
                  fontSize: ".6rem",
                  padding: "3px 7px",
                  cursor: "pointer",
                  width: "60px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
                onClick={(_) => setSubStep(2)}
              >
                {t("edit")}
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: ".6rem" }}>
              <span style={{ fontWeight: 700, fontSize: "1.4rem" }}>
                {description?.length > 100 ? `${description.slice(0, 100)}...` : description}
              </span>
            </div>
          </div>
          {/* files */}
          {files.length > 0 && (
            <div
              style={{
                background: "rgba(89, 38, 240, 0.08)",
                borderRadius: "16px",
                height: "fit-content",
              }}
              className="i_t_selected"
            >
              <span
                style={{
                  color: "rgba(0,0,0,0.36)",
                  fontSize: ".7rem",
                  fontWeight: 700,
                }}
              >
                {t(`Attachements`)}
              </span>
              <div
                style={{
                  display: "flex",
                  gap: "1rem",
                  overflowX: "auto",
                  marginTop: ".5rem",
                }}
              >
                {files.map((file, index) => {
                  const previewURL = URL.createObjectURL(file);
                  return (
                    <div
                      key={index}
                      title={file?.name}
                      style={{
                        height: "50px",
                        width: "50px",
                        borderRadius: "5px",
                        boxShadow: "0 0 3px #1111113e",
                        position: "relative",
                        overflow: "hidden",
                      }}
                    >
                      {file?.type?.toLowerCase()?.includes("image") && (
                        <img
                          key={previewURL}
                          src={previewURL}
                          alt="img"
                          style={{
                            height: "100%",
                            width: "100%",
                            objectFit: "cover",
                          }}
                        />
                      )}
                      {file?.type?.toLowerCase()?.includes("video") && (
                        <div
                          style={{
                            background:
                              "linear-gradient(to right, rgba(0, 0, 0, 0.40) 0%, rgba(0, 0, 0, 0.40) 100%), linear-gradient(to left, #E64067 0%, #5926F0 55.65%, #4828A0",
                            height: "100%",
                            width: "100%",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          <FaRegFileVideo size={30} color="white" />
                        </div>
                      )}
                      {file?.type?.toLowerCase()?.includes("application/pdf") && (
                        <div
                          style={{
                            background:
                              "linear-gradient(to right, rgba(0, 0, 0, 0.40) 0%, rgba(0, 0, 0, 0.40) 100%), linear-gradient(to left, #E64067 0%, #5926F0 55.65%, #4828A0",
                            height: "100%",
                            width: "100%",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          <FaRegFilePdf size={30} color="white" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
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
                fontSize: window.innerWidth > 1700 ? "1.1rem" : ".95rem",
                fontWeight: 500,
                color: "white",
              }}
            >
              {t("Payment Confirmed")}
            </p>
          )}
        </div>
        {showVerificationModal && (
          <div
            style={{
              padding: "1rem",
              borderRadius: "8px",
              background: "#5926f0",
              fontSize: ".8rem",
              fontWeight: 500,
              color: "white",
              marginTop: "1rem",
            }}
          >
            {t(
              "To enhance your experience and access increased limits, please complete your identity verification (KYC) process. It's quick, secure, and ensures compliance with regulations. Thank you for your cooperation!",
            )}
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default ConfirmQuote;
