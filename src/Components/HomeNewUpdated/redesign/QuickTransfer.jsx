import { ChevronRight, Plus } from "lucide-react";
import { useContext, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { initials } from "../../../Common/Ledger/utils";
import Skeleton from "../../../Common/WalletUI/Skeleton";
import u from "../../../Common/WalletUI/ui.module.scss";
import { UserContext } from "../../../Context/UserContext";
import BenefCard from "../BenefCard";
import d from "./dashboard.module.scss";

const COLORS = [
  ["#f2eeff", "#5926f0"],
  ["#e7f6ee", "#047857"],
  ["#fff3e0", "#b45309"],
  ["#e8f0fe", "#2563eb"],
  ["#fdeef3", "#be185d"],
  ["#eff1f6", "#6e7687"],
];

const QuickTransfer = () => {
  const { t } = useTranslation();
  const { userDetails, beneficiaries, getUserBeneficiaries, beneficiariesLoading } =
    useContext(UserContext);

  useEffect(() => {
    if (userDetails) {
      getUserBeneficiaries();
    }
  }, [userDetails]);

  const showSkeleton = beneficiariesLoading && beneficiaries.length === 0;

  return (
    <section className={`${u.panel} ${d.quick}`}>
      <div className={d.quickText}>
        <h3 className={u.title}>{t("Quick Transfer")}</h3>
        <p className={u.sub}>{t("People you pay most")}</p>
        <Link to="/beneficiaries" className={u.link}>
          {t("All contacts")}
          <ChevronRight size={16} />
        </Link>
      </div>
      <div className={d.contacts}>
        {showSkeleton &&
          Array.from({ length: 5 }, (_, index) => (
            <div key={index} className={d.skeletonContact}>
              <Skeleton variant="circular" width={48} height={48} />
              <Skeleton width={48} height={12} />
            </div>
          ))}
        {beneficiaries.map((item, index) => {
          const isPerson = item?.beneficiary_type === "individual";
          const fullName = isPerson
            ? [item?.first_name, item?.last_name].filter(Boolean).join(" ")
            : (item?.company_name ?? "");
          const [background, color] = COLORS[index % COLORS.length];
          return (
            <BenefCard
              key={item._id}
              item={item}
              index={index}
              total={beneficiaries.length}
              trigger={(open) => (
                <button type="button" className={d.contact} title={fullName} onClick={open}>
                  <i style={{ background, color }}>{initials(fullName)}</i>
                  <span>{isPerson ? item?.first_name : fullName}</span>
                </button>
              )}
            />
          );
        })}
        <Link to="/beneficiaries" className={`${d.contact} ${d.contactNew}`}>
          <i>
            <Plus size={16} />
          </i>
          <span>{t("New")}</span>
        </Link>
      </div>
    </section>
  );
};

export default QuickTransfer;
