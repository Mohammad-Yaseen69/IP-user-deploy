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


const Stepone = ({ data, dataHandler, dataEsimHandler, loadingCountries, setShowModal }) => {
    const { t } = useTranslation()
    const width = useWindowWidth()

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
                            <div style={{display: "flex", flexDirection: "column", gap: "10px"}}>
                                <div style={{ flexDirection: width < 1000 && 'column' }} className={styles.warningDiv}>
                                    <div>
                                        <img src={warn} alt="" />
                                        <p style={{ width: width < 1000 && '100%' }}>
                                            Not all devices support eSIM. Perform a compatibility check to ensure a seamless user experience.
                                        </p>
                                    </div>

                                    <button>
                                        Check device compatibility.
                                    </button>
                                </div>

                                <div className={styles.contentDiv} style={{ flexDirection: width < 600 && "column", alignItems: width < 600 && "flex-start" }}>
                                    <h4>Travel Distance</h4>

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
                                    <h4>Or Choose a Region</h4>
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
                                                <h2 style={{ zIndex: 5 }}>{region.name}</h2>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div style={{ justifyContent: 'space-between' }} className={styles.contentDiv}>
                                <div className={styles.info}>
                                    <img src={info} alt="" />
                                    <span>Trouble buying an E-SIM?</span>
                                </div>

                                <div className={styles.btns}>
                                    <span
                                        onClick={() => {
                                            dataHandler("step", 1)
                                            dataEsimHandler("region", "")
                                        }}
                                        className={styles.back}
                                    >Back
                                    </span>
                                    <button onClick={() => dataHandler("step", 3)} className={styles.nxt}>
                                        Next
                                        <svg xmlns="http://www.w3.org/2000/svg" width="9" height="15" viewBox="0 0 9 15" fill="none">
                                            <path d="M1.7876 1.5625L7.47528 6.97362C7.88959 7.36778 7.88959 8.02847 7.47528 8.42262L1.7876 13.8337" stroke="white" stroke-width="2" stroke-linecap="round" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                )
            }

        </div>
    )
}

export default Stepone
