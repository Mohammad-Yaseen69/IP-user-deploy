import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router";
import { UserContext } from "../../Context/UserContext";
import styles from "./styles/tabs.module.css";

// icons
import {
  Bank,
  Bell,
  ChartBar,
  User,
  CreditCard,
  Devices,
  DownloadSimple,
  Eye,
  IdCard,
  Gauge,
  Heart,
  LinkSimple,
  MagnifyingGlass,
  Question,
  ShieldCheck,
  Trash,
  Key,
  CaretRight,
} from "./Icons";

import { usePermission } from "../../hooks/GeneralUse/usePermission";
import useWindowWidth from "../../utils/useWindowWidth";
import NextStepModal from "./NextStepModal";
import { getPendingAdditionalFiles } from "../../utils/Functions/additionalFiles";

const TAB_PARAMS = [
  ["basic", "Basic Info"],
  ["password", "Change Password"],
  ["threshold", "Payment Threshold"],
  ["financial", "Financial Info"],
  ["security", "Security Questions"],
  ["nominee", "Nominee Information"],
  ["tfa", "Two Factor Authentication"],
  ["find", "How Others Can Find You"],
  // ["social", "My Social Network Accounts"],
  ["notification", "Notifications"],
  ["apikey", "API Key"],
  ["activity", "Login Activity"],
  ["withdraw", "Receiving Accounts"],
  ["crypto", "Receiving Accounts"],
  // ["cards", "Manage Saved Cards"],
  ["data", "Download Your Data"],
  ["delete", "Delete Your Account"],
];

const TAB_GROUPS = ["Account", "Security", "Money", "Privacy & alerts", "Your data"];

