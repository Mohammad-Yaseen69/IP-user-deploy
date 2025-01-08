import { Container, Row } from "reactstrap";
import { Breadcrumbs } from "../../AbstractElements";
import QuotationTableCard from "./Table/QuotationTableCard";

const Quotations = () => {
    return (
        <>
            <Breadcrumbs mainTitle="Quotations" title="Quotations" />
            <Container fluid={true} className="credit-card payment-details">
                <Row>
                    <QuotationTableCard />
                </Row>
            </Container>
        </>
    )
}

export default Quotations;