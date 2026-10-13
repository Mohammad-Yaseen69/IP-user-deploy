import axios from "axios";
import { useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { Button, Modal, ModalBody, ModalFooter } from "reactstrap";
import { UserContext } from "../../Context/UserContext";
import { decryptData } from "../../Helper/EssentilaMethods/Decryption";
import logoutIcon from "../../Layout/SidebarNew/files/logout_a.svg";
import as from "../Auth/files/as.svg";
import authenticatorImg from "../Auth/files/authenticator.webp";
import gs from "../Auth/files/gs.svg";
import authStyles from "../Auth/styles/index.module.css";
import GoogleAuthenticatorModal from "../GoogleAuthenticatorModal";
import styles from "./styles/index.module.css";

const ForcedAuthenticatorModal = () => {
  const { t } = useTranslation();
  const { userDetails, authHeader, logout } = useContext(UserContext);

  const [enablingAuth, setEnablingAuth] = useState(false);
  const [authenticatorDetails, setAuthenticatorDetails] = useState(null);
  const [showSetupModal, setShowSetupModal] = useState(false);

  const handleLogout = () => {
    sessionStorage.clear();
    logout();
  };

  const enableAuthenticator = async () => {
    if (!userDetails?._id) return;
    setEnablingAuth(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_IP_DEV_API}/api/account/enable-2fa/${userDetails?._id}`,
        { headers: authHeader },
      );
      const decrypted = decryptData(response.data.data);
      if (decrypted?.data) {
        setAuthenticatorDetails(decrypted.data);
        setShowSetupModal(true);
      } else {
        toast.error(decrypted?.message || t("Unable to initialize Google Authenticator."));
      }
    } catch (error) {
      const decrypted = decryptData(error?.response?.data?.data);
      toast.error(decrypted?.message || t("Something went wrong while setting up authenticator."));
    } finally {
      setEnablingAuth(false);
    }
  };

  if (showSetupModal && authenticatorDetails) {
    return (
      <GoogleAuthenticatorModal
        isOpen={showSetupModal}
        toggle={() => setShowSetupModal(false)}
        authenticatorDetails={authenticatorDetails}
        setAuthenticatorActive={() => {
          sessionStorage.removeItem("force_auth_on_login");
        }}
        setEditMode={() => {}}
        sideText="Google Authenticator"
        successTitle="Google Two Factor Authentication Is Now Linked To Your Instapay Account."
      />
    );
  }

  return (
    <Modal
      isOpen={true}
      centered
      backdrop="static"
      keyboard={false}
      style={{ width: "96vw", maxWidth: "900px", margin: "1rem auto" }}
    >
      <div className={styles.modalHeader}>
        <h5 className={styles.modalTitle}>{t("Link Google Authenticator")}</h5>
        <div className={styles.topActions}>
          {/* <div className={styles.actionItem}>
                        <div className={styles.langWrapper}>
                            <LanguagePicker size="16" backgroundWhite={true} />
                        </div>
                    </div> */}
          <div className={styles.actionItem} onClick={handleLogout}>
            <img
              src={logoutIcon}
              alt="Logout"
              style={{ height: "20px", width: "20px", objectFit: "contain" }}
            />
            <span>{t("Logout")}</span>
          </div>
        </div>
      </div>
      <ModalBody style={{ padding: 0 }}>
        <div className={authStyles.auth_details}>
          <div className={authStyles.left}>
            <h5>
              {t("Two-factor authentication (2FA) is the best way to protect yourself online.")}
            </h5>
            <p>
              {t(
                "We recommend you download and install the Google Authenticator app to ensure you receive your verification codes instantly, avoiding any SMS delays or issues.",
              )}
            </p>
            <div className={authStyles.download_info}>
              <a
                rel="noreferrer"
                href="https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2&hl=en&pli=1"
                target="_blank"
              >
                <img src={gs} alt="Google Play" />
              </a>
              <a
                rel="noreferrer"
                href="https://apps.apple.com/us/app/google-authenticator/id388497605"
                target="_blank"
              >
                <img src={as} alt="App Store" />
              </a>
            </div>
          </div>
          <div className={authStyles.right}>
            <a
              rel="noreferrer"
              href="https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2&hl=en&pli=1"
              target="_blank"
            >
              <img src={authenticatorImg} alt="Google Authenticator" />
            </a>
            <h4>{t("Strong security with Google Authenticator")}</h4>
          </div>
        </div>
      </ModalBody>
      <ModalFooter
        style={{
          display: "flex",
          gap: "1rem",
          justifyContent: "flex-end",
          position: "relative",
          zIndex: 1,
        }}
      >
        <Button className={styles.btnPrimary} disabled={enablingAuth} onClick={enableAuthenticator}>
          {enablingAuth ? (
            <div className="spinner-border spinner-border-sm text-light" role="status" />
          ) : (
            t("Enable Google Authenticator")
          )}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default ForcedAuthenticatorModal;
