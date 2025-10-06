import React, { Component } from 'react';
import './ErrorBoundary.css';
import * as Sentry from "@sentry/react";


class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        const eventId = Sentry.captureException(error, {
            extra: { errorInfo },
            tags: { fromErrorBoundary: true }
        });


        this.setState({ hasError: true, eventId });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="container">
                    <div className="error-box">
                        <div>
                            <h1>Oops! We cannot process your request at the moment, please try again later."</h1>
                            <p>We're working to fix it. Please try refreshing the page or clear your browsing data for smooth experience.</p>
                            <div className='error-id'>
                                Error ID: {this.state.eventId}
                            </div>
                            <p>If the issue continues, please email us at  <a href="mailto:support@insta-pay.ch">support@insta-pay.ch</a> with the Error ID, your username, and phone number for further assistance.</p>
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