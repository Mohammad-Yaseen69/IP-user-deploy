import { Link } from 'react-router-dom'
import useWindowWidth from '../../utils/useWindowWidth'
import { useTranslation } from 'react-i18next'
import vpa_styles from "./styles/VPA.module.css"
import addFunds from "../HomeNewUpdated/files/AddFunds.png"
import CryptoPay from "../HomeNewUpdated/files/CryptoPay.svg"
import logo from "../../assets/images/logo/logo.png"
import { formatCurrency } from '../../Helper/AmountFormat'
import { isInIframe, flagCheck } from '../../utils/Functions'



const AmountContainer = ({ state, url, toggleCreditModal, dataHandler, handleBlur, handleKeyUp, isEditable, paidInvoice = false, toggleCryptoModal = () => { }, userDetails }) => {
    const width = useWindowWidth()
    const { t } = useTranslation()

    const openInNewTab = (url) => {
        const newWindow = window.open(url, "_blank", "noopener,noreferrer");
        if (!newWindow || newWindow.closed || typeof newWindow.closed === "undefined") {
            const a = document.createElement("a");
            a.href = url;
            a.target = "_blank";
            a.rel = "noopener noreferrer";
            a.style.display = "none";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }
    };

    return (
        <div style={{ backgroundColor: 'white', borderRadius: "16px", maxHeight: "100%" }}>
            <div style={{ marginBottom: "0px", gap: "0px", height: "100%" }} className={vpa_styles.container}>
                <div style={{ padding: width < 400 && "20px", height: "100%", padding: paidInvoice ? "0px" : '0px 24px 24px 24px', background: 'white', width: '100%', justifyContent: width > 1000 && "space-between", gap: width < 1000 && "0px" }} className={vpa_styles.right}>
                    <div style={{ flexDirection: width < 1000 && 'column', gap: width < 1000 && '15px' }} className={vpa_styles.top}>
                        <div style={{ margin: 'inherit' }} className={vpa_styles.currency}>
                            <div>{state.currentWallet?.currency?.symbol || state.currencySymbol} </div>
                            <p>{state.currentWallet?.currency?.code || state.currencyCode}</p>
                        </div>

                        {isEditable ? <label >{t("Enter Amount")}</label> : <label >{t("Amount")}</label>}
                    </div>
                    <div style={{ margin: paidInvoice ? "20px 0px 0px 0px" : width < 1000 ? "0 0 2rem" : '.5rem 0' }} className={vpa_styles.amount}>
                        <div style={{ justifyContent: "center", gap: "5px" }}>
                            {width > 1000 && <span>{state.currentWallet?.currency?.code || state.currencyCode} </span>}

                            {isEditable ? <input
                                type="text"
                                value={state.formattedAmount}
                                maxLength={12}
                                onChange={(e) => dataHandler("formattedAmount", e.target.value)}
                                onKeyUp={handleKeyUp}
                                onBlur={handleBlur}
                                placeholder="10.00"
                                data-type="currency"
                                style={{
                                    outlineColor: "white",
                                    border: "none",
                                    outline: "none",
                                    width: "100%",
                                    textAlign: width < 1000 ? "center" : "left"
                                }}
                            /> : <span style={{ textAlign: 'left' }} >{formatCurrency(state.amount, true)} </span>}

                        </div>
                    </div>
                    {!paidInvoice &&
                        <>
                            <div
                                style={{
                                    margin: '0',
                                    display: width > 1000 && width < 1350 && "grid",
                                    gridTemplateColumns: width > 1000 && width < 1350 && "1fr 1fr 1fr"
                                }}
                                className={vpa_styles.buttons}
                            >
                                <div title={!flagCheck("payments.allowGuestPay", userDetails, "paymentAddress") ? t("This method is disabled for this payment address by admin.") : ""} style={{ position: "relative" }}>
                                    <Link onClick={flagCheck("payments.allowGuestPay", userDetails, "paymentAddress") ? toggleCreditModal : (e) => e.preventDefault()} className={`${vpa_styles.button} ${vpa_styles.guestBtn}`}
                                        style={{
                                            opacity: !flagCheck("payments.allowGuestPay", userDetails, "paymentAddress") ? 0.5 : (state.amount <= 0 ? 0.7 : 1),
                                            pointerEvents: !flagCheck("payments.allowGuestPay", userDetails, "paymentAddress") ? "none" : (state.amount <= 0 ? "none" : "all"),
                                            position: "relative",
                                            cursor: !flagCheck("payments.allowGuestPay", userDetails, "paymentAddress") ? "not-allowed" : (state.amount <= 0 ? "not-allowed" : "pointer")
                                        }}
                                    >
                                        <div>
                                            <img src={addFunds} alt="A" />
                                        </div>
                                        <span>{t("Pay As Guest")}</span>
                                        {
                                            state.guestPayError
                                            &&
                                            <div
                                                style={{
                                                    position: "absolute",
                                                    top: "100%",
                                                    left: 0,
                                                    background: "white",
                                                    color: "red",
                                                    maxHeight: "unset",
                                                    height: "fit-content",
                                                    padding: "1rem",
                                                    whiteSpace: "nowrap"
                                                }}
                                                className={vpa_styles.gperror}
                                            >
                                                {state.guestPayError}
                                            </div>
                                        }
                                    </Link>
                                </div>

                                <div title={!flagCheck("payments.allowCrypto", userDetails, "paymentAddress") ? t("This method is disabled for this payment address by admin.") : ""} style={{ position: "relative" }}>
                                    <Link to={flagCheck("payments.allowCrypto", userDetails, "paymentAddress") ? "#" : ""} onClick={flagCheck("payments.allowCrypto", userDetails, "paymentAddress") ? toggleCryptoModal : (e) => e.preventDefault()} className={`${vpa_styles.button} ${vpa_styles.guestBtn}`}
                                        style={{
                                            opacity: !flagCheck("payments.allowCrypto", userDetails, "paymentAddress") ? 0.5 : (state.amount <= 0 ? 0.7 : 1),
                                            pointerEvents: !flagCheck("payments.allowCrypto", userDetails, "paymentAddress") ? "none" : (state.amount <= 0 ? "none" : "all"),
                                            position: "relative",
                                            cursor: !flagCheck("payments.allowCrypto", userDetails, "paymentAddress") ? "not-allowed" : (state.amount <= 0 ? "not-allowed" : "pointer")
                                        }}
                                    >
                                        <div>
                                            <img src={CryptoPay} alt="A" />
                                        </div>
                                        <span>{t("Pay with Crypto")}</span>
                                    </Link>
                                </div>


                                <div title={!flagCheck("payments.allowInstapay", userDetails, "paymentAddress") ? t("This method is disabled for this payment address by admin.") : ""} style={{ position: "relative" }}>
                                    <Link onClick={(e) => {
                                        if (!flagCheck("payments.allowInstapay", userDetails, "paymentAddress")) {
                                            e.preventDefault();
                                            return;
                                        }
                                        if (state.amount > 0) {
                                            if (isInIframe()) {
                                                const toNavigate = `${import.meta.env.VITE_PUBLIC_URL}/login?redirect=${encodeURIComponent(url)}`
                                                openInNewTab(toNavigate)
                                            } else {
                                                const path = url;
                                                sessionStorage.setItem("path", path);
                                            }
                                        } else {
                                            e.preventDefault();
                                        }
                                    }} to={(flagCheck("payments.allowInstapay", userDetails, "paymentAddress") && state.amount > 0 && !isInIframe()) ? url : ""} className={`${vpa_styles.button} ${vpa_styles.ipBtn}`}
                                        style={{
                                            opacity: !flagCheck("payments.allowInstapay", userDetails, "paymentAddress") ? 0.5 : (state.amount <= 0 ? 0.7 : 1),
                                            pointerEvents: !flagCheck("payments.allowInstapay", userDetails, "paymentAddress") ? "none" : (state.amount <= 0 ? "none" : "all"),
                                            cursor: !flagCheck("payments.allowInstapay", userDetails, "paymentAddress") ? "not-allowed" : (state.amount <= 0 ? "not-allowed" : "pointer")
                                        }}
                                    >
                                        <div>
                                            <img src={logo} alt="A" />
                                        </div>
                                        <span style={{ color: "white" }}>{t("Pay With InstaPay")}</span>
                                    </Link>
                                </div>
                            </div>
                        </>}
                </div>
            </div>
        </div>
    )
}

export default AmountContainer