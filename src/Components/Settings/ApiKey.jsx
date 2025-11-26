import { useContext, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, Card, CardBody, CardHeader, Col, Input, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap'
import { toast } from 'react-toastify'
import { UserContext } from '../../Context/UserContext'
import { useCreateUserKey, useGetApiKey, useRegenerateUserKey, useDeleteUserKey, useUpdateWebhookUrl, useUpdateUserKeyStatus, useUpdateFeatures } from '../../hooks/GeneralUse/useApiKey'
import InstaPayLoader from '../Loader'
import styles from './styles/apiKey.module.css'
import { Toggle } from "../MyMasterCard/CardPurchased"

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

    const isBusy = useMemo(() => {
        return isLoading || isFetching || createMutation.isPending || regenerateMutation.isPending || updateWebhookMutation.isPending || deleteKeyMutation.isPending || updateStatusMutation.isPending
    }, [isLoading, isFetching, createMutation.isPending, regenerateMutation.isPending, updateWebhookMutation.isPending, deleteKeyMutation.isPending, updateStatusMutation.isPending])

    const handleCreate = () => {
        if (!accountId) return
        createMutation.mutate({ webhook_url: webhookUrl || " ", account: accountId, features }, {
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
            {userDetails?.company?.kyb_status !== "approved" ? <p style={{fontWeight: 600, textAlign: "center", padding: "18px", fontSize: "15px"}}>{t("Only verified accounts are allowed to have api key. Please verify your account from the 'Business Verification' Tab then you can access feature.")}</p> : isLoading ?
                <div className={styles.centerLoader}>
                    <InstaPayLoader />
                </div> :
                <CardBody>
                    {(!data) && (
                        <Col md="12" className={styles.centerCol}>
                            <p style={{ fontWeight: 600, marginBottom: "0px", fontSize: "15px" }}>{t("Create your API Key")}</p>
                            <Button onClick={() => setShowCreateModal(true)} disabled={isBusy} className={styles.btnRound}>
                                {t("Create API Key")}
                            </Button>
                        </Col>
                    )}

                    {
                        data
                        &&
                        <>
                            <Col md="12" className={styles.sectionRow}>
                                <h5 className={styles.sectionTitle}>API Key</h5>
                                <div className={styles.columnFlex}>
                                    <div className={styles.inlineControls}>
                                        <Input type={showKey ? 'text' : 'password'} placeholder={isBusy ? "Loading..." : 'API key will be rendered'} readOnly disabled value={apiKey || ''} />
                                        <Button color='secondary' outline className={styles.btnRound} onClick={() => setShowKey(prev => !prev)} disabled={!apiKey || featureStatus !== "enabled"}>
                                            {showKey ? t("Hide") : t("Reveal")}
                                        </Button>
                                        <Button color='info' className={styles.btnRound} onClick={handleCopy} disabled={!apiKey || featureStatus !== "enabled"}>
                                            {t("Copy")}
                                        </Button>
                                    </div>
                                </div>
                            </Col>

                            <Col md="12" className={styles.sectionRow}>
                                <h5 className={styles.sectionTitle}>Webhook URL</h5>
                                <div className={styles.columnFlex}>
                                    <div className={styles.inlineControls}>
                                        <input className="form-control" value={webhookUrl} onChange={e => setWebHookUrl(e.target.value)} type="text" placeholder="https://example.com/webhook" />
                                        <Button color='secondary' outline className={styles.btnRound} onClick={handleUpdateWebhook} disabled={featureStatus !== "enabled" || updateWebhookMutation.isPending}>
                                            {updateWebhookMutation.isPending ? t("Saving...") : t("Update URL")}
                                        </Button>
                                    </div>
                                </div>
                            </Col>

                            <Col md="12" className={styles.sectionRow}>
                                <h5 className={styles.sectionTitle}>{t("Api Key Status")}</h5>

                                <div className={styles.inlineControls} style={{ flex: 1, maxWidth: '100%' }}>

                                    <Input type="select" value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
                                        <option value="enabled">{t("enabled")}</option>
                                        <option value="disabled">{t("disabled")}</option>
                                    </Input>
                                    <Button color='secondary' outline className={styles.btnRound} style={{ flexShrink: 0 }} onClick={() => handleSetStatus(selectedStatus)} disabled={isBusy}>
                                        {t("Update Status")}
                                    </Button>
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
                                                        {feature.label}
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
                                    <Button
                                        color='primary'
                                        className={styles.btnRound}
                                        onClick={handleUpdateFeatures}
                                        disabled={updateFeatures.isPending || featureStatus !== "enabled"}
                                        style={{ alignSelf: 'flex-end', marginTop: '0.5rem' }}
                                    >
                                        {updateFeatures.isPending ? t("Saving...") : t("Save Features")}
                                    </Button>
                                </div>
                            </Col>

                            <div className={styles.endActions}>
                                <Button className={styles.btnRound + " " + styles.btnDeleteOutline} onClick={handleDelete} disabled={deleteKeyMutation.isPending}>
                                    {deleteKeyMutation.isPending ? t("Deleting...") : t("Delete API Key")}
                                </Button>
                                <Button color='primary' className={styles.btnRound} onClick={handleRegenerate} disabled={isBusy || featureStatus !== "enabled"}>
                                    {regenerateMutation.isPending ? "Regenerating..." : (apiKey ? "Regenerate API Key" : "Generate API Key")}
                                </Button>
                            </div>
                        </>
                    }
                </CardBody>
            }
            {/* Create API Key Modal */}
            <Modal isOpen={showCreateModal} toggle={() => setShowCreateModal(false)}>
                <ModalHeader toggle={() => setShowCreateModal(false)}>
                    {t("Create API Key")}
                </ModalHeader>
                <ModalBody>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ fontWeight: 600, marginBottom: '0.5rem', display: 'block' }}>{t("Webhook URL (Optional)")}</label>
                        <Input
                            type="text"
                            placeholder="https://example.com/webhook"
                            value={webhookUrl}
                            onChange={e => setWebHookUrl(e.target.value)}
                        />
                    </div>
                    <div>
                        <label style={{ fontWeight: 600, marginBottom: '0.75rem', display: 'block' }}>{t("Select Features")}</label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {FEATURE_LIST.map(feature => (
                                <div key={feature.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <span>{feature.label}</span>
                                    <Toggle
                                        isActive={features[feature.id]}
                                        onChange={() => handleFeatureToggle(feature.id)}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </ModalBody>
                <ModalFooter>
                    <Button className={styles.btnRound} onClick={() => setShowCreateModal(false)} disabled={createMutation.isPending}>
                        {t("Cancel")}
                    </Button>
                    <Button color='primary' className={styles.btnRound} onClick={handleCreate} disabled={createMutation.isPending || Object.values(features).every(f => f === false)}>
                        {createMutation.isPending ? t("Creating...") : t("Create")}
                    </Button>
                </ModalFooter>
            </Modal>
        </Card>
    )
}

export default ApiKey