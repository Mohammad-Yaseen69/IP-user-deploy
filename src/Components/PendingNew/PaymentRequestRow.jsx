import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import dayjs from "dayjs";
import { ChevronRight, MessageSquare, Receipt } from "lucide-react";
import { useContext, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router";
import { AmountCell, PartyCell, StatusCell, TxCell } from "../../Common/Ledger/Cells";
import s from "../../Common/Ledger/ledger.module.scss";
import { capitalizeStatus, isVoid } from "../../Common/Ledger/utils";
import { UserContext } from "../../Context/UserContext";
import { formatCurrency } from "../../Helper/AmountFormat";
import { decryptData } from "../../Helper/EssentilaMethods/Decryption";
import { usePermission } from "../../hooks/GeneralUse/usePermission";
import PaymentRequestSheet from "./Paymentrequestsheet";
import RejectModal from "./RejectModal";
import ReviewModal from "./ReviewModal";
import r from "./requests.module.scss";

const partyName = ({ user, company, company_name } = {}) =>
  [user?.first_name || company?.company_name || company_name, user?.last_name]
    .filter(Boolean)
    .join(" ");

const stop = (fn) => (e) => {
  e.stopPropagation();
  fn();
};

const PaymentRequestRow = ({ item, activeItem, setActiveItem, index, type = "received" }) => {
  const { t } = useTranslation();
  const can = usePermission();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { authHeader, verifyToken, userDetails } = useContext(UserContext);
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const id = params.get("id");
  const linkType = params.get("type")?.toLowerCase();

  const [status, setStatus] = useState(item?.status);
  const [allRating, setAllRating] = useState(0);
  const [allReviews, setAllReviews] = useState([]);
  const [showReject, setShowReject] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const itemRef = useRef(null);

  const received = type === "received";
  const isActive = activeItem === index + 1;
  const pending = status?.toLowerCase() === "pending";
  const name = partyName(item?.[received ? "sender" : "receiver"]);
  const label = t(capitalizeStatus(status));

  useEffect(() => setStatus(item?.status), [item]);

  useEffect(() => {
    if (!isActive) return;
    axios
      .get(
        `${import.meta.env.VITE_IP_DEV_API}/api/transaction/get-seller-reviews/${item?.sender?._id}/0/0`,
        { headers: authHeader },
      )
      .then((res) => {
        const decrypted = decryptData(res.data.data);
        if (decrypted?.reviews?.length > 0) {
          const total = decrypted.reviews.reduce((acc, rat) => acc + rat.rating, 0);
          setAllRating(total / decrypted?.reviewsCount);
          setAllReviews(decrypted.reviews);
        }
      })
      .catch(() => {});
  }, [activeItem]);

  useLayoutEffect(() => {
    if (!id) return;
    const scroll = () => itemRef.current?.scrollIntoView({ behavior: "smooth" });
    if (id === item?._id) scroll();
    const hit =
      (linkType === "reply" && [item?.seller_comment, item?.buyer_comment].includes(id)) ||
      (linkType === "review" && id === item?._id);
    if (hit) {
      scroll();
      setShowReview(true);
      setActiveItem(index + 1);
    }
  }, [id]);

  // TODO: RejectModal collects a reason/note, but the decline endpoint doesn't accept them yet
  const rejectRequest = async () => {
    setRejecting(true);
    try {
      verifyToken();
      await axios.get(
        `${import.meta.env.VITE_IP_DEV_API}/api/wallet/decline-payment-request/${item.reference_id}`,
        { headers: authHeader },
      );
      navigate("/payment-requests");
      setStatus("cancelled");
      await Promise.all(
        ["receivedPaymentRequests", "sentPaymentRequests"].map((key) =>
          queryClient.invalidateQueries({ queryKey: [key, userDetails?._id] }),
        ),
      );
    } catch (error) {
      console.log(error);
    } finally {
      setRejecting(false);
      setShowReject(false);
    }
  };

  // TODO: API has no dueDate yet; "Paid {date}" / "Rejected {date}" also need dates from the API
  const due = item?.dueDate && `${t("Due")} ${dayjs(item.dueDate).format("D MMM")}`;

  return (
    <>
      <div
        ref={itemRef}
        className={`${s.cols} ${s.row}`}
        onClick={() => setActiveItem(isActive ? 0 : index + 1)}
      >
        <TxCell
          Icon={item?.attachments?.length ? Receipt : MessageSquare}
          title={item?.display_name || t("Payment request")}
          sub={[item?.reference_id, dayjs(item?.createdAt).format("D MMM YYYY")].join(" · ")}
        />
        <PartyCell name={name} />
        <StatusCell status={status} label={label} />
        <div className={s.time}>{due}</div>
        <AmountCell
          value={formatCurrency(item?.amount, true)}
          code={item?.currency?.code}
          variant={[isVoid(status) ? "void" : !received && "in"]}
        />
        <div className={r.actions}>
          {pending && received ? (
            <>
              {can("payment-request.decline") && (
                <button type="button" className={r.ghost} onClick={stop(() => setShowReject(true))}>
                  {t("Reject")}
                </button>
              )}
              {can("payment-request.accept") && (
                <button
                  type="button"
                  className={`${s.btnPrimary} ${r.sm}`}
                  onClick={stop(() => setActiveItem(index + 1))}
                >
                  {t("Accept & pay")}
                </button>
              )}
            </>
          ) : pending ? (
            <>
              {/* TODO: no cancel / reminder endpoints yet */}
              <button type="button" className={r.ghost} disabled onClick={stop(() => {})}>
                {t("Cancel")}
              </button>
              <button
                type="button"
                className={`${s.btn} ${r.sm}`}
                disabled
                onClick={stop(() => {})}
              >
                {t("Send reminder")}
              </button>
            </>
          ) : (
            <ChevronRight size={16} className={s.chev} />
          )}
        </div>
      </div>

      {isActive && (
        <PaymentRequestSheet
          item={item}
          type={type}
          name={name}
          label={label}
          allRating={allRating}
          allReviews={allReviews}
          onClose={() => setActiveItem(0)}
          onReject={() => setShowReject(true)}
          onReview={() => setShowReview(true)}
        />
      )}

      {showReject && (
        <RejectModal
          isOpen
          toggle={() => setShowReject(false)}
          name={name}
          amount={item?.amount}
          code={item?.currency?.code}
          loading={rejecting}
          onConfirm={rejectRequest}
        />
      )}

      {showReview && (
        <ReviewModal
          isOpen
          toggle={() => setShowReview(false)}
          item={item}
          type={received ? "Received" : "Send"}
        />
      )}
    </>
  );
};

export default PaymentRequestRow;
