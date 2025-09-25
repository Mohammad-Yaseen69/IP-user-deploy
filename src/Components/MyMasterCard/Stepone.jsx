import { useTranslation } from 'react-i18next';
import styles from "./styles/onboard.module.scss";
import CardIcon from "./files/card.svg"
import { standardFeatures, premiumFeatures } from "./files/data.js"
import IpLogo from "./files/ip.svg"
import { Gb, Euro, USD, Apay } from "./files"

const Toggle = ({ checked, onChange, isCheckbox = false }) => (
    <label style={{ borderRadius: "999px" }} className={isCheckbox ? styles.checkbox : styles.toggle}>
        <input
            type={isCheckbox ? "checkbox" : "checkbox"}
            checked={checked}
            onChange={onChange}
        />
        <div className={isCheckbox ? styles.checkmark : styles.slider}></div>
    </label>
);

const Stepone = ({ cardType, setCardType, setStep, userDetails, applePay, setApplePay }) => {
    const { t } = useTranslation();
    const cardTypes = [
        {
            type: "premium",
            text: t("Instapay Premium Card")
        },
        {
            type: "standard",
            text: t("Instapay Standard Card")
        },
    ];

    return (
        <div style={{ display: "flex", gap: "8px", marginBottom: "7px", flexDirection: "column", maxWidth: "100%", width: "100%" }}>
            <div className={styles.top}>
                <h2>{t("Let’s Get Your InstaPay MasterCard!")}</h2>
                <p>{t("Choose the type of card that best suits your needs. Whether you want an instant Virtual Card for online payments or a Physical Card for everyday transactions, we’ve got you covered!")}</p>
            </div>


            <div className={styles.cardSelection}>
                <div style={{ display: "flex", alignItems: "center", gap: "30px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="21" viewBox="0 0 20 21" fill="none">
                            <rect x="0.5" y="1.3208" width="19" height="19" rx="9.5" fill="#F9F5FF" />
                            <rect x="0.5" y="1.3208" width="19" height="19" rx="9.5" stroke="#7F56D9" />
                            <circle cx="10" cy="10.8208" r="4" fill="#7F56D9" />
                        </svg>
                        <span style={{ fontSize: "14px", color: "#333333", fontWeight: 600 }}>{t("Virtual Card")}</span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <svg width="16" height="17" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="0.5" y="1.3208" width="15" height="15" rx="7.5" fill="#F5F5F5" />
                            <rect x="0.5" y="1.3208" width="15" height="15" rx="7.5" stroke="#E9EAEB" />
                        </svg>

                        <span style={{ fontSize: "14px", color: "#A8A8A8", fontWeight: 500 }}>{t("Physical Card (Coming Soon)")}</span>
                    </div>
                </div>


                <div className={styles.methodsSelect}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", width: "55%" }}>

                        {cardTypes.map((card, index) => (
                            <span onClick={() => setCardType(card.type)} key={index} style={{ borderColor: cardType === card.type && "#EC9100", flex: "1 0 0", justifyContent: "space-between", padding: "18px" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: '10px' }}>

                                    <img src={CardIcon} alt="" />
                                    <p style={{ color: cardType === card.type && "#EC9100" }}>{card.text}</p>
                                </div>

                                {card.type === cardType &&
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="15" viewBox="0 0 14 15" fill="none">
                                        <path d="M11.6673 4.00781L5.25065 10.4245L2.33398 7.50781" stroke="#333333" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                }

                            </span>
                        ))}

                    </div>

                    {cardType === 'premium' && (<>

                        <div className={styles.seprationLine} style={{ background: "var(--COLORS-Neutral-300, #D2D2D2)", height: ".5px", width: "100%", display: "block" }}></div>

                        <div className={styles.applePay} style={{ display: "flex", alignItems: "center", gap: "8px", width: "55%" }}>
                            <span style={{ width: "100%", padding: "15px" }}>
                                <div>
                                    <p>{t("Enable")}</p>
                                    <img src={Apay} alt="" />
                                    <p>{t("Support")}</p>
                                    <div>+$2.00</div>
                                </div>


                                <Toggle checked={applePay} onChange={() => setApplePay(prev => !prev)} isCheckbox={false} />
                            </span>
                        </div>

                    </>)}



                    <div className={styles.seprationLine} style={{ background: "var(--COLORS-Neutral-300, #D2D2D2)", height: ".5px", width: "100%", display: "block" }}></div>

                    <div className={styles.currencySelection} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ borderColor: "#EC9100", padding: "8px 12px" }}>
                            <div>
                                <img src={USD} alt="" />
                                <p style={{ color: "#282B35" }}>{t("US Dollars")}</p>
                                <p>USD</p>
                            </div>
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="15" viewBox="0 0 14 15" fill="none">
                                <path d="M11.6673 4.00781L5.25065 10.4245L2.33398 7.50781" stroke="#333333" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </span>
                        <span style={{ padding: "8px 12px" }}>
                            <div>
                                <img src={Euro} alt="" />
                                <p style={{ color: "#282B35" }}>{t("Euro")}</p>
                                <p>EUR</p>
                            </div>

                            <p>{t("Coming Soon")}</p>

                        </span>
                        <span>
                            <div>
                                <img src={Gb} alt="" />
                                <p style={{ color: "#282B35" }}>{t("British pound")}</p>
                                <p>Gb</p>
                            </div>

                            <p>{t("Coming Soon")}</p>
                        </span>
                    </div>
                </div>
            </div>

            <div className={styles.featuresDiv}>
                <div className={styles.left}>
                    <div className={styles.top}>
                        <img src={CardIcon} alt="" />
                        <div>
                            <h4>{cardType === "standard" ? t("Standard") : t("Premium")} {t("Card")}</h4>
                            <span color="#5926F0">{t("FEATURES")}</span>
                        </div>
                    </div>
                    <div className={styles.features}>
                        {cardType === "premium"
                            ?
                            premiumFeatures.map((feat) => (
                                <div>
                                    <span style={{ fontSize: "12px", fontWeight: 600, color: "#9E9E9E" }}>{t(feat.label)}</span>
                                    {feat.text && <p style={{ fontSize: "14px", fontWeight: '600', marginBottom: "0" }}>{t(feat.text)}</p>}
                                    {feat.bullet &&
                                        <ul>
                                            {feat.bullet.map((b) => (
                                                <li style={{ fontSize: "14px", fontWeight: '600', marginBottom: "0" }}>{t(b)}</li>
                                            ))}
                                        </ul>
                                    }
                                </div>
                            ))

                            :
                            standardFeatures.map((feat) => (
                                <div>
                                    <span style={{ fontSize: "12px", fontWeight: 600, color: "#9E9E9E" }}>{t(feat.label)}</span>
                                    {feat.text && <p style={{ fontSize: "14px", fontWeight: '600', marginBottom: "0" }}>{t(feat.text)}</p>}
                                    {feat.bullet &&
                                        <ul>
                                            {feat.bullet.map((b) => (
                                                <li style={{ fontSize: "14px", fontWeight: '600', marginBottom: "0" }}>{t(b)}</li>
                                            ))}
                                        </ul>
                                    }
                                </div>
                            ))
                        }
                    </div>
                </div>


                <div className={`${styles.card} ${cardType === "standard" ? styles.standard : styles.premium}`}>
                    <div>
                        <div>
                            <img src={IpLogo} alt="" />
                            <span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="33" height="21" viewBox="0 0 33 21" fill="none">
                                    <path fillRule="evenodd" clipRule="evenodd" d="M12.1074 17.9641H20.8834V2.23291H12.1074V17.9641Z" fill="#FF5F00" />
                                    <path fillRule="evenodd" clipRule="evenodd" d="M12.664 10.0988C12.664 6.90736 14.162 4.06492 16.4947 2.23323C14.7886 0.893439 12.6361 0.0941772 10.2964 0.0941772C4.75752 0.0941772 0.267578 4.57349 0.267578 10.0988C0.267578 15.6242 4.75752 20.1035 10.2964 20.1035C12.6361 20.1035 14.7886 19.3043 16.4947 17.9645C14.162 16.1325 12.664 13.2903 12.664 10.0988Z" fill="#EB001B" />
                                    <path fillRule="evenodd" clipRule="evenodd" d="M32.4081 16.2984V15.9101H32.3065L32.1897 16.1772L32.0727 15.9101H31.971V16.2984H32.0426V16.0054L32.1524 16.2581H32.2268L32.3365 16.0049V16.2984H32.4081ZM31.7643 16.2984V15.9763H31.8947V15.9107H31.5631V15.9763H31.6933V16.2984H31.7643ZM32.7213 10.0988C32.7213 15.6241 28.2311 20.1035 22.6925 20.1035C20.3528 20.1035 18.2 19.3042 16.4941 17.9644C18.8269 16.1327 20.3249 13.2903 20.3249 10.0988C20.3249 6.90758 18.8269 4.06514 16.4941 2.23317C18.2 0.893378 20.3528 0.0941162 22.6925 0.0941162C28.2311 0.0941162 32.7213 4.57343 32.7213 10.0988Z" fill="#F79E1B" />
                                </svg>
                            </span>
                        </div>

                        <div>
                            <h2>{userDetails?.first_name || userDetails?.company_name} {userDetails.last_name}</h2>

                            <h3>{t("Virtual")} <br /> {t("Card")}</h3>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    )
}

export default Stepone