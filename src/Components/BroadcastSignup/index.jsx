import styles from "./styles/index.module.css";
import PageHeader from "../../Common/PageHeader";
import { useEffect, useState } from "react";
import { Button, FormGroup, Input, Label, Modal, ModalBody, ModalHeader } from "reactstrap";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import MainContent from "./MainContent";

const BroadcastSignup = () => {
  const SECRET_KEY = import.meta.env.VITE_SECRET_KEY_FOR_BULK;
  const { t } = useTranslation();
  const [pass, setPass] = useState("");
  const [showModal, setShowModal] = useState(true);

  useEffect(() => {
    const allowed = sessionStorage.getItem("broadcast");
    setShowModal(!allowed);
  }, []);

  return (
    <div className={styles.container}>
      <PageHeader title={t("Onboarding Signup")} />
      {!showModal ? (
        <MainContent />
      ) : (
        <Modal isOpen={showModal}>
          <ModalHeader>{t("Pass This Security")}</ModalHeader>
          <ModalBody>
            <FormGroup>
              <Label>{t("Enter The Secret Key")}</Label>
              <Input
                placeholder={t("Enter the secret key")}
                value={pass}
                onChange={(e) => setPass(e.target.value)}
              />
            </FormGroup>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <Button
                style={{
                  background: "linear-gradient(to right bottom, #e64067, #5926f0, #4828a0)",
                  border: "none",
                  outline: "none",
                }}
                onClick={() => {
                  if (pass === SECRET_KEY) {
                    setShowModal(false);
                    sessionStorage.setItem("broadcast", true);
                  } else {
                    toast.error("Invalid Secret");
                  }
                }}
              >
                {t("Submit")}
              </Button>
            </div>
          </ModalBody>
        </Modal>
      )}
    </div>
  );
};

export default BroadcastSignup;
