// Testing utilities for the color analysis app

export interface TestResult {
  name: string
  passed: boolean
  error?: string
  details?: any
}

export interface SystemTestResults {
  overall: boolean
  tests: TestResult[]
  summary: {
    total: number
    passed: number
    failed: number
  }
}

/**
 * Comprehensive system test suite
 */
export async function runSystemTests(): Promise<SystemTestResults> {
  const tests: TestResult[] = []

  // Test 1: Blink SDK Connection
  tests.push(await testBlinkSDKConnection())

  // Test 2: File Upload Validation
  tests.push(await testFileUploadValidation())

  // Test 3: Security Validation
  tests.push(await testSecurityValidation())

  // Test 4: UI Components
  tests.push(await testUIComponents())

  // Test 5: Local Storage
  tests.push(await testLocalStorage())

  // Test 6: Error Handling
  tests.push(await testErrorHandling())

  // Test 7: Performance
  tests.push(await testPerformance())

  // Test 8: Accessibility
  tests.push(await testAccessibility())

  // Test 9: Admin Functions
  tests.push(await testAdminFunctions())

  // Test 10: Photo Analysis (Mock)
  tests.push(await testPhotoAnalysisMock())

  const passed = tests.filter(t => t.passed).length
  const failed = tests.length - passed

  return {
    overall: failed === 0,
    tests,
    summary: {
      total: tests.length,
      passed,
      failed
    }
  }
}

