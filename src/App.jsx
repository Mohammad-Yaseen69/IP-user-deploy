import React, { useEffect, useLayoutEffect, useState } from 'react'
import Routers from "./RouteNew"
import CustomizerProvider from './Helper/Customizer/CustomizerProvider'
import ProjectProvider from './Helper/Project/ProjectProvider'
import FilterProvider from "./Helper/filter/FilterProvider"
import CartProvider from './Helper/cart/CartProvider';
import ProductProvider from './Helper/product/ProductProvider';
import WishListProvider from "./Helper/wishlist/WishProvider"
import EmailProvider from "./Helper/email/EmailProvider"
import ChatProvider from "./Helper/chat-app/ChatProvider"
import BookmarkProvider from "./Helper/bookmark/BookmarkProvider"
import ContactProvider from './Helper/Contact/ContactProvider'
import TaskProvider from './Helper/task-app/TaskProvider'
import TodoProvider from "./Helper/Todo/TodoProvider"
import TableProvider from "./Helper/Table/TableProvider"
import Leatning from "./Helper/Leatning/LearningProvider"
import FAQProvider from './Helper/Faq/FaqProvider'
import JobSearchProvider from './Helper/JobSearch/JobSearchProvider'
import GalleryProvider from "./Helper/Gallery/GalleryProvider"
import GoogleChartProvider from "./Helper/GoogleChart/GoogleChartProvider"
import ChartistProvider from "./Helper/Chartist/ChartistProvider"
import AnimationThemeProvider from './Helper/AnimationTheme/AnimationThemeProvider'
import UserState from './Context/UserContext'
import { useTranslation } from 'react-i18next'
import InactivityWrapper from './InactivityWrapper'
import { BrowserRouter, useLocation } from 'react-router-dom'
import { Suspense } from 'react'
import InstaPayLoader from './Components/Loader'
import { TimezonesProvider } from './Context/TimezoneContext'
import ErrorBoundary from './ErrorBoundary'
import BroadcastPage from './BroadcastPage'
import { ToastContainer } from "react-toastify";
import SessionExpireModal from './Components/SessionExpireModal'

import { decryptData } from "./Helper/EssentilaMethods/Decryption"
import axios from 'axios'

const App = () => {
  const [showOtherTabError, setShowOtherTabError] = useState(false)

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



  const location = useLocation()
  const query = new URLSearchParams(location.search)

  return (
    <div className='App' id='main_app'>
      {
        showOtherTabError
          ?
          <BroadcastPage />
          :
          <ErrorBoundary>
            <Suspense fallback={<InstaPayLoader opacity={1} />}>
              <TimezonesProvider>
                <UserState>
                  <InactivityWrapper>
                    <CustomizerProvider>
                      <WishListProvider>
                        <FilterProvider>
                          <CartProvider>
                            <ProjectProvider>
                              <ProductProvider>
                                <ContactProvider>
                                  <EmailProvider>
                                    <ChatProvider>
                                      <TaskProvider>
                                        <TodoProvider>
                                          <TableProvider>
                                            <Leatning>
                                              <FAQProvider>
                                                <JobSearchProvider>
                                                  <GalleryProvider>
                                                    <GoogleChartProvider>
                                                      <ChartistProvider>
                                                        <BookmarkProvider>
                                                          <AnimationThemeProvider>
                                                            {" "}
                                                            <Routers />
                                                          </AnimationThemeProvider>{" "}
                                                        </BookmarkProvider>
                                                      </ChartistProvider>
                                                    </GoogleChartProvider>
                                                  </GalleryProvider>
                                                </JobSearchProvider>
                                              </FAQProvider>
                                            </Leatning>
                                          </TableProvider>
                                        </TodoProvider>
                                      </TaskProvider>
                                    </ChatProvider>
                                  </EmailProvider>
                                </ContactProvider>
                              </ProductProvider>
                            </ProjectProvider>
                          </CartProvider>
                        </FilterProvider>
                      </WishListProvider>
                    </CustomizerProvider>
                  </InactivityWrapper>
                </UserState>
              </TimezonesProvider>
            </Suspense>
          </ErrorBoundary>
      }
      <ToastContainer />
    </div>
  )
}

export default App;