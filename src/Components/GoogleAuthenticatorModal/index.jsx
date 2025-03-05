import { useContext, useRef, useState } from "react"
import styles from "./styles/index.module.css"
import { Input, Label, Modal, ModalBody } from 'reactstrap'
import { useTranslation } from "react-i18next"
import { ChevronRight, Copy, Eye, EyeOff } from "react-feather"
import { toast } from "react-toastify"
import { UserContext } from "../../Context/UserContext"
import success from "./success.mp4"
import axios from "axios"
import { decryptData } from "../../Helper/EssentilaMethods/Decryption"
import { encryptData } from "../../Helper/EssentilaMethods/Encryption"
import copy from "../ChipsInNew/copy.png"

const GoogleAuthenticatorModal = ({
    isOpen,
    toggle,
    authenticatorDetails,
    setAuthenticatorActive,
    setEditMode,
    smsActive,
    emailActive,
    passwordNext = () => { },
    successTitle = "Google Two Factor Authentication is now linked to your InstaPay Account.",
    sideText = "Google Authenticator",
}) => {
    const { t } = useTranslation()
    const { userDetails, authHeader } = useContext(UserContext)
    const [step, setStep] = useState(1)
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [showSecret, setShowSecret] = useState(false)
    const [enablingAuth, setEnablingAuth] = useState(false)

    // auth code
    const numberOfFields = 6;
    const [otpValues, setOTPValues] = useState(Array(numberOfFields).fill(''));
    const inputRefs = useRef(Array(numberOfFields).fill(null));
    const [isAnyFieldEmpty, setIsAnyFieldEmpty] = useState(true);

    const handleInputChange = (index, value) => {
        let numericValue = value.replace(/[^0-9]/g, '');
        if (numericValue.length > 1) {
            numericValue = numericValue.slice(-1);
        }
        let newOTPValues = [...otpValues];
        newOTPValues[index] = numericValue;
        setOTPValues(newOTPValues);
        if (numericValue && index < numberOfFields - 1) {
            inputRefs.current[index + 1].focus();
        }
        const isEmpty = newOTPValues.some(val => val === '');
        setIsAnyFieldEmpty(isEmpty);
    };


    const handleInputKeyDown = (index, event) => {
        if (event.key === 'Backspace') {
            if (otpValues[index] === '' && index > 0) {
                inputRefs.current[index - 1].focus();
            } else if (index > 0) {
                const newOTPValues = [...otpValues];
                newOTPValues[index] = '';
                setOTPValues(newOTPValues);
                setIsAnyFieldEmpty(true)
            }
        }
    };





    const verifyPassword = async () => {
        setEnablingAuth(true)
        try {
            const data = {
                account_id: userDetails?._id,
                password
            }
            const response = await axios.post(`${process.env.REACT_APP_IP_DEV_API}/api/account/user-verification`, { data: encryptData(data) }, {
                headers: authHeader
            })
            const dec = decryptData(response.data.data)
            if (sideText == "Google Authenticator") {
                console.log("he")
                setStep(2)
            } else {
                passwordNext(() => setStep(3))
            }
        } catch (error) {
            const dec = decryptData(error.response.data)
            console.log(dec)
            toast.error(dec?.message ?? "Something went wrong while verifying password.")
        }
        finally {
            setEnablingAuth(false)
        }
    }
    // eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwYXNzd29yZCI6IlUyRnNkR1ZrWDE4UzhqR3VnU3VSUlJ5NTJWVWRWMERzbldLQ25mU29aRkU9IiwiYWNjb3VudF90eXBlIjoiaW5kaXZpZHVhbCIsIl9pZCI6IjY2YTM5YTVmZmU1Yjc1YzUyNTU5NGQ1MSIsImlhdCI6MTcyMTk5OTA4MiwiZXhwIjoxNzIyMDAwODgyfQ.dwzuNF6fOxV7M1yIdGTyGeWHYF683txOlVienF0L4S8
    const verifyAuthenticator = async () => {
        setEnablingAuth(true)
        try {
            const data = {
                account_id: userDetails?._id,
                code: otpValues.join("")
            }
            console.log(data)
            const response = await axios.post(`${process.env.REACT_APP_IP_DEV_API}/api/account/verify-2fa`, { data: encryptData(data) }, {
                headers: authHeader
            })
            const dec = decryptData(response.data.data)
            if (dec?.status) {
                setAuthenticatorActive(true)
                setStep(prev => prev + 1)
            }
            if (userDetails?.sms_verification === smsActive &&
                userDetails?.email_verification === emailActive) {
                setEditMode(false)
            }
        } catch (error) {
            const dec = decryptData(error.response.data.data)
            console.log(dec)
            toast.error(dec?.message ?? "Something went wrong while enabling authenticator.")
        }
        finally {
            setEnablingAuth(false)
        }
    }

    return (
        <Modal isOpen={isOpen} style={{ maxWidth: step !== 2 ? "800px" : "900px", width: "100vw", transition: "250ms" }} contentClassName={styles.content}>
            <ModalBody className={styles.container}>
                <div className={styles.left}>
                    <h1>
                        {step === 1 ? t("Confirm Your Password") : t(sideText)}
                    </h1>
                    {
                        step < 3
                        &&
                        <button onClick={() => {
                            step === 1 ? toggle() : setStep(prev => prev - 1)
                        }}>
                            {step === 1 ? t("Cancel") : t("Back")}
                        </button>
                    }
                </div>
                {/* <div className={styles.right}> */}
                <form className={styles.right} onSubmit={e => {
                    e.preventDefault()
                    step === 1 ? verifyPassword() : verifyAuthenticator()
                }}>
                    {
                        step === 1
                        &&
                        <div className={styles.s1}>
                            <h1 className={styles.s1_t}>{t("This Security Feature Requires Password Confirmation!")}</h1>
                            <div className={styles.s1_inp_con}>
                                <Label>{t("Enter your password")}</Label>
                                <div className={styles.s1_i_c_input}>
                                    <Input
                                        placeholder={t("Enter your password")}
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                    />
                                    <span onClick={() => setShowPassword(!showPassword)}>
                                        {
                                            showPassword
                                                ?
                                                <EyeOff />
                                                :
                                                <Eye />
                                        }
                                    </span>
                                </div>
                            </div>
                        </div>
                    }


                    <>

                        {
                            step === 2
                            &&
                            <div className={styles.s2}>
                                <p className={styles.s2_t}>{t("Use The Application To Scan The QR Code Or Use Your Secret Code To Activate Google Two-Factor Authentication")}</p>
                                <div className={styles.auth_details}>
                                    <div className={styles.qr}>
                                        <img src={authenticatorDetails?.qrCodeUrl} alt="" />
                                        {/* <img src={userDetails?.profileImage?.url} alt="" /> */}
                                    </div>
                                    <div className={styles.or}>
                                        <div></div>
                                        <p>{t("OR")}</p>
                                        <div></div>
                                    </div>
                                    <div className={styles.auth_secret}>
                                        <Label>{t("Paste This Key In The Googe Authenticator App")}</Label>
                                        <button onClick={() => setShowSecret(!showSecret)}>{showSecret ? t("Hide secret key") : t("Show Secret Key")}</button>
                                        <div className={styles.secret_key}>
                                            <span>
                                                {
                                                    showSecret
                                                        ?
                                                        authenticatorDetails?.secret
                                                        :
                                                        authenticatorDetails?.secret?.split("")?.map(_ => "*")
                                                }
                                            </span>
                                            <span style={{
                                                border: "none",
                                                outline: "none",
                                                background: "transparent",
                                                display: "flex",
                                                justifyContent: "center",
                                                alignItems: "center"
                                            }}
                                                onClick={() => {
                                                    navigator?.clipboard?.writeText(authenticatorDetails?.secret)
                                                    toast.success(`"${authenticatorDetails?.secret}" copied to clipboard.`)
                                                }}
                                            >
                                                {/* <Copy color='white' /> */}
                                                <img src={copy} alt="" style={{ height: "20px", width: "20px" }} />
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className={styles.auth_code_details}>
                                    <h2>{t("Enter The Six-Digit Code From The Application")}</h2>
                                    <p>{t("After Scanning The Barcode Image, The App Will Display A Six-Digit Code That You Can Enter Below")}</p>
                                    <div className={styles.code_field}>
                                        <Label>{t("6 Digit Code")}</Label>
                                        <div className={styles.otp_inputs}>
                                            {otpValues.map((value, index) => (
                                                <input
                                                    key={index}
                                                    type="number"
                                                    maxLength={1}
                                                    value={value}
                                                    onChange={(e) => {
                                                        handleInputChange(index, e.target.value)
                                                    }}
                                                    onKeyDown={(e) => handleInputKeyDown(index, e)}
                                                    ref={(input) => (inputRefs.current[index] = input)}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        }
                    </>

                    {
                        step === 3
                        &&
                        <div className={styles.s3}>
                            <h1>{t(successTitle)}</h1>
                            <video src={success} autoPlay muted loop={true}></video>
                            <button onClick={toggle}>{t("Close")}</button>
                        </div>
                    }
                    {
                        window.innerWidth > 800
                            ?
                            (
                                step < 3
                                &&
                                <button disabled={enablingAuth} style={{ opacity: enablingAuth ? .7 : 1, pointerEvents: enablingAuth ? "none" : "all" }} type="submit" className={styles.next_btn} /*onClick={() => {
                                    // step === 1 ? verifyPassword() : verifyAuthenticator()
                                }}*/>
                                    {step === 1 ? t("Continue") : t("Enable")}
                                    <ChevronRight />
                                </button>
                            )
                            :
                            (
                                step < 3
                                &&
                                <div style={{ display: "flex", justifyContent: "space-around", alignItems: "center" }} className={styles.mob_bot}>
                                    <button type="button" onClick={() => {
                                        step === 1 ? toggle() : setStep(prev => prev - 1)
                                    }}>
                                        {step === 1 ? t("Cancel") : t("Back")}
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={enablingAuth || (step === 1 ? password.length < 8 : otpValues.some(item => !item))}
                                        style={{
                                            opacity: enablingAuth ? .7 : 1,
                                            pointerEvents: enablingAuth ? "none" : "all"
                                        }}
                                        className={styles.next_btn}
                                    // onClick={() => {
                                    // step === 1 ? verifyPassword() : verifyAuthenticator()
                                    // }}
                                    >
                                        {step === 1 ? t("Continue") : t("Enable")}
                                        <ChevronRight />
                                    </button>
                                </div>
                            )

                    }
                </form>
            </ModalBody>
        </Modal>
    )
}

export default GoogleAuthenticatorModal