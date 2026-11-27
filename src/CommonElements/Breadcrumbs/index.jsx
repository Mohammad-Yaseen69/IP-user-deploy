import { Fragment } from "react";
import { Container, Row, Col } from "reactstrap";
import H3 from "../Headings/H3Element";

const Breadcrumbs = (props) => {
  return (
    <Fragment>
      <Container fluid={true}>
        <div className="page-title">
          <Row>
            <Col sm="6">
              <H3>{props.mainTitle}</H3>
            </Col>
            {/* <Col sm="6">
              <ol className="breadcrumb">
                <li className="breadcrumb-item"><Link to={`${window.location.origin}/dashboard/default`}><Home /></Link></li>
                <li className="breadcrumb-item">{props.parent}</li>
                {props.subParent ? <li className="breadcrumb-item">{props.subParent}</li> : ''}
                <li className="breadcrumb-item active">{props.title}</li>
              </ol>
            </Col> */}
          </Row>
        </div>
      </Container>
    </Fragment>
  );
};

export default Breadcrumbs;
