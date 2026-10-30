import dayjs from "dayjs";
import { Download, FileText } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { usePermission } from "../../hooks/GeneralUse/usePermission";
import {
  Copyable,
  DetailSheet,
  KeyValues,
  Section,
  Timeline,
} from "../../Common/Ledger/DetailSheet";
import s from "../../Common/Ledger/ledger.module.scss";
import { initials } from "../../Common/Ledger/utils";
import { formatCurrency } from "../../Helper/AmountFormat";
import { Stack } from "@mui/material";
import useCopyToClipboard from "../../hooks/useCopyToClipboard";

const fileName = (key = "") => decodeURIComponent(key.split("/").pop());

const QuotationSheet = ({
  item,
  type,
  name,
  username,
  label,
  dot,
  onClose,
  onReject,
  onAccept,
  onBargain,
  onRevise,
  onAcceptBargained,
}) => {
  const { t } = useTranslation();
  const can = usePermission();
  const { handleCopy, isCopied } = useCopyToClipboard(t);

  const received = type === "received";
  const status = item?.status?.toLowerCase();
  const open = status === "sent" || status === "bargain";
  const code = item?.amount_reciever_currency?.currency?.code;
  const counterOffer = item?.bargain && status === "bargain";

  const validUntil = item?.validUntil && dayjs(item.validUntil).format("D MMM YYYY");

  const rows = [
    [
      t("Quotation ID"),
      item?.reference_id && (
        <Copyable
          isCopied={isCopied}
          handleCopy={(text) => handleCopy(text, true)}
          text={item.reference_id}
        />
      ),
    ],
    [
      received ? t("Received on") : t("Sent on"),
      dayjs(item?.createdAt).format("D MMM YYYY, HH:mm"),
    ],
    [t("Valid until"), validUntil],
    [received ? t("From") : t("Sent to"), name],
    [
      t("Revised Amount").replace("Revised", received ? "Revised" : "Bargained"),
      item?.revised_amount && `${formatCurrency(item.revised_amount, true)} ${code}`,
    ],
    [t("Bargainable"), item?.bargain ? t("Yes") : t("No")],
  ];

  const timeline = [
    {
      color: "#12b76a",
      text: received ? t("Quotation received") : t("Quotation sent"),
      time: dayjs(item?.createdAt).format("D MMM · HH:mm"),
    },
    {
      color: dot,
      text: open ? (received ? t("Waiting for your response") : t("Waiting for response")) : label,
      time: open ? t("Now") : "",
    },
  ];

  const footer = open && (
    <div>
      {received ? (
        <>
          <Stack direction={"row"} gap={"8px"}>
            {can("quotations.decline") && (
              <button type="button" className={`${s.btnSoftDanger} w-100`} onClick={onReject}>
                {t("Reject")}
              </button>
            )}
            {can("quotations.accept") && status !== "bargain" && (
              <button type="button" className={`${s.btnPrimary} w-100`} onClick={onAccept}>
                {t("Accept quotation")}
              </button>
            )}
          </Stack>
          {can("quotations.bargain") && item?.bargain && status === "sent" && (
            <button type="button" className={`${s.btn} w-100 mt-2`} onClick={onBargain}>
              {t("Bargain")}
            </button>
          )}
        </>
      ) : (
        <>
          <Stack direction={"row"} gap={"8px"}>
            <button type="button" className={`${s.btnSoftDanger} w-100`} disabled>
              {t("Cancel")}
            </button>
            {can("quotations.accept") && counterOffer && (
              <button type="button" className={`${s.btnPrimary} w-100`} onClick={onAcceptBargained}>
                {t("Accept")}
              </button>
            )}
          </Stack>
          {can("quotations.bargain") && counterOffer && (
            <button type="button" className={`${s.btn} w-100 mt-2`} onClick={onRevise}>
              {t("Revise")}
            </button>
          )}
        </>
      )}
    </div>
  );

  return (
    <DetailSheet title={t("Quotation")} onClose={onClose} footer={footer}>
      <div className={s.hero}>
        <div className={s.heroRow}>
          <div className={`${s.avatar} ${s.lg}`}>{initials(name)}</div>
          <div className={s.lines}>
            {username ? (
              <Link to={`/profile/${username}`} className={s.title}>
                {name}
              </Link>
            ) : (
              <p className={s.title}>{name}</p>
            )}
            <p className={s.sub}>
              {received ? t("sent you a quotation") : t("you sent a quotation")}
            </p>
          </div>
        </div>
        <div className={`${s.amount} ${s.lg}`}>
          <b>{formatCurrency(item?.amount, true)}</b>
          <span>{code}</span>
        </div>
        <div className={s.status}>
          <span>
            <i className={s.dot} style={{ background: dot }} />
            {label}
          </span>
          {validUntil && <span className={s.due}>{`${t("Valid until")} ${validUntil}`}</span>}
        </div>
      </div>

      {item?.desc && (
        <div className={s.callout}>
          <small>{received ? `${t("Message from")} ${name}` : t("Your message")}</small>
          <p>{item.desc}</p>
        </div>
      )}

      <Section title={t("Quotation items")}>
        <KeyValues rows={[[item?.title, `${formatCurrency(item?.amount, true)} ${code}`]]} />
      </Section>

      <Section title={t("Details")}>
        <KeyValues rows={rows} />
      </Section>

      {item?.images?.length > 0 && (
        <div>
          {item.images.map((file) => (
            <a
              key={file._id ?? file.key}
              className={s.file}
              href={file.url}
              target="_blank"
              rel="noreferrer"
            >
              <div className={s.tile}>
                <FileText size={18} />
              </div>
              <div className={s.lines}>
                <p className={s.title}>{fileName(file.key)}</p>
                <p className={s.sub}>{fileName(file.key).split(".").pop().toUpperCase()}</p>
              </div>
              <Download size={16} />
            </a>
          ))}
        </div>
      )}

      <Section title={t("Progress")}>
        <Timeline items={timeline} />
      </Section>
    </DetailSheet>
  );
};

export default QuotationSheet;
