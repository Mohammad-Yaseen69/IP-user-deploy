import React, { useContext, useEffect, useState } from 'react'
import { Button, Card, CardBody, CardHeader, FormGroup, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader, Table } from 'reactstrap'
import { H4 } from '../../AbstractElements'
import { ChevronDown, ChevronUp } from 'react-feather'
import { useTranslation } from 'react-i18next'
import { UserContext } from '../../Context/UserContext'
import axios from 'axios'
import { decryptData } from '../../Helper/EssentilaMethods/Decryption'
import InstaPayLoader from '../Loader'
import AddKYBPartner from './AddKYBPartner'
import KYBPartner from './KYBPartner'
import { encryptData } from '../../Helper/EssentilaMethods/Encryption'
import PrivateCompanyDocs from './PrivateCompanyDocs'
import PubliclyTradedCompanyDocs from './PubliclyTradedCompanyDocs'
import NgosDocs from './NgosDocs'
import SoleTradedDocs from './SoleTradedDocs'
import UploadAdditionalKYB from './UploadAdditionalKYB'


const KYB = ({ isCollapsed, setIsCollapsed }) => {
    const { t } = useTranslation()
    const { userDetails, authHeader } = useContext(UserContext)
    const [isLoading, setIsLoading] = useState(false)

    const toggleAccordion = () => {
        setIsCollapsed(isCollapsed ? "business" : "");
    };


    // partners
    const [partners, setPartners] = useState([])

    useEffect(() => {
        let isMounted = true;

        const getCompanyPartners = async () => {
            setIsLoading(true);
            try {
                const response = await axios.get(`${process.env.REACT_APP_IP_DEV_API}/api/company/get-partners/${userDetails?._id}`, {
                    cancelToken: new axios.CancelToken((c) => (cancelRequest = c)),
                });

                const data = await decryptData(response.data.data);
                if (isMounted) {
                    // console.log(data);
                    setPartners(data?.partners)
                    setIsLoading(false);
                }
            } catch (error) {
                if (isMounted) {
                    console.error('Error fetching company partners:', decryptData(error.response?.data?.data) || error.message);
                    setIsLoading(false);
                }
            }
        };

        let cancelRequest;

        if (userDetails?._id && userDetails?.account_type === 'business') {
            getCompanyPartners();
        }

        return () => {
            isMounted = false;
            if (cancelRequest) {
                cancelRequest('Request canceled due to component unmount');
            }
        };
    }, [userDetails]);


    // add states
    const [adding, setAdding] = useState(false)
    const [showAddModal, setShowAddModal] = useState(false)
    const [partnerName, setPartnerName] = useState("")
    const [partnerEmail, setPartnerEmail] = useState("")
    const [partnerDesignation, setPartnerDesignation] = useState("")
    const [showAdditionalModal, setShowAdditionalModal] = useState(false)

    const addPartnerHandler = async () => {
        setAdding(true)
        try {
            const payload = {
                name: partnerName,
                email: partnerEmail,
                designation: partnerDesignation,
                account_id: userDetails?._id
            }
            const encrypted = encryptData(payload)
            const response = await axios.post(`${process.env.REACT_APP_IP_DEV_API}/api/company/add-partner`, {
                data: encrypted
            }, {
                headers: authHeader
            })
            const data = await decryptData(response.data.data)
            setAdding(false)
            setShowAddModal(false)
            setPartners(prev => [data.partner, ...prev])
            // console.log(data)

            setPartnerName("")
            setPartnerEmail("")
            setPartnerDesignation("")
        } catch (error) {
            setAdding(false)
            // console.log(decryptData(error?.response?.data?.data))
        }
    }

    // company typs
    const company_types = [
        'Private Limited Companies or equivalent',
        'Publicly Listed Companies',
        'Association / NGOs / Charities',
        'Sole Proprietorships',
    ];

    const [companyType, setCompanyType] = useState("")


    return (
        <Card id='business'>
            <CardHeader className={`pb-0 ${isCollapsed ? 'collapsed' : 'expanded'}`} onClick={toggleAccordion}>
                <H4 attrH4={{ className: 'card-title mb-0' }}>{t("KYB Verification")}</H4>
                <div className="card-options" style={{ display: 'flex', gap: "10px", alignItems: "center" }}>
                    {
                        userDetails?.company?.kyb_additional_file?.some(item => item?.status === "requested")
                        &&
                        <Button style={{
                            background: "linear-gradient(to right bottom, #e64067, #5926f0, #4828a0)",
                            border: "none",
                            outline: "none",
                            padding: "5px 10px",
                            fontSize: ".7rem",
                            borderRadius: "5px"
                        }} onClick={(e) => {
                            e.stopPropagation()
                            setShowAdditionalModal(!showAdditionalModal)
                        }}>Additional Files</Button>
                    }
                    {isCollapsed ? <ChevronDown /> : <ChevronUp />}
                </div>
                {/* additional files modal */}
            </CardHeader>
            {
                userDetails?.company?.kyb_additional_file
                &&
                <UploadAdditionalKYB files={userDetails?.company?.kyb_additional_file} isOpen={showAdditionalModal} toggle={() => setShowAdditionalModal(!showAdditionalModal)} user_id={userDetails?._id} />
            }
            <div className={`accordion-body ${isCollapsed ? 'collapsed' : 'expanded'}`}>
                <CardBody>
                    <Input type='select' value={companyType} onChange={e => setCompanyType(e.target.value)}>
                        <option value={""} disabled>--Select-Your-Company-Type--</option>
                        {
                            company_types.map(item => (
                                <option value={item} key={item}>{item}</option>
                            ))
                        }
                    </Input>
                    {
                        companyType.toLowerCase().includes("private")
                        &&
                        <PrivateCompanyDocs />
                    }
                    {
                        companyType.toLowerCase().includes("publicly")
                        &&
                        <PubliclyTradedCompanyDocs />
                    }
                    {
                        companyType.toLowerCase().includes("ngos")
                        &&
                        <NgosDocs />
                    }
                    {
                        companyType.toLowerCase().includes("sole")
                        &&
                        <SoleTradedDocs />
                    }
                    {
                        companyType
                        &&
                        <Card style={{ marginTop: "1.5rem" }}>
                            <CardHeader style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <h4>Partners</h4>
                                <Button style={{
                                    background: "linear-gradient(to right bottom, #e64067, #5926f0, #4828a0)",
                                    border: "none",
                                    outline: "none"
                                }} onClick={() => setShowAddModal(!showAddModal)}>Add New Partner</Button>
                                <Modal isOpen={showAddModal} toggle={() => setShowAddModal(!showAddModal)}>
                                    <ModalHeader toggle={() => setShowAddModal(!showAddModal)}>
                                        Add New Partner
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
                                            <Input placeholder="Partner Email" value={partnerDesignation} onChange={e => setPartnerDesignation(e.target.value)} />
                                        </FormGroup>
                                    </ModalBody>
                                    <ModalFooter>
                                        <Button style={{
                                            background: "linear-gradient(to right bottom, #e64067, #5926f0, #4828a0)",
                                            border: "none",
                                            outline: "none"
                                        }}
                                            disabled={adding || !partnerName || !partnerEmail || !partnerDesignation}
                                            onClick={addPartnerHandler}
                                        >
                                            {adding ? "Adding" : "Add Now"}
                                        </Button>
                                    </ModalFooter>
                                </Modal>
                            </CardHeader>
                            {
                                isLoading
                                    ?
                                    <div style={{ height: "200px", width: "200px", margin: "0 auto" }}>
                                        <InstaPayLoader />
                                    </div>
                                    :
                                    <CardBody>
                                        <Table>
                                            <thead>
                                                <tr>
                                                    <td>Name</td>
                                                    <td>Email</td>
                                                    <td>Designation</td>
                                                    <td>Actions</td>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {
                                                    partners?.map((item, index) => (
                                                        <KYBPartner key={item?._id} partner={item} partners={partners} setPartners={setPartners} index={index} />
                                                    ))
                                                }
                                            </tbody>
                                        </Table>
                                    </CardBody>
                            }
                        </Card>
                    }
                </CardBody>
            </div>
        </Card>
    )
}

export default KYB