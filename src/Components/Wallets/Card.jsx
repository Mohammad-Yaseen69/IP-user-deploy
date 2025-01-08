import { useTranslation } from "react-i18next"
import styles from "./styles/Left.module.scss"
import card_bg from "../HomeNewUpdated/files/card_bg.svg"
import logo_white from "../../assets/images/logo/logo_white.png"
import card_bg_green from "../HomeNewUpdated/files/card_bg_green.svg"
import { Check, Copy } from "react-feather"
import { Progress } from "reactstrap"
import { useContext, useEffect, useState } from "react"
import { UserContext } from "../../Context/UserContext"
import axios from "axios"
import { decryptData } from "../../Helper/EssentilaMethods/Decryption"

const Card = ({ wallet, current, index }) => {
    const [copied, setCopied] = useState(false);
    const { t } = useTranslation()
    const [isLoading, setIsLoading] = useState(false)
    const { userWallets, authHeader, userDetails } = useContext(UserContext)

    const copyToClipboard = () => {
        navigator.clipboard.writeText(`${wallet?.wallet_id?.toUpperCase()}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const [totalBalance, setTotalBalance] = useState(0)
    const [total, setTotal] = useState(0)

    const getExchangedAmounts = async (from, to, amount) => {
        setIsLoading(true);
        try {
            const res = await axios.get(`${process.env.REACT_APP_IP_DEV_API}/api/wallet/get-plain-exchange-rate?from=${from}&to=${to}&amount=${amount}`, {
                headers: authHeader
            });
            const dec = decryptData(res?.data?.data);
            return dec?.exchangeRate?.exchanged_amount ?? 0;
        } catch (error) {
            return 0; // return 0 in case of error
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (userWallets?.length > 0) {
            const calculateTotal = async () => {
                const promises = userWallets.filter(item => item?.wallet_type === "insta").map(item => getExchangedAmounts(item?.currency?.code, wallet?.currency?.code, item?.balance?.available));
                const balances = await Promise.all(promises);
                const total = balances.reduce((acc, balance) => acc + balance, 0);
                setTotalBalance(total ?? 0);
            };

            calculateTotal();
        }
    }, []);

    useEffect(() => {
        if (userDetails?.level && wallet?.wallet_type === "insta") {
            getExchangedAmounts("USD", wallet?.currency?.code, userDetails?.level?.account_balance_limit)
                .then(res => {
                    setTotal(res)
                })
        }
    }, [])
    return (
        <div className={styles.card}>
            <div className={styles.top}>
                <div className={styles.left}>
                    <span>{t("Balance")}</span>
                    <h3>{wallet?.currency?.code} {wallet?.balance?.available?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
                </div>
                <div className={styles.right}>
                    <img src={logo_white} alt="" />
                </div>
            </div>
            <div className={styles.wallet_details}>
                <span>{t("Wallet ID")}: </span>
                <div className={styles.wd_sub}>
                    {
                        copied
                            ?
                            <Check style={{ marginRight: ".5rem" }} size={12} />
                            :
                            <div onClick={copyToClipboard} style={{ cursor: "pointer" }}>
                                <Copy style={{ marginRight: ".5rem" }} size={12} />
                            </div>
                    }
                    <span >
                        {`${wallet?.wallet_type?.toUpperCase()}-${wallet?.wallet_id?.toUpperCase()}`}
                    </span>
                </div>
            </div>
            <div className={styles.bottom}>
                <p>{t("Monthly limit")}</p>
                <h3>{wallet?.currency?.code} {total?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
                <div className={styles.bb}>
                    <Progress
                        value={(totalBalance / total) * 100}
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
                    <span style={{ right: "5px" }}>{wallet?.currency?.code} {(total - totalBalance).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
            </div>
            <img src={current === index ? card_bg : card_bg_green} style={{
                position: "absolute",
                height: "100%",
                width: "100%",
                borderRadius: "10px",
                left: 0,
                top: 0,
                objectFit: "cover",
                zIndex: -1
            }} />
        </div>
    )
}

export default Card