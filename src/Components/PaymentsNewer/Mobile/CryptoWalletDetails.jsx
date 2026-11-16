import { useTranslation } from "react-i18next";
import styles from "./styles/WalletDetails.module.css";
import { Button, Input } from "reactstrap";

const CryptoWalletDetails = ({ setWallet, setStep, wallet }) => {
  const { t } = useTranslation();

  return (
    <div className={styles.container}>
      <h5>{t("Enter the Wallet ID, Email, or Phone Number of the recipient.")}</h5>
      <div className={styles.search}>
        <input placeholder={t("Enter the Wallet ID")} />
      </div>
      <Input
        type="select"
        style={{
          background: "rgba(89, 38, 240, 0.04)",
          boxShadow: "0px 16.675323486328125px 18.0649356842041px 0px rgba(109, 41, 220, 0.04)",
          appearance: "auto",
          fontWeight: 700,
          margin: "0 auto 3rem",
          width: "90%",
        }}
      >
        <option value="">{t("Select Network")}</option>
        <option value="1">1</option>
        <option value="2">2</option>
        <option value="3">3</option>
      </Input>
      <Button className={styles.button} onClick={() => setStep((prev) => prev + 1)}>
        {t("Continue")}
      </Button>
    </div>
  );
};

export default CryptoWalletDetails;
