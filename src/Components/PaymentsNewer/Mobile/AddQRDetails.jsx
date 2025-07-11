import React, { useContext, useEffect, useState } from 'react'
import QrReader from "react-qr-reader";
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { UserContext } from '../../../Context/UserContext';
import { decryptData } from '../../../Helper/EssentilaMethods/Decryption';
import styles from "./styles/aqd.module.css"
import { useLocation } from 'react-router';
import InviteFriendModal from '../InviteFriendModal';
import addU from "../../QuickQrPay/files/add-user.png"

const AddQRDetails = ({ setSubStep, dataHandler, sendPaymentType }) => {
    const [walletError, setWalletError] = useState("")
    const [isReady, setIsReady] = useState(false)
    const [result, setResult] = useState("");
    const { t } = useTranslation()
    const { authHeader, userDetails } = useContext(UserContext)
    const [isOpen, setIsOpen] = useState(false)
    const [method, setMethod] = useState()


    useEffect(() => {
        if (sendPaymentType === "qr_pay") {
            setMethod("qr")
        }
    }, [sendPaymentType])
    useEffect(() => {
        if (result && result?.length === 8) {
            axios.get(`${process.env.REACT_APP_IP_DEV_API}/api/wallet/get-user-wallets/${result}`, {
                headers: authHeader
            })
                .then(res => {
                    const dec = decryptData(res.data.data)
                    console.log(dec)
                    const users = dec?.users?.filter(item => item?._id !== userDetails?._id)
                    dataHandler("beneficiary", users?.[0] ?? {})
                    setMethod("code")
                    if (users?.length > 0) {
                        const defaultWal = users?.[0]?.wallets?.find(it => it?.default) ?? users?.[0]?.wallets?.[0]
                        dataHandler("beneficiary_wallet", defaultWal ?? {})
                        setWalletError("")
                        setIsReady(true)
                    }
                    else {
                        setWalletError("No Results")
                    }
                })
                .catch(err => {
                    console.log(err)
                    setWalletError("Invalid Wallet ID!")
                    setIsReady(false)
                })
        } else {
            dataHandler("beneficiary", {})
            dataHandler("beneficiary_wallet", {})
            setWalletError("")
            setIsReady(false)
        }
    }, [result])
    const setFileHandler = (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile?.type?.toLowerCase()?.includes("image")) {
            setWalletError("Only images are allowed.")
            return
        }
        const formData = new FormData()

        formData.append("file", selectedFile)

        axios.post(`${process.env.REACT_APP_IP_DEV_API}/api/wallet/get-qr-details`,
            formData, {
            headers: authHeader
        })
            .then(res => {

                const decrypted = decryptData(res.data.data)
                setMethod("code")
                setResult(decrypted?.walletDetails?.wallet_id)
                setWalletError("")
                setIsReady(true)
            })
            .catch(err => {
                console.log(err)
                setWalletError("Invalid QR Code!")
                setIsReady(false)
            })
    }
    const location = useLocation()
    const queryParams = new URLSearchParams(location.search)
    const wallet_id = queryParams.get("wallet_id")

    useEffect(() => {
        if (wallet_id) {
            setResult(wallet_id)
        }
    }, [wallet_id])

    useEffect(() => {
        if (isReady) {
            setSubStep(prev => prev + 1)
        }
    }, [wallet_id, isReady])
    return (
        <div className={styles.container}>
            <div className={styles.method_selection}>
                <div style={{ background: method === "qr" && "#5926F0", width: "38%" }} onClick={() => setMethod("qr")} className={styles.tab}>
                    <span style={{ color: method === "qr" && "#FFF" }}>Scan Qr</span>
                </div>

                <div style={{ background: method === "code" && "#5926F0", width: "62%" }} onClick={() => setMethod("code")} className={styles.tab}>
                    <span style={{ color: method === "code" && "#FFF", }}>Enter Merchant Code</span>
                </div>
            </div>

            {method === "qr" && (
                <div className={styles.qr_cont}>
                    <QrReader
                        onScan={async (result) => {
                            if (result) {
                                const splitted = result.split("://")
                                const wallet_id = splitted[1].split("/")[2]
                                setResult(wallet_id)
                            }
                        }}
                        onError={(error) => console.error(error)}
                        delay={1000}
                        showViewFinder={false}
                        constraints={{
                            facingMode: "environment"  // This forces the back camera
                        }}
                        facingMode={{ facingMode: "environment" }}
                    />
                    <label htmlFor="input_qr">
                        <div className={styles.mobileBtn}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="25" height="26" viewBox="0 0 25 26" fill="none">
                                <path d="M21.5867 20.4045V6.13452C21.5867 5.01331 20.6693 4.09595 19.5481 4.09595H5.27809C4.15688 4.09595 3.23952 5.01331 3.23952 6.13452V20.4045C3.23952 21.5258 4.15688 22.4431 5.27809 22.4431H19.5481C20.6693 22.4431 21.5867 21.5258 21.5867 20.4045ZM9.25331 15.2877L11.3938 17.8665L14.5536 13.7996C14.7575 13.5345 15.1652 13.5345 15.369 13.8098L18.9467 18.58C19.0035 18.6557 19.0381 18.7458 19.0466 18.84C19.0551 18.9343 19.0372 19.0291 18.9949 19.1137C18.9525 19.1984 18.8875 19.2696 18.8069 19.3193C18.7264 19.3691 18.6337 19.3954 18.539 19.3954H6.31776C5.88966 19.3954 5.65523 18.9062 5.92024 18.5698L8.45827 15.3081C8.65193 15.0431 9.03926 15.0329 9.25331 15.2877Z" fill="#404040" />
                            </svg>
                        </div>
                    </label>
                    <input type="file" name="input_qr" id="input_qr" hidden onChange={setFileHandler} accept="image/*" />
                </div>
            )}

            {method === "code" && (
                <div className={styles.code_cont}>
                    <h5 style={{ width: "100%" }}>Enter the Merchant Code</h5>

                    <div style={{ position: "relative", width: "100%" }}>
                        <input value={result} onChange={(e) => setResult(e.target.value.toUpperCase())} type="text" maxLength={8} />
                        <h5 style={{
                            position: "absolute",
                            top: "29%",
                            left: "13px",
                            width: "fit-content"
                        }}>#INSTAPAY-</h5>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                            <img src={addU} alt="" />
                            <h6>
                                Recipient Not on InstaPay?
                            </h6>
                        </div>
                        <button onClick={() => setIsOpen(false)}><p>Invite them</p></button>
                    </div>
                    {walletError && <p className={styles.error} style={{ fontWeight: 600, color: "red" }}>{walletError}</p>}
                </div>
            )}

            <InviteFriendModal
                isOpen={isOpen}
                toggle={() => setIsOpen(false)}
            />
        </div>
    )
}

export default AddQRDetails