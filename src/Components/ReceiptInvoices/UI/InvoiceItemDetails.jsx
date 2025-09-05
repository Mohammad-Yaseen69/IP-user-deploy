import React, { useContext } from 'react'
import styles from "../styles/index.module.scss"
import { useTranslation } from 'react-i18next'
import QrDetails from '../../PaymentAddressPublic/QrDetails'
import { UserContext } from '../../../Context/UserContext'
import { DownloadButton, InfoItem } from './FormElements'
import ShareableLink from './ShareableLink'
import { formatDateTime } from '../InvoiceTable'
import { Toggle } from '../../MyMasterCard/CardPurchased'

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

            <InfoItem label="Invoice Link">
                <ShareableLink style={{ padding: "0px", background: "none" }} hideHeader={true} invoiceId={inv.invoiceId} />
            </InfoItem>

            <InfoItem label="Description">
                <h5>
                    {inv.description}
                </h5>
            </InfoItem>


            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <InfoItem label="QR Code">
                    <div style={{ display: "flex", gap: "15px", flexDirection: "column" }}>
                        <QrDetails inInvoiceDetails={true} inInvoice={true} invoiceId={inv.invoiceId} username={userDetails.username} />
                        <DownloadButton style={{ alignSelf: "auto" }} url={inv.qrCode?.url} />
                    </div>
                </InfoItem>

                <div style={{ display: "grid", gap: "10px" }}>
                    <InfoItem label="Extra Details">
                        <div>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                <span style={{ fontSize: "14px" }} className={styles.label}> {t("Shipping")}: </span>
                                <Toggle checked={inv?.shippingAddress} />
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "10px" }}>
                                <span style={{ fontSize: "14px" }} className={styles.label}> {t("Recurring")}: </span>
                                <Toggle checked={inv?.recurring} />
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "10px" }}>
                                <span className={styles.label} style={{ fontSize: "14px" }}> {t("Date")}: </span>
                                <h5>
                                    {formatDateTime(inv.createdAt, "date")}
                                </h5>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "10px" }}>
                                <span className={styles.label} style={{ fontSize: "14px" }}> {t("Time")}: </span>
                                <h5>
                                    {formatDateTime(inv.createdAt, "time")}
                                </h5>
                            </div>
                        </div>
                    </InfoItem>

                    <InfoItem label="Receiving Wallet">
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
                    </InfoItem>

                    <InfoItem label={"Is Payable"}>
                        <h5>
                            {inv.paid ? "This Invoice is not Payable." : "This Invoice is payable."}
                        </h5>
                    </InfoItem>
                </div>
            </div>

            <div className={styles.expandContent}>
                <InfoItem label="Recipient">
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
                </InfoItem>
            </div>
        </div>
    )
}

export default InvoiceItemDetails