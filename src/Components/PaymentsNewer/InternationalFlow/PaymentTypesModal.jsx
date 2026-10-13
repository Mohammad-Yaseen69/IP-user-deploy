import styles from "./styles/ptm.module.css";
import { Modal, ModalBody } from "reactstrap";
import x from "./files/x.svg";
import { typesData } from "./StepFour";
import { useTranslation } from "react-i18next";

const PaymentTypesModal = ({ isOpen, toggle }) => {
  const { t } = useTranslation();
  return (
    <Modal
      isOpen={isOpen}
      style={{ borderRadius: "0px", width: "96vw", maxWidth: "1300px" }}
    >
      <ModalBody className={styles.body}>
        <div className={styles.top}>
          <div className={styles.left}>
            <span>{t("Payment Methods")}</span>
            <h5>
              {t(
                "These are the supported payment methods for completing your transaction.",
              )}
            </h5>
          </div>
          <div className={styles.close} onClick={toggle}>
            <img src={x} alt="" />
          </div>
        </div>
        <div className={styles.payment_method}>
          {typesData.map((item) => (
            <div
              className={`${styles.pm_item} ${item.status === "Active" ? "" : styles.disabled}`}
              key={item.value}
            >
              <img src={item.icon} alt="" />
              <span>{item.name}</span>
              {item.status !== "Active" && (
                <div className={styles.coming_soon}>{t("(Coming soon)")}</div>
              )}
            </div>
          ))}
        </div>
      </ModalBody>
    </Modal>
  );
};

export default PaymentTypesModal;
