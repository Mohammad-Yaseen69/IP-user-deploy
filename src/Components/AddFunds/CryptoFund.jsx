import { useContext, useEffect, useState } from "react"
import crypto_selected from "./files/crypto_selected.png"
import { Button, Card, CardBody } from "reactstrap";
import c_vid from "../PaymentsNewer/files/confirm.mp4"
import CryptoCurrencyNew from "../PaymentsNewer/CryptoCurrencyNew";
import CryptoFundReceipt from "./CryptoFundReceipt";
import SelectedCryptoCurrency from "../PaymentsNewer/SelectedCryptoCurrency";
import styles from "../PaymentsNewer/Mobile/styles/International.module.css"
import { useTranslation } from "react-i18next";
import { ChevronLeft, ChevronRight } from "react-feather";
import TopIcon from "../PaymentsNewer/Mobile/files/Top";
import Amount from "./WalletFundsFlow/Amount";
import { useNavigate } from "react-router";
import { decryptData } from "../../Helper/EssentilaMethods/Decryption";
import axios from "axios";
import { encryptData } from "../../Helper/EssentilaMethods/Encryption";
import { UserContext } from "../../Context/UserContext";
import FeesComponent from "../PaymentsNewer/InternationalFlow/FeesComponent";
import InstaPayLoader from "../Loader";
import { apiWrapper } from "../../utils/Functions/apiWrapper";
import { apiErrorMessage } from "../PaymentsNewer/InternationalFlow";
import { LimitsErrorMessage } from "../PaymentsNewer/OTPConfirmation";
import { WidgetSDK } from "@keabank/websdk";
import ErrorModal from "../PaymentsNewer/InternationalFlow/ErrorModal";

const isBig = window.innerWidth > 1000


const sdk = new WidgetSDK({
    integrationId: import.meta.env.VITE_KEABANK_INTEGRATION_ID,
    merchantId: import.meta.env.VITE_KEABANK_MERCHANT_ID,
});


