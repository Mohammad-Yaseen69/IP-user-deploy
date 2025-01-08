import { Card, CardBody, Col } from "reactstrap";
import QuotationCardHeader from "./QuotationTableHeader";
import styles from "./QuotationsTable.module.scss"
import QuotationTableBody from "./QuotationTableBody";
import { useState } from "react";
import { quotations } from "./QuotationsData";

const QuotationTableCard = () => {
    const [searchInput, setSearchInput] = useState("")

    const filteredData = quotations.filter(item => item.name.toLowerCase().includes(searchInput.toLowerCase()));

    return (
        <Col xl="12">
            <Card /*className="user-status"*/>
                <QuotationCardHeader searchInput={searchInput} setSearchInput={setSearchInput} />
                <CardBody>
                    <div className={styles.table_wrapper}>
                        {
                            filteredData.length > 0
                                ?
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th className={styles.hidden}>Date</th>
                                            <th className={styles.hidden}>Time</th>
                                            <th className={styles.hidden}>Transaction ID</th>
                                            <th /*className={styles.hidden}*/>Amount</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <QuotationTableBody data={filteredData} />
                                </table>
                                :
                                <div style={{
                                    marginTop: "1rem",
                                    textAlign: "center",
                                    width: "100%"
                                }}>
                                    <span>No Quotations</span>
                                </div>
                        }
                    </div>
                </CardBody>
            </Card>
        </Col>
    );
};

export default QuotationTableCard;