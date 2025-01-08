import { Col, Row } from "reactstrap";
import TotalProfitCard from "../../Ecommerce/ProfitCard/TotalProfitCard";
import TotalSold from "../../Ecommerce/TotalSold/TotalSold";
import VisitorCard from "../../Ecommerce/VisitorCard/VisitorCard";

const Statistics = () => {
    return (
        // <Col>
        //     <Row>
        <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
            <TotalProfitCard />
            <TotalProfitCard />
            <VisitorCard />
            <TotalSold />
        </div>
        //     </Row>
        // </Col>

    );
};

export default Statistics