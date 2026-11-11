import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./styles/responsiveness.css";
import { Plus, ArrowUpRight, ArrowDownToLine, FileText, ScanLine, Zap } from "lucide-react";

// const ScanSvg = () => (
//   <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
//     <rect className="scan_bg" width="36" height="36" rx="10" fill="#F2EEFF" />
//     <g clip-path="url(#clip0_16452_13321)">
//       <path className="scan_line" d="M19.5 22.5H21M22.5 19.5H24M12 12H16.5V16.5H12V12ZM19.5 12H24V16.5H19.5V12ZM12 19.5H16.5V24H12V19.5ZM19.5 19.5H21V21H19.5V19.5ZM22.5 22.5H24V24H22.5V22.5Z" stroke-width="1.125" stroke-linecap="round" stroke-linejoin="round" stroke="#5926F0" />
//     </g>
//     <defs>
//       <clipPath id="clip0_16452_13321">
//         <rect width="18" height="18" fill="white" transform="translate(9 9)" />
//       </clipPath>
//     </defs>
//   </svg>
// )

const QuickLinksNew = () => {
  const { t } = useTranslation();

  const items = [
    { icon: Plus, text: t("Add Money"), width: 20, link: "/add-funds" },
    {
      icon: ArrowUpRight,
      text: t("Send Money"),
      width: 20,
      link: "/payments?payment_action=send_money",
    },
    {
      icon: ArrowDownToLine,
      text: t("Request Money"),
      width: 20,
      link: "/payments?payment_action=req_money",
    },
    {
      icon: FileText,
      text: t("Send A Quote"),
      width: 20,
      link: "/payments?payment_action=send_quote",
    },
    {
      icon: ScanLine,
      text: t("Scan to pay"),
      width: 20,
      link: "/chips-in",
    },
    {
      icon: Zap,
      text: t("My Payment Address"),
      width: 20,
      link: "/payment-address",
    },
  ];
  return (
    <div className="ql_grid">
      {items.map((item, index) => (
        <Link to={item.link} key={index} className="ql_item">
          <div className="ql_icon">
            <item.icon size={item.width} color="#5926f0" strokeWidth={2} />
          </div>
          <p className="ql_text">{item.text}</p>
        </Link>
      ))}
    </div>
  );
};

export default QuickLinksNew;
