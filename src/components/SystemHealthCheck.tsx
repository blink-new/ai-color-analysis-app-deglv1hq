import { useState, useEffect } from 'react'
import { Card } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Progress } from './ui/progress'
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  RefreshCw, 
  Shield, 
  Database, 
  Wifi, 
  Zap,
  Eye,
  Settings
} from 'lucide-react'
import { runSystemTests, quickHealthCheck, performanceMonitor } from '../utils/testing'
import type { SystemTestResults } from '../utils/testing'

interface SystemHealthCheckProps {
  onClose?: () => void
}

export function SystemHealthCheck({ onClose }: SystemHealthCheckProps) {
  const [isRunning, setIsRunning] = useState(false)
  const [results, setResults] = useState<SystemTestResults | null>(null)
  const [progress, setProgress] = useState(0)
  const [currentTest, setCurrentTest] = useState('')

  const runTests = async () => {
    setIsRunning(true)
    setProgress(0)
    setCurrentTest('Initializing system tests...')
    
    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90))
      }, 200)

      const testResults = await runSystemTests()
      
      clearInterval(progressInterval)
      setProgress(100)
      setCurrentTest('Tests completed')
      setResults(testResults)
      
    } catch (error) {
      console.error('System tests failed:', error)
      setResults({
        overall: false,
        tests: [{
          name: 'System Test Execution',
          passed: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        }],
        summary: { total: 1, passed: 0, failed: 1 }
      })
    } finally {
      setIsRunning(false)
    }
  }

  const getStatusIcon = (passed: boolean) => {
    return passed ? (
      <CheckCircle className="w-5 h-5 text-green-600" />
    ) : (
      <XCircle className="w-5 h-5 text-red-600" />
    )
  }

  const getStatusBadge = (passed: boolean) => {
    return (
      <Badge variant={passed ? 'default' : 'destructive'}>
        {passed ? 'PASS' : 'FAIL'}
      </Badge>
    )
  }

  const testCategories = [
    { icon: Shield, label: 'Security', tests: ['Security Validation', 'File Upload Validation'] },
    { icon: Database, label: 'Data', tests: ['Blink SDK Connection', 'Local Storage'] },
    { icon: Wifi, label: 'Network', tests: ['Performance', 'Error Handling'] },
    { icon: Eye, label: 'UI/UX', tests: ['UI Components', 'Accessibility'] }
  ]

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Settings className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold">System Health Check</h2>
                <p className="text-sm text-muted-foreground">
                  Comprehensive testing of app functionality and security
                </p>
              </div>
            </div>
            {onClose && (
              <Button variant="ghost" onClick={onClose}>
                ×
              </Button>
            )}
          </div>

          {!results && !isRunning && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Ready to Run System Tests</h3>
              <p className="text-muted-foreground mb-6">
                This will test security, performance, UI components, and data handling
              </p>
              <Button onClick={runTests} className="gradient-bg text-white">
                <RefreshCw className="w-4 h-4 mr-2" />
                Run System Tests
              </Button>
            </div>
          )}

          {isRunning && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <RefreshCw className="w-8 h-8 text-primary animate-spin" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Running System Tests</h3>
                <p className="text-muted-foreground mb-4">{currentTest}</p>
                <Progress value={progress} className="w-full max-w-md mx-auto" />
                <p className="text-sm text-muted-foreground mt-2">{progress}% Complete</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {testCategories.map((category, index) => {
                  const Icon = category.icon
                  const isActive = progress > (index * 25)
                  
                  return (
                    <Card key={category.label} className={`p-4 text-center transition-all ${
                      isActive ? 'bg-primary/5 border-primary/20' : 'opacity-50'
                    }`}>
                      <Icon className={`w-6 h-6 mx-auto mb-2 ${
                        isActive ? 'text-primary' : 'text-muted-foreground'
                      }`} />
                      <p className="text-sm font-medium">{category.label}</p>
                    </Card>
                  )
                })}
              </div>
            </div>
          )}

          {results && (
            <div className="space-y-6">
              {/* Overall Status */}
              <Card className={`p-6 ${
                results.overall ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center gap-4">
                  {getStatusIcon(results.overall)}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">
                      Overall Status: {results.overall ? 'HEALTHY' : 'ISSUES DETECTED'}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {results.summary.passed} of {results.summary.total} tests passed
                    </p>
                  </div>
                  {getStatusBadge(results.overall)}
                </div>
              </Card>

              {/* Test Categories */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {testCategories.map((category) => {
                  const Icon = category.icon
                  const categoryTests = results.tests.filter(test => 
                    category.tests.some(catTest => test.name.includes(catTest))
                  )
                  const allPassed = categoryTests.every(test => test.passed)
                  
                  return (
                    <Card key={category.label} className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <Icon className="w-5 h-5 text-primary" />
                        <h4 className="font-semibold">{category.label}</h4>
                        {getStatusBadge(allPassed)}
                      </div>
                      <div className="space-y-2">
                        {categoryTests.map((test, index) => (
                          <div key={index} className="flex items-center justify-between text-sm">
                            <span className="flex items-center gap-2">
                              {getStatusIcon(test.passed)}
                              {test.name}
                            </span>
                            {test.error && (
                              <span className="text-red-600 text-xs truncate max-w-32" title={test.error}>
                                {test.error}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </Card>
                  )
                })}
              </div>

              {/* Detailed Results */}
              <Card className="p-4">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Detailed Test Results
                </h4>
                <div className="space-y-2 max-h-64 overflow-auto">
                  {results.tests.map((test, index) => (
                    <div key={index} className={`p-3 rounded-lg border ${
                      test.passed ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{test.name}</span>
                        {getStatusBadge(test.passed)}
                      </div>
                      {test.error && (
                        <p className="text-sm text-red-700 mt-1">{test.error}</p>
                      )}
                      {test.details && (
                        <pre className="text-xs text-muted-foreground mt-1 overflow-auto">
                          {JSON.stringify(test.details, null, 2)}
                        </pre>
                      )}
                    </div>
                  ))}
                </div>
              </Card>

              {/* Actions */}
              <div className="flex gap-3 justify-center">
                <Button onClick={runTests} variant="outline">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Run Tests Again
                </Button>
                {onClose && (
                  <Button onClick={onClose} className="gradient-bg text-white">
                    Close
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}

// Quick health indicator component for the header
export function HealthIndicator() {
  const [isHealthy, setIsHealthy] = useState<boolean | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    quickHealthCheck().then(setIsHealthy)
  }, [])

  if (isHealthy === null) return null

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowDetails(true)}
        className={`flex items-center gap-2 ${
          isHealthy ? 'text-green-600 hover:bg-green-50' : 'text-red-600 hover:bg-red-50'
        }`}
      >
        {isHealthy ? (
          <CheckCircle className="w-4 h-4" />
        ) : (
          <XCircle className="w-4 h-4" />
        )}
        <span className="text-xs">
          {isHealthy ? 'Healthy' : 'Issues'}
        </span>
      </Button>

      {showDetails && (
        <SystemHealthCheck onClose={() => setShowDetails(false)} />
      )}
    </>
  )
}