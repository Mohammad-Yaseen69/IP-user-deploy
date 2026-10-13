import React, { useContext, useState } from "react";
import { Modal, Button } from "react-bootstrap";
import { UserContext } from "../../../Context/UserContext";
import KYCModal from "./KYCModal";
import { AlertCircle } from "react-feather";

const VerificationAlert = () => {
  const [showModal, setShowModal] = useState(false);

  const { userDetails: userInformation } = useContext(UserContext);
  const t = (text) => text;

  return (
    <div
      style={{ display: "flex", alignItems: "center" }}
      onClick={(e) => {
        e.stopPropagation();
        setShowModal(true);
      }}
    >
      <KYCModal
        showModal={showModal}
        setShowModal={setShowModal}
        KYCComments={userInformation?.user?.kyc_all_comments}
        KYCStatus={userInformation?.user?.kyc_all_status}
      />
      <AlertCircle color="#dc3545" size={17} />
    </div>
  );
};

export default VerificationAlert;
