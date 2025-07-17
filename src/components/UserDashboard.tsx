import { useState, useEffect } from 'react'
import { Card } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Separator } from './ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { 
  History, 
  Download, 
  Palette, 
  Crown, 
  Calendar,
  Eye,
  Share2,
  Trash2,
  Plus
} from 'lucide-react'
import blink from '../blink/client'

interface ColorResult {
  name: string
  hex: string
  description: string
}

interface AnalysisHistory {
  id: string
  imageUrl: string
  skinTone: string
  season: string
  freeColors: ColorResult[]
  premiumColors?: ColorResult[]
  recommendations?: string[]
  isPremiumUnlocked: boolean
  createdAt: string
}

interface UserDashboardProps {
  onNewAnalysis: () => void
}

export function UserDashboard({ onNewAnalysis }: UserDashboardProps) {
  const [user, setUser] = useState<any>(null)
  const [analysisHistory, setAnalysisHistory] = useState<AnalysisHistory[]>([])
  const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisHistory | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userData = await blink.auth.me()
        setUser(userData)
        
        // Mock analysis history for now (replace with actual database queries later)
        const mockHistory: AnalysisHistory[] = [
          {
            id: '1',
            imageUrl: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400',
            skinTone: 'Warm Medium',
            season: 'Autumn',
            freeColors: [
              { name: 'Burnt Orange', hex: '#CC5500', description: 'Perfect for casual wear' },
              { name: 'Forest Green', hex: '#228B22', description: 'Great for professional looks' },
              { name: 'Golden Yellow', hex: '#FFD700', description: 'Excellent accent color' }
            ],
            premiumColors: [
              { name: 'Rust Red', hex: '#B7410E', description: 'Bold statement color' },
              { name: 'Olive Green', hex: '#808000', description: 'Sophisticated neutral' },
              // ... more colors
            ],
            recommendations: [
              'Wear earth tones to complement your warm undertones',
              'Avoid cool blues and purples',
              'Gold jewelry works better than silver'
            ],
            isPremiumUnlocked: true,
            createdAt: '2024-01-15T10:30:00Z'
          },
          {
            id: '2',
            imageUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
            skinTone: 'Cool Light',
            season: 'Summer',
            freeColors: [
              { name: 'Soft Pink', hex: '#FFB6C1', description: 'Flattering everyday color' },
              { name: 'Lavender', hex: '#E6E6FA', description: 'Perfect for formal events' },
              { name: 'Sky Blue', hex: '#87CEEB', description: 'Great for casual wear' }
            ],
            isPremiumUnlocked: false,
            createdAt: '2024-01-10T14:20:00Z'
          }
        ]
        
        setAnalysisHistory(mockHistory)
        if (mockHistory.length > 0) {
          setSelectedAnalysis(mockHistory[0])
        }
      } catch (error) {
        console.error('Failed to load user data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadUserData()
  }, [])

  const downloadPDF = async (analysis: AnalysisHistory) => {
    // Mock PDF generation - replace with actual PDF generation
    alert('PDF download feature coming soon!')
  }

  const shareAnalysis = async (analysis: AnalysisHistory) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Color Analysis Results',
          text: `Check out my ${analysis.season} color palette!`,
          url: window.location.href
        })
      } catch (error) {
        console.log('Share failed:', error)
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(window.location.href)
      alert('Link copied to clipboard!')
    }
  }

  const deleteAnalysis = async (analysisId: string) => {
    if (confirm('Are you sure you want to delete this analysis?')) {
      setAnalysisHistory(prev => prev.filter(a => a.id !== analysisId))
      if (selectedAnalysis?.id === analysisId) {
        setSelectedAnalysis(analysisHistory[0] || null)
      }
    }
  }

  const ColorSwatch = ({ color }: { color: ColorResult }) => (
    <div className="group relative">
      <div
        className="w-16 h-16 rounded-xl shadow-md cursor-pointer transition-all duration-300 hover:scale-110 hover:shadow-lg"
        style={{ backgroundColor: color.hex }}
        title={`${color.name} - ${color.hex}`}
      />
      <div className="mt-2 text-center">
        <p className="text-xs font-medium text-gray-900">{color.name}</p>
        <p className="text-xs text-muted-foreground">{color.hex}</p>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Your Color Journey</h2>
          <p className="text-muted-foreground mt-1">
            Manage your color analyses and discover your perfect palette
          </p>
        </div>
        <Button onClick={onNewAnalysis} className="gradient-bg text-white">
          <Plus className="w-5 h-5 mr-2" />
          New Analysis
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
              <History className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{analysisHistory.length}</p>
              <p className="text-sm text-muted-foreground">Total Analyses</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6 bg-gradient-to-br from-accent/5 to-accent/10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-accent/20 rounded-xl flex items-center justify-center">
              <Crown className="w-6 h-6 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {analysisHistory.filter(a => a.isPremiumUnlocked).length}
              </p>
              <p className="text-sm text-muted-foreground">Premium Unlocked</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-200 rounded-xl flex items-center justify-center">
              <Palette className="w-6 h-6 text-green-700" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {analysisHistory.reduce((acc, a) => acc + (a.freeColors?.length || 0) + (a.premiumColors?.length || 0), 0)}
              </p>
              <p className="text-sm text-muted-foreground">Colors Discovered</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Analysis History Sidebar */}
        <div className="lg:col-span-1">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <History className="w-5 h-5" />
              Analysis History
            </h3>
            <div className="space-y-3">
              {analysisHistory.map((analysis) => (
                <div
                  key={analysis.id}
                  className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                    selectedAnalysis?.id === analysis.id
                      ? 'border-primary bg-primary/5'
                      : 'border-muted hover:border-primary/50 hover:bg-muted/50'
                  }`}
                  onClick={() => setSelectedAnalysis(analysis)}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={analysis.imageUrl}
                      alt="Analysis"
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={analysis.isPremiumUnlocked ? "default" : "secondary"}>
                          {analysis.isPremiumUnlocked ? 'Premium' : 'Free'}
                        </Badge>
                      </div>
                      <p className="text-sm font-medium">{analysis.season} Season</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(analysis.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              
              {analysisHistory.length === 0 && (
                <div className="text-center py-8">
                  <Palette className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No analyses yet</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={onNewAnalysis}
                    className="mt-3"
                  >
                    Create Your First Analysis
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Analysis Details */}
        <div className="lg:col-span-2">
          {selectedAnalysis ? (
            <Card className="p-8">
              <div className="space-y-8">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <img
                      src={selectedAnalysis.imageUrl}
                      alt="Analysis"
                      className="w-20 h-20 rounded-xl object-cover shadow-md"
                    />
                    <div>
                      <h3 className="text-2xl font-bold">{selectedAnalysis.season} Season</h3>
                      <p className="text-muted-foreground">{selectedAnalysis.skinTone} skin tone</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant={selectedAnalysis.isPremiumUnlocked ? "default" : "secondary"}>
                          {selectedAnalysis.isPremiumUnlocked ? 'Premium' : 'Free'}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {new Date(selectedAnalysis.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => shareAnalysis(selectedAnalysis)}>
                      <Share2 className="w-4 h-4" />
                    </Button>
                    {selectedAnalysis.isPremiumUnlocked && (
                      <Button variant="outline" size="sm" onClick={() => downloadPDF(selectedAnalysis)}>
                        <Download className="w-4 h-4" />
                      </Button>
                    )}
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => deleteAnalysis(selectedAnalysis.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <Separator />

                {/* Color Palette */}
                <Tabs defaultValue="colors" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="colors">Color Palette</TabsTrigger>
                    <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="colors" className="space-y-6">
                    {/* Free Colors */}
                    <div>
                      <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Eye className="w-5 h-5 text-primary" />
                        Your Best Colors
                      </h4>
                      <div className="grid grid-cols-3 gap-6">
                        {selectedAnalysis.freeColors.map((color, index) => (
                          <ColorSwatch key={index} color={color} />
                        ))}
                      </div>
                    </div>

                    {/* Premium Colors */}
                    {selectedAnalysis.isPremiumUnlocked && selectedAnalysis.premiumColors && (
                      <>
                        <Separator />
                        <div>
                          <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Crown className="w-5 h-5 text-accent" />
                            Complete Color Palette
                          </h4>
                          <div className="grid grid-cols-4 gap-4">
                            {selectedAnalysis.premiumColors.map((color, index) => (
                              <ColorSwatch key={index} color={color} />
                            ))}
                          </div>
                        </div>
                      </>
                    )}

                    {/* Upgrade CTA for non-premium */}
                    {!selectedAnalysis.isPremiumUnlocked && (
                      <Card className="p-6 border-2 border-dashed border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5">
                        <div className="text-center space-y-4">
                          <Crown className="w-12 h-12 text-accent mx-auto" />
                          <div>
                            <h4 className="text-lg font-semibold">Unlock Complete Palette</h4>
                            <p className="text-muted-foreground">
                              Get 20+ additional colors and styling recommendations
                            </p>
                          </div>
                          <Button className="gradient-bg text-white">
                            Upgrade for $9.99
                          </Button>
                        </div>
                      </Card>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="recommendations" className="space-y-6">
                    {selectedAnalysis.isPremiumUnlocked && selectedAnalysis.recommendations ? (
                      <div className="space-y-4">
                        <h4 className="text-lg font-semibold">Personalized Styling Tips</h4>
                        <div className="grid grid-cols-1 gap-4">
                          {selectedAnalysis.recommendations.map((rec, index) => (
                            <Card key={index} className="p-4 bg-gradient-to-r from-primary/5 to-accent/5">
                              <p className="text-sm">{rec}</p>
                            </Card>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <Card className="p-8 text-center border-2 border-dashed border-primary/30">
                        <Crown className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                        <h4 className="text-lg font-semibold mb-2">Premium Feature</h4>
                        <p className="text-muted-foreground mb-4">
                          Unlock personalized styling recommendations and makeup tips
                        </p>
                        <Button className="gradient-bg text-white">
                          Upgrade to Premium
                        </Button>
                      </Card>
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            </Card>
          ) : (
            <Card className="p-8 text-center">
              <Palette className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Analysis Selected</h3>
              <p className="text-muted-foreground">
                Select an analysis from the history to view details
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}