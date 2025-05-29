import bd from "./files/bd.png"
import cp from "./files/cp.png"
import mw from "./files/mw.png"
import pc from "./files/pc.png"
import cw from "./files/cw.png"
import i from "./files/i.svg"
import { Button, Card, CardBody } from "reactstrap"
import { useTranslation } from "react-i18next"
import { Check, ChevronRight, HelpCircle } from "react-feather"
import { useContext, useEffect, useLayoutEffect, useMemo, useState } from "react"
import { encryptData } from "../../Helper/EssentilaMethods/Encryption"
import { decryptData } from "../../Helper/EssentilaMethods/Decryption"
import axios from "axios"
import { UserContext } from "../../Context/UserContext"
import { useLocation } from "react-router"


export const payoutChannelData = [
    {
        name: "Bank Transfer",
        id: 2,
        icon: bd,
        value: "bank"
    },
    {
        name: "Cash Pickup",
        id: 3,
        icon: cp,
        value: "cash"
    },
    {
        name: "Mobile Wallet",
        id: 1,
        icon: mw,
        value: "mobile"
    },
    {
        name: "Payment Card",
        id: 5,
        icon: pc,
        value: "card"
    },
    {
        name: "Crypto Wallet",
        id: 4,
        icon: cw,
        value: "crypto"
    },
]

const PayoutChannel = ({ payoutChannel, setPayoutChannel, setSubStep, services = [], country = "", setSubServices }) => {
    const { t } = useTranslation()
    const { userDetails } = useContext(UserContext)
    const [isLoading, setIsLoading] = useState(true)
    const {authHeader} = useContext(UserContext)

    const payoutChannelData = [
        userDetails?.level?.international_transfer?.bank ? {
            name: "Bank Transfer",
            id: 2,
            icon: bd,
            value: "bank",
        } : { id: 100 },
        userDetails?.level?.international_transfer?.cash_pickup ? {
            name: "Cash Pickup",
            id: 3,
            icon: cp,
            value: "cash",
        } : { id: 100 },
        userDetails?.level?.international_transfer?.mobile_money ? {
            name: "Mobile Wallet",
            id: 1,
            icon: mw,
            value: "mobile",
        } : { id: 100 },
        userDetails?.level?.international_transfer?.card_payment ? {
            name: "Payment Card",
            id: 4,
            icon: pc,
            value: "card",
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
            }, { headers: authHeader })
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
                setSubStep(prev => prev + 1)
            }
        }
    }, [url_service, channels, isLoading])

    return (
        <Card style={{
            marginBottom: 0,
            boxShadow: "none",
            height: "100%"
        }}>
            <CardBody style={{
                paddingBottom: "0",
                display: "flex",
                flexDirection: "column",
                gap: "14px",
                borderRadius: "12px",
                padding: "1.5rem",
                background: "rgba(0,0,0,.03)",
                paddingBottom: 0,
                boxShadow: "0px 18px 15.348464965820312px -15px rgba(89, 38, 240, 0.16)"
            }}>
                {
                    channels.length > 0
                        ?
                        channels.map(item => (
                            <Card key={item.name} style={{ marginBottom: 0, borderRadius: "12px" }} onClick={() => {
                                setPayoutChannel(item)
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
                                            <img src={item.icon} draggable="false" alt={item.name[0]} style={{
                                                width: "19px",
                                                objectFit: "contain",
                                                aspectRatio: 1
                                            }} />
                                        </div>
                                        <h5 style={{ marginBottom: 0, fontSize: "1.2rem" }}>{t(item.name)}</h5>
                                    </div>
                                    {
                                        payoutChannel?.name === item.name
                                            ?
                                            <Check color="green" size={24} style={{ position: "absolute", right: "20px" }} />
                                            :
                                            <img src={i} alt="i" style={{ objectFit: "cover", position: "absolute", right: "14px", top: "19px" }} />
                                    }
                                </CardBody>
                            </Card>
                        ))
                        :
                        <span>No payment method supported at the moment.</span>
                }
            </CardBody>
            <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-end",
                gap: ".5rem",
                flexWrap: "wrap",
                paddingLeft: "1rem",
                marginTop: "1rem"
            }}>
                <a href="https://insta-pay.ch/faq" style={{ fontSize: ".7vw", display: "flex", alignItems: "center", gap: ".3rem", marginBottom: "0", color: "#2b2b2b" }}>
                    <HelpCircle size={12} />
                    <span>{t("Trouble Sending Money?")}</span>
                </a>
                <Button size="sm" style={{
                    border: "none",
                    outline: "none",
                    background: " linear-gradient(to right, rgba(0, 0, 0, 0.40) 0%, rgba(0, 0, 0, 0.40) 100%), linear-gradient(to left, #E64067 0%, #5926F0 55.65%, #4828A0",
                    backgroundBlendMode: "overlay, normal",
                    boxShadow: "0px 11.90068244934082px 8.655041694641113px -5.409400939941406px rgba(89, 38, 240, 0.17)",
                    borderRadius: "6px",
                    display: "flex",
                    alignItems: "center",
                }}
                    className="i_t_button"
                    onClick={() => setSubStep(prev => prev + 1)}
                    disabled={!payoutChannel}
                >
                    {t("Confirm")} <ChevronRight size={20} />
                </Button>
            </div>
        </Card>
    )
}

export default PayoutChannel;