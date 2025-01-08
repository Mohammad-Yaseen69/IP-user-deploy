import { useEffect, useState } from "react"
import styles from "./styles/stepone.module.css"
import { pagSvgs } from "./Svgs"
import { decryptData } from "../../../Helper/EssentilaMethods/Decryption"
import axios from "axios"
import { t } from "i18next"

const StepOne = ({ data, dataHandler, allowed }) => {
    const payouts = [
        {
            name: "Card Payment",
            value: "card",
            id: 5,
            coming_soon: false,
            icon: pagSvgs.card,
            active_icon: pagSvgs.card_a,
            api_val: "card_payment"
        },
        {
            name: "Mobile Wallet",
            value: "mobile",
            id: 1,
            coming_soon: true,
            icon: pagSvgs.wallet,
            active_icon: pagSvgs.wallet_a,
            api_val: "mobile_money"
        },
        {
            name: "Bank Deposit",
            value: "bank",
            id: 2,
            coming_soon: true,
            icon: pagSvgs.wallet,
            active_icon: pagSvgs.wallet_a,
            api_val: "bank"
        },
        {
            name: "Paypal",
            value: "paypal",
            id: 3,
            coming_soon: false,
            icon: pagSvgs.paypal,
            active_icon: pagSvgs.paypal_a,
            api_val: "paypal"
        },
    ].filter(item => allowed.some(it => it === item.api_val))
    return (
        <div className={styles.container}>
            {
                payouts.map(item => (
                    <div
                        key={item?.id}
                        className={`${styles.item} ${data?.payment_type?.id === item?.id ? styles.active : ''}`}
                        style={{ cursor: item.coming_soon ? "not-allowed" : "pointer", opacity: item.coming_soon ? .8 : 1 }}
                        onClick={() => item.coming_soon ? console.log("") : dataHandler("payment_type", item)}
                    >
                        {/* <img src={data?.payment_type?.id === item?.id ? item.active_icon : item.icon} alt="" /> */}
                        {data?.payment_type?.id === item?.id ? item.active_icon : item.icon}
                        <span>{item?.name}</span>
                        {
                            item.coming_soon
                            &&
                            <div className={styles.badge}>
                                {t("Coming Soon")}
                            </div>
                        }
                    </div>
                ))
            }
        </div>
    )
}

export default StepOne