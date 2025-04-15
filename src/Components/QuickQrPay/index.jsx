import { useEffect, useState } from "react"
import styles from "./styles/index.module.scss"
import QrReader from "react-qr-reader";
import gif from "./files/success.gif"
import adBG from "./files/layer.png"
import addU from "./files/add-user.png"
import copy from "./files/copy.svg"
import axios from "axios";
import { useLocation, useNavigate } from "react-router";
import { decryptData } from "../../Helper/EssentilaMethods/Decryption";
import { encryptData } from "../../Helper/EssentilaMethods/Encryption";
import countries from "../PaymentsNewer/CountriesData.json";

const QuickQrPay = () => {
    const [method, setMethod] = useState("qr")
    const [data, setData] = useState("")
    const [step, setStep] = useState(1)
    const [error, setError] = useState(null)
    const [walletDetails, setWalletDetails] = useState({})
    const [countryFlag, setCountryFlag] = useState(null)

    const location = useLocation()
    const query = new URLSearchParams(location.search)
    const bot_id = query.get("bot_id")
    const platform = query.get("bot")



    const getFileUrl = (name) => {
        const country = countries.find(item => item.name === name)
        return country?.file_url || ''
    }

    const handleScan = async (scanData) => {
        console.log(`loaded data data`, scanData);
        if (scanData && scanData !== "") {
            const splitted = scanData.split("://")
            const wallet_id = splitted[1].split("/")[2]

            try {
                const data = {
                    "wallet_id": wallet_id,
                    "recipientId": bot_id
                }

                console.log(data)

                const enc = encryptData(data)
                const res = await axios.post(`${process.env.REACT_APP_IP_DEV_API}/api/wallet/get-wallet-details-public`, { data: enc })
                const dec = decryptData(res.data.data)
                setWalletDetails(dec?.walletDetails)
                setStep(prev => prev + 1)
                console.log(dec)
            } catch (error) {
                const dec = decryptData(error.response.data.data)
                console.log(dec)
                setError("Invalid QR Code")
            }
            setData(scanData)
        }
    };

    const handleError = (error) => {
        console.error(error);
        // setError(error);
    }


    const setDetails = async () => {
        try {
            const data = {
                platform: platform,
                recipientId: bot_id,
                token: walletDetails?.token
            }

            const enc = encryptData(data)
            const res = await axios.post(`${process.env.REACT_APP_IP_DEV_API}/api/instagram/set-qrpay-wallet`, { data: enc })
            const dec = decryptData(res.data.data)
            setStep(prev => prev + 1)
            console.log(dec)
        } catch (error) {
            const dec = decryptData(error.response.data.data)
            console.log(dec)
        }
    }

    const clickHandler = () => {
        if (step === 2) {
            setDetails()
        }
    }

    const navigate = useNavigate()


    return (
        <div className={styles.container}>
            <h1>QR Quick Pay</h1>

            {step === 1 &&
                <div className={styles.method_selection}>
                    <div style={{ background: method === "qr" && "#5926F0", width: "45%" }} onClick={() => setMethod("qr")} className={styles.tab}>
                        <span style={{ color: method === "qr" && "#FFF" }}>Scan Qr</span>
                    </div>

                    <div style={{ background: method === "code" && "#5926F0", width: "55%" }} onClick={() => setMethod("code")} className={styles.tab}>
                        <span style={{ color: method === "code" && "#FFF", }}>Enter Merchant Code</span>
                    </div>
                </div>
            }

            {step === 1 &&
                <>
                    {method === "qr" &&
                        <div className={styles.qr_cont}>
                            <QrReader
                                delay={1000}
                                onError={handleError}
                                onScan={handleScan}
                                showViewFinder={false}
                                constraints={{
                                    facingMode: "environment"  // This forces the back camera
                                }}
                                facingMode={{ facingMode:"environment" }}
                                // style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />

                            <div className={styles.mobileBtn}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="25" height="26" viewBox="0 0 25 26" fill="none">
                                    <path d="M21.5867 20.4045V6.13452C21.5867 5.01331 20.6693 4.09595 19.5481 4.09595H5.27809C4.15688 4.09595 3.23952 5.01331 3.23952 6.13452V20.4045C3.23952 21.5258 4.15688 22.4431 5.27809 22.4431H19.5481C20.6693 22.4431 21.5867 21.5258 21.5867 20.4045ZM9.25331 15.2877L11.3938 17.8665L14.5536 13.7996C14.7575 13.5345 15.1652 13.5345 15.369 13.8098L18.9467 18.58C19.0035 18.6557 19.0381 18.7458 19.0466 18.84C19.0551 18.9343 19.0372 19.0291 18.9949 19.1137C18.9525 19.1984 18.8875 19.2696 18.8069 19.3193C18.7264 19.3691 18.6337 19.3954 18.539 19.3954H6.31776C5.88966 19.3954 5.65523 18.9062 5.92024 18.5698L8.45827 15.3081C8.65193 15.0431 9.03926 15.0329 9.25331 15.2877Z" fill="#404040" />
                                </svg>
                            </div>
                            {/* {data && <p>Scanned Code: {data}</p>} */}
                        </div>
                    }
                    {error && <p className={styles.error} style={{ fontWeight: 600, color: "red" }}>{error}</p>}


                    {
                        method === "code" &&
                        <div className={styles.code_cont}>
                            <h5>Enter the Merchant Code</h5>

                            <div style={{ position: "relative", width: "100%" }}>
                                <input type="text" />

                                <h5 style={{
                                    position: "absolute",
                                    top: "29%",
                                    left: "13px",
                                }}>#INSTAPAY-</h5>
                            </div>

                            <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                                    <img src={addU} alt="" />
                                    <span>
                                        Recipient Not on InstaPay?
                                    </span>
                                </div>
                                <button><p>Invite them</p></button>
                            </div>
                        </div>
                    }
                </>
            }

            {step === 2 &&
                <div className={styles.merchantInfo}>
                    <div>
                        <h4>Merchant Details</h4>
                        <p>Please take a few moments to carefully verify the information to your payee details.</p>
                    </div>


                    <div className={styles.info}>
                        {walletDetails?.coverPicture &&
                            <div className={styles.banner}>
                                <img src={walletDetails?.coverPicture} alt="" />
                            </div>
                        }

                        <div className={styles.dets}>
                            <div className={styles.u_info}>
                                {walletDetails?.profilePicture ? <img src={walletDetails?.profilePicture} className={styles.pfp} alt="" /> : <div className={styles.pfp_placeHolder}>{walletDetails?.name?.split(' ')[0][0]?.toUpperCase()}{walletDetails?.name?.split(' ')[1][0]?.toUpperCase()}</div>}
                                <h2>{walletDetails?.name}</h2>
                                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                    <p>@{walletDetails?.username}</p>
                                    <span>Personal Account</span>
                                </div>

                                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                    <img style={{ width: "20px" }} src={getFileUrl(walletDetails.country)} alt="" />
                                    <h6 style={{ fontSize: "10px", color: "#6C6C6C", fontWeight: 600 }}>{walletDetails?.country}</h6>
                                </div>
                            </div>

                            <div className={styles.w_info}>
                                <div>
                                    <p>{walletDetails?.wallet_id}</p>
                                    <span>{walletDetails?.currency?.code} Wallet</span>
                                </div>

                                <img src={copy} alt="" />
                            </div>


                            <button onClick={() =>  navigate(`https://my.insta-pay.ch/profile/${walletDetails?.username}`)}>
                                View Profile
                            </button>
                        </div>
                    </div>
                </div>
            }

            {step === 3 &&
                <div style={{
                    margin: "auto",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "20px"
                }}>
                    <div style={{

                        width: "100%",
                        display: "flex",
                        flexDirection: "column",
                        gap: "80px",
                        justifyContent: "center",
                        alignItems: "center",
                        position: "relative",
                        borderRadius: "16px",
                    }}>
                        <div style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: "20px"
                        }}>
                            <img
                                style={{ width: "180px" }}
                                src={gif}
                                alt=""
                            />
                            <p style={{
                                width: "100%",
                                textAlign: "center",
                                fontSize: "20px",
                                fontWeight: 700,
                                color: "black",
                                lineHeight: "26px"
                            }}>
                                You can now close this window and go back to chatbot.
                            </p>
                        </div>
                    </div>
                </div>
            }

            {step === 1 &&
                <div style={{ background: `url(${adBG})`, backgroundSize: "cover", backgroundPosition: "left" }} className={styles.ad}>
                    <h2>Advertisement Placeholder</h2>
                </div>}
            <div className={styles.btns}>
                {(method !== "qr" || step === 2) && <button onClick={clickHandler} style={{ background: "#5926F0", color: "white" }}>{step === 1 ? "Verify" : "Next"}</button>}
                {step === 2 && <button
                    onClick={() => {
                        setWalletDetails({})
                        setStep(prev => prev - 1)
                        setCountryFlag(null)
                        setError(null)
                        setData("")
                    }} style={{ background: "white" }}>Back</button>}
            </div>
        </div>
    )
}

export default QuickQrPay
