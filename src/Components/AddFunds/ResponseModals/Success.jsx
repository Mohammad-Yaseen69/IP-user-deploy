import React, { useMemo } from "react";
import { CheckCircle, Clock } from "react-feather";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Modal, ModalBody } from "reactstrap";
import errors from "../TrustPaymentErrors.json";

const Success = ({
  message = "",
  link = "/wallets",
  page = "My Wallets",
  type = "success",
  linkText = "Go To ",
}) => {
  const { code } = useParams();
  const navigate = useNavigate();

  const error_message = () => {
    return (
      errors?.[code] ??
      "We cannot process your request at the moment, please try again later."
    );
  };
  return (
    <Modal
      toggle={() => navigate(link)}
      style={{ margin: "0px auto" }}
      isOpen={true}
    >
      <ModalBody
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {type === "success" ? (
          <CheckCircle color="green" size={90} />
        ) : (
          <Clock color="orange" size={90} />
        )}
        <h4
          style={{
            color: type === "success" ? "green" : "orange",
            margin: "10px 0 20px",
            fontSize: "1.25rem",
          }}
        >
          {type === "success"
            ? "Transaction Successful!"
            : "Transaction Pending"}
        </h4>
        <p
          style={{
            color: "#a8a8a8",
            textAlign: "center",
            fontWeight: 600,
            width: "100%",
          }}
        >
          {message} {error_message}{" "}
          {!window.location.pathname.includes("/chatbot/") && (
            <Link to={link} style={{ color: "#5926f0" }}>
              {linkText} {page}.
            </Link>
          )}
        </p>
      </ModalBody>
    </Modal>
  );
};

export default Success;
