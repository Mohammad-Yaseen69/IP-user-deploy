import styles from "../styles/onboard.module.scss";
import { Svg } from "../files";
import er_icon from "../../PaymentsNewer/InternationalFlow/files/exchange_rate.svg";
import { useTranslation } from "react-i18next";

export const paymentInfoJSX = (feeDetails, addFunds, title, t) => (
  <div className={styles.paymentInfo}>
    <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
      <p>{title || t("You Have to Pay")}</p>
      <h1
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "2px",
        }}
      >
        {!addFunds
          ? (feeDetails?.totalFee ?? feeDetails?.fee)
          : (feeDetails?.feeDetails?.totalAmount ?? feeDetails?.feeDetails?.amount)}{" "}
        {!addFunds ? feeDetails.currency : feeDetails?.feeDetails?.currency}
      </h1>
    </div>
    <img src={Svg} style={{ position: "absolute", right: "10px", top: "0px" }} alt="" />
  </div>
);

const ConfirmationStep = ({
  feeDetails,
  walletState,
  setStep,
  sendOtp,
  addFunds,
  cardDets,
  paymentType,
  hideButtons,
  feeLabel,
}) => {
  const { t } = useTranslation();
  const exchangeRate = Number(String(feeDetails?.exchangeRate ?? "").replace(/,/g, ""));
  const showExchangeRate =
    !addFunds &&
    feeDetails?.baseCurrency &&
    feeDetails?.currency &&
    feeDetails.baseCurrency !== feeDetails.currency &&
    Number.isFinite(exchangeRate) &&
    exchangeRate > 0;

  return (
    <div className={styles.step3}>
      <div className={styles.infoDiv}>
        <div className={styles.heads}>
          {/* <h4>{t('Review your payment details')}</h4> */}
          <p>
            {t(
              "Please take a few moments to carefully review and verify the information to your payment details.",
            )}
          </p>
        </div>

        {paymentInfoJSX(feeDetails, addFunds, undefined, t)}

        <div
          style={{
            padding: window.innerWidth < 1000 && "0px",
            background: window.innerWidth < 1000 && "white",
          }}
          className={styles.transactionInfo}
        >
          <div>
            <div>
              <p>{t("You are using")}</p>
              <div style={{ gap: "0" }}>
                <span>
                  {walletState?.name}{" "}
                  {paymentType === "card"
                    ? t("Payment Card")
                    : paymentType === "paypal"
                      ? t("Paypal")
                      : t("Wallet")}
                </span>
                <p>{walletState?.wallet_id}</p>
              </div>
            </div>
            {addFunds && feeDetails?.feeDetails?.exchangeRate && (
              <div style={{ justifyContent: "center" }}>
                <div style={{ flexDirection: "row" }} className={styles.er_details}>
                  <img src={er_icon} alt="" />
                  <span>
                    1.00 {cardDets?.currency} ={" "}
                    {Number(feeDetails?.feeDetails?.exchangeRate?.replace(/[,]/g, ""))?.toFixed(2)}{" "}
                    {feeDetails?.feeDetails?.currency}{" "}
                  </span>
                </div>
              </div>
            )}
            {showExchangeRate && (
              <div style={{ justifyContent: "center" }}>
                <div style={{ flexDirection: "row" }} className={styles.er_details}>
                  <img src={er_icon} alt="" />
                  <span>
                    1.00 {feeDetails.baseCurrency} = {exchangeRate.toFixed(2)} {feeDetails.currency}
                  </span>
                </div>
              </div>
            )}
            {addFunds && (
              <div>
                <h3 style={{ marginBottom: "0", fontSize: "18px" }}>
                  {feeDetails?.feeDetails?.amount}
                  {cardDets?.currency}
                </h3>
                <h3 style={{ marginBottom: "0", fontSize: "18px" }}>
                  {feeDetails?.feeDetails?.totalAmount ?? feeDetails?.feeDetails?.amount}
                  {feeDetails?.feeDetails?.currency}{" "}
                </h3>
              </div>
            )}
          </div>

          {!addFunds && (
            <div className={styles.feeInfo}>
              <h3>{t(feeLabel || "Card activation fee")}</h3>
              <h3>
                {feeDetails.fee} {feeDetails.currency}
              </h3>
            </div>
          )}

          {addFunds && (
            <>
              <div className={styles.feeInfo}>
                <h3>{t("Fee")}:</h3>
                <h3>
                  {feeDetails?.feeDetails?.fee}
                  {cardDets?.currency}
                </h3>
              </div>
              <div className={styles.feeInfo}>
                <h3>{t("Total Funds to be Added:")}</h3>
                <h3>
                  {feeDetails?.feeDetails?.amountToTopup}
                  {cardDets?.currency}
                </h3>
              </div>
              <div className={styles.feeInfo}>
                <h3>{t("Total Amount:")}</h3>
                <h3>
                  {" "}
                  {feeDetails?.feeDetails?.totalAmount ?? feeDetails?.feeDetails?.amount}
                  {feeDetails?.feeDetails?.currency}
                </h3>
              </div>
            </>
          )}
        </div>
      </div>

      {window.innerWidth > 1000 && !addFunds && !hideButtons && (
        <div className={styles.btns}>
          <button onClick={() => setStep(2)}>{t("Back")}</button>
          <button style={{ color: "white", backgroundColor: "#5926F0" }} onClick={sendOtp}>
            {t("Proceed to Payment")}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="15"
              viewBox="0 0 14 15"
              fill="none"
            >
              <path
                d="M5.25 11L8.75 7.5L5.25 4"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default ConfirmationStep;
