import { useTranslation } from "react-i18next";
import { PaymentReviewSVG } from "./Svgs";
import styles from "./styles/index.module.css";


const PaymentDetails = ({ data, dataHandler, isBankDeposit }) => {
    const { t } = useTranslation();
    return (
        <div style={{ height: "100%" }}>
            <div className={styles.bot_top}>
                <h5>{t("Review your payment details")}</h5>
                <span>
                    {t(
                        "Please take a few moments to carefully review and verify the information to your payment details."
                    )}
                </span>
            </div>
            <div className={styles.recipient_amount_details}>
                <span>{t("You have to pay")}</span>
                <h5>
                    {Number(data.exchange_rate?.total)?.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                    })}{" "}
                    <span>{data.exchange_rate?.sending?.currency}</span>
                </h5>
                <div>
                    <PaymentReviewSVG />
                </div>
            </div>
            <div className={styles.other_details}>
                {data.payment_type?.value === "card" && (
                    <div className={styles.card_dets} style={{ padding: "1rem" }}>
                        <div className={styles.cd_top} style={{ alignItems: "flex-start" }}>
                            <span>{t("You are using")}</span>
                            <div className={styles.cd_bot}>
                                <h5>
                                    {t("Card ending")} {" "}
                                    {data.cardNumber?.slice(
                                        data?.cardNumber?.length - 5,
                                        data?.cardNumber?.length
                                    )}
                                </h5>
                                <span>{t("Exp date")}: {data.expiry}</span>
                            </div>
                            <button onClick={() => dataHandler("step", 3)}>
                                {t("Change")}
                            </button>
                        </div>
                    </div>
                )}
                <div className={styles.aao_item}>
                    <span>{t("Sending")}</span>
                    <span>
                        {Number(data.exchange_rate?.sending?.amount?.replace(",", ""))?.toLocaleString(
                            "en-US",
                            { minimumFractionDigits: 2, maximumFractionDigits: 2 }
                        )}{" "}
                        {data.exchange_rate?.sending?.currency}
                    </span>
                </div>
                <div className={styles.aao_item}>
                    <span>{t("Transfer Fees")}</span>
                    <span>
                        {Number(data.exchange_rate?.fee?.amount)?.toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                        })}{" "}
                        {data.exchange_rate?.sending?.currency}
                    </span>
                </div>
                {isBankDeposit &&
                    <div className={styles.aao_item}>
                        <span>{t("Exchange Rate")}</span>
                        <span>
                            1 {data.exchange_rate?.receiver?.currency} = {' '}
                            {Number(data.exchange_rate?.exchange_rate?.exchange_rate)?.toLocaleString("en-US", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            })}{" "}
                            {data.exchange_rate?.sending?.currency}
                        </span>
                    </div>
                }
                <div className={styles.aao_item}>
                    <span>{t("Estimated Time")}</span>
                    <span>{t("within minutes")}</span>
                </div>
                <div className={styles.aao_item}>
                    <span>
                        {t("Receiver Gets")} {t("(Including fee)")}
                    </span>
                    <span>
                        {Number(data.exchange_rate?.receiver?.amount)?.toLocaleString(
                            "en-US",
                            { minimumFractionDigits: 2, maximumFractionDigits: 2 }
                        )}{" "}
                        {isBankDeposit ? data.exchange_rate?.receiver?.currency : data.exchange_rate?.sending?.currency}
                    </span>
                </div>
                <div className={styles.total}>
                    <span>{t("Total")}</span>
                    <span>
                        {Number(data.exchange_rate?.total)?.toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                        })}{" "}
                        {data.exchange_rate?.sending?.currency}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default PaymentDetails