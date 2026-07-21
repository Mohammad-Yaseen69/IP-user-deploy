import { useReducer } from 'react'
import styles from '../ReceiptInvoices/InvoicePayment/styles/index.module.scss'
import background from "../ReceiptInvoices/InvoicePayment/files/bg.jpg"
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import InstaPayLoader from '../Loader'
import { Card } from 'reactstrap'
import { useTranslation } from 'react-i18next'
import { apiWrapper } from '../../utils/Functions/apiWrapper'
import PaymentUI from './PaymentUI'

const initialState = {
    showAboutModal: false,
    showCreditModal: false,
    amount: "",
    currentWallet: {},
    cryptoDetails: {
        name: "",
        phone: "",
        reason: "",
        email: "",
        dob: "",
    },
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
        <Card style={{ marginBottom: "0px" }} className={styles.sub_container}>
            {children}
        </Card>
    </div >
)

const PlansSubscription = () => {
    const [state, dispatch] = useReducer(reducer, initialState)
    const { t } = useTranslation()
    const dataHandler = (field, value) => {
        dispatch({ type: "UPDATE_FIELD", field, value })
    }

    const { subscriptionId } = useParams()
    const { data, isLoading } = useQuery({
        queryKey: ["GetSubscriptionDetails", subscriptionId],
        queryFn: () => apiWrapper({
            endpoint: `/api/plans/subscription/${subscriptionId}`,
        }).then(res => res.data),
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        retryOnMount: false
    })

    if (isLoading) {
        return (
            <div style={{ position: "relative", width: "100%", zIndex: 100 }}>
                <InstaPayLoader transparent={true} />
            </div>
        )
    }

    console.log(data, 'data ')

    if (!data) {
        return (
            <Wrapper>
                <h3 style={{ textAlign: "center", color: "black", margin: "18px", zIndex: 100 }}>{t("This Subdscription Dodes not exist.")}</h3>
            </Wrapper>
        )
    }

    const url = data ? `/payments?payment_action=send_money&send_type=wallet&wallet_id=${data?.plan?.receivingWallet?.wallet_id}&currency=${data?.plan?.receivingWallet?.currency?.code}&amount=${data?.plan?.price}&subscriptionId=${subscriptionId}&planId=${data?.plan?.planId}&payment_type=plan` : "/"

    return (
        <Wrapper>
            <PaymentUI
                data={data}
                dataHandler={dataHandler}
                state={state}
                isSubscription={true}
                subscriptionId={subscriptionId}
                url={url}
                toggleCreditModal={() => dataHandler("showCreditModal", !state.showCreditModal)}
            />
        </Wrapper>
    )
}

export default PlansSubscription