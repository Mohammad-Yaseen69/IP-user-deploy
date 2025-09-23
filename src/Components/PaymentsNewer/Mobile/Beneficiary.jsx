import { Check, ChevronRight, HelpCircle, Search, X, XCircle } from "react-feather"
import { Badge, Button, Card, CardBody, Input } from "reactstrap"
import { useSelector } from "react-redux"
import { useTranslation } from "react-i18next"
import { useContext, useEffect, useState } from "react"
import BeneficiaryCard from "./BeneficiaryCard"
import InviteFriendModal from "./InviteFriendModal"
import { useLocation, useNavigate } from "react-router"
import AddCSVModal from "../Payments/CSVModal"
import { UserContext } from "../../Context/UserContext"
import axios from "axios"
import { encryptData } from "../../Helper/EssentilaMethods/Encryption"
import { decryptData } from "../../Helper/EssentilaMethods/Decryption"
import countries from "./CountriesData.json"
import { BsThreeDots } from "react-icons/bs"
import InstaPayLoader from "../Loader"

const PaymentsBeneficiary = ({ beneficiary, setBeneficiary, setSubStep, type = "Sending", payoutChannel = "", international = null }) => {
    const { t } = useTranslation()
    const { beneficiaries, userWallets, authHeader, registeredBeneficiaries, userDetails } = useContext(UserContext)
    const [filtered, setFiltered] = useState(payoutChannel ? registeredBeneficiaries.filter(item => item.account_type.some(item => item.toLowerCase().includes(payoutChannel.toLowerCase()))) : registeredBeneficiaries)
    const [searched, setSearched] = useState(null);
    const [isBulk, setIsBulk] = useState(false)
    const [isOpen, setIsOpen] = useState(false)
    const toggle = () => setIsOpen(!isOpen)
    const [showCSVModal, setShowCSVModal] = useState(false);
    const [showInfo, setShowInfo] = useState(false)
    const csvModalToggle = () => setShowCSVModal(!showCSVModal);
    const navigate = useNavigate()
    const [isValid, setIsValid] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [isError, setIsError] = useState("")
    const [isChecking, setIsChecking] = useState(false)
    const [quotationError, setQuotationError] = useState(false)

    const createQuotations = () => {
        setQuotationError(false)
        setIsChecking(true)
        if (type === "Requesting" || type === "Quoting") {
            setIsChecking(false)
            setSubStep(prev => prev + 1)
        }
        if (beneficiary.length > 0 && international !== null) {

            beneficiary.forEach(item => {
                const data = {
                    amount: +international?.amount,
                    token: international?.token,
                    payerId: international?.payer_id,
                    wallet_id: userWallets?.filter(it => it?.currency?.code?.toLowerCase() === international?.currency?.toLowerCase())[0]?._id,
                    transaction_type: item?.beneficiary_type ? item?.beneficiary_type === "individual" ? "C2C" : "C2B" : item?.account_type === "individual" ? "C2C" : "C2B",
                    service_name: payoutChannel === "bank" ? "international_bank_transfer" : payoutChannel === "mobile" ? "international_mobile_wallet" : payoutChannel === "card" ? "international_card_payment" : payoutChannel === "cash" ? "international_cash_pickup" : "",
                    channel_name: payoutChannel === "bank" ? "bank_account" : payoutChannel === "mobile" ? "mobile_money" : payoutChannel === "card" ? "card_payment" : payoutChannel === "cash" ? "cash_pickup" : "",
                }
                // console.log(data)
                const encrypted = encryptData(data)

                axios.post(`${import.meta.env.VITE_THUNES_API}/createQuotation`, {
                    data: encrypted
                },
                    {
                        headers: authHeader
                    }
                )
                    .then(res => {
                        international.setCreatedQuotation(decryptData(res.data.data))
                        setSubStep(prev => prev + 1)
                        setIsValid(true)
                        setIsChecking(false)
                    })
                    .catch(err => {
                        // console.log(decryptData(err.response.data.data))
                        setIsValid(false)
                        setIsChecking(false)
                        setQuotationError(true)
                    })
            })
        }
    }

    const searchUser = debounce((e) => {
        axios.get(`${import.meta.env.VITE_IP_DEV_API}/api/instagram/search-account/${e.target.value}`, {
            headers: authHeader
        })
            .then(res => {
                setSearched(res.data.accountDetails)
                setIsLoading(false)
                setIsError("")
            })
            .catch(err => {
                // console.log(err)
                setSearched(null)
                setIsLoading(false)
                setIsError("No User Found.")
            })
        // }
    }, 1000);

    useEffect(() => {
        if (searched !== null || searched) {
            axios.get(`${import.meta.env.VITE_IP_DEV_API}/api/instagram/get-user-details/${searched._id}`, {
                headers: authHeader
            })
                .then(res => {
                    // console.log(res)
                })
                .catch(err => {
                    // console.log(err)
                })
        }
    }, [searched])

    function debounce(func, delay) {
        let timer;
        return function () {
            setIsLoading(true)
            setIsError("")
            const context = this;
            const args = arguments;
            clearTimeout(timer);
            timer = setTimeout(() => {
                func.apply(context, args);
            }, delay);
        };
    }

    const location = useLocation()
    const queryParams = new URLSearchParams(location.search)
    const user_name = queryParams.get("username")

    useEffect(() => {
        if (user_name) {
            const username_obj = { target: { value: user_name } }
            searchUser(username_obj)
        }
    }, [user_name])

    useEffect(() => {
        if (user_name && searched) {
            setBeneficiary([searched])
        }
    }, [user_name, searched])
    // console.log(beneficiary, user_name, searched)
    return (
        <Card style={{
            height: "100%",
            marginBottom: 0,
            boxShadow: "none",
            // gap: "1.3rem",
            // maxHeight: "540px"
        }}>
            <CardBody style={{
                paddingBottom: "0",
                display: "flex",
                flexDirection: "column",
                gap: "14px",
                borderRadius: "20px",
                padding: "14px",
                background: "rgba(0,0,0,.03)",
                paddingBottom: 0,
                boxShadow: "0px 18px 15.348464965820312px -15px rgba(89, 38, 240, 0.16)"
            }}>
                {
                    type !== "Quoting"
                    &&
                    <>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: 'center' }}>
                            <h5 style={{ fontSize: ".8rem", fontWeight: 500, color: "#a0a0a0", marginBottom: 0 }}>{t("Groups")}:</h5>
                            <div style={{ display: "flex", gap: "1rem" }}>
                                <button style={{
                                    all: "unset",
                                    padding: ".3rem 1rem",
                                    fontSize: ".6rem",
                                    background: "white",
                                    borderRadius: "40px",
                                    boxShadow: "0px 3.3496174812316895px 11.723660469055176px -3.3496174812316895px rgba(89, 38, 240, 0.25)",
                                    cursor: "pointer"
                                }} onClick={_ => navigate('/beneficiaries')}>
                                    <span style={{
                                        background: "linear-gradient(277.06deg, #E64067 -9.52%, #5926F0 62.22%, #4828A0 119.38%), #D9D9D9",
                                        backgroundClip: "text",
                                        WebkitBackgroundClip: "text",
                                        WebkitTextFillColor: "transparent",
                                        fontWeight: 500
                                    }}>{t("Manage Groups")}</span>
                                </button>
                                {
                                    type === "Requesting"
                                    &&
                                    <button style={{
                                        all: "unset",
                                        padding: ".3rem 1rem",
                                        fontSize: ".6rem",
                                        background: "white",
                                        borderRadius: "40px",
                                        boxShadow: "0px 3.3496174812316895px 11.723660469055176px -3.3496174812316895px rgba(89, 38, 240, 0.25)",
                                        cursor: "pointer"
                                    }} onClick={csvModalToggle}>
                                        <span style={{
                                            background: "linear-gradient(277.06deg, #E64067 -9.52%, #5926F0 62.22%, #4828A0 119.38%), #D9D9D9",
                                            backgroundClip: "text",
                                            WebkitBackgroundClip: "text",
                                            WebkitTextFillColor: "transparent",
                                            fontWeight: 500
                                        }}>{t("Upload File")}</span>
                                    </button>
                                }
                                <AddCSVModal srr={setBeneficiary} isOpen={showCSVModal} toggleModal={csvModalToggle} showInfo={showInfo} setShowInfo={setShowInfo} />
                            </div>
                        </div>
                        <div style={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: "1rem",
                            overflowX: "auto",
                            scrollbarWidth: "none",
                            margin: ".5rem 0"
                        }}>
                            <div style={{
                                display: 'flex',
                                flexDirection: "column",
                                alignItems: "center",
                                width: "fit-content",
                                gap: ".3rem",
                                cursor: "pointer"
                            }}>
                                <div style={{
                                    height: "60px",
                                    width: "60px",
                                    aspectRatio: "1",
                                    borderRadius: "16px",
                                    background: "white",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "3rem",
                                    boxShadow: "0px 16.675323486328125px 18.0649356842041px 0px rgba(109, 41, 220, 0.04), 0px 4px 157px 0px rgba(0, 0, 0, 0.09)"
                                }}>+</div>
                                <span style={{ fontSize: ".7rem" }}>{t("Add New")}</span>
                            </div>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: 'center' }}>
                            <h5 style={{ fontSize: ".8rem", fontWeight: 500, color: "#a0a0a0", marginBottom: 0 }}>{t("Beneficiaries")}:</h5>
                            <div style={{ display: "flex", gap: ".5rem" }}>
                                <button style={{
                                    all: "unset",
                                    padding: ".3rem 1rem",
                                    fontSize: ".6rem",
                                    background: "linear-gradient(277.06deg, #E64067 -9.52%, #5926F0 62.22%, #4828A0 119.38%), #D9D9D9",
                                    borderRadius: "40px",
                                    boxShadow: "0px 3.3496174812316895px 11.723660469055176px -3.3496174812316895px rgba(89, 38, 240, 0.25)",
                                    cursor: "pointer"
                                }} onClick={toggle}>
                                    <span style={{
                                        color: "white",
                                        fontWeight: 500
                                    }}>{t("Invite")}</span>
                                </button>
                                <InviteFriendModal isOpen={isOpen} toggle={toggle} />
                                {/* <button style={{
                                    all: "unset",
                                    padding: ".3rem 1rem",
                                    fontSize: ".6rem",
                                    background: "white",
                                    borderRadius: "40px",
                                    boxShadow: "0px 3.3496174812316895px 11.723660469055176px -3.3496174812316895px rgba(89, 38, 240, 0.25)",
                                    cursor: "pointer"
                                }}
                                    onClick={() => {
                                        setIsBulk(!isBulk)
                                        setBeneficiary([])
                                    }}
                                >
                                    <span style={{
                                        background: "linear-gradient(277.06deg, #E64067 -9.52%, #5926F0 62.22%, #4828A0 119.38%), #D9D9D9",
                                        backgroundClip: "text",
                                        WebkitBackgroundClip: "text",
                                        WebkitTextFillColor: "transparent",
                                        fontWeight: 500
                                    }}>{t(!isBulk ? "Bulk" : "Single")}</span>
                                </button> */}
                                <button style={{
                                    all: "unset",
                                    padding: ".3rem 1rem",
                                    fontSize: ".6rem",
                                    background: "white",
                                    borderRadius: "40px",
                                    boxShadow: "0px 3.3496174812316895px 11.723660469055176px -3.3496174812316895px rgba(89, 38, 240, 0.25)",
                                    cursor: "pointer"
                                }} onClick={() => navigate("/beneficiaries")}>
                                    <span style={{
                                        background: "linear-gradient(277.06deg, #E64067 -9.52%, #5926F0 62.22%, #4828A0 119.38%), #D9D9D9",
                                        backgroundClip: "text",
                                        WebkitBackgroundClip: "text",
                                        WebkitTextFillColor: "transparent",
                                        fontWeight: 500
                                    }}>{t("Manage Beneficiaries")}</span>
                                </button>
                            </div>
                        </div>
                    </>
                }
                <div style={{ display: "flex", alignItems: "center", padding: ".25rem .75rem", borderRadius: "10px", background: "#fff" }}>
                    <Search color="#a0a0a0" size={18} />
                    <Input type="text" placeholder={t("Search Users")} style={{ border: "none", outline: "none", fontSize: ".8rem" }} onChange={searchUser} />
                </div>
                {
                    isBulk && <p style={{ fontSize: ".7rem", padding: 0, margin: 0 }}>Click on the beneficiaries to select multiple</p>
                }


                <div style={{ display: "flex", flexDirection: "column", gap: "1rem", margin: "0 0 0", height: "100%", overflowY: "auto", scrollbarWidth: "none", "--max-height": type === "Requesting" ? "55vh" : type === "Quoting" ? "65vh" : "none" }} className={"i_t_b_con"}>
                    {
                        isLoading
                            ?
                            <div style={{ width: "60px", height: "60px", margin: "0 auto" }}>
                                <InstaPayLoader />
                            </div>
                            :
                            <>
                                {
                                    isError &&
                                    <div style={{ textAlign: "center", margin: "1rem 0" }}>{isError}</div>
                                }
                                {
                                    searched &&
                                    <>
                                        {searched?._id !== userDetails?._id
                                            ?
                                            <div style={{ background: "#fff", borderRadius: "12px", padding: ".5rem", cursor: "pointer", flex: 1, }}>
                                                <div key={searched?.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", maxHeight: "72px" }} onClick={() => setBeneficiary([searched])}>
                                                    <div style={{ display: "flex", alignItems: "center", gap: ".5rem" }}>
                                                        {
                                                            searched?.profileImage?.url
                                                                ?
                                                                <img src={searched?.profileImage?.url} alt="dp" style={{
                                                                    width: "35px",
                                                                    height: "35px",
                                                                    borderRadius: "25px",
                                                                    boxShadow: "0 0 3px #1111113e"
                                                                }} />
                                                                :
                                                                <div style={{
                                                                    width: "35px",
                                                                    height: "35px",
                                                                    borderRadius: "25px",
                                                                    display: "grid",
                                                                    placeItems: "center",
                                                                    background: "linear-gradient(-24deg, rgb(210, 60, 122) 0%, rgb(164, 52, 167) 43.66%, rgb(88, 38, 239) 100%)",
                                                                    color: "white",
                                                                    fontSize: "1rem",
                                                                    fontWeight: 800
                                                                }}>{searched?.account_type === "individual" ? searched?.user?.first_name?.[0]?.toUpperCase() : searched?.company?.company_name?.[0]?.toUpperCase()}</div>
                                                        }
                                                        <div>
                                                            <div style={{ display: "flex", gap: ".3rem", alignItems: "center" }}>
                                                                <h5 className="mb-0" style={{ fontSize: ".9rem" }}>{searched?.account_type === "individual" ? `${searched?.user?.first_name} ${searched?.user?.last_name}` : searched?.company?.company_name}</h5>
                                                                <Badge style={{
                                                                    background: "linear-gradient(-24deg, rgb(210, 60, 122) 0%, rgb(164, 52, 167) 43.66%, rgb(88, 38, 239) 100%)",
                                                                    border: "none",
                                                                    outline: "none",
                                                                    fontSize: ".55rem"
                                                                }}>{searched?.account_type?.toUpperCase()}</Badge>
                                                            </div>
                                                            <span style={{ fontSize: ".7rem" }}>
                                                                {searched?.username ?? "No username"}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                                                        <div style={{ display: "flex", alignItems: "center", gap: ".5rem" }}>
                                                            <img src={countries.filter(it => it.name.toLowerCase() === searched?.country_name?.toLowerCase())[0]?.file_url} alt="flag" style={{ borderRadius: "4px", boxShadow: "0 0 10px rgba(0,0,0,.3)", width: "40px" }} className="i_t_flag" draggable="false" />
                                                            <span style={{ fontSize: "1rem", fontWeight: "700" }}>{countries.filter(it => it.name.toLowerCase() === searched?.country?.toLowerCase())[0]?.name}</span>
                                                        </div>
                                                        {beneficiary.some(it => it._id === searched?._id) ? <Check style={{ fontWeight: "900" }} color="green" /> : <BsThreeDots />}
                                                    </div>
                                                </div>
                                                {
                                                    searched?.about_me
                                                    &&
                                                    <p style={{ margin: ".5rem 45px 0", WebkitLineClamp: 3, overflow: "hidden", textOverflow: "ellipsis" }}><strong>About: </strong>{searched?.about_me}</p>
                                                }
                                            </div>
                                            : <div style={{ margin: "1rem auto", textAlign: "center" }}>You can't perform this action to yourself.</div>
                                        }
                                    </>
                                }
                            </>
                    }
                    <h5>{t("My Beneficiaries")}: </h5>
                    {filtered.map(user => (
                        <BeneficiaryCard key={user?._id ?? Date.now()} user={user} isBulk={isBulk} setBeneficiary={setBeneficiary} selectedUser={beneficiary} payoutChannel={payoutChannel} type={type} />
                    ))}
                </div>
            </CardBody>
            <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-end",
                gap: ".5rem",
                flexWrap: "wrap",
                paddingLeft: "1rem",
                marginTop: "1rem"
            }}>
                <p style={{ fontSize: ".7vw", display: "flex", alignItems: "center", gap: ".3rem", marginBottom: "0" }}>
                    {
                        quotationError
                            ?
                            <>
                                <XCircle size={12} color="red" />
                                <span style={{ color: "red" }}>Something went wrong.</span>
                            </>
                            :
                            <>
                                <HelpCircle size={12} />
                                <span>{t(`Trouble ${type} Money?`)}</span>
                            </>
                    }
                </p>
                <Button size="sm" style={{
                    border: "none",
                    outline: "none",
                    background: " linear-gradient(to right, rgba(0, 0, 0, 0.40) 0%, rgba(0, 0, 0, 0.40) 100%), linear-gradient(to left, #E64067 0%, #5926F0 55.65%, #4828A0",
                    backgroundBlendMode: "overlay, normal",
                    boxShadow: "0px 11.90068244934082px 8.655041694641113px -5.409400939941406px rgba(89, 38, 240, 0.17)",
                    borderRadius: "6px",
                    display: "flex",
                    alignItems: "center",
                }}
                    className="i_t_button"
                    onClick={createQuotations}
                    disabled={isChecking || beneficiary.length < 1}
                >
                    {isChecking ? t("Confirming") : t("Confirm")} <ChevronRight size={20} />
                </Button>
            </div>
        </Card >
    )
}

export default PaymentsBeneficiary