import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import BasicInfoForm from "./BasicInfoForm";
import "./loader.css"
import CardTiles from "./CardTiles";
import BankDepositForm from "./BankDepositForm";
import CryptoWallet from "./CryptoWallet";

const LoadBalance = () => {
    const navigate = useNavigate();
    const [iframeSrc, setIframeSrc] = useState("");
    const [amount, setAmount] = useState("")
    const [currency, setCurrency] = useState("USD")
    const [wallet, setWallet] = useState("")
    const [isLoading, setIsLoading] = useState(true);
    const [mobileView, setMobileView] = useState(window.innerWidth < 670)
    const [showIframe, setShowIframe] = useState(false)
    const [currentForm, setCurrentForm] = useState("")
    const [formHeading, setFormHeading] = useState("")
    const [iframeHeading, setIframeHeading] = useState("")

    const secondFormSubmit = (event) => {
        event.preventDefault();
        const form = event.target;
        const formData = new FormData(form);
        const url = "https://payments.securetrading.net/process/payments/choice";
        const params = new URLSearchParams(formData);
        setIframeSrc(`${url}?${params.toString()}`);
    }

    const handleLoad = () => {
        setIsLoading(false);
    };

    const handleWindowResize = () => {
        if (window.innerWidth < 670) {
            setMobileView(true)
        } else {
            setMobileView(false)
        }
    }

    useEffect(() => {
        window.addEventListener("resize", handleWindowResize)
        return () => {
            window.removeEventListener("resize", handleWindowResize)
        }
    }, [])

    const goBackHandler = () => {
        if (!iframeSrc && !showIframe) {
            navigate(-1)
        } else if (!showIframe && iframeSrc && !currentForm) {
            setIframeSrc("")
        } else if (!showIframe && iframeSrc && currentForm) {
            setCurrentForm("")
        } else {
            setShowIframe(false)
        }
        setIsLoading(true)
    }

    return (
        <>
            <button onClick={goBackHandler} style={{
                all: "unset",
                color: "var(--theme-default)",
                fontSize: ".9rem",
                marginBottom: "1rem",
                paddingLeft: ".5rem",
                cursor: "pointer"
            }}>&larr; &nbsp; Go Back</button>
            {iframeSrc
                ?
                <>
                    <div style={{
                        // position: showIframe && "absolute",
                        height: "100%",
                        width: "calc(100% + 30px)",
                        right: "-30px",
                        display: "flex",
                        gap: "1rem",
                        paddingLeft: "1rem",
                        flexWrap: mobileView ? "wrap" : "nowrap",
                        zIndex: 1
                    }}>
                        <div className="card" style={{
                            padding: "1.5rem",
                            width: "fit-content",
                            minWidth: "300px",
                            maxWidth: "450px",
                            gap: "2rem",
                            margin: "0 auto 1.5rem",
                            height: "fit-content",
                        }}>
                            <h4>Previous Details</h4>
                            <div style={{
                                marginTop: "1rem",
                                padding: "1rem 0",
                                borderTop: "1px solid rgba(128, 128, 128, 0.5)",
                                borderBottom: "1px solid rgba(128, 128, 128, 0.5)",
                                width: "100%",
                            }}>
                                <div style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    padding: "0 .5rem",
                                }}>
                                    <p>Wallet</p>
                                    <p>{wallet}</p>
                                </div>
                                <div style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    padding: "0 .5rem",
                                }}>
                                    <p>Amount</p>
                                    <p>{amount} {currency}</p>
                                </div>
                            </div>
                        </div>
                        {
                            showIframe
                            &&
                            <>
                                {
                                    isLoading &&
                                    <div className="loader__container">
                                        <div className="_loader"></div>
                                    </div>

                                }
                                <iframe src={iframeSrc} style={{ width: "100%", minHeight: "calc(100vh - 100px)", height: "fit-content" }} onLoad={handleLoad} />
                            </>
                        }
                        {
                            currentForm === "bd"
                            &&
                            <BankDepositForm amount={amount} currency={currency} formHeading={formHeading} />
                        }
                        {
                            currentForm === "cw"
                            &&
                            <CryptoWallet formHeading={formHeading} />
                        }
                        {
                            !showIframe && !currentForm
                            &&
                            <CardTiles ssi={setShowIframe} scf={setCurrentForm} setFormHeading={setFormHeading} />
                        }
                    </div>
                </>
                :
                <BasicInfoForm amount={amount} setAmount={setAmount} currency={currency} setCurrency={setCurrency} wallet={wallet} setWallet={setWallet} formHandler={secondFormSubmit} />
            }
        </>
    )
}

export default LoadBalance;
