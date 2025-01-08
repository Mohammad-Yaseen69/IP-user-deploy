import { Card, Col } from "reactstrap";
import { H4 } from "../../AbstractElements";
import { QuickLinksData } from "./QuickLinksData";
import "./styles/table_hover.css"
import { Link } from "react-router-dom";

const QuickLinks = () => {
    return (
        <div className="card" style={{
            boxShadow: "none",
            // padding: "1rem",
            borderRadius: "10px",
            padding: 0,
            marginBottom: 0,
            background: "transparent",
            border: "none"
        }}>
            {/* <h2 style={{
                fontSize: "1.3rem",
                fontWeight: "600",
                marginBottom: "1rem",
            }}>Quick Links</h2> */}
            <div style={{
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                overflowX: "auto"
            }}>
                {
                    QuickLinksData.map((data, index) => (
                        <Col style={{ flex: 1, minWidth: "150px" }} key={index} className="hover-styles">
                            <Card className={`o-hidden ${data.cardClassName ? data.cardClassName : ""}`} style={{ marginBottom: 0, borderRadius: "10px", cursor: "pointer" }}>
                                <Link to={data.link} className="d-flex" style={{ alignItems: 'center', padding: "1rem", flexDirection: "column-reverse", gap: "1rem", color: "inherit" }}>
                                    <div className="flex-grow-1">
                                        <H4 attrH4={{ style: { fontSize: ".9rem", padding: 0, margin: 0, whiteSpace: "nowrap" } }}>{data.Heading}</H4>
                                    </div>
                                    <div style={{
                                        height: "50px",
                                        width: "50px",
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        borderRadius: "50%",
                                        background: "rgb(230,230,230)"
                                    }}>
                                        <img src={data.svgIcon} alt="i" />
                                    </div>
                                </Link>
                            </Card>
                        </Col>
                    ))
                }
            </div >
        </div >
    );
};

export default QuickLinks;