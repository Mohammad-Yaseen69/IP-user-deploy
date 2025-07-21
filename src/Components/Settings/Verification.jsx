import React, { useContext, useEffect, useLayoutEffect, useState } from 'react'
import { Button, Card, CardBody, CardHeader, Col, Input, Label, Modal, ModalBody, ModalHeader } from 'reactstrap'
import { H4 } from '../../AbstractElements'
import { UserContext } from '../../Context/UserContext';
import { encryptData } from '../../Helper/EssentilaMethods/Encryption';
import { decryptData } from '../../Helper/EssentilaMethods/Decryption';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import VerificationAlert from './VerificationAlert';
import UploadAdditional from './UploadAdditional';
import VerificationPayment from './VerificationPayment';
import { useLocation, useNavigate } from 'react-router';
import { CheckCircle, XCircle } from 'react-feather';
import { toast } from 'react-toastify';
import VerificationGuide from './VerificationGuide';
import errors from "../AddFunds/TrustPaymentErrors.json"
import { AiOutlineClockCircle } from 'react-icons/ai';

const industries = [
    "Arts & Entertainment",
    "Banking & Finance",
    "Education & Research",
    "Engineering & Construction",
    "Healthcare & Medicine",
    "Information Technology & Services",
    "Legal & Compliance",
    "Manufacturing & Production",
    "Marketing & Sales",
    "Non-profit & Charity",
    "Real Estate & Property",
    "Retail & Wholesale",
    "Science & Pharmaceuticals",
    "Transport & Logistics",
    "Travel & Tourism",
    "Unemployed",
    "Other"
];

export const sourceOfFunds = [
    "Cash",
    "Business",
    "Gift",
    "Salary",
    "Lottery",
    "Savings",
    "Other"
]

