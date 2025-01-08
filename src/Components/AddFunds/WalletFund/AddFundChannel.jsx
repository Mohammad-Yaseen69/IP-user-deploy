import bd from "../../PaymentsNewer/files/bd.png"
import mw from "../../PaymentsNewer/files/mw.png"
import pc from "../../PaymentsNewer/files/pc.png"
import i from "../../PaymentsNewer/files/i.svg"
import { Badge, Button, Card, CardBody } from "reactstrap"
import { useTranslation } from "react-i18next"
import { Check, ChevronRight } from "react-feather"
import { useContext } from "react"
import { UserContext } from "../../../Context/UserContext"
import TypingSpan from "../../TypingSpan"



const isBig = window.innerWidth > 1000

const AddFundChannel = ({ setChannel, channel, setSubStep, thunesServices, setShowPayers, thunesProviders = [], error }) => {
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
                // coming_soon: userDetails?.level?.topup_channel?.bank === "coming_soon",
                coming_soon: true,
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
                padding: isBig ? "1.5rem" : "5px",
                background: isBig ? "rgba(0,0,0,.03)" : "transparent",
                paddingBottom: 0,
                boxShadow: isBig ? "0px 18px 15.348464965820312px -15px rgba(89, 38, 240, 0.16)" : "none"
            }}>
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
            </CardBody>
            <div style={{
                display: "flex",
                justifyContent: window.innerWidth > 1000 ? "flex-end" : "space-between",
                alignItems: "center",
                gap: "1.5rem",
                flexWrap: "wrap-reverse",
                paddingLeft: isBig ? "1rem" : 0,
                marginTop: "1rem"
            }}>
                <button style={{ border: "none", outline: "none", backgroundColor: "transparent", padding: 0, cursor: "pointer", fontSize: ".9rem", color: "#afafaf" }} onClick={() => setSubStep(prev => prev - 1)}>
                    {t("Back")}
                </button>
                <Button size="sm" style={{
                    border: "none",
                    outline: "none",
                    background: " linear-gradient(to right, rgba(0, 0, 0, 0.40) 0%, rgba(0, 0, 0, 0.40) 100%), linear-gradient(to left, #E64067 0%, #5926F0 55.65%, #4828A0",
                    backgroundBlendMode: "overlay, normal",
                    boxShadow: "0px 11.90068244934082px 8.655041694641113px -5.409400939941406px rgba(89, 38, 240, 0.17)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    width: isBig ? "60%" : "inherit",
                    minWidth: "fit-content",
                    padding: ".75rem 2rem",
                    borderRadius: "12px"
                }}
                    // className="i_t_button"
                    onClick={() => {
                        if (thunesServices.some(item => item?.id === channel?.id)) {
                            setShowPayers(true)
                        } else {
                            setSubStep(prev => prev + 1)
                        }
                    }}
                    disabled={!channel || error}
                >
                    {t("Next")} <ChevronRight size={20} />
                </Button>
            </div>
        </Card>
    )
}

export default AddFundChannel
