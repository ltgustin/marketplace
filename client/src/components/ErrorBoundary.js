import React from 'react';

class ErrorBoundary extends React.Component {
    state = { 
        hasError: false,
        error: null,
        errorInfo: null
    }

    static getDerivedStateFromError(error) {
        return { 
            hasError: true,
            error 
        }
    }

    componentDidCatch(error, errorInfo) {
        console.error('App error:', error)
        console.error('Error details:', errorInfo)
        
        this.setState({
            error,
            errorInfo
        })
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="error-container">
                    <h1>Something went wrong</h1>
                    {this.state.error && (
                        <p className="error-message">
                            {this.state.error.toString()}
                        </p>
                    )}
                    <button 
                        className="refresh-button"
                        onClick={() => {
                            this.setState({ hasError: false })
                            window.location.reload()
                        }}
                    >
                        Refresh Page
                    </button>
                </div>
            )
        }

        return this.props.children
    }
}

export default ErrorBoundary 