import React, { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { UserContext } from '../../../Context/UserContext'
import bd from "../../PaymentsNewer/files/bd.png"
import mw from "../../PaymentsNewer/files/mw.png"
import pc from "../../PaymentsNewer/files/pc.png"
import i from "../../PaymentsNewer/files/i.svg"
import { Badge, Card, CardBody } from 'reactstrap'
import TypingSpan from '../../TypingSpan'
import { Check } from 'react-feather'


const Channels = ({ setChannel, channel, thunesServices, thunesProviders = [] }) => {
    const { t } = useTranslation()
    const { userDetails } = useContext(UserContext)
    const payoutChannelData = [
        userDetails?.level?.topup_channel?.card_payment
            ?
            {
                name: "Payment Card",
                id: 5,
                icon: pc,
                value: "card",
                coming_soon: userDetails?.level?.topup_channel?.card_payment === "coming_soon",
            }
            :
            {},
        userDetails?.level?.topup_channel?.paypal
            ?
            {
                name: "Paypal",
                id: 5,
                icon: pc,
                value: "paypal",
                coming_soon: userDetails?.level?.topup_channel?.paypal === "coming_soon",
            }
            :
            {},
    ]

    const thunesAllowed = [
        userDetails?.level?.topup_channel?.bank
            ?
            {
                name: "Bank Transfer",
                id: 2,
                icon: bd,
                value: "truelayer",
                coming_soon: true,
                // coming_soon: userDetails?.level?.topup_channel?.bank === "coming_soon",
                sub_name: "bank"
            }
            :
            {},
        userDetails?.level?.topup_channel?.mobile_money
            ?
            {
                name: "Mobile Wallet",
                id: 1,
                icon: mw,
                value: "sofort",
                // coming_soon: userDetails?.level?.topup_channel?.mobile_money === "coming_soon",
                coming_soon: true,
                sub_name: "wallet"
            }
            :
            {},
    ].map(item => thunesServices.some(it => it?.id == item.id) ? item : { ...item, coming_soon: true })
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", maxHeight: "550px", overflowY: "auto" }}>
            {
                [...thunesAllowed, ...payoutChannelData].filter(item => item?.name).map(item => (
                    <Card key={item?.name} style={{ marginBottom: 0, borderRadius: "12px" }} onClick={() => {
                        if (item?.coming_soon) return;
                        setChannel(item)
                    }}>
                        <CardBody style={{
                            display: "flex",
                            alignItems: "center",
                            gap: ".5rem",
                            padding: "15px",
                            justifyContent: "space-between",
                            cursor: item?.coming_soon ? "not-allowed" : "pointer",
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
                                    <img src={item?.icon} draggable="false" alt={item?.name?.[0]} style={{
                                        width: "19px",
                                        objectFit: "contain",
                                        aspectRatio: 1
                                    }} />
                                </div>
                                <h5 style={{ marginBottom: 0, fontSize: "1.2rem" }}>
                                    {t(item?.name) + " "}
                                    {
                                        window.innerWidth < 1000
                                        &&
                                        <br />
                                    }
                                    {
                                        thunesProviders?.length > 0 && item?.sub_name === "wallet"
                                            ?
                                            <>
                                                (<TypingSpan
                                                    words={thunesProviders.map(item => item?.name ?? "")}
                                                />)
                                            </>
                                            :
                                            ""
                                    }
                                </h5>
                            </div>
                            {
                                item?.coming_soon
                                    ?
                                    <Badge color="primary">{t("Coming Soon")}</Badge>
                                    :
                                    channel?.name === item?.name
                                        ?
                                        <Check color="green" size={24} style={{ position: "absolute", right: "20px" }} />
                                        :
                                        <img src={i} alt="i" style={{ objectFit: "cover", position: "absolute", right: "14px", top: "19px" }} />
                            }
                        </CardBody>
                    </Card>
                ))
            }
        </div>
    )
}

export default Channels