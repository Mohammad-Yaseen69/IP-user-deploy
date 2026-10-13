import { Check, ChevronRight } from "react-feather";
import { useContext, useEffect, useRef, useState } from "react";
import Draggable from "react-draggable";
import { useTranslation } from "react-i18next";
import SelectedAmountAndCurrency from "../SelectedAmountAndCurrency";
import faded_lines from "../files/faded_lines.png";
import { UserContext } from "../../../Context/UserContext";
import { useNavigate } from "react-router";
import SelectedPaymentType from "../SelectedPaymentType";
import { Swiper, SwiperSlide } from "swiper/react";
import SelectedRecipient from "../SelectedRecipient";
import { encryptData } from "../../../Helper/EssentilaMethods/Encryption";
import axios from "axios";
import { decryptData } from "../../../Helper/EssentilaMethods/Decryption";
import { toast } from "react-toastify";
import useWindowWidth from "../../../utils/useWindowWidth";

const ConfirmRequest = ({
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
}) => {
  const { t } = useTranslation();
  const [complete, setComplete] = useState(false);
  const pRef = useRef(null);
  const divRef = useRef(null);
  const svgRef = useRef(null);
  const chevRef = useRef(null);
  const width = useWindowWidth();
  const { userDetails, profileCompleted } = useContext(UserContext);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!profileCompleted) {
      setShowCompletionModal(true);
    }
  }, [profileCompleted]);

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

  const { authHeader } = useContext(UserContext);
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

  return (
    <>
      {/* error modal */}

      <div style={{ display: "flex", flexDirection: "column", gap: ".75rem" }}>
        <SelectedAmountAndCurrency
          amount={amount}
          currency={currency}
          setSubStep={setSubStep}
          step={3}
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
                step={2}
                setBeneficiary={setBeneficiary}
              />
            </SwiperSlide>
          ))}
        </Swiper>
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
                color: "black",
              }}
              onClick={(_) => setSubStep(3)}
            >
              {t("edit")}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: ".6rem" }}>
            <span
              style={{
                fontWeight: 700,
                fontSize: "1.4rem",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {title?.length > 100 ? `${title.slice(0, 100)}...` : title}
            </span>
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
                color: "black",
              }}
              onClick={(_) => setSubStep(3)}
            >
              {t("edit")}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: ".6rem" }}>
            <span
              style={{
                fontWeight: 700,
                fontSize: "1.4rem",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {description?.length > 100 ? `${description.slice(0, 100)}...` : description}
            </span>
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
            boxShadow: "0px 6px 13px -5.4094px rgba(89, 38, 240, 0.17)",
            borderRadius: "16px",
            padding: "1rem",
            width: width > 600 ? "85%" : "100%",
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
                top: width > 490 ? "10px" : "6px",
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
      </div>
      {/* </CardBody> */}
      {/* </Card> */}
    </>
  );
};

export default ConfirmRequest;
