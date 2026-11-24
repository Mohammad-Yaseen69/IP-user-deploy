import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Fragment,
  Suspense,
  createContext,
  lazy,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import TapTop from "./TapTop/index";
import CheckContext from "../Helper/Customizer";
import AnimationThemeContext from "../Helper/AnimationTheme";
import ConfigDB from "../Config/ThemeConfig";
import Loader from "./Loader";
import SidebarNew from "./SidebarNew/SidebarNew";
import ForcedAuthenticatorModal from "../Components/ForcedAuthenticatorModal";
import { UserContext } from "../Context/UserContext";
import styles from "./Layout.module.css";
import BottomNav from "./BottomNav";
import MobileSidebar from "./MobileSidebar";
import InactivityLogoutModal from "../Components/InactivityLogoutModal";
import ThreeDaysModal from "../Components/SecurityQuestionsModals/ThreeDaysModal";
import ThirtyDaysModal from "../Components/SecurityQuestionsModals/ThirtyDaysModal";
import { InactivityContext, InactivityCountdownContext } from "../InactivityWrapper";
import "swiper/css";
import "../Components/MyMasterCard/styles/modal.reset.css";
import "./globalElementStyles.css";
import "../Context/Typing.css";
import "../Components/AddBeneficiary/req_star.css";
import "../Components/Settings/styles/Switch.css";
import SourceOfFunds from "../Components/SourceOfFundsModal";
import { Modal, ModalBody, ModalHeader } from "reactstrap";
import success from "../Components/Auth/files/success.gif";
import SocketsService from "../Services/Socket";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import { getPendingAdditionalFiles, MASTERCARD_PURPOSE } from "../utils/Functions/additionalFiles";
import NewMenu from "../Common/NewMenu";
import { useVirtualIbans } from "../hooks/useVirtualIban";
import PushConsentModal from "../Components/PushConsentModal";
import { isPushSupported, getPushPermissionState } from "../Services/PushNotificationService";
import {
  useBeneficiaryDetails,
  useInvalidateBeneficiaryDetails,
} from "../hooks/BeneficiaryHooks/useBeneficiaryDetails";
import InstaPayLoader from "../Components/Loader";
import { getLoginPath } from "../utils/Functions/loginPage";
import useWindowWidth from "../utils/useWindowWidth";

const loadAddBeneficiaryAddressModal = () => import("../Components/AddBeneficiaryAddressModal");
const AddBeneficiaryAddressModal = lazy(loadAddBeneficiaryAddressModal);
const loadInactivityCountDownTimer = () => import("../Components/InactivityCounter");
const InactivityCountDownTimer = lazy(loadInactivityCountDownTimer);
const loadFinancialInfoModal = () => import("../Components/FinancialInfoModal");
const FinancialInfoModal = lazy(loadFinancialInfoModal);
const loadAdditionalDocumentModal = () => import("./AdditionalDocumentModal");
const AdditionalDocumentModal = lazy(loadAdditionalDocumentModal);
const loadProfileCompletionModal = () => import("../Components/ProfileCompletionModal");
const ProfileCompletionModal = lazy(loadProfileCompletionModal);
const loadForcedAdditionalFilesModal = () => import("../Components/ForcedAdditionalFilesModal");
const ForcedAdditionalFilesModal = lazy(loadForcedAdditionalFilesModal);
const loadAnotherLoginModal = () => import("../Components/AnotherLoginModal");
const AnotherLoginModal = lazy(loadAnotherLoginModal);
const AssistantWidget = lazy(() => import("../Components/AssistantWidget"));

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

