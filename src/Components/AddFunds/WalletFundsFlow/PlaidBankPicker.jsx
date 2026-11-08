import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { UserContext } from "../../../Context/UserContext";
import cardStyles from "../../PaymentsNewer/InternationalFlow/styles/creditcard.module.css";
import BankIbanSelection from "./BankIbanSelection";
import styles from "./BankDeposit.module.scss";

const PlaidBankPicker = ({ value, onChange }) => {
  const { t } = useTranslation();
  const { userDetails, authHeader } = useContext(UserContext);
  const [savedBanks, setSavedBanks] = useState([]);

  useEffect(() => {
    if (!userDetails?._id) return;

    axios
      .get(`${import.meta.env.VITE_IP_DEV_API}/api/plaid/saved-banks/${userDetails._id}`, {
        headers: authHeader,
      })
      .then((res) => setSavedBanks(res.data?.data || []))
      .catch(() => setSavedBanks([]));
  }, [userDetails?._id]);

  return (
    <BankIbanSelection
      savedBanks={savedBanks}
      selectedBankId={value.savedBankId}
      setSelectedBankId={(id) => onChange((prev) => ({ ...prev, savedBankId: id }))}
      recipientData={{ iban: value.recipient_iban }}
      handleRecipientChange={(_, iban) => onChange((prev) => ({ ...prev, recipient_iban: iban }))}
      t={t}
      styles={styles}
      cardStyles={cardStyles}
    />
  );
};

export default PlaidBankPicker;
