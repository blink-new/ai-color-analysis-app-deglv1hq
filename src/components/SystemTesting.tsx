import { useState } from 'react'
import { Play, CheckCircle, XCircle, AlertCircle, RefreshCw, Download, Bug, Shield, Zap } from 'lucide-react'
import { Button } from './ui/button'
import { Card } from './ui/card'
import { Badge } from './ui/badge'
import { Progress } from './ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { runSystemTests, quickHealthCheck, performanceMonitor, type SystemTestResults } from '../utils/testing'

export function SystemTesting() {
  const [testResults, setTestResults] = useState<SystemTestResults | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [healthStatus, setHealthStatus] = useState<boolean | null>(null)
  const [progress, setProgress] = useState(0)

  const runTests = async () => {
    setIsRunning(true)
    setProgress(0)
    
    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90))
      }, 200)
      
      const results = await runSystemTests()
      setTestResults(results)
      
      clearInterval(progressInterval)
      setProgress(100)
      
      // Also run health check
      const health = await quickHealthCheck()
      setHealthStatus(health)
    } catch (error) {
      console.error('Test execution failed:', error)
    } finally {
      setIsRunning(false)
      setTimeout(() => setProgress(0), 1000)
    }
  }

  const runHealthCheck = async () => {
    const health = await quickHealthCheck()
    setHealthStatus(health)
  }

  const downloadReport = () => {
    if (!testResults) return
    
    const report = {
      timestamp: new Date().toISOString(),
      overall: testResults.overall,
      summary: testResults.summary,
      tests: testResults.tests,
      performance: performanceMonitor.getAllMetrics(),
      healthStatus,
      systemInfo: {
        userAgent: navigator.userAgent,
        url: window.location.href,
        timestamp: new Date().toISOString(),
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        }
      }
    }
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `system-test-report-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
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
      <Badge variant={passed ? 'default' : 'destructive'} className={passed ? 'bg-green-100 text-green-800' : ''}>
        {passed ? 'PASS' : 'FAIL'}
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            System Testing & Diagnostics
          </h2>
          <p className="text-muted-foreground">Comprehensive testing suite for the color analysis application</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={runHealthCheck} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Health Check
          </Button>
          <Button onClick={runTests} disabled={isRunning} className="bg-primary hover:bg-primary/90">
            {isRunning ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Play className="w-4 h-4 mr-2" />
            )}
            Run Full Test Suite
          </Button>
          {testResults && (
            <Button onClick={downloadReport} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Download Report
            </Button>
          )}
        </div>
      </div>

      {/* Health Status */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${healthStatus === true ? 'bg-green-500 animate-pulse' : healthStatus === false ? 'bg-red-500' : 'bg-gray-300'}`} />
            <span className="font-medium">System Health</span>
          </div>
          <Badge variant={healthStatus === true ? 'default' : 'destructive'} className={healthStatus === true ? 'bg-green-100 text-green-800' : ''}>
            {healthStatus === true ? 'Healthy' : healthStatus === false ? 'Issues Detected' : 'Unknown'}
          </Badge>
        </div>
      </Card>

      {/* Test Progress */}
      {isRunning && (
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <RefreshCw className="w-5 h-5 animate-spin text-primary" />
              <span className="font-medium">Running comprehensive system tests...</span>
            </div>
            <Progress value={progress} className="w-full" />
            <p className="text-sm text-muted-foreground">
              Testing core functionality, security, performance, accessibility, and admin features
            </p>
          </div>
        </Card>
      )}

      {/* Test Results */}
      {testResults && (
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="details">Test Details</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-6">
                <div className="flex items-center gap-3">
                  {getStatusIcon(testResults.overall)}
                  <div>
                    <p className="font-medium">Overall Status</p>
                    <p className={`text-2xl font-bold ${testResults.overall ? 'text-green-600' : 'text-red-600'}`}>
                      {testResults.overall ? 'PASS' : 'FAIL'}
                    </p>
                  </div>
                </div>
              </Card>
              
              <Card className="p-6">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium">Tests Passed</p>
                    <p className="text-2xl font-bold text-green-600">{testResults.summary.passed}</p>
                  </div>
                </div>
              </Card>
              
              <Card className="p-6">
                <div className="flex items-center gap-3">
                  <XCircle className="w-5 h-5 text-red-600" />
                  <div>
                    <p className="font-medium">Tests Failed</p>
                    <p className="text-2xl font-bold text-red-600">{testResults.summary.failed}</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Test Categories */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <Card className="p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Core Functionality
                </h3>
                <div className="space-y-2">
                  {testResults.tests.filter(t => 
                    ['Blink SDK Connection', 'UI Components', 'Photo Analysis Function'].includes(t.name)
                  ).map((test, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm">{test.name}</span>
                      {getStatusIcon(test.passed)}
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Security & Admin
                </h3>
                <div className="space-y-2">
                  {testResults.tests.filter(t => 
                    ['Security Validation', 'File Upload Validation', 'Admin Functions'].includes(t.name)
                  ).map((test, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm">{test.name}</span>
                      {getStatusIcon(test.passed)}
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="details">
            <div className="space-y-4">
              {testResults.tests.map((test, index) => (
                <Card key={index} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(test.passed)}
                      <div>
                        <p className="font-medium">{test.name}</p>
                        {test.error && (
                          <p className="text-sm text-red-600 mt-1 bg-red-50 p-2 rounded border border-red-200">
                            <strong>Error:</strong> {test.error}
                          </p>
                        )}
                        {test.details && (
                          <details className="text-sm text-muted-foreground mt-1">
                            <summary className="cursor-pointer hover:text-foreground">View Details</summary>
                            <pre className="mt-2 p-2 bg-gray-50 rounded text-xs overflow-auto">
                              {JSON.stringify(test.details, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    </div>
                    {getStatusBadge(test.passed)}
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="performance">
            <div className="space-y-4">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Performance Metrics
                </h3>
                <div className="space-y-4">
                  {Object.entries(performanceMonitor.getAllMetrics()).map(([label, metrics]) => (
                    <div key={label} className="border rounded-lg p-4">
                      <h4 className="font-medium mb-2">{label}</h4>
                      {metrics ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Count</p>
                            <p className="font-medium">{metrics.count}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Average</p>
                            <p className="font-medium">{metrics.average.toFixed(2)}ms</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Min</p>
                            <p className="font-medium">{metrics.min.toFixed(2)}ms</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Max</p>
                            <p className="font-medium">{metrics.max.toFixed(2)}ms</p>
                          </div>
                        </div>
                      ) : (
                        <p className="text-muted-foreground">No data available</p>
                      )}
                    </div>
                  ))}
                  {Object.keys(performanceMonitor.getAllMetrics()).length === 0 && (
                    <p className="text-muted-foreground text-center py-8">
                      No performance data collected yet. Use the app to generate metrics.
                    </p>
                  )}
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="security">
            <div className="space-y-4">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Security Assessment
                </h3>
                <div className="space-y-4">
                  {testResults.tests.filter(t => 
                    ['Security Validation', 'File Upload Validation', 'Admin Functions'].includes(t.name)
                  ).map((test, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{test.name}</h4>
                        {getStatusBadge(test.passed)}
                      </div>
                      {test.error && (
                        <p className="text-sm text-red-600 bg-red-50 p-2 rounded border border-red-200">
                          {test.error}
                        </p>
                      )}
                      {test.details && (
                        <div className="text-sm text-muted-foreground mt-2">
                          <strong>Details:</strong>
                          <pre className="mt-1 p-2 bg-gray-50 rounded text-xs overflow-auto">
                            {JSON.stringify(test.details, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      )}

      {/* Quick Actions */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button variant="outline" className="justify-start" onClick={() => window.location.reload()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Reload Application
          </Button>
          <Button variant="outline" className="justify-start" onClick={() => localStorage.clear()}>
            <AlertCircle className="w-4 h-4 mr-2" />
            Clear Local Storage
          </Button>
          <Button variant="outline" className="justify-start" onClick={() => console.clear()}>
            <Bug className="w-4 h-4 mr-2" />
            Clear Console
          </Button>
          <Button variant="outline" className="justify-start" onClick={() => performanceMonitor.clear()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Clear Performance Data
          </Button>
        </div>
      </Card>

      {/* System Information */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">System Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="font-medium">User Agent:</p>
            <p className="text-muted-foreground break-all">{navigator.userAgent}</p>
          </div>
          <div>
            <p className="font-medium">Viewport:</p>
            <p className="text-muted-foreground">{window.innerWidth} × {window.innerHeight}</p>
          </div>
          <div>
            <p className="font-medium">URL:</p>
            <p className="text-muted-foreground break-all">{window.location.href}</p>
          </div>
          <div>
            <p className="font-medium">Timestamp:</p>
            <p className="text-muted-foreground">{new Date().toISOString()}</p>
          </div>
        </div>
      </Card>
    </div>
  )
}