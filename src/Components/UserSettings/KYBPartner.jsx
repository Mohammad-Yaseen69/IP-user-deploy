import { useContext, useEffect, useState } from "react"
import { ModalFooter } from "react-bootstrap"
import { CheckCircle, Edit, File, RefreshCw, Trash2 } from "react-feather"
import { Button, FormGroup, Input, Label, Modal, ModalBody, ModalHeader } from "reactstrap"
import { UserContext } from "../../Context/UserContext"
import { encryptData } from "../../Helper/EssentilaMethods/Encryption"
import axios from "axios"
import { decryptData } from "../../Helper/EssentilaMethods/Decryption"
import UploadAdditionalKYB from "./UploadAdditionalKYB"

const KYBPartner = ({ partner, partners, setPartners, index }) => {

    const [showEditModal, setShowEditModal] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [updating, setUpdating] = useState(false)
    const { authHeader, userDetails, checkAuth } = useContext(UserContext)
    const [partnerName, setPartnerName] = useState(partner?.name)
    const [partnerEmail, setPartnerEmail] = useState(partner?.email)
    const [partnerDesignation, setPartnerDesignation] = useState(partner?.designation)
    const [emailSent, setEmailSent] = useState(false)
    const [showAdditionalModal, setShowAdditionalModal] = useState(false)

    const updatePartnerHandler = async () => {
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
            const response = await axios.post(`${process.env.REACT_APP_IP_DEV_API}/api/company/edit-partner`, {
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
        setUpdating(true)
        try {
            const response = await axios.delete(`${process.env.REACT_APP_IP_DEV_API}/api/company/delete-partner/${userDetails?._id}/${partner?._id}`, {
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
        setUpdating(true)
        try {

            const payload = {
                partner_name: partnerName,
                email: partnerEmail
            }
            const encrypted = encryptData(payload)
            // console.log(encrypted)
            const response = await axios.post(`${process.env.REACT_APP_IP_DEV_API}/api/company/verification/partner_${partner?._id}`, {
                data: encrypted
            }, {
                headers: authHeader
            })
            const data = await decryptData(response.data.data)
            // console.log(data)
            setUpdating(false)
            setEmailSent(true)
            setTimeout(() => {
                setEmailSent(false)
            }, 3000)
        } catch (error) {
            // console.log(error)
            // console.log(decryptData(error?.response?.data?.data))
            setUpdating(false)
        }
    }

    // requested partner files
    const [partnerFiles, setPartnerFiles] = useState([])

    useEffect(() => {
        setPartnerFiles(partner?.kyb_additional_file)
    }, [partners, partner])

    return (
        <tr>
            <td>{partner?.name}</td>
            <td>{partner?.email}</td>
            <td>{partner?.designation}</td>
            <td style={{ display: "flex", gap: ".75rem" }}>
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
                            <RefreshCw size={15} />
                        </Button>
                }
                {
                    partnerFiles?.length > 0 && partnerFiles?.some(item => item?.status === "requested")
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
                            {partnerFiles.length}
                        </div>
                    </Button>
                }
            </td>
            {
                partnerFiles.length > 0
                &&
                <UploadAdditionalKYB files={partnerFiles} isOpen={showAdditionalModal} toggle={() => setShowAdditionalModal(!showAdditionalModal)} user_id={userDetails?._id} type="partner" partner_id={partner?._id} />
            }

            {/* edit modal */}
            <Modal isOpen={showEditModal} toggle={() => setShowEditModal(!showEditModal)}>
                <ModalHeader toggle={() => setShowEditModal(!showEditModal)}>
                    Edit Partner
                </ModalHeader>
                <ModalBody>
                    <FormGroup>
                        <Label>Partner Name</Label>
                        <Input placeholder="Partner Name" value={partnerName} onChange={e => setPartnerName(e.target.value)} />
                    </FormGroup>
                    <FormGroup>
                        <Label>Partner Email</Label>
                        <Input placeholder="Partner Email" value={partnerEmail} onChange={e => setPartnerEmail(e.target.value)} />
                    </FormGroup>
                    <FormGroup>
                        <Label>Partner Designation</Label>
                        <Input placeholder="Partner Designation" value={partnerDesignation} onChange={e => setPartnerDesignation(e.target.value)} />
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


            {/* delete modal */}
            <Modal isOpen={showDeleteModal} toggle={() => setShowDeleteModal(!showDeleteModal)}>
                <ModalHeader toggle={() => setShowDeleteModal(!showDeleteModal)}>
                    Delete Partner
                </ModalHeader>
                <ModalBody>
                    <p>Are you sure, you want to remove {partner?.name} as partner?</p>
                </ModalBody>
                <ModalFooter>
                    <Button style={{
                        background: "linear-gradient(to right bottom, #e64067, #5926f0, #4828a0)",
                        border: "none",
                        outline: "none"
                    }}
                        onClick={() => setShowDeleteModal(!showDeleteModal)}
                    >
                        Cancel
                    </Button>
                    <Button style={{
                        background: "linear-gradient(to right bottom, #e64067, #5926f0, #4828a0)",
                        border: "none",
                        outline: "none"
                    }}
                        disabled={updating}
                        onClick={deletePartnerHandler}
                    >
                        {updating ? "Deleting" : "Delete"}
                    </Button>
                </ModalFooter>
            </Modal>
        </tr>
    )
}

export default KYBPartner