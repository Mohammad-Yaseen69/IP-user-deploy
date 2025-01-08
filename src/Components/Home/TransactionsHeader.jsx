import { CardHeader } from "reactstrap";
import { H4 } from "../../AbstractElements";

const TransactionsHeader = () => {
    return (
        <CardHeader className="pb-0">
            <div className="d-flex">
                <div className="flex-grow-1">
                    <H4>Transactions</H4>
                </div>
            </div>
        </CardHeader>
    );
};

export default TransactionsHeader;
