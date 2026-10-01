import { useTranslation } from "react-i18next"
import styles from "./styles/stepfour.module.css"
import { useState } from "react"
import { Check, Eye, EyeOff, } from "react-feather"

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

    const validation = [
      {  isFullfilled: data.password.length >= 9 && data.password.length <= 64, label: '9 to 64 characters' },
      {  isFullfilled: passwordRegex[0].test(data.password), label: 'Uppercase' },
      {  isFullfilled: passwordRegex[1].test(data.password), label: 'Lowercase' },
      {  isFullfilled: passwordRegex[2].test(data.password), label: 'Number' },
      {  isFullfilled: passwordRegex[3].test(data.password), label: 'Symbol' },
    ]
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
            <div className={styles.pillsContainer}>
                {validation.map(x=>(
                <div key={x.label} className={`${styles.pill} ${x.isFullfilled && styles.activePill}`}>
                    {x.isFullfilled && <Check size={14} />} {t(x.label)}
                </div>
                ))}
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