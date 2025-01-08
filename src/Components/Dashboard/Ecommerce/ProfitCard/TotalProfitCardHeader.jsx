import { Card, CardHeader, Col } from "reactstrap";
import { Btn, H4, P } from "../../../../AbstractElements";
import { Link } from "react-router-dom";
import { BsThreeDots } from "react-icons/bs";
import { useState } from "react";

const TotalProfitCardHeader = () => {
  const [showLink, setShowLink] = useState(false)

  return (
    <CardHeader className="pb-0">
      <div className="d-flex justify-content-between">
        <div className="flex-grow-1">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", position: "relative" }}>
            <P attrPara={{ className: "square-after f-w-600 header-text-primary mb-0" }}>
              Total Balance<i className="fa fa-circle"> </i>
            </P>
            {/* <div style={{ position: "relative" }}>
              <BsThreeDots onClick={() => setShowLink(!showLink)} cursor={"pointer"} size={20} />
              {
                showLink
                &&
                <div className="card" style={{
                  position: "absolute",
                  top: "20px",
                  right: "0",
                  zIndex: "100",
                  borderRadius: "10px",
                  border: "2px solid rgba(128,128,128,.1)"
                }}>
                  <Link to={"/load-balance"} style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "1rem",
                    gap: ".5rem"
                  }}>
                    <i className="fa fa-money" style={{ fontSize: "18px" }}></i>
                    <span style={{
                      whiteSpace: "nowrap"
                    }}>Load Balance</span>
                  </Link>
                </div>
              }
            </div> */}
            {/* <Link to={"/load-balance"} style={{ flex: 1, maxWidth: "80px", position: "absolute", zIndex: 1, right: 0, top: 0, cursor: "pointer", borderRadius: "10px", border: "1px solid rgba(128,128,128,.5)" }} className="hover-styles card">
              <Link to={"/load-balance"} className={`o-hidden header-text-primary`} style={{ marginBottom: 0, cursor: "pointer" }}>
                <Link to={"/load-balance"} className="d-flex" style={{ alignItems: 'center', padding: "1rem", flexDirection: "column-reverse", gap: "1rem", color: "inherit" }}>
                  <H4 attrH4={{ style: { padding: 0, margin: 0, textAlign: "center", fontSize: ".7rem" } }}>Load Money</H4>
                  <div style={{
                    height: "50px",
                    width: "50px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    borderRadius: "50%",
                    background: "var(--theme-default)"
                  }}>
                    <i className="fa fa-money" style={{ fontSize: "18px", color: "white" }}></i>
                  </div>
                </Link>
              </Link>
            </Link> */}
          </div>
          <H4 attrH4={{ style: { fontSize: "2rem" } }}>$8,623</H4>
        </div>
      </div>
    </CardHeader>
  );
};

export default TotalProfitCardHeader;