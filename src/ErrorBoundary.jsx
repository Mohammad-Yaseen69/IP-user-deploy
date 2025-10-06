import React, { Component } from 'react';
import './ErrorBoundary.css';
import * as Sentry from "@sentry/react";

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, eventId: null, isRefreshing: false };
    }

    static getDerivedStateFromError(error) {
        const stored = JSON.parse(localStorage.getItem("errorsInstances")) || {};
        if (!stored[error?.toString()]) {
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

        if (stored[errorMessage] === 1) {
            this.setState({ isRefreshing: true, countdown: 5 }, () => {
                const timer = setInterval(() => {
                    this.setState(prev => {
                        if (prev.countdown <= 1) {
                            clearInterval(timer);
                            window.location.reload();
                            return null;
                        }
                        return { countdown: prev.countdown - 1 };
                    });
                }, 1000);
            });
            return;
        }

        const eventId = Sentry.captureException(error, { extra: { errorInfo } });
        this.setState({ hasError: true, eventId });

        localStorage.setItem(errorKey, JSON.stringify(stored));
    }

    render() {
        if (this.state.isRefreshing) {
            return (
                <div className="container">
                    <div className="error-box">
                        <div>
                            <h1>Whoops! Something didn’t go as planned.</h1>
                            <p>This usually fixes itself with a quick refresh, so we’re taking care of that for you automatically.</p>
                            <p>If it happens again, you’ll see the full error screen with details so we can help you better.</p>
                            <p style={{ marginTop: "20px", fontStyle: "italic", color: "#555" }}>
                                Refreshing in {this.state.countdown} seconds...
                            </p>
                        </div>
                    </div>
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