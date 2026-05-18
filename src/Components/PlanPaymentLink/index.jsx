import { useReducer } from 'react'
import styles from '../ReceiptInvoices/InvoicePayment/styles/index.module.scss'
import background from "../ReceiptInvoices/InvoicePayment/files/bg.jpg"
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import InstaPayLoader from '../Loader'
import { Card } from 'reactstrap'
import { useTranslation } from 'react-i18next'
import { getUserPlans } from '../PaymentAddress/queries/pricings'
import PaymentUI from '../PlansSubscriptions/PaymentUI'

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

const PlanPaymentLink = () => {
    const [state, dispatch] = useReducer(reducer, initialState)
    const { t } = useTranslation()
    const dataHandler = (field, value) => {
        dispatch({ type: "UPDATE_FIELD", field, value })
    }

    const { username, planId } = useParams()

    const { data: plans, isLoading } = useQuery({
        queryKey: ["GetUserPlansForPayment", username],
        queryFn: () => getUserPlans(username),
        enabled: !!username,
        refetchOnWindowFocus: false
    })

    const data = plans?.find(p => p.planId === planId)

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
                <h3 style={{ textAlign: "center", color: "black", margin: "18px", zIndex: 100 }}>{t("This Plan does not exist.")}</h3>
            </Wrapper>
        )
    }

    const formattedData = {
        plan: data,
        amount: data.price,
        currency: data.receivingWallet?.currency?.code || data.currency,
        receivingWallet: data.receivingWallet,
        countryIsoCode: data.account?.country?.country_iso_code,
    }

    const url = `/payments?payment_action=send_money&send_type=wallet&wallet_id=${data.receivingWallet?.wallet_id}&currency=${data.receivingWallet?.currency?.code}&amount=${data.price}&planId=${data.planId || data._id}&payment_type=plan`

    return (
        <Wrapper>
            <PaymentUI
                data={formattedData}
                user_name={username}
                dataHandler={dataHandler}
                state={state}
                isSubscription={true}
                url={url}
            />
        </Wrapper>
    )
}

export default PlanPaymentLink