const Tabs = ({ currentTab, setCurrentTab, account_type = "individual" }) => {
  const can = usePermission();

  const {
    profileIncompleteReason,
    userDetails,
    verifyToken,
    missingTabsData,
    userWithdrawals,
    profileCompleted,
  } = useContext(UserContext);
  const [tabsData, setTabsData] = useState(
    [
      can("settings.basic-info.view") && {
        name: "Basic Info",
        label: "Personal details",
        Icon: User,
        group: "Account",
      },
      can("settings.financial-info.view") && {
        name: "Financial Info",
        label: "Financial profile",
        Icon: ChartBar,
        group: "Account",
      },
      can("settings.nominee.view") && {
        name: "Nominee Information",
        label: "Nominee",
        Icon: Heart,
        group: "Account",
        badge: "Add", // static for now, as per Figma
      },
      account_type === "business"
        ? can("settings.business-verification.view") && {
            name: "Business Verification",
            Icon: IdCard,
            tabType: "kyc",
            group: "Account",
          }
        : {
            name: "Identity Verification",
            label: "Identity verification",
            Icon: IdCard,
            tabType: "kyc",
            group: "Account",
          },
      can("settings.api-key.view") && {
        name: account_type === "business" ? "API Key" : "",
        Icon: Key,
        group: "Account",
      },
      can("settings.password.view") && {
        name: "Change Password",
        label: "Password",
        Icon: Key,
        group: "Security",
        badge: "Due soon", // static for now
      },
      {
        name: "Two Factor Authentication",
        label: "Sign-in & 2FA",
        Icon: ShieldCheck,
        tabType: "tfa",
        group: "Security",
      },
      can("settings.security-questions.view") && {
        name: "Security Questions",
        label: "Recovery questions",
        Icon: Question,
        group: "Security",
      },
      can("settings.payment-threshold.view") && {
        name: "Payment Threshold",
        label: "Payment approvals",
        Icon: Gauge,
        group: "Security",
      },
      can("settings.login-activity.view") && {
        name: "Login Activity",
        label: "Devices & sessions",
        Icon: Devices,
        group: "Security",
      },
      can("settings.receiving-accounts.view") && {
        name: "Receiving Accounts",
        label: "Withdrawal accounts",
        Icon: Bank,
        tabType: "withdrawls",
        group: "Money",
      },
      // can("settings.saved-cards.view") && {
      //   name: "Manage Saved Cards",
      //   label: "Saved cards",
      //   Icon: CreditCard,
      //   group: "Money",
      // },
      can("settings.how-others-find-you.view") && {
        name: "How Others Can Find You",
        label: "How people find you",
        Icon: Eye,
        group: "Privacy & alerts",
      },
      // can("settings.social-accounts.view") && {
      //   name: "My Social Network Accounts",
      //   Icon: LinkSimple,
      //   tabType: "social",
      //   group: "Privacy & alerts",
      // },
      can("settings.notifications.view") && {
        name: "Notifications",
        Icon: Bell,
        group: "Privacy & alerts",
      },
      can("settings.download-data.view") && {
        name: "Download Your Data",
        label: "Export your data",
        Icon: DownloadSimple,
        group: "Your data",
      },
      can("settings.delete-account.view") && {
        name: "Delete Your Account",
        label: "Close account",
        Icon: Trash,
        group: "Your data",
      },
    ].filter(Boolean),
  );
  const { t } = useTranslation();
  const [missingTabs, setMissingTabs] = useState([]);
  const [search, setSearch] = useState("");
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const tab = queryParams.get("tab");
  const ft = queryParams.get("ft");
  const navigate = useNavigate();
  const width = useWindowWidth();
  const [showMissingModal, setShowMissingModal] = useState(false);
  const isIndividualAccount = account_type?.toLowerCase() === "individual";
  const [searchLocked, setSearchLocked] = useState(true);

  useEffect(() => {
    if (!tab) return;

    const value = tab.toLowerCase();
    const match = TAB_PARAMS.find(([param]) => value.includes(param));
    if (!match) return;

    // Only switch to a tab this account actually has. A tab the role
    // denies, or one hidden for this account type, would otherwise leave
    // the panel empty with nothing to click back to.
    if (tabsData.some((item) => item.name === match[1])) {
      setCurrentTab(match[1]);
    }
  }, [tab, tabsData]);

  useEffect(() => {
    if (userDetails?._id && typeof userWithdrawals !== "undefined" && profileCompleted) {
      if (missingTabsData.length > 0) {
        const newMissingTabs = missingTabsData
          .map((tabType) => tabsData.find((tab) => tab.tabType === tabType))
          .filter(Boolean);
        setMissingTabs(newMissingTabs);
      } else {
        setMissingTabs([]);
      }
    }
  }, [userDetails, userWithdrawals, missingTabsData, profileCompleted]);

  console.log(missingTabsData);

  useEffect(() => {
    if (tab?.toLowerCase()?.includes("verification")) {
      setCurrentTab(isIndividualAccount ? "Identity Verification" : "Business Verification");
    }
  }, [tab, userDetails]);

  useEffect(() => {
    if (userDetails?._id) {
      if (
        !userDetails?.user?.financial_answers ||
        userDetails?.user?.financial_answers.length === 0
      ) {
        setTabsData(tabsData?.filter((t) => t.name !== "Financial Info"));
      }
    }
  }, [userDetails]);

  const isKycApproved =
    userDetails?.account_type === "business"
      ? userDetails?.company?.kyb_status === "approved" ||
        userDetails?.company?.kyb_status === "verified"
      : userDetails?.user?.kyc_status === "approved";

  // Admin-required additional files / questions lock every tab except the
  // verification tab (where they are submitted) until they are provided.
  // The basic-profile lock takes priority, hence the profileCompleted guard.
  const verificationTabName = isIndividualAccount
    ? "Identity Verification"
    : "Business Verification";
  const hasRequiredAdditionalFiles =
    profileCompleted === true &&
    getPendingAdditionalFiles(userDetails).requiredVerification.length > 0;

  useEffect(() => {
    if (hasRequiredAdditionalFiles && currentTab !== verificationTabName) {
      setCurrentTab(verificationTabName);
    }
  }, [hasRequiredAdditionalFiles, currentTab, verificationTabName]);

  const urlTabName = tab?.toLowerCase().includes("verification")
    ? verificationTabName
    : TAB_PARAMS.find(([param]) => tab?.toLowerCase().includes(param))?.[1];

  const syncTabParam = (name) => {
    const param =
      name === verificationTabName ? "verification" : TAB_PARAMS.find(([, n]) => n === name)?.[0];
    if (!param || name === urlTabName) return;
    navigate(`?${new URLSearchParams({ tab: param, ...(ft && { ft }) })}`, { replace: true });
  };

  const lastTab = useRef(currentTab);

  useEffect(() => {
    if (lastTab.current !== currentTab) syncTabParam(currentTab);
    lastTab.current = currentTab;
  }, [currentTab]);

  const isTabDisabled = (item) =>
    (item?.name !== "Basic Info" && profileIncompleteReason === "basic") ||
    (userDetails?.country?.kyc_required &&
      item?.name !== "Verification" &&
      !ft &&
      !isKycApproved) ||
    (hasRequiredAdditionalFiles && item?.name !== verificationTabName);

  const tabClassName = (item) =>
    `${styles.tab} ${currentTab === item?.name ? styles.active : ""} ${isTabDisabled(item) ? styles.disabled : ""} ${userDetails?.country?.kyc_required && item?.name !== "Verification" ? styles.kyc : ""} ${hasRequiredAdditionalFiles && item?.name !== verificationTabName ? styles.required : ""}`;

  const searchTerm = search.trim().toLowerCase();
  const visibleTabs = tabsData.filter(
    (item) =>
      item?.name?.length > 0 &&
      [item.label, item.name].some((text) => text && t(text).toLowerCase().includes(searchTerm)),
  );
  const groupTabs = (list) =>
    TAB_GROUPS.map((group) => ({
      group,
      items: list.filter((item) => item.group === group),
    })).filter((g) => g.items.length > 0);

  const displayName = isIndividualAccount
    ? `${userDetails?.user?.first_name ?? ""} ${userDetails?.user?.last_name ?? ""}`.trim()
    : (userDetails?.company?.company_name ?? "");

  const isVerified = useMemo(() => isKycApproved, [isKycApproved]);

  const setTab = (tab) => {
    setCurrentTab(tab);
    verifyToken();
    syncTabParam(tab);
  };

  return (
    <div style={{ overflowX: width < 1000 && "visible" }} className={styles.container}>
      {missingTabs?.length > 0 && width > 1000 && profileCompleted && (
        <div className={styles.missingTabs}>
          <span>{t("Please complete the following important steps")}</span>
          {missingTabs?.map((item) => (
            <div
              style={{ padding: "12px 5px", width: "100%" }}
              key={item?.name}
              className={tabClassName(item)}
              onClick={() => {
                if (isTabDisabled(item)) return;
                window.history.replaceState(null, null, "");
                setTab(item?.name);
              }}
            >
              <item.Icon className={styles.icon} color="#5926F0" />
              <span className={styles.label}>{t(item?.label || item?.name)}</span>
            </div>
          ))}
        </div>
      )}

      {missingTabsData.length > 0 && width < 1000 && profileCompleted && (
        <div className={styles.missingDiv}>
          <div className={styles.missingContent}>
            <span className={styles.infoIcon}>i</span>
            <h4>{t("Please complete these important steps for a seamless experience.")}</h4>
          </div>
          <button className={styles.viewStepsBtn} onClick={() => setShowMissingModal(true)}>
            {t("View the Steps")}
          </button>
        </div>
      )}

      <NextStepModal
        isOpen={showMissingModal}
        toggle={() => setShowMissingModal(false)}
        setCurrentTab={setCurrentTab}
      />

      {width < 1000 && (
        <div className={styles.profileCard} onClick={() => setTab(tabsData[0]?.name)}>
          <div className={styles.avatar}>MS</div>
          <div className={styles.profileInfo}>
            <p className={styles.profileName}>{displayName}</p>
            <p className={styles.profileMeta}>
              {isIndividualAccount ? t("Personal account") : t("Business account")} ·{" "}
              {isVerified ? t("Verified") : t("Unverified")}
            </p>
          </div>
          <CaretRight size={16} strokeWidth={1.5} className={styles.caret} />
        </div>
      )}

      <div className={styles.search}>
        <MagnifyingGlass size={21} strokeWidth={1.5} className={styles.searchIcon} />
        <input
          type="text"
          name="settings-search"
          autoComplete="off"
          readOnly={searchLocked}
          onFocus={() => setSearchLocked(false)}
          onBlur={() => setSearchLocked(true)}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("Search settings")}
        />
      </div>

      {width < 1000 &&
        groupTabs(visibleTabs).map(({ group, items }) => (
          <div key={group} className={styles.mobileGroup}>
            <p className={styles.mobileGroupLabel}>{t(group)}</p>
            <div className={styles.mobileList}>
              {items.map((item) => {
                const isDisabled = isTabDisabled(item);
                const isMissing =
                  currentTab !== item?.name && missingTabs.some((i) => i.name === item?.name);
                return (
                  <div
                    key={item?.name}
                    style={{
                      background: isMissing && "rgba(255, 136, 0, 0.08)",
                    }}
                    className={styles.mobileRow + (isDisabled ? " " + styles.disabled : "")}
                    tabIndex={isDisabled ? -1 : 0}
                    onClick={() => {
                      if (isDisabled) return;
                      setTab(item?.name);
                    }}
                  >
                    <item.Icon className={styles.icon} color={"#6E7687"} />
                    <span className={styles.label}>{t(item?.label || item?.name)}</span>

                    {item?.badge && <span className={styles.badge}>{t(item.badge)}</span>}
                    {item?.value && <span className={styles.rowValue}>{item.value}</span>}

                    {isMissing && (
                      <div
                        style={{
                          width: "14px",
                          height: "14px",
                          background: "#EB8C1D",
                          borderRadius: "50%",
                          flexShrink: "0",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          color: "white",
                          fontWeight: 600,
                        }}
                      >
                        i
                      </div>
                    )}
                    <CaretRight size={16} strokeWidth={1.5} className={styles.caret} />
                  </div>
                );
              })}
            </div>
          </div>
        ))}

      {width > 1000 &&
        groupTabs(
          visibleTabs.filter((item) => !missingTabs.some((i) => i.name === item?.name)),
        ).map(({ group, items }) => (
          <div key={group} className={styles.group}>
            <p className={styles.groupLabel}>{t(group)}</p>
            {items.map((item) => (
              <div
                key={item?.name}
                className={tabClassName(item)}
                onClick={() => {
                  if (isTabDisabled(item)) return;
                  window.history.replaceState(null, null, "");
                  setTab(item?.name);
                }}
              >
                <item.Icon
                  color={currentTab === item?.name ? "#5926f0" : "#1b1f2a"}
                  className={styles.icon}
                />
                <span className={styles.label}>{t(item?.label || item?.name)}</span>
                {item?.badge && <span className={styles.badge}>{t(item.badge)}</span>}
                {item?.name === verificationTabName && hasRequiredAdditionalFiles ? (
                  <div
                    style={{
                      height: "5px",
                      width: "5px",
                      background: "red",
                      borderRadius: "5px",
                      position: "absolute",
                      top: "50%",
                      right: "10px",
                      transform: "translateY(-50%)",
                    }}
                  />
                ) : (
                  ""
                )}
                {item?.name.toLowerCase().includes("basic") &&
                profileIncompleteReason === "basic" ? (
                  <div
                    style={{
                      height: "5px",
                      width: "5px",
                      background: "red",
                      borderRadius: "5px",
                      position: "absolute",
                      top: "50%",
                      right: "10px",
                      transform: "translateY(-50%)",
                    }}
                  />
                ) : (
                  ""
                )}
                {item?.name.toLowerCase().includes("security") &&
                profileIncompleteReason === "security" ? (
                  <div
                    style={{
                      height: "5px",
                      width: "5px",
                      background: "red",
                      borderRadius: "5px",
                      position: "absolute",
                      top: "50%",
                      right: "10px",
                      transform: "translateY(-50%)",
                    }}
                  />
                ) : (
                  ""
                )}
              </div>
            ))}
          </div>
        ))}
    </div>
  );
};

export default Tabs;
