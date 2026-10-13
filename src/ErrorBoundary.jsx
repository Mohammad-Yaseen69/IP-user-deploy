import React, { Component } from "react";
import "./ErrorBoundary.css";
import * as Sentry from "@sentry/react";
import InstaPayLoader from "./Components/Loader";
import { withTranslation } from "react-i18next";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, eventId: null, isRefreshing: false };
  }

  static getDerivedStateFromError(error) {
    const stored = JSON.parse(localStorage.getItem("errorsInstances")) || {};
    if (stored[error?.toString()] === 1) {
      return { isRefreshing: true };
    }
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    const errorKey = "errorsInstances";
    const stored = JSON.parse(localStorage.getItem(errorKey)) || {};
    const errorMessage = error.toString();

    if (stored[errorMessage]) {
      stored[errorMessage] += 1;
    } else {
      stored[errorMessage] = 1;
    }
    localStorage.setItem(errorKey, JSON.stringify(stored));

    if (stored[errorMessage] === 1 && !import.meta.env.DEV) {
      this.setState({ isRefreshing: true }, () => {
        window.location.reload();
      });
      return;
    }

    // Second occurrence → send to Sentry
    const eventId = Sentry.captureException(error, { extra: { errorInfo } });
    this.setState({ hasError: true, eventId, isRefreshing: false });

    localStorage.setItem(errorKey, JSON.stringify(stored));
  }

  render() {
    const { t } = this.props;
    if (this.state.isRefreshing) {
      return (
        <div className="container">
          <InstaPayLoader fallback={true} />
        </div>
      );
    } else if (this.state.hasError) {
      return (
        <div className="container">
          <div className="error-box">
            <div>
              <h1>
                {t(
                  "Oops! We cannot process your request at the moment, please try again later.",
                )}
              </h1>
              <p>
                {t(
                  "We are working to fix it. Please try refreshing the page or clear your browsing data for smooth experience.",
                )}
              </p>
              <div className="error-id">
                {t("Error ID")}: {this.state.eventId}
              </div>
              <p>
                {t("If the issue continues, please email us at")}{" "}
                <a href="mailto:support@insta-pay.ch">
                  {t("support@insta-pay.ch")}
                </a>{" "}
                {t(
                  "with the Error ID, your username, and phone number for further assistance.",
                )}
              </p>
              <button
                style={{ marginTop: "30px" }}
                onClick={() => window.location.reload()}
                className="error-button"
              >
                {t("Reload Page")}
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default withTranslation()(ErrorBoundary);
