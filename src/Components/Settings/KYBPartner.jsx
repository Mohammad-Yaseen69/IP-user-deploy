import { useContext, useEffect, useState } from "react"
import { ModalFooter } from "react-bootstrap"
import { CheckCircle, Edit, File, RefreshCw, Trash2, Mail } from "react-feather"
import { Button, FormGroup, Input, Label, Modal, ModalBody, ModalHeader } from "reactstrap"
import { UserContext } from "../../Context/UserContext"
import { encryptData } from "../../Helper/EssentilaMethods/Encryption"
import axios from "axios"
import { decryptData } from "../../Helper/EssentilaMethods/Decryption"
import UploadAdditionalKYB from "./UploadAdditionalKYB"
import { useTranslation } from "react-i18next"
import { capitalizeStatus } from "../PendingNew/ItemMobile"
import { isEmailValid } from "../../utils/Functions/validations"
import { toast } from "react-toastify"
import { useMutation } from "@tanstack/react-query"
import { apiWrapper } from "../../utils/Functions/apiWrapper"

const KYB_ACTION_BLOCKED_STATUSES = ["verified", "approved", "needs-review", "needs_review"]

const isKybActionBlocked = (status) => KYB_ACTION_BLOCKED_STATUSES.includes(status)

const KYBPartner = ({ partner, partners, setPartners, refreshPartners, index, setModalOpen, setPartnerVerification }) => {

    const [showEditModal, setShowEditModal] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [updating, setUpdating] = useState(false)
    const { authHeader, userDetails, checkAuth, verifyToken } = useContext(UserContext)
    const [partnerName, setPartnerName] = useState(partner?.name)
    const [partnerEmail, setPartnerEmail] = useState(partner?.email)
    const [partnerDesignation, setPartnerDesignation] = useState(partner?.designation)
    const [emailSent, setEmailSent] = useState(false)
    const [showAdditionalModal, setShowAdditionalModal] = useState(false)
    const { t } = useTranslation()

    const { mutateAsync: getPartnerStatus, isPending } = useMutation({
        mutationFn: (partnerId) => apiWrapper({
            endpoint: `/api/company/partner-attempt-status/${partnerId}`
        }),
        onError: (error) => {
            const dec = decryptData(error?.response?.data?.data)
            toast.error(dec?.message || 'We are unable to process your request. Please try again later.')
        }
    })



    const updatePartnerHandler = async () => {
        if (isKybActionBlocked(userDetails?.company?.kyb_status)) {
            toast.error(t("No action is allowed for the current business verification status."));
            return;
        }

        if (!isEmailValid(partnerEmail)) {
            toast.error(t("Please enter a valid email address."));
            return;
        }

        if (partners.find((p, i) => p.email.toLowerCase() === partnerEmail.toLowerCase() && i !== index)) {
            toast.error(t("A director with this email already exists."));
            return;
        }

        setUpdating(true)
        try {
            const payload = {
                partner_id: partner?._id,
                name: partnerName,
                email: partnerEmail,
                designation: partnerDesignation,
                account_id: userDetails?._id
            }
            // console.log(payload)
            const encrypted = encryptData(payload)
            const response = await axios.post(`${import.meta.env.VITE_IP_DEV_API}/api/company/edit-partner`, {
                data: encrypted
            }, {
                headers: authHeader
            })
            const data = await decryptData(response.data.data)

            setUpdating(false)

            const _partners = [...partners]

            const currentItem = _partners.splice(index, 1)[0]

            _partners.splice(index, 0, data?.partner);

            setPartners(_partners)
            setShowEditModal(false)
            checkAuth()
        } catch (error) {
            setUpdating(false)
            // console.log(decryptData(error?.response?.data?.data))
        }
    }


    const deletePartnerHandler = async () => {
        if (isKybActionBlocked(userDetails?.company?.kyb_status)) {
            toast.error(t("No action is allowed for the current business verification status."));
            return;
        }

        setUpdating(true)
        try {
            const response = await axios.delete(`${import.meta.env.VITE_IP_DEV_API}/api/company/delete-partner/${userDetails?._id}/${partner?._id}`, {
                headers: authHeader
            })
            const data = await decryptData(response.data.data)
            // console.log(data)
            setUpdating(false)

            const _partners = partners.filter(item => item?._id !== partner?._id)
            setPartners(_partners)
            setShowDeleteModal(false)
            checkAuth()
        } catch (error) {
            setUpdating(false)
            // console.log(decryptData(error?.response?.data?.data))
        }
    }

    const sendEmailVerification = async () => {
        if (isKybActionBlocked(userDetails?.company?.kyb_status)) {
            toast.error("No action is allowed for the current business verification status.");
            return;
        }
        setUpdating(true)
        try {

            const payload = {
                partner_name: partnerName,
                email: partnerEmail
            }
            const encrypted = encryptData(payload)
            // console.log(encrypted)
            const response = await axios.post(`${import.meta.env.VITE_IP_DEV_API}/api/company/verification-1/partner_${partner?._id}`, {
                data: encrypted
            }, {
                headers: authHeader
            })
            const data = await decryptData(response.data.data)
            // console.log(data)
            verifyToken(true)
            setUpdating(false)
            setEmailSent(true)
            setTimeout(() => {
                setEmailSent(false)
            }, 3000)
            return data
        } catch (error) {
            // console.log(error)
            // console.log(decryptData(error?.response?.data?.data))
            setUpdating(false)
            return null
        }
    }

    // requested partner files
    const [partnerFiles, setPartnerFiles] = useState([])

    useEffect(() => {
        setPartnerFiles(partner?.kyb_additional_file)
    }, [partners, partner])

    const handleRepayment = async () => {
        if (isKybActionBlocked(userDetails?.company?.kyb_status)) {
            toast.error("No action is allowed for the current business verification status.");
            return;
        }

        const response = await getPartnerStatus(partner?._id)
        console.log(response)

        if (response?.isPaymentRequired) {
            setModalOpen(true)
            setPartnerVerification(partner)
        } else {
            await sendEmailVerification()
            await refreshPartners?.()
        }
    }

    const isCompanyActionBlocked = isKybActionBlocked(userDetails?.company?.kyb_status)
    const isIndividualPartnerPaymentPending = partner?.addedIndividually === true && !partner?.kyc_verification_paid
    const canSendVerificationEmail = userDetails?.kyb_verification_paid && !isCompanyActionBlocked && !isIndividualPartnerPaymentPending && (!partner?.kyc_status || partner?.kyc_status === "initiated")
    const canRepayPartner = !isCompanyActionBlocked && (partner?.kyc_status === "declined" || isIndividualPartnerPaymentPending)
    const shouldShowNoAction = isCompanyActionBlocked || (userDetails?.kyb_verification_paid && (partner?.kyc_status && partner?.kyc_status !== "initiated" && partner?.kyc_status !== "declined"))

    return (
        <tr>
            <td>{partner?.name}</td>
            <td>{partner?.email}</td>
            <td>{partner?.designation}</td>
            <td style={{ display: "flex", gap: ".75rem" }}>
                {(!isKybActionBlocked(userDetails?.company?.kyb_status) && !shouldShowNoAction) && !isCompanyActionBlocked && <>
                    <Button color="primary" style={{
                        background: "linear-gradient(to right bottom, #e64067, #5926f0, #4828a0)",
                        border: "none",
                        outline: "none",
                        borderRadius: "5px",
                        padding: "5px",
                        fontSize: ".7rem",
                        display: "flex", alignItems: "center"
                    }}
                        onClick={() => setShowEditModal(!showEditModal)}
                    >
                        <Edit size={15} />
                    </Button>
                    <Button color="primary" style={{
                        background: "linear-gradient(to right bottom, #e64067, #5926f0, #4828a0)",
                        border: "none",
                        outline: "none",
                        borderRadius: "5px",
                        padding: "5px",
                        fontSize: ".7rem",
                        display: "flex", alignItems: "center"
                    }}
                        onClick={() => setShowDeleteModal(!showDeleteModal)}
                    >
                        <Trash2 size={15} />
                    </Button>
                </>}
                {
                    canSendVerificationEmail &&
                    <>
                        {
                            emailSent
                                ?
                                <CheckCircle color="green" />
                                :
                                <Button color="primary" style={{
                                    background: "linear-gradient(to right bottom, #e64067, #5926f0, #4828a0)",
                                    border: "none",
                                    outline: "none",
                                    borderRadius: "5px",
                                    padding: "5px",
                                    fontSize: ".7rem",
                                    display: "flex", alignItems: "center"
                                }}
                                    title="Send Verification Email"
                                    disabled={updating}
                                    onClick={sendEmailVerification}
                                >
                                    <Mail size={15} />
                                </Button>
                        }
                    </>
                }
                {
                    canRepayPartner &&
                    <Button color="primary" style={{
                        background: "linear-gradient(to right bottom, #e64067, #5926f0, #4828a0)",
                        border: "none",
                        outline: "none",
                        borderRadius: "5px",
                        padding: "5px",
                        fontSize: ".7rem",
                        display: "flex", alignItems: "center"
                    }}
                        title="Verify"
                        disabled={isPending || updating}
                        onClick={handleRepayment}
                    >
                        <RefreshCw size={15} />
                    </Button>
                }
                {
                    shouldShowNoAction && <span style={{ fontWeight: 600, color: "darkgray" }}>{t("No Action Allowed")} </span>
                }
                {
                    !isCompanyActionBlocked && partnerFiles?.length > 0 && partnerFiles?.some(item => item?.status === "requested")
                    &&
                    <Button color="primary" style={{
                        background: "linear-gradient(to right bottom, #e64067, #5926f0, #4828a0)",
                        border: "none",
                        outline: "none",
                        borderRadius: "5px",
                        padding: "5px",
                        fontSize: ".7rem",
                        display: "flex",
                        alignItems: "center",
                        position: "relative"
                    }}
                        title="Send Verification Email"
                        disabled={updating}
                        onClick={() => setShowAdditionalModal(true)}
                    >
                        <File size={15} />
                        <div style={{
                            position: "absolute",
                            top: "-7.5px",
                            right: "-7.5px",
                            boxShadow: "0 0 3px #1111113e",
                            color: "black",
                            background: "white",
                            height: "15px",
                            width: "15px",
                            borderRadius: "10px",
                            containerType: "inline-size",
                            fontSize: "9px",
                            display: "flex",
                            justifyContent: "center", alignItems: "center"
                        }}>
                            {partnerFiles?.length}
                        </div>
                    </Button>
                }
            </td>
            <td style={{ color: partner?.kyc_status === "approved" ? "green" : partner?.kyc_status === 'declined' ? "red" : "orange", fontWeight: 600 }}>
                {capitalizeStatus(partner?.kyc_status || "Not-Initiated")}
            </td>
            {
                partnerFiles?.length > 0
                &&
                <UploadAdditionalKYB files={partnerFiles} isOpen={showAdditionalModal} toggle={() => setShowAdditionalModal(!showAdditionalModal)} user_id={userDetails?._id} type="partner" partner_id={partner?._id} />
            }

            <Modal isOpen={showEditModal} toggle={() => setShowEditModal(!showEditModal)}>
                <ModalHeader toggle={() => setShowEditModal(!showEditModal)}>
                    {t("Edit Director")}
                </ModalHeader>
                <ModalBody>
                    <FormGroup>
                        <Label>{t("Director Name")}</Label>
                        <Input placeholder={t("Director Name")} value={partnerName} onChange={e => setPartnerName(e.target.value)} />
                    </FormGroup>
                    <FormGroup>
                        <Label>{t("Director Email")}</Label>
                        <Input placeholder={t("Director Email")} value={partnerEmail} onChange={e => setPartnerEmail(e.target.value)} />
                    </FormGroup>
                    <FormGroup>
                        <Label>{t("Director Designation")}</Label>
                        <Input placeholder={t("Director Designation")} value={partnerDesignation} onChange={e => setPartnerDesignation(e.target.value)} />
                    </FormGroup>
                </ModalBody>
                <ModalFooter>
                    <Button style={{
                        background: "linear-gradient(to right bottom, #e64067, #5926f0, #4828a0)",
                        border: "none",
                        outline: "none"
                    }}
                        disabled={updating || !partnerName || !partnerEmail || !partnerDesignation}
                        onClick={updatePartnerHandler}
                    >
                        {updating ? "Updating" : "Update"}
                    </Button>
                </ModalFooter>
            </Modal>


            <Modal isOpen={showDeleteModal} toggle={() => setShowDeleteModal(!showDeleteModal)}>
                <ModalHeader toggle={() => setShowDeleteModal(!showDeleteModal)}>
                    {t("Delete Director")}
                </ModalHeader>
                <ModalBody>
                    <p>{t("Are you sure, you want to remove")} {partner?.name} {t("as partner?")}</p>
                </ModalBody>
                <ModalFooter>
                    <Button style={{
                        background: "linear-gradient(to right bottom, #e64067, #5926f0, #4828a0)",
                        border: "none",
                        outline: "none"
                    }}
                        onClick={() => setShowDeleteModal(!showDeleteModal)}
                    >
                        {t("Cancel")}
                    </Button>
                    <Button style={{
                        background: "linear-gradient(to right bottom, #e64067, #5926f0, #4828a0)",
                        border: "none",
                        outline: "none"
                    }}
                        disabled={updating}
                        onClick={deletePartnerHandler}
                    >
                        {updating ? t("Deleting") : t("Delete")}
                    </Button>
                </ModalFooter>
            </Modal>
        </tr>
    )
}

export default KYBPartner




