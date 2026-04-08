import React, { useContext, useEffect, useRef, useState } from "react";
import { Button, Card, CardBody, FormGroup, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";
// import QRCode from 'qrcode.react';
import { Check, Save } from "react-feather";
import StatusSwitch from "./StatusSwitch";
import styles from "./styles/GeneralContainer.module.scss";
import download from "./download.svg";
import edit from "./edit.svg"
import copy_icon from "./copy.png"
import ShareBtn from "../ShareBtn";
import { useTranslation } from "react-i18next";
import { encryptData } from "../../Helper/EssentilaMethods/Encryption";
import { decryptData } from "../../Helper/EssentilaMethods/Decryption";
import axios from "axios";
import InstructionsModal from "./InstructionModal";
import { DownloadQRHandler } from "../../Helper/DownloadQR";
import { UserContext } from "../../Context/UserContext";
import { Link } from "react-router-dom";
import { captureScreenShot, takeScreenshot } from "../../Helper/takeScreenshot";
import DownloadQR from "./DownloadQR";

const GeneralContainer = ({ currentWallet, currency, setCurrency, setWalletRefresh, authHeader, defaultWal, showTooltip, setShowTooltip }) => {
    const base_url = window.location.origin || 'https://my.insta-pay.ch';
    const LINK = `${base_url}/requests/general/${currency}`;
    const [generalQRactive, setGeneralQRactive] = useState(false);
    const [currentDefault, setCurrentDefault] = useState(false);
    const [showConfirmationModal, setShowConfirmationModal] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [titleEdit, setTitleEdit] = useState(false);
    const [descEdit, setDescEdit] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const titleRef = useRef(null);
    const descRef = useRef(null);
    const [copied, setCopied] = useState(false);
    const copyIconRef = useRef(null);
    const { t } = useTranslation()
    const { userWallets } = useContext(UserContext)


    useEffect(() => {
        setGeneralQRactive(currentWallet?.qrCode?.status === "true" ? true : false)
        setTitle(currentWallet?.qrCode?.title ?? "")
        setDescription(currentWallet?.qrCode?.description ?? "")
        setCurrentDefault(currentWallet?.default ? true : false)
    }, [currentWallet])

    const handleCopy = () => {
        const textField = document.createElement('textarea');
        textField.innerText = LINK;
        document.body.appendChild(textField);
        textField.select();
        document.execCommand('copy');
        textField.remove();

        setCopied(true);

        setTimeout(() => {
            setCopied(false);
        }, 4000);
    };

    const updateQr = (setter) => {
        const data = {
            title,
            description,
            status: `${!generalQRactive}`
        }

        const encrypted = encryptData(data)

        axios.post(`${import.meta.env.VITE_IP_DEV_API}/api/wallet/wallet-qrcode/${currentWallet?.wallet_id}`, {
            data: encrypted
        }, {
            headers: authHeader
        })
            .then(res => {
                const decrypted = decryptData(res.data.data)
                // console.log(decrypted)
                setWalletRefresh(prev => prev + 1)
                setTitleEdit(false)
                setDescEdit(false)
                setter(decrypted?.updated?.qrCode?.status == "false" ? false : true)
            })
            .catch(err => {
                const decrypted = decryptData(err.response.data.data)
                // console.log(decrypted)
            })
    }

    // const setActiveQrHandler = (setter) => {
    //     setIsSaving(true)
    //     axios.get(`${import.meta.env.VITE_IP_DEV_API}/api/wallet/set-to-default-wallet/${currentWallet?.wallet_id}`, {
    //         headers: authHeader
    //     })
    //         .then(res => {
    //             const decrypted = decryptData(res.data.data)
    //             setWalletRefresh(prev => prev + 1)
    //             setter(prev => !prev)
    //             // console.log(decrypted)
    //             setIsSaving(false)
    //             setShowConfirmationModal(false)
    //         })
    //         .catch(err => {
    //             const decrypted = decryptData(err.response.data.data)
    //             // console.log(decrypted)
    //             setIsSaving(false)
    //         })
    // }
    // const qrDefaultChange = (setter) => {
    //     if (defaultWal?.wallet_id === currentWallet?.wallet_id) {
    //         setActiveQrHandler(setter)
    //     } else {
    //         setShowConfirmationModal(true)
    //     }
    // }

    const switchStyle = {
        display: 'inline-block',
        width: '80px',
        height: '36px',
        backgroundColor: "#ededed",
        borderRadius: '100px',
        position: 'relative',
        cursor: 'pointer',
    };

    const thumbStyle = {
        width: '20px',
        height: '20px',
        backgroundColor: generalQRactive ? "#1fd531" : "#fd0d1b",
        borderRadius: '50%',
        position: 'absolute',
        top: '8px',
        left: generalQRactive ? '53px' : '7px',
        transition: 'left 0.2s'
    };

    const toggle = () => setShowTooltip(!showTooltip)

    const [showDownloadModal, setShowDownloadModal] = useState(false)

    return (
        <Card className={styles.main__container}>

            {/* download modal */}
            <DownloadQR
                isOpen={showDownloadModal}
                toggle={() => setShowDownloadModal(false)}
                qrCode={currentWallet?.qrCode?.url}
                wallet={currentWallet}
            />
            {/* confirmatoin modal */}
            {/* <Modal isOpen={showConfirmationModal} toggle={() => setShowConfirmationModal(!showConfirmationModal)}>
                <ModalHeader toggle={() => setShowConfirmationModal(!showConfirmationModal)}>
                    Confirmation
                </ModalHeader>
                <ModalBody>
                    You are setting {currentWallet?.currency?.code}  as default. Previosly {defaultWal?.currency?.code}  was default QR.
                </ModalBody>
                <ModalFooter>
                    <Button disabled={isSaving} onClick={() => setShowConfirmationModal(!showConfirmationModal)}
                        style={{
                            background: "linear-gradient(to right bottom, #e64067, #5926f0, #4828a0)",
                            border: "none",
                            outline: "none"
                        }}
                    >
                        Cancel
                    </Button>
                    <Button disabled={isSaving} onClick={() => setActiveQrHandler(setCurrentDefault)} color="primary"
                        style={{
                            background: "linear-gradient(to right bottom, #e64067, #5926f0, #4828a0)",
                            border: "none",
                            outline: "none"
                        }}
                    >
                        Continue
                    </Button>
                </ModalFooter>
            </Modal> */}
            <CardBody className={styles.main__body}>
                <Card className={styles.left__container}>
                    <CardBody className={styles.left__body}>
                        <div className={styles.lb_top}>
                            <Input type="select" value={currency} onChange={e => setCurrency(e.target.value)} className={styles.dropdown}>
                                {
                                    userWallets?.filter(item => item?.wallet_type === "insta" && item?.status && !item?.blocked && !item?.admin_blocked && !item?.blocker)?.map(item => (
                                        <option value={item?.currency?.code} style={{ fontSize: "1rem", fontWeight: 900, display: currency === item?.currency?.code ? "none" : "inherit" }}>
                                            {item?.currency?.code}
                                        </option>
                                    ))
                                }
                            </Input>
                            {/* <div className={styles.lbt_b}>
                                <span>Default: </span>
                                <div style={switchStyle} onClick={() => {
                                    qrDefaultChange(setCurrentDefault)
                                }}>
                                    <div style={statusThumbStyle}></div>
                                </div>
                            </div> */}
                        </div>
                        <h5 style={{ marginBottom: 0 }}>{currency} {t("Wallet QR")}</h5>
                        <div className={styles.qr__container}>
                            <div className={styles.qr__bg} style={{ position: "relative" }} onClick={toggle}>
                                <img src={currentWallet?.qrCode?.url} alt="abc" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                                <InstructionsModal isOpen={showTooltip} toggle={toggle} />
                            </div>
                            {/* <a href={currentWallet?.qrCode?.url} > */}
                            <Button onClick={() => setShowDownloadModal(true)} className={styles.download__btn}>
                                {/* <Download size={20} />  */}
                                <img src={download} alt="d" width={".6vw"} />
                                {t("Download QR")}
                            </Button>
                            {/* </a> */}
                        </div>
                        <div className={styles.switch__container}>
                            {t("QR Code Status")}

                            <div style={switchStyle} onClick={() => {
                                updateQr(setGeneralQRactive)
                            }}>
                                <div style={thumbStyle}></div>
                            </div>
                        </div>
                    </CardBody>
                </Card>
                <Card className={styles.right__container}>
                    <CardBody className={styles.right__body}>
                        <h5>{t("Share your QR Code or payment address link to instantly receive payments in your InstaPay wallet.")}</h5>
                        <FormGroup className={styles.form__group} style={{ marginTop: "1rem" }}>
                            <Label>{t("QR Code Title")}</Label>
                            <div className={styles.input__container}>
                                <Input placeholder="Enter The TItle" value={title} readOnly={!titleEdit} onChange={e => setTitle(e.target.value)} ref={titleRef} />
                                {titleEdit ? (
                                    <Save
                                        className={styles.icon}
                                        onClick={() => {
                                            updateQr()
                                            if (!titleEdit) {
                                                titleRef.current?.blur();
                                            }
                                        }}
                                    />
                                ) : (
                                    <img src={edit} alt="" className={styles.icon} width={20}
                                        onClick={() => {
                                            setTitleEdit(true)
                                            if (titleEdit) {
                                                titleRef.current?.focus();
                                            }
                                        }}
                                    />
                                )}
                            </div>
                        </FormGroup>
                        <FormGroup className={styles.form__group}>
                            <Label>{t("Description")}</Label>
                            <div className={styles.input__container}>
                                <Input
                                    type="textarea"
                                    placeholder="Enter The Description"
                                    value={description}
                                    readOnly={!descEdit}
                                    onChange={e => setDescription(e.target.value)}
                                    ref={descRef}
                                />
                                {descEdit ? (
                                    <Save
                                        className={styles.icon}
                                        onClick={() => {
                                            updateQr()
                                            if (!descEdit) {
                                                descRef.current?.blur();
                                            }
                                        }}
                                    />
                                ) : (
                                    <img src={edit} alt="" className={styles.icon} width={20}
                                        onClick={() => {
                                            setDescEdit(true);
                                            if (descEdit) {
                                                descRef.current?.focus();
                                            }
                                        }}
                                    />
                                )}
                            </div>
                        </FormGroup>
                        {/* <div>
                            <p>{t("Share your InstaPay unique payment link")}</p>
                            <div className={styles.link__container}>
                                <p>{LINK}</p>
                                {
                                    copied
                                        ?
                                        <Check />
                                        :
                                        // <Copy className={`${styles.copy}`} onClick={handleCopy} ref={copyIconRef} />
                                        <img src={copy_icon} alt="c" style={{ height: "24px", width: "24px", objectFit: "contain" }} onClick={handleCopy} ref={copyIconRef} />
                                }
                            </div>
                        </div> */}
                        <div className={styles.buttons}>
                            <button><Link to={"/wallets"} style={{ color: "black" }}>{t("View Transactions")}</Link></button>
                            <ShareBtn link={LINK} bg="#ececec" />
                        </div>
                    </CardBody>
                </Card>
            </CardBody>
        </Card>
    );
};

export default GeneralContainer;