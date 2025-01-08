import { useState } from "react";
import { ChevronRight, HelpCircle } from "react-feather";
import { useTranslation } from "react-i18next";
import { Button, Card, CardBody, Input } from "reactstrap";
import InviteFriendModal from "./InviteFriendModal";

const WalletDetails = ({ setWallet, setSubStep, wallet }) => {
    const { t } = useTranslation()
    const [isOpen, setIsOpen] = useState(false)
    const toggle = () => setIsOpen(!isOpen);
    return (
        <Card style={{
            height: "100%",
            marginBottom: 0,
            boxShadow: "none",
            gap: "1.3rem",
            maxHeight: "540px"
        }}>
            <CardBody style={{
                background: "rgba(0,0,0,.03)",
                borderRadius: "20px",
                flex: "1",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                padding: "30px 20px",
                gap: "14px",
                paddingBottom: 0
            }}>
                <p style={{ fontSize: "1rem", color: "#7d7d7d" }}>Enter the Wallet ID / Email / Phone Number of recipient.</p>
                <Input placeholder="Enter the Wallet ID" onChange={e => setWallet(e.target.value)} />
                <div style={{ color: "#a0a0a0", fontSize: ".6rem", display: "flex", justifyContent: "center", alignItems: "center", gap: ".5rem" }}>
                    Recipient not on InstaPay?
                    <button style={{
                        all: "unset",
                        padding: ".3rem 1rem",
                        fontSize: ".6rem",
                        background: "white",
                        borderRadius: "40px",
                        boxShadow: "0px 3.3496174812316895px 11.723660469055176px -3.3496174812316895px rgba(89, 38, 240, 0.25)",
                        cursor: "pointer"
                    }} onClick={toggle}>
                        <span style={{
                            background: "linear-gradient(277.06deg, #E64067 -9.52%, #5926F0 62.22%, #4828A0 119.38%), #D9D9D9",
                            backgroundClip: "text",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            fontWeight: 500
                        }}>{t("Invite Them")}</span>
                    </button>
                    <InviteFriendModal isOpen={isOpen} toggle={toggle} />
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
                <p style={{ fontSize: ".6rem", display: "flex", alignItems: "center", gap: ".3rem", marginBottom: "0" }}>
                    <HelpCircle size={12} />
                    <span>{t("Trouble Sending Money?")}</span>
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
                    onClick={() => {
                        setSubStep(prev => prev + 1)
                    }}
                    disabled={!wallet}
                >
                    {t("Confirm")} <ChevronRight size={20} />
                </Button>
            </div>
        </Card>
    )
}

export default WalletDetails;