const CryptoFund = ({ setAction }) => {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const { authHeader } = useContext(UserContext)
    const [subStep, setSubStep] = useState(1);
    const [cryptoCurrency, setCryptoCurrency] = useState({})
    const [amount, setAmount] = useState("")
    const [exchangeRate, setExchangeRate] = useState({})
    const [loading, setLoading] = useState(false)
    const [exchangeRateError, setExchangeRateError] = useState("")
    const [error, setError] = useState(null)
    const [transactionComplete, setTransactionComplete] = useState(false)
    const [transactionLoading, setTransactionLoading] = useState(false)
    const [limits, setLimits] = useState({
        min: 0,
        max: 0
    })

    console.log(exchangeRateError)

    const getCryptoFeeDetails = async (amountArg) => {

        try {
            const enc = encryptData({
                from: cryptoCurrency?.currency?.code,
                to: "USDT",
                amount: Number(String(amountArg || amount)?.replace(",", ""))
            })
            const res = await axios.post(`${import.meta.env.VITE_IP_DEV_API}/api/crypto/rates`, { data: enc }, {
                headers: authHeader,
            })
            const dec = decryptData(res.data.data)
            console.log(dec)
            setExchangeRateError(null)
            setExchangeRate({
                fee: { amount: dec?.data?.fee?.value, currency: dec?.data?.fee?.currency },
                sending: { currency: dec?.data?.amount?.currency, amount: dec?.data?.amount?.value },
                receiver: { currency: cryptoCurrency?.currency?.code, amount: dec?.data?.recipientReceives?.value },
                total: dec?.data?.amount?.value,
                token: dec?.data?.token,
                rate: dec?.data?.rate?.value
            })

        } catch (error) {
            const dec = decryptData(error?.response?.data?.data);
            setExchangeRateError(dec?.message ?? "We cannot process your request at the moment, please try again later.")
            console.log(dec)
        } finally {
            setLoading(false)
        }
    }



    useEffect(() => {
        setLoading(true)
        setExchangeRateError(null)
        setExchangeRate({})
        if (amount) {
            let timeout;
            clearTimeout(timeout)
            timeout = setTimeout(() => {
                getCryptoFeeDetails(amount)
            }, 500)
        }
    }, [amount])


    const handleConfirm = async () => {
        setTransactionLoading(true)
        const payment_id = `keabank_instapay_topup_${Date.now()}`

        const payload = {
            payment_id,
            wallet_id: cryptoCurrency?.wallet_id,
            token: exchangeRate?.token,
            amount: amount,
        }

        try {
            const response = await apiWrapper({
                endpoint: `/api/crypto/crypto-topup`,
                isEncrypted: true,
                method: "POST",
                payload
            })

            console.log(response)

            const paymentConfig = {
                orderId: payment_id,
                amount: exchangeRate.total,
                currency: "USDT_TRC20",
                paymentPurpose: `Crypto Topup`
            }

            sdk.init(paymentConfig).then(() => {
                setTransactionComplete(true)
            })
        } catch (error) {
            const dec = decryptData(error?.response?.data?.data)

            const error2 = apiErrorMessage(dec?.message)
            const error1 = LimitsErrorMessage(dec?.code)

            if (error1) {
                setError(t(error1))
            }
            else if (error2) {
                setError(t(error2))
            } else {
                setError(dec?.message ?? "We cannot process your request at the moment, please try again later.")
            }
        } finally {
            setTransactionLoading(false)
        }
    }

    const handleBack = () => {
        if (subStep === 1) {
            setAction("")
            setCryptoCurrency({})
        } else {
            setAmount("")
            setExchangeRate({})
            setExchangeRateError(null)
            setSubStep(1)
        }
    }

    return (
        <>
            <ErrorModal isOpen={error} toggle={() => setError(null)} heading="Crypto Topup Failed" />
            {
                window.innerWidth > 1000
                    ?
                    <div style={{ display: "flex" }} className="i_t_con" >
                        <img src={crypto_selected} alt="cs" style={{ maxHeight: window.innerWidth > 1500 ? "700px" : "530px", borderRadius: "10px" }} draggable="false" />
                        <Card style={{ width: "100%", marginBottom: 0, paddingBottom: "1rem", height: "fit-content", minHeight: "80vh" }}>
                            <CardBody style={{ display: "flex", gap: subStep === 5 ? "0" : "1rem", flexWrap: "wrap", padding: "24px" }}>
                                <div style={{
                                    flex: 1,
                                    minWidth: "180px",
                                    display: (subStep !== 3 && subStep !== 5) ? "flex" : "block",
                                    flexDirection: "column",
                                    justifyContent: 'space-between',
                                    gap: "1rem",
                                    maxWidth: "none"
                                }}>
                                    <div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", }}>
                                        <h4 className="head_left_side">
                                            {subStep === 1 && "Choose the Crypto that you intend to liquidate!"}
                                            {subStep === 2 && "Enter the amount you want to topup."}
                                        </h4>

                                        {
                                            subStep === 3
                                            &&
                                            <div style={{
                                                padding: "2rem",
                                                textAlign: "center",
                                                height: "101%",
                                                borderRadius: "24px",
                                                display: "flex",
                                                flexDirection: "column",
                                                justifyContent: "space-between",
                                                marginTop: "-.6rem",
                                                maxWidth: "320px"
                                            }} className="confirm_container">
                                                <h4 style={{ color: "#5936f0", wordBreak: "normal" }} className="head_confirm">Your payment is confirmed</h4>
                                                <video src={c_vid} autoPlay loop="true" style={{ height: "100%", width: "100%", objectFit: "cover", mixBlendMode: "multiply" }}></video>
                                                <p>Thanks for using InstaPay</p>
                                            </div>
                                        }
                                        {
                                            subStep !== 3 && subStep < 5
                                            &&
                                            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                                                {
                                                    subStep === 2
                                                    &&
                                                    <div style={{ marginTop: "3rem" }}>
                                                        {loading && <div style={{ height: "100px", width: "100px", margin: "0 auto" }}><InstaPayLoader /></div>}
                                                        {!loading && !exchangeRateError &&
                                                            <FeesComponent
                                                                receiverLabel={"You Will Get"}
                                                                error={exchangeRateError}
                                                                feesLabel="Fees"
                                                                sendingLabel="Sending Amount"
                                                                totalLabel="Total Amount"
                                                                data={{ exchange_rate: exchangeRate }}
                                                            />
                                                        }
                                                    </div>
                                                }
                                                {
                                                    subStep > 1
                                                    &&
                                                    <SelectedCryptoCurrency cryptoCurrency={cryptoCurrency} setSubStep={setSubStep} />
                                                }
                                            </div>
                                        }
                                    </div>

                                </div>
                                <div style={{ flex: 1.5, minWidth: "300px", display: "flex", justifyContent: "space-between", flexDirection: "column" }}>
                                    {
                                        subStep === 1
                                        &&
                                        <CryptoCurrencyNew cryptoCurrency={cryptoCurrency} setCryptoCurrency={setCryptoCurrency} setSubStep={setSubStep} action="" />
                                    }
                                    {
                                        subStep === 2
                                        && cryptoCurrency && typeof cryptoCurrency === 'object'
                                        &&
                                        <Amount
                                            data={{
                                                wallet: cryptoCurrency,
                                                amount,
                                                limits: limits || { min: 0, max: 0 },
                                                exchangeRate: exchangeRateError,
                                            }}
                                            dataHandler={(key, value) => {
                                                if (key === "amount") {
                                                    setAmount(value)
                                                }
                                                if (key === "limits") {
                                                    setLimits(value)
                                                }
                                                if (key === "exchange_rate_error") {
                                                    setExchangeRateError(value)
                                                }
                                            }}
                                        />
                                    }

                                    <div style={{
                                        display: "flex",
                                        justifyContent: "flex-end",
                                        alignItems: "center",
                                        gap: ".5rem",
                                        flexWrap: "wrap",
                                        paddingLeft: isBig ? "1rem" : "0",
                                        marginTop: "1rem",
                                    }}>
                                        {
                                            !transactionComplete &&
                                            <span onClick={handleBack} style={{ fontWeight: 600, marginRight: "20px", cursor: "pointer" }}>
                                                {t("Back")}
                                            </span>
                                        }
                                        <Button size="sm" style={{
                                            border: "none",
                                            outline: "none",
                                            background: " linear-gradient(to right, rgba(0, 0, 0, 0.40) 0%, rgba(0, 0, 0, 0.40) 100%), linear-gradient(to left, #E64067 0%, #5926F0 55.65%, #4828A0",
                                            backgroundBlendMode: "overlay, normal",
                                            boxShadow: "0px 11.90068244934082px 8.655041694641113px -5.409400939941406px rgba(89, 38, 240, 0.17)",
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            width: isBig ? "60%" : "100%",
                                            minWidth: "fit-content",
                                            padding: ".75rem 2rem",
                                            borderRadius: "12px"
                                        }}
                                            className="i_t_button"
                                            onClick={() => {
                                                if (transactionComplete) {
                                                    navigate("/wallets")
                                                } else {
                                                    if (subStep === 1) {
                                                        navigate("/add-funds?wallet_address=" + cryptoCurrency._id)
                                                        setSubStep(prev => prev + 1)
                                                    } else {
                                                        handleConfirm()
                                                    }
                                                }
                                            }}
                                            disabled={subStep === 1 ? !cryptoCurrency?._id : !amount || exchangeRateError || loading || transactionLoading}
                                        >
                                            {transactionComplete ? t("Go to wallets.") : t("Next")} <ChevronRight size={20} />
                                        </Button>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    </div>
                    :
                    <div className={styles.container}>
                        <div className={styles.top}>
                            <button className={styles.back_btn} onClick={() => {
                                if (subStep === 1) {
                                    setAction("")
                                } else {
                                    setSubStep(prev => prev < 5 ? prev - 1 : prev)
                                }
                            }}>
                                <ChevronLeft />
                            </button>
                            <h5>{t("Add Funds")}</h5>
                            <div>
                                <TopIcon fill={subStep > 1 ? "#5926f0" : "black"} />
                            </div>
                        </div>

                        <div className={styles.bottom}>
                            {
                                subStep === 1
                                &&
                                <CryptoCurrencyNew cryptoCurrency={cryptoCurrency} setCryptoCurrency={setCryptoCurrency} setSubStep={setSubStep} action="" />
                            }
                            {
                                subStep === 2
                                && cryptoCurrency && typeof cryptoCurrency === 'object'
                                &&
                                <div>
                                    <Amount
                                        data={{
                                            wallet: cryptoCurrency,
                                            amount,
                                            limits: limits || { min: 0, max: 0 },
                                            exchangeRate: exchangeRateError,
                                        }}
                                        dataHandler={(key, value) => {
                                            if (key === "amount") {
                                                setAmount(value)
                                            }
                                            if (key === "limits") {
                                                setLimits(value)
                                            }
                                            if (key === "exchange_rate_error") {
                                                setExchangeRateError(value)
                                            }
                                        }}
                                    />

                                    <div style={{ marginTop: "1rem" }}>
                                        {loading && <div style={{ height: "100px", width: "100px", margin: "0 auto" }}><InstaPayLoader /></div>}
                                        {!loading && !exchangeRateError &&
                                            <FeesComponent
                                                receiverLabel={"You Will Get"}
                                                error={exchangeRateError}
                                                feesLabel="Fees"
                                                sendingLabel="Sending Amount"
                                                totalLabel="Total Amount"
                                                data={{ exchange_rate: exchangeRate }}
                                            />
                                        }
                                    </div>
                                </div>
                            }


                            <div style={{
                                display: "flex",
                                justifyContent: "flex-end",
                                alignItems: "center",
                                gap: ".5rem",
                                flexWrap: "wrap",
                                paddingLeft: isBig ? "1rem" : "0",
                                marginTop: "1rem",
                            }}>
                                {
                                    !transactionComplete &&
                                    <span onClick={handleBack} style={{ fontWeight: 600, marginRight: "20px", cursor: "pointer" }}>
                                        {t("Back")}
                                    </span>
                                }
                                <Button size="sm" style={{
                                    border: "none",
                                    outline: "none",
                                    background: " linear-gradient(to right, rgba(0, 0, 0, 0.40) 0%, rgba(0, 0, 0, 0.40) 100%), linear-gradient(to left, #E64067 0%, #5926F0 55.65%, #4828A0",
                                    backgroundBlendMode: "overlay, normal",
                                    boxShadow: "0px 11.90068244934082px 8.655041694641113px -5.409400939941406px rgba(89, 38, 240, 0.17)",
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    width: isBig ? "60%" : "100%",
                                    minWidth: "fit-content",
                                    padding: ".75rem 2rem",
                                    borderRadius: "12px"
                                }}
                                    className="i_t_button"
                                    onClick={() => {
                                        if (transactionComplete) {
                                            navigate("/wallets")
                                        } else {
                                            if (subStep === 1) {
                                                navigate("/add-funds?wallet_address=" + cryptoCurrency._id)
                                                setSubStep(prev => prev + 1)
                                            } else {
                                                handleConfirm()
                                            }
                                        }
                                    }}
                                    disabled={subStep === 1 ? !cryptoCurrency?._id : !amount || exchangeRateError || loading || transactionLoading}
                                >
                                    {transactionComplete ? t("Go to wallets.") : t("Next")} <ChevronRight size={20} />
                                </Button>
                            </div>
                        </div>
                    </div >
            }
        </>
    )
}

export default CryptoFund