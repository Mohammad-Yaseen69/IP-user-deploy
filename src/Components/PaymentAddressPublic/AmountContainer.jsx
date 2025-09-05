import React from 'react'
import { Link } from 'react-router-dom'
import useWindowWidth from '../../utils/useWindowWidth'
import { useTranslation } from 'react-i18next'
import vpa_styles from "./styles/VPA.module.css"
import addFunds from "../HomeNewUpdated/files/AddFunds.png"
import logo from "../../assets/images/logo/logo.png"



const AmountContainer = ({ state, url, toggleCreditModal, dataHandler, handleBlur, handleKeyUp, isEditable }) => {
    const width = useWindowWidth()
    const { t } = useTranslation()
    return (
        <div style={{ backgroundColor: 'white', borderRadius: "16px", maxHeight: "100%" }}>
            <div style={{ marginBottom: "0px", gap: "0px", height: "100%" }} className={vpa_styles.container}>
                <div style={{ padding: width < 400 && "20px", height: "100%", padding: '24px', background: 'white', width: '100%', justifyContent: width > 1000 && "space-between", gap: width < 1000 && "0px" }} className={vpa_styles.right}>
                    <div style={{ flexDirection: width < 1000 && 'column', gap: width < 1000 && '15px' }} className={vpa_styles.top}>
                        <div style={{ margin: 'inherit' }} className={vpa_styles.currency}>
                            <div>{state.currentWallet?.currency?.symbol || state.currencySymbol} </div>
                            <p>{state.currentWallet?.currency?.code || state.currencyCode}</p>
                        </div>

                        {isEditable ? <label >{t("Enter Amount")}</label> : <label >{t("Amount")}</label>}
                    </div>
                    <div style={{ margin: width < 1000 ? "0 0 2rem" : '2rem 0 2rem 0' }} className={vpa_styles.amount}>
                        <div style={{ justifyContent: "center", gap: "5px" }}>
                            {width > 1000 && <span>{state.currentWallet?.currency?.code || state.currencyCode} </span>}
                            <input
                                type="text"
                                value={isEditable ? state.formattedAmount : state.amount}
                                maxLength={12}
                                readOnly={!isEditable}
                                onChange={!isEditable ? undefined : (e) => dataHandler("formattedAmount", e.target.value)}
                                onKeyUp={!isEditable ? undefined : handleKeyUp}
                                onBlur={!isEditable ? undefined : handleBlur}
                                placeholder="10.00"
                                data-type="currency"
                                style={{
                                    outlineColor: "white",
                                    border: "none",
                                    outline: "none",
                                    width: "100%",
                                    textAlign: width < 1000 ? "center" : "left"
                                }}
                            />

                        </div>
                    </div>
                    <div style={{ margin: '0' }} className={vpa_styles.buttons}>
                        <Link to={"#"} onClick={toggleCreditModal} className={vpa_styles.button}
                            style={{
                                opacity: state.amount <= 0 ? .7 : 1,
                                pointerEvents: state.amount <= 0 ? "none" : "all",
                                position: "relative"
                            }}
                        >
                            <div>
                                <img src={addFunds} alt="A" />
                            </div>
                            <span>Pay As Guest</span>
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
                        <Link onClick={(e) => {
                            if (state.amount > 0) {
                                const path = url
                                sessionStorage.setItem("path", path)
                            }
                            else {
                                e.preventDefault()
                            }
                        }} to={state.amount > 0 ? url : ""} className={vpa_styles.button}
                            style={{
                                opacity: state.amount <= 0 ? .7 : 1,
                                pointerEvents: state.amount <= 0 ? "none" : "all",
                            }}
                        >
                            <div>
                                <img src={logo} alt="A" />
                            </div>
                            <span>Pay With InstaPay</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AmountContainer
