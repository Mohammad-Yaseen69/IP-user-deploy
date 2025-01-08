import { Button, Container, Row } from "reactstrap";
// import { Breadcrumbs } from "../../AbstractElements";
import PendingTableCard from "./Table/PendingTableCard";
import { useState } from "react";
import { useTranslation } from "react-i18next";

const PendingNotifications = () => {
    const [currentTable, setCurrentTable] = useState("Pending")
    const { t } = useTranslation()
    return (
        <>
            {/* <Breadcrumbs mainTitle="Pending Items" title="Pending Items" /> */}
            <div className="my-4 mx-3" style={{
                display: "flex",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "1rem"
            }}>
                <h4>{t(`${currentTable} Items`)}</h4>
                <Button
                    style={{
                        background: "linear-gradient(to right bottom, #e64067, #5926f0, #4828a0)",
                        border: "none",
                        outline: "none"
                    }}
                    onClick={() => {
                        if (currentTable !== "Request") {
                            setCurrentTable("Request")
                        } else {
                            setCurrentTable("Pending")
                        }
                    }}
                >{currentTable === "Request" ? t("Pending Item") : t("Send Request")}</Button>
                <Button
                    style={{
                        background: "linear-gradient(to right bottom, #e64067, #5926f0, #4828a0)",
                        border: "none",
                        outline: "none"
                    }}
                    onClick={() => {
                        if (currentTable !== "Quote") {
                            setCurrentTable("Quote")
                        } else {
                            setCurrentTable("Pending")
                        }
                    }}
                >{currentTable === "Quote" ? t("Pending Item") : t("Send Quotation")}</Button>
            </div>
            <Container fluid={true} className="credit-card payment-details">
                <Row>
                    {
                        currentTable === "Pending"
                        &&
                        <PendingTableCard />
                    }
                    {
                        currentTable === "Request"
                        &&
                        <PendingTableCard />
                    }
                    {
                        currentTable === "Quote"
                        &&
                        <PendingTableCard />
                    }
                </Row>
            </Container>
        </>
    )
}

export default PendingNotifications;