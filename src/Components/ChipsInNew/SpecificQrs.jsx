import { Card, CardBody, Modal, ModalHeader, ModalBody } from "reactstrap";
import QRCard from "./QRCard.jsx";
import { ChevronDown } from "react-feather";
import { useTranslation } from "react-i18next";
import { useContext, useState } from "react";
import { UserContext } from "../../Context/UserContext.jsx";

const SpecificQrs = () => {
    const { t } = useTranslation()
    const { userWallets } = useContext(UserContext)
    const [showMoreModal, setShowMoreModal] = useState(false)

    const toggleMoreModal = () => {
        setShowMoreModal(!showMoreModal)
    }

    return (
        <Card style={{ flex: 1, marginBottom: 0, minWidth: "250px" }}>
            <CardBody style={{ padding: "2.5rem" }}>
                <h5 style={{ fontSize: "1.rem", marginBottom: "1rem", fontWeight: 700 }}>{t("My QR Codes:")}</h5>
                <div style={{ display: "flex", gap: "1rem", flexDirection: "column", maxHeight: "80vh", padding: "1rem", margin: "-1rem", overflowY: "auto" }}>
                    {
                        userWallets.filter(item => item?.wallet_type === "insta" && item?.status && !item?.blocked && !item?.admin_blocked && !item?.blocked)?.length > 0
                        &&
                        userWallets.filter(item => item?.wallet_type === "insta" && item?.status && !item?.blocked && !item?.admin_blocked && !item?.blocked).map(item => (
                            <QRCard key={item._id} item={item} />
                        ))
                    }
                </div>
                {/* {
                    userWallets.filter(item => item?.wallet_type === "insta" && item?.status && !item?.blocked && !item?.admin_blocked && !item?.blocked)?.length > 3
                        ?
                        <button style={{
                            all: "unset",
                            padding: "10px 18px",
                            background: "#fff",
                            borderRadius: "100px",
                            display: "flex",
                            alignItems: "center",
                            gap: ".5rem",
                            margin: "1.5rem auto 0",
                            boxShadow: "0px 3.3496174812316895px 11.723660469055176px -3.3496174812316895px rgba(0, 0, 0, 0.28)",
                            cursor: "pointer"
                        }} onClick={toggleMoreModal}>
                            {t("Load More")} <ChevronDown size={18} />
                        </button>
                        : ""
                } */}
            </CardBody>
            <Modal isOpen={showMoreModal} toggle={toggleMoreModal}>
                <ModalHeader toggle={toggleMoreModal}>
                    {t("My QR Code Sticker")}
                </ModalHeader>
                <ModalBody style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    {
                        userWallets.filter(item => item?.wallet_type === "insta" && item?.status && !item?.blocked && !item?.admin_blocked && !item?.blocked).map(item => (
                            <QRCard key={item._id} item={item} />
                        ))
                    }
                </ModalBody>
            </Modal>
        </Card>
    )
}

export default SpecificQrs;