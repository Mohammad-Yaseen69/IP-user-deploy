import React, { useContext, useEffect, useState } from 'react'
import { Badge, Button, Card, CardBody, CardHeader, FormGroup, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader, Table } from 'reactstrap'
import { useTranslation } from 'react-i18next'
import { UserContext } from '../../Context/UserContext'
import axios from 'axios'
import { decryptData } from '../../Helper/EssentilaMethods/Decryption'
import InstaPayLoader from '../Loader'
import KYBPartner from './KYBPartner'
import { encryptData } from '../../Helper/EssentilaMethods/Encryption'
import PrivateCompanyDocs from './PrivateCompanyDocs'
import PubliclyTradedCompanyDocs from './PubliclyTradedCompanyDocs'
import NgosDocs from './NgosDocs'
import SoleTradedDocs from './SoleTradedDocs'
import UploadAdditionalKYB from './UploadAdditionalKYB'
import { DatePicker } from '@material-ui/pickers'
import { toast } from 'react-toastify'
import VerificationPayment from './VerificationPayment'
import { useMutation } from '@tanstack/react-query'


const getFeeAmount = async ({ payload, authHeader }) => {
    const enc = encryptData(payload)
    const res = await axios.post(`${import.meta.env.VITE_IP_DEV_API}/api/company/kyb-fee`, {
        data: enc
    }, { headers: authHeader })

    const dec = decryptData(res.data.data)

    return dec
}

