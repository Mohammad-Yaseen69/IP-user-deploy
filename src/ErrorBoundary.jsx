import React, { Component } from 'react';
import './ErrorBoundary.css';
import * as Sentry from "@sentry/react";
import InstaPayLoader from './Components/Loader';

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
        if (this.state.isRefreshing) {
            return (
                <div className="container">
                    <InstaPayLoader fallback={true} />
                </div>
            );
        }
        else if (this.state.hasError) {
            return (
                <div className="container">
                    <div className="error-box">
                        <div>
                            <h1>Oops! We cannot process your request at the moment, please try again later.</h1>
                            <p>We are working to fix it. Please try refreshing the page or clear your browsing data for smooth experience.</p>
                            <div className='error-id'>
                                Error ID: {this.state.eventId}
                            </div>
                            <p>If the issue continues, please email us at <a href="mailto:support@insta-pay.ch">support@insta-pay.ch</a> with the Error ID, your username, and phone number for further assistance.</p>
                            <button style={{ marginTop: "30px" }} onClick={() => window.location.reload()} className="error-button">Reload Page</button>
                        </div>
                    </div>
                </div>
            );
        }




        return this.props.children;
    }
}

export default ErrorBoundary;