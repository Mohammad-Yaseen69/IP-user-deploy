import Drawer from "@mui/material/Drawer";
import useMediaQuery from "@mui/material/useMediaQuery";
import dayjs from "dayjs";
import { Copy, X } from "lucide-react";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { UserContext } from "../../Context/UserContext";
import { formatCurrency } from "../../Helper/AmountFormat";
import { usePermission } from "../../hooks/GeneralUse/usePermission";
import ImageSwiperView from "../ImageSwiperView";
import countries from "../PaymentsNewer/CountriesData.json";
import CatDown from "./CatDown";
import s from "./styles/ledger.module.scss";
import { service_name_formatter } from "./TransactionItem";
import { capitalizeStatus, downloadTransactionPdf, isVoid, statusDot } from "./txutils";
import logo from "../../assets/images/logo/logo2.png";
import { toast } from "react-toastify";
import { Check } from "react-feather";

const Section = ({ title, children }) => (
  <div>
    <p className={s.eyebrow}>{title}</p>
    {children}
  </div>
);

const TransactionSheet = ({
  onClose,
  item,
  view: { title, Icon },
  desc,
  internationalReceiver,
  selectedCategory,
  setSelectedCategory,
  isEditMode,
  showCategories = true,
  addCategoriesToTransaction,
  message,
  setMessage,
  setIsEditMode,
  isSaving,
  note,
  setNote,
  fromReferral = false,
  vvc,
  cardNo,
}) => {
  const { t } = useTranslation();
  const { userDetails } = useContext(UserContext);
  const can = usePermission();
  const [isCopied, setIsCopied] = useState(null);
  const isMobile = useMediaQuery("(max-width:1000px)");
  const [showImgPreview, setShowImgPreview] = useState(false);
  const timerRef = useRef();

  const handleCopy = async (val, type) => {
    try {
      if (!val) return;
      await navigator.clipboard.writeText(val);
      setIsCopied(type);
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setIsCopied(""), 3000);
    } catch {
      toast.error(t("Failed to copy"));
    }
  };

  const Copyable = ({ text }) => (
    <>
      {text}
      <button type="button" className={s.copy} onClick={() => handleCopy(text, "1")}>
        {isCopied === "1" ? <Check size={14} /> : <Copy size={14} />}
      </button>
    </>
  );

  const country = useMemo(() => {
    return countries.find((c) =>
      internationalReceiver?.country_iso_code
        ? c.alpha3 === internationalReceiver?.country_iso_code
        : item?.receiver?.country_iso_code === c.alpha3,
    );
  }, [item, internationalReceiver]);

  const asLabel = useMemo(() => {
    if (item?.service_type === "withdraw_by_admin" || item?.service_type === "deposite_by_admin")
      return "Admin Funds";
    if (item?.payment_type?.includes("bank")) return "Bank Transfer";
    if (item?.payment_type?.includes("mobile")) return "Mobile Money";
    if (item?.payment_type?.toLowerCase() === "commission") return "Referral Commission";
    return (
      service_name_formatter(item?.payment_type) ||
      service_name_formatter(item?.transaction_type)?.replace("Mastercard", "")
    );
  }, [item]);

  const recipientName = useMemo(() => {
    if (item?.guest_details?.name && item?.guest_details) return item?.guest_details?.name;
    if (item?.service_type === "airtime") return item?.airtime_number;
    if (item?.payment_type === "conversion" || item?.service_type === "withdrawal")
      return item?.wallet_id;

    const isDebit = (item?.transaction_type ?? "")?.toLowerCase() === "debit";
    if (isDebit) {
      if (item?.service_type === "kyc_verification") return "InstaPay";
      if (item?.service_type === "withdrawal") {
        return `${item?.sender?.user?.first_name ?? item?.sender?.user?.company_name ?? ""} ${item?.sender?.user?.last_name ?? ""}`.trim();
      }
      if (item?.receiver) {
        return `${item?.receiver?.user?.first_name ?? item?.receiver?.user?.company_name ?? ""} ${item?.receiver?.user?.last_name ?? ""}`.trim();
      }
      return `${internationalReceiver?.first_name ?? item.receiverCard?.account?.first_name ?? item?.account?.user?.first_name ?? internationalReceiver?.company_name ?? item.receiverCard?.account?.company_name ?? item?.account?.user?.company_name ?? ""} ${internationalReceiver?.last_name ?? item.receiverCard?.account?.last_name ?? item?.account?.user?.last_name ?? ""}`.trim();
    }

    if (item?.service_type === "topup") {
      const receiver = item?.receiver?.user || item?.receiver?.company;
      return `${receiver?.first_name ?? receiver?.company_name ?? ""} ${receiver?.last_name ?? ""}`.trim();
    }

    return `${item?.sender?.user?.first_name ?? item?.senderCard?.account?.first_name ?? item.receiverCard?.account?.first_name ?? item?.receiverWallet?.account?.first_name ?? userDetails?.first_name ?? item?.sender?.user?.company_name ?? item?.senderCard?.account?.company_name ?? item.receiverCard?.account?.company_name ?? item?.receiverWallet?.account?.company_name ?? userDetails?.company_name ?? ""} ${item?.sender?.user?.last_name ?? item?.senderCard?.account?.last_name ?? item.receiverCard?.account?.last_name ?? item?.receiverWallet?.account?.last_name ?? userDetails?.last_name ?? ""}`.trim();
  }, [item, internationalReceiver, userDetails]);

  const isDebit = item?.transaction_type?.toLowerCase() === "debit";
  const commission = item?.payment_type?.toLowerCase() === "commission" && fromReferral;
  const reversed = item?.status?.toLowerCase() === "reversed";
  const reversedText = t(
    "The transaction has been reversed, and the funds have been added back to your CHF currency wallet.",
  )?.replace("CHF", item?.currency?.code);
  const billCode = item?.billCurrency ? item?.billCurrency : item?.currency?.code || item?.currency;
  const [heroValue, heroCode] = commission
    ? [item?.replacement_currency?.value, item?.replacement_currency?.code]
    : [item?.billAmount ? item?.billAmount : item?.total, billCode];
  const merchant = vvc && item?.transaction_type === "card_to_merchant";
  const thirdParty = item?.third_party_sender;
  const canEdit = can("transactions.category.add");
  const showNote = !item?.cardNo;

  const rows = [
    [t("Transaction ID"), item?.reference_id && <Copyable text={item.reference_id} />],
    [
      item?.payment_type === "conversion" || item?.service_type === "withdrawal"
        ? t("Wallet ID")
        : t("From / to"),
      recipientName,
    ],
    !(item?.payment_type === "conversion" || item?.service_type === "withdrawal") &&
      !(item?.service_type === "payment_address" && item?.guest_details) &&
      !item?.cardNo && [t("Wallet ID"), item?.wallet_id && `${t("INSTA-")}${item.wallet_id}`],
    item?.cardNo && [t("Card Number"), `••${cardNo?.slice(-4)}`],
    country && [
      t("Country"),
      <>
        <img src={country.file_url} alt="" className={s.flag} />
        {country.name}
      </>,
    ],
    thirdParty?._id && [
      t("Third Party Sender"),
      `${thirdParty.first_name ?? thirdParty.company_name ?? ""} ${thirdParty.last_name ?? ""} · ${thirdParty.sender_type}`.trim(),
    ],
    [t("Method"), t(asLabel)],
    [t("Type"), title],
    !commission && [
      isDebit ? t("Amount To Send") : t("Received Amount"),
      `${formatCurrency(item?.amount || item?.txAmount, true)} ${item?.currency?.code || item?.currency}`,
    ],
    [t("Fees"), `${formatCurrency(item?.fee, true)} ${billCode}`],
    item?.payment_type?.toLowerCase() === "commission" &&
      item?.replacement_currency?.value && [
        t("Withdrawal Received"),
        `${formatCurrency(item?.total, true)} ${item?.currency?.code}`,
      ],
    commission
      ? [
          t("Exchange Rate"),
          `1.00 ${item?.currency?.code} = ${formatCurrency(item?.replacement_currency?.rate, true, undefined, undefined, undefined, 7)} ${item?.replacement_currency?.code}`,
        ]
      : isDebit &&
        item?.exchange_rate_markup &&
        item?.currency?.code !== item?.recipient_received_currency && [
          t("Exchange Rate"),
          `1.00 ${item?.currency?.code} = ${item?.exchange_rate_markup} ${item?.recipient_received_currency}`,
        ],
    item?.recipient_received_amount && [
      t("Destination Amount"),
      `${formatCurrency(item.recipient_received_amount, true)} ${item?.recipient_received_currency}`,
    ],
    item?.agent?.first_name && [
      t("Performed By:"),
      `${item.agent.first_name} ${item.agent.last_name ?? ""}`,
    ],
    [t("Description"), [desc, reversed && reversedText].filter(Boolean).join(" ")],
    [t("Payment Reference"), item?.client_reference],
    item?.service_type &&
      item?.metadata?.crypto_tx_hash && [
        t("Crypto Transaction Hash"),
        <Copyable key={item.metadata.crypto_tx_hash} text={item.metadata.crypto_tx_hash} />,
      ],
    [t("Sender Email"), item?.guest_details?.email],
    [t("Sender Phone"), item?.guest_details?.phone],
    merchant && [t("Merchant Name"), item?.merchantName],
    merchant && [t("Merchant Category"), item?.merchantCategory],
    merchant &&
      item?.merchantCountry && [
        t("Merchant Country"),
        countries.find((c) => c.alpha3 === item.merchantCountry)?.name || item.merchantCountry,
      ],
    [t("Reason"), item?.reason],
  ].filter((row) => row && row[1]);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  return (
    <Drawer
      open
      onClose={onClose}
      anchor={isMobile ? "bottom" : "right"}
      sx={{ zIndex: 1040 }}
      PaperProps={{ className: s.sheet }}
    >
      <div className={s.top}>
        <h5>{t("Transaction details")}</h5>
        <button type="button" className={s.iconBtn} onClick={onClose}>
          <X size={20} />
        </button>
      </div>

      <div className={s.body}>
        <div className={s.hero}>
          <div className={`${s.tile} ${s.big}`}>
            <Icon size={22} />
          </div>
          <p>{title}</p>
          <div className={`${s.amount} ${s.lg} ${isVoid(item?.status) ? s.void : ""}`}>
            <b>
              {isDebit ? "−" : "+"}
              {formatCurrency(heroValue, true)}
            </b>
            <span>{heroCode}</span>
          </div>
          <div className={s.status}>
            <span>
              <i className={s.dot} style={{ background: statusDot(item?.status) }} />
              {t(capitalizeStatus(item?.status))}
            </span>
            <span style={{ color: "#9aa3b2", fontWeight: 400 }}>
              {dayjs(item?.createdAt).format("D MMM YYYY, HH:mm")}
            </span>
          </div>
        </div>

        <Section title={t("Transaction")}>
          <div className={s.kv}>
            {rows.map(([label, val]) => (
              <div key={label}>
                <span>{label}</span>
                <b>{val}</b>
              </div>
            ))}
          </div>
        </Section>

        {item?.display_name && item?.lat && item?.long && (
          <Section title={t("Transaction Map")}>
            <div className={s.map}>
              <p>{item.display_name}</p>
              <iframe
                title="map"
                src={`//maps.google.com/maps?q=${item.lat},${item.long}&z=15&output=embed`}
              />
            </div>
          </Section>
        )}

        {!item?.cardNo && (
          <Section title={t("Attached Files")}>
            <div className={s.kv}>
              <div>
                <span>{t("File", { count: item?.attachments?.length })}</span>
                {item?.attachments?.length > 0 && (
                  <b>
                    <button
                      type="button"
                      className={s.link}
                      onClick={() => setShowImgPreview(true)}
                    >
                      {t("Open")}
                    </button>
                  </b>
                )}
              </div>
            </div>
            {showImgPreview && (
              <ImageSwiperView
                isOpen={showImgPreview}
                toggle={() => setShowImgPreview(false)}
                images={item?.attachments}
              />
            )}
          </Section>
        )}

        {item?.timeline?.length > 0 && (
          <Section title={t("Progress")}>
            <ul className={s.timeline}>
              {item.timeline.map((it) => (
                <li key={it?._id}>
                  <i className={s.dot} style={{ background: statusDot(it?.status) }} />
                  <span>{t("Transfer created").replace("created", it?.status?.toLowerCase())}</span>
                  <time>{dayjs(it?.date).format("D MMM, HH:mm")}</time>
                </li>
              ))}
            </ul>
          </Section>
        )}

        {showCategories && !item?.cardNo && canEdit && (
          <Section title={t("Category")}>
            <CatDown
              selectedCategories={selectedCategory}
              setSelectedCategories={setSelectedCategory}
              isEditMode={isEditMode}
              item={item}
            />
          </Section>
        )}

        {showNote && (
          <Section title={t("Note")}>
            {isEditMode && canEdit ? (
              <textarea
                className={s.note}
                value={note ?? ""}
                onChange={(e) => setNote(e.target.value)}
              />
            ) : (
              <p className={s.note}>{note}</p>
            )}
            {canEdit && (
              <div className={s.noteBar}>
                {message && <span>{message}</span>}
                {isEditMode ? (
                  <button
                    type="button"
                    className={s.btnPrimary}
                    onClick={addCategoriesToTransaction}
                    disabled={isSaving || (selectedCategory.length < 1 && !note)}
                  >
                    {isSaving ? t("Saving") : t("Save")}
                  </button>
                ) : (
                  <button
                    type="button"
                    className={s.btnPrimary}
                    onClick={() => {
                      setIsEditMode(true);
                      setMessage("");
                    }}
                  >
                    {t("Edit")}
                  </button>
                )}
              </div>
            )}
          </Section>
        )}
      </div>

      <div className={s.foot}>
        <button
          type="button"
          className={s.btnPrimary}
          onClick={() => downloadTransactionPdf({ item, userDetails, logo })}
        >
          {t("Download transaction summary")}
        </button>
        <button type="button" className={s.btn} onClick={() => handleCopy(item?.reference_id, "2")}>
          {t(isCopied === "2" ? "Copied to clipboard" : "Copy transaction ID")}
        </button>
      </div>
    </Drawer>
  );
};

export default TransactionSheet;
