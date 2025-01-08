import { Check, ChevronRight, HelpCircle } from "react-feather";
import { useTranslation } from "react-i18next";
import { Button, Card, CardBody } from "reactstrap";
import instant from "./files/instant.png"
import schedule from "./files/schedule.png"
import subscription from "./files/subscription.png"
import security from "./files/security.png"
import instalment from "./files/instalment.png"
import split from "./files/split.png"

const PaymentType = ({ setSubStep, paymentMethod, setPaymentMethod, setNotInstant }) => {
    const { t } = useTranslation()
    const data = [
        {
            name: t("Instant Payment"),
            icon: instant,
            value: "instant"
        },
        {
            name: t("Subscription Payment"),
            icon: subscription,
            value: "subscription"
        },
        {
            name: t("Schedule Payment"),
            icon: schedule,
            value: "schedule"
        },
        {
            name: t("Security Deposit"),
            icon: security,
            value: "security"
        },
        {
            name: t("Instalment Payment"),
            icon: instalment,
            value: "instalment"
        },
        {
            name: t("Split Payment"),
            icon: split,
            value: "split"
        },
    ]

    return (
        <Card style={{
            // height: "100%",
            height: "fit-content",
            marginBottom: 0,
            boxShadow: "none",
            gap: "1.3rem",
            maxHeight: "540px"
        }}>
            <CardBody style={{
                paddingBottom: "0",
                display: "flex",
                flexDirection: "column",
                gap: "14px",
                borderRadius: "20px",
                padding: "1.5rem",
                background: "rgba(0,0,0,.03)",
                paddingBottom: 0
            }}>
                {
                    data.map(item => (
                        <Card key={item.name} style={{ marginBottom: 0 }} onClick={() => {
                            setPaymentMethod(item)
                        }}>
                            <CardBody style={{
                                display: "flex",
                                alignItems: "center",
                                gap: ".5rem",
                                padding: "15px",
                                justifyContent: "space-between",
                                cursor: "pointer",
                                borderRadius: "10px"
                            }}>
                                <div style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "20px"
                                }}>
                                    <div style={{
                                        height: "35px",
                                        width: "35px",
                                        background: "linear-gradient(341deg, #E64067 0%, #5926F0 55.65%, #4828A0 100%), #D9D9D9",
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
                                    <h5 style={{ marginBottom: 0, fontSize: "1.2rem" }}>{item.name}</h5>
                                </div>
                                {
                                    paymentMethod?.name === item.name
                                    &&
                                    <Check color="green" />
                                }
                            </CardBody>
                        </Card>
                    ))
                }
            </CardBody>
            <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: ".5rem",
                flexWrap: "wrap",
                paddingLeft: "1rem"
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
                    gap: "12px",
                    padding: "7px 24px",
                    fontSize: "16px"
                }}
                    onClick={() => {
                        if (paymentMethod.value === "instant") {
                            setSubStep(prev => prev + 1)
                        }
                        else {
                            setNotInstant(true)
                        }
                    }}
                    disabled={!paymentMethod}
                >
                    {t("Confirm")} <ChevronRight size={20} />
                </Button>
            </div>
        </Card>
    )
}

export default PaymentType;