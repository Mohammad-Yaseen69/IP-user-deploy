import styles from "./styles/stepthree.module.css"
import airtime from "./files/airtime.svg"
import { useTranslation } from "react-i18next"
import { useContext, useEffect, useState } from "react"
import axios from "axios"
import { decryptData } from "../../../Helper/EssentilaMethods/Decryption"
import { ChevronRight } from "react-feather"
import InstaPayLoader from "../../Loader"
import air_dude from "./files/air_dude.png"
import { encryptData } from "../../../Helper/EssentilaMethods/Encryption"
import { UserContext } from "../../../Context/UserContext"
import { formatCurrency } from "../../../Helper/AmountFormat"

const StepThree = ({ data, dataHandler, getPackageDetails }) => {
    const { t } = useTranslation()
    const [isLoading, setIsLoading] = useState(true)
    const [pakLoading, setPakLoading] = useState(true)
    const { authHeader } = useContext(UserContext)

    useEffect(() => {
        const getServices = async () => {
            dataHandler("package", {})
            dataHandler("packages", [])
            dataHandler("service_type", {})

            try {
                const res = await axios.get(`${import.meta.env.VITE_IP_DEV_API}/api/dt/sub-services-in-country/${data?.country?.alpha3}/${data?.providers?.[0]?.id}/${data.service}`, { headers: authHeader })
                const dec = decryptData(res.data.data)
                dataHandler("service_types", dec)
                dataHandler("service_type", dec?.[0])
            } catch (error) {
                const dec = decryptData(error?.response?.data?.data)
                dataHandler("error", dec?.message ?? "Something went wrong while getting services.")
                dataHandler("service_types", [])
            } finally {
                setIsLoading(false)
            }
        }

        getServices()
    }, [])

    useEffect(() => {
        if (data.service_type?.id) {
            console.log("getting packages")
            const getPackages = async () => {
                setPakLoading(true)
                dataHandler("packages", [])
                dataHandler("package", {})
                try {
                    const dataa = {
                        wallet_id: data.localWallet?._id,
                    }
                    const res = await axios.post(`${import.meta.env.VITE_IP_DEV_API}/api/dt/service-products/${data.country?.alpha3}/${data.providers?.[0]?.id}/${data.service}/${data.service_type?.id}`, {
                        data: encryptData(dataa)
                    }, { headers: authHeader })
                    const dec = await decryptData(res.data.data)
                    const packageVar = Array.isArray(dec?.data) ? dec?.data?.[0] : dec?.data
                    console.log(dec)
                    dataHandler("packages", Array.isArray(dec?.data) ? dec?.data : [dec?.data])
                    dataHandler("package", packageVar)
                    dataHandler("airtime_amount", packageVar?.baseAmount?.min)
                } catch (error) {
                    const dec = decryptData(error?.response?.data?.data)
                    dataHandler("packages", [])
                    dataHandler("error", dec?.message ?? "Something went wrong while getting services.")
                } finally {
                    setPakLoading(false)
                }
            }

            getPackages()
        }
    }, [data.service_type])

    const setValue = (e) => {
        console.log(e)
        dataHandler("airtime_amount", e)
    }

    const handleKeyUp = (e) => {
        formatCurrency(e.target.value, false, setValue);
    };

    const handleBlur = (e) => {
        formatCurrency(e.target.value, true, setValue);
    };

    return (
        <div className={styles.container}>
            {
                window.innerWidth > 1000
                    ?
                    <div className={styles.banner}>
                        <img src={airtime} alt="" />
                        <span>{t("Mobile Airtime")}</span>
                    </div>
                    :
                    <div className={styles.banner}>
                        <div className={styles.b_left}>
                            <span>{t("Send Top-up").toUpperCase()}</span>
                            <div>
                                <img src={airtime} alt="" />
                                <span>{t("Mobile Airtime")}</span>
                            </div>
                        </div>
                        <img src={air_dude} alt="" />
                    </div>
            }
            {
                isLoading
                    ?
                    <div style={{
                        height: "300px",
                        width: "300px",
                        margin: "1rem auto"
                    }}>
                        <InstaPayLoader />
                    </div>
                    :
                    <div className={styles.content}>
                        <div className={styles.tabs}>
                            {
                                data.service_types?.length > 0
                                    ?
                                    data.service_types?.map(item => (
                                        <div style={{ padding: window.innerWidth < 400 && ".6rem 1rem", pointerEvents: pakLoading && "none", opacity: pakLoading && .6 }} className={`${styles.tab} ${data.service_type?.name === item?.name ? styles.tab_a : ""}`} key={item?.name} onClick={() => dataHandler("service_type", item)}>
                                            {t(item?.name?.toLowerCase())}
                                        </div>
                                    ))
                                    :
                                    <div>{t("No Services Available")}</div>
                            }
                        </div>
                        {
                            pakLoading
                                ?
                                <div style={{
                                    height: "70%",
                                    width: "100%",
                                }}>
                                    <InstaPayLoader />
                                </div>
                                :
                                data.service_type?.name?.toLowerCase()?.includes("bundle")
                                    ?
                                    <div className={styles.cards}>
                                        {
                                            !data.packages[0]?.baseAmount?.max ?
                                                data.packages?.map((item, i) => (
                                                    <div className={`${styles.card} ${item?.id === data.package?.id ? styles.active : ""}`} key={item?.id} onClick={() => dataHandler("package", item)}>
                                                        <div className={styles.c_top}>
                                                            <h2 style={{ whiteSpace: "nowrap" }}>{item?.prices?.unit} {Number(item?.prices?.amount)?.toFixed(2)}</h2>
                                                            <div>
                                                                <span>{t("Name")}</span>
                                                                <p>{t(item?.name)}</p>
                                                                <span style={{ maxWidth: "40ch" }}>{t(item?.description)}</span>
                                                            </div>
                                                        </div>
                                                        <div className={styles.operator}>
                                                            <span>{t("Operator")}</span>
                                                            <p>{data?.providers?.[0]?.name}</p>
                                                        </div>
                                                        <div className={styles.c_bot}>
                                                            <span>{t("Product ID")}: <strong>{item?.id}</strong></span>
                                                            <div>&rarr;</div>
                                                        </div>
                                                    </div>
                                                )) :
                                                <div style={{
                                                    height: "100%",
                                                    width: "100%",
                                                }}>
                                                    <InstaPayLoader />
                                                </div>
                                        }
                                    </div>
                                    :
                                    (
                                        data.packages?.length === 1 && data.packages?.[0]?.baseAmount
                                            ?
                                            <div className={styles.amount_con}>
                                                <label>{t("Enter custom amount")}  <span style={{ fontSize: "70%" }}>({data.localWallet?.currency?.code}  {Number(data.package?.baseAmount?.min)?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} - {data.localWallet?.currency?.code}  {Number(data.package?.baseAmount?.max)?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })})</span></label>
                                                <div className={styles.am_a_c}>
                                                    {
                                                        window.innerWidth < 1000
                                                            ?
                                                            <div className={styles.am}>
                                                                <label>{t("Enter the amount")}</label>
                                                                <div>
                                                                    <span>{data.localWallet?.currency?.code} </span>
                                                                    <input
                                                                        type="text"
                                                                        value={data.airtime_amount}
                                                                        onChange={e => dataHandler("airtime_amount", e.target.value)}
                                                                        onKeyUp={handleKeyUp}
                                                                        onBlur={handleBlur}
                                                                        placeholder="Enter amount"
                                                                        data-type="currency"
                                                                    />
                                                                    {/* <input type="number" required placeholder="Enter amount" value={data.airtime_amount} onChange={e => dataHandler("airtime_amount", e.target.value)} /> */}
                                                                </div>
                                                            </div>
                                                            :
                                                            <div className={styles.am}>
                                                                <span>{data.localWallet?.currency?.code} </span>
                                                                <input
                                                                    type="text"
                                                                    value={data.airtime_amount}
                                                                    onChange={e => dataHandler("airtime_amount", e.target.value)}
                                                                    onKeyUp={handleKeyUp}
                                                                    onBlur={handleBlur}
                                                                    placeholder="Enter amount"
                                                                    data-type="currency"
                                                                />
                                                                {/* <input type="number" required placeholder="Enter amount" value={data.airtime_amount} onChange={e => dataHandler("airtime_amount", e.target.value)} /> */}
                                                            </div>
                                                    }
                                                    <div className={styles.cur}>
                                                        <div>{data.localWallet?.currency?.code} </div>
                                                    </div>
                                                </div>
                                            </div>
                                            :
                                            <div className={styles.cards}>
                                                {
                                                    data.packages?.map((item, i) => (
                                                        <div className={`${styles.card} ${item?.id === data.package?.id ? styles.active : ""}`} key={item?.id} onClick={() => dataHandler("package", item)}>
                                                            <div className={styles.c_top}>
                                                                <h2 style={{ whiteSpace: "nowrap" }}>{item?.prices?.unit} {Number(item?.prices?.amount)?.toFixed(2)}</h2>
                                                                <div>
                                                                    <span>{t("Name")}</span>
                                                                    <p>{t(item?.name)}</p>
                                                                    <span style={{ maxWidth: "40ch" }}>{t(item?.description)}</span>
                                                                </div>
                                                            </div>
                                                            <div className={styles.operator}>
                                                                <span>{t("Operator")}</span>
                                                                <p>{data?.providers?.[0]?.name}</p>
                                                            </div>
                                                            <div className={styles.c_bot}>
                                                                <span>{t("Product ID")}: <strong>{item?.id}</strong></span>
                                                                <div>&rarr;</div>
                                                            </div>
                                                        </div>
                                                    ))
                                                }
                                            </div>
                                    )
                        }

                        <div className={styles.buttons}>
                            <button disabled={data.loading} onClick={() => dataHandler("step", 2)} className={styles.trs}>{t("Back")}</button>
                            <button disabled={data.loading || (data.package?.baseAmount ? +String(data?.airtime_amount)?.replaceAll(",", "") < data.package?.baseAmount?.min || +String(data?.airtime_amount)?.replaceAll(",", "") > data.package?.baseAmount?.max : !data.package?.name)} onClick={() => dataHandler("step", data.step + 1)}>
                                {t("Next")}
                                <ChevronRight color="white" size={17} />
                            </button>
                        </div>
                    </div>
            }
        </div>
    )
}

export default StepThree