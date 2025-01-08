import { useTranslation } from "react-i18next"
import styles from "./styles/PayoutChannel.module.css"
import { useEffect, useLayoutEffect, useState } from "react"
import { AlertCircle, Check, Search } from "react-feather"
import { Button } from "reactstrap"
import bd from "../files/bd.png"
import InstaPayLoader from "../../Loader"
import { useLocation } from "react-router"

const AvailableServices = ({ subServices, subService, setSubService, setStep }) => {
    const { t } = useTranslation()

    const [filtered, setFiltered] = useState(subServices)

    useEffect(() => {
        setFiltered(subServices)
    }, [subServices])

    const searchCountry = (e) => {
        const filt = subServices.filter(item => item.name.toLowerCase().includes(e.target.value.toLowerCase()))
        setFiltered(filt)
    }

    const location = useLocation()
    const queryParams = new URLSearchParams(location.search)
    const url_service = queryParams.get("payer_id")

    useLayoutEffect(() => {
        if (subServices.length > 0 && url_service) {
            const chan = subServices.find(item => item?.id == url_service)

            setSubService(chan)
            setStep(prev => prev + 1)
        }
    }, [url_service, subServices])

    return (
        <div className={styles.container}>
            <h5>{t("Select Payout Channel")}</h5>
            <div className={`${styles.card} ${styles.search}`}>
                <div className={styles.left}>
                    <input placeholder={t("Search")} onChange={searchCountry} />
                </div>
                <div className={styles.right}>
                    <Search color="#b8b8b8" />
                </div>
            </div>
            <div style={{ marginTop: 0 }} className={styles.cards}>
                {
                    filtered.length > 0
                        ?
                        filtered.map(item => (
                            <div className={styles.card} onClick={() => {
                                setSubService(item)
                                window.scrollTo({ top: window.innerHeight * 2, behavior: "smooth" })
                            }} style={{ flexShrink: 0 }}>
                                <div className={styles.left}>
                                    <div className={styles.icon}>
                                        <img src={bd} alt={item.id} />
                                    </div>
                                    <span>{item.name}</span>
                                </div>
                                <div className={styles.right}>
                                    {
                                        subService?.name === item.name
                                            ?
                                            <div>
                                                <Check />
                                            </div>
                                            :
                                            <AlertCircle color="#b8b8b8" />
                                    }
                                </div>
                            </div>
                        ))
                        :
                        <div style={{ margin: "1rem auto", textAlign: "center" }}>No services found.</div>
                    // <div style={{ height: "100px", width: "100px" }}>
                    //     <InstaPayLoader />
                    // </div>
                }
            </div>
            <Button className={styles.button} disabled={!subService} onClick={() => setStep(prev => prev + 1)}>
                {t("Continue")}
            </Button>
        </div>
    )
}

export default AvailableServices