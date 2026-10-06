import { useContext, useEffect, useMemo, useState } from "react"
import styles from "./styles/index.module.scss"
import TopRight from "../topRight"
import { useTranslation } from "react-i18next"
import money from "./files/money.png"
import crypto from "./files/crypto.png"
import CryptoFund from "./CryptoFund"
import WalletFund from "./WalletFund"
import { useLocation, useParams } from "react-router"
import CryptoJS from "crypto-js"
import Success from "./ResponseModals/Success"
import Error from "./ResponseModals/Error"
import Abort from "./ResponseModals/Abort"
import { decryptData } from "../../Helper/EssentilaMethods/Decryption"
import axios from "axios"
import { UserContext } from "../../Context/UserContext"
import InstaPayLoader from "../Loader"
import { encryptData } from "../../Helper/EssentilaMethods/Encryption"
import WalletFundsFlow from "./WalletFundsFlow"
import set from "date-fns/fp/set/index.js"

const AddFunds = () => {
    const { t } = useTranslation()
    const is_big = window.innerWidth > 1500
    const [action, setAction] = useState("")
    const params = useParams()
    const [currenctModal, setCurrentModal] = useState("")
    const location = useLocation()
    const queryParams = new URLSearchParams(location.search)
    const paymentId = queryParams.get("paymentId")
    const token = queryParams.get("token")
    const transaction_id = queryParams.get("transaction_id")
    const reference_id = queryParams.get("reference_id")
    const { authHeader, userDetails } = useContext(UserContext)
    const [loading, setLoading] = useState(false)
    const [status, setStatus] = useState("")
    const [isHovered, setIsHovered] = useState(false)


    useEffect(() => {
        setCurrentModal("")
        if (params?.enc && paymentId) {
            const confirmPaypalTransaction = async () => {
                setLoading(true)
                try {
                    const res = await axios.get(`${import.meta.env.VITE_IP_DEV_API}/api/paypal/payment-details/${paymentId}`, {
                        headers: authHeader
                    })

                    const dec = decryptData(res.data.data)
                    console.log(dec)
                    setStatus(dec?.transactioStatus)
                } catch (error) {
                    const err = decryptData(error?.response?.data?.data)
                    if (err?.message === "Unauthorize to access this route") {
                        const coun = localStorage.getItem("ip_country")
                        localStorage.clear()
                        localStorage.setItem("ip_country", coun)
                        window.location.pathname = "/login";
                    }
                    console.log(err)
                } finally {
                    setLoading(false)
                }
            }
            confirmPaypalTransaction()
            const { pathname } = window.location;
            if (pathname.includes("success")) {
                setCurrentModal("success")
            }
            if (pathname.includes("failed") || pathname.includes("error")) {
                setCurrentModal("error")
            }
            if (pathname.includes("aborted")) {
                setCurrentModal("abort")
            }
        } else if (params?.enc && token) {
            if (reference_id || transaction_id) {
                const updateTransactionStatus = async () => {
                    try {
                        const ref_id = transaction_id?.startsWith("tr_") ? transaction_id : reference_id?.startsWith("tr_") ? reference_id : ""
                        const trx_id = !transaction_id?.startsWith("tr_") && transaction_id?.length > 10 ? transaction_id : !reference_id?.startsWith("tr_") && reference_id?.length > 10 ? reference_id : ""
                        const data = {
                            transaction_id: trx_id,
                            reference_id: ref_id,
                        }
                        const enc = encryptData(data)
                        const res = await axios.post(`${import.meta.env.VITE_IP_DEV_API}/api/transaction/fail-transaction`, {
                            data: enc
                        }, {
                            headers: authHeader
                        })

                        const dec = decryptData(res.data.data)
                        console.log(dec)
                    } catch (error) {
                        const err = decryptData(error?.response?.data?.data)
                        if (err?.message === "Unauthorize to access this route") {
                            const coun = localStorage.getItem("ip_country")
                            localStorage.clear()
                            localStorage.setItem("ip_country", coun)
                            window.location.pathname = "/login";
                        }
                        console.log(err)
                    }
                }
                updateTransactionStatus()
            }
            const { pathname } = window.location;
            if (pathname.includes("success")) {
                setCurrentModal("success")
            }
            if (pathname.includes("failed") || pathname.includes("error")) {
                setCurrentModal("error")
            }
            if (pathname.includes("aborted")) {
                setCurrentModal("abort")
            }
        } else if (params?.enc && !paymentId) {
            const decryptResponse = (collection_id) => {
                const base64EncodedValue = collection_id;
                const decryptionKey = "saved_Collection_Encrypted_Key";

                // Decode the base64 value
                const decryptedBytes = CryptoJS.AES.decrypt(CryptoJS.enc.Base64.parse(base64EncodedValue).toString(CryptoJS.enc.Utf8), decryptionKey);
                const originalObjectIdString = decryptedBytes.toString(CryptoJS.enc.Utf8);

                const { pathname } = window.location;

                if (pathname.includes("success")) {
                    setCurrentModal("success")
                }
                if (pathname.includes("failed") || pathname.includes("error")) {
                    setCurrentModal("error")
                }
                if (pathname.includes("aborted")) {
                    setCurrentModal("abort")
                }

                return originalObjectIdString;
            }
            const res = decryptResponse(params?.enc)
            // console.log(res)
        }
        if (params?.type) {
            const { pathname } = window.location;

            if (pathname.includes("success")) {
                setCurrentModal("success")
                // Paytently: reconcile the wallet credit on return in case the webhook is delayed.
                if (pathname.includes("card")) {
                    try {
                        const pid = localStorage.getItem("paytently_payment_id")
                        if (pid) {
                            localStorage.removeItem("paytently_payment_id")
                            localStorage.removeItem("paytently_authorize_url")
                            axios
                                .post(`${import.meta.env.VITE_IP_DEV_API}/api/paytently/verify/${pid}`, {}, { headers: authHeader })
                                .then((res) => {
                                    const dec = decryptData(res.data.data)
                                    if (dec?.result === "completed") setStatus("completed")
                                })
                                .catch(() => { })
                        }
                    } catch { }
                }
            }
            if (pathname.includes("failed") || pathname.includes("error")) {
                setCurrentModal("error")
            }
            if (pathname.includes("aborted")) {
                setCurrentModal("abort")
            }
        }
    }, [params, paymentId])

    const type = queryParams.get("type")

    const isCryptoAllowed = useMemo(() => {
        if (userDetails?._id) {
            return userDetails.level?.topup_channel?.crypto
        }
    }, [userDetails])

    useEffect(() => {
        if (type === "wallet") {
            setAction("money")
        } else if (type === "crypto" && isCryptoAllowed) {
            setAction("crypto")
        }
    }, [type, isCryptoAllowed])


    return (
        loading
            ?
            <div style={{
                height: "100vh",
                aspectRatio: 1,

            }}>
                <InstaPayLoader fallback={true} />
            </div>
            :
            <>
                <div className={styles.container}>
                    <div className={styles.top}>
                        <h4 style={{ marginBottom: ".2rem" }}>{t("Add Funds")}</h4>
                        <TopRight />
                    </div>
                    {
                        !action
                        &&
                        <div style={{
                            display: "flex",
                            gap: "3rem",
                            position: "relative"
                        }}>
                            <div style={{ cursor: "pointer" }} onClick={() => setAction("money")}>
                                <img src={money} alt="money"
                                    // width="130px"
                                    loading="lazy"
                                    style={{ maxHeight: is_big ? "541px" : "430px" }}
                                    draggable="false" />
                            </div>
                            {/* <div style={{ cursor: "pointer", position: "relative" }} onClick={() => setAction("crypto")}> */}
                            <div
                                onClick={() => isCryptoAllowed ? setAction("crypto") : null}
                                style={{
                                    cursor: isCryptoAllowed ? "pointer" : "not-allowed",
                                    position: "relative",
                                    overflow: "hidden"
                                }}
                                title={!isCryptoAllowed ? t("This feature is not allowed for your account.") : undefined}
                                aria-disabled={!isCryptoAllowed}
                                onMouseEnter={() => setIsHovered(true)}
                                onMouseLeave={() => setIsHovered(false)}
                            >
                                {!isCryptoAllowed && isHovered &&
                                    <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.7)", borderRadius: "12px", color: "white", display: "flex", justifyContent: "center", alignItems: "center", fontWeight: 600, fontSize: "1.2rem", textAlign: "center", padding: "14px" }}>
                                        {t("This feature is not allowed in your account.")}
                                    </div>
                                }
                                <img src={crypto}
                                    alt="crypto"
                                    // width="130px"
                                    loading="lazy"
                                    style={{ maxHeight: is_big ? "541px" : "430px" }}

                                    draggable="false" />
                            </div>
                            {/* </div> */}
                            {/* <Button style={{
                            border: "none",
                            outline: "none",
                            background: " linear-gradient(to right, rgba(0, 0, 0, 0.40) 0%, rgba(0, 0, 0, 0.40) 100%), linear-gradient(to left, #E64067 0%, #5926F0 55.65%, #4828A0",
                            backgroundBlendMode: "overlay, normal",
                            boxShadow: "0px 11.90068244934082px 8.655041694641113px -5.409400939941406px rgba(89, 38, 240, 0.17)",
                            borderRadius: "10px",
                            height: "fit-content",
                            position: "absolute",
                            top: "0",
                            right: "0"
                        }} onClick={toggleFunds}>Funds History</Button>
                        <FundsHistory isOpen={showFunds} toggle={toggleFunds} /> */}
                        </div>
                    }

                    {
                        action === "crypto"
                        &&
                        <CryptoFund setAction={setAction} />
                    }
                    {
                        action === "money"
                        &&
                        // <WalletFund setAction={setAction} />
                        <WalletFundsFlow
                            setAction={setAction}
                        />
                    }

                    {
                        currenctModal === "success"
                        && <Success
                            link={status === "completed" || !status ? "/wallets" : "/transactions"}
                            page={status === "completed" || !status ? "My Wallets" : "Transactions"}
                            message={(status === "completed" || !status) && window.location.pathname.includes("card") ? "Funds has been added Successfully!" : "Your top-up via PayPal is being processed and may take up to 120 seconds. Please check the transactions section for updates."}
                            type={status === "completed" || !status ? "success" : "pending"}
                        />
                    }
                    {
                        currenctModal === "error"
                        && <Error />
                    }
                    {
                        currenctModal === "abort"
                        && <Abort />
                    }
                </div>
                <div className={styles.mobile}>
                    {
                        !action &&
                        <div className={styles.top}>
                            <h4 style={{ marginBottom: ".2rem" }}>{t("Add Funds")}</h4>
                            {/* <Button style={{
                        border: "none",
                        outline: "none",
                        background: " linear-gradient(to right, rgba(0, 0, 0, 0.40) 0%, rgba(0, 0, 0, 0.40) 100%), linear-gradient(to left, #E64067 0%, #5926F0 55.65%, #4828A0",
                        backgroundBlendMode: "overlay, normal",
                        boxShadow: "0px 11.90068244934082px 8.655041694641113px -5.409400939941406px rgba(89, 38, 240, 0.17)",
                        borderRadius: "8px",
                        }} onClick={toggleFunds}>Funds History</Button>
                        <FundsHistory isOpen={showFunds} toggle={toggleFunds} /> */}
                        </div>
                    }
                    {
                        !action
                        &&
                        <div style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "2rem"
                        }}>
                            <div style={{ cursor: "pointer", borderRadius: "16px", width: "100%", overflow: "hidden" }} onClick={() => setAction("money")}>
                                <img src={money} alt="money"
                                    loading="lazy"
                                    style={{ height: "100%", width: "100%", objectFit: "cover" }}
                                    draggable="false" />
                            </div>
                            <div
                                style={{
                                    cursor: isCryptoAllowed ? "pointer" : "not-allowed",
                                    borderRadius: "16px",
                                    width: "100%",
                                    overflow: "hidden",
                                    opacity: isCryptoAllowed ? 1 : 0.6,
                                    pointerEvents: isCryptoAllowed ? "auto" : "none"
                                }}
                                onClick={() => isCryptoAllowed ? setAction("crypto") : null}
                                title={!isCryptoAllowed ? t("This feature is not allowed for your account.") : undefined}
                                aria-disabled={!isCryptoAllowed}
                            >
                                <img src={crypto} alt="crypto"
                                loading="lazy"
                                style={{ height: "100%", width: "100%", objectFit: "cover" }} draggable="false" />
                            </div>
                        </div>
                    }
                    {
                        action === "crypto"
                        &&
                        <CryptoFund setAction={setAction} />
                    }
                    {
                        action === "money"
                        &&
                        <WalletFundsFlow setAction={setAction} />
                    }

                    {
                        currenctModal === "success"
                        && <Success
                            link={status === "completed" || !status ? "/wallets" : "/transactions"}
                            page={status === "completed" || !status ? "My Wallets" : "Transactions"}
                            message={(status === "completed" || !status) && window.location.pathname.includes("card") ? "Funds has been added Successfully!" : "Your top-up via PayPal is being processed and may take up to 120 seconds. Please check the transactions section for updates."}
                        />
                    }
                    {
                        currenctModal === "error"
                        && <Error />
                    }
                    {
                        currenctModal === "abort"
                        && <Abort />
                    }
                </div>
            </>
    )
}

export default AddFunds;