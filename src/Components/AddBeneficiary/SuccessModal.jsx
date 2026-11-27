import { Modal, ModalBody } from "reactstrap";
import { CheckCircle } from "react-feather";
import { useTranslation } from "react-i18next";

const SuccessModal = ({
  isOpen,
  toggle,
  message,
  subMessage,
  showSpan = false,
  spanFunc = () => {},
}) => {
  const { t } = useTranslation();
  return (
    <Modal style={{ margin: "0, auto" }} isOpen={isOpen} toggle={toggle}>
      <ModalBody>
        <h5
          className="modal-title"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginBottom: "2rem",
            textAlign: "center",
          }}
        >
          <CheckCircle size={64} className="text-success" />

          {t(subMessage)}
        </h5>
        <div className="text-center">
          <p className="mb-0">
            {t(message)}
            {showSpan && (
              <span
                style={{
                  color: "#5926f0",
                  fontWeight: 600,
                  textDecoration: "underline",
                }}
                onClick={spanFunc}
              >
                {t("Continue")}
              </span>
            )}
          </p>
        </div>
      </ModalBody>
    </Modal>
  );
};

export default SuccessModal;
