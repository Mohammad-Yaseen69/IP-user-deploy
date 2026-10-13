import { Card, CardBody } from "reactstrap";
import w from "./files/where.png";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { takeScreenshot } from "../../Helper/takeScreenshot";

import download from "../Profile/files/download.svg";
import { useState } from "react";

const WalletReceipt = ({
  walletDetails,
  transactionDetails,
  amount,
  currency,
  setShowStatus,
  setIsWallet,
  type = "instant",
}) => {
  const { t } = useTranslation();
  const [downloading, setDownloading] = useState(false);
  return (
    <Card
      className=""
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
          justifyContent: "space-between",
          borderRadius: "20px",
          background: "rgba(0,0,0,.03)",
          paddingBottom: 0,
          padding: 0,
          boxShadow:
            "0px 18px 15.348464965820312px -15px rgba(89, 38, 240, 0.16)",
        }}
        className="conf_cont"
      >
        <div
          style={{ display: "flex", flexDirection: "column", padding: "14px" }}
          className="conf_cont transaction-receipt"
        >
          <div style={{ textAlign: "center" }}>
            <span style={{ color: "#8a8a8a", fontSize: "1.1rem" }}>
              {t("You are transferring")}
            </span>
            <h4 style={{ fontSize: "2rem" }}>
              {amount.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{" "}
              {currency}
            </h4>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: ".5rem" }}>
            {type === "instant" && (
              <>
                <div
                  style={{
                    background: "rgba(89,38,240,0.06)",
                    padding: "16px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: ".5rem",
                    borderRadius: "50px",
                    flex: 1,
                    color: "#8a8a8a",
                    fontSize: ".8rem",
                  }}
                >
                  {t("Total")}:
                  <span style={{ fontWeight: 600, fontSize: ".9rem" }}>
                    {transactionDetails?.total.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{" "}
                    {currency}
                  </span>
                </div>
                <div
                  style={{
                    background: "rgba(89,38,240,0.06)",
                    padding: "16px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: ".5rem",
                    borderRadius: "50px",
                    flex: 1,
                    color: "#8a8a8a",
                    fontSize: ".8rem",
                  }}
                >
                  {t("Fees")}:
                  <span style={{ fontWeight: 600, fontSize: ".9rem" }}>
                    {transactionDetails?.fee.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{" "}
                    {currency}
                  </span>
                </div>
              </>
            )}

            {type === "subscription" && (
              <>
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
                    fontSize: ".8rem",
                  }}
                >
                  {t("Cycles")}:
                  <span style={{ fontWeight: 600, fontSize: ".9rem" }}>
                    {transactionDetails?.cycles}
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
                    fontSize: ".8rem",
                  }}
                >
                  {t("Starts From")}:
                  <span style={{ fontWeight: 600, fontSize: ".9rem" }}>
                    {transactionDetails?.date}
                  </span>
                </div>
              </>
            )}
          </div>
          {/* recipient */}
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
            <span style={{ minWidth: "30px", color: "#8a8a8a" }}>
              {t("To")}:
            </span>
            <div
              style={{ display: "flex", alignItems: "center", gap: ".6rem" }}
            >
              <span style={{ fontWeight: 600, fontSize: ".9rem" }}>
                {`${walletDetails?.first_name || walletDetails?.company_name} ${walletDetails?.last_name}`}
                {t("(INSTA-")}
                {walletDetails.wallet_id})
              </span>
            </div>
          </div>
        </div>
        {/* bottom */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: ".5rem",
            justifyContent: "center",
            padding: "14px",
          }}
        >
          <Link
            to={`/transactions?current-index=1`}
            style={{
              display: "flex",
              alignItems: "center",
              background: "#fff",
              borderRadius: "50px",
              padding: "10px",
              gap: ".3rem",
              cursor: "pointer",
            }}
          >
            <img
              src={w}
              alt="w"
              style={{ height: "25px", width: "25px", objectFit: "contain" }}
            />
            <span style={{ fontWeight: "600", color: "black" }}>
              {t("Where Is My Payment?")}
            </span>
          </Link>
          {downloading ? (
            <div className="d-flex justify-content-center">
              <div className="spinner-border" color="primary" role="status">
                <span className="sr-only">{t("Loading...")}</span>
              </div>
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                background: "#fff",
                borderRadius: "50px",
                padding: "10px",
                gap: ".3rem",
                cursor: "pointer",
              }}
              onClick={() => {
                takeScreenshot("transaction-receipt", setDownloading);
              }}
            >
              <img
                src={download}
                alt="s"
                style={{ height: "20px", width: "20px", objectFit: "contain" }}
              />
              <span style={{ fontWeight: "600" }}>{t("Download")}</span>
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
};

export default WalletReceipt;
