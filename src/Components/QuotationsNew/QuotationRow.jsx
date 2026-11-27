import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import dayjs from "dayjs";
import { ChevronRight, FileText } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router";
import { UserContext } from "../../Context/UserContext";
import { decryptData } from "../../Helper/EssentilaMethods/Decryption";
import { usePermission } from "../../hooks/GeneralUse/usePermission";
import { AmountCell, PartyCell, StatusCell, TxCell } from "../../Common/Ledger/Cells";
import s from "../../Common/Ledger/ledger.module.scss";
import RejectModal from "../../Common/Ledger/RejectModal";
import { capitalizeStatus, partyName, statusDot } from "../../Common/Ledger/utils";
import AcceptBargainedAmount from "./AcceptBaragainedAmount";
import AcceptQuotation from "./AcceptQuotation";
import BargainQuotation from "./BargainQuotation";
import QuotationSheet from "./Quotationsheet";
import { formatCurrency } from "../../Helper/AmountFormat";

const LABELS = {
  sent: "Pending",
  bargain: "Pending",
  accepted: "Accepted",
  declined: "Rejected",
  "bargain-accepted": "Bargain-Accepted",
};
const DOT_KEYS = {
  sent: "pending",
  bargain: "pending",
  accepted: "completed",
  declined: "rejected",
};

export const isOpenQuotation = (item) => ["sent", "bargain"].includes(item?.status?.toLowerCase());

const QuotationRow = ({ item, type = "received", isActive, setActive }) => {
  const { t } = useTranslation();
  const can = usePermission();
  const queryClient = useQueryClient();
  const { authHeader, verifyToken, userDetails } = useContext(UserContext);
  const params = new URLSearchParams(useLocation().search);
  const id = params.get("_id");
  const linkType = params.get("type");

  const [showAccept, setShowAccept] = useState(false);
  const [showBargain, setShowBargain] = useState(false);
  const [showRevise, setShowRevise] = useState(false);
  const [showAcceptBargained, setShowAcceptBargained] = useState(false);
  const [showReject, setShowReject] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [error, setError] = useState("");

  const received = type === "received";
  const status = item?.status?.toLowerCase();
  const open = isOpenQuotation(item);
  const party = item?.[received ? "sender" : "reciever"];
  const name = partyName(party);
  const label = t(LABELS[status] ?? capitalizeStatus(item?.status));
  const dotKey = DOT_KEYS[status] ?? status;
  const code = item?.amount_reciever_currency?.currency?.code;

  useEffect(() => {
    if (!received && id === item?._id && linkType === "bargain") setShowRevise(true);
  }, [id, linkType, item]);

  const rejectQuotation = async () => {
    setRejecting(true);
    setError("");
    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_IP_DEV_API}/api/quotation/decline-quotation/${item?._id}`,
        { headers: authHeader },
      );
      decryptData(response.data.data);
      await Promise.all(
        ["receivedQuotations", "sentQuotations"].map((key) =>
          queryClient.invalidateQueries({ queryKey: [key, userDetails?._id] }),
        ),
      );
      verifyToken();
      setShowReject(false);
    } catch (err) {
      const dec = decryptData(err?.response?.data?.data);
      setError(
        dec?.message ?? "We cannot process your request at the moment, please try again later.",
      );
    } finally {
      setRejecting(false);
    }
  };

  const stop = (fn) => (e) => {
    e.stopPropagation();
    fn();
  };

  return (
    <>
      <div className={`${s.cols} ${s.row}`} onClick={() => setActive(isActive ? 0 : item._id)}>
        <TxCell
          Icon={FileText}
          title={item?.title || t("Quotation")}
          sub={[item?.reference_id, dayjs(item?.createdAt).format("D MMM YYYY")].join(" · ")}
        />
        <PartyCell name={name} />
        <StatusCell status={dotKey} label={label} />
        <AmountCell
          value={formatCurrency(item?.amount, true)}
          code={code}
          variant={[status === "declined" ? "dim" : !received && "in"]}
        />
        <div className={s.act}>
          {received && open ? (
            <>
              {can("quotations.decline") && (
                <button
                  type="button"
                  className={s.textBtn}
                  onClick={stop(() => setShowReject(true))}
                >
                  {t("Reject")}
                </button>
              )}
              {can("quotations.accept") && status !== "bargain" && (
                <button
                  type="button"
                  className={`${s.btnPrimary} ${s.sm}`}
                  onClick={stop(() => setShowAccept(true))}
                >
                  {t("Accept")}
                </button>
              )}
            </>
          ) : (
            <ChevronRight size={16} className={s.chev} />
          )}
        </div>
      </div>

      {isActive && (
        <QuotationSheet
          item={item}
          type={type}
          name={name}
          username={party?.username}
          label={label}
          dot={statusDot(dotKey)}
          onClose={() => setActive(0)}
          onReject={() => setShowReject(true)}
          onAccept={() => setShowAccept(true)}
          onBargain={() => setShowBargain(true)}
          onRevise={() => setShowRevise(true)}
          onAcceptBargained={() => setShowAcceptBargained(true)}
        />
      )}

      {showAccept && (
        <AcceptQuotation
          isOpen={showAccept}
          item={item}
          toggle={() => setShowAccept(false)}
          type="receive"
        />
      )}
      {showBargain && (
        <BargainQuotation
          isOpen={showBargain}
          item={item}
          toggle={() => setShowBargain(false)}
          badgeColor={statusDot(dotKey)}
          type="bargain"
        />
      )}
      {showRevise && (
        <BargainQuotation
          isOpen={showRevise}
          item={item}
          toggle={() => setShowRevise(false)}
          badgeColor={statusDot(dotKey)}
          type="revise"
        />
      )}
      {showAcceptBargained && (
        <AcceptBargainedAmount
          isOpen={showAcceptBargained}
          item={item}
          toggle={() => setShowAcceptBargained(false)}
          type="send"
        />
      )}
      <RejectModal
        isOpen={showReject}
        toggle={() => setShowReject(false)}
        title={t("Reject this quotation?")}
        text={`${name} ${t("will be told you rejected quotation")} ${item?.reference_id} ${t("for")} ${formatCurrency(item?.amount, true)} ${code}. ${t("You can ask them for a new quote.")}`}
        noteFor={name}
        keepLabel={t("Keep quotation")}
        confirmLabel={t("Reject quotation")}
        error={error}
        loading={rejecting}
        onConfirm={rejectQuotation}
      />
    </>
  );
};

export default QuotationRow;