const LayoutContent = ({ children, classNames, ...rest }) => {
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
  const pageTransitionRef = useRef(null);
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
    const prefetch = () => {
      loadAddBeneficiaryAddressModal().catch(() => {});
      loadInactivityCountDownTimer().catch(() => {});
      loadFinancialInfoModal().catch(() => {});
      loadAdditionalDocumentModal().catch(() => {});
      loadProfileCompletionModal().catch(() => {});
      loadForcedAdditionalFilesModal().catch(() => {});
      loadAnotherLoginModal().catch(() => {});
    };
    let idleId;
    let timeoutId;
    const schedule = () => {
      if ("requestIdleCallback" in window) {
        idleId = window.requestIdleCallback(prefetch);
      } else {
        timeoutId = setTimeout(prefetch, 2000);
      }
    };
    if (document.readyState === "complete") {
      schedule();
    } else {
      window.addEventListener("load", schedule, { once: true });
    }
    return () => {
      window.removeEventListener("load", schedule);
      if (idleId !== undefined) window.cancelIdleCallback?.(idleId);
      if (timeoutId !== undefined) clearTimeout(timeoutId);
    };
  }, []);

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
  const isBeneficiaryEdit = location.pathname.startsWith("/beneficiaries/edit") && !!benId;
  const { data: editedBeneficiary } = useBeneficiaryDetails(benId, { enabled: isBeneficiaryEdit });
  const invalidateBeneficiaryDetails = useInvalidateBeneficiaryDetails();
  const beneficiaryWithoutAddresses = useMemo(
    () =>
      isBeneficiaryEdit && editedBeneficiary && !editedBeneficiary.address
        ? [editedBeneficiary]
        : [],
    [isBeneficiaryEdit, editedBeneficiary],
  );
  const onBeneficiaryAddressSaved = () => {
    invalidateBeneficiaryDetails(benId);
    getUserBeneficiaries();
  };
  const [dismissedBeneficiaries, setDismissedBeneficiaries] = useState(null);
  const windowWidth = useWindowWidth();

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
      {beneficiaryWithoutAddresses.length > 0 &&
        dismissedBeneficiaries !== beneficiaryWithoutAddresses && (
          <Suspense fallback={null}>
            <AddBeneficiaryAddressModal
              isOpen={beneficiaryWithoutAddresses.length > 0}
              toggle={onBeneficiaryAddressSaved}
              close={() => {
                beneficiaryWithoutAddresses.length = 0;
                setDismissedBeneficiaries(beneficiaryWithoutAddresses);
              }}
              beneficiaries={beneficiaryWithoutAddresses}
            />
          </Suspense>
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
      {showTimerCountdown && (
        <Suspense fallback={null}>
          <InactivityCountDownTimer />
        </Suspense>
      )}
      <MobileSbContextProvider>
        <InactivityLogoutModal
          isOpen={showInactivityModal}
          toggle={() => setShowInactivityModal(!showInactivityModal)}
        />
        {is30DaysInfo &&
          profileCompleted === true &&
          userDetails?.account_type === "individual" && (
            <Suspense fallback={null}>
              <FinancialInfoModal
                isOpen={
                  is30DaysInfo &&
                  userDetails?.account_type === "individual" &&
                  profileCompleted === true
                }
                toggleOnSuccess={() => setIs30DaysInfo(!is30DaysInfo)}
                setShowSuccessModal={setShowSuccessModal}
              />
            </Suspense>
          )}

        {showAdditionalFilesModal &&
          !location.pathname.toLowerCase().includes("settings") &&
          !location.pathname.toLowerCase().includes("my-mastercard") &&
          !location.pathname.toLowerCase().includes("payments") &&
          !hideOptionalFilesModalHere && (
            <Suspense fallback={null}>
              <AdditionalDocumentModal
                isOpen={showAdditionalFilesModal}
                toggle={() => setShowAdditionalModal(false)}
              />
            </Suspense>
          )}

        {threeDaysReminderInfo &&
          profileCompleted === true &&
          userDetails?.account_type === "individual" && (
            <Suspense fallback={null}>
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
            </Suspense>
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
        {windowWidth > 1000 ? (
          <div className={styles.pc_layout}>
            {((showModal === true && typeof profileCompleted === "boolean") ||
              (showModal &&
                showKyc &&
                !window.location.pathname.toLowerCase().includes("/settings"))) && (
              <Suspense fallback={null}>
                <ProfileCompletionModal
                  setShowModal={setShowModal}
                  profileIncompleteReason={profileIncompleteReason}
                  kyc={showKyc && profileCompleted}
                />
              </Suspense>
            )}
            {showForcedFilesModal && (
              <Suspense fallback={null}>
                <ForcedAdditionalFilesModal
                  files={pendingAdditionalFiles.required}
                  target={requiredFilesTarget}
                />
              </Suspense>
            )}
            {canShowForcedAuthenticator && <ForcedAuthenticatorModal />}
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
                    <CSSTransition
                      nodeRef={pageTransitionRef}
                      timeout={100}
                      classNames={animationTheme}
                      unmountOnExit
                    >
                      <Suspense fallback={<Loader />}>
                        <Outlet />
                      </Suspense>
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
              <Suspense fallback={null}>
                <ProfileCompletionModal
                  setShowModal={setShowModal}
                  profileIncompleteReason={profileIncompleteReason}
                  kyc={showKyc && profileCompleted}
                />
              </Suspense>
            )}
            {showForcedFilesModal && (
              <Suspense fallback={null}>
                <ForcedAdditionalFilesModal
                  files={pendingAdditionalFiles.required}
                  target={requiredFilesTarget}
                />
              </Suspense>
            )}
            {canShowForcedAuthenticator && <ForcedAuthenticatorModal />}
            <div
              style={{
                // pointerEvents: userDetails && (is30Days || showModal || shouldForceAuthenticator) ? "none" : "all",
                paddingBottom: location.pathname.includes("pin") && 0,
              }}
              className={styles.mobile_layout}
            >
              <MobileSidebar setShowModal={setShowModal} />
              <Suspense fallback={<Loader />}>
                <Outlet />
              </Suspense>
              <BottomNav setShowModal={setShowModal} />
            </div>
          </>
        )}
        {showAnotherLoginModal && (
          <Suspense fallback={null}>
            <AnotherLoginModal
              isOpen={showAnotherLoginModal}
              toggle={() => setShowAnotherLoginModal(false)}
            />
          </Suspense>
        )}
        <PushConsentModal
          isOpen={showPushConsent}
          onClose={() => setShowPushConsent(false)}
          accountId={userDetails?._id}
          authHeader={authHeader}
        />
        <Suspense fallback={null}>
          <AssistantWidget />
        </Suspense>
      </MobileSbContextProvider>
    </Fragment>
  );
};
const Layout = (props) => {
  const { userDetails, verifyToken, tokenCheckFailures } = useContext(UserContext);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (token && !userDetails) {
      verifyToken();
    }
  }, [token]);

  useEffect(() => {
    if (!tokenCheckFailures || !token || userDetails) return undefined;
    const timer = setTimeout(() => verifyToken(), 3000);
    return () => clearTimeout(timer);
  }, [tokenCheckFailures]);

  if (!token) {
    const currentPath = window.location.pathname + window.location.search;
    if (currentPath !== "/") {
      sessionStorage.setItem("path", currentPath);
    }
    return <Navigate to={getLoginPath()} replace />;
  }

  if (!userDetails) {
    return <InstaPayLoader fallback />;
  }

  return <LayoutContent {...props} />;
};

export default Layout;
