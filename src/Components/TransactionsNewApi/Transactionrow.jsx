import axios from "axios";
import dayjs from "dayjs";
import { ArrowDownLeft, ArrowUpRight, ChevronRight, CreditCard, Plus } from "lucide-react";
import { useContext, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { UserContext } from "../../Context/UserContext";
import { decryptData } from "../../Helper/EssentilaMethods/Decryption";
import { encryptData } from "../../Helper/EssentilaMethods/Encryption";
import { usePermission } from "../../hooks/GeneralUse/usePermission";
import statuses from "./files/thunesTransactionStatus.json";
import s from "./styles/ledger.module.scss";
import { service_name_formatter } from "./TransactionItem";
import TransactionSheet from "./Transactionsheet";
import { capitalizeStatus, isVoid, statusDot } from "./txutils";
import { formatCurrency } from "../../Helper/AmountFormat";

const TransactionRow = ({ item, activeItem, setActiveItem, index, fromReferral = false }) => {
  const { t, i18n } = useTranslation();
  const can = usePermission();
  const { authHeader, beneficiaries, userDetails } = useContext(UserContext);
  const [selectedCategory, setSelectedCategory] = useState([]);
  const [note, setNote] = useState(item?.note);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setNote(item?.note);
    setIsEditMode(item?.note ? false : true);
  }, [item]);

  const addCategoriesToTransaction = () => {
    setMessage("");
    setIsSaving(true);
    const data = {
      transaction_id: item._id,
      categories: selectedCategory.map((it) => it._id),
      note,
    };
    const encrypted = encryptData(data);
    axios
      .post(
        `${import.meta.env.VITE_IP_DEV_API}/api/transaction/add-transactions-category`,
        { data: encrypted },
        { headers: authHeader },
      )
      .then((res) => {
        void decryptData(res.data.data);
        setIsSaving(false);
        setIsEditMode(false);
        setMessage("Categories Added Successfully!");
        setTimeout(() => setMessage(""), 3000);
      })
      .catch((err) => {
        void decryptData(err.response.data.data);
        setIsSaving(false);
        setMessage("Something went wrong, try again.");
        setTimeout(() => setMessage(""), 3000);
      });
  };

  const internationalReceiver = useMemo(() => {
    if (!item?.beneficiary) return null;
    return (
      beneficiaries.filter((benef) => benef?._id === item?.beneficiary)?.[0] ||
      item?.beneficiaryDetails
    );
  }, [beneficiaries, item]);

  const externalStatusDescription = useMemo(() => {
    if (item?.payment_type === "non_instapay") {
      return item?.description || undefined;
    }
    return statuses?.[item?.external_status?.split("_")?.[1]]?.[i18n.language]?.message ?? "";
  }, [item, i18n]);

  const displayAsText = useMemo(() => {
    if (item?.service_type === "withdraw_by_admin" || item?.service_type === "deposite_by_admin") {
      return "Admin Funds";
    }
    if (item?.payment_type?.includes("bank")) return "Bank Transfer";
    if (item?.payment_type?.includes("mobile")) return "Mobile Money";
    return service_name_formatter(item?.payment_type);
  }, [item]);

  const counterparty = useMemo(() => {
    const who = (first, last, id) => ({ name: [first, last].filter(Boolean).join(" "), id });

    if (item?.guest_details?.name) return { name: item.guest_details.name };
    if (item?.service_type === "airtime") return { name: item?.airtime_number ?? "" };
    if (item?.payment_type === "conversion") return { name: item?.wallet_id ?? "" };

    if ((item?.transaction_type ?? "").toLowerCase() === "debit") {
      if (item?.service_type === "withdraw_by_admin") return { name: "Admin" };
      if (item?.service_type === "kyc_verification") return { name: "InstaPay" };
      if (item?.service_type === "withdrawal") {
        const { user, company } = item?.sender ?? {};
        return who(
          user?.first_name ?? company?.company_name,
          user?.last_name,
          user?._id ?? company?._id,
        );
      }
      if (item?.receiver?.user) {
        const { user, company } = item.receiver;
        return who(user.first_name ?? company?.company_name, user.last_name, user._id);
      }
      const acc = item?.account;
      return who(
        internationalReceiver?.first_name ??
          acc?.user?.first_name ??
          internationalReceiver?.company_name ??
          acc?.company?.company_name,
        internationalReceiver?.last_name ?? acc?.user?.last_name,
        internationalReceiver?._id ?? acc?.user?._id ?? acc?.company?._id,
      );
    }

    if (item?.service_type === "topup") {
      const user = item?.receiver?.user;
      return who(user?.first_name, user?.last_name, user?._id);
    }

    const { user, company } = item?.sender ?? {};
    const card = item?.mastercard?.account;
    return who(
      user?.first_name ?? card?.first_name ?? company?.company_name,
      user?.last_name ?? card?.last_name,
      user?._id ?? card?._id ?? company?._id,
    );
  }, [item, internationalReceiver]);

  const isActive = activeItem === index + 1;
  const canView = can("transactions.main.details.view");
  const isDebit = item?.transaction_type?.toLowerCase() === "debit";
  const commission = item?.payment_type?.toLowerCase() === "commission" && fromReferral;
  const topupBank = item?.service_type === "topup" && item?.payment_type === "bank";
  const code = commission
    ? "$"
    : topupBank
      ? item?.recipient_received_currency
      : item?.currency?.code;
  const value = commission
    ? item?.replacement_currency?.value
    : topupBank
      ? item?.recipient_received_amount
      : item?.total;

  const Icon =
    item?.mastercard || item?.senderCard || item?.receiverCard
      ? CreditCard
      : item?.service_type === "topup"
        ? Plus
        : isDebit
          ? ArrowUpRight
          : ArrowDownLeft;

  const title = [
    item?.service_type === "topup" && "Wallet",
    service_name_formatter(t(item?.service_type)),
  ]
    .filter(Boolean)
    .join(" ");
  const method = displayAsText && t(displayAsText);
  const time = dayjs(item?.createdAt).format("HH:mm");
  const dot = statusDot(item?.status);
  const initials = counterparty.name
    .split(" ")
    .map((word) => word[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const loggedInUserId = userDetails?.user?._id ?? userDetails?.company?._id;
  return (
    <>
      <div
        className={`${s.cols} ${s.row}`}
        onClick={() => canView && setActiveItem(isActive ? 0 : index + 1)}
      >
        <div className={s.tx}>
          <div className={s.tile}>
            <Icon size={18} />
          </div>
          <div className={s.lines}>
            <p className={s.title}>{title}</p>
            <p className={s.sub}>
              <span className={s.d}>
                {[method, item?.reference_id].filter(Boolean).join(" · ")}
              </span>
              <span className={s.m}>{[time, method].filter(Boolean).join(" · ")}</span>
            </p>
          </div>
        </div>

        <div className={`${s.tx} ${s.cp}`}>
          {initials && <div className={s.avatar}>{initials}</div>}
          <div className={s.lines}>
            <p className={s.title}>{counterparty.name}</p>
            {counterparty.id === loggedInUserId && <p className={s.sub}>{t("Your account")}</p>}
          </div>
        </div>

        <div className={s.status}>
          <span className={s.dot} style={{ background: dot }} />
          {t(capitalizeStatus(item?.status))}
        </div>

        <div className={s.time}>{time}</div>

        <div className={`${s.amount} ${isVoid(item?.status) ? s.void : ""} ${isDebit ? "" : s.in}`}>
          <b>
            {isDebit ? "−" : "+"}
            {value == null ? "" : formatCurrency(value, true)}
          </b>
          <span>{code}</span>
        </div>

        <ChevronRight size={16} className={s.chev} />
      </div>

      {isActive && canView && (
        <TransactionSheet
          onClose={() => setActiveItem(0)}
          item={item}
          view={{ title, Icon }}
          desc={externalStatusDescription}
          internationalReceiver={internationalReceiver}
          isEditMode={isEditMode}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          addCategoriesToTransaction={addCategoriesToTransaction}
          isSaving={isSaving}
          message={message}
          setIsEditMode={setIsEditMode}
          setMessage={setMessage}
          note={note}
          setNote={setNote}
          fromReferral={fromReferral}
        />
      )}
    </>
  );
};

export default TransactionRow;
