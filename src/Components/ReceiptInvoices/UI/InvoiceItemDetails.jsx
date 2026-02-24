import { useContext, useState } from "react";
import styles from "../styles/index.module.scss";
import { useTranslation } from "react-i18next";
import QrDetails from "../../PaymentAddressPublic/QrDetails";
import { UserContext } from "../../../Context/UserContext";
import { DownloadButton, InfoItem } from "./FormElements";
import ShareableLink from "./ShareableLink";
import { formatDateTime } from "../InvoiceTable";
import { Toggle } from "../../MyMasterCard/CardPurchased";
import { ChevronDown } from "react-feather";
import useWindowWidth from "../../../utils/useWindowWidth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiWrapper } from "../../../utils/Functions/apiWrapper";
import { decryptData } from "../../../Helper/EssentilaMethods/Decryption";
import { toast } from "react-toastify";

const InvoiceItemDetails = ({ inv }) => {
  const { t } = useTranslation();
  const { userDetails } = useContext(UserContext);
  const [openRecipientIds, setOpenRecipientIds] = useState(new Set());
  const queryClient = useQueryClient();
  const width = useWindowWidth();
  const [active, setActive] = useState(inv.active)
  const { mutateAsync, isPending } = useMutation({
    mutationFn: () => apiWrapper({
      endpoint: `/api/invoice/toggle-active/${inv._id}`,
      method: "PUT"
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["GetInvoicesList"] });
    },
    onError: (res) => {
      const dec = decryptData(res.response?.data?.data)
      toast.error(dec.message || "We are unable to process your request at the moment.")
    }
  })

  const toggleRecipient = (id) => {
    setOpenRecipientIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div style={{ paddingTop: "0px" }} className={`${styles.expandRow}`}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
        <span style={{ fontWeight: 600, fontSize: "20px" }}>
          {t("Active")}
        </span>
        <Toggle
          checked={active}
          onChange={() => !isPending && mutateAsync().then(() => setActive(!active))}
        />
      </div>
      <div className={`${styles.expandItem} ${styles.amount} `}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            alignSelf: "stretch",
          }}
        >
          <span className={styles.label}> {t("Amount")}: </span>
          <span className={styles.badge}>{t(!active ? "Inactive" : inv.status)}</span>
        </div>
        <h2>
          {inv.currency} {Number(inv.amount).toFixed(2)}
        </h2>
      </div>
      <InfoItem label="Invoice Link">
        <ShareableLink
          style={{ padding: "0px", background: "none" }}
          hideHeader={true}
          invoiceId={inv.invoiceId}
        />
      </InfoItem>

      <InfoItem label="Description">
        <h5 style={{ wordBreak: "break-all" }}>{inv.description}</h5>
      </InfoItem>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: width > 420 ? "1fr 1fr" : "1fr",
          gap: "10px",
        }}
      >
        <InfoItem label="QR Code">
          <div
            style={{ display: "flex", gap: "15px", flexDirection: "column" }}
          >
            <QrDetails
              inInvoiceDetails={true}
              inInvoice={true}
              invoiceId={inv.invoiceId}
              username={userDetails.username}
            />
            <DownloadButton
              style={{ alignSelf: "auto" }}
              url={inv.qrCode?.url}
            />
          </div>
        </InfoItem>

        <div style={{ display: "grid", gap: "10px" }}>
          <InfoItem label="Extra Details">
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  justifyContent: "space-between",
                }}
              >
                <span style={{ fontSize: "14px" }} className={styles.label}>
                  {" "}
                  {t("Shipping")}:{" "}
                </span>
                <Toggle checked={inv?.shippingAddress} />
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  justifyContent: "space-between",
                  marginTop: "10px",
                }}
              >
                <span style={{ fontSize: "14px" }} className={styles.label}>
                  {" "}
                  {t("Recurring")}:{" "}
                </span>
                <Toggle checked={inv?.recurring} />
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  justifyContent: "space-between",
                  marginTop: "10px",
                }}
              >
                <span className={styles.label} style={{ fontSize: "14px" }}>
                  {" "}
                  {t("Date")}:{" "}
                </span>
                <h5 style={{ textAlign: "right" }}>
                  {formatDateTime(inv.createdAt, "date")}
                </h5>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  justifyContent: "space-between",
                  marginTop: "10px",
                }}
              >
                <span className={styles.label} style={{ fontSize: "14px" }}>
                  {" "}
                  {t("Time")}:{" "}
                </span>
                <h5 style={{ textAlign: "right" }}>
                  {formatDateTime(inv.createdAt, "time")}
                </h5>
              </div>
            </div>
          </InfoItem>

          <InfoItem label="Receiving Wallet">
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  justifyContent: "space-between",
                }}
              >
                <span style={{ fontSize: "14px" }} className={styles.label}>
                  {" "}
                  {t("Currency")}:{" "}
                </span>
                <h5 style={{ textAlign: "right" }}>
                  {inv.receivingWallet?.currency?.code}
                </h5>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  justifyContent: "space-between",
                }}
              >
                <span style={{ fontSize: "14px" }} className={styles.label}>
                  {" "}
                  {t("Wallet Id")}:{" "}
                </span>
                <h5 style={{ textAlign: "right" }}>
                  {inv.receivingWallet?.wallet_id}
                </h5>
              </div>
            </div>
          </InfoItem>

          <InfoItem label={"Is Payable"}>
            <h5>
              {t(inv.paid
                ? "Paid"
                : "This Invoice is payable.")}
            </h5>
          </InfoItem>
        </div>
      </div>

      <div className={styles.expandContent}>
        <h3 style={{ marginTop: "15px" }}>{t("Recipients")}:</h3>
        {inv.recipients.length === 0 && <h5>{t("No Recipients!")}</h5>}
        {inv.recipients?.map((r) => {
          const id = r?._id || r?.userInfo?._id || r?.userInfo?.phone;
          const isOpen = id ? openRecipientIds.has(id) : false;
          const s = r?.shippingDetails;
          return (
            <InfoItem key={id} label={r?.userInfo?.name}>
              <div
                style={{
                  justifyContent: "space-between",
                  flexDirection: width < 500 && "column",
                }}
                className={styles.recipient}
              >
                <div
                  style={{
                    flexDirection: "row",
                    gap: "10px",
                    alignItems: "center",
                  }}
                >
                  {r?.userInfo?.profileImage?.url && (
                    <img src={r?.userInfo?.profileImage?.url} alt="" />
                  )}
                  {!r?.userInfo?.profileImage?.url && (
                    <span className={styles.pfpPlace}>
                      {r?.userInfo?.name?.[0]}
                    </span>
                  )}

                  <div>
                    <span className={styles.label}>
                      {t("Phone")} : {r?.userInfo?.phone}
                    </span>
                    <span className={styles.label}>
                      {t("Payment Method")} : {r.paymentInfo?.paymentMethod}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => toggleRecipient(id)}
                  aria-expanded={isOpen}
                  aria-label="Toggle shipping details"
                  style={{
                    background: "transparent",
                    border: 0,
                    padding: 0,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <ChevronDown
                    style={{
                      transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 0.2s ease",
                    }}
                  />
                </button>
              </div>

              {isOpen && (
                <div
                  style={{
                    marginTop: "10px",
                    padding: "12px",
                    borderRadius: "8px",
                    background: "#f7f7f8",
                  }}
                >
                  <h5 style={{ marginBottom: "15px", fontSize: "16px" }}>
                    {t("Shipping Details")}:
                  </h5>
                  {s ? (
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                        gap: "8px 16px",
                      }}
                    >
                      <span className={styles.label}>{t("House No")}:</span>
                      <h5>{s?.houseNo ?? "-"}</h5>
                      <span className={styles.label}>{t("Street")}:</span>
                      <h5>{s?.street ?? "-"}</h5>
                      <span className={styles.label}>{t("City")}:</span>
                      <h5>{s?.city ?? "-"}</h5>
                      <span className={styles.label}>{t("State")}:</span>
                      <h5>{s?.state ?? "-"}</h5>
                      <span className={styles.label}>{t("Country")}:</span>
                      <h5>{s?.country ?? "-"}</h5>
                      <span className={styles.label}>{t("Zip Code")}:</span>
                      <h5>{s?.zipCode ?? "-"}</h5>
                    </div>
                  ) : (
                    <h5>
                      {t("This beneficiary doesn't have shipping details")}
                    </h5>
                  )}
                </div>
              )}
            </InfoItem>
          );
        })}
      </div>
    </div>
  );
};

export default InvoiceItemDetails;
