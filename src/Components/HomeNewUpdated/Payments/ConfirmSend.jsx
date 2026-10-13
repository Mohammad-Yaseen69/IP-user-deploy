import React, { useContext, useEffect, useRef, useState } from "react";
import { Card, CardBody } from "reactstrap";
import faded_lines from "../../PaymentsNewer/files/faded_lines.png";
import { useTranslation } from "react-i18next";
import Draggable from "react-draggable";
import { Check, ChevronRight } from "react-feather";
import { UserContext } from "../../../Context/UserContext";
import { decryptData } from "../../../Helper/EssentilaMethods/Decryption";
import { encryptData } from "../../../Helper/EssentilaMethods/Encryption";
import axios from "axios";

const ConfirmSend = ({
  country,
  payoutChannel,
  amount,
  currency,
  item,
  reason,
  quotationDetails,
  setCreatedTransaction,
  setStep,
  service,
}) => {
  const [complete, setComplete] = useState(false);
  const pRef = useRef(null);
  const divRef = useRef(null);
  const svgRef = useRef(null);
  const chevRef = useRef(null);
  const { t } = useTranslation();
  const { userDetails, authHeader, userWallets } = useContext(UserContext);
  const [createdQuotation, setCreatedQuotation] = useState(null);

  useEffect(() => {
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
      })
      .catch((err) => {
        // console.log(decryptData(err.response.data.data))
      });
  }, []);

  const handleDrag = (e, ui) => {
    const { x } = ui;
    pRef.current.style.transform = `translateX(${(x * 90) / 100}px)`;
    svgRef.current.style.transform = `translateX(${x}px)`;
    const threshold = divRef?.current?.offsetWidth - 72;
    if (x >= threshold) {
      setComplete(true);
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
            setStep(3);
          }
        })
        .catch((err) => {
          const decrypted = decryptData(err.response.data.data);
          // console.log(decrypted)
        });
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
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "rgba(0,0,0,0.36)", fontSize: ".7rem" }}>
              {t("Country")}
            </span>
          </div>
          <div
            style={{ display: "flex", alignItems: "center", gap: ".5rem" }}
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
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "rgba(0,0,0,0.36)", fontSize: ".7rem" }}>
              {t("Payout Channel")}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: ".6rem" }}>
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
            <span style={{ fontWeight: 500 }}>{payoutChannel.name}</span>
          </div>
        </div>
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
              {t("You are sending")}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: ".6rem" }}>
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
                    : (item?.company_name?.[0] ?? item?.user?.first_name[0])}
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
                  <h5 className="mb-0" style={{ fontSize: ".9rem" }}>
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
            boxShadow: "0px 6px 13px -5.4094px rgba(89, 38, 240, 0.17)",
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
      </CardBody>
    </Card>
  );
};

export default ConfirmSend;
