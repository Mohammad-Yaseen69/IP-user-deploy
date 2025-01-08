import { Col, Container, Row } from "reactstrap";
import ChipsInContent from "./ChipsInContent";

const ChipsIn = () => {
    return (
        <Container fluid={true}>
            <div className="user-profile">
                <Row>
                    <ChipsInContent />
                </Row>
            </div>
        </Container>
    )
}

export default ChipsIn;