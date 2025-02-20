import { Button, Card, CardBody, Input, Label } from "reactstrap";
import file from "./files/file.svg"
import { ChevronRight, HelpCircle } from "react-feather";
import { useTranslation } from "react-i18next";
import { NumberInputValidator } from "../../Helper/NumberInput";
import { useState } from "react";
import styles from "./styles/AmountAndCurrency.module.scss"
import { NumberSeperator } from "../../Helper/NumberSeperator";

const AmountAndCurrency = ({ setSubStep, amount, setAmount, currency, setCurrency, reason, setReason, comment, setComment, setFiles, files, type = "Sending" }) => {
    const { t } = useTranslation()
    const [exchangeRate, setExchangeRate] = useState()
    const data = [
        {
            name: "USD",
        },
        {
            name: "GBP",
        },
        {
            name: "EUR"
        },
    ]

    const reasons = [
        t("Family Support"),
        t("Trade-Related"),
        t("Operating Expenses"),
        t("Goods"),
        t("Services"),
        t("Charity Donation"),
        t("Other")
    ]


    return (
        <Card style={{
            height: "100%",
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
                padding: "14px",
                background: "rgba(0,0,0,.03)",
                paddingBottom: 0
            }}>
                <h5>{t("Enter The Amount")}</h5>
                <div style={{
                    background: "linear-gradient(347deg, #E64067 0%, #5926F0 55.65%, #4828A0 100%), radial-gradient(250.07% 250.07% at 50.00% -150.07%, rgba(89, 38, 240, 0.20) 0%, rgba(89, 38, 240, 0.00) 85.12%), rgba(255, 255, 255, 0.10)",
                    border: "0.5px solid rgba(0, 0, 0, 0.08)",
                    boxShadow: "0px 4.456576347351074px 132.58314514160156px 0px rgba(0, 0, 0, 0.11)",
                    borderRadius: "24px",
                    padding: "12px",
                    display: "flex",
                    alignItems: "center"
                }}>
                    <h4 style={{ marginBottom: 0, color: "white", fontSize: "1.3rem", fontWeight: 400, transform: "translate(15px, 5px)" }}>
                        {currency === "USD" && "$"}
                        {currency === "EUR" && "€"}
                        {currency === "GBP" && "£"}
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
                        className={styles.input}
                        onKeyPress={NumberInputValidator}
                    />
                    <Input type="select" style={{
                        borderRadius: "100px",
                        padding: ".3rem .2rem .2rem .6rem",
                        fontSize: ".7rem",
                        appearance: "none",
                        WebkitAppearance: "none",
                        MozAppearance: "none",
                        width: "60px",
                        border: "none",
                        outline: "none"

                    }} value={currency} onChange={(e) => setCurrency(e.target.value)}>
                        {
                            data.map(item => (
                                <option value={item.name} key={item.name}>{item.name}</option>
                            ))
                        }
                    </Input>
                </div>
                <div style={{
                    padding: ".6rem 1rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: ".4rem"
                }}>
                    <p style={{
                        marginBottom: "3px",
                        display: "flex",
                        justifyContent: "space-between"
                    }}>
                        <span style={{ color: "#a0a0a0" }}>{t("Exchange Rate:")}</span>
                        <span style={{ color: "#a0a0a0" }}>$3,422</span>
                    </p>
                    <p style={{
                        marginBottom: "3px",
                        display: "flex",
                        justifyContent: "space-between"
                    }}>
                        <span style={{ color: "#a0a0a0" }}>{t("Tax")}</span>
                        <span style={{ color: "#a0a0a0" }}>$2</span>
                    </p>
                    <p style={{
                        marginBottom: "3px",
                        display: "flex",
                        justifyContent: "space-between"
                    }}>
                        <span style={{ fontWeight: "600" }}>{t("How much they receive:")}</span>
                        <span style={{ fontWeight: "600" }}>$3,422</span>
                    </p>
                </div>
                <div>
                    <Label style={{ fontWeight: "600", marginBottom: ".5rem" }}>{t("Remarks:")}</Label>
                    <Input type="select" value={reason} onChange={(e) => setReason(e.target.value)} className="mb-2"
                        style={{
                            background: "rgba(89, 38, 240, 0.04)",
                            borderRadius: "10px",
                            appearance: "menulist",
                            fontSize: "1rem",
                            fontWeight: 600,
                            padding: "1rem 1.25rem"
                        }}>
                        <option value="">{t("Select Remark / Reason")}</option>
                        {
                            reasons.map(item => (
                                <option value={item} key={item}>{item}</option>
                            ))
                        }
                    </Input>
                    <div style={{ position: "relative" }}>
                        <Input placeholder="Comments"
                            style={{
                                background: "rgba(89, 38, 240, 0.04)",
                                borderRadius: "10px",
                                appearance: "menulist",
                                fontSize: "1rem",
                                fontWeight: 600,
                                padding: "1rem 8rem 1rem 1.25rem"
                            }} value={comment} onChange={(e) => setComment(e.target.value)} />
                        <Label htmlFor="file" style={{
                            background: "white",
                            padding: ".4rem .5rem",
                            display: "flex",
                            gap: ".4rem",
                            borderRadius: "60px",
                            width: "fit-content",
                            position: "absolute",
                            top: "14px",
                            right: "10px",
                            cursor: "pointer",
                            boxShadow: "0px -1px 32px -3.3496174812316895px rgba(89, 38, 240, 0.36)"
                        }}>
                            <span style={{
                                fontSize: ".6rem",
                                fontWeight: "600",
                                background: "linear-gradient(346deg, #E64067 0%, #5926F0 55.65%, #4828A0 100%)",
                                backgroundClip: "text",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent"
                            }}>{files.length > 0 ? files[0].name : t("Attach Files")}</span>
                            <img src={file} alt="f" style={{ width: "14px" }} />
                        </Label>
                        <Input type="file" id="file" hidden onChange={e => setFiles(e.target.files)} />
                    </div>
                </div>
            </CardBody>
            <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: ".5rem",
                flexWrap: "wrap",
                paddingLeft: "1rem"
            }}>
                <p style={{ fontSize: ".7vw", display: "flex", alignItems: "center", gap: ".3rem", marginBottom: "0" }}>
                    <HelpCircle size={12} />
                    <span>{t(`Trouble ${type} Money?`)}</span>
                </p>
                <Button
                    size="sm"
                    style={{
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
                    disabled={!amount || !currency}
                    onClick={() => setSubStep(prev => prev + 1)}
                >
                    <span>{t("Confirm")}</span>
                    <ChevronRight size={20} />
                </Button>
            </div>
        </Card>
    )
}

export default AmountAndCurrency;