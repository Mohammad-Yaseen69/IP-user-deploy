import styles from "./styles/index.module.css";
import bell from "./files/bell.svg";
import { Button, Modal, ModalBody } from "reactstrap";
import { useTranslation } from "react-i18next";
import { clearAuthStorage, getLoginPath } from "../../utils/Functions/loginPage";
import { ChevronRight } from "react-feather";
import { useNavigate } from "react-router";

const InactivityLogoutModal = ({ isOpen, toggle }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  return (
    <Modal
      isOpen={isOpen}
      style={{ width: "100vw", maxWidth: "530px" }}
      contentClassName={styles.con}
    >
      <ModalBody className={styles.content}>
        <img src={bell} alt="Bell Icon" />
        <h1>{t("You’ve been logged out.")}</h1>
        <p>
          {t(
            "For your security, you’ve been logged out after 15 minutes of inactivity. Please log in again if you wish to use InstaPay.",
          )}
        </p>
        <Button
          onClick={() => {
            toggle();
            clearAuthStorage();
            navigate(getLoginPath());
          }}
        >
          <span>{t("LOGIN AGAIN").toLowerCase()}</span>
          <ChevronRight size={18} color="white" />
        </Button>
      </ModalBody>
    </Modal>
  );
};

export default InactivityLogoutModal;
