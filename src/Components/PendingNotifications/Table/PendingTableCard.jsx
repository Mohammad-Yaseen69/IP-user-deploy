import { Card, CardBody, Col } from "reactstrap";
import PendingCardHeader from "./PendingTableHeader";
import stylesReq from "./RequestsTable.module.scss"
import { useState } from "react";
import PendingTableBody from "./PendingTableBody";
import { useSelector } from "react-redux";
import QuotationEdit from "./QuotationEdit";
import { useTranslation } from "react-i18next";

const PendingTableCard = () => {
    const { t } = useTranslation()
    const [searchInput, setSearchInput] = useState("")
    const [activeTab, setActiveTab] = useState('1');
    const pendings = useSelector(state => state.pendings)
    const [allData, setAllData] = useState(pendings)
    const [showTimeline, setShowTimeline] = useState(false)
    const [selectedId, setSelectedId] = useState()

    const selectedItem = pendings.filter(item => item.id === selectedId)[0]

    return (
        <Col xl="12">
            {
                showTimeline
                    ?
                    <QuotationEdit si={selectedItem} />
                    :
                    <Card>
                        <PendingCardHeader searchInput={searchInput} setSearchInput={setSearchInput} activeTab={activeTab} setActiveTab={setActiveTab} setAllData={setAllData} pendings={pendings} />
                        <CardBody>
                            <div className={stylesReq.table_wrapper}>
                                {
                                    allData.length > 0
                                        ?
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th>{t("Name")}</th>
                                                    <th className={stylesReq.hidden}>{t("Date")}</th>
                                                    <th className={stylesReq.hidden}>{t("Type")}</th>
                                                    <th className={stylesReq.hidden}>{t("Transaction ID")}</th>
                                                    <th /*className={styles.hidden}*/>{t("Amount")}</th>
                                                    <th>{t("Actions")}</th>
                                                </tr>
                                            </thead>
                                            <PendingTableBody data={allData} sst={setShowTimeline} ssi={setSelectedId} />
                                        </table>
                                        :
                                        <div style={{
                                            marginTop: "1rem",
                                            textAlign: "center",
                                            width: "100%"
                                        }}>
                                            <span>No Items</span>
                                        </div>
                                }
                            </div>
                        </CardBody>
                    </Card>
            }
        </Col>
    );
};

export default PendingTableCard;