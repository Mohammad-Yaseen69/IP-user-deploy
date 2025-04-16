import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import invite from "../files/invite.png"
import countries from "../CountriesData.json"
import { useLocation, useNavigate } from 'react-router'
import InviteFriendModal from '../InviteFriendModal'
import styles from "../../QuickQrPay/styles/index.module.scss"
import copy from "../../QuickQrPay/files/copy.svg"
import { toast } from 'react-toastify'

const QRRecipient = ({ wallet, dataHandler }) => {
    const { t } = useTranslation()
    const country = countries.find(item => item.name === wallet?.country_name || item?.name?.toLowerCase()?.includes(wallet?.country_name?.toLowerCase()))
    const navigate = useNavigate()
    const [isOpen, setIsOpen] = useState(false)

    const location = useLocation()

    console.log(location.pathname)
    return (
        <div className={styles.merchantInfo}>
            <div>
                <h4>{t("Merchant Details")}</h4>
                <p>{t("Please take a few moments to carefully verify the information to your payee details.")}</p>
            </div>

            <div className={styles.info}>
                {wallet?.coverImage && (
                    <div className={styles.banner}>
                        <img src={wallet?.coverImage} alt="" />
                    </div>
                )}

                <div className={styles.dets}>
                    <div className={styles.u_info}>
                        {wallet?.profileImage ? (
                            <img src={wallet?.profileImage} className={styles.pfp} alt="" />
                        ) : (
                            <div className={styles.pfp_placeHolder}>
                                {wallet?.first_name?.[0]}{wallet?.last_name?.[0]}
                            </div>
                        )}
                        <h2>{wallet?.first_name} {wallet?.last_name}</h2>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <p>@{wallet?.username}</p>
                            <span>{wallet?.account_type === "individual" ? "Personal" : "Business"} Account</span>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <img style={{ width: "20px" }} src={country?.file_url} alt="" />
                            <h6 style={{ fontSize: "10px", color: "#6C6C6C", fontWeight: 600, marginBottom: 0 }}>{country?.name}</h6>
                        </div>
                    </div>

                    <div className={styles.w_info}>
                        <div>
                            <p>{wallet?.wallet_id}</p>
                            <span>{wallet?.currency?.code} Wallet</span>
                        </div>
                        <img src={copy} alt="" onClick={() => {
                            navigator.clipboard.writeText(wallet?.wallet_id)
                            toast.success('Copied to clipboard');
                        }} />
                    </div>

                    <button className={styles.gradientBtn} onClick={() => navigate(`/profile/${wallet?.username}`)}>
                        {t("View Profile")}
                    </button>

                    <button 
                        onClick={() => {
                            dataHandler("beneficiary", {})
                            dataHandler("beneficiary_wallet", {})
                            navigate("/payments?payment_action=send_money&send_type=qr_pay")
                            window.history.replaceState(null, null, window.location.search?.split("&wallet_id")?.[0])
                        }} 
                        className={styles.gradientBtn}
                    >
                        {t("Go Back")}
                    </button>
                </div>
            </div>


            <InviteFriendModal
                isOpen={isOpen}
                toggle={() => setIsOpen(false)}
            />
        </div>
    )
}

export default QRRecipient