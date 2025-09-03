import React from 'react'
import styles from "../styles/index.module.scss"
import { useTranslation } from 'react-i18next'

const InvoiceItemDetails = ({ inv }) => {
    const { t } = useTranslation()

    return (
        <div className={`${styles.tr} ${styles.expandRow}`}>
            <div className={styles.expandContent}>
                <div className={styles.expandItem}>
                    <span className={styles.label}> {t("Title")}: </span>
                    <h5>
                        {inv.title}
                    </h5>
                </div>
                <div className={styles.expandItem}>
                    <span className={styles.label}> {t("Description")}: </span>
                    <h5>
                        {inv.description}
                    </h5>
                </div>                                                </div>
            <div className={styles.expandContent}>
                <div className={styles.expandItem}>
                    <span className={styles.label}> {t("Recipient")}: </span>
                    <div className={styles.recipient}>
                        <img src="https://thispersondoesnotexist.com" alt="" />
                        <div>
                            <h4>
                                {inv.recipient}
                            </h4>
                            <span className={styles.label}>
                                {t("IBAN")} : {"13123131"}
                            </span>
                        </div>
                    </div>
                </div>
                <div className={`${styles.expandItem} ${styles.amount} `}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", alignSelf: "stretch" }}>
                        <span className={styles.label}> {t("Amount")}: </span>

                        <span className={styles.badge}>
                            {("Processing")}
                        </span>
                    </div>
                    <h2>
                        {inv.currency} {Number(inv.amount).toFixed(2)}
                    </h2>
                </div>
            </div>
        </div>
    )
}

export default InvoiceItemDetails