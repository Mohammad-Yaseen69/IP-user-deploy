import { Check } from "react-feather"
import { useTranslation } from "react-i18next"
import { Card, CardBody } from "reactstrap"
import bd from "../../PaymentsNewer/files/PaymentsNewFiles/bd.png"
import cp from "../../PaymentsNewer/files/PaymentsNewFiles/cp.png"
import mw from "../../PaymentsNewer/files/PaymentsNewFiles/mw.png"
import pc from "../../PaymentsNewer/files/PaymentsNewFiles/pc.png"
import cw from "../../PaymentsNewer/files/PaymentsNewFiles/cw.png"
import i from "../../PaymentsNewer/files/PaymentsNewFiles/i.svg"
import { useEffect } from "react"
import { service_name_formatter } from "../../TransactionsNewApi/TransactionItem"

const PayoutChannel = ({
    payoutChannel,
    setPayoutChannel,
    userWithdrawals,
    setValidPayouts,
    forceSet = null
}) => {
    const { t } = useTranslation()
    const payoutChannelData = [
        userWithdrawals?.bank_details?.length > 0
            ?
            {
                name: "Bank Account",
                id: 2,
                icon: bd,
                value: "bank",
                sub_value: "bank_details",
                neemaId: 2,
                withdrawalName: userWithdrawals?.bank_details?.[0]?.name
            } : { id: 1000 },
        userWithdrawals?.cash_pickup?.length > 0
            ?
            {
                name: "Cash Pickup",
                id: 3,
                icon: cp,
                value: "cash",
                sub_value: "cash_pickup",
                neemaId: 1,
                withdrawalName: userWithdrawals?.cash_pickup?.[0]?.document_number

            } : { id: 1000 },
        userWithdrawals?.mobile_wallet?.length > 0
            ?
            {
                name: "Mobile Wallet",
                id: 1,
                icon: mw,
                value: "mobile",
                sub_value: "mobile_wallet",
                neemaId: 3,
                withdrawalName: userWithdrawals?.mobile_wallet?.[0]?.money_provider
            } : { id: 1000 },
        userWithdrawals?.payment_card?.length > 0
            ?
            {
                name: "Payment Card",
                id: 5,
                icon: pc,
                value: "card",
                sub_value: "payment_card",
                neemaId: 4,
                withdrawalName: userWithdrawals?.payment_card?.[0]?.card_name

            } : { id: 1000 },
        userWithdrawals?.crypto_wallet?.length > 0
            ?
            {
                name: "Crypto Wallet",
                id: 4,
                icon: cw,
                value: "crypto",
                withdrawalName: userWithdrawals?.crypto_wallet?.[0]?.wallet_address
            } : { id: 1000 },
        userWithdrawals?.crypto_wallet?.length > 0
            ?
            {
                name: "Crypto Wallet",
                id: 4,
                icon: cw,
                value: "crypto",
            } : { id: 1000 },
    ].filter(item => item?.name)

    useEffect(() => {
        if (payoutChannelData.length === 0) {
            setValidPayouts(false)
        }
    }, [payoutChannelData])

    useEffect(() => {
        let timeout;
        if (forceSet !== null) {
            timeout = setTimeout(() => {
                setPayoutChannel(payoutChannelData.find(item => item.id === forceSet))
            }, 500)
        }
        return () => clearTimeout(timeout)
    }, [forceSet])
    return (
        <div>
            <h5 style={{
                fontSize: "1rem",
                fontWeight: "500",
                marginBottom: "1rem"
            }}>{service_name_formatter(t("select a payout channel"))}:</h5>
            <div style={{
                paddingBottom: "0",
                display: "flex",
                flexDirection: "column",
                gap: "14px",
                borderRadius: "12px",
                padding: "1.5rem",
                background: "rgba(0,0,0,.03)",
                paddingBottom: 0,
                boxShadow: "0px 18px 15.348464965820312px -15px rgba(89, 38, 240, 0.16)"
            }}>
                {
                    payoutChannelData.length > 0
                        ?
                        payoutChannelData.map(item => (
                            <Card key={item?.name} style={{ marginBottom: 0, borderRadius: "12px" }} onClick={() => {
                                setPayoutChannel(item)
                            }}>
                                <CardBody style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: ".5rem",
                                    padding: "15px",
                                    justifyContent: "space-between",
                                    cursor: "pointer",
                                    position: "relative",
                                }}>
                                    <div style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "20px"
                                    }}>
                                        <div style={{
                                            height: "35px",
                                            width: "35px",
                                            background: "linear-gradient(-24deg, rgb(210, 60, 122) 0%, rgb(164, 52, 167) 43.66%, rgb(88, 38, 239) 100%)",
                                            display: "flex",
                                            justifyContent: "center",
                                            alignItems: "center",
                                            borderRadius: "12px",
                                            boxShadow: "0px 4px 7px rgba(172, 53, 159, 0.31)"
                                        }}>
                                            <img src={item?.icon} draggable="false" alt={item?.name?.[0]} style={{
                                                width: "19px",
                                                objectFit: "contain",
                                                aspectRatio: 1
                                            }} />
                                        </div>
                                        <div style={{ display: "grid", gap: "5px" }}>
                                            <h5 style={{ marginBottom: 0, fontSize: "1.2rem" }}>{t(item?.name)}</h5>
                                            <h5 style={{ marginBottom: 0, fontSize: "0.8rem" }}>{t(item?.withdrawalName)}</h5>
                                        </div>
                                    </div>
                                    {
                                        payoutChannel?.name === item?.name
                                            ?
                                            <Check color="green" size={24} style={{ position: "absolute", right: "20px" }} />
                                            :
                                            <img src={i} alt="i" style={{ objectFit: "cover", position: "absolute", right: "14px", top: "19px" }} />
                                    }
                                </CardBody>
                            </Card>
                        ))
                        :
                        <span>No payment method supported at the moment.</span>
                }
            </div>
        </div>
    )
}

export default PayoutChannel