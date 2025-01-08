import Swiper from 'swiper';
import 'swiper/swiper-bundle.css';
import AccountCard from "./AccountCard"
import styles from "./styles/AccountCards.module.scss"
import { useEffect, useRef, useState } from 'react';
// import { cardData } from './CardsData';
import { useSelector } from 'react-redux';

const AccountCards = () => {
    const swiperRef = useRef(null);
    const [activeDot, setActiveDot] = useState(0)
    const cardData = useSelector(state => state.accounts)

    useEffect(() => {
        swiperRef.current = new Swiper('.swiper-container', {
            slidesPerView: 'auto',
            spaceBetween: 16,
            centeredSlides: true,
            grabCursor: true,
            loop: true,
            on: {
                slideChange: function () {
                    setActiveDot(this.realIndex);
                }
            }
        });
    }, []);

    return (
        <div className={`${styles.cards} card`} style={{
            marginBottom: 0
        }}>
            <h2>My Wallet</h2>
            <div className={`swiper-container ${styles.cardsContainer}`}>
                <div className="swiper-wrapper">
                    {
                        cardData.map((data, index) => {
                            return <div key={index} className="swiper-slide"><AccountCard data={data} /></div>
                        })
                    }
                </div>
            </div>
            <div style={{
                display: "flex",
                justifyContent: "center",
                gap: '10px',
                marginBottom: "1rem"
            }}>
                {
                    cardData.map((_, index) => <span
                        key={index}
                        style={{
                            height: "6px",
                            width: activeDot === index ? "30px" : "6px",
                            borderRadius: "30px",
                            background: "grey",
                            cursor: "pointer"
                        }}
                        onClick={() => {
                            if (swiperRef.current) {
                                swiperRef.current.slideTo(index);
                            }
                        }}
                    />)
                }
            </div>
            <button className={styles.manage_card}>Manage Account</button>
        </div>
    )
}

export default AccountCards;