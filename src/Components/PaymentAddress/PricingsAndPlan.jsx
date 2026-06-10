import { useTranslation } from "react-i18next"
import styles from "./styles/Pricings.module.css"
import { useState, useRef, useEffect, useContext } from "react"
import { createPortal } from 'react-dom'
import PricingsAddModal from "./PricingsAddModal"
import SubscribersModal from "./SubscribersModal"
import { formatCurrency } from "../../Helper/AmountFormat";
import { UserContext } from "../../Context/UserContext";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { addPlan, deletePlan as deletePlanApi, getUserPlans, updatePlan } from "./queries/pricings"
import { decryptData } from "../../Helper/EssentilaMethods/Decryption"
import { usePermission } from "../../hooks/GeneralUse/usePermission"
import { Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap'
import { ButtonForRequests } from "../ReceiptInvoices/UI/FormElements"
import { toast } from "react-toastify"
import { apiWrapper } from "../../utils/Functions/apiWrapper"
import { Search } from "react-feather"
import { useDebounce } from "../../hooks/useDebounce/useDebounce"

const PricingsAndPlan = ({ isInvoicePage = true }) => {
    const { t } = useTranslation()
    const [plans, setPlans] = useState([])
    const [showAddModal, setShowAddModal] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [showSubscribersModal, setShowSubscribersModal] = useState(false)
    const [subscribersData, setSubscribersData] = useState([])
    const [selectedPlan, setSelectedPlan] = useState(null)
    const [openMenuPlanId, setOpenMenuPlanId] = useState(null)
    const [showRemoveSyncModal, setShowRemoveSyncModal] = useState(false)
    const [planToRemoveSync, setPlanToRemoveSync] = useState(null)
    const { userDetails } = useContext(UserContext)
    const queryClient = useQueryClient()
    const [search, setSearch] = useState("")
    const debouncedSearch = useDebounce(search, 400)
    const menuRefs = useRef({})

    const { data, isLoading } = useQuery({
        queryKey: ["GetUserPlans", userDetails?.username, debouncedSearch, isInvoicePage],
        queryFn: () => getUserPlans(userDetails?.username, !isInvoicePage, debouncedSearch),
        enabled: !!userDetails?.username,
        staleTime: 0,
        gcTime: 0,
        cacheTime: 0,
    })

    useEffect(() => {
        if (data) setPlans(data || [])
    }, [data])

    useEffect(() => {
        const handleDocumentClick = (e) => {
            if (!openMenuPlanId) return
            const trigger = menuRefs.current[openMenuPlanId]
            const portalEl = document.querySelector('[data-portal-menu-id="' + openMenuPlanId + '"]')
            const clickedInsideTrigger = trigger && trigger.contains(e.target)
            const clickedInsidePortal = portalEl && portalEl.contains(e.target)
            if (!clickedInsideTrigger && !clickedInsidePortal) {
                setOpenMenuPlanId(null)
            }
        }
        document.addEventListener('mousedown', handleDocumentClick)
        return () => document.removeEventListener('mousedown', handleDocumentClick)
    }, [openMenuPlanId])

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

    const handleCopyLink = (planId) => {
        const url = `${window.location.origin}/pay/plan/${userDetails?.username}/${planId}`;
        navigator.clipboard.writeText(url);
        toast.success(t("Payment link copied"));
        setOpenMenuPlanId(null);
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
            receivingWallet: updatedPlan.receivingWallet || updatedPlan.currency,
            billingCycle: updatedPlan.billingCycle,
            termsAndConditions: updatedPlan.tAndC,
            showOnPaymentAddress: updatedPlan.showOnPaymentAddress
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
            billingCycle: payload.billingCycle,
            showOnPaymentAddress: payload.showOnPaymentAddress
        }
        await addMutate(addPayload)
    }
    const can = usePermission()
    const canAddPaymentPlan = can("payment-address.plan.add")

    const canUpdatePaymentPlan = can("payment-address.plan.update")

    const canDeletePaymentPlan = can("payment-address.plan.delete")

    const canSubscribePaymentPlan = can("payment-address.plan.subscribe")

    const filteredPlans = plans?.filter(p => {
        if (!isInvoicePage && p.showOnPaymentAddress === false) return false;
        return true;
    })

    const handleRemoveSync = async () => {
        if (!planToRemoveSync) return;
        const payload = {
            showOnPaymentAddress: false
        }
        await editMutate({ planId: planToRemoveSync._id, payload })
        setShowRemoveSyncModal(false)
        setPlanToRemoveSync(null)
    }

    if (!isInvoicePage && filteredPlans?.length < 0) {
        return null
    }

    return (
        <div className={styles.container}>
            <div className={styles.top}>
                <div>
                    <h1 style={isInvoicePage ? { fontSize: '20px', fontWeight: 600 } : {}}>{isInvoicePage ? t("My recent Plans:") : t("Plans & Pricing")}</h1>
                    {canAddPaymentPlan && plans?.length > 0 && isInvoicePage &&
                        <button
                            onClick={() => setShowAddModal(true)}
                            style={{ background: '#5926F0', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 16px', fontWeight: 600, cursor: 'pointer', fontSize: 14, width: "auto" }}
                        >
                            {t('Add new')}
                        </button>
                    }
                </div>
                {!isInvoicePage && <p>{t("The plans shown here are currently synced to your public payment address.")}</p>}
                {isInvoicePage && <p>{t("Create subscription plans or pricing packages to display on your public Payment Address.")}</p>}
            </div>
            <div className={styles.searchCont}>
                <div className={styles.search}>
                    <Search />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder={t('Search for Invoice')}
                    />
                </div>
            </div>
            {isLoading && <div style={{ padding: 20 }}>{t('Loading plans...')}</div>}

            {(!isLoading && filteredPlans?.length === 0) && isInvoicePage &&
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

            {filteredPlans?.length > 0 && (
                <div
                    className={styles.desktopViewOnly}
                    style={{
                        overflowX: 'auto', width: '100%', minHeight: '500px', position: 'relative', zIndex: openMenuPlanId ? 0 : 20,
                    }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 680 }}>
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
                            {filteredPlans.map(plan => (
                                <tr key={plan.id || plan._id} style={{ fontSize: 14, fontWeight: 600, position: 'relative' }}>
                                    <td style={{ padding: '12px 8px', fontWeight: 500 }}>{plan.title}</td>
                                    <td style={{ padding: '12px 8px', }}>{plan.description}</td>
                                    <td style={{ padding: '12px 8px', whiteSpace: 'nowrap' }}>{plan.currency || plan?.receivingWallet?.currency?.code} {Number(plan.price).toFixed(2)}</td>
                                    <td style={{ padding: '12px 8px' }}>{t(plan.billingCycle)}</td>
                                    <td style={{ padding: '12px 8px', textAlign: 'center', position: 'relative' }}>
                                        <span
                                            ref={el => menuRefs.current[plan.id || plan._id] = el}
                                            style={{ display: 'inline-block', cursor: 'pointer', borderRadius: 6, padding: 5, transition: 'background .15s', background: openMenuPlanId === (plan._id) ? '#eceaff' : 'transparent' }}
                                            onClick={() => setOpenMenuPlanId(openMenuPlanId === (plan.id || plan._id) ? null : (plan.id || plan._id))}
                                        >
                                            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                                                <circle cx="11" cy="5" r="1.5" fill="#888" />
                                                <circle cx="11" cy="11" r="1.5" fill="#888" />
                                                <circle cx="11" cy="17" r="1.5" fill="#888" />
                                            </svg>
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {openMenuPlanId && menuRefs.current[openMenuPlanId] && (() => {
                const anchor = menuRefs.current[openMenuPlanId];
                const rect = anchor.getBoundingClientRect();
                const menuWidth = 170;
                const top = rect.bottom + window.scrollY + 6;
                const left = Math.max(8, rect.right + window.scrollX - menuWidth + 8);
                const plan = filteredPlans.find(p => (p.id || p._id) === openMenuPlanId);
                if (!plan) return null;

                return createPortal(
                    <div data-portal-menu-id={openMenuPlanId} style={{ position: 'absolute', top, left, background: '#fff', boxShadow: '0 8px 24px rgba(2,6,23,0.12)', borderRadius: 10, zIndex: 2147483647, minWidth: menuWidth, padding: '3px 0', transition: 'opacity .12s' }}>
                        {isInvoicePage && canUpdatePaymentPlan && (
                            <div style={{ padding: '8px 18px', cursor: 'pointer', color: '#5926F0', fontWeight: 600, fontSize: 14 }} onClick={() => { handleEdit(plan); setOpenMenuPlanId(null); }}>
                                {t('Edit')}
                            </div>
                        )}
                        {isInvoicePage && canSubscribePaymentPlan && (
                            <div style={{ padding: '8px 18px', cursor: 'pointer', color: '#5926F0', fontWeight: 600, fontSize: 14 }} onClick={async () => { await handleViewSubscription(plan?._id); setOpenMenuPlanId(null); }}>
                                {isGettingSubscribers ? t('Loading...') : t('Subscribers')}
                            </div>
                        )}
                        <div style={{ padding: '8px 18px', cursor: 'pointer', color: '#5926F0', fontWeight: 600, fontSize: 14 }} onClick={() => { handleCopyLink(plan.planId || plan._id); setOpenMenuPlanId(null); }}>
                            {t('Copy Link')}
                        </div>
                        {!isInvoicePage && (
                            <div style={{ padding: '8px 18px', cursor: 'pointer', color: '#e11d48', fontWeight: 600, fontSize: 14 }} onClick={() => { setPlanToRemoveSync(plan); setShowRemoveSyncModal(true); setOpenMenuPlanId(null); }}>
                                {t('Remove sync')}
                            </div>
                        )}
                        {isInvoicePage && canDeletePaymentPlan && (
                            <div style={{ padding: '8px 18px', cursor: 'pointer', color: '#e11d48', fontWeight: 600, fontSize: 14 }} onClick={async () => { await handleDelete(plan._id); setOpenMenuPlanId(null); }}>
                                {isDeleting ? t('Deleting...') : t('Delete')}
                            </div>
                        )}
                    </div>,
                    document.body
                );
            })()}

            {filteredPlans?.length > 0 && window.innerWidth < 700 && (
                <div className={styles.mobileItems}>
                    {filteredPlans.map((plan, idx) => (
                        <div key={idx} className={styles.mobileItem}>
                            <div className={styles.left}>
                                <h3>{plan.title}</h3>
                                <p>{plan.description}</p>
                            </div>

                            <div className={styles.right}>
                                <div className={styles.topContent}>
                                    <h5>{formatCurrency(plan.price, true)}</h5>
                                    <span>/{plan.billingCycle}</span>
                                </div>

                                <div>
                                    {isInvoicePage ? (
                                        <>
                                            <span style={{ fontWeight: 600, color: "red", fontSize: "11px", cursor: "pointer" }} onClick={() => handleDelete(plan.id || plan._id)}>
                                                {t("Delete")}
                                            </span>
                                            <span style={{ fontWeight: 600, color: "#6039CD", fontSize: "11px", marginLeft: "5px", cursor: 'pointer' }} onClick={() => handleEdit(plan)}>
                                                {t("Edit")}
                                            </span>
                                            <span style={{ fontWeight: 600, color: "#5926F0", fontSize: "11px", marginLeft: "5px", cursor: 'pointer' }} onClick={() => handleViewSubscription(plan.id || plan._id)}>
                                                {t("Subscribers")}
                                            </span>
                                        </>
                                    ) : (
                                        <span style={{ fontWeight: 600, color: "red", fontSize: "11px", cursor: "pointer" }} onClick={() => { setPlanToRemoveSync(plan); setShowRemoveSyncModal(true); }}>
                                            {t("Remove sync")}
                                        </span>
                                    )}
                                    <span style={{ fontWeight: 600, color: "#10b981", fontSize: "11px", marginLeft: "5px", cursor: 'pointer' }} onClick={() => handleCopyLink(plan.planId || plan._id)}>
                                        {t("Copy Link")}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <Modal isOpen={showRemoveSyncModal} toggle={() => setShowRemoveSyncModal(false)}>
                <ModalHeader toggle={() => setShowRemoveSyncModal(false)}>{t("Remove from Payment Address")}</ModalHeader>
                <ModalBody>
                    <p>{t("Are you sure you want to remove this plan from your public Payment Address?")}</p>
                    <ul>
                        <li>{t("The plan will still exist in your Plans dashboard.")}</li>
                        <li>{t("It will no longer be visible to clients visiting your public page.")}</li>
                        <li>{t("You can re-sync it anytime from the Plans tab in Invoices.")}</li>
                    </ul>
                </ModalBody>
                <ModalFooter>
                    <button style={{ background: 'none', border: 'none', fontWeight: 600 }} onClick={() => setShowRemoveSyncModal(false)}>{t("Cancel")}</button>
                    <ButtonForRequests color="danger" onClick={handleRemoveSync} isLoading={isEditing}>
                        {t("Remove Sync")}
                    </ButtonForRequests>
                </ModalFooter>
            </Modal>

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
