import React, { useContext, useEffect, useState } from 'react'
import styles from "./styles/index.module.scss"
import TopRight from '../topRight'
import { useTranslation } from 'react-i18next'
import { Search } from 'react-feather'
import { Button, Input } from 'reactstrap'
import { Link } from 'react-router-dom'
import BeneficiaryCard from './BeneficiaryCard'
import { UserContext } from '../../Context/UserContext'
import add_ben from "./add_ben.svg"

const Beneficiaries = () => {
    const { t } = useTranslation()

    const { beneficiaries, verifyToken, getUserBeneficiaries, userDetails } = useContext(UserContext)
    const [filtered, setFiltered] = useState(beneficiaries)
    useEffect(() => {
        if (userDetails) {
            getUserBeneficiaries()
        }
    }, [userDetails])

    useEffect(() => setFiltered(beneficiaries), [beneficiaries]);


    const filterBenef = (e) => {
        const value = e.target.value.toLowerCase();
        const filtered = beneficiaries.filter(item => {
            return (
                item?.first_name?.toLowerCase().includes(value)
                ||
                item?.last_name?.toLowerCase().includes(value)
                ||
                item?.company_name?.toLowerCase().includes(value)
                ||
                item?.email?.toLowerCase().includes(value)
                ||
                item?.phone?.toLowerCase().includes(value)
                ||
                item?.country_name?.toLowerCase().includes(value)
                ||
                item?.city?.toLowerCase().includes(value)
            )
        })
        setFiltered(filtered)
    }
    return (
        <>
            <div className={styles.container}>
                <div className={styles.top}>
                    <h4>{t("Beneficiaries")}</h4>
                    <TopRight />
                </div>
                <div className={styles.table_header}>
                    <div className={styles.search_field}>
                        <Search />
                        <Input type='search' placeholder={t('Search for Beneficiaries')} style={{ padding: ".5rem 1rem" }} onChange={filterBenef}
                        />
                    </div>
                    <Button color='transparent' className={styles.btn} style={{ padding: ".5rem 1rem" }} onClick={verifyToken}>
                        <Link to={"/beneficiaries/add"}>
                            {t("Add Beneficiary")}
                        </Link>
                    </Button>
                    {/* <Button color='transparent' className={styles.btn} style={{ padding: ".5rem 1rem" }} onClick={() => setManagable(true)}>{t("Manage Beneficiaries")}</Button> */}
                </div>

                <div style={{
                    maxHeight: `calc(${100}vh - ${300}px)`,
                    overflowY: "auto",
                    marginTop: "1rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "1rem",
                    padding: "1rem 0 1rem 1rem",
                    margin: "1rem -1rem",
                    overflowX: "auto",
                    height: "fit-content"
                }}>
                    {
                        filtered.length > 0
                            ?
                            filtered.map(item => (
                                <BeneficiaryCard key={item._id} user={item} />
                            ))
                            :
                            t("No Beneficiaries")
                    }
                </div>
            </div>
            <div className={styles.mobile}>
                <div className={styles.top}>
                    <h4 style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                        {t("Beneficiaries")}
                    </h4>
                </div>
                <div className={styles.bottom}>
                    <div className={styles.table_header}>
                        <div style={{ width: "100%" }} className={styles.search_field}>
                            <Search />
                            <Input type='search' placeholder={t('Search for Beneficiaries')} style={{ padding: ".5rem 1rem" }} onChange={filterBenef} />
                        </div>
                        <Link to={"/beneficiaries/add"}>
                            <img src={add_ben}
                                loading="lazy"
                            />
                        </Link>
                    </div>
                    <div className={styles.table_body}>
                        {
                            filtered.length > 0
                                ?
                                filtered.map(item => (
                                    <BeneficiaryCard key={item._id} user={item} />
                                ))
                                :
                                t("No Beneficiaries")
                        }
                    </div>
                </div>
            </div>
        </>

    )
}

export default Beneficiaries