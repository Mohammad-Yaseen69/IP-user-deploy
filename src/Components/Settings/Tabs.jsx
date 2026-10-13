import { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router";
import { UserContext } from "../../Context/UserContext";
import styles from "./styles/tabs.module.css";

// icons
import basic from "./tabs_icons/basic.svg";
import basic_active from "./tabs_icons/basic_a.svg";
import dyd from "./tabs_icons/delete.svg";
import dyd_active from "./tabs_icons/delete_a.svg";
import dwd from "./tabs_icons/download.svg";
import dwd_active from "./tabs_icons/download_a.svg";
import fin_info from "./tabs_icons/fin_info.svg";
import fin_info_a from "./tabs_icons/fin_info_a.svg";
import hocfy from "./tabs_icons/hocfy.svg";
import hocfy_active from "./tabs_icons/hocfy_a.svg";
import login from "./tabs_icons/login.svg";
import login_active from "./tabs_icons/login_a.svg";
import nominee from "./tabs_icons/nominee.svg";
import nominee_active from "./tabs_icons/nominee_a.svg";
import notif from "./tabs_icons/notification.svg";
import notif_active from "./tabs_icons/notifications_a.svg";
import pass from "./tabs_icons/password.svg";
import pass_active from "./tabs_icons/password_a.svg";
import mwc from "./tabs_icons/receiving.svg";
import mwc_active from "./tabs_icons/receiving_a.svg";
import sec from "./tabs_icons/security.svg";
import sec_active from "./tabs_icons/security_a.svg";
import sa from "./tabs_icons/social.svg";
import sa_active from "./tabs_icons/social_a.svg";
import tfa from "./tabs_icons/tfa.svg";
import tfa_active from "./tabs_icons/tfa_a.svg";
import thres from "./tabs_icons/thres.svg";
import thres_a from "./tabs_icons/thres_a.svg";
import iv from "./tabs_icons/verification.svg";
import iv_active from "./tabs_icons/verification_a.svg";

import { ChevronDown } from "react-feather";
import { usePermission } from "../../hooks/GeneralUse/usePermission";
import useWindowWidth from "../../utils/useWindowWidth";
import NextStepModal from "./NextStepModal";

const TAB_PARAMS = [
  ["basic", "Basic Info"],
  ["password", "Change Password"],
  ["threshold", "Payment Threshold"],
  ["financial", "Financial Info"],
  ["security", "Security Questions"],
  ["nominee", "Nominee Information"],
  ["tfa", "Two Factor Authentication"],
  ["find", "How Others Can Find You"],
  ["social", "My Social Network Accounts"],
  ["notification", "Notifications"],
  ["apikey", "API Key"],
  ["activity", "Login Activity"],
  // "withdraw" rather than "withdrawal" so the shorter link in the app
  // matches too; it never did under the old check.
  ["withdraw", "Receiving Accounts"],
  // Crypto wallets now live on the receiving accounts page.
  ["crypto", "Receiving Accounts"],
  ["cards", "Manage Saved Cards"],
  ["data", "Download Your Data"],
  ["delete", "Delete Your Account"],
];

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
        icon: basic,
        active_icon: basic_active,
      },
      can("settings.password.view") && {
        name: "Change Password",
        icon: pass,
        active_icon: pass_active,
      },
      can("settings.payment-threshold.view") && {
        name: "Payment Threshold",
        icon: thres_a,
        active_icon: thres,
      },
      can("settings.financial-info.view") && {
        name: "Financial Info",
        icon: fin_info,
        active_icon: fin_info_a,
      },
      can("settings.security-questions.view") && {
        name: "Security Questions",
        icon: sec,
        active_icon: sec_active,
      },
      can("settings.nominee.view") && {
        name: "Nominee Information",
        icon: nominee,
        active_icon: nominee_active,
      },
      {
        name: "Two Factor Authentication",
        icon: tfa,
        active_icon: tfa_active,
        tabType: "tfa",
      },
      can("settings.how-others-find-you.view") && {
        name: "How Others Can Find You",
        icon: hocfy,
        active_icon: hocfy_active,
      },
      can("settings.social-accounts.view") && {
        name: "My Social Network Accounts",
        icon: sa,
        active_icon: sa_active,
        tabType: "social",
      },
      can("settings.notifications.view") && {
        name: "Notifications",
        icon: notif,
        active_icon: notif_active,
      },
      can("settings.api-key.view") && {
        name: account_type === "business" ? "API Key" : "",
        icon: iv,
        active_icon: iv_active,
      },
      account_type === "business"
        ? can("settings.business-verification.view") && {
            name: "Business Verification",
            icon: iv,
            active_icon: iv_active,
            tabType: "kyc",
          }
        : {
            name: "Identity Verification",
            icon: iv,
            active_icon: iv_active,
            tabType: "kyc",
          },
      can("settings.login-activity.view") && {
        name: "Login Activity",
        icon: login,
        active_icon: login_active,
      },
      can("settings.receiving-accounts.view") && {
        name: "Receiving Accounts",
        icon: mwc,
        active_icon: mwc_active,
        tabType: "withdrawls",
      },
      can("settings.saved-cards.view") && {
        name: "Manage Saved Cards",
        icon: dwd,
        active_icon: dwd_active,
      },
      can("settings.download-data.view") && {
        name: "Download Your Data",
        icon: dwd,
        active_icon: dwd_active,
      },
      can("settings.delete-account.view") && {
        name: "Delete Your Account",
        icon: dyd,
        active_icon: dyd_active,
      },
    ].filter(Boolean),
  );
  const { t } = useTranslation();
  const [missingTabs, setMissingTabs] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const tab = queryParams.get("tab");
  const ft = queryParams.get("ft");
  const navigate = useNavigate();
  const width = useWindowWidth();
  const [showMissingModal, setShowMissingModal] = useState(false);

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

  const [navigatedTabs] = useState([
    { param: "tfa", name: "Two Factor Authentication" },
    { param: "social", name: "My Social Network Accounts" },
    { param: "crypto", name: "Receiving Accounts" },
    { param: "verification", name: "Identity Verification" },
  ]);
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
      setCurrentTab(
        account_type === "individual" ? "Identity Verification" : "Business Verification",
      );
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

  return (
    <div style={{ overflowX: width < 1000 && "visible" }} className={styles.container}>
      {missingTabsData?.length > 0 && width > 1000 && profileCompleted && (
        <div className={styles.missingTabs}>
          <span>{t("Please complete the following important steps")}</span>
          {missingTabs?.map((item) => (
            <div
              style={{ padding: "12px 5px", width: "100%" }}
              key={item?.name}
              className={`${styles.tab} ${currentTab === item?.name ? styles.active : ""} ${(item?.name !== "Basic Info" && profileIncompleteReason === "basic") || (userDetails?.country?.kyc_required && item?.name !== "Verification" && !ft && !isKycApproved) ? styles.disabled : ""} ${userDetails?.country?.kyc_required && item?.name !== "Verification" ? styles.kyc : ""}`}
              onClick={() => {
                window.history.replaceState(null, null, "");
                setCurrentTab(item?.name);
                verifyToken();

                const activeUrlTab = navigatedTabs?.find((tab) =>
                  window.location.href.includes(tab.param),
                );

                if (activeUrlTab && item?.name === activeUrlTab?.name) {
                  navigate(`/settings`);
                }
              }}
            >
              <img alt="asdfaf" src={item?.name !== currentTab ? item?.active_icon : item?.icon} />
              {t(item?.name)}
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
        <div className={styles.customDropdownWrapper}>
          <div
            className={styles.customDropdownSelected}
            onClick={() => setShowDropdown((prev) => !prev)}
            tabIndex={0}
            style={{ justifyContent: "space-between" }}
            onBlur={(e) => {
              if (!e.currentTarget.contains(e?.relatedTarget)) setShowDropdown(false);
            }}
          >
            {(() => {
              const selected = tabsData.find((tab) => tab.name === currentTab);
              return selected ? (
                <>
                  <div>
                    <img
                      alt="tab-icon"
                      style={{ height: "40px", width: "40px" }}
                      src={selected.active_icon}
                      className={styles.tabIcon}
                    />
                    <span style={{ fontWeight: 600, fontSize: "15px" }}>{t(selected.name)}</span>
                  </div>
                  <ChevronDown />
                </>
              ) : null;
            })()}
          </div>
          {showDropdown && (
            <div className={styles.customDropdownList} tabIndex={-1}>
              {tabsData
                .filter((item) => item?.name.length > 0)
                .map((item) => {
                  const isDisabled =
                    (item?.name !== "Basic Info" && profileIncompleteReason === "basic") ||
                    (userDetails?.country?.kyc_required &&
                      item?.name !== "Verification" &&
                      !ft &&
                      !isKycApproved);
                  return (
                    <div
                      key={item?.name}
                      style={{
                        background:
                          currentTab !== item?.name &&
                          missingTabs.some((i) => i.name === item?.name) &&
                          "rgba(255, 136, 0, 0.08)",
                        justifyContent: "space-between",
                      }}
                      className={
                        styles.customDropdownOption +
                        (isDisabled ? " " + styles.disabled : "") +
                        (currentTab === item?.name ? " " + styles.active : "")
                      }
                      tabIndex={isDisabled ? -1 : 0}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        if (isDisabled) return;
                        setCurrentTab(item?.name);
                        setShowDropdown(false);
                        verifyToken();
                        const activeUrlTab = navigatedTabs.find((tab) =>
                          window.location.href.includes(tab.param),
                        );

                        if (activeUrlTab && item?.name === activeUrlTab.name) {
                          navigate(`/settings`);
                        }
                      }}
                    >
                      <div>
                        <img
                          alt="tab-icon"
                          style={{ width: "40px", height: "40px" }}
                          src={item?.active_icon}
                          className={styles.tabIcon}
                        />
                        <span style={{ fontWeight: 600, fontSize: "15px" }}>{t(item?.name)}</span>
                      </div>

                      {currentTab !== item?.name &&
                        missingTabs.some((i) => i.name === item?.name) && (
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
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}
      {tabsData
        .filter(
          (item) =>
            item?.name?.length > 0 &&
            !missingTabs.some((i) => i.name === item?.name) &&
            width > 1000,
        )
        .map((item) => (
          <div
            key={item?.name}
            className={`${styles.tab} ${currentTab === item?.name ? styles.active : ""} ${(item?.name !== "Basic Info" && profileIncompleteReason === "basic") || (userDetails?.country?.kyc_required && item?.name !== "Verification" && !ft && !isKycApproved) ? styles.disabled : ""} ${userDetails?.country?.kyc_required && item?.name !== "Verification" ? styles.kyc : ""}`}
            onClick={() => {
              if (
                (item?.name !== "Basic Info" && profileIncompleteReason === "basic") ||
                (userDetails?.country?.kyc_required &&
                  item?.name !== "Verification" &&
                  !ft &&
                  !isKycApproved)
              )
                return;
              window.history.replaceState(null, null, "");
              setCurrentTab(item?.name);
              verifyToken();

              const activeUrlTab = navigatedTabs.find((tab) =>
                window.location.href.includes(tab.param),
              );

              if (activeUrlTab) {
                navigate(`/settings`);
              }
            }}
          >
            <img alt="asdfaf" src={item?.name !== currentTab ? item?.active_icon : item?.icon} />
            {t(item?.name)}
            {item?.name.toLowerCase().includes("basic") && profileIncompleteReason === "basic" ? (
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
            {/* {
                            item?.name.toLowerCase().includes("preferences")
                                &&
                                !userDetails?.tfa
                                ?
                                <div style={{ height: "5px", width: "5px", background: "red", borderRadius: "5px", position: "absolute", top: "50%", right: "10px", transform: "translateY(-50%)" }} />
                                :
                                ""
                        } */}
            {/* {
                            item?.name.toLowerCase().includes("identity")
                                &&
                                userDetails?.user?.kyc_status !== "approved"
                                ?
                                <div style={{ height: "5px", width: "5px", background: "red", borderRadius: "5px", position: "absolute", top: "50%", right: "10px", transform: "translateY(-50%)" }} />
                                :
                                ""
                        } */}
          </div>
        ))}
    </div>
  );
};

export default Tabs;
