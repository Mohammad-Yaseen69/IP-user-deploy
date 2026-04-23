import React, { useContext, useEffect, useMemo, useState } from 'react'
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
import VerificationPayment from './VerificationPayment'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { format } from 'date-fns'
import { isEmailValid } from '../../utils/Functions/validations'
import { apiWrapper } from '../../utils/Functions/apiWrapper'


function getFirstLargeFileName(files) {
    if (!files || files.length === 0) return false

    const limit = 20 * 1024 * 1024 // 20MB in bytes

    for (let i = 0; i < files.length; i++) {
        if (files[i].size > limit) {
            return files[i].name
        }
    }

    return false
}



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
    const { userDetails, authHeader, setUserDetails, verifyToken } = useContext(UserContext)
    const [isLoading, setIsLoading] = useState(false)
    const [registrationNum, setRegistrationNum] = useState("")
    const [taxId, setTaxId] = useState("")
    const [dateOfI, setDateOfI] = useState("")
    const [showPaymentModal, setShowPaymentModal] = useState(false)
    const [feeAmount, setFeeAmount] = useState("")
    const [partnerVerification, setPartnerVerification] = useState(null)

    // partners
    const [partners, setPartners] = useState([])

    const { mutateAsync } = useMutation({
        mutationFn: (payload) => getFeeAmount({ payload, authHeader }),
    })

    const { mutateAsync: processWithoutCharge } = useMutation({
        mutationFn: () => apiWrapper({
            endpoint: "/api/company/process-kyb-without-charge",
            method: "POST"
        }),
        onSuccess: (res) => {
            if (res.partnersProcessed) {
                toast.success("Your KYB status has been updated to Initiated, and Emails have been sent to all the directors.")
            } else {
                toast.info("Your KYB has been processed successfully.")
            }
            verifyToken(true)
        },
        onError: (error) => {
            const dec = decryptData(error?.response?.data?.data)
            toast.error(dec.message || "We are unable to process your request at the moment. please try again later!")
        }
    })

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
            if (userDetails?.company?.kyb_files?.length > 0) {
                setCompanyFiles(userDetails.company.kyb_files)
                setCompanyFileNames(userDetails?.company?.kyb_files?.map(f => f?.document_name))
                setTaxId(userDetails?.company?.tax_id)
                setRegistrationNum(userDetails?.company?.registration_number)
                if (userDetails?.company?.date_of_incorporation) {
                    const [day, month, year] = userDetails.company.date_of_incorporation.split("-")
                    setDateOfI(new Date(`${year}-${month}-${day}`))
                }
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
        if (userDetails?.company?.kyb_status === "verified" || userDetails?.company?.kyb_status === "approved") {
            toast.error("All actions are blocked as the business is verified.");
            return;
        }

        if (!isEmailValid(partnerEmail)) {
            toast.error("Please enter a valid email address.");
            return;
        }

        if (partners.find(p => p.email.toLowerCase() === partnerEmail.toLowerCase())) {
            toast.error("A director with this email already exists.");
            return;
        }

        setAdding(true)
        try {
            if (userDetails?.company?.kyb_files && userDetails?.company?.kyb_files?.length === 0) {
                setPartners(prev => [{
                    name: partnerName,
                    email: partnerEmail,
                    designation: partnerDesignation,
                }, ...prev])
                setPartnerName("")
                setPartnerEmail("")
                setPartnerDesignation("")
                setAdding(false)
                setShowAddModal(false)
            } else {
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
            }
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
        console.log(compnanyFiles
            .map((file, idx) => ({ file, name: compnanyFileNames[idx] })), compnanyFiles, compnanyFileNames)

        const editedEntries = compnanyFiles
            .map((file, idx) => ({ file, name: compnanyFileNames[idx] }))
            .filter(({ file }) => file && (file instanceof File || !('status' in file)))?.filter(entry => entry.name !== undefined);

        if (editedEntries?.length === 0) {
            const data = await mutateAsync({
                payment_type: "card"
            })
            if (data?.isPaymentRequired) {
                setFeeAmount(data?.base_fee_breakdown?.base_fee_usd)
                setShowPaymentModal(true);
            } else {
                await processWithoutCharge()
            }
            return;
        }

        const bigFile = getFirstLargeFileName(editedEntries?.map(item => item?.file?.file || item?.file))

        if (bigFile) {
            toast.error(`${bigFile} is larger then 20MB please select smaller file.`)
            return;
        }

        setIsUploading(true)
        try {
            const formdata = new FormData()

            console.log(editedEntries)

            formdata.append("account_id", userDetails?._id)
            formdata.append("business_type", companyType?._id)
            editedEntries.forEach(({ file }) => formdata.append('files', file?.file || file));
            editedEntries.forEach(({ name }, i) => formdata.append(`file_names[${i}]`, name));

            formdata.append("registration_number", registrationNum);
            formdata.append("tax_id", taxId);
            console.log(dateOfI)
            formdata.append(
                "date_of_incorporation",
                format(new Date(dateOfI), "dd-MM-yyyy")
            )
            console.log(compnanyFileNames?.filter(name => !compnanyFiles.find(f => f.document_name === name)))

            if (userDetails?.company?.kyb_files?.length === 0) {
                partners.filter(partner => !partner?._id).forEach((partner, index) => {
                    formdata.append(`partners[${index}]`, JSON.stringify(partner));
                });
            }

            const res = await axios.post(`${import.meta.env.VITE_IP_DEV_API}/api/company/upload-kyb-${userDetails?.company?.kyb_files?.length === 0 ? "information" : "files?delete_old=true"}`, formdata, {
                headers: authHeader
            })

            const decrypted = decryptData(res.data.data)
            setUserDetails(prev => ({ ...prev, company: decrypted?.results?.company }))
            const data = await mutateAsync({
                payment_type: "card"
            })
            if (data?.isPaymentRequired) {
                setFeeAmount(data?.base_fee_breakdown?.base_fee_usd)
                setShowPaymentModal(true);
            } else {
                await processWithoutCharge()
            }
            console.log(decrypted)
        } catch (error) {
            console.log(error)
            const dec = decryptData(error.response?.data?.data)
            const fileName = getFirstLargeFileName(editedEntries?.map(item => item?.file?.file || item?.file))
            toast.error(dec?.message?.toLowerCase()?.includes("big") ? `${fileName} is larger then 20MB please select smaller a smaller file.` : dec?.message)
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
            setDateOfI(date);
        } else {
            setDateOfI("");
        }
    };


    const requiredFilesLength = useMemo(() => {
        return companyType?.name?.toLowerCase()?.includes("ngos") ? 6 : companyType?.name?.toLowerCase()?.includes("sole") ? 3 : 5
    }, [companyType])

    const isReadOnly = useMemo(() => {
        return userDetails?.company?.kyb_status === "approved"
    }, [userDetails])

    console.log(partners)
    return (
        <Card>
            <CardHeader style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h4>{t("KYB Verification")}</h4>
                <div className="card-options" style={{ display: 'flex', gap: "10px", alignItems: "center" }}>
                    <Badge color={(userDetails?.company?.kyb_status === "verified" || userDetails?.company?.kyb_status === "approved") ? "success" : userDetails?.company?.kyb_status === "declined" ? "danger" : "warning"}>{userDetails?.company?.kyb_status?.toUpperCase()}</Badge>
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
                        }}
                            disabled={isReadOnly}
                            onClick={(e) => {
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
                    (userDetails?.company?.kyb_status !== "verified")
                    &&
                    <>
                        <h4 className='text-center'>{t(companyType?.name)}</h4>
                        {
                            companyType?.name?.toLowerCase()?.includes("private")
                            &&
                            <PrivateCompanyDocs setCompanyFiles={setCompanyFiles} setCompanyFileNames={setCompanyFileNames} checkFileStatus={checkFileStatus} isReadOnly={isReadOnly} />
                        }
                        {
                            companyType?.name?.toLowerCase()?.includes("publicly")
                            &&
                            <PubliclyTradedCompanyDocs setCompanyFiles={setCompanyFiles} setCompanyFileNames={setCompanyFileNames} checkFileStatus={checkFileStatus} isReadOnly={isReadOnly} />
                        }
                        {
                            companyType?.name?.toLowerCase()?.includes("ngos")
                            &&
                            <NgosDocs setCompanyFiles={setCompanyFiles} setCompanyFileNames={setCompanyFileNames} checkFileStatus={checkFileStatus} isReadOnly={isReadOnly} />
                        }
                        {
                            companyType?.name?.toLowerCase()?.includes("sole")
                            &&
                            <SoleTradedDocs setCompanyFiles={setCompanyFiles} setCompanyFileNames={setCompanyFileNames} checkFileStatus={checkFileStatus} isReadOnly={isReadOnly} />
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
                                disabled={isReadOnly}
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
                                disabled={isReadOnly}
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
                                clearable
                                autoOk
                                disabled={isReadOnly}
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
                                        background: isReadOnly ? "#e9ecef" : '#fff',
                                        border: 'none',
                                        boxShadow: 'none',
                                        padding: '0 10px',
                                        minHeight: '40px',
                                        fontWeight: 500,
                                    }
                                }}
                                inputProps={{
                                    style: {
                                        background: isReadOnly ? "#e9ecef" : '#fff',
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
                            <h4>{t("Directors")}</h4>
                            <Button style={{
                                background: "linear-gradient(to right bottom, #e64067, #5926f0, #4828a0)",
                                border: "none",
                                outline: "none"
                            }}
                                disabled={userDetails?.company?.kyb_status === "verified" || userDetails?.company?.kyb_status === "approved"}
                                onClick={() => setShowAddModal(!showAddModal)}>{t("Add New Director")}</Button>
                            <Modal isOpen={showAddModal} toggle={() => setShowAddModal(!showAddModal)}>
                                <ModalHeader toggle={() => setShowAddModal(!showAddModal)}>
                                    {t("Add New Director")}
                                </ModalHeader>
                                <ModalBody>
                                    <FormGroup>
                                        <Label>{t("Director Name")}</Label>
                                        <Input placeholder={t("Director Name")} value={partnerName} onChange={e => setPartnerName(e.target.value)} />
                                    </FormGroup>
                                    <FormGroup>
                                        <Label>{t("Director Email")}</Label>
                                        <Input type='email' placeholder="Director Email" value={partnerEmail} onChange={e => setPartnerEmail(e.target.value)} />
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
                                        disabled={adding || !partnerName || !partnerEmail || !partnerDesignation}
                                        onClick={addPartnerHandler}
                                    >
                                        {adding ? t("Adding") : t("Add Now")}
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
                                                <td>{t("Name")}</td>
                                                <td>{t("Email")}</td>
                                                <td>{t("Designation")}</td>
                                                <td>{t("Actions")}</td>
                                                <td>{t("Status")}</td>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {
                                                partners?.map((item, index) => (
                                                    <KYBPartner setPartnerVerification={setPartnerVerification} setModalOpen={setShowPaymentModal} key={item?._id} partner={item} partners={partners} setPartners={setPartners} index={index} />
                                                ))
                                            }
                                        </tbody>
                                    </Table>
                                </CardBody>
                        }
                    </Card>
                }
                {
                    companyType && (!userDetails?.kyb_verification_paid || userDetails?.company?.kyb_status === "declined") &&
                    <Button
                        style={{
                            background: "linear-gradient(to right bottom, #e64067, #5926f0, #4828a0)",
                            border: "none",
                            outline: "none",
                            alignSelf: "flex-end "
                        }}
                        disabled={isReadOnly || isUploading || compnanyFiles?.length === 0 || partners?.length === 0 || !taxId || !dateOfI || !registrationNum || compnanyFileNames.length < requiredFilesLength}
                        onClick={uploadKybFiles}
                    >{t("Submit")}</Button>
                }

                {showPaymentModal &&
                    <VerificationPayment
                        isOpen={showPaymentModal}
                        toggle={() => {
                            setShowPaymentModal(false)
                            setPartnerVerification(null)
                        }}
                        isKYB={true}
                        amount={feeAmount}
                        partnerId={partnerVerification?._id}
                        getFeeDetails={mutateAsync}
                    />
                }
            </CardBody>
        </Card>
    )
}

export default KYB