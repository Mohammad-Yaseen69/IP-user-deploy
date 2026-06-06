import { Input } from 'reactstrap'
import styles from "../styles/onboard.module.scss"
// import "./files/modal.reset.css"
import { WalletCard } from '../../PaymentsNewer/InternationalFlow/WalletsComponent'
import CardNumberInput from '../../CreditInput/CardNumberInput'
import CardCVC from '../../CreditInput/CardCvc';
import CardExpiry from '../../CreditInput/CardExpiry';
import CardHolderName from '../../CreditInput/CardHolderName';
import { useTranslation } from 'react-i18next';
import { Check } from 'react-feather';
import cardStyles from "../../PaymentsNewer/InternationalFlow/styles/creditcard.module.css"
import logo_w from "../../../assets/images/logo/logo_white.png"
import axios from 'axios';
import { useContext } from 'react';
import { UserContext } from '../../../Context/UserContext';
import { decryptData } from '../../../Helper/EssentilaMethods/Decryption';
import { toast } from 'react-toastify';
import { encryptData } from '../../../Helper/EssentilaMethods/Encryption';
import lockIcon from "../../PaymentsNewer/InternationalFlow/files/lock-03.png"
import mainIcon from "../../PaymentsNewer/InternationalFlow/files/PCI-DSS-1 1.png"



