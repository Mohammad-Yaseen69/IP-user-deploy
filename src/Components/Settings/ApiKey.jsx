import { useContext, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, Card, CardBody, CardHeader, Col, Input, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap'
import { toast } from 'react-toastify'
import { UserContext } from '../../Context/UserContext'
import { useCreateUserKey, useGetApiKey, useRegenerateUserKey, useDeleteUserKey, useUpdateWebhookUrl, useUpdateUserKeyStatus, useUpdateFeatures } from '../../hooks/GeneralUse/useApiKey'
import InstaPayLoader from '../Loader'
import styles from './styles/apiKey.module.css'
import { Toggle } from "../MyMasterCard/CardPurchased"
import apiKeyImg from "./apiKeyCreate.png"
import { usePermission } from '../../hooks/GeneralUse/usePermission'

const FEATURE_LIST = [
    { id: 'international', label: 'International Transfers' },
    { id: 'local', label: 'Local Transfers' },
    { id: 'external_payment', label: 'External Payments' }
]

const ApiKey = () => {
    const { t } = useTranslation()
    const { userDetails, authHeader } = useContext(UserContext)
    const [webhookUrl, setWebHookUrl] = useState("")
    const [showKey, setShowKey] = useState(false)
    const [selectedStatus, setSelectedStatus] = useState("enabled")
    const [features, setFeatures] = useState({
        international: false,
        local: false,
        external_payment: false
    })
    const [adminFeatures, setAdminFeatures] = useState({
        international: false,
        local: false,
        external_payment: false
    })
    const [showCreateModal, setShowCreateModal] = useState(false)


    const accountId = userDetails?._id
    const { data, isLoading, isFetching } = useGetApiKey({ accountId, headers: authHeader, enabled: !!accountId })
    const createMutation = useCreateUserKey({ headers: authHeader, accountId })
    const regenerateMutation = useRegenerateUserKey({ headers: authHeader, accountId })
    const updateWebhookMutation = useUpdateWebhookUrl({ headers: authHeader, accountId })
    const deleteKeyMutation = useDeleteUserKey({ headers: authHeader, accountId })
    const updateStatusMutation = useUpdateUserKeyStatus({ headers: authHeader, accountId })
    const updateFeatures = useUpdateFeatures({ headers: authHeader, accountId })
    const apiKey = data?.userKey?.api_key ?? ""
    const featureStatus = data?.userKey?.status ?? ""
    const can = usePermission()
    const isEdit = can("settings.api-key.update")
    const isBusy = useMemo(() => {
        return isLoading || isFetching || createMutation.isPending || regenerateMutation.isPending || updateWebhookMutation.isPending || deleteKeyMutation.isPending || updateStatusMutation.isPending
    }, [isLoading, isFetching, createMutation.isPending, regenerateMutation.isPending, updateWebhookMutation.isPending, deleteKeyMutation.isPending, updateStatusMutation.isPending])

    const handleCreate = () => {
        if (!accountId) return
        createMutation.mutate({ webhook_url: webhookUrl || " ", account: accountId, features: { ...features, external_payment: true } }, {
            onSuccess: () => {
                setShowCreateModal(false)
                toast.success(t("API Key created successfully"))
            }
        })
    }

    const handleFeatureToggle = (featureId) => {
        setFeatures(prev => ({
            ...prev,
            [featureId]: !prev[featureId]
        }))
    }

    const handleUpdateFeatureToggle = (featureId) => {
        setFeatures(prev => ({
            ...prev,
            [featureId]: !prev[featureId]
        }))
    }

    const handleRegenerate = () => {
        regenerateMutation.mutate()
    }
    const handleUpdateWebhook = () => {
        if (!webhookUrl || featureStatus !== "enabled") return
        updateWebhookMutation.mutate({ webhook_url: webhookUrl }, {
            onSuccess: () => toast.success(t("Webhook URL updated")),
            onError: () => toast.error(t("Failed to update webhook URL"))
        })
    }

    const handleUpdateFeatures = () => {
        updateFeatures.mutate({ features }, {
            onSuccess: () => toast.success(t("Features updated!")),
            onError: () => toast.error(t("Failed to Features"))
        })
    }

    const handleDelete = () => {
        deleteKeyMutation.mutate(undefined, {
            onSuccess: () => {
                toast.success(t("API Key deleted"))
                setWebHookUrl("")
                setShowKey(false)
            },
            onError: () => toast.error(t("Failed to delete API Key"))
        })
    }

    const handleSetStatus = (status) => {
        if (!accountId) return
        updateStatusMutation.mutate({ status, account: accountId }, {
            onSuccess: () => toast.success(t("Status updated")),
            onError: () => toast.error(t("Failed to update status"))
        })
    }

    const handleCopy = async () => {
        try {
            if (!apiKey) return
            await navigator.clipboard.writeText(apiKey)
            toast.success(t("API Key copied to clipboard"))
        } catch {
            toast.error(t("Failed to copy"))
        }
    }


    useEffect(() => {
        if (data) {
            setFeatures(data?.userKey?.features?.user_selected)
            setAdminFeatures(data?.userKey?.features?.admin_enabled || data?.userKey?.features?.user_selected)
            setWebHookUrl(data.userKey?.webhook_url)
        }
    }, [data])

    useEffect(() => {
        if (data?.userKey?.status) {
            setSelectedStatus(data.userKey.status)
        }
    }, [data?.userKey?.status])

    return (
        <Card>
            <CardHeader>
                <h4>{t("API Key")}</h4>
            </CardHeader>
            {userDetails?.company?.kyb_status !== "approved" ? <p style={{ fontWeight: 600, textAlign: "center", padding: "18px", fontSize: "15px" }}>{t("Only verified accounts are allowed to have api key. Please verify your account from the 'Business Verification' Tab then you can access feature.")}</p> : isLoading ?
                <div className={styles.centerLoader}>
                    <InstaPayLoader />
                </div> :
                <CardBody>
                    {(!data) && (
                        <div className={styles.centerCol}>
                            <div className={styles.left}>
                                <div>
                                    <h3>
                                        {t("You haven't created an API key yet.")}
                                    </h3>

                                    <span>
                                        {t("Generate one to start using our APIs and receive webhooks.")}
                                    </span>
                                </div>

                                <button onClick={handleCreate} style={{ opacity: createMutation.isPending && 0.6 }} disabled={createMutation.isPending}>
                                    {createMutation.isPending ? t("Creating...") : t("Create Api Key")}
                                </button>
                            </div>


                            <div className={styles.right}>
                                <img src={apiKeyImg} alt="" />
                            </div>
                        </div>
                    )}

                    {
                        data
                        &&
                        <>
                            <Col md="12" className={styles.sectionRow}>
                                <h5 className={styles.sectionTitle}>{t("API Key")}</h5>
                                <div className={styles.columnFlex}>
                                    <div className={styles.inlineControls}>
                                        <Input style={{ background: "#F9F9F9", border: "none", boxShadow: "0px 0px 2px rgba(0, 0, 0, 0.13)" }} type={showKey ? 'text' : 'password'} placeholder={isBusy ? "Loading..." : t('API key will be rendered')} readOnly disabled value={apiKey || ''} />
                                        <div style={{ display: "grid", gap: "10px", width: "100%", gridTemplateColumns: "1fr 1fr" }}>
                                            <button className={styles.btn} onClick={() => setShowKey(prev => !prev)} disabled={!apiKey || featureStatus !== "enabled"}>
                                                {showKey ? t("Hide") : t("Reveal")}
                                            </button>
                                            <button className={styles.btn} onClick={handleCopy} disabled={!apiKey || featureStatus !== "enabled"}>
                                                {t("Copy")}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </Col>

                            <Col md="12" className={styles.sectionRow}>
                                <h5 className={styles.sectionTitle}>{t("Webhook URL")}</h5>
                                <div className={styles.columnFlex}>
                                    <div className={styles.inlineControls}>
                                        <input style={{ background: "#F9F9F9", border: "none", boxShadow: "0px 0px 2px rgba(0, 0, 0, 0.13)" }} className="form-control" value={webhookUrl} onChange={e => setWebHookUrl(e.target.value)} type="text" placeholder="https://example.com/webhook" />
                                        <button className={styles.btn} onClick={handleUpdateWebhook} disabled={featureStatus !== "enabled" || updateWebhookMutation.isPending}>
                                            {updateWebhookMutation.isPending ? t("Saving...") : t("Update URL")}
                                        </button >
                                    </div>
                                </div>
                            </Col>

                            <Col md="12" className={styles.sectionRow}>
                                <h5 className={styles.sectionTitle}>{t("Api Key Status")}</h5>

                                <div className={styles.inlineControls} style={{ flex: 1, maxWidth: '100%' }}>
                                    <div style={{ width: "100%" }} className={styles.featureRow}>
                                        <div className={styles.featureContent}>
                                            <span className={styles.featureLabel}>
                                                {t("Status")}
                                            </span>
                                        </div>
                                        <Toggle
                                            checked={selectedStatus === "enabled" ? true : false}
                                            onChange={() => {
                                                setSelectedStatus(prev => prev === "enabled" ? "disabled" : "enabled")
                                            }}
                                        />
                                    </div>

                                    <button className={styles.btn} style={{ flexShrink: 0 }} onClick={() => handleSetStatus(selectedStatus)} disabled={isBusy}>
                                        {t("Update Status")}
                                    </button>
                                </div>
                            </Col>

                            <Col md="12" className={styles.sectionRow}>
                                <h5 className={styles.sectionTitle}>{t("Features")}</h5>
                                <div className={styles.columnFlex} style={{ flex: 1 }}>
                                    {FEATURE_LIST.map(feature => {
                                        const isAdminEnabled = adminFeatures[feature.id]
                                        const isEnabled = features[feature.id]
                                        const isLocked = !isAdminEnabled

                                        return (
                                            <div key={feature.id} className={styles.featureRow}>
                                                <div className={styles.featureContent}>
                                                    <span className={styles.featureLabel}>
                                                        {t(feature.label)}
                                                        {!isAdminEnabled && <span className={styles.adminBadge}>{t("Admin Disabled")}</span>}
                                                    </span>
                                                </div>
                                                <Toggle
                                                    checked={isEnabled && isAdminEnabled}
                                                    onChange={() => !isLocked && handleUpdateFeatureToggle(feature.id)}
                                                    style={{ pointerEvents: isLocked ? 'none' : 'auto', opacity: isLocked ? 0.5 : 1 }}
                                                />
                                            </div>
                                        )
                                    })}
                                </div>
                            </Col>

                            <div style={{ marginTop: "2rem" }} className={styles.endActions}>
                                <button className={styles.btn} style={{ padding: "13px 26px" }} onClick={handleDelete} disabled={deleteKeyMutation.isPending}>
                                    {deleteKeyMutation.isPending ? t("Deleting...") : t("Delete Key")}
                                </button>
                                <button
                                    className={styles.btn} style={{ padding: "13px 26px" }}
                                    onClick={handleUpdateFeatures}
                                    disabled={updateFeatures.isPending || featureStatus !== "enabled"}
                                >
                                    {updateFeatures.isPending ? t("Saving...") : t("Save")}
                                </button>
                                <button className={`${styles.btn} ${styles.btnPrimary}`}
                                    style={{ padding: "13px 26px" }} onClick={handleRegenerate} disabled={isBusy || featureStatus !== "enabled" || !isEdit}>
                                    {regenerateMutation.isPending ? t("Regenerating...") : (apiKey ? (t("Regenerate API Key")) : t("Generate API Key"))}
                                </button>
                            </div>
                        </>
                    }
                </CardBody>
            }
        </Card>
    )
}

export default ApiKey