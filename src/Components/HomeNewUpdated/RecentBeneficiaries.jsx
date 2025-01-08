import React, { useContext, useEffect } from 'react'
import { Card, CardBody } from 'reactstrap'
import { UserContext } from '../../Context/UserContext'
import BenefCard from './BenefCard'
import { useTranslation } from 'react-i18next'
import styles from "./styles/RecentBenef.module.css"

const RecentBeneficiaries = () => {
    const { t } = useTranslation()
    const { userDetails, beneficiaries, getUserBeneficiaries } = useContext(UserContext)

    useEffect(() => {
        if (userDetails) {
            getUserBeneficiaries()
        }
    }, [userDetails])

    return (
        <>
            <Card className={styles.pc} style={{ marginBottom: 0, borderRadius: "1rem", minHeight: "142px", flex: 1 }}>
                <CardBody style={{ padding: window.innerWidth > 1500 ? "24px" : "13px", display: "flex", flexDirection: "column" }}>
                    <h5>{t("Quick Transfer")}</h5>
                    <div className={styles.row}>
                        {
                            beneficiaries.length > 0
                                ?
                                beneficiaries.map((item, index) => (
                                    <BenefCard index={index} total={beneficiaries?.length} key={item._id} item={item} />
                                ))
                                :
                                <div style={{ margin: "2rem auto" }}>{t("No Beneficiaries")}</div>
                        }
                    </div>
                </CardBody>
            </Card>
            <div className={styles.mob}>
                <h5 style={{ fontSize: "1rem", fontWeight: 700 }}>{t("Quick Transfer to Your Most Recent Contacts:")}</h5>
                <div style={{
                    display: "flex",
                    gap: "1rem",
                    overflowX: "auto",
                    scrollbarWidth: "none"
                }}>
                    {
                        beneficiaries.length > 0
                            ?
                            beneficiaries.map((item, index) => (
                                <BenefCard index={index} total={beneficiaries?.length} key={item._id} item={item} />
                            ))
                            :
                            <div style={{ margin: "2rem auto" }}>{t("No Beneficiaries")}</div>
                    }
                </div>
            </div>
        </>
    )
}

export default RecentBeneficiaries