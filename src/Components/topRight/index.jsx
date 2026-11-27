import { Col } from "reactstrap";
import { useContext } from "react";
import { UserContext } from "../../Context/UserContext";
import LanguagePicker from "../LanguagePicker";
import Notifications from "../Notifications";
import TourButton from "../ProductTour/TourButton";
import ProfileMenu from "./ProfileMenu";

const TopRight = ({ position = "absolute", withMenu = false }) => {
  const { userDetails, croppedImages, isAgentLogin, agentDetails } = useContext(UserContext);

  const isIndividual = userDetails?.account_type?.toLowerCase() === "individual";

  const renderName = () => {
    return `${userDetails?.user?.first_name} ${userDetails?.user?.last_name}`.length >= 25
      ? `${userDetails?.user?.first_name}`
      : `${userDetails?.user?.first_name} ${userDetails?.user?.last_name}`;
  };

  const name = isIndividual
    ? renderName()
    : isAgentLogin
      ? `${agentDetails?.first_name} ${agentDetails?.last_name}`
      : userDetails?.company?.company_name;

  const email = isAgentLogin ? agentDetails?.email : userDetails?.email || "";

  const photo = userDetails?.profileImage?.url
    ? croppedImages.profileDP || userDetails?.profileImage?.url
    : null;

  const initial = (
    isIndividual
      ? userDetails?.user?.first_name
      : isAgentLogin
        ? agentDetails?.first_name
        : userDetails?.company?.company_name
  )?.[0]?.toUpperCase();

  return (
    <div
      className="d-flex justify-content-between mb-4"
      style={{
        position: position,
        top: ".4rem",
        right: "0",
        gap: withMenu ? "1rem" : "2rem",
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
        <TourButton />
        <Notifications />
        <LanguagePicker />
      </div>
      {withMenu ? (
        <ProfileMenu name={name} email={email} photo={photo} initial={initial} />
      ) : (
        <Col className="ml-auto d-flex align-items-center gap-3" xs="auto">
          <div style={{ textAlign: "right" }}>
            <p style={{ padding: 0, marginBottom: "-5px", fontWeight: 700 }}>{name}</p>
            <span style={{ padding: 0, margin: 0, fontSize: ".6rem", color: "#a0a0a0" }}>
              {email}
            </span>
          </div>
          {photo ? (
            <img
              src={photo}
              alt={userDetails?.user?.first_name}
              style={{ width: "43px", borderRadius: "10px", height: "43px", objectFit: "cover" }}
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
              {initial}
            </div>
          )}
        </Col>
      )}
    </div>
  );
};

export default TopRight;
