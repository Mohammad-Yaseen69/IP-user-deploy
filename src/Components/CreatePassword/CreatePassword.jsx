import { useContext, useEffect, useLayoutEffect, useRef, useState } from "react"
import styles from "./styles/index.module.css"
import { AlertTriangle, Check, ChevronRight, Eye, EyeOff } from "react-feather"
import { jwtDecode } from "jwt-decode"
import axios from "axios"
import { encryptData } from "../../Helper/EssentilaMethods/Encryption"
import { decryptData } from "../../Helper/EssentilaMethods/Decryption"
import { useNavigate, useParams } from "react-router"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import Cross from "./Cross.svg"
import { toast } from "react-toastify"
import Logo from "../../assets/images/logo/logo2.png"
import Gif from "../../assets/gif.gif"
import LanguagePicker from '../LanguagePicker'

const CreatePassword = () => {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const [isPressed, setIsPressed] = useState(false)
    const { token } = useParams()
    const [data, setData] = useState({})
    const [success, setSuccess] = useState(true)
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
            }).
                then((res) => {
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
                        <button  onClick={passwordVerify} className={styles.form_btn} disabled={isPressed || !passwords.password.value || !passwords.confirm_password.value || passwords.confirm_password.value !== passwords.password.value} style={{ marginTop: "14px" }}>
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
                            <h3 style={{ fontSize: "18px", fontWeight: 700 }}>Your password has been set!</h3>
                            <p style={{ color: "#575757", fontSize: "14px", fontWeight: 600, width: "300px", marginTop: "8px" }}>You may close this window and proceed further on Instagram</p>

                            {/* <svg style={{ position: "absolute", top: "-350%", right: '0' }} xmlns="http://www.w3.org/2000/svg" width="152" height="413" viewBox="0 0 152 413" fill="none">
                                <path opacity="0.04" fill-rule="evenodd" clip-rule="evenodd" d="M16.0491 101.817C13.6667 107.021 11.5691 112.289 9.74648 117.595C9.73082 117.63 9.71514 117.664 9.71687 117.706C9.26668 119.009 8.84177 120.303 8.43423 121.605C8.00318 122.957 7.5974 124.301 7.209 125.652C6.82063 127.003 6.45747 128.344 6.1039 129.711C5.75815 131.06 5.422 132.434 5.09368 133.791C4.60078 135.919 4.14269 138.062 3.72725 140.203C3.41721 141.794 3.16723 143.391 2.89984 144.98C2.81795 145.479 2.7361 145.978 2.6464 146.493C2.35634 148.361 2.10113 150.243 1.88073 152.141C1.86855 152.259 1.85633 152.377 1.83631 152.512C-6.71387 224.74 32.4658 297.055 103.592 328.32L32.6616 483.272L147.037 442.262L262.902 398.042L335.446 239.565L176.253 169.587L405.69 85.3824L255.794 19.4912C252.878 18.0036 249.922 16.6015 246.893 15.2698C175.819 -15.9728 94.6994 3.37859 45.3176 57.6161C45.1617 57.7738 45.0233 57.9391 44.8674 58.0968C43.6337 59.467 42.4174 60.8448 41.228 62.2551C40.8362 62.6998 40.4792 63.1598 40.097 63.6293C39.0948 64.8133 38.1022 66.0222 37.1367 67.2635C35.7636 68.9837 34.4349 70.744 33.1332 72.5367C32.3174 73.6793 31.4937 74.839 30.6953 75.9892C29.8891 77.1566 29.1081 78.3145 28.3366 79.4971C27.5652 80.6798 26.8112 81.8701 26.0667 83.0852C25.3458 84.249 24.6422 85.4203 23.9482 86.6165C23.9152 86.6431 23.8995 86.6773 23.8838 86.7116C21.0514 91.5741 18.4314 96.6124 16.0491 101.817Z" fill="#5926F0" />
                            </svg> */}
                        </div>


                    </div>
                )
            }
        </div>
    )
}

export default CreatePassword