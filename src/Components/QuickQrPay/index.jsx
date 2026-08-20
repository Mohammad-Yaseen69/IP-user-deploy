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
import { toast } from "react-toastify";
import cameraGif from "./files/camera.gif"
import { useTranslation } from "react-i18next";
import RedirectButton from "../../CommonElements/RedirectButton";
import i18next from "i18next";

const QuickQrPay = () => {
    const [step, setStep] = useState(1)
    const [error, setError] = useState(null)
    const [walletDetails, setWalletDetails] = useState({})
    const [walletInput, setWalletInput] = useState("")

    const location = useLocation()
    const query = new URLSearchParams(location.search)
    const bot_id = query.get("bot_id")
    const platform = query.get("bot")
    const lang = query.get("lang") || "en"
    const [disable, setDisabled] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [showInstruction, setShowInstruction] = useState(true)


    const [method, setMethod] = useState("qr")

    const getFileUrl = (name) => {
        const country = countries.find(item => item.name === name)
        return country?.file_url || ''
    }


    // useEffect(() => {
    //     if (isTelegramWebview()) {
    //         window.onload = () => {
    //             window.location.reload()
    //         }
    //     }
    // }, []);

    const { t } = useTranslation()


    useEffect(() => {
        i18next.changeLanguage(lang)
    }, [lang])

    useEffect(() => {
        let timeout;
        if (step === 2) {
            setDisabled(true)
            timeout = setTimeout(() => {
                setDisabled(false)
            }, 400)
        }
        else {
            setDisabled(false)
        }

        return () => {
            clearTimeout(timeout)
        }
    }, [step])
    const getDetails = async (walletId) => {
        if (walletId === "") return false
        setError(null)
        try {
            const data = {
                "wallet_id": walletId,
                "recipientId": bot_id
            }

            console.log(data)

            const enc = encryptData(data)
            const res = await axios.post(`${import.meta.env.VITE_IP_DEV_API}/api/wallet/get-wallet-details-public`, { data: enc })
            const dec = decryptData(res.data.data)
            setWalletDetails(dec?.walletDetails)
            setStep(2)
            console.log(dec)
        } catch (error) {
            const dec = decryptData(error?.response?.data?.data)
            console.log(dec)
            setError(dec.message || t("Invalid QR Code"))
        }
    }

    const handleScan = async (scanData) => {
        console.log(`loaded data data`, scanData);
        if (scanData && scanData !== "") {
            const splitted = scanData.split("://")
            const wallet_id = splitted[1].split("/")[2]
            getDetails(wallet_id)
        }
    };

    const handleError = (error) => {
        console.error(error);
    }

    const setFileHandler = (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile?.type?.toLowerCase()?.includes("image")) {
            setError(t("Only images are allowed."))
            return
        }
        const formData = new FormData()
        formData.append("file", selectedFile)

        axios.post(`${import.meta.env.VITE_IP_DEV_API}/api/wallet/get-qr-details`,
            formData)
            .then(res => {
                const decrypted = decryptData(res.data.data)
                getDetails(decrypted?.walletDetails?.wallet_id)
            })
            .catch(err => {
                console.log(err)
                setError(t("Invalid QR Code!"))
            })
    }

    const setDetails = async (btnClicked) => {
        if (!btnClicked) return false
        setWalletInput("")
        try {
            const data = {
                platform: platform,
                recipientId: bot_id,
                token: walletDetails?.token
            }

            const enc = encryptData(data)
            const res = await axios.post(`${import.meta.env.VITE_IP_DEV_API}/api/instagram/set-qrpay-wallet`, { data: enc })
            const dec = decryptData(res.data.data)
            setStep(3)
            console.log(dec)
        } catch (error) {
            const dec = decryptData(error?.response?.data?.data)
            console.log(dec)
        }
    }

    const clickHandler = () => {
        if (step === 1) {
            getDetails(walletInput)
        }
        else if (step === 2) {
            setDetails(true)
        }
    }

    const navigate = useNavigate()

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text).then(() => {
            toast.success('Copied to clipboard');
        }).catch((error) => {
            toast.error('Error copying to clipboard:', error);
        });
    };


    return (
        <>
            {showInstruction &&
                <div className={styles.instructionsMain}>
                    <div>
                        <h4>{t("How to Scan a QR Code Perfectly")}</h4>
                        <div className={styles.instructions}>
                            <div>
                                <h5>{t("Keep the QR Code Flat and Visible")}</h5>
                                <p>{t("Make sure the QR code is not bent, wrinkled, or partially hidden.")}</p>
                            </div>
                            <div>
                                <h5>{t("Good Lighting is Key")}</h5>
                                <p>{t("Scan in a well-lit environment. Avoid shadows or glare on the QR code.")}</p>
                            </div>
                            <div>
                                <h5>{t("Center the QR Code in the Frame")}</h5>
                                <p>{t("Align the QR code inside the on-screen frame. Try to keep all edges visible.")}</p>
                            </div>
                            <div>
                                <h5>{t("Avoid Zooming In or Out")}</h5>
                                <p>{t("Let the app handle the focus. Moving your phone closer or farther can affect clarity.")}</p>
                            </div>
                            <div>
                                <h5>{t("Clean Your Camera Lens")}</h5>
                                <p>{t("A dirty or smudged lens can blur the image. Wipe it gently if needed.")}</p>
                            </div>
                            <div>
                                <h5>{t("Check for Damage")}</h5>
                                <p>{t("Make sure the QR code isn't torn, faded, or distorted.")}</p>
                            </div>
                        </div>
                    </div>


                    <div className={styles.btns}>
                        <button
                            style={{ background: "#5926F0", color: "white" }}
                            onClick={() => {
                                setShowInstruction(false)
                                setStep(1)
                                setMethod("qr")
                            }}
                            className={styles.gradientBtn}
                        >{t("Proceed")}</button>
                    </div>


                </div>
            }

            {!showInstruction && <div style={{ minHeight: "100vh" }} className={styles.container}>
                <h1>{t("QR Quick Pay")}</h1>

                {step === 1 &&
                    <div className={styles.method_selection}>
                        <div style={{ background: method === "qr" && "#5926F0", width: "45%" }} onClick={() => setMethod("qr")} className={styles.tab}>
                            <span style={{ color: method === "qr" && "#FFF" }}>{t("Scan Qr")}</span>
                        </div>

                        <div style={{ background: method === "code" && "#5926F0", width: "55%" }} onClick={() => setMethod("code")} className={styles.tab}>
                            <span style={{ color: method === "code" && "#FFF", }}>{t("Enter Merchant Code")}</span>
                        </div>
                    </div>
                }

                {step === 1 &&
                    <>
                        {method === "qr" &&
                            <>

                                <div className={styles.qr_cont}>
                                    <div style={{ visibility: isLoading && "hidden" }} >
                                        <QrReader
                                            delay={1000}
                                            onError={handleError}
                                            onScan={handleScan}
                                            onLoad={() => {
                                                setIsLoading(false)
                                            }}

                                            showViewFinder={false}
                                            constraints={{
                                                facingMode: "environment"  // This forces the back camera
                                            }}
                                            facingMode={{ facingMode: "environment" }}
                                        // style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                        />
                                    </div>
                                    <label htmlFor="input_qr" className={styles.mobileBtn}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="25" height="26" viewBox="0 0 25 26" fill="none">
                                            <path d="M21.5867 20.4045V6.13452C21.5867 5.01331 20.6693 4.09595 19.5481 4.09595H5.27809C4.15688 4.09595 3.23952 5.01331 3.23952 6.13452V20.4045C3.23952 21.5258 4.15688 22.4431 5.27809 22.4431H19.5481C20.6693 22.4431 21.5867 21.5258 21.5867 20.4045ZM9.25331 15.2877L11.3938 17.8665L14.5536 13.7996C14.7575 13.5345 15.1652 13.5345 15.369 13.8098L18.9467 18.58C19.0035 18.6557 19.0381 18.7458 19.0466 18.84C19.0551 18.9343 19.0372 19.0291 18.9949 19.1137C18.9525 19.1984 18.8875 19.2696 18.8069 19.3193C18.7264 19.3691 18.6337 19.3954 18.539 19.3954H6.31776C5.88966 19.3954 5.65523 18.9062 5.92024 18.5698L8.45827 15.3081C8.65193 15.0431 9.03926 15.0329 9.25331 15.2877Z" fill="#404040" />
                                        </svg>
                                    </label>
                                    <input type="file" name="input_qr" id="input_qr" hidden onChange={setFileHandler} accept="image/*" />

                                    {isLoading && <img style={{ position: 'absolute', top: '0px', left: '0px', width: "100%", height: "100%", objectFit: 'cover' }} src={cameraGif} alt="adfa" loading="lazy" />}
                                </div>
                                {(error && step === 1) && <p className={styles.error} style={{ fontWeight: 600, color: "red", marginTop: ".5rem" }}>{t(error)}</p>}
                            </>
                        }



                        {
                            method === "code" &&
                            <div className={styles.code_cont}>
                                <h5>{t("Enter the Merchant Code")}</h5>

                                <div style={{ position: "relative", width: "100%" }}>
                                    <input value={walletInput} onChange={(e) => setWalletInput(e.target.value)} type="text" />

                                    <h5 style={{
                                        position: "absolute",
                                        top: "29%",
                                        left: "13px",
                                    }}>{t("#INSTAPAY-")}</h5>
                                </div>

                                <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                                        <img src={addU} alt="" loading="lazy" />
                                        <span>
                                            {t("Recipient Not on InstaPay?")}
                                        </span>
                                    </div>
                                    <button><p>{t("Invite them")}</p></button>
                                </div>
                                {error && <p className={styles.error} style={{ fontWeight: 600, color: "red" }}>{t(error)}</p>}
                            </div>
                        }
                    </>
                }

                {step === 2 &&
                    <div className={styles.merchantInfo}>
                        <div>
                            <h4>{t("Merchant Details")}</h4>
                            <p>{t("Please take a few moments to carefully verify the information to your payee details.")}</p>
                        </div>


                        <div className={styles.info}>
                            {walletDetails?.coverPicture &&
                                <div className={styles.banner}>
                                    <img src={walletDetails?.coverPicture} alt="" loading="lazy" />
                                </div>
                            }

                            <div className={styles.dets}>
                                <div className={styles.u_info}>
                                    {walletDetails?.profilePicture ? <img src={walletDetails?.profilePicture} loading="lazy" className={styles.pfp} alt="" /> : <div className={styles.pfp_placeHolder}>{walletDetails?.name?.split(' ')[0][0]?.toUpperCase()}{walletDetails?.name?.split(' ')[1][0]?.toUpperCase()}</div>}
                                    <h2>{walletDetails?.name}</h2>
                                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                        <p>@{walletDetails?.username}</p>
                                        <span>{t("Personal")} {t("Account")}</span>
                                    </div>

                                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                        <img style={{ width: "20px" }} src={getFileUrl(walletDetails.country)} loading="lazy" alt="" />
                                        <h6 style={{ fontSize: "10px", color: "#6C6C6C", fontWeight: 600 }}>{walletDetails?.country}</h6>
                                    </div>
                                </div>

                                <div className={styles.w_info}>
                                    <div>
                                        <p>{walletDetails?.wallet_id}</p>
                                        <span>{walletDetails?.currency?.code} {t("Wallet")}</span>
                                    </div>

                                    <img onClick={copyToClipboard} style={{ cursor: 'pointer' }} src={copy} alt="" />
                                </div>


                                <button className={styles.gradientBtn} disabled={disable} onClick={() => navigate(`/profile/${walletDetails?.username}`)}>
                                    {t("View Profile")}
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
                                    loading="lazy"
                                />
                                <p style={{
                                    width: "100%",
                                    textAlign: "center",
                                    fontSize: "20px",
                                    fontWeight: 700,
                                    color: "black",
                                    lineHeight: "26px"
                                }}>
                                    {t("You can now close this window and go back to chatbot.")}
                                </p>

                                <RedirectButton platform={platform} />
                            </div>
                        </div>
                    </div>
                }

                {step === 1 &&
                    <div style={{ background: `url(${adBG})`, backgroundSize: "cover", backgroundPosition: "left" }} className={styles.ad}>
                        <h2>{t("Advertisement Placeholder")}</h2>
                    </div>}

                {step !== 3 &&
                    <div className={styles.btns}>
                        {(method !== "qr" || step === 2) && <button disabled={disable} onClick={clickHandler} style={{ background: "#5926F0", color: "white" }}>{step === 1 ? "Verify" : "Next"}</button>}
                        {(step === 2 && step !== 3) &&
                            <button
                                onClick={() => {
                                    setWalletDetails({})
                                    setStep(prev => prev - 1)
                                    setError(null)
                                }} style={{ background: "white" }}>{t("Back")}</button>
                        }
                    </div>
                }

            </div>}

        </>
    );
}

export default QuickQrPay