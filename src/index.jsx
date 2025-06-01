import React from 'react';
import ReactDOM from 'react-dom';
import './index.scss';
import App from './App';
// import reportWebVitals from './reportWebVitals';
import './i18n'
// import { GoogleOAuthProvider } from '@react-oauth/google';
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
        e?.message?.includes("ChunkLoadError")
    ) {
        window.location.reload();
    }
});


Sentry.init({
    dsn: "https://e0bd0ea4cbb6bd8c40703a864835449b@o4509423023161344.ingest.us.sentry.io/4509423024472064",
    // Setting this option to true will send default PII data to Sentry.
    // For example, automatic IP address collection on events
    sendDefaultPii: true,
    integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration()
    ],
    // Tracing
    tracesSampleRate: 1.0,
    tracePropagationTargets: ["localhost"],
    // Session Replay
    replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
    replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
    maskAllText: false,
    blockAllMedia: false,
    environment: process.env.NODE_ENV === "development" ? "development" : "production",
    beforeSend(event, hint) {
        // Ignore console errors or warnings that don’t crash UI
        if (!event.exception) return null;

        // Block sending if in local dev
        if (process.env.NODE_ENV === 'development') return null;

        return event;
    }

});


ReactDOM.render(
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
