import { Col, Container, Row } from "reactstrap";
import RequestAboutMeSidebar from "./RequestAboutMeSiderbar";
import RequestProfileHeader from "./RequestProifleHeader";
import RequestReceipt from "./RequestReceipt";
import { useEffect, useState } from "react";

const ChipsIn = () => {
    const [mobileView, setMobileView] = useState(window.innerWidth < 670)

    const handleWindowResize = () => {
        if (window.innerWidth < 670) {
            setMobileView(true)
        } else {
            setMobileView(false)
        }
    }

    useEffect(() => {
        window.addEventListener("resize", handleWindowResize)
        return () => {
            window.removeEventListener("resize", handleWindowResize)
        }
    }, [])

    return (
        <Container fluid={true} style={{ padding: mobileView ? ".5rem" : "3rem" }}>
            <div className="user-profile">
                <Row>
                    <RequestProfileHeader />
                    <Col xl="3" md="5" lg="4" className="xl-35 box-col-30">
                        <div className="default-according style-1 job-accordion">
                            <Row>
                                <RequestAboutMeSidebar />
                            </Row>
                        </div>
                    </Col>
                    <RequestReceipt />
                </Row>
            </div>
        </Container >
    )
}

export default ChipsIn;