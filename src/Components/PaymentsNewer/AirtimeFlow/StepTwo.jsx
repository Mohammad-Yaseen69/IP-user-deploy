import { useContext, useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import styles from "./styles/steptwo.module.css"
import airtime from "./files/airtime.svg"
import air_dude from "./files/air_dude.png"
import country from "../InternationalFlow/files/country.svg"
import chev_down from "../InternationalFlow/files/chev_down.svg"
import { Input } from "reactstrap"
import country_styles from "../InternationalFlow/styles/stepone.module.css"
import { ChevronRight } from "react-feather"
import { decryptData } from "../../../Helper/EssentilaMethods/Decryption"
import axios from "axios"
import esim from "./files/esim.svg"
import e_dude from "./files/e_dude.png"
import allCountries from "../CountriesData.json"
import { UserContext } from "../../../Context/UserContext"
import ListModal from "../InternationalFlow/ListModal"
import PhoneInput from "../../PhoneInput"
import ESimStep from "../Esim/StepOne"
import InstaPayLoader from "../../Loader"

const StepTwo = ({ data, dataHandler, eSimDataHandler }) => {
    const { t } = useTranslation()
    const [showModal, setShowModal] = useState(false)
    const { allowedCountries, authHeader, userDetails } = useContext(UserContext)
    const [loadingCountries, setLoadingCountries] = useState(false)

    // country
    const [countries, setCountries] = useState([])
    useEffect(() => {
        dataHandler("loading", true)
        setLoadingCountries(true)
        const getCountries = async () => {
            try {
                const res = await axios.get(`${process.env.REACT_APP_IP_DEV_API}/api/dt/countries`, { headers: authHeader })
                const decrypted = decryptData(res.data.data)
                const countriesArray = allCountries.filter((item) => {
                    return decrypted.some(apiCountry => apiCountry.iso_code === item?.alpha3)
                })
                const allowed = allowedCountries?.map(allowed => {
                    const coun = countriesArray?.find(item => item?.alpha3 == allowed?.country_iso_code)
                    if (!coun) return null;
                    return {
                        ...coun,
                        id: allowed?._id
                    }
                })?.filter(item => item != null)
                console.log(allowed)
                setCountries(allowed?.sort((a, b) => String(a?.name)?.localeCompare(b?.name)))
                const coun = allowed?.find(item => item?.alpha3 === userDetails?.country_iso_code)
                dataHandler("country", coun ?? {})
            } catch (error) {
                // dataHandler("err          or", "Something went wrong while getting countries.")
                return null;
            }
            finally {
                setLoadingCountries(false)
                dataHandler("loading", false)
            }
        }
        getCountries()
    }, [])

    const phoneLookup = async () => {
        dataHandler("loading", true)
        dataHandler("providers", [])
        try {
            const res = await axios.get(`${process.env.REACT_APP_IP_DEV_API}/api/dt/check-number-airtime/+${data.recipient}`, { headers: authHeader })
            const dec = await decryptData(res.data.data)
            console.log("providers", dec)
            dataHandler("providers", dec)
        } catch (error) {
            const dec = decryptData(error?.response?.data?.data)
            dataHandler("error", "Make sure you have entered a correct Phone Number.")
        }
        finally {
            dataHandler("loading", false)
        }
    }

    return (
        <div className={styles.container}>
            {data.flow === "airtime" &&
                <div className={styles.banner}>
                    <div className={styles.b_left}>
                        <span>{t("Send Top-up").toUpperCase()}</span>
                        <div>
                            <img src={data.flow === "airtime" ? airtime : esim} alt="" />
                            <span>{t(`${data.flow === "airtime" ? "Mobile Airtime" : "eSim"}`)}</span>
                        </div>
                    </div>
                    <img src={data.flow === "airtime" ? air_dude : e_dude} alt="" />
                </div>}
            {data.flow === "airtime" ?
                loadingCountries
                    ?
                    <div style={{ height: "200px", width: "200px", margin: "1rem auto" }}>
                        <InstaPayLoader />
                    </div>
                    :
                    <div className={styles.bottom}>
                        <div className={styles.timeline}>
                            <div className={styles.timeline_item}>
                                <h4>{t("Select the country where you want to top-up a mobile phone!")}</h4>
                                <div className={`${country_styles.country} ${styles.country}`} onClick={() => setShowModal(true)}>
                                    <div className={country_styles.main}>
                                        <div className={data?.country?.file_url ? "" : country_styles.grad_icon}>
                                            <img src={data?.country?.file_url ?? country} alt="" />
                                        </div>
                                        <span>{data?.country?.name ? t(data?.country?.name)?.slice(0, 30) : t("Select Destination Country")}</span>
                                    </div>
                                    <img src={chev_down} alt="" />
                                </div>
                            </div>
                            {
                                data.country?.name
                                &&
                                <div className={styles.timeline_item}>
                                    <h4>{t("Recipient")}</h4>
                                    <div className={styles.recipient}>
                                        {/* <input type="text" value={data.recipient} onChange={e => dataHandler("recipient", e.target.value)} /> */}
                                        <PhoneInput
                                            country={data.country?.alpha3}
                                            setPhone={e => {
                                                dataHandler("providers", [])
                                                dataHandler("recipient", e)
                                            }}
                                            disabledDropdown={true}
                                            phone={data.recipient}
                                        />
                                        <button onClick={phoneLookup} className={data.loading ? styles.searching : ""} disabled={data.loading || data.recipient?.length < 9}>
                                            <div style={{ whiteSpace: "nowrap" }}>
                                                {t("lookup")}
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            }
                            {
                                data?.providers?.length > 0
                                &&
                                <div className={styles.timeline_item}>
                                    <h4>{t("Operator")}</h4>
                                    <div>
                                        <span style={{ fontSize: "1rem", fontWeight: 700 }}>{data?.providers?.[0]?.name}</span>
                                    </div>
                                </div>
                            }
                            {
                                data?.other_operators?.length > 0
                                &&
                                <div className={styles.timeline_item} style={{ alignItems: "flex-start" }}>
                                    <h4>{t("Other Operator")}</h4>
                                    <div style={{ display: "grid", gridTemplateColumns: window.innerWidth > 1000 ? "repeat(auto-fit, minmax(150px, 1fr))" : "repeat(1, 1fr)", flex: 1, gap: ".75rem", width: "100%", maxHeight: "120px", overflowY: "auto" }}>
                                        {
                                            data.other_operators?.map(item => (
                                                <div
                                                    onClick={() => data.recipient?.length < 9 ? console.log("lol") : dataHandler("providers", [item])}
                                                    key={item?.id}
                                                    style={{
                                                        padding: ".8rem 1rem",
                                                        border: "1px solid #5926f0",
                                                        textAlign: "center",
                                                        fontSize: window.innerWidth > 1650 ? ".7rem" : ".6rem",
                                                        fontWeight: 700,
                                                        borderRadius: "6px",
                                                        color: item?.id === data?.providers?.[0]?.id ? "white" : "black",
                                                        background: item?.id === data?.providers?.[0]?.id ? "#5926f0" : "white",
                                                    }}
                                                >
                                                    {item?.name}
                                                </div>
                                            ))
                                        }
                                    </div>
                                </div>
                            }
                        </div>
                        <div className={styles.buttons}>
                            <button disabled={data.loading} onClick={() => dataHandler("step", 1)} className={styles.trs}>{t("Back")}</button>
                            <button disabled={data.loading || data.providers.length === 0} onClick={() => dataHandler("step", 3)}>
                                {t("Next")}
                                <ChevronRight color="white" size={17} />
                            </button>
                        </div>
                    </div>
                : null
            }
            {data.flow === "e-sim" ?
                <ESimStep
                    data={data}
                    dataHandler={dataHandler}
                    dataEsimHandler={eSimDataHandler}
                    loadingCountries={loadingCountries}
                    setShowModal={setShowModal}
                />
                : null
            }

            {
                (showModal && countries?.length > 0)
                    ?
                    <ListModal
                        isLoading={data.loading}
                        content={{
                            heading: "Select the country where do you want to top-up a mobile phone?",
                            list: countries
                        }}
                        heading="SEND TOP-UP AND E-SIM"
                        isOpen={showModal}
                        onSelectHandler={(item) => {
                            dataHandler("recipient", "")
                            dataHandler("country", item)
                            eSimDataHandler("region", {})
                        }}
                        toggle={() => setShowModal(false)}
                        searchable={true}
                    />
                    : ""
            }
        </div>


    )
}

export default StepTwo