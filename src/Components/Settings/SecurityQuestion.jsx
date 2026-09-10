import { H4 } from '../../AbstractElements';
import { Row, Col, CardHeader, CardBody, Form, FormGroup, Label, Input, Modal, ModalHeader, ModalBody, Button } from 'reactstrap';
import { useContext, useEffect, useState } from 'react';
import { UserContext } from '../../Context/UserContext';
import { encryptData } from '../../Helper/EssentilaMethods/Encryption';
import axios from 'axios';
import { decryptData } from '../../Helper/EssentilaMethods/Decryption';
import { useTranslation } from 'react-i18next';
import OTPConfirmation from '../UserSettingsNew/OTPConfirmation';
import SuccessModal from '../AddBeneficiary/SuccessModal';
import { useLocation, useNavigate } from 'react-router';
import { toast } from 'react-toastify';
import { usePermission } from '../../hooks/GeneralUse/usePermission';
import { preventEdgeSpaces } from '../../hooks/useTrimInput';

const SecurityQuestions = () => {
    const { userSecurityQues, authHeader, userDetails, verifyToken, getSecurityQuestions, setProfileLockTime, profileCompletedPercentage, setUserDetails } = useContext(UserContext)
    const navigate = useNavigate()
    useEffect(() => {
        if (userDetails) {
            getSecurityQuestions()
        }
    }, [userDetails])


    const { t } = useTranslation()

    const [isEditable, setIsEditable] = useState(false)
    const [showSuccess, setShowSuccess] = useState(false)

    const [showOtp, setShowOtp] = useState(false)

    const [selectedQuesOne, setSelectedQuesOne] = useState("")
    const [selectedQuesTwo, setSelectedQuesTwo] = useState("")
    const [selectedQuesThree, setSelectedQuesThree] = useState("")
    const [answerOne, setAnswerOne] = useState("")
    const [answerTwo, setAnswerTwo] = useState("")
    const [answerThree, setAnswerThree] = useState("")
    const [saving, setSaving] = useState("")
    const [token, setToken] = useState("")
    const [codeType, setCodeType] = useState("sms")
    const can = usePermission()
    const isEdit = can("settings.security-questions.update")
    useEffect(() => {
        setCodeType(userDetails?.tfa ? "authenticator" : "sms")
    }, [userDetails])

    const sendOtp = async () => {
        setSaving(true)
        const data = {
            data: {
                question1: selectedQuesOne,
                answer1: answerOne?.trim() || "",
                question2: selectedQuesTwo,
                answer2: answerTwo?.trim() || "",
                question3: selectedQuesThree,
                answer3: answerThree?.trim() || "",
            },
            type: codeType
        }

        if (userDetails?.user?.question1 || userDetails?.user?.question2 || userDetails?.user?.question3) {
            try {
                const encrypted = encryptData(data)
                const res = await axios.post(`${import.meta.env.VITE_IP_DEV_API}/api/wallet/send-otp`, {
                    data: encrypted
                }, {
                    headers: authHeader
                })

                const dec = decryptData(res.data.data)
                setToken(dec?.token)
                setShowOtp(true)
            } catch (error) {
                toast.error("Something went wrong while sending otp!")
                // console.log(decryptData(error?.response?.data?.data))
            }
            finally {
                setSaving(false)
            }
        } else {
            axios.post(`${import.meta.env.VITE_IP_DEV_API}/api/user/set-security-question-no-otp/${userDetails._id}`, data, {
                headers: authHeader
            })
                .then(res => {
                    const decrypted = decryptData(res.data.data)
                    if (decrypted.status === true) {
                        setUserDetails(prev => ({
                            ...prev,
                            user: decrypted.account.user
                        }))
                        setShowSuccess(true)
                        setIsEditable(false)
                    }
                })
                .catch(err => {
                    const decrypted = decryptData(err.response.data.data);
                    toast.error(decrypted?.message ?? "Something went wrong while adding questions!")
                }).finally(() => setSaving(false))
        }
    }

    useEffect(() => {
        if (!isEditable && userDetails) {
            setSelectedQuesOne(userDetails?.user?.question1 ?? userDetails?.company?.question1 ?? "");
            setSelectedQuesTwo(userDetails?.user?.question2 ?? userDetails?.company?.question2 ?? "");
            setSelectedQuesThree(userDetails?.user?.question3 ?? userDetails?.company?.question3 ?? "");
            setAnswerOne(userDetails?.user?.answer1 ?? userDetails?.company?.answer1 ? "**************" : "");
            setAnswerTwo(userDetails?.user?.answer2 ?? userDetails?.company?.answer2 ? "**************" : "");
            setAnswerThree(userDetails?.user?.answer3 ?? userDetails?.company?.answer3 ? "**************" : "");
        }
    }, [userDetails, isEditable]);

    const UpdateQuestionHandler = (setter, type, otp, error) => {
        setSaving(true)
        const data = {
            token,
            otp,
            type: codeType
        }
        // console.log(data)
        // console.log(encryptData(data))
        axios.post(`${import.meta.env.VITE_IP_DEV_API}/api/user/set-security-question/${userDetails._id}`, { data: encryptData(data) }, {
            headers: authHeader
        })
            .then(res => {
                const decrypted = decryptData(res.data.data)
                if (decrypted.status === true) {
                    setIsEditable(false)
                    setter(true)
                    verifyToken()
                    setShowSuccess(true)
                }
            })
            .catch(err => {
                // console.log(decryptData(err.response.data.data))
                const decrypted = decryptData(err.response.data.data);
                console.log(decrypted)
                if (decrypted.message?.toLowerCase()?.includes("account is locked")) {
                    const time = decrypted?.message?.split(" in ")?.[1]?.split(" ")?.[0] ?? "0:00"
                    const timeInSec = (+time?.split(":")?.[0] * 60) + (+time?.split(":")?.[1])
                    setProfileLockTime(timeInSec)
                    const coun = localStorage.getItem("ip_country")
                    localStorage.clear()
                    localStorage.setItem("ip_country", coun)
                    navigate("/login")
                }
                error("We cannot process your request at the moment, please try again later.")
            }).finally(() => setSaving(false))
    }

    const isValidAnswer = () => {
        return true
    }

    const location = useLocation()
    const queryParams = new URLSearchParams(location.search)
    const editmode = queryParams.get("editmode")

    useEffect(() => {
        setIsEditable(editmode)
    }, [editmode])

    return (
        <Form className="card" id='security'>
            <CardHeader className={`pb-0`}>
                <H4 attrH4={{ className: 'card-title mb-0' }}>{t("Security Questions")}</H4>
            </CardHeader>
            <CardBody>
                <Row>
                    <Col md="12">
                        <FormGroup className="mb-3" style={{ position: "relative" }}>
                            {
                                (!answerOne || !selectedQuesOne)
                                &&
                                <div style={{
                                    height: "9px",
                                    width: "9px",
                                    borderRadius: "9px",
                                    background: "red",
                                    position: "absolute",
                                    bottom: "20px",
                                    right: "-17px"
                                }}></div>
                            }
                            <Label className="form-label">{t("Security Question")} 1 {(!answerOne || !selectedQuesOne) && <span style={{ color: "red" }}>{t("(Required)")}</span>}</Label>
                            <Input disabled={!isEditable} type='select'
                                value={selectedQuesOne} onChange={e => {
                                    setSelectedQuesOne(e.target.value)
                                    setAnswerOne("")
                                }}
                            >
                                <option value="">{t("Select your question")}</option>
                                {
                                    userSecurityQues.map(que => (
                                        <option value={que._id} key={que._id} disabled={selectedQuesThree === que._id || selectedQuesTwo === que._id}>{que.question}</option>
                                    ))
                                }
                            </Input>
                            <Input disabled={!isEditable} className="form-control mt-2" type="text" placeholder={t("Answer To The Question")} value={answerOne} onChange={e => {
                                const value = e.target.value.slice(0, 50);
                                setAnswerOne(value);
                            }}
                                onKeyDown={preventEdgeSpaces}

                                maxLength={50} style={{ borderColor: isValidAnswer(answerOne) ? "#eeeeee" : "red" }} />
                            <div style={{ fontSize: "12px", color: "#666", marginTop: "4px", textAlign: "right" }}>
                                {(answerOne?.length || 0)}/50
                            </div>
                        </FormGroup>
                    </Col>
                    <Col md="12">
                        <FormGroup className="mb-3" style={{ position: "relative" }}>
                            {
                                (!answerTwo || !selectedQuesTwo)
                                &&
                                <div style={{
                                    height: "9px",
                                    width: "9px",
                                    borderRadius: "9px",
                                    background: "red",
                                    position: "absolute",
                                    bottom: "20px",
                                    right: "-17px"
                                }}></div>
                            }
                            <Label className="form-label">{t("Security Question")} 2 {(!answerTwo || !selectedQuesTwo) && <span style={{ color: "red" }}>{t("(Required)")}</span>}</Label>
                            <Input disabled={!isEditable} type='select' value={selectedQuesTwo} onChange={e => {
                                setSelectedQuesTwo(e.target.value)
                                setAnswerTwo("")
                            }}>
                                <option value="">{t("Select your question")}</option>
                                {
                                    userSecurityQues.map(que => (
                                        <option value={que._id} key={que._id} disabled={selectedQuesOne === que._id || selectedQuesThree === que._id}>{que.question}</option>
                                    ))
                                }
                            </Input>
                            <Input disabled={!isEditable} className="form-control mt-2" type="text" placeholder={t("Answer To The Question")} value={answerTwo} onChange={e => {
                                const value = e.target.value.slice(0, 50);
                                setAnswerTwo(value);
                            }}
                                onKeyDown={preventEdgeSpaces}
                                maxLength={50} style={{ borderColor: isValidAnswer(answerTwo) ? "#eeeeee" : "red" }} />
                            <div style={{ fontSize: "12px", color: "#666", marginTop: "4px", textAlign: "right" }}>
                                {(answerTwo?.length || 0)}/50
                            </div>
                        </FormGroup>
                    </Col>
                    <Col md="12">
                        <FormGroup className="mb-3" style={{ position: "relative" }}>
                            {
                                (!answerThree || !selectedQuesThree)
                                &&
                                <div style={{
                                    height: "9px",
                                    width: "9px",
                                    borderRadius: "9px",
                                    background: "red",
                                    position: "absolute",
                                    bottom: "20px",
                                    right: "-17px"
                                }}></div>
                            }
                            <Label className="form-label">{t("Security Question")} 3 {(!answerThree || !selectedQuesThree) && <span style={{ color: "red" }}>{t("(Required)")}</span>}</Label>
                            <Input disabled={!isEditable} type='select' value={selectedQuesThree} onChange={e => {
                                setSelectedQuesThree(e.target.value)
                                setAnswerThree("")
                            }}>
                                <option value="">{t("Select your question")}</option>
                                {
                                    userSecurityQues.map(que => (
                                        <option value={que._id} key={que._id} disabled={selectedQuesOne === que._id || selectedQuesTwo === que._id}>{que.question}</option>
                                    ))
                                }
                            </Input>
                            <Input disabled={!isEditable} className="form-control mt-2" type="text" placeholder={t("Answer To The Question")} value={answerThree} onChange={e => {
                                const value = e.target.value.slice(0, 50);
                                setAnswerThree(value);
                            }}
                                onKeyDown={preventEdgeSpaces}
                                maxLength={50} style={{ borderColor: isValidAnswer(answerThree) ? "#eeeeee" : "red" }} />
                            <div style={{ fontSize: "12px", color: "#666", marginTop: "4px", textAlign: "right" }}>
                                {(answerThree?.length || 0)}/50
                            </div>
                        </FormGroup>
                    </Col>
                </Row>
            </CardBody>
            <div style={{
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "flex-end",
                gap: "1rem",
                flexWrap: "wrap",
                padding: "1.5rem"
            }}>
                {
                    isEditable
                    &&
                    <Button style={{
                        background: "linear-gradient(to right bottom, #e64067, #5926f0, #4828a0)",
                        border: "none",
                        outline: "none",
                        borderRadius: "10px"
                    }} onClick={() => setIsEditable(false)} type='button'>{t("Cancel")}</Button>
                }
                {
                    isEditable
                        ?
                        <Button style={{
                            background: "linear-gradient(to right bottom, #e64067, #5926f0, #4828a0)",
                            border: "none",
                            outline: "none",
                            borderRadius: "10px"
                        }}
                            onClick={sendOtp}
                            disabled={(!selectedQuesOne || !answerOne) || (!answerTwo || !selectedQuesTwo) || (!selectedQuesThree || !answerThree) || !isValidAnswer(answerOne) || !isValidAnswer(answerTwo) || !isValidAnswer(answerThree) || saving}
                            type='button'
                        >{t("Save")}</Button>
                        :
                        <Button onClick={() => setIsEditable(true)} type='button' disabled={!isEdit} style={{
                            background: "linear-gradient(to right bottom, #e64067, #5926f0, #4828a0)",
                            border: "none",
                            outline: "none",
                            borderRadius: "10px"
                        }}>{t("Edit")}</Button>
                }
                <Modal isOpen={showOtp} toggle={() => setShowOtp(!showOtp)}>
                    <ModalHeader toggle={() => setShowOtp(!showOtp)}>{t("Confirm")}</ModalHeader>
                    <ModalBody>
                        <OTPConfirmation
                            callback={UpdateQuestionHandler}
                            setter={setShowSuccess}
                            setterValue={true}
                            hideOtp={() => setShowOtp(false)}
                            processing={saving}
                            resendHandler={sendOtp}
                            authType={codeType}
                            setAuthType={setCodeType}
                        />
                    </ModalBody>
                </Modal>
            </div>
            <SuccessModal
                isOpen={showSuccess}
                message={"Security Questions Updated"}
                subMessage={"Security questions updated successfully!"}
                toggle={() => {
                    setShowSuccess(false)
                    if (profileCompletedPercentage != 100) {
                        navigate("/settings?tab=social&ft=true")
                    }
                }}
            />
        </Form>
    )
}

export default SecurityQuestions
