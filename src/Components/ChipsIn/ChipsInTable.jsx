import { Card, CardBody, Col } from "reactstrap";
import styles from "./styles/ChipsInTable.module.scss"
import ChipsInTableHeader from "./ChipsInTableHeader";
import ChipsInTableBody from "./ChipsInTableBody";
import { useState } from "react";
import CreateRequestForm from "./CreateRequestForm";

const ChipsInTable = ({ ssr, title, setTitle, amount, setAmount, description, setDescription, setItemId }) => {
    const [activeTab, setActiveTab] = useState('1');

    const scrollToBottom = () => {
        window.scrollTo(0, window.innerHeight)
    }

    return (
        <Col xl="12" style={{
            marginTop: "50px",
            boxShadow: "none"
        }}>
            <Card /*className="user-status"*/>
                <ChipsInTableHeader activeTab={activeTab} setActiveTab={setActiveTab} stb={scrollToBottom} />
                <CardBody>
                    {
                        activeTab === "1"
                            ?
                            <div className={styles.table_wrapper}>
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th className={styles.hidden}>Date</th>
                                            <th className={styles.hidden}>Type</th>
                                            <th className={styles.hidden}>Amount</th>
                                            {/* <th className={styles.hidden}>Transaction Time</th>
                                    <th className={styles.hidden}>Payment Type</th>
                                    <th className={styles.hidden}>Transaction ID</th>
                                    <th>Amount</th> */}
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <ChipsInTableBody />
                                </table>
                            </div>
                            :
                            <CreateRequestForm ssr={ssr} title={title} setTitle={setTitle} amount={amount} setAmount={setAmount} description={description} setDescription={setDescription} setItemId={setItemId} stb={scrollToBottom} />
                    }
                </CardBody>
            </Card>
        </Col>
    );
};

export default ChipsInTable;