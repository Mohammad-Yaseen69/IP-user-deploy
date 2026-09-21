import React, { useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styles from "./styles/WalletsMobile.module.css"
import { UserContext } from '../../Context/UserContext'
import per from "./files/per.svg"
import { Link } from 'react-router-dom'
import { Swiper, SwiperSlide } from 'swiper/react'
import ADCard from './ADCard'
import { EffectCards, EffectFade } from 'swiper'
import OtherBalance from './OtherBalance'
import { isSafari } from "react-device-detect"
import { usePermission } from '../../hooks/GeneralUse/usePermission'


const WalletsMobile = ({ setCurrentWallet }) => {
    const { t } = useTranslation()
    const { userWallets, totalReferralAmount, available: totalBalance, balanceLoading: isLoading } = useContext(UserContext)
    const [activeDot, setActiveDot] = useState(0)
    const can = usePermission()


    useEffect(() => {
        setCurrentWallet(userWallets?.[activeDot])
    }, [activeDot, userWallets])
    return (
        <div className={styles.container}>
            <h5>{t("My Wallets")}</h5>
            <div className={styles.details}>
                <div className={styles.left}>
                    {can("dashboard.balance.view") && (
                        <>
                            <span>{t("Total Balance")}</span>
                            {
                                isLoading
                                    ?
                                    <div className="d-flex justify-content-center">
                                <div className="spinner-border" color='primary' role="status">
                                            <span className="sr-only">{t("Loading...")}</span>
                                        </div>
                                    </div>
                                    :
                                    <h4>${totalBalance?.toFixed(2) || "0.00"}</h4>
                            }
                        </>
                    )}
                    {
                        can("dashboard.balance.view") && userWallets.some(item => item?.balance?.reserved)
                        &&
                        <OtherBalance />
                    }
                    {/* <div className={styles.ref_dets}>
                        <div className={styles.ref_amount}>
                            <img src={per} alt="%" />
                            <span>${totalReferralAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                        <Link to={"/referrals"}>{t("Referrals")} {">"}</Link>
                    </div> */}
                </div>
                <div className={styles.cards}>
                    <Swiper
                        effect={isSafari ? "fade" : "cards"}
                        grabCursor={true}
                        speed={isSafari && 1000}
                        modules={[isSafari ? EffectFade : EffectCards]}
                        cardsEffect={{
                            rotate: false
                        }}
                        style={{ minWidth: "250px", cursor: "none", height: "100%", maxWidth: "400px" }}
                        className="mySwiper"
                        onSlideChange={e => setActiveDot(e.activeIndex)}
                    // ref={swiperRef}
                    >
                        {
                            userWallets.length > 0
                                ?
                                userWallets.map((data, index) => (
                                    <SwiperSlide key={index} style={{
                                        cursor: "none",
                                        borderRadius: "10px",
                                        height: "100%"
                                    }}>
                                        <ADCard data={data} isActive={activeDot === index} />
                                    </SwiperSlide>
                                ))
                                : ""
                        }
                    </Swiper>
                </div>
            </div>
            <div className={styles.ref_dets}>
                <div className={styles.ref_amount}>
                    <img src={per} alt="%" />
                    <span>${totalReferralAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <Link to={"/referrals"}>{t("Referrals")} {">"}</Link>
            </div>
        </div>
    );
}

export default WalletsMobile