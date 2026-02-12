import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiWrapper } from '../../../utils/Functions/apiWrapper'
import { toast } from 'react-toastify'
import { useTranslation } from 'react-i18next'
import styles from './styles/pendingRequests.module.scss'
import { useMemo } from 'react'

const PendingRequests = () => {
    const { t } = useTranslation()
    const queryClient = useQueryClient()

    const { data: requestsData, isLoading } = useQuery({
        queryKey: ["pendingRequests"],
        queryFn: async () => {
            const res = await apiWrapper({
                endpoint: "/api/pre-wallet/get-requests",
                method: "GET"
            })
            return res
        },
        cacheTime: 0,
        staleTime: 0,
        refetchOnMount: true,
        refetchOnWindowFocus: true
    })

    const { mutate: expireRequest, isPending } = useMutation({
        mutationFn: async (requestId) => {
            return await apiWrapper({
                endpoint: `/api/pre-wallet/expire-request/${requestId}`,
                method: "POST"
            })
        },
        onSuccess: () => {
            queryClient.invalidateQueries(["pendingRequests"])
            toast.success("Request expired successfully")
        },
        onError: (error) => {
            toast.error(error?.message || "Failed to expire request")
        }
    })

    const requests = requestsData?.response?.requests || []

    if (isLoading || requests.length === 0) return null

    const badgeColor = (request) => {
        switch (request?.status?.toLowerCase()) {
            case "paid":
                return "#28A745"
            case "expired":
                return "#C82333"
            case "pending":
                return "rgb(213 162 10)"
            case "pending_limits":
                return "rgb(213 162 10)"
            default:
                break;
        }
    }

    return (
        <div className={styles.container}>
            <div className={styles.top}>
                <h4>{t("PREVIOUS TRANSACTIONS")}</h4>
            </div>

            <div className={styles.transCont}>
                {requests.map((request) => {
                    const createdAt = new Date(request.createdAt).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric"
                    })


                    return (
                        <div key={request._id} className={styles.trans}>
                            <div className={styles.top}>
                                <div>
                                    <span className={styles.label}>{t("Phone")}</span>
                                    <h4>{request.to.identifier}</h4>
                                </div>
                                <div style={{ background: badgeColor(request), color: "white" }} className={styles.statusBadge}>
                                    {t(request.status).replace("_limits", "")}
                                </div>
                            </div>

                            <div className={styles.bottom}>
                                <div className={styles.leftSection}>
                                    <h4>
                                        {/* <span className={styles.details}>{t("Details")}</span> - */}
                                        {createdAt}
                                    </h4>
                                    <h4 className={styles.amount}>
                                        {request.originalReceivingFunds.currency} {request.originalReceivingFunds.amount.toFixed(2)}
                                    </h4>
                                </div>
                                {(request.status === "pending_limits" || request.status === "pending") && <button
                                    onClick={() => expireRequest(request._id)}
                                    disabled={isPending}
                                    className={styles.expireBtn}
                                >
                                    {t("Expire")}
                                </button>
                                }
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default PendingRequests
