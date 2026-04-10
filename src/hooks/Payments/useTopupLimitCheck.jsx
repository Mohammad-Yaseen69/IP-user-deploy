import { useContext, useEffect, useState } from 'react'
import { UserContext } from '../../Context/UserContext'
import usePlainFx from './usePlainFx'
import { formatCurrency } from '../../Helper/AmountFormat'
import { service_name_formatter } from '../../Components/TransactionsNewApi/TransactionItem'
import { useTranslation } from 'react-i18next'

const useTopupLimitCheck = (sendingCurrency, amount, paymentMethod) => {
    const { userDetails } = useContext(UserContext)
    const topupMethods = ["card", "paypal", "mobile_wallet", "bank_transfer"]
    const { getExchangeRate } = usePlainFx()
    const [limitStatus, setLimitStatus] = useState({ status: true, thresholdLimit: null, message: "" })
    const { t } = useTranslation()
    useEffect(() => {
        const limitCheck = async () => {
            if (!userDetails) return

            let thresholdLimit = userDetails?.is_external_limit
                ? userDetails?.external_limits?.topup_min_amount || userDetails?.level?.topup_min_amount
                : userDetails?.level?.topup_min_amount

            let sendingAmount = amount
            if (sendingCurrency !== "USD") {
                const result = await getExchangeRate("USD", sendingCurrency, thresholdLimit)
                if (result) thresholdLimit = result
            }

            if (sendingAmount < thresholdLimit) {
                setLimitStatus({
                    status: false,
                    thresholdLimit,
                    message: t("The minimum transaction amount for {{paymentMethod}} payment method is {{currency}} {{amount}}. Please enter an amount higher than {{currency}} {{amount}} or select another method to continue this transaction.", {
                        paymentMethod: service_name_formatter(paymentMethod),
                        currency: sendingCurrency,
                        amount: formatCurrency(thresholdLimit)
                    })
                })
            } else {
                setLimitStatus({ status: true, thresholdLimit: null, message: "" })
            }
        }

        if (
            paymentMethod &&
            amount &&
            sendingCurrency &&
            userDetails &&
            Object.keys(userDetails).length > 0 &&
            topupMethods.includes(paymentMethod)
        ) {
            limitCheck()
        }
    }, [paymentMethod, amount, sendingCurrency, userDetails, getExchangeRate])

    return {
        limitStatus,
        clearStatus: () => {
            setLimitStatus({ status: true, thresholdLimit: null, message: "" })
        }
    }
}

export default useTopupLimitCheck