const KYB = () => {
    const { t } = useTranslation()
    const { userDetails, authHeader } = useContext(UserContext)
    const { mutateAsync } = useMutation({
        mutationFn: (payload) => getFeeAmount({ payload, authHeader }),
    })
    const [isLoading, setIsLoading] = useState(false)
    const [registrationNum, setRegistrationNum] = useState("")
    const [taxId, setTaxId] = useState("")
    const [dateOfI, setDateOfI] = useState("")
    const [showPaymentModal, setShowPaymentModal] = useState(false)
    const [feeAmount, setFeeAmount] = useState("")

    // partners
    const [partners, setPartners] = useState([])

    useEffect(() => {
        let isMounted = true;

        const getCompanyPartners = async () => {
            setIsLoading(true);
            try {
                const response = await axios.get(`${import.meta.env.VITE_IP_DEV_API}/api/company/get-partners/${userDetails?._id}`, {
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

    useEffect(() => {
        if (!userDetails?.kyb_verification_paid) {
            (async () => {
                const data = await mutateAsync({
                    payment_type: "card"
                })

                setFeeAmount(data?.base_fee_breakdown?.base_fee_usd)
            })()
            if (userDetails?.company?.kyb_files?.length > 0) {
                setCompanyFiles(userDetails.company.kyb_files)
                setCompanyFileNames(userDetails?.company?.kyb_files?.map(f => f?.document_name))
                setDateOfI(userDetails?.company?.date_of_incorporation)
                setTaxId(userDetails?.company?.tax_id)
                setRegistrationNum(userDetails?.company?.registration_number)
            }
        }
    }, [userDetails])

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
            const response = await axios.post(`${import.meta.env.VITE_IP_DEV_API}/api/company/add-partner`, {
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

    const [companyType, setCompanyType] = useState("")
    const [compnanyFiles, setCompanyFiles] = useState([])
    const [compnanyFileNames, setCompanyFileNames] = useState([])
    const [isUploading, setIsUploading] = useState(false)

    useEffect(() => {
        if (userDetails?.category?._id) {
            setCompanyType(userDetails?.category)
        }
    }, [userDetails])

    const uploadKybFiles = async () => {
        setIsUploading(true)
        try {
            console.log(compnanyFiles
                .map((file, idx) => ({ file, name: compnanyFileNames[idx] })), compnanyFiles, compnanyFileNames)

            const editedEntries = compnanyFiles
                .map((file, idx) => ({ file, name: compnanyFileNames[idx] }))
                .filter(({ file }) => file && (file instanceof File || !('status' in file)));

            if (editedEntries.length === 0) {
                setShowPaymentModal(true);
                return;
            }
            const formdata = new FormData()

            console.log(editedEntries)

            formdata.append("account_id", userDetails?._id)
            formdata.append("business_type", companyType?._id)
            editedEntries.forEach(({ file }) => formdata.append('files', file));
            editedEntries.forEach(({ name }, i) => formdata.append(`file_names[${i}]`, name));

            formdata.append("registration_number", registrationNum);
            formdata.append("tax_id", taxId);
            formdata.append("date_of_incorporation", dateOfI);
            console.log(compnanyFileNames?.filter(name => !compnanyFiles.find(f => f.document_name === name)))

            if (userDetails?.company?.kyb_files?.length === 0) {
                partners.forEach((partner, index) => {
                    formdata.append(`partners[${index}]`, JSON.stringify(partner));
                });
            }

            const res = await axios.post(`${import.meta.env.VITE_IP_DEV_API}/api/company/upload-kyb-${userDetails?.company?.kyb_files?.length === 0 ? "information" : "files?delete_old=true"}`, formdata, {
                headers: authHeader
            })

            const decrypted = decryptData(res.data.data)
            setShowPaymentModal(true)
            console.log(decrypted)
        } catch (error) {
            // console.log(decryptData(error?.response?.data?.data))
        } finally {
            setIsUploading(false)
        }
    }


    const checkFileStatus = (fileName = "") => {
        const isFileUploaded = userDetails?.company?.kyb_files?.filter(it => it?.document_name.toLowerCase().includes(fileName.toLowerCase()))
        return isFileUploaded?.[0]
    }


    const handleDateChange = (date) => {
        if (date) {
            setDateOfI(date.format("DD-MM-YYYY"));
        } else {
            setDateOfI("");
        }
    };

    return (
        <Card>
            <CardHeader style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h4>{t("KYB Verification")}</h4>
                <div className="card-options" style={{ display: 'flex', gap: "10px", alignItems: "center" }}>
                    <Badge color={userDetails?.company?.kyb_status === "verified" ? "success" : userDetails?.company?.kyb_status === "declined" ? "danger" : "warning"}>{userDetails?.company?.kyb_status?.toUpperCase()}</Badge>
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
                </div>
            </CardHeader>
            {
                userDetails?.company?.kyb_additional_file
                &&
                <UploadAdditionalKYB files={userDetails?.company?.kyb_additional_file} isOpen={showAdditionalModal} toggle={() => setShowAdditionalModal(!showAdditionalModal)} user_id={userDetails?._id} />
            }
            <CardBody style={{ display: "flex", flexDirection: "column" }}>
                {
                    userDetails?.company?.kyb_status !== "verified"
                    &&
                    <>
                        <h4 className='text-center'>{companyType?.name}</h4>
                        {
                            companyType?.name?.toLowerCase()?.includes("private")
                            &&
                            <PrivateCompanyDocs setCompanyFiles={setCompanyFiles} setCompanyFileNames={setCompanyFileNames} checkFileStatus={checkFileStatus} />
                        }
                        {
                            companyType?.name?.toLowerCase()?.includes("publicly")
                            &&
                            <PubliclyTradedCompanyDocs setCompanyFiles={setCompanyFiles} setCompanyFileNames={setCompanyFileNames} checkFileStatus={checkFileStatus} />
                        }
                        {
                            companyType?.name?.toLowerCase()?.includes("ngos")
                            &&
                            <NgosDocs setCompanyFiles={setCompanyFiles} setCompanyFileNames={setCompanyFileNames} checkFileStatus={checkFileStatus} />
                        }
                        {
                            companyType?.name?.toLowerCase()?.includes("sole")
                            &&
                            <SoleTradedDocs setCompanyFiles={setCompanyFiles} setCompanyFileNames={setCompanyFileNames} checkFileStatus={checkFileStatus} />
                        }



                        <FormGroup>
                            <Label>
                                {t("Registration Number")} <span style={{ color: "red", fontWeight: 600 }}>*</span> 
                            </Label>
                            <Input
                                type='text'
                                name="Registration Number"
                                value={registrationNum}
                                onChange={e => setRegistrationNum(e.target.value)}
                            />
                        </FormGroup>
                        <FormGroup>
                            <Label>
                                {t("Taxation Id")} <span style={{ color: "red", fontWeight: 600 }}>*</span>
                            </Label>
                            <Input
                                type='text'
                                name="Taxation Id"
                                value={taxId}
                                onChange={e => setTaxId(e.target.value)}
                            />
                        </FormGroup>
                        <FormGroup>
                            <Label>
                                {t("Date of Incorporation")} <span style={{ color: "red", fontWeight: 600 }}>*</span>
                            </Label>
                            <DatePicker
                                value={dateOfI || null}
                                onChange={handleDateChange}
                                format="DD/MM/YYYY"
                                className="form-control custom-datepicker"
                                placeholder="DD/MM/YYYY"
                                clearable
                                autoOk
                                style={{
                                    background: "#fff",
                                    border: "1px solid #e9e9e9",
                                    borderRadius: "6px",
                                    boxShadow: "none",
                                    padding: "0px",
                                    display: 'flex',
                                    justifyContent: "center",
                                    position: "static"
                                }}
                                InputProps={{
                                    disableUnderline: true,
                                    style: {
                                        background: userDetails?.company?.kyb_status === "verified" ? "#e9ecef" : '#fff',
                                        border: 'none',
                                        boxShadow: 'none',
                                        padding: '0 10px',
                                        minHeight: '40px',
                                        fontWeight: 500,
                                    }
                                }}
                                inputProps={{
                                    style: {
                                        background: userDetails?.company?.kyb_status === "verified" ? "#e9ecef" : '#fff',
                                        border: 'none',
                                        boxShadow: 'none',
                                        padding: '2px 0px',
                                        minHeight: '40px',
                                    }
                                }}
                            />
                        </FormGroup>

                    </>
                }
                {
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
                                <CardBody style={{ overflowX: "auto" }}>
                                    <Table responsive>
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
                {
                    companyType && !userDetails?.kyb_verification_paid &&
                    <Button
                        style={{
                            background: "linear-gradient(to right bottom, #e64067, #5926f0, #4828a0)",
                            border: "none",
                            outline: "none",
                            alignSelf: "flex-end "
                        }}
                        disabled={isUploading || compnanyFiles.length === 0 || partners?.length === 0 || !taxId || !dateOfI || !registrationNum}
                        onClick={uploadKybFiles}
                    >{t("Submit")}</Button>
                }

                {showPaymentModal &&
                    <VerificationPayment
                        isOpen={showPaymentModal}
                        toggle={() => setShowPaymentModal(false)}
                        isKYB={true}
                        amount={feeAmount}
                        getFeeDetails={mutateAsync}
                    />
                }
            </CardBody>
        </Card>
    )
}

export default KYB