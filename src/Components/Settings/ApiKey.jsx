import { useContext, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, Card, CardBody, CardHeader, Col, FormGroup, Input, Label, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap'
import { toast } from 'react-toastify'
import { UserContext } from '../../Context/UserContext'
import { useCreateUserKey, useGetApiKey, useRegenerateUserKey, useDeleteUserKey, useUpdateWebhookUrl, useUpdateUserKeyStatus } from '../../hooks/GeneralUse/useApiKey'
import InstaPayLoader from '../Loader'
import styles from './styles/apiKey.module.css'

const ApiKey = () => {
    const { t } = useTranslation()
    const { userDetails, authHeader } = useContext(UserContext)
    const [webhookUrl, setWebHookUrl] = useState("")
    const [showKey, setShowKey] = useState(false)
    const [selectedStatus, setSelectedStatus] = useState("enabled")

    const accountId = userDetails?._id
    const { data, isLoading, isFetching } = useGetApiKey({ accountId, headers: authHeader, enabled: !!accountId })
    const createMutation = useCreateUserKey({ headers: authHeader, accountId })
    const regenerateMutation = useRegenerateUserKey({ headers: authHeader, accountId })
    const updateWebhookMutation = useUpdateWebhookUrl({ headers: authHeader, accountId })
    const deleteKeyMutation = useDeleteUserKey({ headers: authHeader, accountId })
    const updateStatusMutation = useUpdateUserKeyStatus({ headers: authHeader, accountId })

    const apiKey = data?.userKey?.api_key ?? ""
    const featureStatus = data?.userKey?.status ?? ""

    const isBusy = useMemo(() => {
        return isLoading || isFetching || createMutation.isPending || regenerateMutation.isPending || updateWebhookMutation.isPending || deleteKeyMutation.isPending || updateStatusMutation.isPending
    }, [isLoading, isFetching, createMutation.isPending, regenerateMutation.isPending, updateWebhookMutation.isPending, deleteKeyMutation.isPending, updateStatusMutation.isPending])

    const handleCreate = () => {
        if (!accountId) return
        createMutation.mutate({ webhook_url: webhookUrl, account: accountId })
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
            {isLoading ?
                <div className={styles.centerLoader}>
                    <InstaPayLoader />
                </div> :
                <CardBody>
                    {(!data) && (
                        <Col md="12" className={styles.centerCol}>
                            <p style={{ fontWeight: 600, marginBottom: "0px", fontSize: "15px" }}>{t("Create your API Key")}</p>
                            <FormGroup className="mb-2" style={{ width: "100%", maxWidth: 560 }}>
                                <Label className="form-label">{t("Webhook URL")}</Label>
                                <input className="form-control" value={webhookUrl} onChange={e => setWebHookUrl(e.target.value)} type="text" placeholder="https://example.com/webhook" />
                            </FormGroup>
                            <Button onClick={handleCreate} disabled={isBusy || !webhookUrl} className={styles.btnRound}>
                                {createMutation.isPending ? t("Creating...") : t("Create API Key")}
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
                                <h5 className={styles.sectionTitle}>Api Key Status</h5>
                                
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
            {/* Delete Confirmation Modal */}
            <Modal isOpen={false} toggle={() => {}}>
                <ModalHeader>{t("Delete API Key")}</ModalHeader>
                <ModalBody>
                    {t("Are you sure you want to delete your API Key? This action cannot be undone.")}
                </ModalBody>
                <ModalFooter>
                    <Button className={styles.btnRound} onClick={() => {}}>{t("Cancel")}</Button>
                    <Button className={styles.btnRound + " " + styles.btnDeleteOutline} onClick={() => {}}>{t("Delete")}</Button>
                </ModalFooter>
            </Modal>
        </Card>
    )
}

export default ApiKey