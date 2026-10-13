import { ChevronRight, Info } from "react-feather";
import styles from "./styles/stepfive.module.css";
import { useTranslation } from "react-i18next";
import logo from "../../../assets/images/logo/logo_white.png";
import airtime from "./files/airtime.svg";
import { useContext, useEffect } from "react";
import { encryptData } from "../../../Helper/EssentilaMethods/Encryption";
import axios from "axios";
import { decryptData } from "../../../Helper/EssentilaMethods/Decryption";
import InstaPayLoader from "../../Loader";
import { UserContext } from "../../../Context/UserContext";
import { useNavigate } from "react-router";
import air_dude from "./files/air_dude.png";

const StepFive = ({ data, dataHandler, createTransaction }) => {
  const { t } = useTranslation();
  const { authHeader } = useContext(UserContext);
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {window.innerWidth > 1000 ? (
          <div className={styles.banner}>
            <img src={airtime} />
            <span>{t("Mobile Airtime")}</span>
          </div>
        ) : (
          <div className={styles.banner}>
            <div className={styles.b_left}>
              <span>{t("Send Top-up").toUpperCase()}</span>
              <div>
                <img src={airtime} alt="" />
                <span>{t("Mobile Airtime")}</span>
              </div>
            </div>
            <img src={air_dude} alt="" />
          </div>
        )}
        <div className={styles.bottom}>
          <div className={styles.left}>
            <div className={styles.rec_top}>
              <img src={logo} alt="" />
            </div>
            <div className={styles.badge}>{t("TOP-UP SUMMARY")}</div>
            <div className={styles.recipient}>
              <span>{t("Recipient Mobile Number")}</span>
              <h4>+{data.recipient}</h4>
            </div>
            <div className={styles.amount}>
              <span>{t("Amount")}</span>
              <h4>
                {Number(
                  data.package_details?.data?.sending?.value,
                )?.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{" "}
                {data.package_details?.data?.sending?.currency}
              </h4>
            </div>
            <div className={styles.more_details}>
              <div>
                <span>{t("Service")}</span>
                <strong>{t(data.service_type?.name)}</strong>
              </div>
              <div>
                <span>{t("Destination")}</span>
                <strong>{t(data.country?.name)}</strong>
              </div>
              <div>
                <span>{t("Provider")}</span>
                <strong>{t(data.providers?.[0]?.name)}</strong>
              </div>
            </div>
          </div>
          <div className={styles.right}>
            {data.package?.message && (
              <div className={styles.voucher_dets}>
                <h3>{t("Voucher Information")}</h3>
                <div className={styles.vd_guide}>
                  <span>{t("Usage info:")}</span>
                  <p>{data.package?.message}</p>
                </div>
              </div>
            )}

            {data.loading ? (
              <div
                style={{ height: "200px", width: "200px", margin: "1rem auto" }}
              >
                <InstaPayLoader />
              </div>
            ) : (
              <div className={styles.transaction_details}>
                <div>
                  <span>{t("Sending")}</span>
                  <span>
                    {Number(
                      data.package_details?.data?.sending?.value,
                    )?.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{" "}
                    {data.package_details?.data?.sending?.currency}
                  </span>
                </div>
                <div>
                  <span>{t("Transfer Fees")}</span>
                  <span>
                    {Number(
                      data.package_details?.data?.fee?.value,
                    )?.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{" "}
                    {data.package_details?.data?.fee?.currency}
                  </span>
                </div>
                <div>
                  <span>{t("Estimated Time")}</span>
                  <span>{t("Within minutes")}</span>
                </div>
                <div className={styles.total}>
                  <span>{t("Total to pay")}</span>
                  <span>
                    {Number(
                      data.package_details?.data?.total?.value,
                    )?.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{" "}
                    {data.package_details?.data?.total?.currency}
                  </span>
                </div>
              </div>
            )}

            {data.payment_type?.value === "paypal" &&
            !data?.package_details?.data?.paypal?.paypal_currency_supported ? (
              <>
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: ".7rem",
                    padding: "12px",
                    borderRadius: "6px",
                    background: "rgba(255, 218, 68, 0.24)",
                    marginTop: "1rem",
                  }}
                >
                  <Info color="#BE9A08" size={20} />
                  <span
                    style={{
                      color: "#BE9A08",
                      fontFamily: "Manrope",
                      fontSize: ".7rem",
                      fontStyle: "normal",
                      fontWeight: 700,
                      lineHeight: 1.3,
                      letterSpacing: "-0.28px",
                    }}
                  >
                    <strong>
                      {data?.package_details?.data?.paypal?.fee?.currency}
                    </strong>
                    {t("is not supported by Paypal,")}
                    <strong>{t("USD")}</strong>
                    {t("will be used as the default currency.")}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: ".9rem",
                    padding: ".8rem",
                    background: "#fff",
                    borderRadius: "6px",
                    boxShadow: "0px 1.5px 10.8px 0px rgba(0, 0, 0, 0.11)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "1rem",
                      justifyContent: "space-between",
                    }}
                  >
                    <span
                      style={{
                        color: "#8A8A8A",
                        fontFamily: "Manrope",
                        fontSize: ".7rem",
                        fontStyle: "normal",
                        fontWeight: 600,
                        lineHeight: 1.5,
                        letterSpacing: "-0.14px",
                      }}
                    >
                      {t("Exchange Rate")}
                    </span>
                    <strong
                      style={{
                        color: "#000",
                        fontFamily: "Manrope",
                        fontSize: ".7rem",
                        fontStyle: "normal",
                        lineHeight: 1.5,
                        letterSpacing: "-0.14px",
                      }}
                    >
                      1.00 {data?.package_details?.data?.paypal?.fee?.currency}{" "}
                      ={" "}
                      {Number(
                        data?.package_details?.data?.paypal?.paypal_rate?.value,
                      )?.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 4,
                      })}
                      {t("USD")}
                    </strong>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "1rem",
                      justifyContent: "space-between",
                    }}
                  >
                    <span
                      style={{
                        color: "#8A8A8A",
                        fontFamily: "Manrope",
                        fontSize: ".7rem",
                        fontStyle: "normal",
                        fontWeight: 600,
                        lineHeight: 1.5,
                        letterSpacing: "-0.14px",
                      }}
                    >
                      {t("Amount in USD")}
                    </span>
                    <strong
                      style={{
                        color: "#000",
                        fontFamily: "Manrope",
                        fontSize: "1.2rem",
                        fontStyle: "normal",
                        fontWeight: 700,
                        lineHeight: 1.7,
                        letterSpacing: "-0.8px",
                      }}
                    >
                      {Number(
                        data?.package_details?.data?.paypal?.paypal_converted
                          ?.value,
                      )?.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                      {t("USD")}
                    </strong>
                  </div>
                </div>
              </>
            ) : (
              ""
            )}
          </div>
        </div>
      </div>
      <div className={styles.buttons}>
        <button
          disabled={data.loading}
          onClick={() => {
            if (data.verified) {
              navigate("/payments");
              dataHandler("step", 1);
            } else {
              dataHandler("step", 4);
            }
          }}
          className={styles.trs}
        >
          {t("Back")}
        </button>
        <button
          disabled={data.loading}
          onClick={() => (data.verified ? navigate("/") : createTransaction())}
        >
          {data.verified ? t("Dashboard") : t("Confirm")}
          <ChevronRight color="white" size={17} />
        </button>
      </div>
    </div>
  );
};

export default StepFive;
