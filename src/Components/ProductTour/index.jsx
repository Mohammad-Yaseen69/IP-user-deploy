import { startTransition, useCallback, useContext, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import "./productTour.css";
import { UserContext } from "../../Context/UserContext";
import { usePermission } from "../../hooks/GeneralUse/usePermission";
import { PAGE_CHUNKS } from "./pageChunks";
import { setTourAvailable, TOUR_SEEN_KEY, TOUR_START_EVENT } from "./start";
import { tourTabs } from "./tabs";

const DASHBOARD = "/dashboard/default";

const firstVisible = (selector) => () =>
  [...document.querySelectorAll(selector)].find((el) => el.getClientRects().length);

const usersWhoSawTour = () => {
  try {
    return JSON.parse(localStorage.getItem(TOUR_SEEN_KEY)) || [];
  } catch {
    return [];
  }
};

const markTourSeen = (userId) =>
  localStorage.setItem(TOUR_SEEN_KEY, JSON.stringify([...new Set([...usersWhoSawTour(), userId])]));

const ProductTour = () => {
  const { userDetails } = useContext(UserContext);
  const can = usePermission();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { t } = useTranslation();
  const tourRef = useRef(null);

  const start = useCallback(() => {
    if (!userDetails?._id || tourRef.current?.isActive()) return;
    markTourSeen(userDetails._id);

    const startedFrom = window.location.pathname + window.location.search;
    const tabs = tourTabs(userDetails, can);
    const hasAssistant = Boolean(document.querySelector('[data-tour="assistant"]'));

    const steps = [
      {
        popover: {
          title: t("Welcome to InstaPay"),
          description: t(
            "A quick look around. We'll open each tab in your menu and show you what it's for. You can leave anytime with the X or Esc.",
          ),
          showButtons: ["next", "close"],
        },
      },
      {
        element: firstVisible('[data-tour="language"]'),
        popover: {
          title: t("Change language"),
          description: t(
            "Use InstaPay in your language. Switch anytime from the globe icon at the top of the page.",
          ),
          side: "bottom",
          align: "end",
        },
      },
      ...tabs.map((tab) => ({
        element: firstVisible(`#sidebar-wrapper [data-tour="${tab.title}"]`),
        popover: {
          title: t(tab.title),
          description: t(tab.description),
          side: "right",
          align: "start",
        },
        data: { route: tab.route },
      })),
      ...(hasAssistant
        ? [
            {
              element: firstVisible('[data-tour="assistant"]'),
              popover: {
                title: t("InstaPay Assistant"),
                description: t(
                  "Stuck on something? Ask the assistant anything about InstaPay, like how to send money abroad, and it can take you straight to the right page.",
                ),
                side: "left",
                align: "end",
              },
            },
          ]
        : []),
      {
        element: firstVisible('[data-tour="tour-button"]'),
        popover: {
          title: t("You're all set"),
          description: t("Replay this tour anytime with the compass icon at the top of the page."),
          side: "bottom",
          align: "end",
        },
      },
    ];

    let pagesReady = false;
    let finished = false;

    const goTo = (tour, index) => {
      if (index < 0 || (index > 0 && !pagesReady)) return;
      if (index >= steps.length) {
        finished = true;
        tour.destroy();
        return;
      }
      const route = steps[index].data?.route;
      // startTransition keeps the current page on screen until the next one has rendered.
      if (route && route !== window.location.pathname) startTransition(() => navigate(route));
      tour.moveTo(index);
    };

    const tour = driver({
      steps,
      showProgress: true,
      progressText: "{{current}} / {{total}}",
      nextBtnText: t("Next"),
      prevBtnText: t("Back"),
      doneBtnText: t("Finish"),
      popoverClass: "ip-tour",
      overlayClickBehavior: "none",
      disableActiveInteraction: true,
      stagePadding: 4,
      stageRadius: 10,
      onNextClick: (_el, _step, { driver: d }) => goTo(d, d.getActiveIndex() + 1),
      onPrevClick: (_el, _step, { driver: d }) => goTo(d, d.getActiveIndex() - 1),
      onDestroyed: () => {
        if (finished) startTransition(() => navigate(startedFrom));
      },
    });
    tourRef.current = tour;
    tour.drive();
    tour.updatePopover({ disableButtons: ["next"], nextBtnText: t("Loading pages...") });

    const pageLoaders = tabs.flatMap((tab) => PAGE_CHUNKS[tab.route] ?? []);
    Promise.allSettled(pageLoaders.map((load) => load())).then(() => {
      pagesReady = true;
      if (tour.isActive() && tour.getActiveIndex() === 0) {
        tour.updatePopover({ disableButtons: [], nextBtnText: t("Next") });
      }
    });
  }, [userDetails, can, t, navigate]);

  useEffect(() => {
    const userId = userDetails?._id;
    if (!userId || pathname !== DASHBOARD || usersWhoSawTour().includes(userId)) return;

    const timer = setTimeout(() => {
      if (!document.querySelector(".modal.show")) start();
    }, 2000);
    return () => clearTimeout(timer);
  }, [userDetails?._id, pathname]);

  useEffect(() => {
    window.addEventListener(TOUR_START_EVENT, start);
    return () => window.removeEventListener(TOUR_START_EVENT, start);
  }, [start]);

  useEffect(() => {
    setTourAvailable(true);
    return () => {
      setTourAvailable(false);
      if (tourRef.current?.isActive()) tourRef.current.destroy();
    };
  }, []);

  return null;
};

export default ProductTour;
