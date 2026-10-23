import { useTranslation } from "react-i18next";
import styles from "./styles/index.module.scss";
import { UserContext } from "../../Context/UserContext";
// ...existing code...
import React, { Suspense, useContext, useState } from "react";
import { Button, Card, CardBody } from "reactstrap";
import { useNavigate } from "react-router";
import InstaPayLoader from "../Loader";
const TopRight = React.lazy(() => import("../topRight"));
const Tabs = React.lazy(() => import("./Tabs"));
const Basic = React.lazy(() => import("./Basic"));
const Password = React.lazy(() => import("./Password"));
const SecurityQuestions = React.lazy(() => import("./SecurityQuestion"));
const TwoFactorAuth = React.lazy(() => import("./TwoFactorAuth"));
const Nominee = React.lazy(() => import("./Nominee"));
const Notifications = React.lazy(() => import("./Notifications"));
const Verification = React.lazy(() => import("./Verification"));
const Accounts = React.lazy(() => import("./Accounts"));
const Sessions = React.lazy(() => import("./Sessions"));
const DeleteAccount = React.lazy(() => import("./DeleteAccount"));
const DownloadData = React.lazy(() => import("./DownloadAccountData"));
const ApiKey = React.lazy(() => import("./ApiKey"));
const KYB = React.lazy(() => import("./KYB"));
const HowOthersFindYou = React.lazy(() => import("./HowOthersFindYou"));
const WithdrawalsNew = React.lazy(() => import("./WithdrawalsNew"));
const Threshold = React.lazy(() => import("./Threshold"));
const ManageSaveCards = React.lazy(() => import("./ManageSaveCards"));
const FinancialInfo = React.lazy(() => import("./FinancialInfo"));

// Tabs already on the new card design draw their own cards, so they skip the old panel shadow.
const REDESIGNED_TABS = [
  "Basic Info",
  "Change Password",
  "Security Questions",
  "Two Factor Authentication",
];

