import { createRoot } from "react-dom/client";
import "./index.scss";
import { i18nReady } from "./i18n";

// import * as serviceWorkerRegistration from './serviceWorkerRegistration';

// libs css
import { BrowserRouter } from "react-router-dom";
import * as Sentry from "@sentry/react";
import { preloadDashboard } from "./Components/HomeNewUpdated/dashboardChunks";

window.addEventListener("error", (e) => {
  if (
    e?.message?.includes("Loading chunk") ||
    e?.message?.includes("ChunkLoadError") ||
    e?.message?.includes("Loading CSS chunk")
  ) {
    window.location.reload();
  }
});

// In index.js or App.js (dev only)
if (import.meta.env.NODE_ENV === "development") {
  window.__REACT_DEVTOOLS_GLOBAL_HOOK__.inject = () => {};
}

Sentry.init({
  dsn: "https://448eafaae4776c67a2f5831cf64a23e5@o4509485673349120.ingest.us.sentry.io/4509485675118592",
  sendDefaultPii: true,
  integrations: [Sentry.browserTracingIntegration()],
  tracesSampleRate: 0.2,
  tracePropagationTargets: [
    "localhost",
    "https://my.insta-pay.ch",
    "https://ip-user-deploy-e57p.vercel.app",
  ],
  replaysSessionSampleRate: 0.5,
  replaysOnErrorSampleRate: 1.0,
  environment: import.meta.env.DEV ? "development" : "production",
  beforeSend(event) {
    if (import.meta.env.DEV) {
      return null;
    }
    return event;
  },
  defaultIntegrations: false,
  enableLogs: true,
});

if (!import.meta.env.DEV) {
  window.console.log = () => {};
  window.console.warn = () => {};
  window.console.error = () => {};
}

const container = document.getElementById("root");
const root = createRoot(container);

const preloadAuthPage = () => {
  const isAuthPage = /^\/(login|signup)(\/|$)/i.test(window.location.pathname);
  if (isAuthPage && !localStorage.getItem("token")) {
    import("./Components/Auth").catch(() => {});
    if (!window.location.href.includes("login")) import("./Components/Auth/Signup").catch(() => {});
  }
};

const preloadDashboardRoute = () => {
  let hasToken = false;
  try {
    hasToken = !!localStorage.getItem("token");
  } catch {
    return;
  }
  if (hasToken && window.location.pathname === "/") preloadDashboard();
};

const loadSentryReplay = () => {
  import("./Helper/sentryReplay")
    .then(({ replayIntegration }) => {
      Sentry.addIntegration(
        replayIntegration({
          maskAllText: false,
          blockAllMedia: false,
        }),
      );
    })
    .catch(() => {});
};

const REPLAY_COHORT_KEY = "ip-sentry-replay-cohort";
const REPLAY_COHORT_RATE = 0.2;

const isInReplayCohort = () => {
  try {
    const stored = sessionStorage.getItem(REPLAY_COHORT_KEY);
    if (stored !== null) return stored === "1";
    const inCohort = Math.random() < REPLAY_COHORT_RATE;
    sessionStorage.setItem(REPLAY_COHORT_KEY, inCohort ? "1" : "0");
    return inCohort;
  } catch {
    return Math.random() < REPLAY_COHORT_RATE;
  }
};

const scheduleSentryReplay = () => {
  if (!isInReplayCohort()) return;
  const loadWhenIdle = () => {
    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(loadSentryReplay);
    } else {
      setTimeout(loadSentryReplay, 2000);
    }
  };
  if (document.readyState === "complete") {
    loadWhenIdle();
  } else {
    window.addEventListener("load", loadWhenIdle, { once: true });
  }
};

const BOOTSTRAP_RETRY_KEY = "ip-bootstrap-retried";

const claimBootstrapRetry = () => {
  try {
    if (sessionStorage.getItem(BOOTSTRAP_RETRY_KEY)) return false;
    sessionStorage.setItem(BOOTSTRAP_RETRY_KEY, "1");
    return true;
  } catch {
    return false;
  }
};

const clearBootstrapRetry = () => {
  try {
    sessionStorage.removeItem(BOOTSTRAP_RETRY_KEY);
  } catch {
    return;
  }
};

async function bootstrap() {
  try {
    preloadAuthPage();
    preloadDashboardRoute();
    const [{ default: App }] = await Promise.all([import("./App"), i18nReady]);

    root.render(
      <BrowserRouter>
        <App />
      </BrowserRouter>,
    );
    clearBootstrapRetry();
  } catch (error) {
    Sentry.captureException(error);
    if (claimBootstrapRetry()) {
      window.location.reload();
      return;
    }
  } finally {
    scheduleSentryReplay();
  }
}

bootstrap();
// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
// serviceWorkerRegistration.register();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(// console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
