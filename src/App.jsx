import React, { useLayoutEffect, useState } from 'react'
import Routers from "./RouteNew"
import CustomizerProvider from './Helper/Customizer/CustomizerProvider'
// import FilterProvider from "./Helper/filter/FilterProvider"
// import CartProvider from './Helper/cart/CartProvider';
// import ProductProvider from './Helper/product/ProductProvider';
// import WishListProvider from "./Helper/wishlist/WishProvider"
// import EmailProvider from "./Helper/email/EmailProvider"
// import ChatProvider from "./Helper/chat-app/ChatProvider"
// import BookmarkProvider from "./Helper/bookmark/BookmarkProvider"
// import ContactProvider from './Helper/Contact/ContactProvider'
// import TaskProvider from './Helper/task-app/TaskProvider'
// import TodoProvider from "./Helper/Todo/TodoProvider"
// import TableProvider from "./Helper/Table/TableProvider"
// import Leatning from "./Helper/Leatning/LearningProvider"
// import FAQProvider from './Helper/Faq/FaqProvider'
// import GoogleChartProvider from "./Helper/GoogleChart/GoogleChartProvider"
// import ChartistProvider from "./Helper/Chartist/ChartistProvider"
import AnimationThemeProvider from './Helper/AnimationTheme/AnimationThemeProvider'
import UserState from './Context/UserContext'
import InactivityWrapper from './InactivityWrapper'
import { Suspense } from 'react'
import InstaPayLoader from './Components/Loader'
import { TimezonesProvider } from './Context/TimezoneContext'
import ErrorBoundary from './ErrorBoundary'
import BroadcastPage from './BroadcastPage'
import { ToastContainer } from "react-toastify";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateMomentUtils from '@date-io/moment';



const App = () => {
  const [showOtherTabError, setShowOtherTabError] = useState(false)
  const client = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false
      }
    }
  })

  useLayoutEffect(() => {
    const bc = new BroadcastChannel("dcode");
    let appInUse = false;
    const paths = ["/profile/", "/pay/"]

    const closeWindow = (e) => {
      if (e?.data === "App is already in use!"
        && !paths.some(item => window.location.href.toLowerCase()?.includes(`${e?.origin}${item}`.toLowerCase()))
      ) {
        appInUse = true;
        setShowOtherTabError(true);
      }
    };

    const checkTabVisibility = () => {
      if (!document.hidden && !appInUse) {
        bc.postMessage("App is already in use!");
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
    <div className='App' id='main_app'>
      {
        showOtherTabError
          ?
          <BroadcastPage />
          :
          <ErrorBoundary>
            <Suspense fallback={<InstaPayLoader opacity={1} fallback={true} />}>
              <TimezonesProvider>
                <QueryClientProvider client={client}>
                  <UserState>
                    <InactivityWrapper>
                      <CustomizerProvider>
                        <AnimationThemeProvider>
                          <MuiPickersUtilsProvider utils={DateMomentUtils}>
                            {" "}
                            <Routers />
                            {" "}
                          </MuiPickersUtilsProvider>
                        </AnimationThemeProvider>
                      </CustomizerProvider>
                    </InactivityWrapper>
                  </UserState>
                </QueryClientProvider>
              </TimezonesProvider>
            </Suspense>
          </ErrorBoundary>
      }
      <ToastContainer />
    </div>
  )
}

export default App;