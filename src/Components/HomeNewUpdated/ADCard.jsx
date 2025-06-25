import styles from "./styles/Card.module.scss"
import logo_white from "../../assets/images/logo/logo_white.png"
import { Check, Copy } from "react-feather"
import { Progress } from "reactstrap"
import { useContext, useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import card_bg from "./files/card_bg.svg"
import card_bg_green from "./files/card_bg_green.svg"
import { UserContext } from "../../Context/UserContext"
import axios from "axios"
import React from "react"
import { decryptData } from "../../Helper/EssentilaMethods/Decryption"
import r_styles from "./styles/Reserved.module.css"
import { getLimits } from "../WalletsNew"
import { removeCommasAndCurrency } from "../WalletsNew/AccountLimits"

const ADCard = ({ data, isActive }) => {
    const [copied, setCopied] = useState(false);
    const { t } = useTranslation()
    const [isLoading, setIsLoading] = useState(false)
    const { userWallets, authHeader, userDetails } = useContext(UserContext)

    const copyToClipboard = () => {
        navigator.clipboard.writeText(`${data?.wallet_id?.toUpperCase()}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // const [totalBalance, setTotalBalance] = useState(0)
    // const [total, setTotal] = useState(0)

    const [walletData, setWalletData] = useState({})

    useEffect(() => {
        if (data?._id) {
            getLimits(data, setWalletData, authHeader, () => { }, () => { })
        }
    }, [data])

    // const getExchangedAmounts = async (from, to, amount) => {
    //     setIsLoading(true);
    //     try {
    //         const res = await axios.get(`${process.env.REACT_APP_IP_DEV_API}/api/wallet/get-plain-exchange-rate?from=${from}&to=${to}&amount=${amount}`, {
    //             headers: authHeader
    //         });
    //         const dec = decryptData(res?.data?.data);
    //         return dec?.exchangeRate?.exchanged_amount ?? 0;
    //     } catch (error) {
    //         return 0; // return 0 in case of error
    //     } finally {
    //         setIsLoading(false);
    //     }
    // };

    // useEffect(() => {
    //     if (userWallets?.length > 0) {
    //         const calculateTotal = async () => {
    //             const wallets = userWallets.filter(item => item?.wallet_type === "insta")
    //             const promises = wallets.map(item => getExchangedAmounts(item?.currency?.code, data?.currency?.code, item?.balance?.available));
    //             const balances = await Promise.all(promises);
    //             const total = balances.reduce((acc, balance) => acc + balance, 0);
    //             setTotalBalance(total ?? 0);
    //         };

    //         calculateTotal();
    //     }
    // }, [userWallets]);

    // useEffect(() => {
    //     if (userDetails?.level && data?.wallet_type === "insta") {
    //         getExchangedAmounts("USD", data?.currency?.code, userDetails?.level?.account_balance_limit)
    //             .then(res => {
    //                 setTotal(res)
    //             })
    //     }
    // }, [data])
    return (
        <div className={styles.card}>
            {
                data?.balance?.reserved
                    ?
                    <>
                        <div style={{ padding: '0px', background: "none" }} className={`${r_styles.flex} ${r_styles.r_total}`}>
                            <span style={{ fontSize: '10px', fontWeight: 600 }}>{t("Total Balance")}:</span>
                            <h5>{data.currency?.code} {Number(data.balance.available + data.balance.reserved)?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h5>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column" }}>
                            <div style={{ padding: "0px", background: "none", flex: 1, justifyContent: window.innerWidth < 500 && "flex-start", gap: "4px" }} className={`${r_styles.flex} ${r_styles.r_blocked}`}>
                                <span style={{ fontSize: '9px', fontWeight: 600 }}>{t("Available balance")}:</span>
                                <h5>{data.currency?.code} {Number(data.balance.available)?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h5>
                            </div>
                            <div style={{ padding: "0px", background: "none", flex: 1, justifyContent: window.innerWidth < 500 && "flex-start", gap: "4px" }} className={`${r_styles.flex} ${r_styles.r_blocked}`} >
                                <span style={{ fontSize: '9px', fontWeight: 600 }}>{t("Blocked balance")}:</span>
                                <h5>{data.currency?.code} {Number(data.balance.reserved)?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h5>
                            </div>
                        </div>
                        <div className={`${r_styles.flex} ${r_styles.r_wallet}`}>
                            <span>{t("Wallet ID")}:</span>
                            <h5 style={{fontSize: '10px'}}>
                                {data?.wallet_id}
                                {
                                    copied
                                        ?
                                        <Check size={12} />
                                        :
                                        <div onClick={copyToClipboard} style={{ cursor: "pointer" }}>
                                            <Copy size={12} />
                                        </div>
                                }
                            </h5>
                        </div>
                        <div className={`${r_styles.flex} ${r_styles.r_bal}`} style={{ marginTop: ".5rem" }}>
                            <span>{t("Monthly limit")}:</span>
                            <h5>{walletData?.balance_limits?.total} / {walletData?.balance_limits?.remaining}</h5>
                        </div>
                        <div className={r_styles.bb}>
                            <Progress
                                value={(removeCommasAndCurrency(walletData?.balance_limits?.used) / removeCommasAndCurrency(walletData?.balance_limits?.total)) * 100}
                                barStyle={{
                                    background: "linear-gradient(to right, rgba(256,256,256,.6), rgba(256,256,256,.9))",
                                    borderRadius: "50px",
                                    margin: "2px"
                                }}
                                style={{
                                    height: window.innerWidth > 1500 ? "12px" : "9px",
                                    background: "rgba(256,256,256,.3)",
                                }}
                            />
                            <span style={{ right: "5px" }}>{walletData?.balance_limits?.remaining}</span>
                        </div>
                    </>
                    :
                    <>
                        <div className={styles.top}>
                            <div className={styles.left}>
                                <span>{t("Balance")}</span>
                                <h3>{data.currency?.code} {data.balance.available.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
                            </div>
                            <div className={styles.right}>
                                <img src={logo_white} alt="" />
                            </div>
                        </div>
                        <div className={styles.wallet_details}>
                            <span>{t("Wallet ID")}: </span>
                            <div className={styles.wd_sub}>
                                <span >
                                    {`${data?.wallet_type?.toUpperCase()}-${data?.wallet_id?.toUpperCase()}`}
                                </span>
                                {
                                    copied
                                        ?
                                        <Check style={{ marginLeft: ".5rem" }} size={12} />
                                        :
                                        <div onClick={copyToClipboard} style={{ cursor: "pointer" }}>
                                            <Copy style={{ marginLeft: ".5rem" }} size={12} />
                                        </div>
                                }
                            </div>
                        </div>
                        <div className={styles.bottom}>
                            <p>{t("Monthly limit")}</p>
                            <h3>{walletData?.balance_limits?.total} / {walletData?.balance_limits?.remaining}</h3>
                            <div className={styles.bb}>
                                <Progress
                                    value={(removeCommasAndCurrency(walletData?.balance_limits?.used) / removeCommasAndCurrency(walletData?.balance_limits?.total)) * 100}
                                    barStyle={{
                                        background: "linear-gradient(to right, rgba(256,256,256,.6), rgba(256,256,256,.9))",
                                        borderRadius: "50px",
                                        margin: "2px"
                                    }}
                                    style={{
                                        height: window.innerWidth > 1500 ? "12px" : "9px",
                                        background: "rgba(256,256,256,.3)",
                                    }}
                                />
                                <span style={{ right: "5px" }}>{walletData?.balance_limits?.remaining}</span>
                            </div>
                        </div>
                    </>
            }
            {
                isActive
                    ?
                    <img alt="" src={card_bg} style={{
                        position: "absolute",
                        height: "100%",
                        width: "100%",
                        left: 0,
                        top: 0,
                        objectFit: "cover",
                        zIndex: -1
                    }} />
                    :
                    <img alt="" src={card_bg_green} style={{
                        position: "absolute",
                        height: "100%",
                        width: "100%",
                        left: 0,
                        top: 0,
                        objectFit: "cover",
                        zIndex: -1
                    }} />
            }
        </div>
    )
}

export default React.memo(ADCard);