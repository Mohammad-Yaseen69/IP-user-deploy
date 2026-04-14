import React, { useContext, useState } from 'react'
import { Card, CardBody, CardHeader, Col, Input, Label } from 'reactstrap'
import { H4 } from '../../../AbstractElements'
import { ChevronDown, ChevronUp } from 'react-feather';
import { UserContext } from '../../../Context/UserContext';
import GradientButton from './GradientButton';
import { encryptData } from '../../../Helper/EssentilaMethods/Encryption';
import { decryptData } from '../../../Helper/EssentilaMethods/Decryption';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import VerificationAlert from './VerificationAlert';
import UploadAdditional from './UploadAdditional';

const Verification = ({ isCollapsed, setIsCollapsed }) => {
    const { t } = useTranslation()
    const { userDetails, authHeader } = useContext(UserContext)
    const [message, setMessage] = useState("")
    const [occupation, setOccupation] = useState("")
    const [showAdditionalModal, setShowAdditionalModal] = useState(false)
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
        "Other"
    ];
    const handleVerify = async () => {
        const postData = {
            first_name: userDetails?.user?.first_name,
            last_name: userDetails?.user?.last_name,
            address: userDetails?.address ?? "N/A",
            dob: "1999-10-03",
            nationality: "PAK",
            language_code: "en",
        };
        // console.log(postData);
        const encrypted = encryptData(postData);

        try {
            const response = await axios.post(
                `${import.meta.env.VITE_IP_DEV_API}/api/user/verification/user_${userDetails?.user?._id
                }`,
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
            // console.log("try ran in error", error);
            // console.log(decryptData(error?.response?.data?.data));
        }
    };

    const toggleAccordion = () => {
        setIsCollapsed(isCollapsed ? "verification" : "");
    };
    return (
        <Card id='verification'>
            <CardHeader className={`pb-0 ${isCollapsed ? 'collapsed' : 'expanded'}`} onClick={toggleAccordion}>
                <div>
                    <H4 attrH4={{ className: 'card-title mb-0' }}>{t("Identity Verification")}</H4>
                    {
                        userDetails &&
                            (
                                !userDetails?.use?.kyc_status
                                ||
                                userDetails?.user?.kyc_status !== "approved"
                            )
                            ?
                            <p style={{ marginTop: ".5rem", color: "black", fontWeight: "300", display: "flex", gap: ".75rem", alignItems: "center" }}>
                                {
                                    userDetails?.user?.kyc_status === "declined"
                                        ?
                                        <VerificationAlert />
                                        :
                                        <>
                                            {t("Please Verifiy Your Identity.")}
                                        </>
                                }
                            </p>
                            :
                            <p style={{ marginTop: ".5rem", color: "black", fontWeight: "300" }}>{t("Identity Verified.")}</p>
                    }
                </div>
                <div className="card-options">
                    {isCollapsed ? <ChevronDown /> : <ChevronUp />}
                </div>
            </CardHeader>
            <div className={`accordion-body ${isCollapsed ? 'collapsed' : 'expanded'}`}>
                <CardBody>
                    <Col md="12" className='mb-4' style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                    }}>
                        <h5>Verification Status: </h5>
                        <h5 style={{
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
                            {`${userDetails?.user?.kyc_status === "approved"
                                ? t("Verified")
                                : userDetails?.user?.kyc_status === "declined"
                                    ? t("Declined")
                                    : userDetails?.user?.kyc_status === "needs-review"
                                        ? t("Under Review")
                                        : t("Unverified")
                                }`}
                        </h5>
                    </Col>
                    <Col md="12" className='mb-4'>
                        <div>
                            <Label className="form-label">{t("Describe Briefly Why Do You Use Instapay For")}</Label>
                            <Input type="textarea" className="form-control" rows="5" placeholder="Enter You Message" value={message} onChange={e => setMessage(e.target.value)} disabled={userDetails?.user?.kyc_status === "approved"} />
                        </div>
                    </Col>
                    <Col md="12" className='mb-4'>
                        <div>
                            <Label className="form-label">{t("Select Occupation")}</Label>
                            <Input type="select" className="form-control" value={occupation} onChange={e => setOccupation(e.target.value)} disabled={userDetails?.user?.kyc_status === "approved"}>

                                {
                                    industries?.map(item => (
                                        <option value={item} key={item}>{t(item)}</option>
                                    ))
                                }

                            </Input>
                        </div>
                    </Col>
                    <Col md="12" className='mb-4'>
                        <h4 style={{ fontSize: "18px" }}>{t("Identity Verification:")}</h4>
                        <p>{t("It must be a government-issued identification document with a photo. All identification documents must be written in the Latin alphabet. If not, a certified translation will be required.")}</p>
                    </Col>
                    <Col md="12" className='mb-4'>
                        <p style={{ marginBottom: 0, fontSize: "110%" }}>{t("Only the following documents are accepted:")}</p>
                        <ul style={{ listStyleType: "initial", paddingLeft: "1rem" }}>
                            <li>{t("A valid national identity card")}</li>
                            <li>{t("A valid passport")}</li>
                            <li>{t("Valid residence permits will only be accepted if issued by a European country or in Switzerland")}</li>
                            <li>{t("Biometric Facial Recognition comparing video with passport photograph")}</li>
                        </ul>
                    </Col>
                    {
                        userDetails?.user?.kyc_additional_file?.length > 0
                            &&
                            userDetails?.user?.kyc_additional_file?.some(item => item?.status === "requested")
                            ?
                            <>
                                <Col className='mb-4' style={{ display: "flex", justifyContent: "flex-end" }}>
                                    <GradientButton
                                        value={userDetails?.user?.kyc_additional_file?.every(item => item?.status !== "requested") ? "Uploaded" : t("Upload Requested Files")}
                                        size="m"
                                        attr={{ onClick: () => setShowAdditionalModal(!showAdditionalModal), disabled: userDetails?.user?.kyc_additional_file?.every(item => item?.status !== "requested") }} />
                                </Col>
                                <UploadAdditional files={userDetails?.user?.kyc_additional_file} isOpen={showAdditionalModal} toggle={() => setShowAdditionalModal(!showAdditionalModal)} user_id={userDetails?._id} />
                            </>
                            : ""
                    }
                    <Col md="12" className='mb-4'>
                        <h4 style={{ fontSize: "18px" }}>{t("Address Verification:")}</h4>
                        <ul style={{ listStyleType: "initial", paddingLeft: "1rem" }}>
                            <li>{t("Proof of address (Verification of bank statement or utility bill with name, address and date of issue on it – must be less than 3 months)")}</li>
                        </ul>
                    </Col>
                    <Col md="12" className='mb-4'>
                        <h4 style={{ fontSize: "18px" }}>{t("Additional Documents:")}</h4>
                        <p>{t("Kemit Kingdom retains the right to request any additional documents (EDD) or further information necessary for conducting thorough verifications, in line with its legal obligations.")}</p>
                    </Col>
                    <Col className='mb-4' style={{ display: "flex", justifyContent: "flex-end" }}>
                        <GradientButton value={t("Start Verification")} size="m" attr={{
                            disabled: !message || !occupation || !(
                                userDetails?.user?.kyc_status !== "declined" ||
                                userDetails?.user?.kyc_status !== "unverified"
                            ), onClick: handleVerify
                        }} />
                    </Col>
                </CardBody>
            </div>
        </Card>
    )
}

export default Verification
