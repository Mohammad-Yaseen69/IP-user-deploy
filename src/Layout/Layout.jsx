import { Fragment, createContext, useContext, useEffect, useMemo, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import TapTop from "./TapTop/index";
import CheckContext from "../Helper/Customizer";
import AnimationThemeContext from "../Helper/AnimationTheme";
import ConfigDB from "../Config/ThemeConfig";
import Loader from "./Loader";
import SidebarNew from "./SidebarNew/SidebarNew";
import ProfileCompletionModal from "../Components/ProfileCompletionModal";
import ForcedAuthenticatorModal from "../Components/ForcedAuthenticatorModal";
import { UserContext } from "../Context/UserContext";
import styles from "./Layout.module.css";
import BottomNav from "./BottomNav";
import MobileSidebar from "./MobileSidebar";
import InactivityLogoutModal from "../Components/InactivityLogoutModal";
import ThreeDaysModal from "../Components/SecurityQuestionsModals/ThreeDaysModal";
import ThirtyDaysModal from "../Components/SecurityQuestionsModals/ThirtyDaysModal";
import { InactivityContext } from "../InactivityWrapper";
import InactivityCountDownTimer from "../Components/InactivityCounter";
import SourceOfFunds from "../Components/SourceOfFundsModal";
import AddBeneficiaryAddressModal from "../Components/AddBeneficiaryAddressModal";
import { Modal, ModalBody, ModalHeader } from "reactstrap";
import FinancialInfoModal from "../Components/FinancialInfoModal";
import success from "../Components/Auth/files/success.gif";
import SocketsService from "../Services/Socket";
import AnotherLoginModal from "../Components/AnotherLoginModal";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import AdditionalDocumentModal from "./AdditionalDocumentModal";
import ForcedAdditionalFilesModal from "../Components/ForcedAdditionalFilesModal";
import { getPendingAdditionalFiles, MASTERCARD_PURPOSE } from "../utils/Functions/additionalFiles";
import NewMenu from "../Common/NewMenu";
import AssistantWidget from "../Components/AssistantWidget";
import { useVirtualIbans } from "../hooks/useVirtualIban";
import PushConsentModal from "../Components/PushConsentModal";
import { isPushSupported, getPushPermissionState } from "../Services/PushNotificationService";

export const MobileSbContext = createContext(null);

const MobileSbContextProvider = ({ children }) => {
  const [mobileSidebar, setMobileSidebar] = useState(false);
  const toggleSidebar = () => setMobileSidebar(!mobileSidebar);
  return (
    <MobileSbContext.Provider
      value={{
        mobileSidebar,
        toggleSidebar,
      }}
    >
      {children}
    </MobileSbContext.Provider>
  );
};

const Layout = ({ children, classNames, ...rest }) => {
  const { setTogglSidebar, sidebar_types } = useContext(CheckContext);
  const { t } = useTranslation();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const queryClient = useQueryClient();
  const benId = query.get("user_id");
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineModal, setShowOfflineModal] = useState();
  const queryData = location?.search?.split("=")[1]?.toString();
  const { animation } = useContext(AnimationThemeContext);
  const animationTheme =
    localStorage.getItem("animation") || animation || ConfigDB.data.router_animation;
  let sidebar_types1 =
    queryData === "compact-wrapper" || queryData === "horizontal-wrapper"
      ? queryData
      : localStorage.getItem("sidebar_types") ||
        ConfigDB.data.settings.sidebar.type ||
        sidebar_types;

  // const sideBarReload = () => {
  //   if (sidebarType === "horizontal-wrapper") {
  //     if (window.innerWidth <= 1200) {
  //       navigate({ search: `?sidebar=compact-wrapper` });
  //       setDefaultClass(true);
  //       sidebar_types1 = "compact-wrapper"
  //     } else {
  //       navigate({ search: `?sidebar=horizontal-wrapper` });
  //       setDefaultClass(false);
  //     }
  //   }
  // }
  // useEffect(() => {
  //   sideBarReload()
  //   setDefaultClass(true);
  //   window.addEventListener("resize", () => {
  //     sideBarReload()
  //     if (window.innerWidth - 440 <= 759) {
  //       setTogglSidebar(true);
  //     } else {
  //       setTogglSidebar(false);
  //     }
  //     if (window.innerWidth <= 1200) {
  //       setIsVertical(true);
  //     } else {
  //       setIsVertical(false);
  //     }
  //   });
  // }, []);

  const [showModal, setShowModal] = useState(null);
  const [showKyc, setShowKyc] = useState(false);

  const {
    profileCompleted,
    profileIncompleteReason,
    userDetails,
    showInactivityModal,
    setShowInactivityModal,
    is30Days,
    setIs30Days,
    threeDaysReminder,
    set3DaysReminder,
    is30DaysInfo,
    threeDaysReminderInfo,
    set3DaysReminderInfo,
    setIs30DaysInfo,
    verifyToken,
    beneficiaries,
    getUserBeneficiaries,
    showAnotherLoginModal,
    setShowAnotherLoginModal,
    isAgentLogin,
    agentDetails,
    shouldForceAuthenticator,
    authHeader,
  } = useContext(UserContext);
  const [showSuccessModal, setShowSuccessModal] = useState();
  const [showAdditionalFilesModal, setShowAdditionalModal] = useState(false);
  const navigate = useNavigate();

  const accountId = userDetails?.account?._id || userDetails?.account_id;

  const { data: virtualIbans = [], isLoading: virtualIbansLoading } = useVirtualIbans(accountId);

  const pendingAdditionalFiles = useMemo(
    () => getPendingAdditionalFiles(userDetails),
    [userDetails],
  );
  const hasRequiredAdditionalFiles = pendingAdditionalFiles.required.length > 0;

  const requiredFilesOnSettings = pendingAdditionalFiles.requiredVerification.length > 0;
  const requiredFilesTarget = requiredFilesOnSettings
    ? "/settings?tab=verification&scroll=additional-files"
    : "/my-mastercard";
  // KYC/KYB requests are answered from the Virtual IBAN Compliance tab, so don't prompt there;
  // Mastercard requests still do.
  const onVirtualIbanPage = location.pathname.toLowerCase().includes("virtual-iban");
  const hideOptionalFilesModalHere =
    onVirtualIbanPage &&
    !pendingAdditionalFiles.optional.some((item) => item?.purpose === MASTERCARD_PURPOSE);
  const onRequiredFilesPage =
    location.pathname
      .toLowerCase()
      .includes(requiredFilesOnSettings ? "settings" : "my-mastercard") ||
    (requiredFilesOnSettings && onVirtualIbanPage);
  const showForcedFilesModal =
    profileCompleted === true && !showModal && hasRequiredAdditionalFiles && !onRequiredFilesPage;

  useEffect(() => {
    if (location.pathname.toLowerCase().includes("my-mastercard")) return;
    if (hasRequiredAdditionalFiles) return;

    if (pendingAdditionalFiles.optional.length > 0) {
      setShowAdditionalModal(true);
    }
  }, [userDetails]);

  useEffect(() => {
    if (virtualIbansLoading) return;

    const hasVirtualIban = virtualIbans?.length > 0;

    if (hasVirtualIban && location.pathname.toLowerCase() === "/onboarding-iban") {
      navigate("/", { replace: true });
    }
  }, [virtualIbans, virtualIbansLoading, location.pathname, navigate]);
  const beneficiaryWithoutAddresses = useMemo(() => {
    if (location.pathname.startsWith("/beneficiaries/edit") && benId) {
      const beneficiary = beneficiaries?.find((ben) => ben?._id === benId);

      if (beneficiary?.address) {
        return [];
      } else {
        return [beneficiary];
      }
    } else {
      return [];
    }
  }, [beneficiaries, location]);

  useEffect(() => {
    setShowModal(!profileCompleted);
  }, [profileCompleted]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    if (isOnline === false) {
      setShowOfflineModal(true);
    } else {
      setShowOfflineModal(false);
    }
  }, [isOnline]);

  useEffect(() => {
    if (showModal && location.pathname.toLowerCase().includes("settings")) {
      setShowModal(false);
    }
  }, [showModal, location]);

  useEffect(() => {
    if (is30Days && location.pathname.toLowerCase().includes("settings")) {
      setIs30Days(false);
    }
  }, [is30Days, location]);

  const socketConfig = useMemo(
    () => ({
      url: import.meta.env.VITE_IP_DEV_API,
      transports: ["websocket", "polling", "flashsocket"],
    }),
    [],
  );

  const socketsService = useMemo(() => new SocketsService(socketConfig, () => {}), [socketConfig]);

  useEffect(() => {
    if (userDetails?._id) {
      socketsService.connect();
      const userId = isAgentLogin && agentDetails?._id ? agentDetails?._id : userDetails?._id;
      socketsService.connectToServer(userId, false, null, null, () =>
        setShowAnotherLoginModal(true),
      );
      socketsService.onPrivateMessage = () => {
        queryClient.invalidateQueries({ queryKey: ["receivedQuotations"] });
        queryClient.invalidateQueries({ queryKey: ["sentQuotations"] });
      };
      socketsService.onNewNotification = () => {
        queryClient.invalidateQueries({ queryKey: ["notifications"] });
        queryClient.invalidateQueries({ queryKey: ["userWallets"] });
        queryClient.invalidateQueries({ queryKey: ["userTransactions"] });
      };
      return () => {
        socketsService.disconnect();
      };
    }
  }, [socketsService, userDetails?._id]);

  const [showPushConsent, setShowPushConsent] = useState(false);

  useEffect(() => {
    if (!userDetails?._id) return;
    if (!isPushSupported()) return;

    const permission = getPushPermissionState();
    if (permission !== "default") return;

    const dismissedTime = localStorage.getItem("instapay_push_prompt_dismissed");
    if (dismissedTime) {
      const sevenDays = 7 * 24 * 60 * 60 * 1000;
      if (Date.now() - Number(dismissedTime) < sevenDays) {
        return;
      }
    }

    const timer = setTimeout(() => {
      setShowPushConsent(true);
    }, 2500);

    return () => clearTimeout(timer);
  }, [userDetails?._id]);

  useEffect(() => {
    const path = location.pathname.toLowerCase();
    if (
      path === "/" ||
      path === "/dashboard/default" ||
      path === "/my-mastercard" ||
      path === "/payments" ||
      path.startsWith("/copy-trading")
    ) {
      setTogglSidebar(true);
    } else {
      setTogglSidebar(false);
    }
  }, [location]);

  const { showTimerCountdown } = useContext(InactivityContext);

  useEffect(() => {
    verifyToken();
  }, [location]);

  const [showSourceModal, setShowSourceModal] = useState(false);

  useEffect(() => {
    setShowSourceModal(!userDetails?.user?.source_of_funds && userDetails?.user?.occupation);

    if (userDetails?.user?.kyc_status !== "approved" && userDetails?.country?.kyc_required) {
      setShowModal(true);
      setShowKyc(true);
    }
  }, [userDetails]);

  const isFinancialQuestionModalOpen =
    (is30DaysInfo && userDetails?.account_type === "individual" && profileCompleted === true) ||
    (threeDaysReminderInfo &&
      userDetails?.account_type === "individual" &&
      profileCompleted === true) ||
    is30Days ||
    (threeDaysReminder && !threeDaysReminderInfo && profileCompleted === true && !is30DaysInfo);

  const canShowForcedAuthenticator =
    shouldForceAuthenticator && !showModal && !isFinancialQuestionModalOpen;

  return (
    <Fragment>
      {beneficiaryWithoutAddresses.length > 0 && (
        <AddBeneficiaryAddressModal
          isOpen={beneficiaryWithoutAddresses.length > 0}
          toggle={getUserBeneficiaries}
          close={() => (beneficiaryWithoutAddresses.length = 0)}
          beneficiaries={beneficiaryWithoutAddresses}
        />
      )}
      <Modal isOpen={showOfflineModal}>
        <ModalHeader>
          <span style={{ fontSize: "22px", fontWeight: 600, color: "red" }}>
            {t("No Internet Connection")}
          </span>
        </ModalHeader>
        <ModalBody>
          <div>
            <h4>{t("Please check your internet connection to continue using Instapay.")}</h4>
          </div>
        </ModalBody>
      </Modal>

      {showSourceModal && (
        <SourceOfFunds isOpen={showSourceModal} toggle={() => setShowSourceModal(false)} />
      )}
      {showTimerCountdown && <InactivityCountDownTimer />}
      <MobileSbContextProvider>
        <InactivityLogoutModal
          isOpen={showInactivityModal}
          toggle={() => setShowInactivityModal(!showInactivityModal)}
        />
        {is30DaysInfo &&
          profileCompleted === true &&
          userDetails?.account_type === "individual" && (
            <FinancialInfoModal
              isOpen={
                is30DaysInfo &&
                userDetails?.account_type === "individual" &&
                profileCompleted === true
              }
              toggleOnSuccess={() => setIs30DaysInfo(!is30DaysInfo)}
              setShowSuccessModal={setShowSuccessModal}
            />
          )}

        {showAdditionalFilesModal &&
          !location.pathname.toLowerCase().includes("settings") &&
          !location.pathname.toLowerCase().includes("my-mastercard") &&
          !location.pathname.toLowerCase().includes("payments") &&
          !hideOptionalFilesModalHere && (
            <AdditionalDocumentModal
              isOpen={showAdditionalFilesModal}
              toggle={() => setShowAdditionalModal(false)}
            />
          )}

        {threeDaysReminderInfo &&
          profileCompleted === true &&
          userDetails?.account_type === "individual" && (
            <FinancialInfoModal
              isOpen={
                threeDaysReminderInfo &&
                userDetails?.account_type === "individual" &&
                profileCompleted === true
              }
              toggle={() => set3DaysReminderInfo(!threeDaysReminderInfo)}
              toggleOnSuccess={() => set3DaysReminderInfo(!threeDaysReminderInfo)}
              setShowSuccessModal={setShowSuccessModal}
            />
          )}
        {is30Days && !threeDaysReminderInfo && profileCompleted === true && !is30DaysInfo ? (
          <ThirtyDaysModal isOpen={is30Days} toggle={() => {}} />
        ) : (
          <ThreeDaysModal
            isOpen={
              threeDaysReminder &&
              !threeDaysReminderInfo &&
              profileCompleted === true &&
              !is30DaysInfo
            }
            toggle={() => set3DaysReminder(!threeDaysReminder)}
          />
        )}
        <Modal toggle={() => setShowSuccessModal(false)} isOpen={showSuccessModal}>
          <ModalHeader toggle={() => setShowSuccessModal(false)}>
            {t("Questions Added")}
          </ModalHeader>
          <ModalBody>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
              }}
            >
              <img width={300} src={success} alt="" loading="lazy" />
              <h4 style={{ textAlign: "center" }}>
                {t("Your Financial Questions are all added successfully.")}
              </h4>
            </div>
          </ModalBody>
        </Modal>
        {window.innerWidth > 1000 ? (
          <div className={styles.pc_layout}>
            {((showModal === true && typeof profileCompleted === "boolean") ||
              (showModal &&
                showKyc &&
                !window.location.pathname.toLowerCase().includes("/settings"))) && (
              <ProfileCompletionModal
                setShowModal={setShowModal}
                profileIncompleteReason={profileIncompleteReason}
                kyc={showKyc && profileCompleted}
              />
            )}
            {showForcedFilesModal && (
              <ForcedAdditionalFilesModal
                files={pendingAdditionalFiles.required}
                target={requiredFilesTarget}
              />
            )}
            {canShowForcedAuthenticator && <ForcedAuthenticatorModal />}
            <Loader />
            <TapTop />
            <div
              style={{
                pointerEvents:
                  (is30Days || showModal || shouldForceAuthenticator) &&
                  userDetails?.account_type === "individual" &&
                  !window.location.pathname.toLowerCase().includes("/profile/")
                    ? "none"
                    : "all",
              }}
              className={`page-wrapper ${sidebar_types1} `}
              id="pageWrapper"
            >
              {/* <Header /> */}
              <div className="page-body-wrapper">
                {/* <SideBar /> */}
                <NewMenu />
                <SidebarNew setShowModal={setShowModal} showModal={showModal} />
                <div className="page-body" style={{ marginTop: 0, paddingTop: 0 }}>
                  <TransitionGroup {...rest}>
                    <CSSTransition timeout={100} classNames={animationTheme} unmountOnExit>
                      {/* <div> */}
                      <Outlet />
                      {/* </div> */}
                    </CSSTransition>
                  </TransitionGroup>
                </div>
                {/* <Footer /> */}
              </div>
            </div>
            {/* <Themecustomizer /> */}
          </div>
        ) : (
          <>
            {((showModal === true && typeof profileCompleted === "boolean") ||
              (showModal &&
                showKyc &&
                !window.location.pathname.toLowerCase().includes("/settings"))) && (
              <ProfileCompletionModal
                setShowModal={setShowModal}
                profileIncompleteReason={profileIncompleteReason}
                kyc={showKyc && profileCompleted}
              />
            )}
            {showForcedFilesModal && (
              <ForcedAdditionalFilesModal
                files={pendingAdditionalFiles.required}
                target={requiredFilesTarget}
              />
            )}
            {canShowForcedAuthenticator && <ForcedAuthenticatorModal />}
            <div
              style={{
                // pointerEvents: userDetails && (is30Days || showModal || shouldForceAuthenticator) ? "none" : "all",
                paddingBottom: location.pathname.includes("pin") && 0,
              }}
              className={styles.mobile_layout}
            >
              <Loader />
              <MobileSidebar setShowModal={setShowModal} />
              <Outlet />
              <BottomNav setShowModal={setShowModal} />
            </div>
          </>
        )}
        {showAnotherLoginModal && (
          <AnotherLoginModal
            isOpen={showAnotherLoginModal}
            toggle={() => setShowAnotherLoginModal(false)}
          />
        )}
        <PushConsentModal
          isOpen={showPushConsent}
          onClose={() => setShowPushConsent(false)}
          accountId={userDetails?._id}
          authHeader={authHeader}
        />
        <AssistantWidget />
      </MobileSbContextProvider>
    </Fragment>
  );
};
export default Layout;
