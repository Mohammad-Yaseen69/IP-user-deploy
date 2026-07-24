import { DatePicker } from '@material-ui/pickers'
import { useMutation } from '@tanstack/react-query'
import axios from 'axios'
import { format } from 'date-fns'
import { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { CheckCircle, XCircle } from 'react-feather'
import { useTranslation } from 'react-i18next'
import { AiOutlineClockCircle } from 'react-icons/ai'
import { useLocation } from 'react-router'
import { toast } from 'react-toastify'
import { Badge, Button, Card, CardBody, CardHeader, FormGroup, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader, Table } from 'reactstrap'
import { UserContext } from '../../Context/UserContext'
import { decryptData } from '../../Helper/EssentilaMethods/Decryption'
import { encryptData } from '../../Helper/EssentilaMethods/Encryption'
import { apiWrapper } from '../../utils/Functions/apiWrapper'
import bvnkIndustryReference from '../../utils/Data/bvnkIndustryReference.json'
import { isEmailValid } from '../../utils/Functions/validations'
import errors from "../AddFunds/TrustPaymentErrors.json"
import InstaPayLoader from '../Loader'
import KYBPartner from './KYBPartner'
import NgosDocs from './NgosDocs'
import PrivateCompanyDocs from './PrivateCompanyDocs'
import PubliclyTradedCompanyDocs from './PubliclyTradedCompanyDocs'
import SoleTradedDocs from './SoleTradedDocs'
import VerificationPayment from './VerificationPayment'
import { usePermission } from '../../hooks/GeneralUse/usePermission'
import AdditionalFilesSection from './AdditionalFilesSection'

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


const KYB_ACTION_BLOCKED_STATUSES = ["verified", "approved", "needs-review", "needs_review"]

const isKybActionBlocked = (status) => KYB_ACTION_BLOCKED_STATUSES.includes(status)

const getIndustryPayload = (industry) => ({
    name: industry?.name,
    productionReference: industry?.productionReference,
    sandboxReference: industry?.sandboxReference || industry?.stagingReference,
})

const parseIndustryReference = (industryReference) => {
    if (!industryReference) return null

    if (typeof industryReference === "string") {
        try {
            return JSON.parse(industryReference)
        } catch {
            return null
        }
    }

    return industryReference
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
    const [adding, setAdding] = useState(false)
    const [showAddModal, setShowAddModal] = useState(false)
    const [partnerName, setPartnerName] = useState("")
    const [partnerEmail, setPartnerEmail] = useState("")
    const [partnerDesignation, setPartnerDesignation] = useState("")
    const [showAdditionalModal, setShowAdditionalModal] = useState(false)
    const [showProcessSuccessModal, setShowProcessSuccessModal] = useState(false)
    const [partners, setPartners] = useState([])
    const [companyType, setCompanyType] = useState("")
    const [industryReference, setIndustryReference] = useState(null)
    const [compnanyFiles, setCompanyFiles] = useState([])
    const [compnanyFileNames, setCompanyFileNames] = useState([])
    const [isUploading, setIsUploading] = useState(false)



    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const status = queryParams.get("status");
    const code = queryParams.get("code");
    const scroll = queryParams.get("scroll");
    const isModalOpen = !!status;

    useEffect(() => {
        if (scroll === "additional-files") {
            setTimeout(() => {
                const element = document.getElementById("additional-files-section");
                if (element) {
                    element.scrollIntoView({ behavior: "smooth", block: "start" });
                }
            }, 800);
        }
    }, [scroll, userDetails]);
    const { mutateAsync, isPending } = useMutation({
        mutationFn: (payload) => getFeeAmount({ payload, authHeader }),
    })

    const { mutateAsync: processWithoutCharge } = useMutation({
        mutationFn: () => apiWrapper({
            endpoint: "/api/company/process-kyb-without-charge",
            method: "POST"
        }),
        onSuccess: (res) => {
            setShowProcessSuccessModal(true)
            verifyToken(true)
        },
        onError: (error) => {
            const dec = decryptData(error?.response?.data?.data)
            toast.error(dec.message || "We are unable to process your request at the moment. please try again later!")
        }
    })

    const refreshPartners = useCallback(async ({ showLoader = false } = {}) => {
        if (!userDetails?._id || userDetails?.account_type !== 'business') return

        if (showLoader) setIsLoading(true)
        try {
            const response = await axios.get(`${import.meta.env.VITE_IP_DEV_API}/api/company/get-partners/${userDetails?._id}`)
            const data = await decryptData(response.data.data)
            setPartners(data?.partners || [])
        } catch (error) {
            console.error('Error fetching company partners:', decryptData(error.response?.data?.data) || error.message)
        } finally {
            if (showLoader) setIsLoading(false)
        }
    }, [userDetails?._id, userDetails?.account_type])

    useEffect(() => {
        refreshPartners({ showLoader: true })
    }, [refreshPartners])

    useEffect(() => {
        if (userDetails?.company) {
            const { tax_id, registration_number, date_of_incorporation, kyb_files } = userDetails.company;

            if (tax_id && !taxId) {
                setTaxId(tax_id);
            }
            if (registration_number && !registrationNum) {
                setRegistrationNum(registration_number);
            }
            if (date_of_incorporation && !dateOfI) {
                const parts = date_of_incorporation.split("-");
                if (parts.length === 3) {
                    const [day, month, year] = parts;
                    setDateOfI(new Date(`${year}-${month}-${day}`));
                }
            }

            if (kyb_files?.length > 0 && compnanyFiles.length === 0) {
                setCompanyFiles(kyb_files);
                setCompanyFileNames(kyb_files.map(f => f?.document_name));
            }

            const savedIndustryReference = parseIndustryReference(userDetails.company.industryReference || userDetails.company.industry_reference);
            if (savedIndustryReference && !industryReference) {
                setIndustryReference(savedIndustryReference);
            }
        }
    }, [userDetails])

    const addPartnerHandler = async () => {
        if (isKybActionBlocked(userDetails?.company?.kyb_status)) {
            toast.error("No action is allowed for the current business verification status.");
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
                const paymentAllowed = !userDetails?.kyb_verification_paid || userDetails?.company?.kyb_status === "declined"

                const payload = {
                    name: partnerName,
                    email: partnerEmail,
                    designation: partnerDesignation,
                    account_id: userDetails?._id,
                }

                if (!paymentAllowed) {
                    payload.addedIndividually = true
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

    useEffect(() => {
        if (userDetails?.category?._id) {
            setCompanyType(userDetails?.category)
        }
    }, [userDetails])

    const uploadKybFiles = async () => {
        if (isKybActionBlocked(userDetails?.company?.kyb_status)) {
            toast.error("No action is allowed for the current business verification status.");
            return;
        }

        const allowPayment = !userDetails?.kyb_verification_paid || userDetails?.company?.kyb_status === "declined"

        console.log(compnanyFiles
            .map((file, idx) => ({ file, name: compnanyFileNames[idx] })), compnanyFiles, compnanyFileNames)

        const editedEntries = compnanyFiles
            .map((file, idx) => ({ file, name: compnanyFileNames[idx] }))
            .filter(({ file }) => file && (file instanceof File || !('status' in file)))?.filter(entry => entry.name !== undefined);

        // if (editedEntries?.length === 0 && allowPayment) {
        //     const data = await mutateAsync({
        //         payment_type: "card"
        //     })
        //     if (data?.isPaymentRequired) {
        //         setFeeAmount(data?.base_fee_breakdown?.base_fee_usd)
        //         setShowPaymentModal(true);
        //     } else {
        //         await processWithoutCharge()
        //     }
        //     return;
        // }

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
            formdata.append("industryReference", JSON.stringify(industryReference));
            
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


            if (allowPayment) {
                const data = await mutateAsync({
                    payment_type: "card"
                })
                if (data?.isPaymentRequired) {
                    setFeeAmount(data?.base_fee_breakdown?.base_fee_usd)
                    setShowPaymentModal(true);
                } else {
                    await processWithoutCharge()
                }
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
    const handleCloseAndRefresh = () => {
        window.location.href = "/settings?tab=verification";
    };

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

    const industryOptions = useMemo(() => {
        return bvnkIndustryReference.map(group => ({
            name: group.name,
            children: (group.children || []).map(child => getIndustryPayload(child)),
        }))
    }, [])

    const selectedIndustryValue = useMemo(() => {
        if (!industryReference) return ""

        const selected = industryOptions
            .flatMap(group => group.children)
            .find(industry => (
                industry.productionReference === industryReference.productionReference ||
                industry.sandboxReference === industryReference.sandboxReference ||
                industry.name === industryReference.name
            ))

        return selected?.productionReference || ""
    }, [industryOptions, industryReference])

    const handleIndustryChange = (event) => {
        const selected = industryOptions
            .flatMap(group => group.children)
            .find(industry => industry.productionReference === event.target.value)

        setIndustryReference(selected || null)
    }

    const isReadOnly = useMemo(() => {
        return isKybActionBlocked(userDetails?.company?.kyb_status)
    }, [userDetails])
    const error_message = () => {
        return errors.find(item => item?.code == code)?.message ?? "We cannot process your request at the moment, please try again later."
    }

    const can = usePermission()
    const isEdit = can("settings.business-verification.update")
    console.log(partners)
    return (
        <Card>
            <CardHeader style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h4>{t("KYB Verification")}</h4>
                <div className="card-options" style={{ display: 'flex', gap: "10px", alignItems: "center" }}>
                    <Badge color={(userDetails?.company?.kyb_status === "verified" || userDetails?.company?.kyb_status === "approved") ? "success" : userDetails?.company?.kyb_status === "declined" ? "danger" : "warning"}>{userDetails?.company?.kyb_status?.toUpperCase()}</Badge>
                </div>
            </CardHeader>
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
                                {t("Industry")} <span style={{ color: "red", fontWeight: 600 }}>*</span>
                            </Label>
                            <Input
                                type="select"
                                name="Industry"
                                value={selectedIndustryValue}
                                onChange={handleIndustryChange}
                                disabled={isReadOnly}
                            >
                                <option value="" disabled>{t("Select Industry")}</option>
                                {industryOptions.map(group => (
                                    <optgroup key={group.name} label={t(group.name)}>
                                        {group.children.map(industry => (
                                            <option key={industry.productionReference} value={industry.productionReference}>
                                                {t(industry.name)}
                                            </option>
                                        ))}
                                    </optgroup>
                                ))}
                            </Input>
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
                                maxDate={new Date()}
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
                                disabled={
                                    isReadOnly ||
                                    !taxId ||
                                    !industryReference ||
                                    !registrationNum ||
                                    !dateOfI ||
                                    compnanyFiles?.length === 0 ||
                                    compnanyFileNames.length < requiredFilesLength || !isEdit
                                }
                                onClick={() => setShowAddModal(!showAddModal)}
                            >
                                {t("Add New Director")}
                            </Button>
                            <Modal isOpen={showAddModal} toggle={() => setShowAddModal(!showAddModal)}>
                                <ModalHeader
                                    toggle={() => setShowAddModal(!showAddModal)}
                                >
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
                                                    <KYBPartner setPartnerVerification={setPartnerVerification} setModalOpen={setShowPaymentModal} key={item?._id} partner={item} partners={partners} setPartners={setPartners} refreshPartners={refreshPartners} index={index} />
                                                ))
                                            }
                                        </tbody>
                                    </Table>
                                </CardBody>
                        }
                    </Card>
                }
                {
                    companyType && !isReadOnly &&
                    <Button
                        style={{
                            background: "linear-gradient(to right bottom, #e64067, #5926f0, #4828a0)",
                            border: "none",
                            outline: "none",
                            alignSelf: "flex-end "
                        }}
                        disabled={isReadOnly || isUploading || compnanyFiles?.length === 0 || partners?.length === 0 || !taxId || !industryReference || !dateOfI || !registrationNum || compnanyFileNames.length < requiredFilesLength || isPending}
                        onClick={uploadKybFiles}
                    >{isPending ? "Submitting..." : t("Submit")}</Button>
                }

                {showPaymentModal &&
                    <VerificationPayment
                        isOpen={showPaymentModal}
                        toggle={() => {
                            setShowPaymentModal(false)
                            setPartnerVerification(null)
                            refreshPartners()
                        }}
                        isKYB={true}
                        amount={feeAmount}
                        partnerId={partnerVerification?._id}
                        getFeeDetails={mutateAsync}
                        isGettingFee={isPending}
                    />
                }

                {userDetails?.company?.kyb_additional_file?.filter(file => file?.purpose !== "mastercard_kyc")?.length > 0 && (
                    <AdditionalFilesSection
                        files={userDetails.company.kyb_additional_file?.filter(file => file?.purpose !== "mastercard_kyc")}
                        userId={userDetails?._id}
                        uploadEndpoint={`${import.meta.env.VITE_IP_DEV_API}/api/company/upload-additional-file-kyb/${userDetails?._id}`}
                        authHeader={authHeader}
                        verifyToken={verifyToken}
                    />
                )}
            </CardBody>
            {isModalOpen && (
                <Modal isOpen={true}>
                    <ModalBody>
                        {status === "processing" ? (
                            <h5 className='modal-title ' style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: '2rem' }}>
                                <AiOutlineClockCircle size={64} className="text-warning" />
                                Payment is in Processing!
                            </h5>
                        ) : status === "success" ? (
                            <h5 className='modal-title ' style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: '2rem' }}>
                                <CheckCircle size={64} className="text-success" />
                                Payment Successful!
                            </h5>
                        ) : (
                            <h5 className='modal-title ' style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: '2rem' }}>
                                <XCircle size={64} className="text-danger" />
                                Payment Failed!
                            </h5>
                        )}

                        <div className="text-center mt-3">
                            {status === "processing" ? (
                                <p className="mb-0">{t("Your payment is being processed. Please wait or refresh the page for updates")}</p>

                            ) : status === "success" ? (
                                <p>{t("KYB Fee has been paid successfully!")}
                                    <span style={{ color: "#5926f0", fontWeight: 600, textDecoration: "underline", cursor: "pointer" }} onClick={() => {
                                        handleCloseAndRefresh()
                                    }}>{t("Close Modal")}</span> </p>
                            ) : (
                                <p className="mb-0">{t(error_message())} <br /> <span style={{ color: "#5926f0", fontWeight: 600, textDecoration: "underline", cursor: "pointer" }} onClick={() => {
                                    handleCloseAndRefresh()
                                }}>{t("Close Modal")}</span></p>
                            )}
                        </div>
                    </ModalBody>
                </Modal>
            )}
            {showProcessSuccessModal && (
                <Modal isOpen={showProcessSuccessModal} toggle={() => setShowProcessSuccessModal(false)}>
                    <ModalHeader toggle={() => setShowProcessSuccessModal(false)}>
                        {t("Payment Successful!")}
                    </ModalHeader>
                    <ModalBody>
                        <div className="text-center">
                            <CheckCircle size={64} className="text-success" style={{ marginBottom: "1rem" }} />
                            <h5 className='modal-title' style={{ marginBottom: "1rem" }}>
                                {t("Payment Successful!")}
                            </h5>
                            <p>
                                {t("Thank you for submitting the required documents for business verification. An email has been sent to the business directors to complete their KYC verification.")}
                                <br /><br />
                                {t("Once the business documents and directors’ KYC are successfully validated, your business account will be verified.")}
                            </p>
                            <Button
                                style={{
                                    border: "none",
                                    outline: "none",
                                    background: "linear-gradient(to right bottom, #e64067, #5926f0, #4828a0)",
                                    borderRadius: "6px",
                                    marginTop: "1.5rem"
                                }}
                                onClick={() => setShowProcessSuccessModal(false)}
                            >
                                {t("Close")}
                            </Button>
                        </div>
                    </ModalBody>
                </Modal>
            )}

        </Card >
    )
}

export default KYB

