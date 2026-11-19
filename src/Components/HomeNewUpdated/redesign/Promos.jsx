import { Briefcase, Check, ChevronRight, Copy } from "lucide-react";
import { useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import u from "../../../Common/WalletUI/ui.module.scss";
import { UserContext } from "../../../Context/UserContext";
import d from "./dashboard.module.scss";

// Referral banner: same programme and reward total as the Referrals page.
export const PartnerBanner = ({ hidden }) => {
  const { t } = useTranslation();
  const { userDetails, referralLink, totalReferralAmount } = useContext(UserContext);
  const [copied, setCopied] = useState(false);
  const code = userDetails?.username
    ? `${referralLink?.split("/signup/")?.[1] ?? ""}${userDetails.username}`
    : "";

  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className={d.partner}>
      <div>
        <h3>{t("Earn with the InstaPay Partner Program")}</h3>
        <p>
          {t(
            "Share your code. You earn a share of every fee your friends pay, paid monthly into your wallet.",
          )}
        </p>
      </div>
      <div className={d.partnerFoot}>
        <Link to="/referrals" className={d.partnerStat}>
          {t("Rewards earned")}
          <b>
            {hidden
              ? "••••••"
              : Number(totalReferralAmount || 0).toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{" "}
            USD
          </b>
        </Link>
        <div className={d.partnerTools}>
          {code && (
            <div className={d.code}>
              {code}
              <button type="button" onClick={copy}>
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? t("Copied") : t("Copy code")}
              </button>
            </div>
          )}
          <a
            href="https://insta-pay.ch/affiliation-program"
            target="_blank"
            rel="noreferrer"
            className={d.white}
          >
            {t("See how it works")}
            <ChevronRight size={16} />
          </a>
        </div>
      </div>
    </section>
  );
};

export const UpgradeCard = ({ onUpgrade }) => {
  const { t } = useTranslation();

  return (
    <section className={`${u.panel} ${d.upgrade}`}>
      <i>
        <Briefcase size={20} strokeWidth={1.75} />
      </i>
      <h3>{t("Upgrade to a Business account")}</h3>
      <p>{t("Run payroll, invoices and team cards from the same login.")}</p>
      <ul>
        {["Business IBAN in your company name", "Bulk payments and approvals"].map((item) => (
          <li key={item}>
            <Check size={16} />
            {t(item)}
          </li>
        ))}
      </ul>
      <button type="button" onClick={onUpgrade}>
        {t("Start upgrade")}
        <ChevronRight size={16} />
      </button>
    </section>
  );
};
