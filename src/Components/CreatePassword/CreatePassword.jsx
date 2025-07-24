import {  useEffect, useState } from "react"
import styles from "./styles/index.module.css"
import { AlertTriangle, Check, ChevronRight, Eye, EyeOff } from "react-feather"
import { jwtDecode } from "jwt-decode"
import axios from "axios"
import { encryptData } from "../../Helper/EssentilaMethods/Encryption"
import { decryptData } from "../../Helper/EssentilaMethods/Decryption"
import { useParams } from "react-router"
import { useTranslation } from "react-i18next"
import Cross from "./Cross.svg"
import { toast } from "react-toastify"
import Logo from "../../assets/images/logo/logo2.png"
import Gif from "../../assets/gif.gif"
import LanguagePicker from '../LanguagePicker'

const CreatePassword = () => {
    const { t } = useTranslation()
    const [isPressed, setIsPressed] = useState(false)
    const { token } = useParams()
    const [data, setData] = useState({})
    const [success, setSuccess] = useState(false)
    const [passwords, setPasswords] = useState({
        password: {
            value: "",
            show: false
        },
        confirm_password: {
            value: "",
            show: false
        }
    })


    const changePassHandler = (e) => {
        const { value, name } = e.target
        setPasswords(prev => ({
            ...prev,
            [name]: {
                ...prev[name],
                value: value,
            }
        }))
    }

    const changePassShowHandler = (name, value) => {
        setPasswords(prev => ({
            ...prev,
            [name]: {
                ...prev[name],
                show: value
            }
        }))
    }

    const decodeToken = () => {
        const decodedToken = jwtDecode(token, process.env.REACT_APP_JWT_SECRET_KEY)
        setData(decodedToken)
    }

    const passwordVerify = () => {
        setIsPressed(true)
        if (data && passwords.password.value === passwords.confirm_password.value && passwords.password) {
            const bodyData = {
                platform: data.platform,
                recipientId: data.recipient_id,
                password: passwords.password.value,
            }

            const encryptedData = encryptData(bodyData)

            axios.post(`${process.env.REACT_APP_IP_DEV_API}/api/instagram/set-password`, {
                data: encryptedData
            }).then((res) => {
                    const dec = decryptData(res.data.data)
                    toast.success("Password set successfully")
                    setSuccess(true)
                    console.log(dec)
                })
                .catch((err) => {
                    const dec = decryptData(err.response.data.data)
                    toast.error(dec?.message || "Something went wrong")
                    console.log(dec)
                })
                .finally(() => {
                    setIsPressed(false)
                })
        }
    }



    useEffect(() => { decodeToken() }, [])
    return (
        <div className={styles.container}>
            <div style={{ display: !success ? "flex" : "none", justifyContent: "center" }}>
                <img src={Logo} style={{ margin: "40px auto", width: "150px" }} alt="" />
            </div>
            {!success ?
                (<div className={styles.wrapper}>
                    <>
                        <LanguagePicker />
                        <span className={styles.topHeading} style={{marginTop: "15px"}}>{t("Sign Up")} </span>
                        <h4 style={{
                            fontSize: "18px",
                            fontStyle: "normal",
                            fontWeight: "600",
                            lineHeight: "150%",
                            marginBottom: "10px",
                            alignSelf: "flex-start",
                            textAlign: window.innerWidth < 600 && "center",
                            width: window.innerWidth < 600 && "100%"
                        }}>{t("Enter Your Password")}</h4>
                        <div
                            className={styles.password_input}
                        >
                            <input type={passwords.password.show ? "text" : "password"} value={passwords.password.value} name="password" onChange={changePassHandler} />
                            {
                                passwords.password.show
                                    ?
                                    <EyeOff onClick={() => changePassShowHandler("password", !passwords.password.show)} style={{ cursor: "pointer" }} />
                                    :
                                    <Eye onClick={() => changePassShowHandler("password", !passwords.password.show)} style={{ cursor: "pointer" }} />
                            }
                        </div>
                        <div className={styles.password_guidance}>
                            <h5 style={{ alignSelf: "flex-start" }}>{t("Password must:")}</h5>
                            <ul className={styles.pg_list}>
                                <li>
                                    {
                                        passwords.password.value.length >= 9 && passwords.password.value.length <= 64
                                            ?
                                            <Check />
                                            :
                                            <Cross />
                                    }
                                    <p>{t("Be between 9 and 64 characters")}</p>
                                </li>
                                <li>
                                    {
                                        (/[^A-Za-z0-9]/.test(passwords.password.value) &&
                                            /[A-Z]/.test(passwords.password.value) &&
                                            /[a-z]/.test(passwords.password.value) &&
                                            /[0-9]/.test(passwords.password.value))
                                            ?
                                            <Check />
                                            :
                                            <Cross />
                                    }
                                    <p>{t("Include at least two of the following:")}</p>
                                </li>
                                <ul className={styles.pg_sub_list}>
                                    <li>
                                        {
                                            /[A-Z]/.test(passwords.password.value)
                                                ? <Check /> : <Cross />
                                        }
                                        <p>{t("Uppercase character")}</p>
                                    </li>
                                    <li>
                                        {
                                            /[a-z]/.test(passwords.password.value)
                                                ? <Check /> : <Cross />
                                        }
                                        <p>{t("Lowercase Character")}</p>
                                    </li>
                                    <li>
                                        {
                                            /[0-9]/.test(passwords.password.value)
                                                ? <Check /> : <Cross />
                                        }
                                        <p>{t("Number")}</p>
                                    </li>
                                    <li>
                                        {
                                            /[^A-Za-z0-9]/.test(passwords.password.value)
                                                ? <Check /> : <Cross />
                                        }
                                        <p>{t("Special Character")}</p>
                                    </li>
                                </ul>
                            </ul>
                        </div>
                        <h4 style={{
                            fontSize: "18px",
                            fontStyle: "normal",
                            fontWeight: "600",
                            lineHeight: "150%",
                            marginBottom: "10px",
                            alignSelf: "flex-start",
                            textAlign: window.innerWidth < 600 && "center",
                            width: window.innerWidth < 600 && "100%"
                        }}>{t("Confirm Password")}</h4>
                        <div
                            className={styles.password_input}
                        >
                            <input type={passwords.confirm_password.show ? "text" : "password"} value={passwords.confirm_password.value} name="confirm_password" onChange={changePassHandler} />
                            {
                                passwords.confirm_password.show
                                    ?
                                    <EyeOff onClick={() => changePassShowHandler("confirm_password", !passwords.confirm_password.show)} style={{ cursor: "pointer" }} />
                                    :
                                    <Eye onClick={() => changePassShowHandler("confirm_password", !passwords.confirm_password.show)} style={{ cursor: "pointer" }} />
                            }
                        </div>
                        {
                            passwords.confirm_password.value !== passwords.password.value
                                && passwords.confirm_password.value.length > 0
                                ?
                                <div style={{
                                    display: "flex",
                                    alignItems: "center",
                                    color: "#f32d2d",
                                    fontSize: "10px",
                                    fontWeight: 600,
                                    lineHeight: "150%",
                                    margin: "10px auto 0",
                                    width: "100%",
                                    gap: ".6rem"
                                }}>
                                    <AlertTriangle size={17} color="#F32D2D" />
                                    <span>{t("The password doesn't match.")}</span>
                                </div>
                                : ""
                        }
                        <button onClick={passwordVerify} className={styles.form_btn} disabled={isPressed || !passwords.password.value || !passwords.confirm_password.value || passwords.confirm_password.value !== passwords.password.value} style={{ marginTop: "14px" }}>
                            <span>{isPressed ? t("Continuing") : t("Continue")}</span>
                            <ChevronRight size={28} color="white" />
                        </button>
                    </>
                </div>) :
                (
                    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", flexDirection: "column", gap: "18px", textAlign: "center" }}>
                        <img src={Logo} style={{ margin: "20px auto", width: "150px" }} alt="" />
                        <img src={Gif} style={{ width: '220px', height: "220px", borderRadius: "8px" }} alt="" />
                        <div style={{ position: "relative" }}>
                            <h3 style={{ fontSize: "18px", fontWeight: 700 }}>{t("Your password has been set!")}</h3>
                            <p style={{ color: "#575757", fontSize: "14px", fontWeight: 600, width: "300px", marginTop: "8px" }}>{t("You may close this window and proceed further on {{platform}}",{platform: data.platform === "telegram" ? "Telegram" : "Instagram"})}</p>

                            <button
                                style={{ padding: "0.9rem 1rem", borderRadius: "9px", backgroundColor: "#5926f0fe", color: "white", border: "none", cursor: "pointer", width: "100%", fontSize: "16px" }}
                                onClick={() => {
                                    if (data.platform === "telegram") {
                                        window.location.href = "https://t.me/Instapay_swiss_bot";
                                    } else {
                                        window.location.href = "https://ig.me/m/Instapay_swiss";
                                    }
                                }}
                            >
                                {data.platform === "telegram" ? t("Go Back to {{platform}}",{platform: "Telegram"}) : t("Go Back to {{platform}}",{platform: "Instagram"})}
                            </button>
                        </div>


                    </div>
                )
            }
        </div>
    )
}

export default CreatePassword