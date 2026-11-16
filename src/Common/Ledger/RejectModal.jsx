import { XCircle } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Modal } from "reactstrap";
import s from "./ledger.module.scss";

const REASONS = [
  "I don't recognise this request",
  "The amount is wrong",
  "I already paid this",
  "Other",
];

const RejectModal = ({
  isOpen,
  toggle,
  title,
  text,
  noteFor,
  keepLabel,
  confirmLabel,
  error,
  loading,
  onConfirm,
}) => {
  const { t } = useTranslation();
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");

  return (
    <Modal isOpen={isOpen} toggle={toggle} centered contentClassName={s.dlg}>
      <div className={`${s.tile} ${s.big} ${s.danger}`}>
        <XCircle size={22} />
      </div>
      <h5>{title}</h5>
      <p>{text}</p>
      <label>{t("Reason (optional)")}</label>
      <select className={s.field} value={reason} onChange={(e) => setReason(e.target.value)}>
        <option value="">{t("Choose a reason")}</option>
        {REASONS.map((r) => (
          <option key={r} value={r}>
            {t(r)}
          </option>
        ))}
      </select>
      <input
        className={s.field}
        placeholder={`${t("Add a note for")} ${noteFor} (${t("optional")})`}
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />
      {error && <p style={{ color: "#d92d20" }}>{error}</p>}
      <div className={s.footRow}>
        <button type="button" className={s.btn} onClick={toggle}>
          {keepLabel}
        </button>
        <button type="button" className={s.btnDanger} disabled={loading} onClick={onConfirm}>
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
};

export default RejectModal;
