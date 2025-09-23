import React, { useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, Card, CardBody, CardHeader, Col, FormGroup, Input, Label } from 'reactstrap'
import { H4 } from '../../AbstractElements'
import { ChevronDown, ChevronUp } from 'react-feather'
import GradientButton from '../User/UserSettings/GradientButton'
import axios from 'axios'
import { UserContext } from '../../Context/UserContext'
import { decryptData } from '../../Helper/EssentilaMethods/Decryption'
import { encryptData } from '../../Helper/EssentilaMethods/Encryption'

const ApiKey = ({ isCollapsed, setIsCollapsed }) => {
    const { t } = useTranslation()
    const { userDetails, authHeader } = useContext(UserContext)
    const [apiKey, setApiKey] = useState("")
    const [isGenerating, setIsGenerating] = useState(false)
    const [isGetting, setIsGetting] = useState(false)
    const [featureStatus, setFeatureStatus] = useState("")

    const toggleAccordion = () => {
        setIsCollapsed(isCollapsed ? "api" : "");
    };

    const GENERATE_API_KEY = () => {
        setIsGenerating(true)
        setIsGetting(true)
        const data = {
            webhook_url: "https://www.transactions-third-party-platform-NEW.com",
            account: userDetails?._id
        }

        // // console.log(data)
        const encrypted = encryptData(data)

        axios.post(`${import.meta.env.VITE_IP_DEV_API}/api/userkey/create-user-key`, {
            data: encrypted
        }, {
            headers: authHeader
        })
            .then(res => {
                const decrypted = decryptData(res.data.data)
                setApiKey(decrypted?.userKey?.api_key)
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
                axios.get(`${import.meta.env.VITE_IP_DEV_API}/api/userkey/account-user-key/${userDetails?._id}`, {
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

                    const response = await axios.get(`${import.meta.env.VITE_IP_DEV_API}/api/userkey/get-apikey/${userDetails?._id}`, {
                        headers: authHeader
                    });

                    const decrypted = decryptData(response.data.data);
                    setApiKey(decrypted?.userKey?.api_key);
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
            axios.get(`${import.meta.env.VITE_IP_DEV_API}/api/userkey/request-user-key/${userDetails?._id}`, {
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
        <Card id='api_key'>
            <CardHeader className={`pb-0 ${isCollapsed ? 'collapsed' : 'expanded'}`} onClick={toggleAccordion}>
                <H4 attrH4={{ className: 'card-title mb-0' }}>{t("API Key")}</H4>
                <div className="card-options">
                    {isCollapsed ? <ChevronDown /> : <ChevronUp />}
                </div>
            </CardHeader>
            <div className={`accordion-body ${isCollapsed ? 'collapsed' : 'expanded'}`}>
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
                                alignItems: "center",
                                marginBottom: "1.5rem"
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
                                alignItems: "center",
                                marginBottom: "1.5rem"
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
                                    <input className="form-control" type="text" placeholder="Webhook URL" />
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
                        <GradientButton value={t("Save")} size="m" />
                    </div>
                }
            </div>
        </Card>
    )
}

export default ApiKey