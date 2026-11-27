import { useEffect } from "react"
import { useTranslation } from "react-i18next"
import InstaPayLoader from "../Loader"
import {
    getPaytentlyGuestReturn,
    getPaytentlyReturn,
    precheckPaytentlyGuestPayment,
    precheckPaytentlyPayment,
} from "../../utils/Functions/paytently"

const PaytentlyCardCollected = () => {
    const { t } = useTranslation()

    useEffect(() => {
        const guest = getPaytentlyGuestReturn()
        if (guest.paymentId) {
            const failed = `/pay/${guest.username || "NA"}/failed?code=null`
            precheckPaytentlyGuestPayment(guest.paymentId)
                .then((authorizeUrl) => window.location.replace(authorizeUrl))
                .catch(() => window.location.replace(failed))
            return
        }

        const { paymentId, failureUrl } = getPaytentlyReturn()
        const failed = failureUrl || "/"

        if (!paymentId) {
            window.location.replace(failed)
            return
        }

        precheckPaytentlyPayment(paymentId)
            .then((authorizeUrl) => window.location.replace(authorizeUrl))
            .catch(() => window.location.replace(failed))
    }, [])

    return (
        <div style={{ height: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
            <InstaPayLoader />
            <p>{t("Card details received. Continuing to verification…")}</p>
        </div>
    )
}

export default PaytentlyCardCollected
