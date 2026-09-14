import React, { useContext } from "react";
import styles from "./styles/transactionType.module.css";
import { UserContext } from "../../../Context/UserContext";
import { useTranslation } from "react-i18next";

const TransactionTypeSelection = ({ data, dataHandler }) => {
    const { userDetails } = useContext(UserContext)
    const { t } = useTranslation()
    const selected = data?.transactionType;

    const handleSelect = (type) => {
        dataHandler("transactionType", type);
        const sender = data?.sendingType || (userDetails?.account_type === "individual" ? "C" : "B");
        dataHandler("flow", `${sender}2${type}`);
    };

    return (
        <div className={styles.wrapper}>
            <h4>{t("Select Transaction Type")}</h4>
            <p>{t("Choose who you are sending the payment to.")}</p>

            <div className={styles.cards}>
                <div
                    className={`${styles.card} ${selected === "C" ? styles.active : ""}`}
                    onClick={() => handleSelect("C")}
                >
                    <h3>{t("Individual")}</h3>
                    <p>{t("Send money to a personal account holder.")}</p>
                </div>

                <div
                    className={`${styles.card} ${selected === "B" ? styles.active : ""}`}
                    onClick={() => handleSelect("B")}
                >
                    <h3>{t("Business")}</h3>
                    <p>{t("Transfer funds to a registered business account.")}</p>
                </div>
            </div>

        </div>
    );
};

export default TransactionTypeSelection;