const Verification = () => {
    const { t } = useTranslation()
    const { userDetails, authHeader } = useContext(UserContext)
    const [message, setMessage] = useState("")
    const [showAdditionalModal, setShowAdditionalModal] = useState(false)
    const [occupation, setOccupation] = useState("")
    const [sourceOfFund, setSourceOfFund] = useState("")
    const [occupationOther, setOccupationOther] = useState("")
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        setMessage(userDetails?.user?.desc ?? "")
        setOccupation(userDetails?.user?.occupation ?? "")
        setSourceOfFund(userDetails?.user?.source_of_funds ?? "")
    }, [userDetails])

    console.log(userDetails)

    const handleVerify = async () => {
        setLoading(true)
        const postData = {
            first_name: userDetails?.user?.first_name,
            last_name: userDetails?.user?.last_name,
            address: userDetails?.address ?? "N/A",
            dob: userDetails?.dob?.split("-")?.reverse()?.join("-"),
            nationality: userDetails?.country_iso_code,
            language_code: userDetails?.language ?? "en",
        };

        // console.log(postData);
        const encrypted = encryptData(postData);

        try {
            const response = await axios.post(
                `${process.env.REACT_APP_IP_DEV_API}/api/user/verification/user_${userDetails?.user?._id}`,
                { data: encrypted },
                { headers: authHeader }
            );

            const decrypted = decryptData(response.data.data);
            if (decrypted?.status) {
                const verificationLink = decryptData(
                    response.data.data
                )?.tokenized_link;
                window.open(verificationLink, "_blank");
            }

            // console.log("try ran in handlesend");
        } catch (error) {
            toast.error("We cannot process your request at the moment, please try again later.")
            // console.log("try ran in error", error);
            // console.log(decryptData(error.response.data.data));
        }
        finally {
            setLoading(false)
        }
    };

    const [showVerificationModal, setShowVerificationModal] = useState(false)

    const location = useLocation()
    const queryParams = new URLSearchParams(location.search)
    const status = queryParams.get("status")
    const code = queryParams.get("code")
    const ft = queryParams.get("ft")
    const [statusModal, setStatusModal] = useState(false)
    const [processing, setProcessing] = useState("")

    useEffect(() => {
        const updateProcessingCheck = async () => {
            const data = {
                paypal_transaction: "processing"
            }

            const res = await axios.put(`${process.env.REACT_APP_IP_DEV_API}/api/account/update-individual/${userDetails?._id}`, { data: encryptData(data) }, {
                headers: authHeader
            })


            console.log(decryptData(res.data.data))
        }


        if (status?.toLowerCase() === "success" && (!userDetails?.kyc_verification_paid && (userDetails?.user?.kyc_status !== "approved" || userDetails?.user?.kyc_status !== "verified"))) {
            if (userDetails?.paypal_transaction !== "processing") {
                updateProcessingCheck()
                setProcessing("processing")
            }
        }
    }, [status, userDetails])

    console.log(userDetails?.paypal_transaction)


    useEffect(() => {
        setProcessing(userDetails?.paypal_transaction)

        if (status) {
            if (userDetails?.user?.kyc_status !== "approved" || userDetails?.user?.kyc_status !== "verified") {
                setStatusModal(status?.toLowerCase())
            } else {
                setStatusModal("")
            }
        }
    }, [status, userDetails])

    const [showGuide, setShowGuide] = useState(true)

    useLayoutEffect(() => {
        if (userDetails?.user?.kyc_status === "approved" || userDetails?.user?.kyc_status === "needs-review" || userDetails?.user?.kyc_status === "processing" || userDetails?.paypal_transaction === "processing") {
            setShowGuide(false)
        } else {
            setShowGuide(true)
        }
    }, [userDetails])

    const error_message = () => {
        return errors.find(item => item?.code == code)?.message ?? "We cannot process your request at the moment, please try again later."
    }
    return (
        <Card id='verification'>
            {
                showGuide
                &&
                <Modal isOpen={showGuide} style={{ width: "100vw", maxWidth: "1200px" }}>
                    <ModalHeader toggle={() => {
                        setShowGuide(false)
                    }}>
                        {t("Identity Verification Guide")}
                    </ModalHeader>
                    <ModalBody style={{ padding: 0 }}>
                        <VerificationGuide setShowGuide={setShowGuide} />
                    </ModalBody>
                </Modal>
            }
            {
                statusModal
                &&
                <Modal isOpen={statusModal}>
                    <ModalBody>
                        {
                            processing === "processing" ?
                                <h5 className='modal-title' style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: '2rem' }}>
                                    <AiOutlineClockCircle  size={64} className="text-warning" />
                                    {t("Payment is in Processing!")}
                                </h5>
                                :
                                statusModal === "success"
                                    ?
                                    <h5 className='modal-title' style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: '2rem' }}>
                                        <CheckCircle size={64} className="text-success" />
                                        {t("Payment Successful!")}
                                    </h5>
                                    :
                                    <h5 className='modal-title' style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: '2rem' }}>
                                        <XCircle size={64} className="text-danger" />
                                        {t("Payment Failed!")}
                                    </h5>
                        }
                        <div className="text-center">
                            {
                                processing === "processing" ?
                                    <p className="mb-0">{t("Your payment is being processed. Please wait or refresh the page for updates")}</p>
                                    :
                                    statusModal === "success"
                                        ?
                                        <p className="mb-0">{t("KYC Fee has been paid successfully!")}
                                            <span style={{ color: "#5926f0", fontWeight: 600, textDecoration: "underline", cursor: "pointer" }} onClick={() => userDetails?.kyc_verification_paid ? handleVerify() : setStatusModal("")}>{t("Continue")}</span></p>
                                        :
                                        <p className="mb-0">{t(error_message())} <br /> <span style={{ color: "#5926f0", fontWeight: 600, textDecoration: "underline", cursor: "pointer" }} onClick={() => {
                                            setShowVerificationModal(true)
                                            setStatusModal("")
                                        }}>{t("Start again!")}</span></p>
                            }
                        </div>
                    </ModalBody>
                </Modal>
            }
            <CardHeader className={`pb-0 expanded`}>
                <div>
                    <H4 attrH4={{ className: 'card-title mb-0' }}>{t("Identity Verification")}</H4>
                    {/* {
                                    userDetails &&
                                        (
                                            !userDetails?.user?.kyc_status
                                            ||
                                            userDetails?.user?.kyc_status !== "approved"
                                        )
                                        ? */}
                    <p style={{ marginTop: ".5rem", color: "black", fontWeight: "300", display: "flex", gap: ".75rem", alignItems: "center", cursor: "pointer" }} onClick={() => {
                        setShowGuide(true)
                    }}>
                        {/* {
                                                userDetails?.user?.kyc_status === "declined"
                                                    ?
                                                    // <VerificationAlert />
                                                    ""
                                                    :
                                                    <>
                                                        {t("Verify Your Identity")}
                                                    </>
                                            } */}
                        {t("View Identity Verification Guide")}
                    </p>
                    {/* :
                                        <p style={{ marginTop: ".5rem", color: "black", fontWeight: "300" }}>{t("Identity Verified.")}</p>
                                } */}
                </div>
            </CardHeader>
            <div className={`accordion-body expanded`}>
                <CardBody>
                    <Col md="12" className='mb-4' style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                    }}>
                        <h5>{t("Identity Verification Status:")} </h5>
                        <h5 style={{
                            display: "flex",
                            alignItems: "center",
                            gap: ".5rem",
                            color: userDetails?.user?.kyc_status === "approved"
                                ?
                                "green"
                                :
                                userDetails?.user?.kyc_status === "declined"
                                    ?
                                    "red"
                                    :
                                    userDetails?.user?.kyc_status === "needs-review"
                                        ?
                                        "orange"
                                        : "red"
                        }}>
                            {
                                userDetails?.user?.kyc_status === "declined"
                                    ?
                                    <VerificationAlert />
                                    : ""
                            }
                            {`${userDetails?.user?.kyc_status === "approved"
                                ? t("Verified")
                                : userDetails?.user?.kyc_status === "declined"
                                    ? t("Declined")
                                    : userDetails?.user?.kyc_status === "needs-review"
                                        ? t("Under Review")
                                        : userDetails?.user?.kyc_status === "initiated"
                                            ? t("Initiated")
                                            : userDetails?.user?.kyc_status === "processing"
                                                ? t("Processing")
                                                : t("Unverified")
                                }`}
                        </h5>
                    </Col>
                    <Col md="12" className='mb-4'>
                        <div>
                            <Label className="form-label">{t("Briefly describe yourself and explain your reasons for using InstaPay.")}</Label>
                            <Input type="textarea" className="form-control" rows="5" placeholder={t("Enter Your Message")} value={message} onChange={e => setMessage(e.target.value)} disabled={userDetails?.user?.kyc_status === "approved" || userDetails?.user?.kyc_status === "pending" || userDetails?.user?.kyc_status === "needs-review"} />
                        </div>
                    </Col>
                    <Col md="12" className='mb-4'>
                        <div>
                            <Label className="form-label">{t("Select Occupation")}</Label>
                            <Input type="select" className="form-control" value={occupation} onChange={e => setOccupation(e.target.value)} disabled={userDetails?.user?.kyc_status === "approved" || userDetails?.user?.kyc_status === "pending" || userDetails?.user?.kyc_status === "needs-review"}>
                                <option value="" disabled="">{t("Select")}</option>
                                {
                                    industries.map(item => (
                                        <option value={item} key={item}>{item}</option>
                                    ))
                                }
                                {
                                    occupationOther
                                    &&
                                    <option value={occupationOther}>{occupationOther}</option>
                                }
                            </Input>
                            {
                                occupation === "Other"
                                &&
                                <Input type='text' value={occupationOther} onChange={e => setOccupationOther(e.target.value)} placeholder='Enter your occupation' />
                            }
                        </div>
                    </Col>
                    <Col md="12" className='mb-4'>
                        <div>
                            <Label className="form-label">{t("Select Source Of Fund")}</Label>
                            <Input type="select" className="form-control" disabled={userDetails?.user?.kyc_status === "approved" || userDetails?.user?.kyc_status === "pending" || userDetails?.user?.kyc_status === "needs-review"} value={sourceOfFund} onChange={e => setSourceOfFund(e.target.value)}>
                                <option value="" disabled="">{t("Select")}</option>
                                {
                                    sourceOfFunds.map(item => (
                                        <option value={item.toUpperCase()}>{t(item)}</option>
                                    ))
                                }
                            </Input>
                        </div>
                    </Col>
                    <Col md="12" className='mb-4'>
                        <h4 style={{ fontSize: "18px" }}>{t("Identity Verification")}:</h4>
                        <p>{t("It must be a government-issued identification document with a photo. All identification documents must be written in the Latin alphabet. If not, a certified \ntranslation is required.")}</p>
                    </Col>
                    <Col md="12" className='mb-4'>
                        <p style={{ marginBottom: 0, fontSize: "110%" }}>{t("Accepted Documents")}:</p>
                        <ul style={{ listStyleType: "initial", paddingLeft: "1rem" }}>
                            <li>{t("A national identity card")}</li>
                            <li>{t("A valid passport")}</li>
                            <li>{t("Valid residence permits (accepted only if issued by a European country or in Switzerland)")}</li>
                            <li>{t("Biometric Facial Recognition: Comparing video with passport photograph")}</li>
                        </ul>
                    </Col>
                    <Col md="12" className='mb-4'>
                        <h4 style={{ fontSize: "18px" }}>{t("Address Verification:")}</h4>
                        <ul style={{ listStyleType: "initial", paddingLeft: "1rem" }}>
                            <li>{t("Provide a bank statement or utility bill (less than 3 months old) as proof of address")}</li>
                        </ul>
                    </Col>
                    <Col md="12" className='mb-4'>
                        <h4 style={{ fontSize: "18px" }}>{t("Additional Documents:")}</h4>
                        <p>{t("Kemit Kingdom reserves the right to request any additional documents (Enhanced Due Diligence - EDD) or further information necessary for conducting thorough \nverifications, in accordance with its legal obligations.")}</p>
                    </Col>
                    {
                        userDetails?.user?.kyc_additional_file?.length > 0 && userDetails?.user?.kyc_additional_file?.some(item => item?.status === "requested")
                            ?
                            <>
                                <Col className='mb-4' style={{ display: "flex", justifyContent: "flex-end" }}>
                                    <Button style={{
                                        background: "linear-gradient(to right bottom, #e64067, #5926f0, #4828a0)",
                                        border: "none",
                                        outline: "none",
                                        borderRadius: "10px"
                                    }}
                                        onClick={() => setShowAdditionalModal(!showAdditionalModal)}
                                        disabled={userDetails?.user?.kyc_additional_file?.every(item => item?.status !== "requested")}
                                    >
                                        {userDetails?.user?.kyc_additional_file?.every(item => item?.status !== "requested") ? "Uploaded" : t("Upload Requested Documents")}
                                    </Button>
                                </Col>
                                <UploadAdditional files={userDetails?.user?.kyc_additional_file} isOpen={showAdditionalModal} toggle={() => setShowAdditionalModal(!showAdditionalModal)} user_id={userDetails?._id} />
                            </>
                            : ""
                    }
                    <Col className='mb-4' style={{ display: "flex", justifyContent: "flex-end" }}>
                        {
                            userDetails?.user?.kyc_status !== "approved"
                                &&
                                userDetails?.user?.kyc_status !== "needs-review"
                                ?
                                <Button style={{
                                    background: "linear-gradient(to right bottom, #e64067, #5926f0, #4828a0)",
                                    border: "none",
                                    outline: "none",
                                    borderRadius: "10px"
                                }} disabled={loading || !message || !(occupation === "Other" ? occupationOther : occupation) || !(
                                    userDetails?.user?.kyc_status !== "declined" ||
                                    userDetails?.user?.kyc_status !== "unverified"
                                )} onClick={() => userDetails?.kyc_verification_paid ? handleVerify() : setShowVerificationModal(true)}>
                                    {t("Start Verification")}
                                </Button>
                                : ""

                        }
                    </Col>
                </CardBody>
                <VerificationPayment
                    loading={loading}
                    isOpen={showVerificationModal}
                    toggle={() => setShowVerificationModal(!showVerificationModal)}
                    verify={handleVerify}
                    desc={message}
                    occupation={occupation === "Other" ? occupationOther : occupation}
                    source_of_funds={sourceOfFund}
                />
            </div>
        </Card>

    )
}

export default Verification
