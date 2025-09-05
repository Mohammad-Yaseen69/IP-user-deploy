import React, { useEffect, useReducer } from 'react'
import styles from '../../PaymentAddressPublic/styles/PAC.module.scss'
import background from "../../PaymentAddressPublic/vpa_bg.png"
import UserDets from '../../PaymentAddressPublic/UserDets'
import { LeftJsx } from '../../PaymentAddressPublic/PaymentAddressComponent'
import { Card, CardBody } from 'reactstrap'
import useWindowWidth from '../../../utils/useWindowWidth'
import { useParams } from 'react-router-dom'
import AmountContainer from '../../PaymentAddressPublic/AmountContainer'
import { useQuery } from '@tanstack/react-query'
import { getInvoiceUsingId } from '../queries'
import InstaPayLoader from '../../Loader'
import { formatCurrency } from '../../../Helper/AmountFormat'
import CitiesData from "../../CitiesDropDown/CitiesData.json"
import CountriesData from "../../PaymentsNewer/CountriesData.json"

const initialState = {
  amount: "1.00",
  showAboutModal: false,
  showCreditModal: false,
  guestPayError: "",
  showVerTT: false
}

function reducer(state, action) {
  switch (action.type) {
    case "UPDATE_FIELD":
      return {
        ...state,
        [action.field]: action.value
      };
    default:
      return state;
  }
}


const Wrapper = ({ children }) => (
  <div style={{ background: `url(${background})`, borderRadius: "none", minHeight: "100vh" }} className={styles.container}>
    <div className={styles.overlay} />
    {children}
  </div>
)

const InvoicePayment = () => {
  const [state, dispatch] = useReducer(reducer, initialState)
  const width = useWindowWidth()
  const dataHandler = (field, value) => {
    dispatch({ type: "UPDATE_FIELD", field, value })
  }

  const { username: user_name, invoiceId } = useParams()
  const { data, isLoading } = useQuery({
    queryKey: ["GetInvoicePerId", invoiceId],
    queryFn: () => getInvoiceUsingId(invoiceId),
    refetchOnWindowFocus: false
  })


  const url = data ? `/payments?payment_action=send_money&payment_type=payment_address&send_type=wallet&wallet_id=${data.receivingWallet?.wallet_id}&currency=${data.currency}&amount=${data.amount}&invoiceId=${invoiceId}` : "/"


  const JSX = () => (
    <Card style={{ marginBottom: "0", boxShadow: "unset", width: '100%' }} className={styles.sub_container}>
      <CardBody className={styles.sc_body}>

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
              amount: formatCurrency(data.amount, true),
              currencyCode: data.currency,
              currencySymbol: CitiesData?.find(c => c?.currency === data?.currency)?.currency_symbol
            }}
            url={url}
            toggleCreditModal={() => { }}
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
      </CardBody>
    </Card>
  )

  if (isLoading) {
    return (
      <div style={{ position: "relative", width: "100%", zIndex: 100 }}>
        <InstaPayLoader transparent={true} />
      </div>
    )
  }

  if (!data) {
    return (
      <Wrapper>
        <h3 style={{ textAlign: "center", color: "white", margin: "auto", zIndex: 100 }}>This Invoice Does not exist.</h3>
      </Wrapper>
    )
  }

  if (data.paid) {
    return (
      <Wrapper>
        <h3 style={{ textAlign: "center", color: "white", margin: "auto", zIndex: 100 }}>This Invoice is Already Paid.</h3>
      </Wrapper>
    )
  }

  return (
    <Wrapper>
      <JSX />
    </Wrapper>
  )
}

export default InvoicePayment