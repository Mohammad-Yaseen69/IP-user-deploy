import { Card, CardBody, Col, Table } from "reactstrap";
import TransactionsHeader from "./TransactionsHeader";
import TransactionsBody from "./TransactionsBody";
import "./styles/table_hover.css"

const TransactionsTable = () => {
    return (
        <Col className="hover-styles">
            <Card className="user-status" style={{ marginBottom: 0, borderRadius: "10px" }}>
                <TransactionsHeader />
                <CardBody>
                    <div className="table-responsive theme-scrollbar mb-0">
                        <Table className="table-bordernone">
                            <TransactionsBody />
                        </Table>
                    </div>
                </CardBody>
            </Card>
        </Col>
    );
};

export default TransactionsTable;
