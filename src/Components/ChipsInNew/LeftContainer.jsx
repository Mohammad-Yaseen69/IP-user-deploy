import { Button, Input, Label } from "reactstrap"
import styles from "./styles/LeftContainer.module.css"
import download from "./download.svg"
import { useTranslation } from "react-i18next"
import axios from "axios"
import { encryptData } from "../../Helper/EssentilaMethods/Encryption"
import { decryptData } from "../../Helper/EssentilaMethods/Decryption"
import { useContext, useEffect, useState } from "react"
import { UserContext } from "../../Context/UserContext"
import DownloadQR from "./DownloadQR"
import { toast } from "react-toastify"
import s from "../PaymentsNewer/files/PaymentsNewFiles/share.png"
import vt from "./files/view_transactions.svg"
import { useNavigate } from "react-router"
import SocialModal from "../ShareBtn/SocialModal"
import copy from "./copy.png"
import InstructionsModal from "./InstructionModal"

const LeftContainer = ({ currentWallet, currency, setCurrency, setWalletRefresh, authHeader, defaultWal, showTooltip, setShowTooltip, setCurrentWallet }) => {
    const BASE_URL = window.location.origin || "https://my.insta-pay.ch";
    const { t } = useTranslation()
    const navigate = useNavigate()
    const [generalQRactive, setGeneralQRactive] = useState(false);
    const [titleEdit, setTitleEdit] = useState(false);
    const [descEdit, setDescEdit] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const { userWallets } = useContext(UserContext)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        setGeneralQRactive(currentWallet?.qrCode?.status === "true" ? true : false)
        setTitle(currentWallet?.qrCode?.title ?? "")
        setDescription(currentWallet?.qrCode?.description ?? "")
    }, [currentWallet])

    const updateQr = (setter, type) => {
        setSaving(true)
    
        const data = {
            title,
            description,
            status: `${!generalQRactive}`,
            wallet_id: currentWallet?.wallet_id
        }
        const encrypted = encryptData(data)

        axios.post(`${import.meta.env.VITE_IP_DEV_API}/api/wallet/update-qr-details`, {
            data: encrypted
        }, {
            headers: authHeader
        })
            .then(res => {
                const decrypted = decryptData(res.data.data)
                type(false)
                setCurrentWallet(currentWallet)
                setter(decrypted?.walletDetails?.qrCode?.status === "false" ? false : true)
                console.log(generalQRactive)
            })
            .catch(err => {
                const decrypted = decryptData(err.response.data.data)
                console.log(decrypted)
            })
            .finally(() => {
                setSaving(false)
            })
    }

    const [showDownloadModal, setShowDownloadModal] = useState(false)
    const [showShareModal, setShowShareModal] = useState(false)

    const copyHandler = () => {
        navigator.clipboard.writeText(`${BASE_URL}/q/${currentWallet?.wallet_id}`)
        toast.success("Address Copied Successfully!")
    }

    return (
        <div className={styles.container}>
            <InstructionsModal isOpen={showTooltip} toggle={() => setShowTooltip(!showTooltip)} />
            <DownloadQR
                isOpen={showDownloadModal}
                toggle={() => setShowDownloadModal(false)}
                qrCode={currentWallet?.qrCode?.url}
                wallet={currentWallet}
            />
            <div className={styles.top}>
                <div className={styles.top_layer}>
                    <div className={styles.left}>
                        <Input type="select" value={currency} onChange={e => {
                            setCurrency(e.target.value)
                            const wallet = userWallets?.find(item => item?.currency?.code === e.target.value)
                            setCurrentWallet(wallet)
                        }} className={styles.dropdown}>
                            {
                                userWallets?.filter(item => item?.wallet_type === "insta" && item?.status && !item?.blocked && !item?.admin_blocked && !item?.blocker)?.map(item => (
                                    <option value={item?.currency?.code} style={{ fontSize: "1rem", fontWeight: 900, display: currency === item?.currency?.code ? "none" : "inherit" }}>
                                        {item?.currency?.code}  ({item?.currency?.code} )
                                    </option>
                                ))
                            }
                        </Input>
                        <h5 style={{ marginBottom: 0 }}>{currency} {t("Wallet QR")}</h5>
                        <p style={{ marginTop: ".5rem", marginBottom: 0 }}>{currentWallet?.qrCode?.description ?? ""}</p>
                        <div className={styles.tl_bot}>
                            <Button color="primary" onClick={() => setShowDownloadModal(true)}>
                                <img src={download} alt="" />
                                <span>{t("Download QR")}</span>
                            </Button>
                            <div className={styles.qr_status}>
                                <span>{t("QR Code Status")}</span>
                                <div
                                    className={`${styles.switch} ${generalQRactive ? styles.disabled : ""}`}
                                    onClick={(e) => {
                                        updateQr(setGeneralQRactive)
                                    }}>
                                    <div className={`${styles.thumb} ${generalQRactive ? styles.active : ""}`}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className={styles.right}>
                        <img src={currentWallet?.qrCode?.url} alt={currentWallet?.wallet_id} />
                    </div>
                </div>
            </div>

            <div className={styles.bottom}>
                <div className={styles.b_left}>
                    <h5>{t("Share your QR Code or pay link to instantly get paid in your insta wallet.")}</h5>
                    <div className={styles.inp_con}>
                        <div className={styles.ic_top}>
                            <Label>{t("QR Code Title")}</Label>
                            <button disabled={saving || (titleEdit && !title)} onClick={() => {
                                if (titleEdit) {
                                    updateQr(undefined, setTitleEdit)
                                } else {
                                    setTitleEdit(true)
                                }
                            }}>
                                <span>{!titleEdit ? t("Edit") : t("Save")}</span>
                            </button>
                        </div>
                        <Input value={title} onChange={(e) => setTitle(e.target.value)} type="text" placeholder={"QR Code Title"} disabled={!titleEdit} />
                    </div>
                    <div className={styles.inp_con}>
                        <div className={styles.ic_top}>
                            <Label>{t("Description")}</Label>
                            <button disabled={saving || (descEdit && !description)} onClick={() => {
                                if (descEdit) {
                                    updateQr(undefined, setDescEdit)
                                } else {
                                    setDescEdit(true)
                                }
                            }}>
                                <span>{!descEdit ? t("Edit") : t("Save")}</span>
                            </button>
                        </div>
                        <Input value={description} onChange={(e) => setDescription(e.target.value)} type="textarea" placeholder={"Description"} disabled={!descEdit} />
                    </div>
                </div>
                <div className={styles.b_right}>
                    <div className={styles.br_top}>
                        <Label>{t("Share your Insta-Pay unique payment link")}</Label>
                        <div className={styles.link}>
                            <span>{BASE_URL}/q/{currentWallet?.wallet_id}</span>
                            <img alt="" src={copy} onClick={copyHandler} />
                        </div>
                    </div>
                    <div className={styles.bt_bot}>
                        <button onClick={() => navigate("/wallets")}>
                            <img src={vt} alt="" />
                            <span>{t("View Transactions")}</span>
                        </button>
                        <button onClick={() => setShowShareModal(true)}>
                            <img src={s} alt="" />
                            <span>{t("Share")}</span>
                        </button>
                    </div>
                    <SocialModal isOpen={showShareModal} link={currentWallet?.wallet_id} toggle={() => setShowShareModal(!showShareModal)} />
                </div>
            </div>
        </div>
    )
}

export default LeftContainer