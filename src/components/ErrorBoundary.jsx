import React, { Component } from 'react';
import ErrorPage from '../pages/ErrorPage';

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI.
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        // You can also log the error to an error reporting service
        console.error("Uncaught error:", error, errorInfo);
    }

    resetErrorBoundary = () => {
        this.setState({ hasError: false, error: null });
        // Optional: window.location.reload() if deep reset needed
    }

    render() {
        if (this.state.hasError) {
            // You can render any custom fallback UI
            return <ErrorPage error={this.state.error} resetErrorBoundary={this.resetErrorBoundary} />;
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
