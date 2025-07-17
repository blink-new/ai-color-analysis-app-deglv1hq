import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Bug, Home } from 'lucide-react'
import { Button } from './ui/button'
import { Card } from './ui/card'
import { Badge } from './ui/badge'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  errorId: string | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo
    })

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo)
    }

    // Log error to monitoring service
    this.logErrorToService(error, errorInfo)
  }

  private logErrorToService = (error: Error, errorInfo: ErrorInfo) => {
    try {
      // In a real app, send to error monitoring service
      const errorData = {
        id: this.state.errorId,
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent
      }

      // Store in localStorage for admin review
      const existingErrors = JSON.parse(localStorage.getItem('error_boundary_logs') || '[]')
      existingErrors.unshift(errorData)
      localStorage.setItem('error_boundary_logs', JSON.stringify(existingErrors.slice(0, 10)))

      console.error('Error logged:', errorData)
    } catch (loggingError) {
      console.error('Failed to log error:', loggingError)
    }
  }

  private handleReload = () => {
    window.location.reload()
  }

  private handleGoHome = () => {
    window.location.href = '/'
  }

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    })
  }

  private copyErrorDetails = () => {
    const errorDetails = {
      id: this.state.errorId,
      message: this.state.error?.message,
      stack: this.state.error?.stack,
      componentStack: this.state.errorInfo?.componentStack,
      timestamp: new Date().toISOString(),
      url: window.location.href
    }

    navigator.clipboard.writeText(JSON.stringify(errorDetails, null, 2))
      .then(() => alert('Error details copied to clipboard'))
      .catch(() => console.error('Failed to copy error details'))
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 p-4">
          <Card className="max-w-2xl w-full p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            
            <h1 className="text-2xl font-bold text-red-800 mb-4">
              Oops! Something went wrong
            </h1>
            
            <p className="text-red-700 mb-6">
              We encountered an unexpected error. Our team has been notified and is working on a fix.
            </p>

            {this.state.errorId && (
              <div className="mb-6">
                <Badge variant="outline" className="text-xs">
                  Error ID: {this.state.errorId}
                </Badge>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
              <Button onClick={this.handleRetry} className="bg-red-600 hover:bg-red-700">
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              <Button onClick={this.handleReload} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Reload Page
              </Button>
              <Button onClick={this.handleGoHome} variant="outline">
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </Button>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="text-left bg-gray-50 p-4 rounded-lg border">
                <summary className="cursor-pointer font-medium text-gray-700 mb-2">
                  <Bug className="w-4 h-4 inline mr-2" />
                  Error Details (Development)
                </summary>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-700">Error Message:</h4>
                    <p className="text-sm text-red-600 font-mono bg-red-50 p-2 rounded">
                      {this.state.error.message}
                    </p>
                  </div>
                  
                  {this.state.error.stack && (
                    <div>
                      <h4 className="font-medium text-gray-700">Stack Trace:</h4>
                      <pre className="text-xs text-gray-600 bg-gray-100 p-2 rounded overflow-auto max-h-40">
                        {this.state.error.stack}
                      </pre>
                    </div>
                  )}
                  
                  {this.state.errorInfo?.componentStack && (
                    <div>
                      <h4 className="font-medium text-gray-700">Component Stack:</h4>
                      <pre className="text-xs text-gray-600 bg-gray-100 p-2 rounded overflow-auto max-h-40">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}

                  <Button onClick={this.copyErrorDetails} variant="outline" size="sm">
                    <Bug className="w-4 h-4 mr-2" />
                    Copy Error Details
                  </Button>
                </div>
              </details>
            )}

            <div className="mt-8 text-sm text-gray-600">
              <p>If this problem persists, please contact support with the error ID above.</p>
            </div>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

// Higher-order component for easier usage
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) {
  return function WrappedComponent(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    )
  }
}

// Hook for manual error reporting
export function useErrorHandler() {
  return (error: Error, errorInfo?: any) => {
    // Log error manually
    console.error('Manual error report:', error, errorInfo)
    
    // Store in localStorage for admin review
    try {
      const errorData = {
        id: `manual_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        message: error.message,
        stack: error.stack,
        additionalInfo: errorInfo,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        type: 'manual'
      }

      const existingErrors = JSON.parse(localStorage.getItem('error_boundary_logs') || '[]')
      existingErrors.unshift(errorData)
      localStorage.setItem('error_boundary_logs', JSON.stringify(existingErrors.slice(0, 10)))
    } catch (loggingError) {
      console.error('Failed to log manual error:', loggingError)
    }
  }
}