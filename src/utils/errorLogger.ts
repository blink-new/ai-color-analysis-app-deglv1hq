// Error logging and monitoring utilities

export interface ErrorLog {
  id: string
  timestamp: string
  userId?: string
  errorType: string
  errorMessage: string
  stackTrace?: string
  pageUrl: string
  userAgent: string
  additionalData?: Record<string, any>
  severity: 'low' | 'medium' | 'high' | 'critical'
}

export class ErrorLogger {
  private static instance: ErrorLogger
  private logs: ErrorLog[] = []
  private maxLogs = 100

  static getInstance(): ErrorLogger {
    if (!ErrorLogger.instance) {
      ErrorLogger.instance = new ErrorLogger()
    }
    return ErrorLogger.instance
  }

  private constructor() {
    // Set up global error handlers
    this.setupGlobalErrorHandlers()
  }

  private setupGlobalErrorHandlers() {
    // Handle unhandled JavaScript errors
    window.addEventListener('error', (event) => {
      this.logError({
        errorType: 'JavaScript Error',
        errorMessage: event.message,
        stackTrace: event.error?.stack,
        severity: 'high',
        additionalData: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno
        }
      })
    })

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.logError({
        errorType: 'Unhandled Promise Rejection',
        errorMessage: event.reason?.message || String(event.reason),
        stackTrace: event.reason?.stack,
        severity: 'high',
        additionalData: {
          reason: event.reason
        }
      })
    })

    // Handle React errors (if using error boundary)
    const originalConsoleError = console.error
    console.error = (...args) => {
      // Check if this looks like a React error
      const message = args.join(' ')
      if (message.includes('React') || message.includes('component')) {
        this.logError({
          errorType: 'React Error',
          errorMessage: message,
          severity: 'medium',
          additionalData: { args }
        })
      }
      originalConsoleError.apply(console, args)
    }
  }

  logError(error: Partial<ErrorLog>): string {
    const errorLog: ErrorLog = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      userId: this.getCurrentUserId(),
      pageUrl: window.location.href,
      userAgent: navigator.userAgent,
      severity: 'medium',
      ...error,
      errorType: error.errorType || 'Unknown Error',
      errorMessage: error.errorMessage || 'No message provided'
    }

    // Add to local logs
    this.logs.unshift(errorLog)
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs)
    }

    // Store in localStorage for persistence
    this.persistLogs()

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error logged:', errorLog)
    }

    // Send to monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      this.sendToMonitoringService(errorLog)
    }

    return errorLog.id
  }

  private generateId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private getCurrentUserId(): string | undefined {
    // Try to get user ID from various sources
    try {
      // From localStorage
      const userStr = localStorage.getItem('blink_user')
      if (userStr) {
        const user = JSON.parse(userStr)
        return user.id
      }
    } catch {
      // Ignore parsing errors
    }
    return undefined
  }

  private persistLogs() {
    try {
      localStorage.setItem('error_logs', JSON.stringify(this.logs.slice(0, 50)))
    } catch {
      // Ignore storage errors
    }
  }

  private async sendToMonitoringService(errorLog: ErrorLog) {
    try {
      // In a real app, you would send to your monitoring service
      // For now, we'll just log it
      console.warn('Error would be sent to monitoring service:', errorLog)
      
      // Example: Send to a hypothetical monitoring endpoint
      // await fetch('/api/errors', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(errorLog)
      // })
    } catch (sendError) {
      console.error('Failed to send error to monitoring service:', sendError)
    }
  }

  getLogs(): ErrorLog[] {
    return [...this.logs]
  }

  getLogsByType(errorType: string): ErrorLog[] {
    return this.logs.filter(log => log.errorType === errorType)
  }

  getLogsBySeverity(severity: ErrorLog['severity']): ErrorLog[] {
    return this.logs.filter(log => log.severity === severity)
  }

  clearLogs() {
    this.logs = []
    localStorage.removeItem('error_logs')
  }

  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2)
  }

  // Load persisted logs on initialization
  loadPersistedLogs() {
    try {
      const logsStr = localStorage.getItem('error_logs')
      if (logsStr) {
        const persistedLogs = JSON.parse(logsStr)
        this.logs = Array.isArray(persistedLogs) ? persistedLogs : []
      }
    } catch {
      // Ignore loading errors
    }
  }
}

// Convenience functions for common error types
export const logAnalysisError = (error: Error, additionalData?: Record<string, any>) => {
  return ErrorLogger.getInstance().logError({
    errorType: 'Analysis Error',
    errorMessage: error.message,
    stackTrace: error.stack,
    severity: 'high',
    additionalData
  })
}

export const logUploadError = (error: Error, file?: File) => {
  return ErrorLogger.getInstance().logError({
    errorType: 'Upload Error',
    errorMessage: error.message,
    stackTrace: error.stack,
    severity: 'medium',
    additionalData: {
      fileName: file?.name,
      fileSize: file?.size,
      fileType: file?.type
    }
  })
}

export const logPaymentError = (error: Error, additionalData?: Record<string, any>) => {
  return ErrorLogger.getInstance().logError({
    errorType: 'Payment Error',
    errorMessage: error.message,
    stackTrace: error.stack,
    severity: 'critical',
    additionalData
  })
}

export const logNetworkError = (error: Error, url?: string) => {
  return ErrorLogger.getInstance().logError({
    errorType: 'Network Error',
    errorMessage: error.message,
    stackTrace: error.stack,
    severity: 'medium',
    additionalData: { url }
  })
}

export const logUIError = (error: Error, component?: string) => {
  return ErrorLogger.getInstance().logError({
    errorType: 'UI Error',
    errorMessage: error.message,
    stackTrace: error.stack,
    severity: 'low',
    additionalData: { component }
  })
}

// Initialize error logger
export const errorLogger = ErrorLogger.getInstance()
errorLogger.loadPersistedLogs()

// Performance monitoring
export class PerformanceTracker {
  private static instance: PerformanceTracker
  private metrics: Map<string, number[]> = new Map()

  static getInstance(): PerformanceTracker {
    if (!PerformanceTracker.instance) {
      PerformanceTracker.instance = new PerformanceTracker()
    }
    return PerformanceTracker.instance
  }

  startTiming(label: string): () => void {
    const startTime = performance.now()
    
    return () => {
      const endTime = performance.now()
      const duration = endTime - startTime
      
      if (!this.metrics.has(label)) {
        this.metrics.set(label, [])
      }
      
      this.metrics.get(label)!.push(duration)
      
      // Log slow operations
      if (duration > 5000) { // 5 seconds
        errorLogger.logError({
          errorType: 'Performance Warning',
          errorMessage: `Slow operation: ${label} took ${duration.toFixed(2)}ms`,
          severity: 'medium',
          additionalData: { label, duration }
        })
      }
    }
  }

  getMetrics(label: string) {
    const times = this.metrics.get(label) || []
    if (times.length === 0) return null

    return {
      count: times.length,
      average: times.reduce((a, b) => a + b, 0) / times.length,
      min: Math.min(...times),
      max: Math.max(...times),
      latest: times[times.length - 1]
    }
  }

  getAllMetrics() {
    const result: Record<string, any> = {}
    for (const [label] of this.metrics) {
      result[label] = this.getMetrics(label)
    }
    return result
  }
}

export const performanceTracker = PerformanceTracker.getInstance()