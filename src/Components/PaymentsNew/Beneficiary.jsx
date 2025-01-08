import { ChevronRight, HelpCircle, Search } from "react-feather"
import { Button, Card, CardBody, Input } from "reactstrap"
import { useSelector } from "react-redux"
import { useTranslation } from "react-i18next"
import { useState } from "react"
import BeneficiaryCard from "./BeneficiaryCard"
import InviteFriendModal from "./InviteFriendModal"
import { useNavigate } from "react-router"
import AddCSVModal from "../Payments/CSVModal"

const PaymentsBeneficiary = ({ beneficiary, setBeneficiary, setSubStep, type = "Sending" }) => {
    const { t } = useTranslation()
    const beneficiaries = useSelector(state => state.beneficiaries)
    const [isBulk, setIsBulk] = useState(false)
    const [isOpen, setIsOpen] = useState(false)
    const toggle = () => setIsOpen(!isOpen)
    const [showCSVModal, setShowCSVModal] = useState(false);
    const [showInfo, setShowInfo] = useState(false)
    const csvModalToggle = () => setShowCSVModal(!showCSVModal);
    const navigate = useNavigate()
    return (
        <Card style={{
            height: "100%",
            marginBottom: 0,
            boxShadow: "none",
            gap: "1.3rem",
            maxHeight: "540px"
        }}>
            <CardBody style={{
                paddingBottom: "0",
                display: "flex",
                flexDirection: "column",
                gap: "14px",
                borderRadius: "20px",
                padding: "14px",
                background: "rgba(0,0,0,.03)",
                paddingBottom: 0
            }}>
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
                            }}>{t("Manage Group")}</span>
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
                    {/* <div style={{
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
                    </div> */}
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
                        <button style={{
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
                        </button>
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
                <div style={{ display: "flex", alignItems: "center", padding: ".25rem .75rem", borderRadius: "10px", background: "#fff" }}>
                    <Search color="#a0a0a0" size={18} />
                    <Input type="text" placeholder="Search Contact" style={{ border: "none", outline: "none", fontSize: ".8rem" }} />
                </div>
                {
                    isBulk && <p style={{ fontSize: ".7rem", padding: 0, margin: 0 }}>Click on the beneficiaries to select multiple</p>
                }
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem", margin: "0 0 0", height: "100%", maxHeight: "220px", overflowY: "auto", scrollbarWidth: "none" }}>
                    {beneficiaries.map(user => (
                        <BeneficiaryCard user={user} isBulk={isBulk} setBeneficiary={setBeneficiary} selectedUser={beneficiary} />
                    ))}
                </div>
            </CardBody>
            <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: ".5rem",
                flexWrap: "wrap",
                paddingLeft: "1rem"
            }}>
                <p style={{ fontSize: ".7vw", display: "flex", alignItems: "center", gap: ".3rem", marginBottom: "0" }}>
                    <HelpCircle size={12} />
                    <span>{t(`Trouble ${type} Money?`)}</span>
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
                    gap: "12px",
                    padding: "7px 24px",
                    fontSize: "16px"
                }}
                    onClick={() => setSubStep(prev => prev + 1)}
                    disabled={!beneficiary}
                >
                    {t("Confirm")} <ChevronRight size={20} />
                </Button>
            </div>
        </Card >
    )
}

export default PaymentsBeneficiary