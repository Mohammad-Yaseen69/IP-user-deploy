import { useNavigate, useParams } from "react-router";
import styles from "../AuthNew/styles/index.module.css"
import { useTranslation } from "react-i18next";
import FormLogo from "../AuthNew/FormLogo";
import overlay from "../AuthNew/files/overlay.svg"
import man from "../AuthNew/files/man.png"
import { useContext, useEffect, useState } from "react";
import { ChevronRight, Eye, EyeOff } from "react-feather";
import axios from "axios";
import { encryptData } from "../../Helper/EssentilaMethods/Encryption";
import { decryptData } from "../../Helper/EssentilaMethods/Decryption";
import { UserContext } from "../../Context/UserContext";

const BroadcastVerify = () => {
    const { token } = useParams()
    const { t } = useTranslation()
    const [showPassword, setShowPassword] = useState(false)
    const [password, setPassword] = useState("")
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [confirmPassword, setConfirmPassword] = useState("")
    const [isPressed, setIsPressed] = useState(false)
    const { userDetails } = useContext(UserContext)
    const navigate = useNavigate()


    useEffect(() => {
        if (userDetails?._id) {
            navigate("/")
        }
    }, [userDetails])

    const verifyAccount = async () => {
        setIsPressed(true)
        const data = {
            token,
            password
        }
        try {
            const res = await axios.post(`${import.meta.env.VITE_IP_DEV_API}/api/account/set-password`, {
                data: encryptData(data)
            })

            const decrypted = decryptData(res.data.data)
            // console.log(decrypted)
            navigate("/login")
        } catch (error) {
            // console.log(decryptData(error?.response?.data?.data))
        } finally {
            setIsPressed(false)
        }
    }

    return (
        <section className={styles.container}>
            <img src={overlay} alt="overlay" className={styles.overlay} />
            <img src={man} alt="man" className={styles.man} />
            <form className={styles.form}>
                <div className={styles.top}>
                    <FormLogo />
                </div>
                <div className={styles.top_text}>
                    <h3>{t("Verify Account")}</h3>
                    <p>{t("Start Your Instapay Journey Today!")}</p>
                </div>
                <div className={styles.input_group}>
                    <div className={styles.input_container} style={{ position: "relative" }}>
                        <label>{t("Enter your password")}</label>
                        <input type={showPassword ? "text" : "password"} placeholder={t("Enter your password")} value={password} onChange={e => setPassword(e.target.value)} />
                        {
                            showPassword
                                ?
                                <EyeOff onClick={() => setShowPassword(!showPassword)} style={{ cursor: "pointer", position: "absolute", bottom: "13px", right: "10px" }} />
                                :
                                <Eye onClick={() => setShowPassword(!showPassword)} style={{ cursor: "pointer", position: "absolute", bottom: "13px", right: "10px" }} />
                        }
                    </div>
                    <div className={styles.input_container} style={{ position: "relative" }}>
                        <label>{t("Confirm your password")}</label>
                        <input type={showConfirmPassword ? "text" : "password"} placeholder={t("Confirm your password")} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
                        {
                            showConfirmPassword
                                ?
                                <EyeOff onClick={() => setShowConfirmPassword(!showConfirmPassword)} style={{ cursor: "pointer", position: "absolute", bottom: "13px", right: "10px" }} />
                                :
                                <Eye onClick={() => setShowConfirmPassword(!showConfirmPassword)} style={{ cursor: "pointer", position: "absolute", bottom: "13px", right: "10px" }} />
                        }
                    </div>
                </div>
                <button type="button" className={styles.form_btn} disabled={password !== confirmPassword || password?.length < 8 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password) || !/[^A-Za-z0-9]/.test(password) || isPressed} style={{ marginTop: "3rem" }} onClick={verifyAccount}>
                    <span>
                        {
                            isPressed
                                ?
                                t("Verifying")
                                :
                                t("Verify")
                        }
                    </span>
                    <ChevronRight size={28} color="white" />
                </button>
            </form>
        </section>
    )
}

export default BroadcastVerify;