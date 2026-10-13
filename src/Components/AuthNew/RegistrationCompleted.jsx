import styles from "./styles/rc.module.css";
import logo from "./files/logo_dark.svg";
import FormLogo from "./FormLogo";

// icons
import features from "./files/features.svg";
import security from "./files/security.svg";
import global from "./files/global.svg";
import seemless from "./files/seemless.svg";
import { Button } from "reactstrap";
import { ChevronRight } from "react-feather";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";

const data = [
  {
    label: "Access to Full Features",
    icon: features,
  },
  {
    label: "Enhanced Security",
    icon: security,
  },
  {
    label: "Global Transactions",
    icon: global,
  },
  {
    label: "Seamless Banking Integration",
    icon: seemless,
  },
  {
    label: "Contribute to a Safer Financial Ecosystem",
    icon: seemless,
  },
];

const RegistrationCompleted = ({ setStep, setIsLoginForm }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  return (
    <div className={styles.container}>
      <div className={styles.left}>
        <h1>{t("Registration Completed")}</h1>
        <h2>
          {t("Unleash The Potential Of Social Media Payments with InstaPay")}
        </h2>
        <h3>{t("Few clicks away from transforming your life!")}</h3>
        <img src={logo} alt="Instapay" />
      </div>
      <div className={styles.right}>
        <FormLogo />
        <h2>{t("Unlock the Future of Finance")}</h2>
        <h3>{t("Verify Your Identity and get the most out of it!")}</h3>
        <div className={styles.adv}>
          {data.map((item) => (
            <div className={styles.ad_item}>
              <div className={styles.icon}>
                <img src={item.icon} alt="" />
              </div>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
        <p>{t("& More..")}</p>

        <Button
          onClick={() => {
            setStep(1);
            setIsLoginForm(true);
            navigate("/login");
          }}
        >
          <span>{t("Verify Your Account")}</span>
          <ChevronRight />
        </Button>
      </div>
    </div>
  );
};

export default RegistrationCompleted;
