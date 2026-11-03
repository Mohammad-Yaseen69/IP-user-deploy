import { XCircle } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Modal } from "reactstrap";
import s from "../../Common/Ledger/ledger.module.scss";
import { formatCurrency } from "../../Helper/AmountFormat";

const REASONS = [
  "I don't recognise this request",
  "The amount is wrong",
  "I already paid this",
  "Other",
];

const RejectModal = ({ isOpen, toggle, name, amount, code, loading, onConfirm }) => {
  const { t } = useTranslation();
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");

  return (
    <Modal isOpen={isOpen} toggle={toggle} centered contentClassName={s.dlg}>
      <div className={`${s.tile} ${s.big} ${s.danger}`}>
        <XCircle size={22} />
      </div>
      <h5>{t("Reject this payment request?")}</h5>
      <p>
        {name} {t("will be told you rejected their request for")} {formatCurrency(amount, true)}{" "}
        {code}. {t("No money moves, and this can't be undone.")}
      </p>
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
        placeholder={`${t("Add a note for")} ${name} (${t("optional")})`}
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />
      <div className={s.footRow}>
        <button type="button" className={s.btn} onClick={toggle}>
          {t("Keep request")}
        </button>
        <button type="button" className={s.btnDanger} disabled={loading} onClick={onConfirm}>
          {t("Reject request")}
        </button>
      </div>
    </Modal>
  );
};

export default RejectModal;
