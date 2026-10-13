import { useTranslation } from "react-i18next";
import { Modal, ModalBody, ModalHeader, ModalFooter, Button } from "reactstrap";

const GeneralNoticeModal = ({
  isOpen,
  toggle,
  message,
  buttonText,
  onConfirm,
}) => {
  const { t } = useTranslation();

  return (
    <Modal isOpen={isOpen} toggle={toggle} centered>
      <ModalHeader toggle={toggle}>{t("Notice")}</ModalHeader>
      <ModalBody>
        <div style={{ fontSize: "16px", fontWeight: 500 }}>{t(message)}</div>
      </ModalBody>
      {buttonText && onConfirm && (
        <ModalFooter>
          <Button color="secondary" onClick={toggle}>
            {t("Cancel")}
          </Button>
          <Button color="primary" onClick={onConfirm}>
            {t(buttonText)}
          </Button>
        </ModalFooter>
      )}
    </Modal>
  );
};

export default GeneralNoticeModal;
