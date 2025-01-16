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

const CreatePassword = () => {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const [isPressed, setIsPressed] = useState(false)
    const { token } = useParams()
    const [data, setData] = useState({})
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
                account_id: data.account_id
            }

            const encryptedData = encryptData(bodyData)

            axios.post(`${process.env.REACT_APP_IP_DEV_API}/api/instagram/set-password`, {
                data: encryptedData
            }).
                then((res) => {
                    const dec = decryptData(res.data.data)
                    toast.success("Password set successfully")
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
            <div className={styles.overlay}>
                <div className={styles.wrapper}>
                    <>
                        <h4 style={{
                            color: "white",
                            fontSize: "18px",
                            fontStyle: "normal",
                            fontWeight: "600",
                            lineHeight: "150%",
                            marginBottom: "10px",
                            alignSelf: "flex-start"
                        }}>{t("Create a strong Password")}</h4>
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
                            color: "white",
                            fontSize: "18px",
                            fontStyle: "normal",
                            fontWeight: "600",
                            lineHeight: "150%",
                            marginBottom: "10px",
                            alignSelf: "flex-start"
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
                </div>
            </div>
        </div>
    )
}

export default CreatePassword