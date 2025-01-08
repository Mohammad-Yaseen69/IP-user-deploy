import i from "../../PaymentsNewer/files/i.svg"
import { Badge, Button, Card, CardBody } from "reactstrap"
import { Check, ChevronRight } from "react-feather"
import { useTranslation } from "react-i18next"

const isBig = window.innerWidth > 1000

const MobileProviders = ({ providers, channel, setProvider, provider, setSubStep, setShowPayer, error = "" }) => {
    const { t } = useTranslation()
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
                    providers.map(item => (
                        <Card key={item?.name} style={{ marginBottom: 0, borderRadius: "12px" }} onClick={() => {
                            if (!item?.active) return;
                            setProvider(item)
                        }}>
                            <CardBody style={{
                                display: "flex",
                                alignItems: "center",
                                gap: ".5rem",
                                padding: "15px",
                                justifyContent: "space-between",
                                cursor: !item?.active ? "not-allowed" : "pointer",
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
                                        <img src={channel?.icon} draggable="false" alt={item?.name?.[0]} style={{
                                            width: "19px",
                                            objectFit: "contain",
                                            aspectRatio: 1
                                        }} />
                                    </div>
                                    <h5 style={{ marginBottom: 0, fontSize: "1.2rem" }}>{t(item?.name)}</h5>
                                </div>
                                {
                                    !item?.active
                                        ?
                                        <Badge color="primary">{t("Coming Soon")}</Badge>
                                        :
                                        provider?.name === item?.name
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
                <button style={{ border: "none", outline: "none", backgroundColor: "transparent", padding: 0, cursor: "pointer", fontSize: ".9rem", color: "#afafaf" }} onClick={() => {
                    setProvider({})
                    setShowPayer(false)
                }}>
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
                        setSubStep(prev => prev + 1)
                    }}
                    disabled={!provider?.name || error}
                >
                    {t("Next")} <ChevronRight size={20} />
                </Button>
            </div>
        </Card>
    )
}

export default MobileProviders