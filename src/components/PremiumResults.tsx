import { useState } from 'react'
import { Card } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Separator } from './ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { 
  Crown, 
  Download, 
  Share2, 
  Copy, 
  Check, 
  Palette, 
  Sparkles,
  Heart,
  Star,
  Shirt,
  Paintbrush
} from 'lucide-react'

interface ColorResult {
  name: string
  hex: string
  description: string
  category?: 'neutral' | 'accent' | 'statement' | 'soft'
}

interface PremiumResultsProps {
  results: {
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
  onDownloadPDF: () => void
}

export function PremiumResults({ results, onDownloadPDF }: PremiumResultsProps) {
  const [copiedColor, setCopiedColor] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('palette')

  const copyToClipboard = (hex: string) => {
    navigator.clipboard.writeText(hex)
    setCopiedColor(hex)
    setTimeout(() => setCopiedColor(null), 2000)
  }

  const shareResults = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Color Analysis Results',
          text: `Check out my ${results.season} color palette!`,
          url: window.location.href
        })
      } catch (error) {
        console.log('Share failed:', error)
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert('Link copied to clipboard!')
    }
  }

  const ColorSwatch = ({ color, size = 'large' }: { color: ColorResult; size?: 'small' | 'large' }) => {
    const sizeClasses = size === 'large' ? 'w-20 h-20' : 'w-16 h-16'
    
    return (
      <div className="group relative">
        <div
          className={`${sizeClasses} rounded-2xl shadow-lg cursor-pointer transition-all duration-300 hover:scale-110 hover:shadow-xl relative overflow-hidden`}
          style={{ backgroundColor: color.hex }}
          onClick={() => copyToClipboard(color.hex)}
        >
          {color.category && (
            <div className="absolute top-1 right-1">
              {color.category === 'statement' && <Star className="w-3 h-3 text-white drop-shadow-lg" />}
              {color.category === 'accent' && <Sparkles className="w-3 h-3 text-white drop-shadow-lg" />}
              {color.category === 'soft' && <Heart className="w-3 h-3 text-white drop-shadow-lg" />}
            </div>
          )}
        </div>
        <div className="mt-3 text-center">
          <p className="text-sm font-semibold text-gray-900">{color.name}</p>
          <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
            {color.hex}
            <button
              onClick={() => copyToClipboard(color.hex)}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 rounded"
            >
              {copiedColor === color.hex ? (
                <Check className="w-3 h-3 text-green-600" />
              ) : (
                <Copy className="w-3 h-3 hover:text-primary" />
              )}
            </button>
          </p>
          <p className="text-xs text-muted-foreground mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {color.description}
          </p>
        </div>
      </div>
    )
  }

  const categorizeColors = (colors: ColorResult[]) => {
    return {
      neutrals: colors.filter(c => c.category === 'neutral'),
      accents: colors.filter(c => c.category === 'accent'),
      statements: colors.filter(c => c.category === 'statement'),
      softs: colors.filter(c => c.category === 'soft'),
      others: colors.filter(c => !c.category)
    }
  }

  const categorizedColors = categorizeColors(results.premiumColors)

  return (
    <div className="space-y-8">
      {/* Header */}
      <Card className="p-8 bg-gradient-to-br from-primary/10 via-accent/5 to-primary/5 border-0 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center shadow-lg">
              <Crown className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Premium Color Analysis
              </h2>
              <p className="text-muted-foreground text-lg">
                Your complete {results.season} color palette
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={shareResults}>
              <Share2 className="w-5 h-5 mr-2" />
              Share
            </Button>
            <Button onClick={onDownloadPDF} className="gradient-bg text-white">
              <Download className="w-5 h-5 mr-2" />
              Download PDF
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/70 rounded-xl p-4 backdrop-blur-sm">
            <p className="text-sm text-muted-foreground mb-1">Skin Tone</p>
            <p className="text-lg font-semibold text-primary">{results.skinTone}</p>
          </div>
          <div className="bg-white/70 rounded-xl p-4 backdrop-blur-sm">
            <p className="text-sm text-muted-foreground mb-1">Color Season</p>
            <p className="text-lg font-semibold text-accent">{results.season}</p>
          </div>
          <div className="bg-white/70 rounded-xl p-4 backdrop-blur-sm">
            <p className="text-sm text-muted-foreground mb-1">Total Colors</p>
            <p className="text-lg font-semibold text-primary">
              {results.freeColors.length + results.premiumColors.length}
            </p>
          </div>
        </div>
      </Card>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="palette">Color Palette</TabsTrigger>
          <TabsTrigger value="styling">Styling Tips</TabsTrigger>
          <TabsTrigger value="makeup">Makeup Guide</TabsTrigger>
          <TabsTrigger value="wardrobe">Wardrobe</TabsTrigger>
        </TabsList>

        <TabsContent value="palette" className="space-y-8">
          {/* Your Best Colors (Free) */}
          <Card className="p-8">
            <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-primary" />
              Your Best Colors
            </h3>
            <div className="grid grid-cols-3 gap-6 justify-items-center">
              {results.freeColors.map((color, index) => (
                <ColorSwatch key={index} color={color} />
              ))}
            </div>
          </Card>

          <Separator />

          {/* Complete Premium Palette */}
          <Card className="p-8">
            <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Crown className="w-6 h-6 text-accent" />
              Complete Color Palette
            </h3>
            
            {/* Neutrals */}
            {categorizedColors.neutrals.length > 0 && (
              <div className="mb-8">
                <h4 className="text-lg font-medium mb-4 text-muted-foreground">Neutral Colors</h4>
                <div className="grid grid-cols-4 gap-4">
                  {categorizedColors.neutrals.map((color, index) => (
                    <ColorSwatch key={index} color={color} size="small" />
                  ))}
                </div>
              </div>
            )}

            {/* Accent Colors */}
            {categorizedColors.accents.length > 0 && (
              <div className="mb-8">
                <h4 className="text-lg font-medium mb-4 text-muted-foreground">Accent Colors</h4>
                <div className="grid grid-cols-4 gap-4">
                  {categorizedColors.accents.map((color, index) => (
                    <ColorSwatch key={index} color={color} size="small" />
                  ))}
                </div>
              </div>
            )}

            {/* Statement Colors */}
            {categorizedColors.statements.length > 0 && (
              <div className="mb-8">
                <h4 className="text-lg font-medium mb-4 text-muted-foreground">Statement Colors</h4>
                <div className="grid grid-cols-4 gap-4">
                  {categorizedColors.statements.map((color, index) => (
                    <ColorSwatch key={index} color={color} size="small" />
                  ))}
                </div>
              </div>
            )}

            {/* All Premium Colors if not categorized */}
            {categorizedColors.others.length > 0 && (
              <div className="grid grid-cols-5 gap-4">
                {categorizedColors.others.map((color, index) => (
                  <ColorSwatch key={index} color={color} size="small" />
                ))}
              </div>
            )}
          </Card>

          {/* Seasonal Details */}
          {results.seasonalDetails && (
            <Card className="p-8 bg-gradient-to-br from-accent/5 to-accent/10">
              <h3 className="text-xl font-semibold mb-4">About Your {results.season} Season</h3>
              <p className="text-muted-foreground mb-6">{results.seasonalDetails.description}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3 text-green-700">Your Characteristics</h4>
                  <ul className="space-y-2">
                    {results.seasonalDetails.characteristics.map((char, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-600" />
                        {char}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3 text-red-700">Colors to Avoid</h4>
                  <ul className="space-y-2">
                    {results.seasonalDetails.avoidColors.map((color, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm">
                        <span className="w-4 h-4 rounded-full bg-red-100 flex items-center justify-center">
                          <span className="w-2 h-2 rounded-full bg-red-500"></span>
                        </span>
                        {color}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="styling" className="space-y-6">
          <Card className="p-8">
            <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-primary" />
              Personalized Styling Recommendations
            </h3>
            <div className="grid grid-cols-1 gap-4">
              {results.recommendations.map((rec, index) => (
                <Card key={index} className="p-4 bg-gradient-to-r from-primary/5 to-accent/5 border-l-4 border-l-primary">
                  <p className="text-sm leading-relaxed">{rec}</p>
                </Card>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="makeup" className="space-y-6">
          <Card className="p-8">
            <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Paintbrush className="w-6 h-6 text-accent" />
              Makeup Color Guide
            </h3>
            {results.makeupTips ? (
              <div className="grid grid-cols-1 gap-4">
                {results.makeupTips.map((tip, index) => (
                  <Card key={index} className="p-4 bg-gradient-to-r from-accent/5 to-primary/5 border-l-4 border-l-accent">
                    <p className="text-sm leading-relaxed">{tip}</p>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Paintbrush className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Makeup recommendations are being generated based on your color analysis...
                </p>
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="wardrobe" className="space-y-6">
          <Card className="p-8">
            <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Shirt className="w-6 h-6 text-primary" />
              Wardrobe Building Guide
            </h3>
            {results.wardrobeGuide ? (
              <div className="grid grid-cols-1 gap-4">
                {results.wardrobeGuide.map((guide, index) => (
                  <Card key={index} className="p-4 bg-gradient-to-r from-primary/5 to-accent/5 border-l-4 border-l-primary">
                    <p className="text-sm leading-relaxed">{guide}</p>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Shirt className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Wardrobe recommendations are being generated based on your color analysis...
                </p>
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>

      {/* Success Message */}
      <Card className="p-6 bg-gradient-to-r from-green-50 to-green-100 border-green-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
            <Check className="w-6 h-6 text-white" />
          </div>
          <div>
            <h4 className="font-semibold text-green-800">Analysis Complete!</h4>
            <p className="text-sm text-green-700">
              Your premium color analysis is ready. Download your PDF to keep these results forever.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}