import { Modal, ModalBody } from "reactstrap";
import styles from "../LinkToTelegramModal/styles/index.module.css";
import { useTranslation } from "react-i18next";
import { useContext, useEffect, useRef, useState } from "react";
import { UserContext } from "../../Context/UserContext";
import SuccessModal from "../AddBeneficiary/SuccessModal";
import close from "../LinkToTelegramModal/files/close.svg";
import whatsappVideo from "./whatsapp.mp4";

const steps = [
  {
    step: "Step 01 – From WhatsApp App",
    name: "Step 01 – From WhatsApp App",
    desc: `Open WhatsApp, tap the link below or save the number +41783192428 to your contacts, then open the chat and send "Hi" to start the conversation with the InstaPay AI chatbot.`,
  },
  {
    step: "Step 02 – From InstaPay WhatsApp Bot",
    name: "Step 02 – From InstaPay WhatsApp Bot",
    desc: `The InstaPay AI chatbot will ask you what you'd like to do. Select "Connect" to link your account, and the chatbot will prompt you to enter your InstaPay username.`,
  },
  {
    step: "Step 03 – From InstaPay WhatsApp Bot",
    name: "Step 03 – From InstaPay WhatsApp Bot",
    desc: `The InstaPay AI chatbot will then ask for your InstaPay PIN. Click (Enter the PIN) button then enter the PIN you have set on your Instapay account and click send.`,
  },
  {
    step: "Step 04 – From InstaPay WhatsApp Bot",
    name: "Step 04 – From InstaPay WhatsApp Bot",
    desc: `You will receive a congratulatory message confirming that your WhatsApp account is now synced with InstaPay. You can now start using InstaPay services directly from WhatsApp.`,
  },
];

const tips = [
  {
    strong: "Secure Your Account",
    desc: "1.\tSecure Your Account: Ensure your WhatsApp account is secure by enabling two-factor authentication (2FA) to protect your linked InstaPay services.",
  },
  {
    strong: "Explore More",
    desc: "2.\tExplore More: Once linked, explore the wide range of services InstaPay offers, from seamless transactions to instant withdrawals.",
  },
  {
    strong: "Stay Updated",
    desc: "3.\tStay Updated: Keep an eye on our updates, as we will soon support linking other social media accounts to make your experience even more integrated.",
  },
  {
    strong: "Help & Support",
    desc: "4.\tHelp & Support: If you face any issues during the linking process, contact our support team for assistance.",
  },
];

const WHATSAPP_URL = "https://wa.me/41783192428";

const LinkToWhatsappModal = ({ isOpen, toggle }) => {
  const { t } = useTranslation();
  const { userDetails, verifyToken } = useContext(UserContext);
  const [showSuccess, setShowSuccess] = useState(false);
  const modalRef = useRef(null);

  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.scrollTop = 0;
    }
  }, [isOpen]);

  useEffect(() => {
    let interval;
    if (userDetails?.whatsapp_bot) {
      setShowSuccess(true);
    } else if (isOpen && !userDetails?.whatsapp_bot) {
      interval = setInterval(() => {
        verifyToken();
      }, 3000);
    }

    return () => clearInterval(interval);
  }, [isOpen, userDetails]);

  return (
    <>
      {!showSuccess ? (
        <Modal
          isOpen={isOpen}
          toggle={toggle}
          style={{ maxWidth: "920px", width: "100vw" }}
          contentClassName={styles.content}
          onOpened={() => {
            const modalContent = document.querySelector(`.${styles.container}`);
            if (modalContent) {
              modalContent.scrollTop = 0;
            }
          }}
          scrollable={true}
        >
          <ModalBody className={styles.container} ref={modalRef}>
            <div className={styles.left}>
              {window.innerWidth > 900 && <h1>{t("Link Your WhatsApp Account to InstaPay")}</h1>}
              <div className={styles.guide}>
                {steps.map((item) => (
                  <div className={styles.guide_item} key={item.step}>
                    <h2 className={styles.step_count}>{t(item.step).split(" – ")[0]}</h2>
                    <div className={styles.gi_right}>
                      <h3>{t(item.name).split(" – ")[1]}</h3>
                      <p>{t(item.desc)}</p>
                    </div>
                  </div>
                ))}
                <h4>{t("Additional Tips")}: </h4>
                <ul className={styles.tips}>
                  {tips.map((item) => (
                    <li key={item.strong}>{t(item.desc)}</li>
                  ))}
                </ul>
                <h4>{t("Future Enhancements")}</h4>
                <p>
                  {t(
                    "In the near future, InstaPay will allow you to link more social media accounts, providing you with even more flexibility and convenience. Stay tuned for exciting updates!",
                  )}
                </p>
              </div>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  gap: "1rem",
                }}
              >
                <button
                  className={styles.button}
                  style={{ color: "white" }}
                  onClick={() => window.open(WHATSAPP_URL, "_blank")}
                >
                  {t("Go to InstaPay WhatsApp account")}
                </button>
              </div>
            </div>
            <div className={styles.right}>
              {window.innerWidth < 900 && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: ".75rem",
                  }}
                >
                  <h1>{t("Link Your WhatsApp Account to InstaPay")}</h1>
                  <img
                    src={close}
                    alt="close"
                    style={{ height: "50px", width: "50px" }}
                    onClick={() => {
                      toggle();
                    }}
                  />
                </div>
              )}
              <video src={whatsappVideo} autoPlay={true} muted loop></video>
              <button
                style={{
                  border: "none",
                  outline: "none",
                  backgroundColor: "transparent",
                  padding: "0",
                  cursor: "pointer",
                  textAlign: "right",
                  marginLeft: "7px",
                  marginTop: "1rem",
                }}
                onClick={toggle}
              >
                {t("Skip")}
              </button>
            </div>
          </ModalBody>
        </Modal>
      ) : (
        <SuccessModal
          isOpen={showSuccess}
          message={`Your InstaPay account has been connected to Your WhatsApp Account`}
          subMessage={"WhatsApp Linked Successfully!"}
          toggle={() => {
            toggle();
            setShowSuccess(false);
          }}
        />
      )}
    </>
  );
};

export default LinkToWhatsappModal;
