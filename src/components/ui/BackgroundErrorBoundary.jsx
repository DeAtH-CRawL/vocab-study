import React from 'react';

export class BackgroundErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI.
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        // You can log the error to an error reporting service
        console.warn("Background visual layer failed:", error);
    }

    render() {
        if (this.state.hasError) {
            // Fallback: render nothing (transparent), allowing CSS background to show
            return null;
        }

        return this.props.children;
    }
}
