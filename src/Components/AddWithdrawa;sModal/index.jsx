import { Modal, ModalBody } from "reactstrap";
import styles from "./styles/index.module.css";
import { useTranslation } from "react-i18next";
import wd from "./files/wd.png";
import close from "../LinkToInstagramModal/files/close.svg";
import close_w from "./files/close_w.svg";
import bank from "./files/bank.svg";
import { useNavigate } from "react-router";

const steps = [
  {
    step: "Step 01 – Go to Settings",
    name: "Step 01 – Go to Settings",
    desc: `Open your InstaPay app and navigate to the "Settings" section.`,
  },
  {
    step: "Step 02 – Select Receiving Accounts",
    name: "Step 02 – Select Receiving Accounts",
    desc: `Tap on "Receiving Accounts" to start adding your details.`,
  },
  {
    step: "Step 03 – Add Your Accounts",
    name: "Step 03 – Add Your Accounts",
    desc: `Enter the details for each account where you want to receive payments. This includes`,
    list: [
      "Bank accounts",
      "Mobile wallets/mobile money",
      // "Crypto wallets",
      "Cash pick-up locations",
    ],
  },
  {
    step: "Step 04 – Verify Your Accounts",
    name: "Step 04 – Verify Your Accounts",
    desc: `Make sure all your account details are correct to avoid any delays in receiving your funds.`,
  },
  {
    step: "Step 05 – Save and Confirm",
    name: "Step 05 – Save and Confirm",
    desc: `Once you’ve added all your accounts, save the settings. Now you’re ready to receive payments instantly!`,
  },
];

const AddWithdrawalsModal = ({ isOpen, toggle }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  return (
    <Modal
      isOpen={isOpen}
      toggle={toggle}
      style={{ maxWidth: "961px", width: "100vw" }}
      contentClassName={styles.content}
    >
      <ModalBody className={styles.container}>
        <div className={styles.left}>
          {window.innerWidth > 900 && (
            <>
              <h2>{t("Receiving Accounts")}</h2>
              <h1>{t("Get Paid Instantly: Set Up Your Receiving Accounts Now!")}</h1>
            </>
          )}

          <div className={styles.guide}>
            <p style={{ marginBottom: ".7rem" }}>
              {t(
                "Welcome to InstaPay! To make sure you can cash out instantly from the funds you receive, you'll need to set up your receiving accounts in the settings. This will allow you to seamlessly transfer money to your preferred bank accounts, mobile wallets, crypto wallets, or cash pick-up locations.",
              )}
            </p>
            <p>
              {t(
                "Follow these simple steps to set up your receiving accounts and ensure you're always ready to access your funds:",
              )}
            </p>
            {steps.map((item) => (
              <div className={styles.guide_item} key={item.step}>
                <h2 className={styles.step_count}>{t(item.step).split(" – ")[0]}</h2>
                <div className={styles.gi_right}>
                  <h3>{t(item.name).split(" – ")[1]}</h3>
                  <p>{t(item.desc)}</p>
                  {item?.list && (
                    <ul>
                      {item?.list?.map((it) => (
                        <li>{t(it)}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ))}
            <h3>{t("Stay connected and in control of your money with InstaPay!")}</h3>
          </div>
          <button
            className={styles.button}
            onClick={() => {
              navigate("/settings?tab=withdrawal");
              toggle();
            }}
          >
            <img src={bank} alt="#" />
            <span>{t("Start Adding Accounts")}</span>
          </button>
        </div>
        <div className={styles.right} style={{ position: "relative" }}>
          {window.innerWidth < 900 && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: ".75rem",
              }}
            >
              <h1>{t("Get Paid Instantly: Set Up Your Receiving Accounts Now!")}</h1>
              <span onClick={toggle}>
                <img src={close} alt="close" style={{ height: "50px", width: "50px" }} />
              </span>
            </div>
          )}
          {window.innerWidth > 900 && (
            <span onClick={toggle} style={{ position: "absolute", top: "1rem", right: "1rem" }}>
              <img src={close_w} alt="close" style={{ height: "50px", width: "50px" }} />
            </span>
          )}
          <img src={wd} alt="" />
        </div>
      </ModalBody>
    </Modal>
  );
};

export default AddWithdrawalsModal;
