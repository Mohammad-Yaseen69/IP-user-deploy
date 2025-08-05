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


const WalletsMobile = ({ setCurrentWallet }) => {
    const { t } = useTranslation()
    const { userWallets, totalReferralAmount, available } = useContext(UserContext)
    const [activeDot, setActiveDot] = useState(0)
    const [isLoading, setIsLoading] = useState(true)
    const [totalBalance, setTotalBalance] = useState(0)


    useEffect(() => {
        if (available) {
            const calculateTotal = async () => {
                const total = available?.reduce((acc, balance) => acc + balance, 0);
                setTotalBalance(total ?? 0);
                setIsLoading(false)
                console.log(total)
            };

            calculateTotal();
        }
    }, [available]);

    useEffect(() => {
        setCurrentWallet(userWallets?.[activeDot])
    }, [activeDot, userWallets])
    return (
        <div className={styles.container}>
            <h5>{t("My Wallets")}</h5>
            <div className={styles.details}>
                <div className={styles.left}>
                    <span>{t("Total Balance")}</span>
                    {
                        isLoading
                            ?
                            <div class="d-flex justify-content-center">
                                <div class="spinner-border" color='primary' role="status">
                                    <span class="sr-only">Loading...</span>
                                </div>
                            </div>
                            :
                            <h4>${totalBalance?.toFixed(2) || "0.00"}</h4>
                    }
                    {
                        userWallets.some(item => item?.balance?.reserved)
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
    )
}

export default WalletsMobile