import React, { useContext, useEffect, useLayoutEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from 'reactstrap'
import { UserContext } from '../../../Context/UserContext'
import { encryptData } from '../../../Helper/EssentilaMethods/Encryption'
import { decryptData } from '../../../Helper/EssentilaMethods/Decryption'
import axios from 'axios'
import { AlertCircle, Check } from 'react-feather'
import bd from "../files/bd.png"
import cp from "../files/cp.png"
import mw from "../files/mw.png"
import pc from "../files/pc.png"
import cw from "../files/cw.png"
import styles from "./styles/PayoutChannel.module.css"
import { useLocation } from 'react-router'

const PayoutChannel = ({ payoutChannel, setPayoutChannel, setStep, services = [], country = "", setSubServices }) => {
    const { t } = useTranslation()
    const { userDetails } = useContext(UserContext)
    const [isLoading, setIsLoading] = useState(true)
    const payoutChannelData = [
        userDetails?.level?.international_transfer?.bank ? {
            name: "Bank Transfer",
            id: 2,
            icon: bd,
            value: "bank"
        } : { id: 100 },
        userDetails?.level?.international_transfer?.cash_pickup ? {
            name: "Cash Pickup",
            id: 3,
            icon: cp,
            value: "cash"
        } : { id: 100 },
        userDetails?.level?.international_transfer?.mobile_money ? {
            name: "Mobile Wallet",
            id: 1,
            icon: mw,
            value: "mobile"
        } : { id: 100 },
        userDetails?.level?.international_transfer?.card_payment ? {
            name: "Payment Card",
            id: 4,
            icon: pc,
            value: "card"
        } : { id: 100 },
        // {
        //     name: "Crypto Wallet",
        //     id: 4,
        //     icon: cw,
        //     value: "crypto"
        // },
    ]

    const channels = useMemo(() => {
        return payoutChannelData.filter(i => {
            return services.some(j => {
                return j.id === i.id
            })
        })
    }, [services])


    useEffect(() => {
        if (payoutChannel && country) {
            const data = { country: country.alpha3, id: payoutChannel.id }
            const encrypted = encryptData(data)
            axios.post(`${process.env.REACT_APP_THUNES_API}/payerInfo`, {
                data: encrypted
            })
                .then(res => {
                    setSubServices(decryptData(res.data.data))
                    setIsLoading(false)
                })
                .catch(err => {
                    // console.log(err)
                })
        }
    }, [payoutChannel])
    // url queries
    const location = useLocation()
    const queryParams = new URLSearchParams(location.search)
    const url_service = queryParams.get("service_id")

    useLayoutEffect(() => {
        if (channels.length > 0 && url_service) {
            const chan = channels.find(item => item?.id == url_service)

            setPayoutChannel(chan)
            if (!isLoading) {
                setStep(prev => prev + 1)
            }
        }
    }, [url_service, channels, isLoading])
    return (
        <div className={styles.container}>
            <h5>{t("Select Payout Channel")}</h5>
            <div className={styles.cards}>

                {
                    channels.length > 0
                        ?
                        channels.map(item => (
                            <div className={styles.card} onClick={() => setPayoutChannel(item)}>
                                <div className={styles.left}>
                                    <div className={styles.icon}>
                                        <img src={item.icon} alt={item.id} />
                                    </div>
                                    <span>{item.name}</span>
                                </div>
                                <div className={styles.right}>
                                    {
                                        payoutChannel?.name === item.name
                                            ?
                                            <div>
                                                <Check />
                                            </div>
                                            :
                                            <AlertCircle color="#b8b8b8" />
                                    }
                                </div>
                            </div>
                        ))
                        :
                        <div>No Available Payout channels</div>
                }
            </div>
            <Button className={styles.button} disabled={!payoutChannel} onClick={() => setStep(prev => prev + 1)}>
                {t("Continue")}
            </Button>
        </div>
    )
}

export default PayoutChannel