import { useTranslation } from "react-i18next"
import logo from "../files/instapay.svg"
import styles from "./styles/receipt.module.css"
import { useLayoutEffect, useState } from "react"
import { useNavigate } from "react-router"
import signupSuccess from "../files/signup.gif"

const Receipt = ({ setLogin }) => {
    const { t } = useTranslation()
    const [timer, setTimer] = useState(6)
    const navigate = useNavigate()

    useLayoutEffect(() => {
        let timeout;
        if (timer > 0) {
            timeout = setTimeout(() => {
                setTimer(prev => prev - 1)
            }, 1000)
        } else {
            navigate("/login")
            setLogin(true)
        }
        return () => {
            clearTimeout(timeout)
        }
    }, [timer])
    return (
        <div className={styles.container}>
            <div className={styles.top}>
                <img src={logo} alt="" />
                <h5>{t("Welcome Aboard!")}</h5>
            </div>
            <div className={styles.bottom}>
                <h2>{t("OTP Verified")}</h2>
                <p>{t("You have successsfully signed up to InstaPay")}</p>

                <h3>{t("Redirecting you in")}</h3>
                <img src={signupSuccess} alt="" />
            </div>
        </div>
    )
}

export default Receipt