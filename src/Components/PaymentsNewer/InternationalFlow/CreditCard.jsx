import React, { useContext, useEffect, useState } from 'react'
import { UserContext } from '../../../Context/UserContext'
import axios from 'axios'
import { decryptData } from '../../../Helper/EssentilaMethods/Decryption'
import styles from "./styles/creditcard.module.css"
import { useTranslation } from 'react-i18next'
import logo_w from "../../../assets/images/logo/logo_white.png"
import { Check } from 'react-feather'
import CreditCardInput from '../../CreditInput'
import TrustpaymentPage from '../../AddFunds/WalletFund/CreditTransaction'
import { Input } from 'reactstrap'
import { encryptData } from '../../../Helper/EssentilaMethods/Encryption'
import { toast } from 'react-toastify'
// import green from "../../AddFunds/files/gy_card.png"
// import purple from "../../AddFunds/files/pb_card.png"
// import red from "../../AddFunds/files/rb_card.png"

const CreditCard = ({ data, dataHandler, url, tokenUrl, showCards = true, showSave = true, guest }) => {
    const { t } = useTranslation()
    const { userDetails, authHeader } = useContext(UserContext)
    const [cards, setCards] = useState([])

    useEffect(() => {
        const getSavedCards = async () => {
            try {

                const res = await axios.get(`${process.env.REACT_APP_IP_DEV_API}/api/trust-payment/get-user-pan-list/${userDetails?._id}`, {
                    headers: authHeader
                })
                const dec = decryptData(res.data.data)
                console.log(dec)
                setCards(dec?.panList)

            } catch {
                setCards([])
            }
        }

        if (userDetails?._id) {
            getSavedCards()
        }
    }, [userDetails])
    const expiryCheck = async (item) => {
        try {
            const response = await axios.post(`${process.env.REACT_APP_IP_DEV_API}/api/trust-payment/check-card-expiry`, { data: encryptData({ card_id: item._id }) }, {
                headers: authHeader
            })

            const dec = decryptData(response.data.data)
            if (dec.isExpired) {
                dataHandler("selectedSavedCard", {})
                dataHandler("cards", data.cards.filter(card => card._id !== item._id))
                toast.error(dec.message)
            }
        } catch (error) {
            const dec = decryptData(error?.response?.data?.data)
            console.log(dec)
        }

    }

    return (
        <div className={styles.container}>
            {
                showCards
                &&
                <>
                    <h5>{t("Select Payment Card")}</h5>
                    {
                        cards.length > 0
                        &&
                        <div className={styles.cards}>
                            {
                                cards.map(item => (
                                    <div key={item?._id} className={styles.card} onClick={() => {
                                        dataHandler("cardHolderName", "")
                                        dataHandler("expiry", "")
                                        dataHandler("cardNumber", "")
                                        dataHandler("cardError", "")
                                        dataHandler("cvc", "")
                                        dataHandler("selectedSavedCard", item)
                                        expiryCheck(item)

                                    }}>
                                        <div className={styles.c_top}>
                                            <img src={logo_w} alt="" />
                                        </div>
                                        <div className={styles.c_bot}>
                                            <span>XXXX XXXX XXXX {item?.last4}</span>
                                            {
                                                data.selectedSavedCard?._id === item?._id
                                                &&
                                                <Check style={{ color: "white" }} size={20} />
                                            }
                                        </div>
                                    </div>
                                ))
                            }
                        </div>
                    }
                </>
            }
            <div style={{ padding: guest && "0", border: guest && "none" }} className={styles.card_details}>
                {!guest && <h5>{t("add card payment")}</h5>}
                <CreditCardInput
                    cardCvc={data.cvc}
                    setCardCvc={(e) => {
                        dataHandler("cvc", e)
                    }}
                    cardHolderName={data.cardHolderName}
                    setCardHolderName={(e) => {
                        dataHandler("cardHolderName", e)
                        dataHandler("selectedSavedCard", {})
                    }}
                    cardExpiry={data.expiry}
                    setCardExpiry={(e) => {
                        dataHandler("expiry", e)
                        dataHandler("selectedSavedCard", {})
                    }}
                    cardNumber={data.cardNumber}
                    setCardNumber={(e) => {
                        dataHandler("cardNumber", e)
                        dataHandler("selectedSavedCard", {})
                    }}
                    cardNumberError={data.cardError}
                    setCardNumberError={(e) => {
                        dataHandler("cardError", e)
                        dataHandler("selectedSavedCard", {})
                    }}
                    guest={guest}
                />
                {
                    showSave
                    &&
                    <div style={{ display: "flex", alignItems: "center", gap: ".4rem", cursor: "pointer", marginTop: ".7rem" }}>
                        <Input id='save_info' style={{ cursor: "pointer" }} type="checkbox" checked={data?.saveCard} onChange={e => dataHandler("saveCard", e.target.checked)} />
                        <label style={{ marginBottom: 0, color: "#8b8b8b", cursor: "pointer" }} htmlFor='save_info'>{t("save details to use next time.")}</label>
                    </div>
                }
                {
                    data.cardTransactionDetails?.intlToken || data.cardTransactionDetails?.w2w_data
                        ?
                        <TrustpaymentPage
                            amount={data.exchange_rate?.total ?? data.amount}
                            card_cvc={data.cvc}
                            card_expiry={data.expiry}
                            card_number={data.cardNumber}
                            currency={data.currency_wallet?.currency?.code}
                            transaction={data.cardTransactionDetails}
                            paymentWithSavedCard={data.selectedSavedCard?._id ? true : false}
                            url={url}
                            // tokenUrl={(token) => `${process.env.REACT_APP_IP_DEV_API}/api/trust-payment/confirm-international-transaction/${data.cardTransactionDetails?.transaction_id}/${token}`}
                            tokenUrl={tokenUrl}
                        />
                        :
                        <></>
                }
            </div>
        </div>
    )
}

export default CreditCard