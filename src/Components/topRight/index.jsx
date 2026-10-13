import { Col } from "reactstrap";
import msg from "./msg.svg";
import { useContext } from "react";
import { UserContext } from "../../Context/UserContext";
import LanguagePicker from "../LanguagePicker";
import Notifications from "../Notifications";

const TopRight = ({ position = "absolute" }) => {
  const { userDetails, croppedImages, isAgentLogin, agentDetails } = useContext(UserContext);

  const renderName = () => {
    return `${userDetails?.user?.first_name} ${userDetails?.user?.last_name}`.length >= 25
      ? `${userDetails?.user?.first_name}`
      : `${userDetails?.user?.first_name} ${userDetails?.user?.last_name}`;
  };
  return (
    <div
      className="d-flex justify-content-between mb-4"
      style={{
        // maxWidth: "350px",
        // width: "100%",
        position: position,
        top: ".4rem",
        right: "0",
        gap: "2rem",
      }}
    >
      <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
        {/* <Col xs="auto" style={{
                    padding: ".5rem",
                    boxShadow: "0px 9.94788px 10.7769px rgba(109, 41, 220, 0.17)",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    borderRadius: "10px",
                    border: "1.11414px solid rgba(0, 0, 0, 0.08)",
                    cursor: "pointer"
                }}>
                    <img src={msg} alt="" />
                </Col> */}
        <Notifications />
        <LanguagePicker />
      </div>
      <Col className="ml-auto d-flex align-items-center gap-3" xs="auto">
        <div
          style={{
            textAlign: "right",
          }}
        >
          <p style={{ padding: 0, marginBottom: "-5px", fontWeight: 700 }}>
            {userDetails?.account_type?.toLowerCase() === "individual"
              ? renderName()
              : isAgentLogin
                ? `${agentDetails?.first_name} ${agentDetails?.last_name}`
                : userDetails?.company?.company_name}
          </p>
          <span
            style={{
              padding: 0,
              margin: 0,
              fontSize: ".6rem",
              color: "#a0a0a0",
            }}
          >
            {isAgentLogin ? agentDetails?.email : userDetails?.email || ""}
          </span>
        </div>
        {userDetails?.profileImage?.url ? (
          <img
            src={croppedImages.profileDP || userDetails?.profileImage?.url}
            alt={userDetails?.user?.first_name}
            style={{
              width: "43px",
              borderRadius: "10px",
              height: "43px",
              objectFit: "cover",
            }}
          />
        ) : (
          <div
            style={{
              width: "43px",
              height: "43px",
              borderRadius: "10px",
              display: "grid",
              placeItems: "center",
              background:
                "linear-gradient(-24deg, rgb(210, 60, 122) 0%, rgb(164, 52, 167) 43.66%, rgb(88, 38, 239) 100%)",
              color: "white",
              fontSize: "1.4rem",
              fontWeight: 800,
            }}
          >
            {userDetails?.account_type?.toLowerCase() === "individual"
              ? userDetails?.user?.first_name?.[0]?.toUpperCase()
              : isAgentLogin
                ? agentDetails?.first_name?.[0]?.toUpperCase()
                : userDetails?.company?.company_name?.[0]?.toUpperCase()}
          </div>
        )}
      </Col>
    </div>
  );
};

export default TopRight;
