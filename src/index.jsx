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


window.addEventListener("error", (e) => {
    if (
        e?.message?.includes("Loading chunk") ||
        e?.message?.includes("ChunkLoadError")
    ) {
        window.location.reload();
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
