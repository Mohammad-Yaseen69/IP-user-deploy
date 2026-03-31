import React, { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, FormGroup, Label, Input } from 'reactstrap';
import styles from "../AuthNew/styles/index.module.css"
import PhoneInput from '../PhoneInput';
import { UserContext } from '../../Context/UserContext';
import axios from 'axios';
import { encryptData } from '../../Helper/EssentilaMethods/Encryption';
import { decryptData } from '../../Helper/EssentilaMethods/Decryption';
import { toast } from 'react-toastify';
import { CheckCircle } from 'react-feather';
import { service_name_formatter } from '../TransactionsNewApi/TransactionItem';

const InviteFriendModal = ({ isOpen, toggle }) => {
    const { t } = useTranslation()
    const { userDetails, authHeader } = useContext(UserContext)
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState("")
    const [loginMethod, setLoginMethod] = useState("")
    const [laoding, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)

    const handleInvite = async () => {
        setLoading(true)
        try {
            const data = {
                [loginMethod]: email,
                message
            }
            const enc = encryptData(data)
            const res = await axios.post(`${import.meta.env.VITE_IP_DEV_API}/api/invitation/invite-user/${userDetails?._id}/${loginMethod}`, {
                data: enc
            }, {
                headers: authHeader
            })
            const dec = decryptData(res.data.data)
            setSuccess(true)
        } catch (error) {
            const dec = decryptData(error?.response?.data?.data)
            toast.error(dec?.message)
        } finally {
            setLoading(false)
        }
    };

    const [step, setStep] = useState(1)
    return (
        <Modal isOpen={isOpen} toggle={toggle}>
            <ModalHeader toggle={toggle}>{t("Invite Friend")}</ModalHeader>
            <ModalBody>
                {
                    success
                        ?
                        <div style={{ textAlign: "center" }}>
                            <CheckCircle size={60} color='green' />
                            <h4 className='mb-4'>{t("Invited Succesfully!")}</h4>
                            <p>{t("Invitation Message Has Been Successfully Sent To")} {email}</p>
                        </div>
                        :
                        <>
                            {
                                step === 1
                                &&
                                <div style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "1rem"
                                }}>
                                    <div
                                        onClick={() => setLoginMethod("phone")}
                                        style={{
                                            padding: ".75rem 1rem",
                                            boxShadow: "0 0 3px #3333332e",
                                            borderRadius: "10px",
                                            fontSize: "1rem",
                                            fontWeight: 700,
                                            background: loginMethod === "phone" ? "#5926f0" : "#fff",
                                            color: loginMethod === "phone" ? "white" : "black",
                                            cursor: "pointer"
                                        }}
                                    >{t("Invite via Phone Number")}</div>
                                    <div
                                        onClick={() => setLoginMethod("email")}
                                        style={{
                                            padding: ".75rem 1rem",
                                            boxShadow: "0 0 3px #3333332e",
                                            borderRadius: "10px",
                                            fontSize: "1rem",
                                            fontWeight: 700,
                                            background: loginMethod === "email" ? "#5926f0" : "#fff",
                                            color: loginMethod === "email" ? "white" : "black",
                                            cursor: "pointer"
                                        }}
                                    >{t("Invite via Email Address")}</div>
                                </div>
                            }
                            {
                                step === 2
                                &&
                                <>
                                    <div className={styles.input_container}>
                                        <label>{loginMethod === "phone" ? t("Phone Number") : t("Email")}</label>
                                        {
                                            loginMethod === "phone"
                                                ?
                                                <PhoneInput
                                                    setPhone={setEmail}
                                                    country={userDetails?.country_iso_code}
                                                />
                                                :
                                                <input type="email" placeholder="eg: john@doe.org" value={email} onChange={e => setEmail(e.target.value?.toLowerCase())} autoComplete="on" name="email" />
                                        }
                                        <div style={{ cursor: "pointer", fontSize: ".8rem", fontWeight: 900, color: "#5926f0" }}
                                            onClick={() => {
                                                setLoginMethod(loginMethod === "email" ? "phone" : "email")
                                                localStorage.setItem("loginWith", loginMethod === "email" ? "phone" : "email")
                                                setEmail("")
                                            }}
                                        >
                                            {t("Invite via")} {loginMethod === "email" ? t("Phone Number") : t("Email")}
                                        </div>
                                    </div>
                                    <div className={styles.input_container} style={{ marginTop: "1.5rem", position: "relative" }}>
                                        <label style={{ marginBottom: 0 }}>{t("Personalized Message")}</label>
                                        <span style={{ position: "absolute", top: 6, right: 0 }}>{message.length}/{loginMethod === "phone" ? 120 : 500}</span>
                                        <Input
                                            type='textarea'
                                            value={message}
                                            style={{ resize: "none", boxShadow: "0px 4px 11px 0px rgba(0, 0, 0, 0.16), 0px 0px 4px 6px #FDFDFD inset", height: "170px" }}
                                            onChange={(e) => {
                                                if (loginMethod === "phone" && e.target.value.length <= 120) {
                                                    setMessage(e.target.value)
                                                }
                                                if (loginMethod === "email" && e.target.value.length <= 500) {
                                                    setMessage(e.target.value)
                                                }
                                            }}
                                        />
                                    </div>
                                </>
                            }
                            {
                                step === 3
                                &&
                                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                                    <div style={{ display: "flex", flexDirection: "column", gap: ".3rem" }}>
                                        <strong>{t(service_name_formatter(loginMethod))}: </strong>
                                        <span>{email}</span>
                                    </div>
                                    <div style={{ display: "flex", flexDirection: "column", gap: ".3rem" }}>
                                        <strong>{t("Message")}: </strong>
                                        <span>{t(message)} <br /> {`https://my.insta-pay.ch/auth/signup/${userDetails?.username}`}</span>
                                    </div>
                                </div>
                            }
                        </>
                }
            </ModalBody>
            {
                !success &&
                <ModalFooter>
                    {
                        step > 1
                        &&
                        <Button
                            onClick={() => setStep(prev => prev - 1)}
                            style={{
                                border: "none",
                                outline: "none",
                                background: " linear-gradient(to right, rgba(0, 0, 0, 0.40) 0%, rgba(0, 0, 0, 0.40) 100%), linear-gradient(to left, #E64067 0%, #5926F0 55.65%, #4828A0",
                                backgroundBlendMode: "overlay, normal",
                                boxShadow: "0px 11.90068244934082px 8.655041694641113px -5.409400939941406px rgba(89, 38, 240, 0.17)",
                                borderRadius: "6px",
                                padding: "7px 24px",
                                fontSize: "16px"
                            }}
                        >{t("Back")}</Button>
                    }
                    {
                        step < 3
                        &&
                        <Button
                            onClick={() => setStep(prev => prev + 1)}
                            disabled={step === 1 ? !loginMethod : step === 2 ? email.length < 8 : false}
                            style={{
                                border: "none",
                                outline: "none",
                                background: " linear-gradient(to right, rgba(0, 0, 0, 0.40) 0%, rgba(0, 0, 0, 0.40) 100%), linear-gradient(to left, #E64067 0%, #5926F0 55.65%, #4828A0",
                                backgroundBlendMode: "overlay, normal",
                                boxShadow: "0px 11.90068244934082px 8.655041694641113px -5.409400939941406px rgba(89, 38, 240, 0.17)",
                                borderRadius: "6px",
                                padding: "7px 24px",
                                fontSize: "16px"
                            }}
                        >{t("Next")}</Button>
                    }
                    {
                        step === 3
                        &&
                        <Button
                            disabled={laoding}
                            onClick={handleInvite}
                            style={{
                                border: "none",
                                outline: "none",
                                background: " linear-gradient(to right, rgba(0, 0, 0, 0.40) 0%, rgba(0, 0, 0, 0.40) 100%), linear-gradient(to left, #E64067 0%, #5926F0 55.65%, #4828A0",
                                backgroundBlendMode: "overlay, normal",
                                boxShadow: "0px 11.90068244934082px 8.655041694641113px -5.409400939941406px rgba(89, 38, 240, 0.17)",
                                borderRadius: "6px",
                                padding: "7px 24px",
                                fontSize: "16px"
                            }}
                        >{t("Send")}</Button>
                    }
                </ModalFooter>
            }
        </Modal>
    );
};

export default InviteFriendModal;