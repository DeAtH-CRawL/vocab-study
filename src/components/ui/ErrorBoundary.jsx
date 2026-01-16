import React from 'react';
import { Card } from './Card';
import { Button } from './Button';

/**
 * React Error Boundary Component
 * Catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI instead of crashing the whole app.
 * 
 * This is production-critical for graceful error handling.
 */
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        // Log error details for debugging
        console.error('ErrorBoundary caught an error:', error, errorInfo);

        this.setState({
            error,
            errorInfo
        });
    }

    handleReload = () => {
        // Reset error boundary and reload the app
        this.setState({ hasError: false, error: null, errorInfo: null });
        window.location.reload();
    };

    handleReset = () => {
        // Reset error boundary without reloading (soft reset)
        this.setState({ hasError: false, error: null, errorInfo: null });
    };

    render() {
        if (this.state.hasError) {
            // Fallback UI
            return (
                <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-6">
                    <Card className="max-w-2xl w-full p-8 md:p-12 text-center space-y-6">
                        <div className="space-y-2">
                            <h1 className="text-4xl font-bold text-rose-500">Oops!</h1>
                            <h2 className="text-xl font-semibold text-slate-200">
                                Something went wrong
                            </h2>
                            <p className="text-slate-400">
                                The application encountered an unexpected error. Don't worry, your data is safe.
                            </p>
                        </div>

                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <details className="text-left bg-slate-950/50 rounded-lg p-4 border border-slate-800">
                                <summary className="cursor-pointer text-slate-300 font-mono text-sm mb-2">
                                    Error Details (Development Only)
                                </summary>
                                <pre className="text-xs text-rose-400 overflow-auto">
                                    {this.state.error.toString()}
                                    {this.state.errorInfo && this.state.errorInfo.componentStack}
                                </pre>
                            </details>
                        )}

                        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                            <Button
                                variant="primary"
                                onClick={this.handleReload}
                                className="min-w-[140px]"
                            >
                                Reload App
                            </Button>
                            <Button
                                variant="ghost"
                                onClick={this.handleReset}
                                className="min-w-[140px]"
                            >
                                Try Again
                            </Button>
                        </div>
                    </Card>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
