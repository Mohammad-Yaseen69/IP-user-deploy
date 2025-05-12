import { useTranslation } from "react-i18next"
import styles from "../InternationalFlow/styles/stepfive.module.css"
import axios from "axios";
import { decryptData } from "../../../Helper/EssentilaMethods/Decryption";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../../../Context/UserContext";
import er_icon from "../InternationalFlow/files/exchange_rate.svg"
import { Info } from "react-feather";
import { cleanString } from "../../../Helper/cleanString";

const StepFive = ({ data, sending_currency = "", showMid = true }) => {
    const { t } = useTranslation()
    const { authHeader } = useContext(UserContext)
    const [exchangedAmount, setExchangedAmount] = useState(0)


    console.log(data.exchange_rate?.sending?.amount)
    useEffect(() => {
        if (data.payment_type?.value === "wallet" && data?.wallet?._id && data.currency_wallet?._id !== data?.wallet?._id) {
            const getExchangedAmounts = async () => {
                try {
                    const res = await axios.get(`${process.env.REACT_APP_IP_DEV_API}/api/wallet/get-plain-exchange-rate?from=${data?.currency_wallet?.currency?.code}&to=${data.payment_type?.value !== "wallet" ? data.currency_wallet?.currency?.code : data.wallet?.currency?.code}&amount=${data.amount}`, {
                        headers: authHeader
                    });
                    const dec = decryptData(res?.data?.data);
                    console.log(dec)
                    setExchangedAmount(dec?.exchangeRate?.exchanged_amount ?? 0);
                } catch (error) {
                    return 0;
                }
            };

            getExchangedAmounts()
        }
    }, [data?.currency_wallet, data?.wallet])

    return (
        <div className={styles.container}>
            <h4>{data.beneficiary?.first_name ?? data.beneficiary?.firstName ?? data.beneficiary?.user?.first_name} {data?.beneficiary?.last_name ?? data.beneficiary?.lastName ?? data?.beneficiary?.user?.last_name}</h4>
            <div className={styles.receiver_amount}>
                <h5>{Number(cleanString(data.exchange_rate?.receiver?.amount))?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h5>
                <h5>{data.exchange_rate?.receiver?.currency}</h5>
            </div>
            <div className={styles.exchange_rate_details}>
                {
                    (data.wallet?.currency?.code !== data?.currency_wallet?.currency?.code && data.payment_type?.value === "wallet")
                    &&
                    <div className={styles.wallet_conversion}>
                        <div className={styles.left}>
                            <span>{t("Sending")}</span>
                            <h5>{data.amount} {sending_currency || data.currency_wallet?.currency?.code} </h5>
                        </div>
                        {
                            showMid
                            &&
                            <div className={styles.er_details}>
                                <img src={er_icon} alt="" />
                                <span>1.00 {data?.currency_wallet?.currency?.code}  = {Number(exchangedAmount / data.amount?.replace(/,/g,""))?.toLocaleString("en-US", { minimumFractionDigits: 3, maximumFractionDigits: 4 })} {data.payment_type?.value === "card" ? data.currency_wallet?.currency?.code : data.wallet?.currency?.code} </span>
                            </div>
                        }
                        <div className={styles.right}>
                            <div className={styles.wc_pt}>
                                <div>
                                    <img src={data.payment_type?.icon} alt="" />
                                    <span style={{ whiteSpace: "nowrap" }}>{data.payment_type?.name}</span>
                                </div>
                                <span style={{ textAlign: "right" }}>{data?.wallet?.wallet_id}</span>
                            </div>
                            {/* <h5>{exchangedAmount?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {data.payment_type?.value === "card" ? data.currency_wallet?.currency?.code : data.wallet?.currency?.code} </h5> */}
                            <h5>{data.exchange_rate?.sending?.amount?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {data.payment_type?.value === "card" ? data.currency_wallet?.currency?.code : data.wallet?.currency?.code} </h5>
                        </div>
                    </div>
                }

                <div className={styles.amount_and_others}>
                    {
                        data.wallet?.currency?.code !== data?.currency_wallet?.currency?.code
                        &&
                        <div className={styles.aao_item}>
                            <span>{t("Sending")}</span>
                            <span>{Number(data.exchange_rate?.sending?.amount)?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {data.exchange_rate?.sending?.currency}</span>
                        </div>
                    }
                    {
                        data.exchange_rate?.sending?.currency !== data?.exchange_rate?.receiver?.currency
                        &&
                        <div className={styles.aao_item}>
                            <span>{t("Exchange Rate")}</span>
                            <span>1.00 {data.exchange_rate?.sending?.currency} = {String(data.exchange_rate?.exchange_rate)?.slice(0, 6)} {data.exchange_rate?.receiver?.currency}</span>
                        </div>
                    }
                    <div className={styles.aao_item}>
                        <span>{t("Transfer Fees")}</span>
                        <span>{data.exchange_rate?.fee?.amount?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {data.exchange_rate?.sending?.currency}</span>
                    </div>
                    {
                        data?.payment_duration?.value === "instant"
                            ?
                            <div className={styles.aao_item}>
                                <span>{t("Estimated Time")}</span>
                                <span>{t("within minutes")}</span>
                            </div>
                            :
                            data?.payment_duration?.value === "schedule"
                                ?
                                <>
                                    {
                                        data?.payment_duration?.scheduleDate
                                        &&
                                        <div className={styles.aao_item}>
                                            <span>{t("Scheduled Date")}</span>
                                            <span>{new Date(data?.payment_duration?.scheduleDate)?.toLocaleDateString()}</span>
                                        </div>
                                    }
                                    {
                                        data?.payment_duration?.scheduleTime
                                        &&
                                        <div className={styles.aao_item}>
                                            <span>{t("Scheduled Time")}</span>
                                            <span>{data?.payment_duration?.scheduleTime}</span>
                                        </div>
                                    }
                                </>
                                :
                                data?.payment_duration?.value === "subscription"
                                    ?
                                    <>
                                        {
                                            data?.payment_duration?.recStartDate
                                            &&
                                            <div className={styles.aao_item}>
                                                <span>{t("Starts From")}</span>
                                                <span>{new Date(data?.payment_duration?.recStartDate)?.toLocaleDateString()}</span>
                                            </div>
                                        }
                                        {
                                            data?.payment_duration?.cycles
                                            &&
                                            <div className={styles.aao_item}>
                                                <span>{t("Cycles")}</span>
                                                <span>{data?.payment_duration?.cycles}</span>
                                            </div>
                                        }
                                    </>
                                    :
                                    ""
                    }
                </div>

                <div className={styles.total}>
                    <span>{t("Total")}</span>
                    <span>{data.exchange_rate?.total?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {data.wallet?.currency?.code !== data?.currency_wallet?.currency?.code ? data.wallet?.currency?.code ?? data?.currency_wallet?.currency?.code : data.currency?.currency?.code} </span>
                </div>
                {
                    (data?.payment_duration?.value === "schedule" || data?.payment_duration?.value === "subscription") && data.exchange_rate?.sending?.currency !== data?.exchange_rate?.receiver?.currency
                        ?
                        <div className={styles.info}>
                            <Info color="#FFAA29" />
                            <span>{t("The recipient may receive a slightly adjusted amount based on the exchange rate at the time of the transaction.")}</span>
                        </div>
                        :
                        ""
                }
            </div>
        </div >
    )
}

export default StepFive