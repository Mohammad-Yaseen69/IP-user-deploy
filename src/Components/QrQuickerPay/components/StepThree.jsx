import React from 'react'
import { useTranslation } from 'react-i18next'
import r from "../r.svg"
import success from "../success.svg"
import styles from "../styles/index.module.scss"


const StepThree = () => {
    const { t } = useTranslation()
    return (
        <div className={styles.statusDiv}>
            <div className={styles.circle}>
                <img src={r} alt="" />
                <span>
                    {/* tick */}
                    <img src={success} alt="" />

                    {/*  */}
                </span>
            </div>

            <div>
                <h5>{t("Your payment is confirmed")}</h5>
                <p>{t("Thanks for using InstaPay!")}</p>
            </div>
        </div>
    )
}

export default StepThree
