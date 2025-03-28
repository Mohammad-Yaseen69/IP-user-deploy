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
        marginTop 
    }) => {
    const { t } = useTranslation()
    const { authHeader } = useContext(UserContext)

    const expiryCheck = async (item) => {
        try {
            const response = await axios.post(`${process.env.REACT_APP_IP_DEV_API}/api/trust-payment/check-card-expiry`, { data: encryptData({ card_id: item._id }) }, {
                headers: authHeader
            })

            const dec = decryptData(response.data.data)
            if (dec.isExpired) {
                setSelectedSaveCard(null)
                setCards(prev => prev.filter(card => card._id !== item._id))
                toast.error(dec.message)
            }
        } catch (error) {
            const dec = decryptData(error.response.data.data)
            console.log(dec)
        }
    }

    const saveCardJSX = () => (
        <div className={styles.field} >

            <h3 className={styles.label} style={{ fontSize: "14px" }}>Select a saved payment card</h3>
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
        <div className={styles.step2} style={{marginTop: marginTop ?? ""}}>
            {paymentType === "wallet"
                &&
                <div className={styles.walletsDiv}>
                    {filteredWallets?.map(wallet_l => (
                        <div style={{ boxShadow: window.innerWidth < 1000 && "none" }} key={wallet_l.name}>
                            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                                <h3 className={styles.walletNameHead}>{wallet_l.name}</h3>
                                <span className={styles.walletId}>
                                    {wallet_l.wallet_id}
                                </span>
                            </div>

                            <WalletCard
                                wallet={wallet_l}
                                isActive={true}
                                cardType={vvcCardType === "premium" ? "vcc_premium_virtual" : "vcc_standard_virtual"}
                                isInVCard={true}
                                dataHandler={(_, wallet) => setWalletState(wallet)}
                                data={{ wallet: walletState }}
                                setFeeDetail={setFeeDetails}
                                card={card}
                                amount={amount}
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
                        <p>Complete your payment by providing your payment details</p>
                    </div>

                    <div className={styles.cardFormDiv}>
                        {(cards.length > 0 && window.innerWidth < 1000) &&
                            saveCardJSX()
                        }
                        <div className={styles.field}>
                            <h3 className={styles.label}>Card Number {!cardDetail.cardNumber && "*"}:</h3>
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
                                <h3 className={styles.label}>CVC {!cardDetail.cardCVC && "*"}:</h3>
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
                                <h3 className={styles.label}>Expiry date {!cardDetail.cardExpiry && "*"}:</h3>
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
                            <h3 className={styles.label}>Expiry Holder Name {!cardDetail.cardHolderName && "*"}:</h3>
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
                </div>
            }

            {(window.innerWidth > 1000 && setStep) &&
                <div className={styles.btns}>
                    <button
                        onClick={() => {
                            setStep(1)
                            setWalletState({})
                            setSelectedSaveCard({})
                        }}
                    >Back</button>
                    <button
                        style={{ color: "white", backgroundColor: "#5926F0", opacity: disabledBtnS && 0.4 }}
                        disabled={disabledBtnS}
                        onClick={() => {
                            setStep(3)
                        }}
                    >
                        Continue
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="15" viewBox="0 0 14 15" fill="none">
                            <path d="M5.25 11L8.75 7.5L5.25 4" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>

                    </button>
                </div>
            }

        </div>
    )
}

export default PaymentStep