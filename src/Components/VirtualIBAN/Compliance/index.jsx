import { useState } from "react";
import { useTranslation } from "react-i18next";
import ActionNeededView from "./ActionNeededView";
import AccountRestrictedView from "./AccountRestrictedView";
import AllCaughtUpView from "./AllCaughtUpView";
import InstaPayLoader from "../../Loader";
import styles from "./compliance.module.css";

const Compliance = ({ inquiries = [], refetch, isLoading }) => {
  const { t } = useTranslation();
  const [forcedView, setForcedView] = useState(null);

  const isItemOverdue = (item) => {
    if (!item?.deadline?.isSet) return false;
    if (item.deadline.status === "EXCEED") return true;
    if (item.deadline.date && item.status !== "APPROVED" && item.status !== "UPLOADED") {
      return new Date(item.deadline.date) < new Date();
    }
    return false;
  };

  const overdueItems = inquiries.filter(isItemOverdue);
  const activeInquiries = inquiries.filter(
    (item) =>
      item.status === "REQUESTED" || item.status === "UPLOADED" || item.status === "action_needed",
  );

  const renderComplianceContent = () => {
    if (isLoading) {
      return (
        <div
          style={{
            minHeight: "300px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <InstaPayLoader transparent />
        </div>
      );
    }

    if (forcedView === "action_needed") {
      return (
        <ActionNeededView
          bannerMessage={t(
            "We keep compliance clear and reassuring. Responding promptly keeps payments flowing - failure to respond may restrict account activity.",
          )}
          requests={inquiries}
          refetch={refetch}
        />
      );
    }

    if (overdueItems.length > 0) {
      const restrictedData = {
        title: t("Your account is temporarily restricted"),
        subtitle: t(
          "A deadline passed on compliance requests without a response. Resolve the items below to restore full account access.",
        ),
        items: overdueItems.map((item, idx) => ({
          id: item._id || idx,
          title: item.title,
          status: t("Overdue"),
        })),
      };

      return (
        <AccountRestrictedView
          restrictedData={restrictedData}
          onResolve={() => setForcedView("action_needed")}
        />
      );
    }

    if (activeInquiries.length > 0) {
      return (
        <ActionNeededView
          bannerMessage={t(
            "We keep compliance clear and reassuring. Responding promptly keeps payments flowing - failure to respond may restrict account activity.",
          )}
          requests={inquiries}
          refetch={refetch}
        />
      );
    }

    return <AllCaughtUpView />;
  };

  return <div className={styles.complianceContainer}>{renderComplianceContent()}</div>;
};

export default Compliance;
