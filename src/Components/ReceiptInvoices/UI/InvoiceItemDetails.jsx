import React, { useContext } from 'react'
import styles from "../styles/index.module.scss"
import { useTranslation } from 'react-i18next'
import QrDetails from '../../PaymentAddressPublic/QrDetails'
import { UserContext } from '../../../Context/UserContext'
import { DownloadButton } from './FormElements'
import ShareableLink from './ShareableLink'
import { formatDateTime } from '../InvoiceTable'

const InvoiceItemDetails = ({ inv }) => {
    const { t } = useTranslation()
    const { userDetails } = useContext(UserContext)

    return (
        <div className={`${styles.expandRow}`}>
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

            <div className={styles.expandContent}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", width: "100%" }}>
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
            </div>



            <div className={styles.expandItem}>
                <span className={styles.label}> {t("Receiving Wallet")}: </span>
                <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span style={{ fontSize: "14px" }} className={styles.label}> {t("Currency")}: </span>
                        <h5>
                            {inv.receivingWallet?.currency?.code}
                        </h5>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span style={{ fontSize: "14px" }} className={styles.label}> {t("Wallet Id")}: </span>
                        <h5>
                            {inv.receivingWallet?.wallet_id}
                        </h5>
                    </div>
                </div>
            </div>
            <div className={styles.expandItem}>
                <span className={styles.label}> {t("QR Code")}: </span>
                <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "15px" }}>
                    <QrDetails inInvoiceDetails={true} inInvoice={true} invoiceId={inv.invoiceId} username={userDetails.username} />
                    <DownloadButton style={{ alignSelf: "auto" }} url={inv.qrCode?.url} />
                </div>
            </div>
            <div className={styles.expandItem}>
                <span className={styles.label}> {t("Shareable Link")}: </span>
                <ShareableLink style={{ padding: "0px", background: "none" }} hideHeader={true} invoiceId={inv.invoiceId} />
            </div>
            <div className={styles.expandItem}>
                <span className={styles.label}> {t("Extra Details")}: </span>
                <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span style={{ fontSize: "14px" }} className={styles.label}> {t("Is Shipping Address Required?")}: </span>
                        <h5>
                            {inv?.shippingAddress ? "Yes" : "No"}
                        </h5>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span style={{ fontSize: "14px" }} className={styles.label}> {t("Is Recurring Invoice?")}: </span>
                        <h5>
                            {inv.recurring ? "Yes" : "No"}
                        </h5>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span className={styles.label} style={{fontSize: "14px"}}> {t("Date & Time")}: </span>
                        <h5>
                            {formatDateTime(inv.createdAt)}
                        </h5>
                    </div>

                </div>
            </div>
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
            </div>
        </div>
    )
}

export default InvoiceItemDetails