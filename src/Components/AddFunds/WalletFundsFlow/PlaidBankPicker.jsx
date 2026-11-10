import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { UserContext } from "../../../Context/UserContext";
import cardStyles from "../../PaymentsNewer/InternationalFlow/styles/creditcard.module.css";
import BankIbanSelection from "./BankIbanSelection";
import styles from "./BankDeposit.module.scss";
import { useQuery } from "@tanstack/react-query";
import { apiWrapper } from "../../../utils/Functions/apiWrapper";

const PlaidBankPicker = ({ value, onChange }) => {
  const { t } = useTranslation();
  const { userDetails } = useContext(UserContext);

  const { data: bankList = [], isLoading } = useQuery({
    queryKey: ["saved-banks", userDetails?._id],
    queryFn: async () => {
      const dec = await apiWrapper({
        endpoint: `/api/plaid/saved-banks/${userDetails._id}`,
        method: "GET",
        isDecrypted: false,
      });
      console.log("TEST", dec?.data);

      return dec?.data;
    },
  });

  return (
    <BankIbanSelection
      savedBanks={bankList}
      banksLoading={isLoading}
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