const PaymentStep = (
    {
        paymentType,
        filteredWallets,
        vvcCardType,
        setWalletState,
        walletState,
        setFeeDetails,
        cards,
        cardDetail,
        setSelectedSaveCard,
        setCardDetails,
        cardNumberError,
        cardType,
        setStep,
        disabledBtnS,
        saveCard,
        setSaveCard,
        selectedSaveCard,
        card,
        addFunds,
        amount,
        setCards,
        marginTop,
        cardToWallet,
        applePay,
        googlePay,
        hideButtons = false
    }) => {
    const { t } = useTranslation()
    const { authHeader } = useContext(UserContext)

    const expiryCheck = async (item) => {
        try {
            const response = await axios.post(`${import.meta.env.VITE_IP_DEV_API}/api/trust-payment/check-card-expiry`, { data: encryptData({ card_id: item._id }) }, {
                headers: authHeader
            })

            const dec = decryptData(response.data.data)
            if (dec.isExpired) {
                setSelectedSaveCard(null)
                setCards(prev => prev.filter(card => card._id !== item._id))
                toast.error(dec.message)
            }
        } catch (error) {
            const dec = decryptData(error?.response?.data?.data)
            console.log(dec)
        }
    }

    const saveCardJSX = () => (
        <div className={styles.field} >
            <h3 className={styles.label} style={{ fontSize: "14px" }}>{t("Select a saved payment card")}</h3>
            <div style={{ maxWidth: '100%', display: 'flex', overflow: "auto", gap: "10px", padding: "10px 0" }}>

                {cards.map(item => (
                    <div key={item?._id} className={cardStyles.card} onClick={() => {
                        Object.keys(cardDetail).forEach(key => cardDetail[key] = "")
                        expiryCheck(item)
                        setSelectedSaveCard(item)
                    }}>
                        <div className={cardStyles.c_top}>
                            <img src={logo_w} alt="" />
                        </div>
                        <div className={cardStyles.c_bot}>
                            <span>XXXX XXXX XXXX {item?.last4}</span>
                            {
                                selectedSaveCard?._id === item?._id
                                &&
                                <Check style={{ color: "white" }} size={20} />
                            }
                        </div>
                    </div>
                ))}


            </div>
        </div>
    )
    return (
        <div className={styles.step2} style={{ marginTop: marginTop ?? "" }}>
            {paymentType === "wallet"
                &&
                <div className={styles.walletsDiv}>
                    {filteredWallets?.map(wallet_l => (
                        <div
                            style={{
                                boxShadow: window.innerWidth < 1000 ? "none" : undefined,
                                ...(cardToWallet && {
                                    display: "flex",
                                    gap: "4rem",
                                    background: "#FAFAFA",
                                    padding: "12px",
                                    borderRadius: "8px",
                                    marginTop: "15px",
                                }),
                            }}
                            key={wallet_l.name}
                        >
                            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                                <h3 style={{ fontSize: cardToWallet && "20px" }} className={styles.walletNameHead}>{wallet_l.name} Wallet</h3>
                                <span
                                    className={styles.walletId}
                                    style={
                                        cardToWallet
                                            ? {
                                                color: "#5926F0",
                                                fontFamily: "Manrope",
                                                fontSize: "12px",
                                                fontStyle: "normal",
                                                fontWeight: 700,
                                                lineHeight: "normal",
                                                borderRadius: "4px",
                                                background: "rgba(89, 38, 240, 0.12)",
                                                padding: "4px 8px",
                                                alignSelf: "baseline"
                                            }
                                            : {}
                                    }
                                >
                                    {wallet_l.wallet_id}
                                </span>
                            </div>

                            <WalletCard
                                wallet={wallet_l}
                                isActive={true}
                                cardType={(applePay || googlePay) ? "vcc_premium_plus_virtual" : vvcCardType === "premium" ? "vcc_premium_virtual" : "vcc_standard_virtual"}
                                isInVCard={true}
                                dataHandler={(_, wallet) => setWalletState(wallet)}
                                data={{ wallet: walletState }}
                                setFeeDetail={setFeeDetails}
                                card={card}
                                amount={amount}
                                cardToWallet={cardToWallet}
                                addFunds={addFunds}
                                paymentType={paymentType}
                                filteredWallets={filteredWallets}
                            />
                        </div>

                    ))}
                </div>
            }

            {paymentType === "card" &&
                <div className={styles.cardDiv}>
                    <div className={styles.texts}>
                        <p>{t("Complete your payment by providing your payment details")}</p>
                    </div>

                    <div className={styles.cardFormDiv}>
                        {(cards.length > 0 && window.innerWidth < 1000) &&
                            saveCardJSX()
                        }
                        <div className={styles.field}>
                            <h3 className={styles.label}>{t("Card Number")} {!cardDetail.cardNumber && "*"}</h3>
                            <CardNumberInput
                                content={cardDetail.cardNumber}
                                setContent={(e) => {
                                    setSelectedSaveCard({})
                                    setCardDetails(prev => ({ ...prev, cardNumber: e }))
                                }}
                                cardError={cardNumberError}
                                cardType={cardType}
                                isinVVC={true}
                                widthFull={true}
                            />
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                            <div className={styles.field}>
                                <h3 className={styles.label}>{t("CVC")} {!cardDetail.cardCVC && "*"}</h3>
                                <CardCVC
                                    content={cardDetail.cardCVC}
                                    setContent={(e) => {
                                        setSelectedSaveCard({})
                                        setCardDetails(prev => ({ ...prev, cardCVC: e }))
                                    }}
                                    maxLength={cardType.cvcLength}
                                    isinVVC={true}
                                    widthFull={true}
                                />
                            </div>

                            <div className={styles.field}>
                                <h3 className={styles.label}>{t("Expiry Date")} {!cardDetail.cardExpiry && "*"}</h3>
                                <CardExpiry
                                    content={cardDetail.cardExpiry}
                                    setContent={(e) => {
                                        setSelectedSaveCard({})
                                        setCardDetails(prev => ({ ...prev, cardExpiry: e }))
                                    }}
                                    isinVVC={true}
                                    widthFull={true}
                                />
                            </div>
                        </div>
                        <div className={styles.field}>
                            <h3 className={styles.label}>{t("Card Holder Name")} {!cardDetail.cardHolderName && "*"}</h3>
                            <CardHolderName
                                content={cardDetail.cardHolderName}
                                setContent={(e) => {
                                    setSelectedSaveCard({})
                                    setCardDetails(prev => ({ ...prev, cardHolderName: e }))
                                }}
                                isinVVC={true}
                                widthFull={true}
                            />

                            <div style={{ display: "flex", alignItems: "center", gap: ".4rem", cursor: "pointer", marginTop: ".7rem" }}>
                                <Input id='save_info' style={{ cursor: "pointer" }} type="checkbox" checked={saveCard} onChange={e => setSaveCard(e.target.checked)} />
                                <label style={{ marginBottom: 0, color: "#8b8b8b", cursor: "pointer" }} htmlFor='save_info'>{t("save details to use next time.")}</label>
                            </div>
                        </div>

                        {(cards.length > 0 && window.innerWidth > 1000) &&
                            saveCardJSX()
                        }
                    </div>

                    <div className={styles.pcontainer}>
                        <div className={styles.secure}>
                            <div className={styles.sectio1}><img src={lockIcon} alt="lock" style={{ width: "20px", height: "20px" }} />
                                <p>{t('Payments are secure and encrypted by')}</p></div>
                            <img src={mainIcon} alt="pci" style={{ width: "60px", height: "25px" }} />

                        </div>
                    </div>
                </div>
            }

            {(window.innerWidth > 1000 && setStep && !hideButtons) &&
                <div className={styles.btns}>
                    <button
                        onClick={() => {
                            setStep(1)
                            setWalletState({})
                            setSelectedSaveCard({})
                        }}
                    >{t("Back")}</button>
                    <button
                        style={{ color: "white", backgroundColor: "#5926F0", opacity: disabledBtnS && 0.4 }}
                        disabled={disabledBtnS}
                        onClick={() => {
                            setStep(3)
                        }}
                    >
                        {t("Continue")}
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="15" viewBox="0 0 14 15" fill="none">
                            <path d="M5.25 11L8.75 7.5L5.25 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>

                    </button>
                </div>
            }

        </div>
    )
}

export default PaymentStep