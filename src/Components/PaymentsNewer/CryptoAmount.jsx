import { ChevronRight, HelpCircle } from "react-feather"
import { useTranslation } from "react-i18next"
import { Button, Card, CardBody, Input } from "reactstrap"
import { NumberInputValidator } from "../../Helper/NumberInput"
import { NumberSeperator } from "../../Helper/NumberSeperator"
import { useEffect, useState } from "react"

const CryptoAmount = ({ setSubStep, amount, setAmount, cryptoCurrency }) => {
    const { t } = useTranslation()
    const [exchanged, setExhanged] = useState()

    useEffect(() => {
        const value = amount?.split(",").join("")
        setExhanged(+value * 0.000034)
    }, [amount])
    return (
        <Card style={{
            height: "100%",
            marginBottom: 0,
            boxShadow: "none",
        }}>
            <CardBody style={{
                background: "rgba(0,0,0,.03)",
                borderRadius: "20px",
                flex: "1",
                overflow: "hidden",
                padding: "30px 20px",
                paddingBottom: 0,
                boxShadow: "0px 18px 15.348464965820312px -15px rgba(89, 38, 240, 0.16)"
            }}>
                <div>
                    <p style={{ fontSize: "1rem", color: "#7d7d7d" }}>{t("Enter the amount")} {t("(This will be in USD)")}</p>
                    <div style={{
                        background: "linear-gradient(to bottom right, #EC2AB6 0%, #5926F0 100%)",
                        border: "0.5px solid rgba(0, 0, 0, 0.08)",
                        boxShadow: "0px 4.456576347351074px 132.58314514160156px 0px rgba(0, 0, 0, 0.11)",
                        borderRadius: "24px",
                        padding: "12px",
                        display: "flex",
                        alignItems: "center"
                    }}>
                        <h4 style={{ marginBottom: 0, color: "white", fontSize: "1.3rem", fontWeight: 400, transform: "translate(15px, 5px)" }}>
                            $
                        </h4>
                        <Input
                            type="text"
                            placeholder="Amount"
                            value={amount}
                            onChange={(e) => {
                                setAmount(e.target.value)
                                NumberSeperator(e.target.value, setAmount)
                            }}
                            style={{
                                width: "100%",
                                border: "none",
                                flex: 1,
                                background: "transparent",
                                color: "white",
                                fontSize: "2.5rem",
                                paddingLeft: "1.6rem"
                            }}
                            onKeyPress={NumberInputValidator}
                        />
                    </div>
                </div>
                <div style={{
                    padding: ".6rem 1rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: ".4rem",
                    marginTop: "1rem"
                }}>
                    <p style={{
                        marginBottom: "3px",
                        display: "flex",
                        justifyContent: "space-between"
                    }}>
                        <span style={{ color: "#a0a0a0" }}>{t("Exchange Rate:")}</span>
                        <span style={{ color: "#a0a0a0" }}>$3,422</span>
                    </p>
                </div>
                {
                    exchanged
                        ?
                        <div style={{ display: "flex", alignItems: "center", gap: ".7rem", marginTop: "3rem" }}>
                            <img src={cryptoCurrency.img} alt={cryptoCurrency.value} width={70} />
                            <h4 style={{ marginBottom: 0, fontSize: "2rem", fontWeight: 900 }}>{exchanged.toFixed(3)} {cryptoCurrency.value.toUpperCase()}</h4>
                        </div>
                        :
                        ""
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
                <p style={{ fontSize: ".6rem", display: "flex", alignItems: "center", gap: ".3rem", marginBottom: "0" }}>
                    <HelpCircle size={12} />
                    <span>{t("Trouble Sending Money?")}</span>
                </p>
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
                    onClick={() => {
                        setSubStep(prev => prev + 1)
                    }}
                    disabled={!amount}
                >
                    {t("Confirm")} <ChevronRight size={20} />
                </Button>
            </div>
        </Card>
    )
}

export default CryptoAmount;