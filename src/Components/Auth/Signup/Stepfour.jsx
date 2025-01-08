import { useTranslation } from "react-i18next"
import styles from "./styles/stepfour.module.css"
import { useState } from "react"
import { Check, Eye, EyeOff, X } from "react-feather"

export const passwordRegex = [
    /[A-Z]/,
    /[a-z]/,
    /[0-9]/,
    /[!@#$%^&*(),.?":{}|<>]/
];

const Stepfour = ({ data, dataHandler }) => {
    const { t } = useTranslation()
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    return (
        <div className={styles.container}>
            <div className={styles.inp}>
                <label>{t("Create a strong Password")}</label>
                <div className={styles.input}>
                    <input type={showPassword ? "text" : "password"} value={data.password} onChange={e => dataHandler("password", e.target.value)} />
                    <div onClick={() => setShowPassword(prev => !prev)}>
                        {
                            showPassword
                                ?
                                <EyeOff size={18} />
                                :
                                <Eye size={18} />
                        }
                    </div>
                </div>
            </div>
            <div className={styles.password_guide}>
                <span>{t("Password Must")}:</span>
                <div className={styles.regex_item}>
                    {
                        data.password.length >= 9 && data.password.length <= 64
                            ?
                            <div className={styles.check}>
                                <Check size={9} color="white" />
                            </div>
                            :
                            <div className={styles.cross}>
                                <X size={9} color="white" />
                            </div>
                    }
                    <span>{t("Be between 9 and 64 characters")}</span>
                </div>
                <div className={styles.regex_item}>
                    {
                        passwordRegex.every(item => item.test(data.password))
                            ?
                            <div className={styles.check}>
                                <Check size={9} color="white" />
                            </div>
                            :
                            <div className={styles.cross}>
                                <X size={9} color="white" />
                            </div>
                    }
                    <span>{t("Include at least two of the following:")}</span>
                </div>
                <div className={styles.regex_grid}>
                    <div className={styles.regex_item}>
                        {
                            passwordRegex[0].test(data.password)
                                ?
                                <div className={styles.check}>
                                    <Check size={9} color="white" />
                                </div>
                                :
                                <div className={styles.cross}>
                                    <X size={9} color="white" />
                                </div>
                        }
                        <span>{t("Uppercase character")}</span>
                    </div>
                    <div className={styles.regex_item}>
                        {
                            passwordRegex[1].test(data.password)
                                ?
                                <div className={styles.check}>
                                    <Check size={9} color="white" />
                                </div>
                                :
                                <div className={styles.cross}>
                                    <X size={9} color="white" />
                                </div>
                        }
                        <span>{t("Number")}</span>
                    </div>
                    <div className={styles.regex_item}>
                        {
                            passwordRegex[2].test(data.password)
                                ?
                                <div className={styles.check}>
                                    <Check size={9} color="white" />
                                </div>
                                :
                                <div className={styles.cross}>
                                    <X size={9} color="white" />
                                </div>
                        }
                        <span>{t("Lowercase character")}</span>
                    </div>
                    <div className={styles.regex_item}>
                        {
                            passwordRegex[3].test(data.password)
                                ?
                                <div className={styles.check}>
                                    <Check size={9} color="white" />
                                </div>
                                :
                                <div className={styles.cross}>
                                    <X size={9} color="white" />
                                </div>
                        }
                        <span>{t("Special character")}</span>
                    </div>
                </div>
            </div>
            <div className={styles.inp}>
                <label>{t("Confirm Password")}</label>
                <div className={styles.input}>
                    <input type={showConfirmPassword ? "text" : "password"} value={data.confirm_password} onChange={e => dataHandler("confirm_password", e.target.value)} />
                    <div onClick={() => setShowConfirmPassword(prev => !prev)}>
                        {
                            showConfirmPassword
                                ?
                                <EyeOff size={18} />
                                :
                                <Eye size={18} />
                        }
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Stepfour