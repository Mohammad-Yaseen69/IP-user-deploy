import React, { useContext, useEffect } from "react";
import styles from "./styles/transactionType.module.css";
import { UserContext } from "../../../Context/UserContext";
import { useTranslation } from "react-i18next";

const SendingTypeSelection = ({ data, dataHandler }) => {
    const { userDetails } = useContext(UserContext);
    const { t } = useTranslation();
    const selected = data?.sendingType;
    const defaultType = userDetails?.account_type === "individual" ? "C" : "B";

    useEffect(() => {
        if (!selected && userDetails?.account_type) {
            dataHandler("sendingType", defaultType);
        }
    }, [userDetails, selected, defaultType, dataHandler]);

    const handleSelect = (type) => {
        dataHandler("sendingType", type);
        if (data?.transactionType) {
            dataHandler("flow", `${type}2${data.transactionType}`);
        }
    };

    return (
        <div className={styles.wrapper}>
            <h4>{t("Select Sending Type")}</h4>
            <p>{t("Choose how you are sending the payment.")}</p>

            <div className={styles.cards}>
                <div
                    className={`${styles.card} ${styles.sendingCard} ${selected === "C" ? styles.active : ""}`}
                    onClick={() => handleSelect("C")}
                >
                    {defaultType === "C" && (
                        <span className={styles.defaultPill}>{t("Default")}</span>
                    )}
                    <h3>{t("Individual")}</h3>
                    <p>{t("Send money from a personal account.")}</p>
                </div>

                <div
                    className={`${styles.card} ${styles.sendingCard} ${selected === "B" ? styles.active : ""}`}
                    onClick={() => handleSelect("B")}
                >
                    {defaultType === "B" && (
                        <span className={styles.defaultPill}>{t("Default")}</span>
                    )}
                    <h3>{t("Business")}</h3>
                    <p>{t("Send money from a registered business account.")}</p>
                </div>
            </div>
        </div>
    );
};

export default SendingTypeSelection;
