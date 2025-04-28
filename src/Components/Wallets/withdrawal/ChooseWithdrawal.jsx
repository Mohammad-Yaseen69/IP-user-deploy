import React, { useContext, useMemo } from 'react'
import { Check } from 'react-feather'
import { useTranslation } from 'react-i18next'
import { Card, CardBody } from 'reactstrap'
import i from "../../PaymentsNewer/files/PaymentsNewFiles/i.svg"
import { UserContext } from '../../../Context/UserContext'
import countries from "../../PaymentsNewer/CountriesData.json"
import { service_name_formatter } from '../../TransactionsNewApi/TransactionItem'

const ChooseWithdrawal = ({ current, setCurrent, withdrawal }) => {
    const { t } = useTranslation()
    const { allowedCountries } = useContext(UserContext)
    const country = useMemo(() => {
        const country = countries?.find(item => item?.alpha3 === withdrawal?.iso_code)
        return country
    }, [allowedCountries, withdrawal])
    return (
        <Card style={{ marginBottom: 0, borderRadius: "12px" }} onClick={() => {
            setCurrent(withdrawal)
        }}>
            <CardBody style={{
                display: "flex",
                alignItems: "center",
                gap: ".5rem",
                padding: "15px",
                justifyContent: "space-between",
                cursor: "pointer",
                position: "relative",
                height: "70px"
            }}>
                <div style={{
                    display: "flex",
                    flexDirection: "column"
                }}>
                    <h5 style={{ marginBottom: 0, fontSize: "1.2rem" }}>{country?.name}</h5>
                    <div style={{}}>
                        {service_name_formatter(withdrawal?.account_type?.join("_"))}
                    </div>
                </div>
                {
                    current === "default"
                        ?
                        <Check color="green" size={24} />
                        :
                        <img src={i} alt="i" />
                }
            </CardBody>
        </Card>
    )
}

export default ChooseWithdrawal