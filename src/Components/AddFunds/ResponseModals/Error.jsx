import { XCircle } from "react-feather";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Modal, ModalBody } from "reactstrap";
import errors from "../TrustPaymentErrors.json";

const Error = ({ linkText = "Try Again.", link = "/add-funds" }) => {
  const { code } = useParams();
  const navigate = useNavigate();

  const error_message = () => {
    return (
      errors.find((item) => item?.code == code)?.message ??
      "We cannot process your request at the moment, please try again later."
    );
  };
  return (
    <Modal toggle={() => navigate(link)} isOpen={true}>
      <ModalBody
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <XCircle color="red" size={90} />
        <h4 style={{ color: "red", margin: "10px 0 10px", fontSize: "1.25rem" }}>
          Transactions Failed!
        </h4>
        <p style={{ color: "#a8a8a8", textAlign: "center", fontWeight: 600 }}>
          {error_message()}{" "}
          {!window.location.pathname.includes("/chatbot/") && (
            <Link to={link} style={{ color: "#5926f0" }}>
              {linkText}
            </Link>
          )}
        </p>
      </ModalBody>
    </Modal>
  );
};

export default Error;
