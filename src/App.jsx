import React, { useLayoutEffect, useState } from "react";
import Routers from "./RouteNew";
import CustomizerProvider from "./Helper/Customizer/CustomizerProvider";
import AnimationThemeProvider from "./Helper/AnimationTheme/AnimationThemeProvider";
import UserState from "./Context/UserContextState";
import InactivityWrapper from "./InactivityWrapper";
import { Suspense } from "react";
import InstaPayLoader from "./Components/Loader";
import { TimezonesProvider } from "./Context/TimezoneContext";
import ErrorBoundary from "./ErrorBoundary";
import BroadcastPage from "./BroadcastPage";
import { ToastContainer } from "react-toastify";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MuiPickersUtilsProvider } from "@material-ui/pickers";
import DateMomentUtils from "@date-io/moment";
import AdBlockCheck from "./Components/AdBlockCheck/AdBlockCheck";
import LanguageAttributeSync from "./Common/LanguageAttributeSync";
import MaintenancePage from "./Components/Maintenance/MaintenancePage";

const underMaintaince = false;

const App = () => {
  const [showOtherTabError, setShowOtherTabError] = useState(false);
  const client = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        refetchOnMount: false,
      },
    },
  });

  useLayoutEffect(() => {
    const bc = new BroadcastChannel("dcode");
    // unique id for this tab/instance so we can ignore our own messages
    const instanceId =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random()}`;
    let appInUse = false;
    const paths = ["/profile/", "/pay/", "/invoice"];

    const closeWindow = (e) => {
      try {
        const data = e?.data;
        // support both string messages (legacy) and object messages
        const messageText = typeof data === "string" ? data : data?.text;
        const senderId = typeof data === "string" ? null : data?.id;

        // ignore messages coming from this same instance
        if (senderId && senderId === instanceId) return;

        if (messageText === "App is already in use!") {
          // Only show the broadcast page if current path is not one of the excluded paths
          if (
            !paths.some((item) => window.location.href.toLowerCase().includes(item.toLowerCase()))
          ) {
            appInUse = true;
            setShowOtherTabError(true);
          }
        }
      } catch (err) {
        // ignore parsing errors
      }
    };

    const checkTabVisibility = () => {
      if (!document.hidden && !appInUse) {
        // include our instance id so other tabs can ignore their own messages
        bc.postMessage({
          text: "App is already in use!",
          id: instanceId,
          origin: window.location.origin,
        });
      }
    };

    bc.addEventListener("message", closeWindow);
    document.addEventListener("visibilitychange", checkTabVisibility);
    checkTabVisibility();

    return () => {
      bc.removeEventListener("message", closeWindow);
      document.removeEventListener("visibilitychange", checkTabVisibility);
      bc.close();
    };
  }, [setShowOtherTabError]);

  // useEffect(() => {
  //   // STEP 1: Check if we just refreshed
  //   const isRefresh = sessionStorage.getItem("isRefresh") === "true";

  //   if (isRefresh) {
  //     // Restore data (token stays alive)
  //     console.log("Page was refreshed – keeping token");
  //     sessionStorage.removeItem("isRefresh"); // Clean up
  //   } else {
  //     // New tab or hard reload – clear token
  //     console.log("New tab or closed – resetting token");
  //     localStorage.removeItem("token");
  //     localStorage.setItem("login", "false");
  //   }

  //   // STEP 2: Set refresh flag before unload (if it's a refresh)
  //   const handleBeforeUnload = () => {
  //     // Detect refresh (hacky but works)
  //     const isHardRefresh = performance.navigation?.type === 1;
  //     if (isHardRefresh) {
  //       sessionStorage.setItem("isRefresh", "true");
  //     }
  //   };

  //   window.addEventListener("beforeunload", handleBeforeUnload);
  //   return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  // }, []);

  // useEffect(() => {
  //   const handleBeforeUnload = (event) => {
  //     event.preventDefault();
  //     event.returnValue = "Closing or refreshing the page may logout your account, Are you sure you want to continue?";
  //   };

  //   const handleUnload = () => {
  //     const coun = localStorage.getItem("ip_country");
  //     localStorage.clear();
  //     localStorage.setItem("ip_country", coun);
  //   };

  //   window.addEventListener('beforeunload', handleBeforeUnload);
  //   window.addEventListener('unload', handleUnload);

  //   return () => {
  //     window.removeEventListener('beforeunload', handleBeforeUnload);
  //     window.removeEventListener('unload', handleUnload);
  //   };
  // }, []);

  return (
    <div className="App" id="main_app">
      <AdBlockCheck />
      {underMaintaince ? (
        <MaintenancePage />
      ) : showOtherTabError ? (
        <BroadcastPage />
      ) : (
        <ErrorBoundary>
          <Suspense fallback={<InstaPayLoader opacity={1} fallback={true} />}>
            <TimezonesProvider>
              <LanguageAttributeSync>
                <QueryClientProvider client={client}>
                  <UserState>
                    <InactivityWrapper>
                      <CustomizerProvider>
                        <AnimationThemeProvider>
                          <MuiPickersUtilsProvider utils={DateMomentUtils}>
                            {" "}
                            <Routers />{" "}
                          </MuiPickersUtilsProvider>
                        </AnimationThemeProvider>
                      </CustomizerProvider>
                    </InactivityWrapper>
                  </UserState>
                </QueryClientProvider>
              </LanguageAttributeSync>
            </TimezonesProvider>
          </Suspense>
        </ErrorBoundary>
      )}
      <ToastContainer />
    </div>
  );
};

export default App;
