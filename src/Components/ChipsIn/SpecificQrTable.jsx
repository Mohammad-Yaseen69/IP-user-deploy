import { Card, CardBody, Col } from "reactstrap";
import styles from "./styles/ChipsInTable.module.scss"
import SpecificQrTableHeader from "./SpecificQrTableHeader";
import SpecificQrTableBody from "./SpecificQrTableBody";
import { useState } from "react";
import NewRequestForm from "./NewRequestForm";
import { useTranslation } from "react-i18next";

const SpecificQrTable = ({ ssit, sti }) => {
    const [showForm, setShowForm] = useState(false)
    const { t } = useTranslation()
    return (
        <Col xl="12">
            <Card>
                <SpecificQrTableHeader setShowForm={setShowForm} showForm={showForm} />
                <CardBody>
                    {
                        showForm
                            ?
                            <NewRequestForm setShowForm={setShowForm} />
                            :
                            <div className={styles.table_wrapper}>
                                <table>
                                    <thead>
                                        <tr>
                                            <th>{t("Title")}</th>
                                            <th>{t("Wallet")}</th>
                                            <th>{t("Date")}</th>
                                            <th>{t("Amount")}</th>
                                            <th>{t("Transactions")}</th>
                                            <th>{t("Total Amount")}</th>
                                            <th>{t("Status")}</th>
                                            <th>{t("Actions")}</th>
                                        </tr>
                                    </thead>
                                    <SpecificQrTableBody ssit={ssit} sti={sti} />
                                </table>
                            </div>
                    }
                </CardBody>
            </Card>
        </Col>
    );
};

export default SpecificQrTable;