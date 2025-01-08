import React, { useContext, useEffect, useState } from 'react'
import { Button, Card, CardBody, FormGroup, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader, Tooltip } from 'reactstrap'
import styles from "./styles/AmountAndCurrency.module.scss"
import { UserContext } from '../../Context/UserContext'
import { useTranslation } from 'react-i18next'
import { ChevronRight, HelpCircle, Plus, Trash2 } from 'react-feather'
import ImagePreviewModal from '../ImagePreviewModal.jsx'
import { FaRegFileVideo, FaRegFilePdf } from "react-icons/fa";
import { formatCurrency } from '../../Helper/AmountFormat.js'

let timeout;

const QuotationDetails = ({ amount, currency, setAmount, setCurrency, title, setTitle, description, setDescription, files, setFiles, bargainable, setBargainable, type, setSubStep }) => {
    const { userWallets } = useContext(UserContext)
    const { t } = useTranslation()
    const [currentImage, setCurrentImage] = useState({
        src: "",
        index: ""
    })
    const [currentItem, setCurrentItem] = useState("")
    const [showPreview, setShowPreview] = useState(false)
    const [showDelModal, setShowDelModal] = useState(false)

    useEffect(() => {
        setCurrency(userWallets?.filter(item => item?.wallet_type === "insta" && !item?.blocked && !item?.admin_blocked && !item?.blocked && !item?.admin_blocked && item?.status === "active")?.[0]?.currency?.code)
    }, [userWallets])

    // useEffect(() => {
    //     const formatAmount = () => {
    //         let value = amount
    //         if (String(value).includes(".") && !String(value).endsWith(".") && String(value).split(".")?.[1]?.length === 2) {
    //             return
    //         } else {
    //             if (!String(value).includes(".")) {
    //                 value = `${value}.00`
    //             }
    //             if (String(value).endsWith(".")) {
    //                 value = `${value}00`
    //             }
    //             if (String(value).split(".")?.[1]?.length === 1) {
    //                 value = `${value}0`
    //             }
    //             setAmount(value)
    //         }
    //     }

    //     if (timeout) {
    //         clearTimeout(timeout)
    //     }

    //     timeout = setTimeout(() => {
    //         formatAmount()
    //     }, 2000)

    //     return () => clearTimeout(timeout)
    // }, [amount])

    const [formattedAmount, setFormattedAmount] = useState("1.00")
    const handleKeyUp = (e) => {
        formatCurrency(e.target.value, false, setFormattedAmount);
    };

    const handleBlur = (e) => {
        formatCurrency(e.target.value, true, setFormattedAmount);
    };

    useEffect(() => {
        setAmount(formattedAmount?.replaceAll(",", ""))
    }, [formattedAmount])

    return (
        <Card style={{
            height: "100%",
            marginBottom: 0,
            boxShadow: "none",
            height: "100%"
        }}>
            <CardBody style={{
                paddingBottom: "0",
                display: "flex",
                flexDirection: "column",
                gap: "14px",
                borderRadius: "20px",
                padding: "14px",
                background: "rgba(0,0,0,.03)",
                paddingBottom: 0,
                boxShadow: "0px 18px 15.348464965820312px -15px rgba(89, 38, 240, 0.16)"
            }}>
                <h5>{t("Enter the amount")}</h5>
                <div style={{
                    background: "linear-gradient(to bottom right, #EC2AB6 0%, #5926F0 100%)",
                    border: "0.5px solid rgba(0, 0, 0, 0.08)",
                    boxShadow: "0px 4.456576347351074px 132.58314514160156px 0px rgba(0, 0, 0, 0.11)",
                    borderRadius: "24px",
                    padding: "12px",
                    display: "flex",
                    alignItems: "center"
                }}>
                    <h4 style={{ marginBottom: 0, color: "white", fontSize: "1.3rem", fontWeight: 400, transform: "translate(15px, 5px)" }}>
                        {userWallets?.find(i => i?.currency?.code === currency)?.currency?.code}
                    </h4>
                    <input
                        type="text"
                        value={formattedAmount}
                        maxLength={12}
                        onChange={(e) => setFormattedAmount(e.target.value)}
                        onKeyUp={handleKeyUp}
                        onBlur={handleBlur} maxLength={12}
                        placeholder="10.00"
                        data-type="currency"
                        style={{
                            width: "100%",
                            border: "none",
                            flex: 1,
                            background: "transparent",
                            color: "white",
                            fontSize: "2.5rem",
                            paddingLeft: "1.6rem",
                            outline: "none"
                        }}
                        className={`i_t_amount ${styles.input}`}
                    />
                    {/* <Input
                        type="number"
                        placeholder="Amount"
                        value={amount}
                        onChange={(e) => {
                            setAmount(e.target.value)
                        }}
                        style={{
                            width: "100%",
                            border: "none",
                            flex: 1,
                            background: "transparent",
                            color: "white",
                            fontSize: "2.5rem",
                            paddingLeft: "1.6rem"
                        }}
                        className={`i_t_amount ${styles.input}`}
                    /> */}
                    <Input type="select" style={{
                        borderRadius: "100px",
                        padding: ".3rem .2rem .2rem .6rem",
                        fontSize: ".7rem",
                        appearance: "none",
                        WebkitAppearance: "none",
                        MozAppearance: "none",
                        width: "60px",
                        border: "none",
                        outline: "none"

                    }} value={currency} onChange={(e) => setCurrency(e.target.value)}>
                        {
                            userWallets?.filter(item => item?.wallet_type === "insta" && !item?.blocked && !item?.admin_blocked && !item?.blocked && !item?.admin_blocked && item?.status === "active")?.map(item => (
                                <option value={item.currency?.code} key={item._id}>{item.currency?.code} </option>
                            ))
                        }
                    </Input>
                </div>
                <Input value={title} onChange={e => setTitle(e.target.value)} placeholder={t('Enter the Title for Your Quotation.')} />
                <Input value={description} onChange={e => setDescription(e.target.value)} type='textarea' placeholder={t('Enter the Description for Your Quotation')} style={{
                    resize: "none",
                    height: "100%"
                }} />
                <div style={{ display: "flex", flexDirection: "column" }}>
                    <Label>{t("Attachments")}: </Label>
                    <div style={{ display: "flex", gap: "1rem", overflowX: "auto", background: "white", borderRadius: "10px", padding: "10px", minHeight: "75px", overflowY: "hidden" }}>
                        {files.length < 5 && (
                            <Label htmlFor='files' style={{ height: "50px", width: "50px", borderRadius: "5px", boxShadow: "0 0 3px #1111113e", display: "flex", justifyContent: "center", alignItems: "center", cursor: "pointer" }}>
                                <Plus />
                                <input
                                    id='files'
                                    hidden
                                    multiple={false}
                                    type='file'
                                    onChange={(e) => {
                                        const file = e.target?.files?.[0];
                                        if (file) {
                                            setFiles((prevFiles) => [...prevFiles, file]);
                                        }
                                    }}
                                />
                            </Label>
                        )}
                        {files.map((file, index) => {
                            const previewURL = URL.createObjectURL(file);
                            // console.log(file.type)
                            return (
                                <div title={file?.name} style={{ height: '50px', width: '50px', borderRadius: '5px', boxShadow: '0 0 3px #1111113e', position: "relative", overflow: "hidden" }}>
                                    {
                                        file?.type?.toLowerCase()?.includes("image")
                                        &&
                                        <img
                                            key={previewURL}
                                            src={previewURL}
                                            alt='img'
                                            style={{ height: "100%", width: "100%", objectFit: "cover" }}
                                            onClick={() => {
                                                setCurrentImage({ src: previewURL, index })
                                                setShowPreview(true)
                                            }}
                                        />
                                    }
                                    {
                                        file?.type?.toLowerCase()?.includes("video")
                                        &&
                                        <div style={{
                                            background: "linear-gradient(to right, rgba(0, 0, 0, 0.40) 0%, rgba(0, 0, 0, 0.40) 100%), linear-gradient(to left, #E64067 0%, #5926F0 55.65%, #4828A0",
                                            height: "100%",
                                            width: "100%",
                                            display: "flex",
                                            justifyContent: "center",
                                            alignItems: "center"
                                        }}>
                                            <FaRegFileVideo size={30} color='white' />
                                        </div>
                                    }
                                    {
                                        file?.type?.toLowerCase()?.includes("application/pdf")
                                        &&
                                        <div style={{
                                            background: "linear-gradient(to right, rgba(0, 0, 0, 0.40) 0%, rgba(0, 0, 0, 0.40) 100%), linear-gradient(to left, #E64067 0%, #5926F0 55.65%, #4828A0",
                                            height: "100%",
                                            width: "100%",
                                            display: "flex",
                                            justifyContent: "center",
                                            alignItems: "center"
                                        }}>
                                            <FaRegFilePdf size={30} color='white' />
                                        </div>
                                    }
                                    <div style={{
                                        height: "19px",
                                        width: "19px",
                                        background: "#ff00003e",
                                        borderRadius: "2px",
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        position: "absolute",
                                        top: "2px",
                                        right: "2px",
                                        cursor: "pointer"
                                    }}>
                                        <Trash2 color='red' size={14} onClick={() => {
                                            setCurrentItem(index)
                                            setShowDelModal(true)
                                        }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
                {/* remove img modal */}
                <ImagePreviewModal isOpen={showPreview} toggle={() => setShowPreview(!showPreview)} currentImage={currentImage} />

                {/* remove file modal */}
                <Modal isOpen={showDelModal} toggle={() => setShowDelModal(!showDelModal)}>
                    <ModalHeader toggle={() => setShowDelModal(!showDelModal)}>Confirm Removing File</ModalHeader>
                    <ModalBody>Are you sure, you want to remove this file?</ModalBody>
                    <ModalFooter>
                        <Button style={{
                            background: "linear-gradient(to right, rgba(0, 0, 0, 0.40) 0%, rgba(0, 0, 0, 0.40) 100%), linear-gradient(to left, #E64067 0%, #5926F0 55.65%, #4828A0",
                            border: "none",
                            outline: "none",
                        }} onClick={() => {
                            const filtered = files.filter((_, i) => i !== currentItem)
                            setFiles(filtered)
                            setShowDelModal(false)
                        }}>Remove</Button>
                    </ModalFooter>
                </Modal>



                <Label htmlFor='check' style={{ display: "flex", alignItems: "center", gap: ".75rem", fontSize: ".8rem", fontWeight: 600 }}>
                    <Input type='checkbox' id='check' checked={bargainable} onChange={e => setBargainable(e.target.checked)} />
                    <span>{t("Allow Receiver to Bargain")}</span>
                </Label>
            </CardBody>
            <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-end",
                gap: ".5rem",
                flexWrap: "wrap",
                paddingLeft: "1rem",
                marginTop: "1rem"
            }}>
                <p style={{ fontSize: ".7vw", display: "flex", alignItems: "center", gap: ".3rem", marginBottom: "0" }} onClick={() => window.open("https://insta-pay.ch/faq")}>
                    <HelpCircle size={12} />
                    <span>{t(`Trouble ${type} Money?`)}</span>
                </p>
                <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: ".7rem" }}>
                    <button style={{ all: "unset", cursor: "pointer" }} onClick={() => setSubStep(prev => prev - 1)}>Back</button>
                    <Button
                        size="sm"
                        style={{
                            border: "none",
                            outline: "none",
                            background: "linear-gradient(to right, rgba(0, 0, 0, 0.40) 0%, rgba(0, 0, 0, 0.40) 100%), linear-gradient(to left, #E64067 0%, #5926F0 55.65%, #4828A0",
                            backgroundBlendMode: "overlay, normal",
                            boxShadow: "0px 11.90068244934082px 8.655041694641113px -5.409400939941406px rgba(89, 38, 240, 0.17)",
                            borderRadius: "6px",
                            display: "flex",
                            alignItems: "center",
                        }}
                        className="i_t_button"
                        disabled={!amount || !currency || !title || !description}
                        onClick={() => setSubStep(prev => prev + 1)}
                    >
                        <span>{t("Confirm")}</span>
                        <ChevronRight size={20} />
                    </Button>
                </div>
            </div>
        </Card>
    )
}

export default QuotationDetails