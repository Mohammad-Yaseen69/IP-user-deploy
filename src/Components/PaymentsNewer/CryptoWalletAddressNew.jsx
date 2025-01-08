import { Check, ChevronRight } from "react-feather"
import { useTranslation } from "react-i18next"
import { Button, Card, CardBody } from "reactstrap"
import copy from "./files/copy.png"
import { useState } from "react"
import CountdownTimer from "./CountDown"
import timer from "./files/timer.png"

const isBig = window.innerWidth > 1000

const CryptoWalletAdressNew = ({ setSubStep, cryptoCurrency, walletAddress }) => {
    const { t } = useTranslation()
    const [copied, setCopied] = useState(false)
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
                gap: window.innerWidth < 1500 ? "10px" : "14px",
                borderRadius: "12px",
                padding: isBig ? "2rem" : "5px",
                background: isBig ? "rgba(0,0,0,.03)" : "transparent",
                paddingBottom: 0,
                boxShadow: isBig ? "0px 18px 15.348464965820312px -15px rgba(89, 38, 240, 0.16)" : "none"
            }} className="i_t_pt">
                <h5 style={{ textAlign: "center", fontWeight: 600 }} className="c_f_w_head">Send the payment to the below wallet address</h5>

                <div style={{
                    width: "!00%",
                    background: "linear-gradient(135deg, #5926F0 0%, #DB24F9 100%), #FFF",
                    borderRadius: "16px",
                    padding: "1.5rem",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                }} className="card_crypto">
                    <div style={{
                        display: "flex",
                        justifyContent: "space-between"
                    }}>
                        <div>
                            <p style={{ color: "#698AFF", marginBottom: ".2rem" }}>Crypto To Fiat</p>
                            <h2 style={{ marginBottom: ".2rem", fontWeight: 900, color: "white" }}>{cryptoCurrency.name}</h2>
                            <h4 style={{ marginBottom: 0, color: "white" }}>({cryptoCurrency.value.toUpperCase()})</h4>
                        </div>
                        <div>
                            <img src={cryptoCurrency.img} alt={cryptoCurrency.value} style={{
                                borderRadius: 15
                            }} />
                        </div>
                    </div>
                    <div style={{
                        padding: "10px",
                        background: "rgba(217, 217, 217, 0.30)",
                        boxShadow: "0px 18px 14px -14px rgba(0, 0, 0, 0.12)",
                        border: "1px dashed #fff",
                        borderRadius: 10,
                        display: "flex",
                        alignItems: "center",
                        gap: "1rem",
                        minHeight: "53px"
                    }}>
                        <span style={{ color: "white", flex: 1, whiteSpace: "nowrap", overflow: "hidden" }}>{walletAddress}</span>
                        {
                            copied
                                ?
                                <Check color="white" />
                                :
                                <img src={copy} alt="c" onClick={() => {
                                    setCopied(true)
                                    setTimeout(() => {
                                        setCopied(false)
                                    }, 3000)
                                }} />
                        }
                    </div>
                </div>

                <div style={{
                    display: "flex",
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: "#fff",
                    borderRadius: "12px",
                    boxShadow: "0px 18px 15.348464965820312px -15px rgba(89, 38, 240, 0.16)"
                }} className="timer_cont">
                    <span style={{
                        padding: ".5rem",
                        fontSize: ".7rem",
                        fontWeight: 700,
                        marginBottom: 0,
                        background: "#F5F2FE",
                        borderRadius: "9px"
                    }}>Time remaining</span>
                    <CountdownTimer initialTime={3600} onTimeEnd={() => "a"} />
                    {/* // console.log("Hello")} /> */}
                </div>

                <div style={{
                    display: "flex",
                    padding: ".75rem 1rem",
                    background: "#ffe3c2",
                    justifyContent: "center",
                    gap: "1rem",
                    borderRadius: "10px",
                    alignItems: "center",
                    color: "#EB8C1D",
                }} >
                    <img src={timer} alt="t" width={30} />
                    <p style={{ marginBottom: 0 }} className="orange_warning">The allocated wallet address will be changed after
                        &nbsp;<span style={{ fontSize: "1.1rem", fontWeight: 700 }}>60 minutes</span>, (if the transaction remains incomplete).</p>
                </div>
            </CardBody>
            <div style={{
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "flex-end",
                gap: ".5rem",
                flexWrap: "wrap",
                paddingLeft: isBig ? "1rem" : "0px",
                marginTop: "1rem"
            }}>
                <Button size="sm" style={{
                    border: "none",
                    outline: "none",
                    background: " linear-gradient(to right, rgba(0, 0, 0, 0.40) 0%, rgba(0, 0, 0, 0.40) 100%), linear-gradient(to left, #E64067 0%, #5926F0 55.65%, #4828A0",
                    backgroundBlendMode: "overlay, normal",
                    boxShadow: "0px 11.90068244934082px 8.655041694641113px -5.409400939941406px rgba(89, 38, 240, 0.17)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    width: isBig ? "60%" : "100%",
                    minWidth: "fit-content",
                    padding: ".75rem 2rem",
                    borderRadius: "12px"
                }}
                    className="i_t_button"
                    onClick={() => {
                        setSubStep(prev => prev + 1)
                    }}
                >
                    {t("Next")} <ChevronRight size={20} />
                </Button>
            </div>
        </Card>
    )
}

export default CryptoWalletAdressNew