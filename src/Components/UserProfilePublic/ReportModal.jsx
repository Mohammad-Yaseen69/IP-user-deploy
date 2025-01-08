import axios from 'axios'
import React, { useContext, useState } from 'react'
import { Button, Col, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap'
import { UserContext } from '../../Context/UserContext'
import { encryptData } from '../../Helper/EssentilaMethods/Encryption'
import { decryptData } from '../../Helper/EssentilaMethods/Decryption'

const ReportModal = ({ user, isOpen, toggle, setReported }) => {
    const [reason, setReason] = useState("")
    const [details, setDetails] = useState("")
    const [isReporting, setIsReporting] = useState(false)
    const { userDetails, authHeader } = useContext(UserContext)

    const reportHandler = () => {
        setIsReporting(true)
        const data = encryptData({
            note: details,
            reason
        })
        axios.post(`${process.env.REACT_APP_IP_DEV_API}/api/report/add-report/${userDetails?._id}/${user?._id}`, {
            data
        }, {
            headers: authHeader
        })
            .then(res => {
                const decrypted = decryptData(res.data.data)
                // console.log(decrypted)
                setIsReporting(false)
                setReported(true)
                toggle()
            })
            .catch(err => {
                const decrypted = decryptData(err.response.data.data)
                // console.log(decrypted)
                setIsReporting(false)
            })
    }

    return (
        <Modal isOpen={isOpen} toggle={toggle}>
            <ModalHeader toggle={toggle}>Report {user?.first_name} {user?.last_name}</ModalHeader>
            <ModalBody>
                <Col>
                    <Label>Reason</Label>
                    <Input type='select' value={reason} onChange={e => setReason(e.target.value)}>
                        <option value="" disabled>--Select-A-Reason--</option>
                        <option value="Fraudulent Acitivity">Fraudulent Acitivity</option>
                        <option value="Harrasment or Abuse">Harrasment or Abuse</option>
                        <option value="Scamming">Scamming</option>
                        <option value="Impersonation">Impersonation</option>
                        <option value="Rule Violation">Rule Violation</option>
                    </Input>
                </Col>
                <Col>
                    <Label>Note</Label>
                    <Input type='textarea' placeholder='Enter the report details' value={details} onChange={e => setDetails(e.target.value)} style={{
                        resize: "none",
                        height: "150px"
                    }} />
                </Col>
            </ModalBody>
            <ModalFooter>
                <Button
                    style={{
                        background: "linear-gradient(to right bottom, #e64067, #5926f0, #4828a0)",
                        border: "none",
                        outline: "none",
                        borderRadius: "10px"
                    }}
                    onClick={reportHandler}
                    disabled={!reason || !details || isReporting}
                >
                    {isReporting ? "Reporting" : "Report"}
                </Button>
            </ModalFooter>
        </Modal>
    )
}

export default ReportModal