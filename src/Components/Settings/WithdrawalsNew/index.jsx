import styles from "./styles/index.module.css"
import { useTranslation } from 'react-i18next'
import WithdrawalItem from "./WithdrawalItem"
import add_wd from "./files/add_wd.svg"
import { Button } from "reactstrap"
import { BsInfoCircleFill } from "react-icons/bs"
import React, { useContext, useEffect, useLayoutEffect, useState } from "react"
import { decryptData } from "../../../Helper/EssentilaMethods/Decryption"
import axios from "axios"
import { UserContext } from "../../../Context/UserContext"
import allCountries from "../../PaymentsNewer/CountriesData.json"
import AddWithdrawalsModal from "../../AddWithdrawa;sModal"

const WithdrawalsNew = () => {
    const { t } = useTranslation()
    const { authHeader, allowedCountries, userWithdrawals, getWithdrawals, userDetails } = useContext(UserContext)
    const [countries, setCountries] = useState([])
    const [newWithdrawal, setNewWithdrawal] = useState(false)
    useEffect(() => {
        if (userDetails) {
            getWithdrawals()
        }
    }, [userDetails])

    useEffect(() => {
        const getCountries = async () => {
            try {
                const res = await axios.get(`${process.env.REACT_APP_THUNES_API}/Countries`, { headers: authHeader })
                const decrypted = decryptData(res.data.data)
                const countriesArray = allCountries.filter((item) => {
                    return decrypted.some(apiCountry => apiCountry.countryIsoCode === item?.alpha3)
                })
                const allowed = allowedCountries?.map(allowed => {
                    const coun = countriesArray?.find(item => item?.alpha3 == allowed?.country_iso_code)
                    if (!coun) return null;
                    return {
                        ...coun,
                        id: allowed?._id
                    }
                })?.filter(item => item != null)
                setCountries(allowed)
            } catch (error) {
                console.log(error)
            }
        }

        getCountries()
    }, [])

    

    const [showWithdrawalGuide, setShowWithdrawalGuide] = useState(true)
    useLayoutEffect(() => {
        const shown = sessionStorage.getItem("withdrawal_guide")
        if (shown) {
            setShowWithdrawalGuide(false)
        }
    }, [])

    return (
        <div className={styles.container}>
            {/* {
                showWithdrawalGuide
                &&
                <AddWithdrawalsModal
                    isOpen={showWithdrawalGuide}
                    toggle={() => {
                        setShowWithdrawalGuide(false)
                        sessionStorage.setItem("withdrawal_guide", true)
                    }}
                />
            } */}
            <h1>{t("Unlock Instant Withdrawals: Set Up Your Receiving Accounts Now!")}</h1>
            <p>{t("Easily manage where you want to receive payments by adding the details of your bank accounts, mobile wallets, crypto wallets, payment cards, or cash pick-up locations. Follow the steps below to ensure you can instantly access your funds whenever you need them.")}</p>
            {
                userWithdrawals?.length > 0
                    ?
                    userWithdrawals?.map(item => {
                        console.log(item)
                        return (
                            <WithdrawalItem
                                countries={countries}
                                userWithdrawals={item}
                                count={userWithdrawals?.length}
                                key={item?._id}
                                setNewWithdrawal={setNewWithdrawal}
                            />
                        )
                    })
                    :
                    ""
            }
            {
                newWithdrawal
                &&
                <WithdrawalItem
                    countries={countries}
                    userWithdrawals={null}
                    count={userWithdrawals?.length}
                    key={"HEHE"}
                    setNewWithdrawal={setNewWithdrawal}
                />
            }
            {
                userWithdrawals?.length < 3
                &&
                <div className={styles.info}>
                    <div>
                        <BsInfoCircleFill color="#EB8C1D" size={window.innerWidth > 1000 ? 30 : 16} style={{ flexShrink: 0 }} />
                        <p>{t("Set up your receiving accounts in up to three countries and instantly cash out funds from approved payment requests to your activated payout channels.")}</p>
                    </div>
                    <Button onClick={() => setNewWithdrawal(true)}>
                        <img src={add_wd} alt="" />
                        <span>{t("Add New")}</span>
                    </Button>
                </div>
            }
        </div>
    )
}

export default WithdrawalsNew