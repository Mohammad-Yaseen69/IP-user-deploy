import React, { useRef, useState } from 'react'
import styles from './styles/index.module.scss'
import Giftpng from "./files/gift-png.png"
import { Lock, Freeze, plus, CreditCardR, Wallet2, FileDown, CreditCardP, Notification, Speaker, Apay, Gpay, Samsung, Apple } from "./files"

const Toggle = ({ checked, onChange, isCheckbox = false }) => (
    <label className={isCheckbox ? styles.checkbox : styles.toggle}>
        <input
            type={isCheckbox ? "checkbox" : "checkbox"}
            checked={checked}
            onChange={onChange}
        />
        <span className={isCheckbox ? styles.checkmark : styles.slider}></span>
    </label>
);

const CardPurchased = () => {
    const [checks, setChecks] = useState({
        cardStatus: true,
        onlinePurchases: true,
        bAndG: true,
        contactlessPay: true
    });
    const ref = useRef();

    const handleToggle = (property) => {
        setChecks(prev => ({
            ...prev,
            [property]: !prev[property]
        }));
    };

    const scrollToNext = () => {
        if (ref.current) {
            ref.current.scrollBy({ left: 200, behavior: 'smooth' });
        }
    };

    return (
        <div className={styles.cardContainer}>
            <div className={styles.left}>
                <div className={styles.topInfo}>
                    <div>
                        <p>My Cards</p>
                        <span>3</span>
                    </div>

                    <button>
                        <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 17 17" fill="none">
                            <path d="M8.67521 4.24182V13.5752M4.00854 8.90849H13.3419" stroke="white" stroke-width="1.56777" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                        Add Card
                    </button>
                </div>
            </div>

            <div className={styles.right}>
                <div className={styles.detailsContainer}>
                    <h4 className={styles.title}>Manage My MasterCard</h4>

                    <div style={{ display: "flex", flexWrap: "wrap", width: "100%", gap: "8px" }}>
                        <div className={styles.iconBox} style={{ flex: 2 }}>
                            <span>Card Label</span>
                        </div>
                        <div style={{ justifyContent: "space-between" }} className={styles.iconBox}>
                            <span>Card Status</span>

                            <Toggle checked={checks.cardStatus} onChange={() => handleToggle("cardStatus")} isCheckbox={false} />
                        </div>
                        <div className={styles.iconBox}>
                            <img src={Lock} alt="" />
                            <span>Pin Management</span>
                        </div>
                        <div className={styles.iconBox}>
                            <img src={Freeze} alt="" />
                            <span>Freeze Card</span>
                        </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", width: "100%" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: '12px', justifyContent: "center", flex: 1 }}>
                            <div className={styles.iconBox}>
                                <img src={plus} alt="" />
                                <span>Add Funds</span>
                            </div>
                            <div className={styles.iconBox}>
                                <img src={CreditCardR} alt="" />
                                <span>Card to Card Transfer</span>
                            </div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: '12px', justifyContent: "center", flex: 1 }}>
                            <div className={styles.iconBox}>
                                <img src={Wallet2} alt="" />
                                <span>Card to Wallet Transfer</span>
                            </div>
                            <div className={styles.iconBox}>
                                <img src={FileDown} alt="" />
                                <span>Download Statement</span>
                            </div>
                        </div>

                        <div className={styles.giftDiv} style={{ alignSelf: "stretch", flex: 2, backgroundColor: "#421cb1", borderRadius: "6px" }}>
                            {/* <img src={Giftpng} alt="" /> */}
                            <div>
                                <div>
                                    <img style={{ width: "24px" }} src={CreditCardP} alt="" />
                                    <h3>Create an Add-On Card</h3>
                                </div>
                                <p>Send joy in just a few clicks!
                                    Create your <span>InstaPay Mastercard Gift </span> Card now.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.detailsContainer}>
                    <h4 className={styles.title}>Card Settings</h4>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", width: "100%" }}>
                        <div style={{ justifyContent: "space-between" }} className={styles.iconBox}>
                            <span>Online Purchases</span>

                            <Toggle checked={checks.onlinePurchases} onChange={() => handleToggle("onlinePurchases")} isCheckbox={false} />
                        </div>
                        <div style={{ justifyContent: "space-between" }} className={styles.iconBox}>
                            <span>Online Betting and Gambling</span>

                            <Toggle checked={checks.bAndG} onChange={() => handleToggle("bAndG")} isCheckbox={false} />
                        </div>
                        <div style={{ justifyContent: "space-between" }} className={styles.iconBox}>
                            <span>Contactless Payment</span>

                            <Toggle checked={checks.contactlessPay} onChange={() => handleToggle("contactlessPay")} isCheckbox={false} />
                        </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", width: "100%" }}>
                        <div className={styles.iconBox}>
                            <img src={CreditCardR} alt="" />
                            <span>Blocked Countries & Regions</span>
                        </div>

                        <div className={styles.iconBox}>
                            <img src={Notification} alt="" />
                            <span>Notification Settings</span>
                        </div>
                        <div className={styles.iconBox}>
                            <img src={Speaker} alt="" />
                            <span>Report Lost/Stolen Card</span>
                        </div>
                    </div>
                </div>
                <div style={{ backgroundColor: "white" }} className={styles.detailsContainer}>
                    <div style={{ display: "flex", justifyContent: "space-between", width: '100%', alignItems: 'center' }}>
                        <h4 className={styles.title}>Mobile Payments</h4>
                        <span style={{ fontSize: '14px', color: '#9CA3AF', fontWeight: 600 }}>Manage devices and add your card to mobile wallets."</span>
                    </div>

                    <div className={styles.walletOptions}>
                        <h4>Wallet Options:</h4>

                        <div >
                            <div className={styles.option}>
                                <img src={Apay} alt="" />
                                <h3>Add to Apple Pay</h3>
                            </div>
                            <div className={styles.option}>
                                <img src={Gpay} alt="" />
                                <h3>Add to Google Pay</h3>
                            </div>
                            <div className={styles.option}>
                                <img src={Samsung} alt="" />
                                <h3>Add to Samsung Wallet</h3>
                            </div>
                        </div>
                    </div>

                    <div className={styles.linkDevices}>
                        <h4>Linked Devices:</h4>

                        <div style={{ display: "flex", alignItems: "center", gap: "20px", overflowX: "auto" }}>
                            <div ref={ref} style={{ display: "flex", gap: "20px" }}>
                                <div className={styles.device}>
                                    <div className={styles.row}>
                                        <img src={Apple} alt="" />
                                        <span className={styles.pill}>Active</span>
                                    </div>

                                    <div style={{ display: "flex", flexDirection: "column", gap: '8px', alignItems: "flexStart", width: "100%" }}>
                                        <div className={styles.row}>
                                            <p>Device</p>
                                            <h4>Iphone 14</h4>
                                        </div>
                                        <div style={{ alignItems: "flex-end" }} className={styles.row}>
                                            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "6px" }}>
                                                <p>Date Added</p>
                                                <h4>Jan 2025</h4>
                                            </div>
                                            <p>Remove</p>
                                        </div>
                                    </div>
                                </div>
                                <div className={styles.device}>
                                    <div className={styles.row}>
                                        <img src={Apple} alt="" />
                                        <span className={styles.pill}>Active</span>
                                    </div>

                                    <div style={{ display: "flex", flexDirection: "column", gap: '8px', alignItems: "flexStart", width: "100%" }}>
                                        <div className={styles.row}>
                                            <p>Device</p>
                                            <h4>Iphone 14</h4>
                                        </div>
                                        <div style={{ alignItems: "flex-end" }} className={styles.row}>
                                            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "6px" }}>
                                                <p>Date Added</p>
                                                <h4>Jan 2025</h4>
                                            </div>
                                            <p>Remove</p>
                                        </div>
                                    </div>
                                </div>
                                <div className={styles.device}>
                                    <div className={styles.row}>
                                        <img src={Apple} alt="" />
                                        <span className={styles.pill}>Active</span>
                                    </div>

                                    <div style={{ display: "flex", flexDirection: "column", gap: '8px', alignItems: "flexStart", width: "100%" }}>
                                        <div className={styles.row}>
                                            <p>Device</p>
                                            <h4>Iphone 14</h4>
                                        </div>
                                        <div style={{ alignItems: "flex-end" }} className={styles.row}>
                                            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "6px" }}>
                                                <p>Date Added</p>
                                                <h4>Jan 2025</h4>
                                            </div>
                                            <p>Remove</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <span onClick={scrollToNext} className={styles.arrow}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 17 17" fill="none">
                                    <path d="M6.68335 12.3181L10.7722 8.22919L6.68335 4.14032" stroke="black" stroke-width="1.36296" stroke-linecap="round" stroke-linejoin="round" />
                                </svg>
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CardPurchased;