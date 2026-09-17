import styles from "./styles/stepone.module.css"
import { pagSvgs } from "./Svgs"
import { t } from "i18next"
import { useState } from "react"
import { Info } from "react-feather"
import PaypalCurrencies from "../../AddFunds/PaypalCurrencies.json"
import FeesComponent from "../../PaymentsNewer/InternationalFlow/FeesComponent"
import InstaPayLoader from "../../Loader"
import { PlaidCurrencies } from "../../AddFunds/WalletFundsFlow"
import CardMaintenanceModal from "../../CardMaintenanceModal"


// cardEnabled: card goes through Paytently, so skip the Trust maintenance notice.
const StepOne = ({ data, dataHandler, allowed, wallet, cardEnabled = false }) => {
    const [showCardMaintenanceModal, setShowCardMaintenanceModal] = useState(false)
    const payouts = [
        {
            name: "Payment Card",
            value: "card",
            id: 5,
            coming_soon: false,
            icon: pagSvgs.card,
            active_icon: pagSvgs.card_a,
            api_val: "card_payment"
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
        {
            name: "Bank Deposit",
            value: "bank",
            id: 2,
            icon: pagSvgs.wallet,
            active_icon: pagSvgs.wallet_a,
            api_val: "bank_deposit"
        },
        {
            name: "Bank Transfer (Europe Only)",
            value: "bank_transfer",
            id: 2,
            icon: pagSvgs.wallet,
            active_icon: pagSvgs.wallet_a,
            api_val: "bank"
        },
        {
            name: "Mobile Wallet",
            value: "mobile_wallet",
            id: 1,
            icon: pagSvgs.wallet,
            active_icon: pagSvgs.wallet_a,
            api_val: "mobile_money"
        },

    ].filter(item => allowed.some(it => it === item.api_val))
    return (
        <div className={styles.container}>
            <CardMaintenanceModal
                isOpen={showCardMaintenanceModal}
                toggle={() => setShowCardMaintenanceModal(false)}
            />
            {
                !data?.payment_type?.value ?
                    payouts.map(item => (
                        <div
                            key={item?.id}
                            className={`${styles.item} ${data?.payment_type?.id === item?.id ? styles.active : ''}`}
                            style={{ cursor: item.coming_soon ? "not-allowed" : "pointer", opacity: item.coming_soon ? .8 : 1 }}
                            onClick={() => {
                                if (item.coming_soon) return console.log("")
                                if (item.value === "card" && !cardEnabled) {
                                    setShowCardMaintenanceModal(true)
                                    return
                                }
                                dataHandler("payment_type", item)
                            }}
                        >
                            {/* <img src={data?.payment_type?.id === item?.id ? item.active_icon : item.icon} alt="" /> */}
                            {data?.payment_type?.id === item?.id ? item.active_icon : item.icon}
                            <span>{t(item?.name)}</span>
                            {
                                item.coming_soon
                                &&
                                <div className={styles.badge}>
                                    {t("Coming Soon")}
                                </div>
                            }
                        </div>
                    )) :
                    <div
                        className={`${styles.item}`}
                        style={{ justifyContent: 'space-between' }}
                    >
                        <div style={{ display: "flex", alignItems: "center", gap: '10px' }}>
                            {data?.payment_type?.active_icon}
                            <span>{t(data.payment_type?.name)}</span>
                        </div>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="17" viewBox="0 0 16 17" fill="none">
                            <path d="M13.3332 4.68896L5.99984 12.0223L2.6665 8.68896" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
            }

            {data?.payment_type?.value
                ?
                data.loading
                    ?
                    <div style={{ height: "200px", width: "200px" }}>
                        <InstaPayLoader />
                    </div>
                    :
                    <>
                        <FeesComponent
                            data={data}
                            receiverLabel={t("They will receive")}
                            error={data.exchange_rate_error}
                            feesLabel={t("Sending Fees")}
                            sendingLabel={t("You are Sending")}
                            receiverFee={true}
                            totalLabel="Amount To Pay"
                            bright={true}
                            guest={true}
                            plaidValues={true}
                            extraContent={
                                data.payment_type?.value === "card" && data.step > 3
                                    ?
                                    <div className={styles.card_dets}>
                                        <div className={styles.cd_top}>
                                            <span>{t("You are using")}</span>
                                            <button onClick={() => dataHandler("step", 3)}>{t("Change")}</button>
                                        </div>
                                        <div className={styles.cd_bot}>
                                            <h5>{t("Card ending")} {data.cardNumber?.slice(data?.cardNumber?.length - 5, data?.cardNumber?.length)}</h5>
                                            <span>{("Exp date")}: {data.expiry}</span>
                                        </div>
                                    </div>
                                    :
                                    ""
                            }
                        />
                        {
                            data.payment_type?.value === "paypal" && !PaypalCurrencies.some(item => item === wallet?.currency?.code)
                                ?
                                <>
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "flex-start",
                                            gap: ".7rem",
                                            padding: "12px",
                                            borderRadius: "6px",
                                            background: "rgba(255, 218, 68, 0.24)"
                                        }}
                                    >
                                        <Info
                                            color="#BE9A08"
                                            size={20}
                                        />
                                        <span style={{
                                            color: '#BE9A08',
                                            fontFamily: 'Manrope',
                                            fontSize: ".7rem",
                                            fontStyle: 'normal',
                                            fontWeight: 700,
                                            lineHeight: 1.3,
                                            letterSpacing: '-0.28px'
                                        }}>
                                            <strong>{wallet?.currency?.code} </strong> {t("is not supported by Paypal,")} <strong>{t("USD")}</strong> {t("will be used as the default currency.")}
                                        </span>
                                    </div>
                                    <div style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: ".9rem",
                                        padding: ".8rem",
                                        background: "#fff",
                                        borderRadius: "6px",
                                        boxShadow: "0px 1.5px 10.8px 0px rgba(0, 0, 0, 0.11)"
                                    }}>
                                        <div style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "1rem",
                                            justifyContent: "space-between"
                                        }}>
                                            <span style={{
                                                color: '#8A8A8A',
                                                fontFamily: 'Manrope',
                                                fontSize: ".7rem",
                                                fontStyle: 'normal',
                                                fontWeight: 600,
                                                lineHeight: 1.5,
                                                letterSpacing: '-0.14px'
                                            }}>{t("Exchange Rate")}</span>
                                            <strong
                                                style={{
                                                    color: '#000',
                                                    fontFamily: 'Manrope',
                                                    fontSize: ".7rem",
                                                    fontStyle: 'normal',
                                                    lineHeight: 1.5,
                                                    letterSpacing: '-0.14px'
                                                }}>1.00 {wallet?.currency?.code}  = {Number(data.paypal_fx?.exchange_rate)}{t("USD")}</strong>
                                        </div>
                                        <div style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "1rem",
                                            justifyContent: "space-between"
                                        }}>
                                            <span style={{
                                                color: '#8A8A8A',
                                                fontFamily: 'Manrope',
                                                fontSize: ".7rem",
                                                fontStyle: 'normal',
                                                fontWeight: 600,
                                                lineHeight: 1.5,
                                                letterSpacing: '-0.14px'
                                            }}>{t("Amount in USD")}</span>
                                            <strong style={{
                                                color: '#000',
                                                fontFamily: 'Manrope',
                                                fontSize: "1.2rem",
                                                fontStyle: 'normal',
                                                fontWeight: 700,
                                                lineHeight: 1.7,
                                                letterSpacing: '-0.8px'
                                            }}>{Number(data.paypal_fx?.amount)?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{t("USD")}</strong>
                                        </div>
                                    </div>
                                </>
                                :
                                ""
                        }
                    </>
                :
                ""
            }

        </div>
    );
}

export default StepOne