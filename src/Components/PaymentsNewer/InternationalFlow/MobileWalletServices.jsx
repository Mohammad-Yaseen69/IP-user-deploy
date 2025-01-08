import React from 'react'
import { Check } from 'react-feather'
import i from "../files/i.svg"
import styles from "./styles/stepfour.module.css"
import InstaPayLoader from '../../Loader'
import FeesComponent from './FeesComponent'
import { useTranslation } from 'react-i18next'

const MobileWalletServices = ({ data, dataHandler, loading, error = "" }) => {
    const { t } = useTranslation()
    return (
        <>
            {
                window.innerWidth < 1000
                    ?
                    loading
                        ?
                        <div style={{ height: "100px", width: "100px", margin: "0 auto" }}>
                            <InstaPayLoader />
                        </div>
                        :
                        <FeesComponent
                            error={error}
                            data={data}
                        />
                    :
                    ""
            }
            <div className={styles.container}>
                {
                    data.mobile_wallet_services?.length > 0
                        ?
                        data.mobile_wallet_services?.map(item => (
                            <div className={`${styles.item}`} key={item.name} onClick={() => dataHandler("mobile_wallet_service", item)}>
                                <img src={data.payment_type?.icon} alt="" className={styles.icon} />
                                <span>{item.name}</span>

                                {
                                    !item?.active
                                        ?
                                        <div>({t("Coming Soon")})</div>
                                        :
                                        data.payment_type?.name === item?.name
                                            ?
                                            <Check color="green" size={24} style={{ marginLeft: "auto" }} />
                                            :
                                            <img src={i} alt="i" style={{ height: "35px", width: "35px", objectFit: "contain", marginLeft: "auto" }} />
                                }
                            </div>
                        ))
                        :
                        <div style={{ margin: "1rem auto", fontSize: "1rem", fontWeight: "700" }}>No Services Available.</div>
                }
            </div>
        </>
    )
}

export default MobileWalletServices