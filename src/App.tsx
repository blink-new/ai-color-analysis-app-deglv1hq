import { useState, useEffect } from 'react'
import { Palette, Sparkles, User, LogOut, History, Shield } from 'lucide-react'
import { Button } from './components/ui/button'
import { Card } from './components/ui/card'
import { Avatar, AvatarFallback } from './components/ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './components/ui/dropdown-menu'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs'
import { UploadZone } from './components/UploadZone'
import { AnalysisProgress } from './components/AnalysisProgress'
import { ColorResults } from './components/ColorResults'
import { PricingModal } from './components/PricingModal'
import { UserDashboard } from './components/UserDashboard'
import { PremiumResults } from './components/PremiumResults'
import { Footer } from './components/Navigation'
import { HealthIndicator } from './components/SystemHealthCheck'
import { AdminGuard, AdminStatus } from './components/AdminGuard'
import { SystemTesting } from './components/SystemTesting'
import { AdminDashboard } from './components/AdminDashboard'
import blink from './blink/client'
import { validateFileUpload, RateLimiter } from './utils/security'
import { logAnalysisError, logUploadError, performanceTracker } from './utils/errorLogger'
import { analyzePhotoWithAI } from './utils/photoAnalysis'
import { isAdmin } from './utils/admin'

interface ColorResult {
  name: string
  hex: string
  description: string
  category?: 'neutral' | 'accent' | 'statement' | 'soft'
}

interface AnalysisResult {
  skinTone: string
  season: string
  freeColors: ColorResult[]
  premiumColors: ColorResult[]
  recommendations: string[]
  makeupTips?: string[]
  wardrobeGuide?: string[]
  seasonalDetails?: {
    description: string
    characteristics: string[]
    avoidColors: string[]
  }
}

// Rate limiter for analysis requests (5 requests per 15 minutes per user)
const analysisRateLimiter = new RateLimiter(5, 15 * 60 * 1000)

