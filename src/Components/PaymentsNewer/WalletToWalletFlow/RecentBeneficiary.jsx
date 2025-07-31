import React, { useContext, useMemo, useState } from 'react'
import { UserContext } from '../../../Context/UserContext'
import styles from "./styles/recentBen.module.css"
import { useTranslation } from 'react-i18next'
import { BeneficiaryCard } from './StepOne'
import useWindowWidth from '../../../utils/useWindowWidth'

const RecentBeneficiary = ({ data, dataHandler, setExpandRecent, expandRecent }) => {
    const { registeredBeneficiaries } = useContext(UserContext)
    const [benWalletsFound, setBenWalletsFound] = useState([])
    const { beneficiaries, userDetails } = useContext(UserContext)
    const { t } = useTranslation()
    const width = useWindowWidth()




    /* 
    [
    "03242323",
    "03242323",
    "adfa@gmal.com",
    // "121231231",
    "adfa@gmal.com",
    // "appop@soadfaf.com",
    "01201239",
    "03242323",
    "adfa@gmal.com",
    "myemail@gmail.com"
    ]
    
    */

    const uniqueBeneficiaries = useMemo(() => {
        const ipWalletBens = beneficiaries?.filter(item => {
            return item?.account_type?.includes("wallet")
        }).map((item2) => ({ ...item2, wallets: item2?.wallet, existType: "wallet" }))


        const uniqueEmailBen = registeredBeneficiaries?.filter((item, index, self) => {
            return (index === self.findIndex(b => (
                b.email === item.email
            ))) && item.existType === "email"
        });

        const uniquePhoneBen = registeredBeneficiaries?.filter((item, index, self) => {
            return (index === self.findIndex(b => (
                b.phone === item.phone
            ))) && item.existType === "phone"
        });

        const uniqueArray = [...uniqueEmailBen, ...uniquePhoneBen]
        const allBens = [...uniqueArray.filter(ben => !ipWalletBens.find(b => b?._id === ben?._id)), ...ipWalletBens]


        const ownAccountFilteration = allBens.filter((item) => {
            return item?.phone !== userDetails?.phone && item?.email !== userDetails?.email
            // return true
        })

        return ownAccountFilteration
    }, [registeredBeneficiaries])


    return uniqueBeneficiaries?.length ? (
        <div
            style={{ maxHeight: (expandRecent || width < 1000) && "400px" }}
            className={styles.container}
        >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                <h1> {t("Beneficiaries")} </h1>
                <p onClick={() => setExpandRecent(!expandRecent)} style={{ fontWeight: 600, cursor: "pointer" }}>
                    {uniqueBeneficiaries?.length > 1 && (expandRecent ? t("Show Less") : t("Show More"))}
                </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {uniqueBeneficiaries?.map((item) => (
                    <BeneficiaryCard
                        benWalletsFound={benWalletsFound}
                        setBenWalletsFound={setBenWalletsFound}
                        data={data}
                        dataHandler={dataHandler}
                        type="recent"
                        item={item}
                    />
                ))}
            </div>
        </div>
    ) : null
}

export default RecentBeneficiary
