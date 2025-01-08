import React, { useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, Card, CardBody, CardHeader, Col, FormGroup, Input, Label } from 'reactstrap'
import axios from 'axios'
import { UserContext } from '../../Context/UserContext'
import { decryptData } from '../../Helper/EssentilaMethods/Decryption'
import { encryptData } from '../../Helper/EssentilaMethods/Encryption'

const ApiKey = () => {
    const { t } = useTranslation()
    const { userDetails, authHeader } = useContext(UserContext)
    const [apiKey, setApiKey] = useState("")
    const [webhookUrl, setWebHookUrl] = useState("")
    const [isGenerating, setIsGenerating] = useState(false)
    const [isGetting, setIsGetting] = useState(false)
    const [featureStatus, setFeatureStatus] = useState("")

    const GENERATE_API_KEY = () => {
        setIsGenerating(true)
        setIsGetting(true)
        const data = {
            webhook_url: "https://www.transactions-third-party-platform-NEW.com",
            account: userDetails?._id
        }

        // // console.log(data)
        const encrypted = encryptData(data)

        axios.post(`${process.env.REACT_APP_IP_DEV_API}/api/userkey/create-user-key`, {
            data: encrypted
        }, {
            headers: authHeader
        })
            .then(res => {
                const decrypted = decryptData(res.data.data)
                setApiKey(decrypted?.userKey?.api_key)
                setWebHookUrl(decrypted?.userKey?.webhook_url)
                setIsGenerating(false)
                setIsGetting(false)
            })
            .catch(err => {
                const decrypted = decryptData(err.response.data.data)
                // console.log(decrypted)
                setIsGenerating(false)
                setIsGetting(false)
            })

    }

    useEffect(() => {
        if (userDetails?._id) {
            const checkUserKey = () => {
                axios.get(`${process.env.REACT_APP_IP_DEV_API}/api/userkey/account-user-key/${userDetails?._id}`, {
                    headers: authHeader
                })
                    .then(res => {
                        const decrypted = decryptData(res.data.data)
                        setFeatureStatus(decrypted?.userkey?.status)
                        // console.log(decrypted)
                    })
                    .catch(err => {
                        const decrypted = decryptData(err?.response?.data.data)
                        // console.log(decrypted)
                        if (decrypted?.message?.toLowerCase() === "no userkey found!") {
                            setFeatureStatus("not requested")
                        }
                    })
            }
            checkUserKey()
        }
    }, [userDetails])

    useEffect(() => {
        if (featureStatus === "enabled") {
            const fetchApiKey = async () => {
                try {
                    setIsGetting(true);

                    const response = await axios.get(`${process.env.REACT_APP_IP_DEV_API}/api/userkey/get-apikey/${userDetails?._id}`, {
                        headers: authHeader
                    });

                    const decrypted = decryptData(response.data.data);
                    setApiKey(decrypted?.userKey?.api_key);
                    setWebHookUrl(decrypted?.userKey?.webhook_url);
                } catch (error) {
                    const decrypted = decryptData(error.response?.data?.data || {});
                    console.error(decrypted);
                } finally {
                    setIsGetting(false);
                }
            }
            fetchApiKey();
        };
    }, [featureStatus]);

    const requestFeature = async () => {
        setIsGetting(true)

        try {
            axios.get(`${process.env.REACT_APP_IP_DEV_API}/api/userkey/request-user-key/${userDetails?._id}`, {
                headers: authHeader
            })
                .then(res => {
                    const decrypted = decryptData(res.data.data)
                    // console.log(decrypted)
                    setIsGetting(false)
                    setFeatureStatus("requested")
                })
                .catch(err => {
                    const decrypted = decryptData(err?.response?.data.data)
                    // console.log(decrypted)
                    setIsGetting(false)
                })
        } catch (error) {
            // console.log(error)
        }
    }

    return (
        <Card>
            <CardHeader>
                <h4>{t("API Key")}</h4>
            </CardHeader>
            <CardBody>
                {
                    featureStatus === "not requested"
                    &&
                    <Col md="12" style={{ display: "flex", alignItems: "center", gap: "1rem", flexDirection: "column" }}>
                        <p>Request for an API Key.</p>
                        <Button onClick={requestFeature} color='primary' style={{ borderRadius: "5px" }} disabled={isGetting}>{isGetting ? "Requesting" : "Request Now"}</Button>
                    </Col>
                }
                {
                    featureStatus === "requested"
                    &&
                    <Col md="12" style={{ display: "flex", alignItems: "center", gap: "1rem", flexDirection: "column" }}>
                        <p style={{ maxWidth: "75%", textAlign: "center" }}>Admin has received the request, the feature will be enabled once they accept the request. Please comeback later.</p>
                    </Col>
                }
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
                            <div style={{ display: "flex", flexDirection: "column", gap: ".65rem", flex: 1 }}>
                                <Input type='text' placeholder={isGetting ? "Getting API Key..." : 'API key will be rendered'} readOnly disabled value={isGetting ? "Generating New API Key" : apiKey} />
                                <Button color='primary' style={{ borderRadius: "5px" }} onClick={GENERATE_API_KEY} disabled={isGenerating}>
                                    {
                                        apiKey
                                            ?
                                            `${isGenerating ? "Regenerating" : "Regenerate"} API Key`
                                            :
                                            `${isGenerating ? "Generating" : "Generate"} API Key`
                                    }
                                </Button>
                            </div>
                            <p style={{ marginBottom: "0", color: "#afafaf", fontSize: ".65rem", flex: 1 }}>To harness the full potential of InstaPay's seamless transactions, follow these quick steps to generate your API key. First, sign up for an account at [your registration URL] and access the Developer Dashboard. Navigate to the "API Keys" section, generate a new key, and ensure its secure storage.</p>
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
                            <p style={{ marginBottom: "0", color: "#afafaf", fontSize: ".65rem", flex: 1 }}>To harness the full potential of InstaPay's seamless transactions, follow these quick steps to generate your API key. First, sign up for an account at [your registration URL] and access the Developer Dashboard. Navigate to the "API Keys" section, generate a new key, and ensure its secure storage.</p>
                        </Col>
                        <Col md="12">
                            <FormGroup className="mb-3">
                                <Label className="form-label">{t("Webhook URL")}</Label>
                                <input className="form-control" value={webhookUrl} onChange={e => setWebHookUrl(e.target.value)} type="text" placeholder="Webhook URL" />
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