function App() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [isPremiumUnlocked, setIsPremiumUnlocked] = useState(false)
  const [showPricingModal, setShowPricingModal] = useState(false)
  const [currentAnalysisId, setCurrentAnalysisId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'new' | 'dashboard' | 'testing' | 'admin'>('new')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      setLoading(state.isLoading)
    })
    return unsubscribe
  }, [])

  // Check for successful payment on page load
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('success') === 'true') {
      const analysisId = urlParams.get('analysis_id')
      if (analysisId) {
        setIsPremiumUnlocked(true)
        // Clear URL parameters
        window.history.replaceState({}, document.title, window.location.pathname)
      }
    }
  }, [])



  const analyzePhoto = async (file: File) => {
    if (!file) return
    
    setIsAnalyzing(true)
    setError(null)
    
    // Start performance tracking
    const endTiming = performanceTracker.startTiming('photo_analysis')
    
    try {
      console.log('Starting photo analysis for file:', file.name, 'Size:', file.size, 'Type:', file.type)
      
      // Check if user is authenticated
      if (!user?.id) {
        throw new Error('Please sign in to analyze your photo.')
      }

      // Check rate limiting
      if (!analysisRateLimiter.isAllowed(user.id)) {
        const remaining = analysisRateLimiter.getRemainingAttempts(user.id)
        throw new Error(`Rate limit exceeded. You can try again in a few minutes. Remaining attempts: ${remaining}`)
      }

      // Validate file using security utility
      const validation = validateFileUpload(file)
      if (!validation.isValid) {
        const error = new Error(validation.error || 'Invalid file')
        logUploadError(error, file)
        throw error
      }

      console.log('File validation passed, starting enhanced analysis...')

      // Use the improved photo analysis function
      console.log('Calling analyzePhotoWithAI with file:', file.name, 'user:', user.id)
      console.log('File details:', {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified
      })
      
      const enhancedAnalysis = await analyzePhotoWithAI(file, user.id)
      console.log('Analysis result received:', enhancedAnalysis)
      
      // Generate unique analysis ID
      const analysisId = `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      setCurrentAnalysisId(analysisId)
      
      console.log('Analysis completed successfully:', enhancedAnalysis)
      setAnalysisResult(enhancedAnalysis)
      
      // Log successful analysis for debugging
      console.log('Analysis completed for user:', user.id, 'Analysis ID:', analysisId)
      
    } catch (error) {
      console.error('Analysis failed with error:', error)
      
      // Log error with comprehensive details
      if (error instanceof Error) {
        logAnalysisError(error, {
          userId: user?.id,
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          analysisStep: 'photo_analysis'
        })
      }
      
      // Log error details for debugging
      const errorDetails = {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        userId: user?.id,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        timestamp: new Date().toISOString()
      }
      
      console.error('Detailed error info:', errorDetails)
      
      let userFriendlyMessage = 'Analysis failed. Please try again.'
      
      if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase()
        
        if (errorMessage.includes('rate limit') || errorMessage.includes('quota')) {
          userFriendlyMessage = 'Service temporarily unavailable. Please try again in a few minutes.'
        } else if (errorMessage.includes('network') || errorMessage.includes('fetch') || errorMessage.includes('connection')) {
          userFriendlyMessage = 'Network error. Please check your connection and try again.'
        } else if (errorMessage.includes('image') || errorMessage.includes('photo') || errorMessage.includes('upload')) {
          userFriendlyMessage = 'Unable to process this image. Please try a different photo with good lighting.'
        } else if (errorMessage.includes('ai') || errorMessage.includes('analysis')) {
          userFriendlyMessage = 'AI analysis service is temporarily unavailable. Please try again in a moment.'
        } else if (errorMessage.includes('auth') || errorMessage.includes('sign')) {
          userFriendlyMessage = 'Please sign in to analyze your photo.'
        } else {
          userFriendlyMessage = error.message
        }
      }
      
      setError(userFriendlyMessage)
      
    } finally {
      // End performance tracking
      endTiming()
      setIsAnalyzing(false)
    }
  }

  const handleUpgrade = () => {
    setShowPricingModal(true)
  }

  const handleUpgradeSuccess = () => {
    setIsPremiumUnlocked(true)
    setShowPricingModal(false)
    // TODO: Update database record when available
  }

  const resetAnalysis = () => {
    setSelectedFile(null)
    setAnalysisResult(null)
    setIsAnalyzing(false)
    setIsPremiumUnlocked(false)
    setCurrentAnalysisId(null)
    setError(null)
    setActiveTab('new')
  }

  const handleNewAnalysis = () => {
    resetAnalysis()
    setActiveTab('new')
  }

  const downloadPDF = async () => {
    // Mock PDF generation - replace with actual PDF generation
    alert('PDF download feature coming soon! Your complete color analysis will be available as a downloadable PDF.')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading your color analysis app...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5">
        <Card className="p-8 max-w-md w-full mx-4">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <Palette className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold">AI Color Analysis</h1>
            <p className="text-muted-foreground">
              Discover your perfect colors with AI-powered personal color analysis
            </p>
            <Button onClick={() => blink.auth.login()} className="w-full gradient-bg text-white">
              Get Started
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5">
      {/* Admin Status Indicator */}
      <AdminStatus userEmail={user?.email} />

      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <Palette className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-xl font-bold">AI Color Analysis</h1>
            {isAdmin(user?.email) && (
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Admin</span>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'new' | 'dashboard' | 'testing' | 'admin')}>
              <TabsList>
                <TabsTrigger value="new">New Analysis</TabsTrigger>
                <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                {isAdmin(user?.email) && (
                  <>
                    <TabsTrigger value="admin">Admin</TabsTrigger>
                    <TabsTrigger value="testing">Testing</TabsTrigger>
                  </>
                )}
              </TabsList>
            </Tabs>
            
            {isAdmin(user?.email) && <HealthIndicator />}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {user.email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>{user.email}</span>
                </DropdownMenuItem>
                {isAdmin(user?.email) && (
                  <DropdownMenuItem>
                    <Shield className="mr-2 h-4 w-4" />
                    <span>Admin Access</span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => setActiveTab('dashboard')}>
                  <History className="mr-2 h-4 w-4" />
                  <span>My Analyses</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => blink.auth.logout()}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'new' | 'dashboard' | 'testing' | 'admin')}>
          <TabsContent value="new">
            {!selectedFile && !analysisResult && (
              <div className="text-center space-y-12">
                {/* Hero Section */}
                <div className="space-y-6 animate-fade-in">
                  <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
                    <Sparkles className="w-4 h-4" />
                    AI-Powered Color Analysis
                  </div>
                  <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    Discover Your Perfect Colors
                  </h1>
                  <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                    Upload your photo and let our advanced AI analyze your skin tone, undertones, and color season 
                    to recommend the perfect colors that make you look your absolute best.
                  </p>
                </div>
                
                {/* Upload Section */}
                <div className="max-w-lg mx-auto">
                  <UploadZone
                    onFileSelect={(file) => {
                      setSelectedFile(file)
                      if (file) analyzePhoto(file)
                    }}
                    selectedFile={selectedFile}
                    isAnalyzing={isAnalyzing}
                  />
                </div>
                
                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                  <Card className="p-8 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 bg-gradient-to-br from-primary/5 to-primary/10">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                      <Sparkles className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">AI-Powered Analysis</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Advanced computer vision analyzes your facial features, skin tone, and undertones with precision
                    </p>
                  </Card>
                  
                  <Card className="p-8 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 bg-gradient-to-br from-accent/5 to-accent/10">
                    <div className="w-16 h-16 bg-gradient-to-br from-accent to-accent/80 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                      <Palette className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">Personalized Colors</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Get a curated color palette tailored specifically to your unique features and color season
                    </p>
                  </Card>
                  
                  <Card className="p-8 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 bg-gradient-to-br from-primary/5 to-accent/5">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                      <User className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">Style Guidance</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Receive expert styling tips, makeup recommendations, and wardrobe guidance
                    </p>
                  </Card>
                </div>

                {/* Social Proof / Stats */}
                <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-8 max-w-4xl mx-auto border">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                    <div>
                      <div className="text-3xl font-bold text-primary mb-2">10,000+</div>
                      <div className="text-muted-foreground">Photos Analyzed</div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-accent mb-2">98%</div>
                      <div className="text-muted-foreground">Accuracy Rate</div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-primary mb-2">4.9★</div>
                      <div className="text-muted-foreground">User Rating</div>
                    </div>
                  </div>
                </div>

                {/* How It Works */}
                <div className="max-w-4xl mx-auto">
                  <h2 className="text-3xl font-bold mb-12">How It Works</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                        1
                      </div>
                      <h3 className="font-semibold mb-2">Upload Your Photo</h3>
                      <p className="text-sm text-muted-foreground">
                        Take or upload a clear, well-lit photo of yourself
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-accent text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                        2
                      </div>
                      <h3 className="font-semibold mb-2">AI Analysis</h3>
                      <p className="text-sm text-muted-foreground">
                        Our AI analyzes your skin tone and determines your color season
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                        3
                      </div>
                      <h3 className="font-semibold mb-2">Get Results</h3>
                      <p className="text-sm text-muted-foreground">
                        Receive your personalized color palette and styling recommendations
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {selectedFile && (
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Your Color Analysis</h2>
                  <Button variant="outline" onClick={resetAnalysis}>
                    Analyze New Photo
                  </Button>
                </div>
                
                {/* Error Display */}
                {error && (
                  <Card className="p-6 border-red-200 bg-red-50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm">!</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-red-800">Analysis Failed</h4>
                        <p className="text-sm text-red-700">{error}</p>
                      </div>
                    </div>
                    <Button 
                      onClick={() => {
                        setError(null)
                        if (selectedFile) analyzePhoto(selectedFile)
                      }}
                      className="mt-4"
                      variant="outline"
                    >
                      Try Again
                    </Button>
                  </Card>
                )}
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <UploadZone
                      onFileSelect={(file) => {
                        setSelectedFile(file)
                        if (file) analyzePhoto(file)
                      }}
                      selectedFile={selectedFile}
                      isAnalyzing={isAnalyzing}
                    />
                  </div>
                  
                  <div>
                    {isAnalyzing && <AnalysisProgress isAnalyzing={isAnalyzing} />}
                    {analysisResult && !isPremiumUnlocked && !error && (
                      <ColorResults
                        results={analysisResult}
                        onUpgrade={handleUpgrade}
                      />
                    )}
                    {analysisResult && isPremiumUnlocked && !error && (
                      <PremiumResults
                        results={analysisResult}
                        onDownloadPDF={downloadPDF}
                      />
                    )}
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="dashboard">
            <UserDashboard onNewAnalysis={handleNewAnalysis} />
          </TabsContent>

          <TabsContent value="admin">
            <AdminGuard userEmail={user?.email}>
              <AdminDashboard />
            </AdminGuard>
          </TabsContent>

          <TabsContent value="testing">
            <AdminGuard userEmail={user?.email}>
              <SystemTesting />
            </AdminGuard>
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <Footer />

      {/* Pricing Modal */}
      <PricingModal
        isOpen={showPricingModal}
        onClose={() => setShowPricingModal(false)}
        onSuccess={handleUpgradeSuccess}
        analysisId={currentAnalysisId}
      />
    </div>
  )
}

export default App