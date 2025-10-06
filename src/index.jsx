import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.scss';
import App from './App';
// import reportWebVitals from './reportWebVitals';
import './i18n'
import { WidgetSDK } from '@keabank/websdk';

// import * as serviceWorkerRegistration from './serviceWorkerRegistration';

// libs css
import 'swiper/swiper-bundle.css'
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import 'react-phone-input-2/lib/style.css'
import "./Components/PaymentsNewer/styles/i_transfer.css"
import "./Components/PaymentsNewer/styles/ConfirmContainer.css"
import "./Components/PaymentsNewer/styles/Timeline.css"
import "./Components/AddFunds/styles/creditcard.css"
import { BrowserRouter } from 'react-router-dom';
import * as Sentry from "@sentry/react";



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
if (import.meta.env.NODE_ENV === 'development') {
    window.__REACT_DEVTOOLS_GLOBAL_HOOK__.inject = () => { };
}



Sentry.init({
    dsn: "https://448eafaae4776c67a2f5831cf64a23e5@o4509485673349120.ingest.us.sentry.io/4509485675118592",
    sendDefaultPii: true,
    integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration({
            maskAllText: false,
            blockAllMedia: false,
        }),
        Sentry.browserProfilingIntegration()
    ],
    tracesSampleRate: 1.0,
    tracePropagationTargets: ["localhost", "https://my.insta-pay.ch", "https://ip-user-deploy-e57p.vercel.app"],
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    environment: import.meta.env.NODE_ENV === "development" ? "development" : "production",
    beforeSend(event) {
        console.log(event, "Sentry Event")
        if (import.meta.env.NODE_ENV === 'development') {
            return null;
        }
        return event
    },
    profilesSampleRate: 1.0,
    defaultIntegrations: false
});

export const sdk = new WidgetSDK({
    integrationId: import.meta.env.VITE_KEABANK_INTEGRATION_ID,
    merchantId: import.meta.env.VITE_KEABANK_MERCHANT_ID,
})

const container = document.getElementById("root");
const root = createRoot(container);

root.render(
    <BrowserRouter>
        <App />
    </BrowserRouter>
    , document.getElementById("root"));



// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
// serviceWorkerRegistration.register();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(// console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
