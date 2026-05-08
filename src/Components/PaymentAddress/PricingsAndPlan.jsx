import { useTranslation } from "react-i18next"
import styles from "./styles/Pricings.module.css"
import { useState, useRef, useEffect, useContext } from "react"
import PricingsAddModal from "./PricingsAddModal"
import SubscribersModal from "./SubscribersModal"
import { formatCurrency } from "../../Helper/AmountFormat";
import { UserContext } from "../../Context/UserContext";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { addPlan, deletePlan as deletePlanApi, getUserPlans, updatePlan } from "./queries/pricings"
import { decryptData } from "../../Helper/EssentilaMethods/Decryption"
import { toast } from "react-toastify"
import { apiWrapper } from "../../utils/Functions/apiWrapper";



const PricingsAndPlan = () => {
    const { t } = useTranslation()
    const [plans, setPlans] = useState([])
    const [showAddModal, setShowAddModal] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [showSubscribersModal, setShowSubscribersModal] = useState(false)
    const [subscribersData, setSubscribersData] = useState([])
    const [selectedPlan, setSelectedPlan] = useState(null)
    const [openMenuPlanId, setOpenMenuPlanId] = useState(null)
    const { userDetails } = useContext(UserContext)
    const queryClient = useQueryClient()

    const menuRefs = useRef({})

    const { data, isLoading } = useQuery({
        queryKey: ["GetUserPlans", userDetails?.username],
        queryFn: () => getUserPlans(userDetails?.username),
        enabled: !!userDetails?.username
    })

    useEffect(() => {
        if (data) setPlans(data || [])
    }, [data])

    useEffect(() => {
        const handleDocumentClick = (e) => {
            if (openMenuPlanId && menuRefs.current[openMenuPlanId]) {
                if (!menuRefs.current[openMenuPlanId].contains(e.target)) {
                    setOpenMenuPlanId(null)
                }
            }
        }
        document.addEventListener('mousedown', handleDocumentClick)
        return () => document.removeEventListener('mousedown', handleDocumentClick)
    }, [openMenuPlanId])

    // Mutations
    const { mutateAsync: addMutate, isPending: isAdding } = useMutation({
        mutationFn: (payload) => addPlan(payload),
        onError: (error) => {
            const dec = error?.response?.data?.data ? decryptData(error.response.data.data) : error.response?.data
            toast.error(dec?.message || t("Unable to add plan"))
        },
        onSuccess: () => {
            toast.success(t("Plan created"))
            queryClient.invalidateQueries({ queryKey: ["GetUserPlans"] })
            setShowAddModal(false)
        }
    })

    const { mutateAsync: editMutate, isPending: isEditing } = useMutation({
        mutationFn: ({ planId, payload }) => updatePlan(planId, payload),
        onError: (error) => {
            const dec = error?.response?.data?.data ? decryptData(error.response.data.data) : error.response?.data
            toast.error(dec?.message || t("Unable to update plan"))
        },
        onSuccess: () => {
            toast.success(t("Plan updated"))
            queryClient.invalidateQueries({ queryKey: ["GetUserPlans"] })
            setShowEditModal(false)
        }
    })

    const { mutateAsync: deleteMutate, isPending: isDeleting } = useMutation({
        mutationFn: (planId) => deletePlanApi(planId),
        onError: (error) => {
            const dec = error?.response?.data?.data ? decryptData(error.response.data.data) : error.response?.data
            toast.error(dec?.message || t("Unable to delete plan"))
        },
        onSuccess: () => {
            toast.success(t("Plan deleted"))
            queryClient.invalidateQueries({ queryKey: ["GetUserPlans"] })
        }
    })

    const { mutateAsync: getSubscribers, isPending: isGettingSubscribers } = useMutation({
        mutationFn: (planId) => apiWrapper({
            endpoint: `/api/plans/get-subscribers/${planId}`
        }).then(dec => dec?.data || [])
    })

    const handleViewSubscription = async (planId) => {
        setOpenMenuPlanId(null)
        const res = await getSubscribers(planId)
        setSubscribersData(res)
        setShowSubscribersModal(true)
    }

    const handleDelete = async (planId) => {
        if (isGettingSubscribers) return
        await deleteMutate(planId)
        setOpenMenuPlanId(null)
    }

    const handleEdit = (plan) => {
        setSelectedPlan(plan)
        setShowEditModal(true)
        setOpenMenuPlanId(null)
    }

    const handleEditSave = async (updatedPlan) => {
        const payload = {
            price: Number(String(updatedPlan.price).replace(/,/g, '')),
            description: updatedPlan.description,
            title: updatedPlan.title,
            account: updatedPlan.account || userDetails?._id,
            receivingWallet: updatedPlan.receivingWallet || updatedPlan.currency, // keep compatibility
            billingCycle: updatedPlan.billingCycle,
            termsAndConditions: updatedPlan.tAndC
        }
        await editMutate({ planId: updatedPlan?._id, payload })
    }

    const handleAddSave = async (payload) => {
        const addPayload = {
            price: Number(String(payload.price).replace(/,/g, '')),
            description: payload.description,
            termsAndConditions: payload.tAndC,
            title: payload.title,
            account: userDetails?._id,
            receivingWallet: payload.currency,
            billingCycle: payload.billingCycle
        }
        await addMutate(addPayload)
    }

    return (
        <div className={styles.container}>
            <div className={styles.top}>
                <div >
                    <h1>{t("Plans & Pricing")}</h1>
                    {plans?.length > 0 &&
                        <button
                            onClick={() => setShowAddModal(true)}
                            style={{ background: '#5926F0', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 16px', fontWeight: 600, cursor: 'pointer', fontSize: 14, width: "100px" }}
                        >
                            {t('Add new')}
                        </button>
                    }
                </div>
                <p>{t("Create subscription plans or pricing packages to display on your public Payment Address. Clients can choose a plan directly, and the amount will auto-fill at checkout.")}</p>
            </div>

            {isLoading && <div style={{ padding: 20 }}>{t('Loading plans...')}</div>}

            {(!isLoading && plans?.length === 0) &&
                <div className={styles.addContainer}>
                    <span className={styles.icon} onClick={() => setShowAddModal(true)}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="21" height="21" viewBox="0 0 21 21" fill="none">
                            <path d="M10.5003 5.10156V16.7682M4.66699 10.9349H16.3337" stroke="#5926F0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </span>

                    <div className={styles.text}>
                        <h3>
                            {t("You haven’t created any plans yet")}
                        </h3>
                        <p>
                            {t(`Add your first plan to start offering subscriptions or fixed packages to your clients.`)}
                        </p>
                    </div>
                </div>
            }

            {plans?.length > 0 && window.innerWidth > 700 &&
                <div style={{ overflowX: 'auto', width: '100%' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', background: '#FFF', minWidth: 680 }}>
                        <thead>
                            <tr style={{ color: '#5B5B5B', fontWeight: 600, fontSize: 14 }}>
                                <th style={{ padding: '14px 8px', textAlign: 'left' }}>{t('Title')}</th>
                                <th style={{ padding: '14px 8px', textAlign: 'left' }}>{t('Description')}</th>
                                <th style={{ padding: '14px 8px', textAlign: 'left' }}>{t('Price')}</th>
                                <th style={{ padding: '14px 8px', textAlign: 'left' }}>{t('Billing Cycle')}</th>
                                <th style={{ padding: '14px 8px', textAlign: 'center', width: 56 }}>{t('Actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {plans.map(plan => (
                                <tr key={plan.id || plan._id} style={{ fontSize: 14, fontWeight: 600, position: 'relative' }}>
                                    <td style={{ padding: '12px 8px', fontWeight: 500 }}>{plan.title}</td>
                                    <td style={{ padding: '12px 8px', }}>{plan.description}</td>
                                    <td style={{ padding: '12px 8px', whiteSpace: 'nowrap' }}>{plan.currency || plan?.receivingWallet?.currency?.code} {Number(plan.price).toFixed(2)}</td>
                                    <td style={{ padding: '12px 8px' }}>{t(plan.billingCycle)}</td>
                                    <td style={{ padding: '12px 8px', textAlign: 'center', position: 'relative' }}>
                                        <span
                                            style={{ display: 'inline-block', cursor: 'pointer', borderRadius: 6, padding: 5, transition: 'background .15s', background: openMenuPlanId === (plan._id) ? '#eceaff' : 'transparent' }}
                                            onClick={() => setOpenMenuPlanId(openMenuPlanId === (plan.id || plan._id) ? null : (plan.id || plan._id))}
                                        >
                                            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                                                <circle cx="11" cy="5" r="1.5" fill="#888" />
                                                <circle cx="11" cy="11" r="1.5" fill="#888" />
                                                <circle cx="11" cy="17" r="1.5" fill="#888" />
                                            </svg>
                                        </span>
                                        {openMenuPlanId === (plan.id || plan._id) && (
                                            <div ref={el => menuRefs.current[plan.id || plan._id] = el} style={{ position: 'absolute', top: 38, right: 16, background: '#fff', boxShadow: '0 4px 12px 0 rgba(0,0,0,0.13)', borderRadius: 10, zIndex: 10, minWidth: 110, padding: '3px 0', transition: 'opacity .2s' }}>
                                                <div style={{ padding: '8px 18px', cursor: 'pointer', color: '#5926F0', fontWeight: 600, fontSize: 14 }} onClick={() => handleEdit(plan)}>{t('Edit')}</div>
                                                <div style={{ padding: '8px 18px', cursor: 'pointer', color: '#5926F0', fontWeight: 600, fontSize: 14 }} onClick={() => handleViewSubscription(plan?._id)}>{isGettingSubscribers ? t('Loading...') : t('Subscribers')}</div>
                                                <div style={{ padding: '8px 18px', cursor: 'pointer', color: '#e11d48', fontWeight: 600, fontSize: 14 }} onClick={() => handleDelete(plan._id)}>{isDeleting ? t('Deleting...') : t('Delete')}</div>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            }

            {plans?.length > 0 && window.innerWidth < 700 &&
                <div className={styles.mobileItems}>
                    {plans.map((plan, idx) => (
                        <div key={idx} className={styles.mobileItem}>
                            <div className={styles.left}>
                                <h3>
                                    {plan.title}
                                </h3>
                                <p>
                                    {plan.description}
                                </p>
                            </div>

                            <div className={styles.right}>
                                <div className={styles.topContent}>
                                    <h5>
                                        {formatCurrency(plan.price, true)}
                                    </h5>

                                    <span>
                                        /{plan.billingCycle}
                                    </span>
                                </div>

                                <div>
                                    <span style={{ fontWeight: 600, color: "red", fontSize: "11px", cursor: "pointer" }} onClick={() => handleDelete(plan.id || plan._id)}>
                                        {t("Delete")}
                                    </span>
                                    <span style={{ fontWeight: 600, color: "#6039CD", fontSize: "11px", marginLeft: "5px", cursor: 'pointer' }} onClick={() => handleEdit(plan)}>
                                        {t("Edit")}
                                    </span>
                                    <span style={{ fontWeight: 600, color: "#5926F0", fontSize: "11px", marginLeft: "5px", cursor: 'pointer' }} onClick={() => handleViewSubscription(plan.id || plan._id)}>
                                        {t("Subscribers")}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            }

            <PricingsAddModal isOpen={showAddModal} toggle={() => setShowAddModal(false)} onAddSave={handleAddSave} submitting={isAdding} />
            {showEditModal && (
                <PricingsAddModal
                    isOpen={showEditModal}
                    toggle={() => setShowEditModal(false)}
                    editMode={true}
                    plan={selectedPlan}
                    onEditSave={handleEditSave}
                    submitting={isEditing}
                />
            )}
            <SubscribersModal
                isOpen={showSubscribersModal}
                toggle={() => setShowSubscribersModal(false)}
                subscribers={subscribersData}
            />
        </div>
    )
}

export default PricingsAndPlan
