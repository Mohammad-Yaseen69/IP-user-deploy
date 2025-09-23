import React, { useContext, useEffect, useState } from 'react'
import { Card, CardBody, Input, Modal, ModalBody, ModalHeader } from 'reactstrap'
import QrReader from 'react-qr-reader';
import invite from "./files/invite.png"
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { UserContext } from '../../Context/UserContext';
import { decryptData } from '../../Helper/EssentilaMethods/Decryption';
import InviteFriendModal from './InviteFriendModal';
import { useLocation } from 'react-router';

export const getConstraints = () => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    return {
        facingMode: isMobile ? 'environment' : 'user',
    };
};

const QRCodeScan = ({ setSubStep, dataHandler }) => {
    const [showQRModal, setShowQRModal] = useState(false)
    const [walletError, setWalletError] = useState("")
    const [isReady, setIsReady] = useState(false)
    const [result, setResult] = useState("");
    const { t } = useTranslation()
    const { authHeader, userDetails } = useContext(UserContext)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (result && result?.length === 8) {
            axios.get(`${import.meta.env.VITE_IP_DEV_API}/api/wallet/get-user-wallets/${result}`, {
                headers: authHeader
            })
                .then(res => {
                    const dec = decryptData(res.data.data)
                    const users = dec?.users?.filter(item => item?._id !== userDetails?._id)
                    dataHandler("beneficiary", users?.[0] ?? {})
                    if (users?.length > 0) {
                        const defaultWal = users?.[0]?.wallets?.find(it => it?.default) ?? users?.[0]?.wallets?.[0]
                        dataHandler("beneficiary_wallet", defaultWal ?? {})
                        setShowQRModal(false)
                        setWalletError("")
                        setIsReady(true)
                    }
                    else {
                        setWalletError("No Results")
                    }
                })
                .catch(err => {
                    console.log(err)
                    setShowQRModal(false)
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

        console.log(selectedFile, "Adadadasd")

        formData.append("file", selectedFile)

        setLoading(true)
        axios.post(`${import.meta.env.VITE_IP_DEV_API}/api/wallet/get-qr-details`,
            formData, {
            headers: authHeader
        })
            .then(res => {

                const decrypted = decryptData(res.data.data)
                // console.log(decrypted?.walletDetails?.wallet_id)
                setResult(decrypted?.walletDetails?.wallet_id)
                setWalletError("")
                setIsReady(true)
            })
            .catch(err => {
                console.log(err)
                const decrypted = decryptData(err.response.data.data)
                setShowQRModal(false)
                setWalletError("Invalid QR Code!")
                setIsReady(false)
            }).finally(() => {
                setLoading(false)
            })
    }

    const [isOpen, setIsOpen] = useState(false)
    const toggle = () => setIsOpen(!isOpen);

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
        <Card style={{
            height: "100%",
            marginBottom: 0,
            boxShadow: "none",
            height: "100%"
        }}>
            <Modal isOpen={showQRModal} toggle={() => setShowQRModal(!showQRModal)}>
                <ModalHeader toggle={() => setShowQRModal(!showQRModal)}>
                    {t("Scan/Upload QR Code of the Recipient")}
                </ModalHeader>
                <ModalBody>
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
                        style={{ width: '100%', height: '500px' }}
                    />
                    {result && (
                        <div>
                            <p>{t("QR Code Result")}: {result}</p>
                        </div>
                    )}
                </ModalBody>
            </Modal>
            <CardBody style={{
                display: "flex",
                flexDirection: "column",
                gap: "14px",
                borderRadius: "20px",
                padding: 0,
                width: "100%",
                height: "100%",
                justifyContent: "space-between"
            }}>
                <Card style={{
                    height: "fit-content",
                    marginBottom: 0,
                    boxShadow: "none",
                }}>
                    <CardBody style={{
                        background: "rgba(0,0,0,.03)",
                        padding: "14px",
                        borderRadius: "31px",
                        width: "100%"
                    }}>
                        <div style={{
                            flex: 1,
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            flexDirection: "column",
                            borderRadius: "17px",
                            border: "2px dashed #d6a30a",
                            background: "rgba(255, 217, 100, 0.10)",
                            cursor: "pointer"
                        }} className='qr_scan_toggler' onClick={() => setShowQRModal(true)}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40" fill="none">
                                <rect width="39.3622" height="39.3622" rx="9.49692" fill="#787878" fill-opacity="0.1" />
                                <path fill-rule="evenodd" clip-rule="evenodd" d="M26.7499 13.1001H29.1785C30.7218 13.1001 31.9729 14.3512 31.9729 15.8945V25.7588C31.9729 27.3021 30.7218 28.5532 29.1785 28.5532H11.396C9.85264 28.5532 8.60156 27.3021 8.60156 25.7588V15.8945C8.60156 14.3512 9.85264 13.1001 11.396 13.1001H13.8271L15.1811 11.0678C15.7007 10.3009 16.5665 9.84137 17.4928 9.84082H23.0816C24.008 9.84142 24.8738 10.301 25.3933 11.0678L26.7499 13.1001ZM13.9948 19.9744C13.9948 23.4496 16.812 26.2668 20.2872 26.2668C23.7607 26.2626 26.5755 23.4478 26.5797 19.9744C26.5797 16.4991 23.7625 13.6819 20.2872 13.6819C16.812 13.6819 13.9948 16.4991 13.9948 19.9744ZM28.7339 17.0352C28.7644 17.0368 28.795 17.0368 28.8255 17.0352C29.2807 17.0098 29.6294 16.6203 29.604 16.165C29.5787 15.7097 29.1892 15.3611 28.7339 15.3864H27.7177C27.2978 15.4098 26.9625 15.7451 26.9391 16.165C26.9139 16.6203 27.2624 17.0098 27.7177 17.0352H28.7339ZM16.8125 19.9739C16.8125 18.0391 18.3809 16.4707 20.3157 16.4707C22.2498 16.4721 23.8174 18.0397 23.8188 19.9739C23.8188 21.9086 22.2504 23.477 20.3157 23.477C18.3809 23.477 16.8125 21.9086 16.8125 19.9739Z" fill="black" />
                            </svg>
                            <span style={{
                                fontSize: "11px",
                                fontWeight: 600,
                                marginTop: "10px"
                            }}>
                                {t("Scan QR with Your Camera or Upload from Your Device.")}
                            </span>
                        </div>
                        <label aria-disabled htmlFor='input_qr' style={{
                            display: "flex",
                            width: "100%",
                            height: "30px",
                            padding: "6.434px 16.086px",
                            justifyContent: "center",
                            alignItems: "center",
                            gap: "16.086px",
                            flexShrink: "0",
                            borderRadius: "8.523px",
                            background: "#fff",
                            boxShadow: "0px 4.79236px 7.45752px -4.79236px rgba(89, 38, 240, 0.13)",
                            marginTop: "20px",
                            cursor: "pointer"
                        }}>
                            <span style={{
                                background: "linear-gradient(to right, #E64067, #5926F0, #4828A0)",
                                backgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                                WebkitBackgroundClip: "text",
                                fontSize: "11px",
                                fontWeight: 600
                            }}>
                                {loading ? t("Searching..") : t("Upload from Your Device.")}
                            </span>
                        </label>
                        <input disabled={loading} type="file" name="input_qr" id="input_qr" hidden onChange={setFileHandler} accept="image/*" />
                        <div className='qr_text_mt'>
                            <p style={{ fontSize: "12px", fontWeight: 600 }}>{t("Alternatively, Use the InstaPay AlphaNumeric QR Code.")}</p>
                            <Input type="text" placeholder={t('Enter InstaPay UPA')} style={{
                                borderRadius: "8.523px",
                                border: "1.065px solid #A0A0A0",
                                background: "#FFF",
                                padding: "11px 14px",
                                fontSize: "9px"
                            }} value={result} onChange={e => setResult(e.target.value.toUpperCase())} maxLength={8} />
                            {
                                walletError
                                &&
                                <span style={{
                                    margin: ".5rem",
                                    fontSize: ".6rem",
                                    fontWeight: "600",
                                    color: "red"
                                }}>{walletError}</span>
                            }
                        </div>
                    </CardBody>
                    <div style={{
                        display: "flex",
                        paddingLeft: "29px",
                        alignItems: "center",
                        gap: "1rem",
                        marginTop: "1.5rem",
                        marginBottom: "2rem"
                    }}>
                        <div style={{ display: "flex", alignItems: "center", gap: ".3rem" }}>
                            <img src={invite} alt="i" width={13} height={13} />
                            <span style={{
                                color: "#a6a6a6",
                                fontSize: "11px",
                                fontWeight: "600"
                            }}>{t("Recipient not on InstaPay?")}</span>
                        </div>
                        <button style={{
                            all: "unset",
                            padding: ".3rem 1rem",
                            fontSize: ".6rem",
                            background: "white",
                            borderRadius: "40px",
                            boxShadow: "0px 3.3496174812316895px 11.723660469055176px -3.3496174812316895px rgba(89, 38, 240, 0.25)",
                            cursor: "pointer"
                        }} onClick={toggle}>
                            <span style={{
                                background: "linear-gradient(277.06deg, #E64067 -9.52%, #5926F0 62.22%, #4828A0 119.38%), #D9D9D9",
                                backgroundClip: "text",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                                fontWeight: 500
                            }}>{t("Invite")}</span>
                        </button>
                        <InviteFriendModal isOpen={isOpen} toggle={toggle} />
                    </div>
                </Card>
                {/* <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-end",
                    gap: ".5rem",
                    flexWrap: "wrap",
                    paddingLeft: "1rem",
                    marginTop: "1rem"
                }}>
                    <a href="https://insta-pay.ch/faq" style={{ fontSize: ".7vw", display: "flex", alignItems: "center", gap: ".3rem", marginBottom: "0", color: "#2b2b2b" }}>
                        <HelpCircle size={12} />
                        <span>{t("Trouble Sending Money?")}</span>
                    </a>
                    <Button size="sm" style={{
                        border: "none",
                        outline: "none",
                        background: " linear-gradient(to right, rgba(0, 0, 0, 0.40) 0%, rgba(0, 0, 0, 0.40) 100%), linear-gradient(to left, #E64067 0%, #5926F0 55.65%, #4828A0",
                        backgroundBlendMode: "overlay, normal",
                        boxShadow: "0px 11.90068244934082px 8.655041694641113px -5.409400939941406px rgba(89, 38, 240, 0.17)",
                        borderRadius: "6px",
                        display: "flex",
                        alignItems: "center",
                    }}
                        className="i_t_button"
                        onClick={() => {
                            setSubStep(prev => prev + 1)
                        }}
                        disabled={!result || result?.length !== 8 || walletError || !isReady}
                    >
                        {t("Verify QR Code")} <ChevronRight size={20} />
                    </Button>
                </div> */}
            </CardBody>
        </Card>
    )
}

export default QRCodeScan