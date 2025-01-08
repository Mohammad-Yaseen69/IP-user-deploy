import React, { Fragment } from 'react'
import { Col, Container, Row } from 'reactstrap'
import { Footer, P } from '../../AbstractElements'
import flag from "./flag.jpeg"

const FooterComponent = () => {
  return (
    <Fragment>
      <Footer attrFooter={{ className: "footer", style: { zIndex: 100, position: "relative" } }}>
        <Container fluid={true}>
          <Row>
            <Col md="6" className='p-0 footer-left'>
              <P attrPara={{ className: "mb-0" }} >Copyright © 2023 InstaPay. All rights reserved.</P>
            </Col>
            <Col md="6" className='p-0' style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "flex-end"
            }}>
              <img src={flag} height={40} width={40} style={{ objectFit: "cover", borderRadius: "20px" }} />
              <div>
                <P attrPara={{ className: "mb-0 ms-3" }} >Powered By <a href='/' target={"_blank"}>Kemit Kingdom SA</a></P>
                <span style={{ marginLeft: "1rem", fontSize: ".7rem" }}>A Swiss Company</span>
              </div>
            </Col>
          </Row>
        </Container>
      </Footer>
    </Fragment>
  )
}

export default FooterComponent;