import { Fragment, createContext, useContext, useEffect, useMemo, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import TapTop from "./TapTop/index";
import CheckContext from "../Helper/Customizer";
import AnimationThemeContext from "../Helper/AnimationTheme";
import ConfigDB from "../Config/ThemeConfig";
import Loader from "./Loader";
import SidebarNew from "./SidebarNew/SidebarNew";
import ProfileCompletionModal from "../Components/ProfileCompletionModal";
import { UserContext } from "../Context/UserContext";
import styles from "./Layout.module.css"
import BottomNav from "./BottomNav";
import MobileSidebar from "./MobileSidebar";
import InactivityLogoutModal from "../Components/InactivityLogoutModal";
import ThreeDaysModal from "../Components/SecurityQuestionsModals/ThreeDaysModal";
import ThirtyDaysModal from "../Components/SecurityQuestionsModals/ThirtyDaysModal";
import { InactivityContext } from "../InactivityWrapper";
import InactivityCountDownTimer from "../Components/InactivityCounter";
import SourceOfFunds from "../Components/SourceOfFundsModal";
import AddBeneficiaryAddressModal from "../Components/AddBeneficiaryAddressModal";


export const MobileSbContext = createContext(null);

const MobileSbContextProvider = ({ children }) => {
  const [mobileSidebar, setMobileSidebar] = useState(false);
  const toggleSidebar = () => setMobileSidebar(!mobileSidebar)
  return (
    <MobileSbContext.Provider value={{
      mobileSidebar,
      toggleSidebar
    }}>{children}</MobileSbContext.Provider>
  )
}

const Layout = ({ children, classNames, ...rest }) => {
  const { setTogglSidebar, sidebar_types } =
    useContext(CheckContext);
  // const { setIsVertical } = useContext(ProductContext);
  const location = useLocation();
  const query = new URLSearchParams(location.search)
  const isPaAddress = query.get("payment_type")
  const isw2w = query.get("send_type")
  const queryData = location?.search?.split("=")[1]?.toString();
  const { animation } = useContext(AnimationThemeContext);
  const animationTheme =
    localStorage.getItem("animation") ||
    animation ||
    ConfigDB.data.router_animation;
  let sidebar_types1 = (queryData === "compact-wrapper" || queryData === "horizontal-wrapper") ? queryData : localStorage.getItem('sidebar_types') || ConfigDB.data.settings.sidebar.type || sidebar_types;

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

  const [showModal, setShowModal] = useState(null)
  const [showKyc, setShowKyc] = useState(false)

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
    verifyToken,
    beneficiaries,
    getUserBeneficiaries
  } = useContext(UserContext)

  const beneficiaryWithoutAddresses = useMemo(() => {
    if ((location.pathname.startsWith("/beneficiaries"))) {
      return beneficiaries.filter(item => !item.address || item?.address === "")
    } else {
      return []
    }
  }, [beneficiaries, location])

  useEffect(() => {
    setShowModal(!profileCompleted)
  }, [profileCompleted])





  useEffect(() => {
    if (showModal && location.pathname.toLowerCase().includes("settings")) {
      setShowModal(false)
    }
  }, [showModal, location])

  useEffect(() => {
    if (is30Days && location.pathname.toLowerCase().includes("settings")) {
      setIs30Days(false)
    }
  }, [is30Days, location])



  // const socketConfig = {
  //   url: process.env.REACT_APP_IP_DEV_API,
  //   transports: ["websocket", "polling", "flashsocket"],
  // };

  // const socketsService = new SocketsService(socketConfig, checkAuth);
  // useEffect(() => {
  //   socketsService.connect();
  //   const userId = userDetails?._id;
  //   socketsService.connectToServer(userId);

  //   return () => {
  //     NS7R5M0zrsService.disconnect();
  //   };
  // }, [socketsService, userDetails]);

  useEffect(() => {
    if (location.pathname === "/" || location.pathname.toLowerCase() === "/dashboard/default") {
      setTogglSidebar(true)
    } else {
      setTogglSidebar(false)
    }
  }, [location])

  const { showTimerCountdown } = useContext(InactivityContext)

  useEffect(() => {
    verifyToken()
  }, [location])

  const [showSourceModal, setShowSourceModal] = useState(false)

  useEffect(() => {
    setShowSourceModal(!userDetails?.user?.source_of_funds && userDetails?.user?.occupation)

    if (userDetails?.user?.kyc_status !== "approved" && userDetails?.country?.kyc_required) {
      setShowModal(true)
      setShowKyc(true)
    }
  }, [userDetails])
  return (
    <Fragment>
      {
        (beneficiaryWithoutAddresses.length > 0)
        &&
        <AddBeneficiaryAddressModal
          isOpen={beneficiaryWithoutAddresses.length > 0}
          toggle={getUserBeneficiaries}
          close={() => beneficiaryWithoutAddresses.length = 0}
          beneficiaries={beneficiaryWithoutAddresses}
        />
      }
      {
        showSourceModal
        &&
        <SourceOfFunds
          isOpen={showSourceModal}
          toggle={() => setShowSourceModal(false)}
        />
      }
      {
        showTimerCountdown
        &&
        <InactivityCountDownTimer />
      }
      <MobileSbContextProvider>
        <InactivityLogoutModal
          isOpen={showInactivityModal}
          toggle={() => setShowInactivityModal(!showInactivityModal)}
        />
        {
          is30Days
            ?
            <ThirtyDaysModal
              isOpen={is30Days}
              toggle={() => { }}
            />
            :
            <ThreeDaysModal
              isOpen={threeDaysReminder}
              toggle={() => set3DaysReminder(!threeDaysReminder)}
            />
        }
        {
          window.innerWidth > 1000
            ?
            <div className={styles.pc_layout}>
              {
                ((showModal === true && typeof profileCompleted === "boolean") || (showModal && showKyc && !window.location.pathname.toLowerCase().includes("/settings")))
                &&
                <ProfileCompletionModal setShowModal={setShowModal} profileIncompleteReason={profileIncompleteReason} kyc={showKyc && profileCompleted} />
              }
              <Loader />
              <TapTop />
              <div style={{
                pointerEvents: (is30Days || showModal) && !window.location.pathname.toLowerCase().includes("/profile/") ? "none" : "all"
              }} className={`page-wrapper ${sidebar_types1} `} id="pageWrapper">
                {/* <Header /> */}
                <div className="page-body-wrapper">
                  {/* <SideBar /> */}
                  <SidebarNew
                    setShowModal={setShowModal}
                    showModal={showModal}
                  />
                  <div className="page-body" style={{ marginTop: 0, paddingTop: 0 }}>
                    <TransitionGroup {...rest}>
                      <CSSTransition key={location.key} timeout={100} classNames={animationTheme} unmountOnExit>
                        <div>
                          <Outlet />
                        </div>
                      </CSSTransition>
                    </TransitionGroup>
                  </div>
                  {/* <Footer /> */}
                </div>
              </div>
              {/* <Themecustomizer /> */}
            </div>
            :
            <>
              {
                ((showModal === true && typeof profileCompleted === "boolean") || (showModal && showKyc && !window.location.pathname.toLowerCase().includes("/settings")))
                &&
                <ProfileCompletionModal setShowModal={setShowModal} profileIncompleteReason={profileIncompleteReason} kyc={showKyc && profileCompleted} />
              }
              <div style={{
                pointerEvents: userDetails && (is30Days || showModal) ? "none" : "all",
                paddingBottom: location.pathname.includes("pin") && 0
              }} className={styles.mobile_layout}>
                <Loader />
                <MobileSidebar setShowModal={setShowModal} />
                <Outlet />
                <BottomNav setShowModal={setShowModal} />
              </div>
            </>
        }
      </MobileSbContextProvider>
    </Fragment>
  );
};
export default Layout;