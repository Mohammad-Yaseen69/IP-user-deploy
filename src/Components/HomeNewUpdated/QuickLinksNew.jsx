import React from "react";
// import funds from "./files/funds.svg"
// import rm from "./files/rm.svg"
// import rq from "./files/rq.svg"
// import sm from "./files/sm.svg"
import sq from "./files/sq.svg";
import funds from "./files/AddFunds.png";
import sm from "./files/SendMoney.png";
import rm from "./files/ReceiveMoney.png";
// import cf from "./files/CryptoToFiat.png"
import cf from "./files/CryptoToFiat.svg";
import pa from "./files/pa.svg";
import qr from "./files/qr_s.svg";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./styles/responsiveness.css";

const QuickLinksNew = () => {
  const { t } = useTranslation();
  const items = [
    { icon: funds, text: t("Add Funds"), width: "26px", link: "/add-funds" },
    {
      icon: sm,
      text: t("Send Money"),
      width: "27px",
      link: "/payments?payment_action=send_money",
    },
    {
      icon: rm,
      text: t("Request Money"),
      width: "26px",
      link: "/payments?payment_action=req_money",
    },
    {
      icon: sq,
      text: t("Send A Quote"),
      width: "21px",
      link: "/payments?payment_action=send_quote",
    },
    // { icon: cf, text: t('Pay With Crypto'), width: "23px", link: "/payments?payment_action=send_crypto" },
    {
      icon: qr,
      text: t("My QR Code Sticker"),
      width: "20px",
      link: "/chips-in",
    },
    {
      icon: pa,
      text: t("My Payment Address"),
      width: "20px",
      link: "/payment-address",
    },
  ];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        background: "rgba(255, 255, 255, 1)",
        boxShadow: "0px 6.1253px 50.53368px 0px rgba(0, 0, 0, 0.09)",
        borderRadius: "1rem",
        // height: "fit-content",
        padding: ".3rem 0",
        justifyContent: "space-around",
      }}
    >
      {items.map((item, index) => (
        <Link
          to={item.link}
          key={index}
          style={{
            padding: ".81rem 1.5rem .81rem 1rem",
            display: "flex",
            justifyContent: "start",
            alignItems: "center",
            gap: ".5rem",
            cursor: "pointer",
            fontSize: ".8rem",
            minWidth: "180px",
            // height: "58px"
          }}
        >
          <div
            style={{
              height: "35px",
              width: "35px",
              borderRadius: "10px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              background:
                "radial-gradient(124.63% 259.09% at 48.48% 152.15%, rgba(230, 64, 103, 0.10) 0%, rgba(89, 38, 240, 0.10) 55.65%, rgba(72, 40, 160, 0.10) 100%), #FFF",
            }}
          >
            <img
              src={item.icon}
              loading="lazy"
              style={{ objectFit: "contain", width: item.width }}
            />
          </div>
          <p
            style={{
              color: "black",
              padding: "0",
              margin: "0",
              fontSize: ".85rem",
              whiteSpace: "nowrap",
              fontWeight: 700,
            }}
          >
            {item.text}
          </p>
        </Link>
      ))}
    </div>
  );
};

export default QuickLinksNew;
