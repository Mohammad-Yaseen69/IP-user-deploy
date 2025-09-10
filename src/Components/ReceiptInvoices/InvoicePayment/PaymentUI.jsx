import React from 'react'
import styles from '../../PaymentAddressPublic/styles/PAC.module.scss'
import UserDets from '../../PaymentAddressPublic/UserDets'
import { LeftJsx } from '../../PaymentAddressPublic/PaymentAddressComponent'
import { Card, CardBody } from 'reactstrap'
import useWindowWidth from '../../../utils/useWindowWidth'
import AmountContainer from '../../PaymentAddressPublic/AmountContainer'
import { formatCurrency } from '../../../Helper/AmountFormat'
import CitiesData from "../../CitiesDropDown/CitiesData.json"
import CountriesData from "../../PaymentsNewer/CountriesData.json"
import PayAsGuest from '../../PaymentAddressPublic/PayAsGuest'


const PaymentUI = ({ data, dataHandler, user_name, invoiceId, state, url, toggleCreditModal }) => {
    const width = useWindowWidth()

    return (
        <>
            {
                state.showCreditModal
                &&
                <PayAsGuest
                    amount={formatCurrency(data.amount, true)}
                    isOpen={state.showCreditModal}
                    toggle={toggleCreditModal}
                    user={data.account}
                    wallet={data?.receivingWallet}
                    username={user_name}
                    isShipping={data.shippingAddress}
                    invoiceId={data.invoiceId}
                />
            }
            <div style={{ flex: width > 1000 && .5, borderRadius: '16px', width: width < 1000 && "100%", overflow: width < 100 && 'hidden', alignSelf: width > 1000 && "stretch", display: width > 1000 && "grid", gap: '10px', background: width < 1000 && "white" }} className={styles.right}>
                <UserDets
                    cover={data?.account?.coverImage?.url}
                    dp={data?.account?.profileImage?.url}
                    setShowVerTT={(value) => dataHandler("showVerTT", value)}
                    showVerTT={state.showVerTT}
                    userCountry={CountriesData.find(c => c.alpha3 === data?.account?.country?.country_iso_code)}
                    userDetails={{
                        ...data.account,
                        kyc_status: data?.account?.user?.kyc_status
                    }}
                    user_name={user_name}
                />

                <AmountContainer
                    isEditable={false}
                    state={{
                        amount: data.amount,
                        currencyCode: data.currency,
                        currencySymbol: CitiesData?.find(c => c?.currency === data?.currency)?.currency_symbol
                    }}
                    url={url}
                    toggleCreditModal={toggleCreditModal}
                />


                {width < 1000 &&
                    <div>
                        <LeftJsx
                            amount={data.amount}
                            currency={data.currency}
                            description={data.description}
                            title={data.title}
                            user_name={user_name}
                            userDetails={data.account}
                            width={width}
                            invoiceId={invoiceId}
                            userVideos={[]}
                        />
                    </div>
                }
            </div>
            {width > 1000 &&
                <LeftJsx
                    amount={data.amount}
                    currency={data.currency}
                    description={data.description}
                    title={data.title}
                    invoiceId={invoiceId}
                    user_name={user_name}
                    userVideos={[]}
                    userDetails={data.account}
                    width={width}
                />
            }
        </>
    )
}

export default PaymentUI
