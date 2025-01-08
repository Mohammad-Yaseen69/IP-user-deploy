import React from 'react'
import { Card, CardBody } from 'reactstrap'
import { payoutChannelData } from '../../PaymentsNewer/PayoutChannel'
import iw from "../../../assets/images/logo/logo_white.png"
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

const payoutChannels = [
    ...payoutChannelData,
    {
        name: "InstaPay Wallet",
        id: 7,
        icon: iw,
        value: "wallet"
    },
]

const PaymentMethod = ({ setPaymentMethod, item, setStep }) => {
    const { t } = useTranslation()

    const channels = payoutChannels?.filter(i => {
        return item?.account_type?.some(j => {
            return j.toLowerCase() === i.value.toLowerCase()
        })
    })

    const generateLink = (channel) => {
        if (channel?.value == "wallet") {
            return `/payments?payment_action=send_money&send_type=wallet&wallet_id=${item?.wallet?.[0]?.wallet_id ?? ""}`
        } else {
            return `/payments?payment_action=send_money&send_type=international&service_id=${channel?.id}&recipient=${item?._id}&country=${item?.country_iso_code}&payer_id=${item?.mobile_wallet?.[0]?.money_provider}`
        }
    }
    console.log(item)
    return (
        <>
            {
                channels.map(channel => (
                    <Link className="card" to={generateLink(channel)} key={channel?.name} style={{ marginBottom: 0, borderRadius: "12px", cursor: "pointer" }} onClick={() => {
                        setPaymentMethod(channel)
                        setStep(2)
                    }}>
                        <CardBody style={{
                            display: "flex",
                            alignItems: "center",
                            gap: ".5rem",
                            padding: "15px",
                            justifyContent: "space-between",
                            cursor: "pointer",
                            position: "relative",
                        }}>
                            <div style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "20px"
                            }}>
                                <div style={{
                                    height: "35px",
                                    width: "35px",
                                    background: "linear-gradient(-24deg, rgb(210, 60, 122) 0%, rgb(164, 52, 167) 43.66%, rgb(88, 38, 239) 100%)",
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    borderRadius: "12px",
                                    boxShadow: "0px 4px 7px rgba(172, 53, 159, 0.31)"
                                }}>
                                    <img src={channel?.icon} draggable="false" alt={channel?.name[0]} style={{
                                        width: channel.name === "InstaPay Wallet" ? "15px" : "19px",
                                        objectFit: "contain",
                                        aspectRatio: 1
                                    }} />
                                </div>
                                <h5 style={{ marginBottom: 0, fontSize: "1.2rem", color: "black" }}>{t(channel?.name)}</h5>
                            </div>
                        </CardBody>
                    </Link>
                ))
            }
        </>
    )
}

export default PaymentMethod