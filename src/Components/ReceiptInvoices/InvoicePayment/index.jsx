import React, { useEffect, useReducer } from 'react'
import styles from '../../PaymentAddressPublic/styles/PAC.module.scss'
import background from "../../PaymentAddressPublic/vpa_bg.png"
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getInvoiceUsingId } from '../queries'
import InstaPayLoader from '../../Loader'
import PaymentUI from './PaymentUI'
import AmountContainer from '../../PaymentAddressPublic/AmountContainer'
import UserDets from '../../PaymentAddressPublic/UserDets'
import { formatCurrency } from '../../../Helper/AmountFormat'
import CitiesData from "../../CitiesDropDown/CitiesData.json"
import CountriesData from "../../PaymentsNewer/CountriesData.json"
import { Card, CardBody } from 'reactstrap'
import { toast } from 'react-toastify'
import axios from 'axios'
import { decryptData } from '../../../Helper/EssentilaMethods/Decryption'
import { useTranslation } from 'react-i18next'

const initialState = {
  showAboutModal: false,
  showCreditModal: false,
  guestPayError: "",
  showVerTT: false,
  amount: "",
  currentWallet: {}
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


const Wrapper = ({ children, isPaid }) => (
  <div style={{ background: `url(${background})`, borderRadius: "none", minHeight: "100vh" }} className={styles.container}>
    <div className={styles.overlay} />
    <Card style={{ marginBottom: "0", boxShadow: "unset", width: '100%' }} className={styles.sub_container}>
      <CardBody style={{ display: isPaid && "flex" }} className={styles.sc_body}>
        {children}
      </CardBody>
    </Card>
  </div >
)

const InvoicePayment = () => {
  const [state, dispatch] = useReducer(reducer, initialState)
  const { t } = useTranslation()
  const dataHandler = (field, value) => {
    dispatch({ type: "UPDATE_FIELD", field, value })
  }

  const { username: user_name, invoiceId } = useParams()
  const { data, isLoading } = useQuery({
    queryKey: ["GetInvoicePerId", invoiceId],
    queryFn: () => getInvoiceUsingId(invoiceId),
    refetchOnWindowFocus: false
  })


  useEffect(() => {
    const getLimits = () => {
      axios.get(`${import.meta.env.VITE_IP_DEV_API}/api/payment-address/get-payment-address-public/${user_name}`).then(res => {
        const dec = decryptData(res.data.data)
        dataHandler("limits", dec?.limits)
        console.log(dec)
      })
    }

    if (user_name) {
      getLimits()
    }
  }, [user_name])



  const toggleCreditModal = () => {
    if (!state.limits) console.log("limits not found", state)
    // if (data.amount < state.limits?.topup_min_amount) {
    //   toast.error(t("Minimum amount for guest pay is") + formatCurrency(state.limits?.topup_min_amount, true) + " " + data?.currency)
    //   dataHandler("guestPayError", t("Minimum amount for guest pay is") + formatCurrency(state.limits?.topup_min_amount, true) + " " + data?.currency)
    //   setTimeout(() => {
    //     dataHandler("guestPayError", "")
    //   }, 3000)
    // }
    // else if (data.amount > state.limits?.topup_max_amount) {
    //   toast.error("Maximum amount for guest pay is " + formatCurrency(state.limits?.topup_max_amount, true) + " " + data?.currency)
    //   dataHandler("guestPayError", "Maximum amount for guest pay is " + formatCurrency(state.limits?.topup_max_amount, true) + " " + data?.currency)
    //   setTimeout(() => {
    //     dataHandler("guestPayError", "")
    //   }, 3000)
    // }
    // else {
      dataHandler("showCreditModal", !state.showCreditModal);
    // }
  }


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




  const url = data ? `/payments?payment_action=send_money&send_type=wallet&wallet_id=${data.receivingWallet?.wallet_id}&currency=${data.currency}&amount=${data.amount}&invoiceId=${invoiceId}&isShipping=${data.shippingAddress}&payment_type=invoice` : "/"

  if (data.paid) {
    return (
      <Wrapper isPaid={true}>
        <div style={{ width: "800px", background: "white", borderRadius: "24px", margin: "auto" }}>
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
            invoicePaid={true}
            AmountComponent={
              <AmountContainer
                isEditable={false}
                state={{
                  amount: formatCurrency(data.amount, true),
                  currencyCode: data.currency,
                  currencySymbol: CitiesData?.find(c => c?.currency === data?.currency)?.currency_symbol
                }}
                url={url}
                toggleCreditModal={toggleCreditModal}
                paidInvoice={true}
              />
            }
          />


          <div className={styles.paidInvoice} >
            <p>
              {("This invoice is paid!")}
            </p>
          </div>
        </div>
      </Wrapper>
    )
  }


  return (
    <Wrapper>
      <PaymentUI
        data={data}
        dataHandler={dataHandler}
        state={state}
        invoiceId={invoiceId}
        url={url}
        toggleCreditModal={toggleCreditModal}
        user_name={user_name}
      />
    </Wrapper>
  )
}

export default InvoicePayment