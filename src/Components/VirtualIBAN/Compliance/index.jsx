import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import ActionNeededView from "./ActionNeededView";
import AccountRestrictedView from "./AccountRestrictedView";
import AllCaughtUpView from "./AllCaughtUpView";
import InstaPayLoader from "../../Loader";
import { apiWrapper } from "../../../utils/Functions/apiWrapper";
import styles from "./compliance.module.css";

const Compliance = () => {
  const { t } = useTranslation();
  const [forcedView, setForcedView] = useState(null);

  const {
    data: inquiries = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["user-compliance-inquiries"],
    queryFn: async () => {
      const res = await apiWrapper({
        endpoint: "/api/compliance/inquiries",
        method: "GET",
        isDecrypted: true,
      });
      if (Array.isArray(res)) return res;
      if (Array.isArray(res?.data)) return res.data;
      return [];
    },
  });

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
            "compliance.bannerDefault",
            "We keep compliance clear and reassuring. Responding promptly keeps payments flowing - failure to respond may restrict account activity.",
          )}
          requests={inquiries}
          refetch={refetch}
        />
      );
    }

    if (overdueItems.length > 0) {
      const restrictedData = {
        title: t("compliance.accountRestrictedTitle", "Your account is temporarily restricted"),
        subtitle: t(
          "compliance.accountRestrictedSubtitle",
          "A deadline passed on compliance requests without a response. Resolve the items below to restore full account access.",
        ),
        items: overdueItems.map((item, idx) => ({
          id: item._id || idx,
          title: item.title,
          status: t("compliance.statusOverdue", "Overdue"),
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
            "compliance.bannerDefault",
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
