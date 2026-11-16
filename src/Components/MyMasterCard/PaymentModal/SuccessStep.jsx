import styles from "../styles/onboard.module.scss";
// import "./files/modal.reset.css""
import { Help, Svg, Trans } from "../files";
import useWindowWidth from "../../../utils/useWindowWidth";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import success from "../../PaymentsNewer/InternationalFlow/files/success.gif";

export const paymentConfirmOptions = [
  {
    text: "Need help?",
    icon: Help,
    link: true,
    navigate: `mailto:support@insta-pay.ch`,
  },
  {
    text: "Transation Details",
    icon: Trans,
    navigate: "/my-mastercard?showT=true",
  },
];

const SuccessStep = ({
  feeDetails,
  walletState,
  setStep,
  paymentType,
  setStepParent,
  setIsOpen,
  addFunds,
  cardDets,
}) => {
  const width = useWindowWidth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  return (
    <div className={styles.step4}>
      <div style={{ gap: "12px" }} className={styles.infoDiv}>
        <div className={styles.paymentInfo}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              width: "100%",
              alignItems: "center",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
              <p>{t("You Have Paid")}</p>
              <h1>
                {!addFunds ? feeDetails.currency : feeDetails?.feeDetails?.currency}
                {!addFunds ? feeDetails.fee : feeDetails?.feeDetails?.totalAmount}
              </h1>
            </div>

            <img src={success} style={{ width: "100px" }} alt="" />
          </div>

          <img src={Svg} style={{ position: "absolute", right: "10px", top: "0px" }} alt="" />
        </div>

        <div
          style={{
            padding: width < 1000 && "0px",
            background: width < 1000 && "white",
          }}
          className={styles.transactionInfo}
        >
          <div>
            <div>
              <p>{t("You used")}</p>

              {paymentType === "wallet" && (
                <div>
                  <span>
                    {walletState?.name} {t("Wallet")}
                  </span>
                  <p>{walletState?.wallet_id}</p>
                </div>
              )}

              <button>{t("Change")}</button>
            </div>
          </div>

          {!addFunds && (
            <div className={styles.feeInfo}>
              <h3>{t("Card activation fee")}</h3>
              <h3>
                {feeDetails.currency}
                {feeDetails.fee}
              </h3>
            </div>
          )}

          {addFunds && (
            <>
              <div className={styles.feeInfo}>
                <h3>{t("Amount")}</h3>
                <h3>
                  {cardDets?.currency}
                  {feeDetails?.feeDetails?.amount}
                </h3>
              </div>
              <div className={styles.feeInfo}>
                <h3>{t("Fees")}</h3>
                <h3>
                  {cardDets?.currency}
                  {feeDetails?.feeDetails?.fee}
                </h3>
              </div>
              <div className={styles.feeInfo}>
                <h3>{t("Total Funds to be Added:")}</h3>
                <h3>
                  {cardDets?.currency}
                  {feeDetails?.feeDetails?.amountToTopup}
                </h3>
              </div>
              <div className={styles.feeInfo}>
                <h3>{t("Total Amount")}</h3>
                <h3>
                  {feeDetails?.feeDetails?.currency} {feeDetails?.feeDetails?.totalAmount}
                </h3>
              </div>
              <div className={styles.feeInfo}>
                <h3>{t("Exchange Rate")}</h3>
                <h3>
                  {feeDetails?.feeDetails?.currency}{" "}
                  {Number(feeDetails?.feeDetails?.exchangeRate?.replace(/[,]/g, ""))?.toFixed(2)}
                </h3>
              </div>
            </>
          )}
        </div>

        <div
          style={{
            flexDirection: width < 660 && "column",
            width: (width < 660 || !setStepParent) && "100%",
            display: !setStepParent && "grid",
            gridTemplateColumns: !setStepParent && width > 700 ? "1fr 1fr" : "1fr",
          }}
          className={styles.completeOptions}
        >
          {paymentConfirmOptions.map((option) => (
            <div
              onClick={() => !option.link && navigate(option.navigate)}
              style={{ width: width < 660 && "100%" }}
              key={option.text}
            >
              <img src={option.icon} alt="" />
              <p>
                {option.link ? (
                  <a style={{ color: "black" }} href={option.navigate}>
                    {t(option.text)}
                  </a>
                ) : (
                  t(option.text)
                )}
              </p>
            </div>
          ))}
        </div>
      </div>

      {width > 1000 && setStepParent && (
        <div className={styles.btns}>
          <button
            style={{ color: "white", backgroundColor: "#5926F0" }}
            onClick={() => {
              setStepParent(4);
              setIsOpen(false);
            }}
          >
            {t("Close")}
          </button>
        </div>
      )}
    </div>
  );
};

export default SuccessStep;