const Settings = () => {
  const { t } = useTranslation();
  const [currentTab, setCurrentTab] = useState("Basic Info");
  const { userDetails, verifyToken, profileCompletedPercentage, authHeader, setUpdateToken } =
    useContext(UserContext);
  const navigate = useNavigate();

  if (!userDetails || Object.keys(userDetails || {})?.length === 0) {
    return <InstaPayLoader />;
  }

  return (
    <>
      <Suspense fallback={<InstaPayLoader />}>
        {window.innerWidth > 1000 ? (
          <div className={styles.container}>
            <div className={styles.top}>
              <div className={styles.titles}>
                <h4>{t("Settings")}</h4>
                <p>{t("Your account, security and preferences.")}</p>
              </div>
              <TopRight />
            </div>
            <div className={styles.bottom}>
              <Tabs
                currentTab={currentTab}
                setCurrentTab={setCurrentTab}
                account_type={userDetails?.account_type}
                verifyToken={verifyToken}
              />
              <div
                style={{ marginLeft: "24px" }}
                className={`${styles.right} ${REDESIGNED_TABS.includes(currentTab) ? styles.plain : ""}`}
              >
                {currentTab === "Basic Info" && <Basic setCurrentTab={setCurrentTab} />}
                {currentTab === "Change Password" && <Password />}
                {currentTab === "Security Questions" && <SecurityQuestions />}
                {currentTab === "Two Factor Authentication" && <TwoFactorAuth />}
                {currentTab === "Nominee Information" && <Nominee />}
                {currentTab === "Notifications" && <Notifications />}
                {currentTab === "Identity Verification" &&
                  (profileCompletedPercentage === 100 ? (
                    <Verification />
                  ) : (
                    <Card>
                      <CardBody
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          textAlign: "center",
                          padding: "2.5rem 1rem",
                        }}
                      >
                        <div style={{ fontSize: "1.2rem", fontWeight: "700" }}>
                          {t(
                            "Complete your profile data before proceeding with identity verification.",
                          )}
                        </div>
                        <span>{t('Note: Fill in all required fields in the "Basic Info".')}</span>
                        <div
                          style={{
                            display: "flex",
                            gap: "1rem",
                            flexWrap: "wrap",
                            marginTop: "1.5rem",
                          }}
                        >
                          <Button
                            style={{
                              background:
                                "linear-gradient(to right bottom, #e64067, #5926f0, #4828a0)",
                              border: "none",
                              outline: "none",
                              borderRadius: "10px",
                            }}
                            onClick={() => {
                              setCurrentTab("Basic Info");
                              navigate("/settings?tab=basic&editmode=true");
                            }}
                          >
                            {t("Go to Basic Info")}
                          </Button>
                        </div>
                      </CardBody>
                    </Card>
                  ))}
                {currentTab === "My Social Network Accounts" && <Accounts />}
                {currentTab === "Login Activity" && <Sessions />}
                {currentTab === "Receiving Accounts" && <WithdrawalsNew />}
                {currentTab === "Payment Threshold" && (
                  <Threshold
                    setUpdateToken={setUpdateToken}
                    userDetails={userDetails}
                    authHeader={authHeader}
                  />
                )}
                {currentTab === "Download Your Data" && <DownloadData />}
                {currentTab === "Delete Your Account" && <DeleteAccount />}
                {currentTab === "Financial Info" && <FinancialInfo />}
                {currentTab === "API Key" && <ApiKey />}
                {currentTab === "Manage Saved Cards" && <ManageSaveCards />}
                {currentTab === "Business Verification" &&
                  (profileCompletedPercentage === 100 ? <KYB /> : "Complete Your Profile First")}
                {currentTab === "How Others Can Find You" && <HowOthersFindYou />}
              </div>
            </div>
          </div>
        ) : (
          <div className={styles.mobile}>
            <div className={styles.top}>
              <h4>{t("Settings")}</h4>
            </div>
            {profileCompletedPercentage < 100 && (
              <div className={styles.profile_complete}>
                <div className={styles.left}>
                  <h4>{profileCompletedPercentage.toFixed(0)}%</h4>
                  <span>{t("of your profile is complete")}</span>
                </div>
                <div className={styles.right}>
                  <div
                    className={styles.progress}
                    style={{ "--progress": `${profileCompletedPercentage}%` }}
                  ></div>
                  <div className={styles.bottom}>
                    <span>{t("Complete your profile to smooth your transaction process.")}</span>
                    <div>
                      <span
                        style={{
                          color: "#bba5ff",
                          fontSize: "7px",
                          marginBottom: ".5rem",
                          display: "block",
                          textAlign: "center",
                        }}
                      >
                        {t("Why is this important?")}
                      </span>
                      <button>{t("Complete Now")} &rarr;</button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div className={styles.bottom}>
              <Tabs
                currentTab={currentTab}
                setCurrentTab={setCurrentTab}
                account_type={userDetails?.account_type}
                verifyToken={verifyToken}
              />
              <div className={styles.right}>
                {currentTab === "Basic Info" && <Basic setCurrentTab={setCurrentTab} />}
                {currentTab === "Change Password" && <Password />}
                {currentTab === "Security Questions" && <SecurityQuestions />}
                {currentTab === "Payment Threshold" && (
                  <Threshold userDetails={userDetails} authHeader={authHeader} />
                )}
                {currentTab === "Two Factor Authentication" && <TwoFactorAuth />}
                {currentTab === "Nominee Information" && <Nominee />}
                {currentTab === "Notifications" && <Notifications />}
                {currentTab === "Identity Verification" && <Verification />}
                {currentTab === "My Social Network Accounts" && <Accounts />}
                {currentTab === "Login Activity" && <Sessions />}
                {currentTab === "Receiving Accounts" && <WithdrawalsNew />}
                {currentTab === "Download Your Data" && <DownloadData />}
                {currentTab === "Delete Your Account" && <DeleteAccount />}
                {currentTab === "API Key" && <ApiKey />}
                {currentTab === "Manage Saved Cards" && <ManageSaveCards />}
                {currentTab === "Business Verification" && <KYB />}
                {currentTab === "Financial Info" && <FinancialInfo />}
                {currentTab === "How Others Can Find You" && <HowOthersFindYou />}
              </div>
            </div>
          </div>
        )}
      </Suspense>
    </>
  );
};

export default Settings;
