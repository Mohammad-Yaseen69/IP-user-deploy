import styles from "../AirtimeFlow/styles/steptwo.module.css"
import InstaPayLoader from '../../Loader'
import { useTranslation } from "react-i18next"
import country from "../InternationalFlow/files/country.svg"
import chev_down from "../InternationalFlow/files/chev_down.svg"
import country_styles from "../InternationalFlow/styles/stepone.module.css"
import warn from "../AirtimeFlow/files/warn.svg"
import info from "./files/info.svg"
import bg from "./files/bg.png"
import useWindowWidth from "../../../utils/useWindowWidth"
import { useState } from "react"
import { Modal, ModalBody } from "reactstrap"


const Stepone = ({ data, dataHandler, dataEsimHandler, loadingCountries, setShowModal }) => {
    const { t } = useTranslation()
    const width = useWindowWidth()
    const [showCompatibleModal, setShowCompatibleModal] = useState(false)

    const regions = [
        {
            name: "Global",
            value: "GXX"
        },
        {
            name: "Europe",
            value: "EXX"
        },
    ]


    return (
        <div style={{ height: "1005" }}>
            {
                data.flow === "e-sim" &&
                (
                    loadingCountries
                        ?
                        <div style={{ height: "200px", width: "200px", margin: "1rem auto" }}>
                            <InstaPayLoader />
                        </div> :
                        <div className={styles.eSim} style={{ height: "100%", justifyContent: "space-between", background: "transparent" }}>
                            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                                <div style={{ flexDirection: width < 1000 && 'column' }} className={styles.warningDiv}>
                                    <div>
                                        <img src={warn} alt="" />
                                        <p style={{ width: width < 1000 && '100%' }}>
                                            {t("Not all devices support eSIM. Perform a compatibility check to ensure a seamless user experience.")}
                                        </p>
                                    </div>

                                    <button onClick={() => setShowCompatibleModal(true)}>
                                        {t("Check device compatibility.")}
                                    </button>
                                </div>

                                <div className={styles.contentDiv} style={{ flexDirection: width < 600 && "column", alignItems: width < 600 && "flex-start" }}>
                                    <h4>{t("Country")}</h4>

                                    <div style={{ flex: 0, width: width < 600 ? "100%" : "fit-content", minWidth: 'fit-content' }} className={`${country_styles.country} ${styles.country}`} onClick={() => setShowModal(true)}>
                                        <div className={country_styles.main}>
                                            <div className={data?.country?.file_url ? "" : country_styles.grad_icon}>
                                                <img src={data?.country?.file_url ?? country} alt="" />
                                            </div>
                                            <span>{data?.country?.name ? t(data?.country?.name)?.slice(0, 30) : t("Select Destination Country")}</span>
                                        </div>
                                        <img src={chev_down} alt="" />
                                    </div>

                                </div>


                                <div style={{ alignItems: "flex-start", flexDirection: width < 1000 && "column" }} className={styles.contentDiv}>
                                    <h4>{t("Or Choose a Region")}</h4>
                                    <div style={{ width: width < 1000 && "100%" }} className={styles.regions}>
                                        {regions.map((region, index) => (
                                            <div style={{ cursor: "pointer", background: `url(${bg})`, backgroundSize: "cover", backgroundPosition: "center", position: 'relative', overflow: "hidden" }}
                                                onClick={() => {
                                                    dataEsimHandler("region", region)
                                                    dataHandler("country", {})
                                                }}
                                                key={index}
                                                className={styles.region}>
                                                {data.eSimData.region.value !== region.value && <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0, 0, 0, 0.4)', zIndex: 1 }}></div>}
                                                <h2 style={{ zIndex: 5 }}>{t(region.name)}</h2>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div style={{ justifyContent: 'space-between' }} className={styles.contentDiv}>
                                <div className={styles.info}>
                                    <img src={info} alt="" />
                                    <span>{t("Trouble buying an E-SIM?")}</span>
                                </div>

                                <div className={styles.btns}>
                                    <span
                                        onClick={() => {
                                            dataHandler("step", 1)
                                            dataEsimHandler("region", "")
                                        }}
                                        className={styles.back}
                                    >{t("Back")}
                                    </span>
                                    <button onClick={() => dataHandler("step", 3)} className={styles.nxt}>
                                        {t("Next")}
                                        <svg xmlns="http://www.w3.org/2000/svg" width="9" height="15" viewBox="0 0 9 15" fill="none">
                                            <path d="M1.7876 1.5625L7.47528 6.97362C7.88959 7.36778 7.88959 8.02847 7.47528 8.42262L1.7876 13.8337" stroke="white" stroke-width="2" stroke-linecap="round" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                )
            }


            {showCompatibleModal && (
                <Modal
                    isOpen={showCompatibleModal}
                    toggle={() => setShowCompatibleModal(false)}
                    centered
                    style={{ maxWidth: 600 }}
                >
                    <ModalBody style={{
                        padding: 32,
                        background: "#fff",
                        borderRadius: 16,
                        fontFamily: "inherit",
                        color: "#222"
                    }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <span style={{
                                    fontSize: 32,
                                    lineHeight: 1,
                                    marginRight: 8
                                }}>📱</span>
                                <span style={{
                                    fontWeight: 700,
                                    fontSize: 22,
                                    color: "#1a1a1a"
                                }}>{t("How to Check if Your Phone Supports eSIM")}</span>
                            </div>
                            <div style={{ fontSize: 16, color: "#444" }}>
                                <span style={{ fontWeight: 600, color: "#3417db" }}>{t("🔍 Option 1: Check in Your Phone Settings")}</span>
                                <div style={{ margin: "10px 0 0 0" }}>
                                    <div style={{ fontWeight: 600, marginBottom: 4 }}>{t("For iPhone (iOS 12.1 or later):")}</div>
                                    <ol style={{ marginLeft: 18, marginBottom: 6, display: "flex", flexDirection: "column", gap: 6 }}>
                                        <li>{t("Go to")} <b>{t("Settings > General > About")}</b>.</li>
                                        <li>{t("Scroll down to")} <b>{t("Available SIM")}</b> {t("or")} <b>{t("Digital SIM")}</b>.</li>
                                    </ol>
                                    <div style={{ marginBottom: 6 }}>
                                        {t("If you see an")} <b>{t("EID number")}</b>, {t("your iPhone supports eSIM.")}
                                    </div>
                                    <div style={{ marginBottom: 6 }}>
                                        {t("Alternatively, check under")} <b>{t("Settings > Cellular > Add Cellular Plan")}</b>. {t("If you see that option, eSIM is supported.")}
                                    </div>
                                </div>
                                <div style={{ fontWeight: 600, marginTop: 10, marginBottom: 4 }}>{t("For Android (Samsung, Google Pixel, etc.):")}</div>
                                <ol style={{ marginLeft: 18, marginBottom: 6, display: "flex", flexDirection: "column", gap: 6 }}>
                                    <li>
                                        {t("Go to")} <b>{t("Settings > Connections > SIM card manager")}</b> {t("(Samsung)")}
                                        <br />
                                        {t("or")}<br />
                                        <b>{t("Settings > Network & Internet > Mobile Network")}</b> {t("(Pixel)")}.
                                    </li>
                                    <li>{t("Look for")} <b>{t("eSIM")}</b> {t("or")} <b>{t("Add carrier / Add eSIM")}</b>.</li>
                                </ol>
                                <div style={{ marginBottom: 6 }}>
                                    {t("If available, your phone supports eSIM.")}
                                </div>
                            </div>
                            <div style={{ fontSize: 16, color: "#444", marginTop: 12 }}>
                                <span style={{ fontWeight: 600, color: "#3417db" }}>{t("Option 2: Check the IMEI Information")}</span>
                                <ol style={{ marginLeft: 18, marginBottom: 6, marginTop: 6, display: "flex", flexDirection: "column", gap: 6 }}>
                                    <li>{t("Open the Phone app and dial:")} <b>{t("*#06#")}</b></li>
                                    <li>{t("Look at the IMEI information shown.")}</li>
                                </ol>
                                <div style={{ marginBottom: 6 }}>
                                    {t("If there is an")} <b>{t("EID number")}</b> {t("listed, your phone supports eSIM.")}
                                </div>
                            </div>
                            <div style={{ fontSize: 16, color: "#444", marginTop: 12 }}>
                                <span style={{ fontWeight: 600, color: "#3417db" }}>{t("Option 3: Check Manufacturer or Carrier Website")}</span>
                                <div style={{ marginTop: 6 }}>
                                    {t("If the above methods are unclear, search online:")}
                                    <div style={{
                                        background: "#f5f7fa",
                                        borderRadius: 6,
                                        padding: "8px 12px",
                                        margin: "8px 0",
                                        fontStyle: "italic",
                                        color: "#333"
                                    }}>
                                        {t("[Your Phone Model] eSIM support")}
                                    </div>
                                    {t("For example:")}
                                    <div style={{
                                        background: "#f5f7fa",
                                        borderRadius: 6,
                                        padding: "8px 12px",
                                        margin: "8px 0",
                                        fontStyle: "italic",
                                        color: "#333"
                                    }}>
                                        {t("Samsung Galaxy S21 eSIM support")}
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowCompatibleModal(false)}
                                style={{
                                    marginTop: 18,
                                    alignSelf: "flex-end",
                                    background: "#3417db",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: 6,
                                    padding: "8px 22px",
                                    fontWeight: 600,
                                    fontSize: 16,
                                    cursor: "pointer",
                                    boxShadow: "0 2px 8px rgba(10,124,255,0.08)"
                                }}
                            >
                                {t("Close")}
                            </button>
                        </div>
                    </ModalBody>
                </Modal>
            )}

        </div>
    )
}

export default Stepone
