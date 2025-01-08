import React, { Component } from 'react';
import './ErrorBoundary.css';

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Error caught by Error Boundary: ", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="error-container">
                    <div className="error-box">
                        <h1>Oops! Something went wrong.</h1>
                        <p>We're working to fix it. Please try refreshing the page or clear your browsing data for smooth experience.</p>
                        <button onClick={() => window.location.reload()} className="error-button">Reload Page</button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;