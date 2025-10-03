import { useContext, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, Card, CardBody, CardHeader, Col, FormGroup, Input, Label } from 'reactstrap'
import { toast } from 'react-toastify'
import { UserContext } from '../../Context/UserContext'
import { useCreateUserKey, useGetApiKey, useRegenerateUserKey } from '../../hooks/GeneralUse/useApiKey'

const ApiKey = () => {
    const { t } = useTranslation()
    const { userDetails, authHeader } = useContext(UserContext)
    const [webhookUrl, setWebHookUrl] = useState("")
    const [showKey, setShowKey] = useState(false)

    const accountId = userDetails?._id
    const { data, isLoading, isFetching } = useGetApiKey({ accountId, headers: authHeader, enabled: !!accountId })
    const createMutation = useCreateUserKey({ headers: authHeader })
    const regenerateMutation = useRegenerateUserKey({ headers: authHeader, accountId })

    const apiKey = data?.userKey?.api_key ?? ""
    const featureStatus = data?.userKey?.status ?? ""

    const isBusy = useMemo(() => {
        return isLoading || isFetching || createMutation.isPending || regenerateMutation.isPending
    }, [isLoading, isFetching, createMutation.isPending, regenerateMutation.isPending])

    const handleCreate = () => {
        if (!accountId) return
        createMutation.mutate({ webhook_url: webhookUrl, account: accountId })
    }

    const handleRegenerate = () => {
        regenerateMutation.mutate()
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

    return (
        <Card>
            <CardHeader>
                <h4>{t("API Key")}</h4>
            </CardHeader>
            <CardBody>

                {(!featureStatus || featureStatus !== "enabled") && (
                    <Col md="12" style={{ display: "flex", alignItems: "center", gap: "1rem", flexDirection: "column" }}>
                        <p style={{ fontWeight: 600, marginBottom: "0px", fontSize: "15px" }}>{t("Create your API Key")}</p>
                        <FormGroup className="mb-2" style={{ width: "100%", maxWidth: 560 }}>
                            <Label className="form-label">{t("Webhook URL")}</Label>
                            <input className="form-control" value={webhookUrl} onChange={e => setWebHookUrl(e.target.value)} type="text" placeholder="https://example.com/webhook" />
                        </FormGroup>
                        <Button onClick={handleCreate} disabled={isBusy || !webhookUrl} style={{ borderRadius: "5px" }}>
                            {createMutation.isPending ? t("Creating...") : t("Create API Key")}
                        </Button>
                    </Col>
                )}


                {
                    featureStatus === "disabled"
                    &&
                    <Col md="12" style={{ display: "flex", alignItems: "center", gap: "1rem", flexDirection: "column" }}>
                        <p style={{ maxWidth: "75%", textAlign: "center" }}>You are prohibited by admin to use this feature.</p>
                    </Col>
                }
                {
                    featureStatus === "enabled"
                    &&
                    <>
                        <Col md="12" style={{
                            display: "flex",
                            gap: "1rem",
                            alignItems: window.innerWidth > 1000 ? "center" : "stretch",
                            marginBottom: "1.5rem",
                            flexDirection: window.innerWidth > 1000 ? "row" : "column",
                        }}>
                            <h5 style={{ marginBottom: 0, whiteSpace: "nowrap", minWidth: "110px" }}>Get API Key</h5>
                            <div style={{ display: "flex", flexDirection: "column", gap: ".65rem", flex: 1, maxWidth: 720 }}>
                                <div style={{ display: "flex", gap: ".5rem", alignItems: "center" }}>
                                    <Input type={showKey ? 'text' : 'password'} placeholder={isBusy ? "Loading..." : 'API key will be rendered'} readOnly disabled value={apiKey || ''} />
                                    <Button color='secondary' outline style={{ borderRadius: "5px", whiteSpace: "nowrap" }} onClick={() => setShowKey(prev => !prev)} disabled={!apiKey}>
                                        {showKey ? t("Hide") : t("Reveal")}
                                    </Button>
                                    <Button color='secondary' style={{ borderRadius: "5px", whiteSpace: "nowrap" }} onClick={handleCopy} disabled={!apiKey}>
                                        {t("Copy")}
                                    </Button>
                                </div>
                                <div style={{ display: "flex", gap: ".5rem", flexWrap: "wrap" }}>
                                    <Button color='primary' style={{ borderRadius: "5px" }} onClick={handleRegenerate} disabled={isBusy}>
                                        {regenerateMutation.isPending ? "Regenerating..." : (apiKey ? "Regenerate API Key" : "Generate API Key")}
                                    </Button>
                                </div>
                            </div>
                            <p style={{ marginBottom: "0", color: "#afafaf", fontSize: ".65rem", flex: 1 }}>To harness the full potential of InstaPay&apos;s seamless transactions, follow these quick steps to generate your API key. First, sign up for an account at [your registration URL] and access the Developer Dashboard. Navigate to the &quot;API Keys&quot; section, generate a new key, and ensure its secure storage.</p>
                        </Col>
                        <Col md="12" style={{
                            display: "flex",
                            gap: "1rem",
                            alignItems: window.innerWidth > 1000 ? "center" : "stretch",
                            marginBottom: "1.5rem",
                            flexDirection: window.innerWidth > 1000 ? "row" : "column",
                        }}>
                            <h5 style={{ marginBottom: 0, whiteSpace: "nowrap", minWidth: "110px" }}>Delete API Key</h5>
                            <div style={{ display: "flex", flexDirection: "column", gap: ".65rem", flex: 1 }}>
                                <Button color='danger' style={{ borderRadius: "5px" }}>Delete API Key</Button>
                            </div>
                            <p style={{ marginBottom: "0", color: "#afafaf", fontSize: ".65rem", flex: 1 }}>To harness the full potential of InstaPay&apos;s seamless transactions, follow these quick steps to generate your API key. First, sign up for an account at [your registration URL] and access the Developer Dashboard. Navigate to the &quot;API Keys&quot; section, generate a new key, and ensure its secure storage.</p>
                        </Col>
                        <Col md="12">
                            <FormGroup className="mb-3">
                                <Label className="form-label">{t("Webhook URL")}</Label>
                                <input disabled readOnly className="form-control" value={webhookUrl} onChange={e => setWebHookUrl(e.target.value)} type="text" placeholder="https://example.com/webhook" />
                            </FormGroup>
                        </Col>
                    </>
                }
            </CardBody>
            {
                featureStatus === "accepted"
                &&
                <div style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    alignItems: "flex-end",
                    gap: "1rem",
                    flexWrap: "wrap",
                    padding: "1.5rem"
                }}>
                    <Button style={{
                        background: "linear-gradient(to right bottom, #e64067, #5926f0, #4828a0)",
                        border: "none",
                        outline: "none",
                        borderRadius: "10px"
                    }}>
                        {t("Save")}
                    </Button>
                </div>
            }
        </Card>
    )
}

export default ApiKey