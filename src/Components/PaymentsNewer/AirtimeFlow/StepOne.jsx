import React from 'react'
import styles from "./styles/stepone.module.css"
import { useTranslation } from 'react-i18next'
import airtime from "./files/airtime.svg"
import air_dude from "./files/air_dude.png"
import esim from "./files/esim.svg"
import e_dude from "./files/e_dude.png"
import utils from "./files/utils.svg"
import { ChevronRight } from 'react-feather'
import useWindowWidth from '../../../utils/useWindowWidth'

const StepOne = ({ data, dataHandler, setCurrentFlow, setAction, setStep }) => {
    const { t } = useTranslation()
    const width = useWindowWidth()
    return (
        <div style={{ height: "100%" }} className={styles.container}>
            <div className={styles.cards}>
                <div className={`${styles.card} ${data.flow === "airtime" ? styles.active : ""}`} onClick={() => {
                    // if (window.innerWidth < 1000) {
                    //     dataHandler("step", 2)
                    // }
                    dataHandler("flow", "airtime")
                }}>
                    <div className={styles.c_left}>
                        <img src={airtime} alt="" className={styles.icon} />
                        <span>{t("Mobile Airtime")}</span>
                    </div>
                    <img src={air_dude} alt="" />
                </div>
                <div
                    onClick={() => {
                        dataHandler("flow", "e-sim")
                    }}
                    className={`${styles.card} ${data.flow === "e-sim" ? styles.active : ""}`} /*onClick={() => {
                    if (window.innerWidth < 1000) {
                        dataHandler("step", 2)
                    }
                    dataHandler("flow", "e-sim")
                }}*/>
                    <div
                        className={styles.c_left}>
                        <img src={esim} alt="" className={styles.icon} />
                        <span>{t("E-SIM")}</span>
                    </div>
                    <img style={{ width: width < 600 && "120%", bottom: width < 600 && "0px", right : width < 600 && "-100px" }} src={e_dude} alt="" />
                </div>
                <div className={`${styles.card} ${styles.coming_soon}`}>
                    <h4>{t("Coming Soon")}</h4>
                    <div>
                        <img src={utils} alt="" />
                        <span>{t("Utilities")}</span>
                    </div>
                </div>
            </div>
            {
                window.innerWidth > 1000
                &&
                <div className={styles.buttons}>
                    <button className={styles.trs} onClick={() => {
                        setCurrentFlow("")
                        setAction("")
                        setStep(1)
                    }}>{t("Back")}</button>
                    <button disabled={!data.flow} onClick={() => dataHandler("step", 2)}>
                        {t("Next")}
                        <ChevronRight color="white" size={17} />
                    </button>
                </div>
            }
        </div>
    )
}

export default StepOne