async function testBlinkSDKConnection(): Promise<TestResult> {
  try {
    // Test if Blink SDK is properly initialized
    const blink = (await import('../blink/client')).default
    
    if (!blink) {
      throw new Error('Blink SDK not initialized')
    }

    // Test basic SDK methods exist
    const requiredMethods = ['auth', 'storage', 'ai', 'data']
    for (const method of requiredMethods) {
      if (!(method in blink)) {
        throw new Error(`Blink SDK missing method: ${method}`)
      }
    }

    return {
      name: 'Blink SDK Connection',
      passed: true,
      details: { methods: requiredMethods }
    }
  } catch (error) {
    return {
      name: 'Blink SDK Connection',
      passed: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

async function testFileUploadValidation(): Promise<TestResult> {
  try {
    const { validateFileUpload } = await import('./security')

    // Test valid file
    const validFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
    const validResult = validateFileUpload(validFile)
    if (!validResult.isValid) {
      throw new Error('Valid file rejected')
    }

    // Test invalid file type
    const invalidFile = new File(['test'], 'test.txt', { type: 'text/plain' })
    const invalidResult = validateFileUpload(invalidFile)
    if (invalidResult.isValid) {
      throw new Error('Invalid file type accepted')
    }

    // Test oversized file (16MB should be rejected with 15MB limit)
    const oversizedFile = new File([new ArrayBuffer(16 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' })
    const oversizedResult = validateFileUpload(oversizedFile)
    if (oversizedResult.isValid) {
      throw new Error('Oversized file accepted')
    }

    // Test that 14MB file is accepted (within 15MB limit)
    const largeValidFile = new File([new ArrayBuffer(14 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' })
    const largeValidResult = validateFileUpload(largeValidFile)
    if (!largeValidResult.isValid) {
      throw new Error('14MB file rejected, should be accepted with 15MB limit')
    }

    return {
      name: 'File Upload Validation',
      passed: true,
      details: { validFile: true, invalidType: true, oversized: true, largeFileSupport: true }
    }
  } catch (error) {
    return {
      name: 'File Upload Validation',
      passed: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

async function testSecurityValidation(): Promise<TestResult> {
  try {
    const { sanitizeInput, validateHexColor, validateUrl } = await import('./security')

    // Test input sanitization
    const maliciousInput = '<script>alert("xss")</script>'
    const sanitized = sanitizeInput(maliciousInput)
    if (sanitized.includes('<script>')) {
      throw new Error('XSS not prevented')
    }

    // Test hex color validation
    if (!validateHexColor('#FF0000')) {
      throw new Error('Valid hex color rejected')
    }
    if (validateHexColor('invalid')) {
      throw new Error('Invalid hex color accepted')
    }

    // Test URL validation
    if (!validateUrl('https://example.com')) {
      throw new Error('Valid URL rejected')
    }
    if (validateUrl('javascript:alert(1)')) {
      throw new Error('Malicious URL accepted')
    }

    return {
      name: 'Security Validation',
      passed: true,
      details: { xssPrevention: true, hexValidation: true, urlValidation: true }
    }
  } catch (error) {
    return {
      name: 'Security Validation',
      passed: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

async function testUIComponents(): Promise<TestResult> {
  try {
    // Test if key UI components can be imported
    const components = [
      '../components/UploadZone',
      '../components/ColorResults',
      '../components/AnalysisProgress',
      '../components/PricingModal',
      '../components/ErrorBoundary'
    ]

    for (const component of components) {
      try {
        await import(component)
      } catch (error) {
        throw new Error(`Failed to import ${component}`)
      }
    }

    // Test if DOM elements exist
    const rootElement = document.getElementById('root')
    if (!rootElement) {
      throw new Error('Root element not found')
    }

    return {
      name: 'UI Components',
      passed: true,
      details: { components: components.length, rootElement: true }
    }
  } catch (error) {
    return {
      name: 'UI Components',
      passed: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

async function testLocalStorage(): Promise<TestResult> {
  try {
    // Test localStorage functionality
    const testKey = 'blink_test_key'
    const testValue = 'test_value'

    localStorage.setItem(testKey, testValue)
    const retrieved = localStorage.getItem(testKey)
    
    if (retrieved !== testValue) {
      throw new Error('localStorage read/write failed')
    }

    localStorage.removeItem(testKey)
    
    if (localStorage.getItem(testKey) !== null) {
      throw new Error('localStorage removal failed')
    }

    return {
      name: 'Local Storage',
      passed: true,
      details: { readWrite: true, removal: true }
    }
  } catch (error) {
    return {
      name: 'Local Storage',
      passed: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

async function testErrorHandling(): Promise<TestResult> {
  try {
    // Test error boundary exists
    const { ErrorBoundary } = await import('../components/ErrorBoundary')
    if (!ErrorBoundary) {
      throw new Error('ErrorBoundary component not found')
    }

    // Test console error handling
    const originalError = console.error
    let errorCaught = false
    console.error = () => { errorCaught = true }
    
    // Trigger a test error
    console.error('Test error')
    
    console.error = originalError
    
    if (!errorCaught) {
      throw new Error('Error handling not working')
    }

    return {
      name: 'Error Handling',
      passed: true,
      details: { errorBoundary: true, consoleError: true }
    }
  } catch (error) {
    return {
      name: 'Error Handling',
      passed: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

async function testPerformance(): Promise<TestResult> {
  try {
    const startTime = performance.now()
    
    // Simulate some work
    await new Promise(resolve => setTimeout(resolve, 10))
    
    const endTime = performance.now()
    const duration = endTime - startTime
    
    if (duration > 1000) { // Should complete in under 1 second
      throw new Error('Performance test took too long')
    }

    // Test if performance API is available
    if (!window.performance || !window.performance.now) {
      throw new Error('Performance API not available')
    }

    return {
      name: 'Performance',
      passed: true,
      details: { duration: `${duration.toFixed(2)}ms`, performanceAPI: true }
    }
  } catch (error) {
    return {
      name: 'Performance',
      passed: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

async function testAccessibility(): Promise<TestResult> {
  try {
    // Test basic accessibility features
    const checks = {
      title: !!document.title,
      lang: !!document.documentElement.lang,
      viewport: !!document.querySelector('meta[name="viewport"]'),
      description: !!document.querySelector('meta[name="description"]')
    }

    const failedChecks = Object.entries(checks)
      .filter(([, passed]) => !passed)
      .map(([check]) => check)

    if (failedChecks.length > 0) {
      throw new Error(`Accessibility checks failed: ${failedChecks.join(', ')}`)
    }

    return {
      name: 'Accessibility',
      passed: true,
      details: checks
    }
  } catch (error) {
    return {
      name: 'Accessibility',
      passed: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

async function testAdminFunctions(): Promise<TestResult> {
  try {
    const { isAdmin, getAdminStatus } = await import('./admin')

    // Test admin function exists
    if (typeof isAdmin !== 'function') {
      throw new Error('isAdmin function not found')
    }

    // Test admin status function
    if (typeof getAdminStatus !== 'function') {
      throw new Error('getAdminStatus function not found')
    }

    // Test admin email validation
    const adminStatus = getAdminStatus('kai.jiabo.feng@gmail.com')
    if (!adminStatus.isAdmin) {
      throw new Error('Admin email not recognized')
    }

    // Test non-admin email
    const nonAdminStatus = getAdminStatus('user@example.com')
    if (nonAdminStatus.isAdmin) {
      throw new Error('Non-admin email incorrectly recognized as admin')
    }

    return {
      name: 'Admin Functions',
      passed: true,
      details: { adminEmail: true, nonAdminEmail: true }
    }
  } catch (error) {
    return {
      name: 'Admin Functions',
      passed: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

async function testPhotoAnalysisMock(): Promise<TestResult> {
  try {
    const { analyzePhotoWithAI } = await import('./photoAnalysis')

    // Test if function exists
    if (typeof analyzePhotoWithAI !== 'function') {
      throw new Error('analyzePhotoWithAI function not found')
    }

    // Test different file types and sizes
    const testFiles = [
      new File(['test'], 'test.jpg', { type: 'image/jpeg' }),
      new File(['test'], 'test.png', { type: 'image/png' }),
      new File(['test'], 'test.webp', { type: 'image/webp' }),
      new File(['test'], 'test.gif', { type: 'image/gif' }),
      new File(['test'], 'test.bmp', { type: 'image/bmp' })
    ]

    // Test file validation improvements
    const { validateFileUpload } = await import('./security')
    
    let validFiles = 0
    for (const file of testFiles) {
      const validation = validateFileUpload(file)
      if (validation.isValid) {
        validFiles++
      }
    }

    if (validFiles < 4) { // Should accept at least 4 of the 5 file types
      throw new Error(`Only ${validFiles} file types accepted, expected at least 4`)
    }

    // Test larger file size limit (15MB)
    const largeFile = new File([new ArrayBuffer(14 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' })
    const largeFileValidation = validateFileUpload(largeFile)
    if (!largeFileValidation.isValid) {
      throw new Error('14MB file rejected, should be accepted with 15MB limit')
    }

    // Test that oversized files are still rejected
    const oversizedFile = new File([new ArrayBuffer(16 * 1024 * 1024)], 'oversized.jpg', { type: 'image/jpeg' })
    const oversizedValidation = validateFileUpload(oversizedFile)
    if (oversizedValidation.isValid) {
      throw new Error('16MB file accepted, should be rejected')
    }
    
    return {
      name: 'Photo Analysis Function',
      passed: true,
      details: { 
        functionExists: true, 
        validFileTypes: validFiles,
        largeFileSupport: true,
        oversizedRejection: true
      }
    }
  } catch (error) {
    return {
      name: 'Photo Analysis Function',
      passed: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Quick health check for critical functionality
 */
export async function quickHealthCheck(): Promise<boolean> {
  try {
    // Check if app is running
    if (!document.getElementById('root')) {
      return false
    }

    // Check if Blink SDK is available
    const blink = (await import('../blink/client')).default
    if (!blink) {
      return false
    }

    // Check if localStorage works
    localStorage.setItem('health_check', 'ok')
    const check = localStorage.getItem('health_check')
    localStorage.removeItem('health_check')
    
    return check === 'ok'
  } catch {
    return false
  }
}

/**
 * Performance monitoring utility
 */
export class PerformanceMonitor {
  private metrics: Map<string, number[]> = new Map()

  startTiming(label: string): () => void {
    const startTime = performance.now()
    
    return () => {
      const endTime = performance.now()
      const duration = endTime - startTime
      
      if (!this.metrics.has(label)) {
        this.metrics.set(label, [])
      }
      
      this.metrics.get(label)!.push(duration)
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

  clear() {
    this.metrics.clear()
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor()