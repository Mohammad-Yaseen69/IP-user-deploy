import { Info } from 'react-feather';
import stepFiveStyles from "../../PaymentsNewer/InternationalFlow/styles/stepfive.module.css";
import er_icon from "../../PaymentsNewer/InternationalFlow/files/exchange_rate.svg";

const BankTransferReview = ({
    data,
    type,
    userDetails,
    recipientData,
    PlaidCurrencies,
    t
}) => {
    return (
        <div style={{gap: "1rem"}} className={stepFiveStyles.container}>
            <h4>{type === "add_funds" ? userDetails?.name : (data.beneficiary?.first_name ? `${data.beneficiary?.first_name} ${data?.beneficiary?.last_name}` : t("Review Your Transfer"))}</h4>

            <div className={stepFiveStyles.receiver_amount}>
                <h5>{Number(data.exchange_rate?.receiver?.amount || 0)?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h5>
                <h5>{data.exchange_rate?.receiver?.currency || data.exchange_rate?.sending?.currency || data.wallet?.currency?.code}</h5>
            </div>

            <div className={stepFiveStyles.exchange_rate_details}>
                {data.exchange_rate?.plaid_fx && !PlaidCurrencies.includes(data.exchange_rate?.sending?.currency) && (
                    <div className={stepFiveStyles.wallet_conversion}>
                        <div className={stepFiveStyles.left}>
                            <span>{t("Sending Amount")}</span>
                            <h5>
                                {Number(data?.exchange_rate?.total || 0)?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{" "}
                                {data?.exchange_rate?.sending?.currency || data.wallet?.currency?.code}
                            </h5>
                        </div>
                        <div className={stepFiveStyles.er_details}>
                            <img src={er_icon} alt="" />
                            <span>1.00 {data?.exchange_rate?.sending?.currency || data.wallet?.currency?.code} = {Number(data.exchange_rate?.plaid_fx)} {data?.exchange_rate?.plaid_currency}</span>
                        </div>
                        <div className={stepFiveStyles.right}>
                            <div className={stepFiveStyles.wc_pt}>
                                <span>{t("IBAN")}</span>
                                <span style={{ textAlign: "right", color: '#000' }}>{recipientData.iban}</span>
                            </div>
                            <h5>{Number(data.exchange_rate?.plaid_amount || 0)?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {data?.exchange_rate?.plaid_currency} </h5>
                        </div>
                    </div>
                )}

                <div className={stepFiveStyles.amount_and_others}>
                    {!(data.exchange_rate?.plaid_fx && !PlaidCurrencies.includes(data.exchange_rate?.sending?.currency)) && (
                        <div className={stepFiveStyles.aao_item}>
                            <span>{t("IBAN")}</span>
                            <span style={{ color: "#000" }}>{recipientData.iban}</span>
                        </div>
                    )}

                    {type !== "payment_address" && (
                        <div className={stepFiveStyles.aao_item}>
                            <span>{t("Save for future use")}</span>
                            <span style={{ color: "#000" }}>{recipientData.saveForFutureUse ? t("Yes") : t("No")}</span>
                        </div>
                    )}

                    {!(data.exchange_rate?.plaid_fx && !PlaidCurrencies.includes(data.exchange_rate?.sending?.currency)) && (
                        <div className={stepFiveStyles.aao_item}>
                            <span>{t("Sending Amount")}</span>
                            <span style={{ color: "#000" }}>
                                {Number(data.amount || data.exchange_rate?.sending?.amount || 0)?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{" "}
                                {data?.exchange_rate?.sending?.currency || data.wallet?.currency?.code}
                            </span>
                        </div>
                    )}

                    {data.exchange_rate?.fee?.amount > 0 && (
                        <div className={stepFiveStyles.aao_item}>
                            <span>{type === "payment_address" ? t("Sending Fees") : t("Transfer Fees")}</span>
                            <span style={{ color: "#000" }}>
                                {Number(data.exchange_rate?.fee?.amount)?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{" "}
                                {data.exchange_rate?.fee?.currency || data.exchange_rate?.sending?.currency}
                            </span>
                        </div>
                    )}

                    {type === "payment_address" && data.exchange_rate?.fee?.paymentAddressFee > 0 && (
                        <div className={stepFiveStyles.aao_item}>
                            <span>{t("Payment Address Fee")}</span>
                            <span style={{ color: "#000" }}>
                                {Number(data.exchange_rate?.fee?.paymentAddressFee)?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{" "}
                                {data.exchange_rate?.sending?.currency}
                            </span>
                        </div>
                    )}

                    {data.exchange_rate?.plaid_fx && !PlaidCurrencies.includes(data.exchange_rate?.sending?.currency) && (
                        <div className={stepFiveStyles.aao_item}>
                            <span>{t("Exchange Rate")}</span>
                            <span style={{ color: "#000" }}>1.00 {data?.exchange_rate?.sending?.currency || data.wallet?.currency?.code} = {Number(data.exchange_rate?.plaid_fx)} {data?.exchange_rate?.plaid_currency}</span>
                        </div>
                    )}

                    <div className={stepFiveStyles.aao_item}>
                        <span>{t("Estimated Time")}</span>
                        <span style={{ color: "#000" }}>{t("within minutes")}</span>
                    </div>
                </div>

                <div className={stepFiveStyles.total}>
                    <span>{t("Total to Pay")}</span>
                    <span>
                        {Number(data?.exchange_rate?.total || 0)?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{" "}
                        {data.exchange_rate?.sending?.currency || data.wallet?.currency?.code}
                    </span>
                </div>
            </div>

            {type !== "add_funds" && data.exchange_rate?.plaid_fx && !PlaidCurrencies.includes(data.exchange_rate?.sending?.currency) && (
                <div className={stepFiveStyles.info}>
                    <Info size={16} color="#FFAA29" />
                    <span>
                        {t("plaid_currency_not_supported", {
                            currency: data?.exchange_rate?.sending?.currency || data.wallet?.currency?.code,
                            defaultCurrency: data?.exchange_rate?.plaid_currency,
                        })}
                    </span>
                </div>
            )}
        </div>
    );
};

export default BankTransferReview;