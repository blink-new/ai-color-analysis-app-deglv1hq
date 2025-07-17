import { useState } from 'react'
import { Card } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Separator } from './ui/separator'
import { Lock, Palette, Sparkles, Crown, Copy, Check } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'

interface ColorResult {
  name: string
  hex: string
  description: string
}

interface ColorResultsProps {
  results: {
    skinTone: string
    season: string
    freeColors: ColorResult[]
    premiumColors: ColorResult[]
    recommendations: string[]
  }
  onUpgrade: () => void
}

export function ColorResults({ results, onUpgrade }: ColorResultsProps) {
  const [copiedColor, setCopiedColor] = useState<string | null>(null)

  const copyToClipboard = (hex: string) => {
    navigator.clipboard.writeText(hex)
    setCopiedColor(hex)
    setTimeout(() => setCopiedColor(null), 2000)
  }

  const ColorSwatch = ({ color, isPremium = false }: { color: ColorResult; isPremium?: boolean }) => (
    <div className={`group relative transition-all duration-300 ${isPremium ? 'opacity-60' : 'hover:-translate-y-1'}`}>
      <div
        className={`w-20 h-20 rounded-2xl shadow-lg cursor-pointer transition-all duration-300 ${
          isPremium ? '' : 'hover:scale-110 hover:shadow-xl'
        }`}
        style={{ backgroundColor: color.hex }}
        onClick={() => !isPremium && copyToClipboard(color.hex)}
      />
      {isPremium && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-2xl">
          <Lock className="w-8 h-8 text-white drop-shadow-lg" />
        </div>
      )}
      <div className="mt-3 text-center">
        <p className="text-sm font-semibold text-gray-900">{color.name}</p>
        <p className="text-xs text-muted-foreground flex items-center justify-center gap-1 mt-1">
          {color.hex}
          {!isPremium && (
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
          )}
        </p>
        {!isPremium && (
          <p className="text-xs text-muted-foreground mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {color.description}
          </p>
        )}
      </div>
    </div>
  )

  return (
    <div className="space-y-8">
      {/* Free Results */}
      <Card className="p-8 bg-gradient-to-br from-white to-primary/5 border-0 shadow-lg">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center">
            <Palette className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold">Your Color Analysis</h3>
            <Badge variant="secondary" className="mt-1">Free Preview</Badge>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white/50 rounded-xl p-4 border">
            <p className="text-sm text-muted-foreground mb-1">Skin Tone</p>
            <p className="text-lg font-semibold text-primary">{results.skinTone}</p>
          </div>
          <div className="bg-white/50 rounded-xl p-4 border">
            <p className="text-sm text-muted-foreground mb-1">Color Season</p>
            <p className="text-lg font-semibold text-accent">{results.season}</p>
          </div>
        </div>
        
        <div>
          <h4 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Your Best Colors
          </h4>
          <div className="grid grid-cols-3 gap-6 justify-items-center">
            {results.freeColors.map((color, index) => (
              <ColorSwatch key={index} color={color} />
            ))}
          </div>
        </div>
      </Card>

      {/* Premium Upgrade */}
      <Card className="p-8 border-2 border-dashed border-primary/30 bg-gradient-to-br from-primary/5 via-accent/5 to-primary/10 shadow-lg">
        <div className="text-center space-y-6">
          <div className="flex items-center justify-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-accent to-accent/80 rounded-2xl flex items-center justify-center shadow-lg">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Unlock Your Complete Color Profile
            </h3>
          </div>
          
          <p className="text-muted-foreground max-w-lg mx-auto text-lg leading-relaxed">
            Get your full seasonal color analysis with 20+ personalized colors, styling tips, and makeup recommendations.
          </p>
          
          {/* Premium Preview */}
          <div className="bg-white/70 rounded-2xl p-6 backdrop-blur-sm border shadow-inner">
            <h4 className="text-lg font-semibold mb-4 flex items-center justify-center gap-2">
              <Lock className="w-5 h-5 text-muted-foreground" />
              Premium Color Palette Preview
            </h4>
            <div className="grid grid-cols-4 gap-4 justify-items-center">
              {results.premiumColors.slice(0, 8).map((color, index) => (
                <ColorSwatch key={index} color={color} isPremium />
              ))}
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              + {Math.max(0, results.premiumColors.length - 8)} more colors in your complete palette
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="lg" className="border-primary/30 hover:bg-primary/5">
                  <Sparkles className="w-5 h-5 mr-2" />
                  See What's Included
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold text-center">Premium Color Analysis Includes</DialogTitle>
                </DialogHeader>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/5">
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center mt-0.5">
                        <div className="w-2 h-2 bg-white rounded-full" />
                      </div>
                      <div>
                        <p className="font-semibold">Complete Color Palette</p>
                        <p className="text-sm text-muted-foreground">20+ personalized colors with hex codes</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-accent/5">
                      <div className="w-6 h-6 bg-accent rounded-full flex items-center justify-center mt-0.5">
                        <div className="w-2 h-2 bg-white rounded-full" />
                      </div>
                      <div>
                        <p className="font-semibold">Seasonal Analysis</p>
                        <p className="text-sm text-muted-foreground">Detailed breakdown of your color season</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/5">
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center mt-0.5">
                        <div className="w-2 h-2 bg-white rounded-full" />
                      </div>
                      <div>
                        <p className="font-semibold">Styling Recommendations</p>
                        <p className="text-sm text-muted-foreground">Clothing and accessory suggestions</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-accent/5">
                      <div className="w-6 h-6 bg-accent rounded-full flex items-center justify-center mt-0.5">
                        <div className="w-2 h-2 bg-white rounded-full" />
                      </div>
                      <div>
                        <p className="font-semibold">Makeup Guide</p>
                        <p className="text-sm text-muted-foreground">Personalized makeup color recommendations</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/5">
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center mt-0.5">
                        <div className="w-2 h-2 bg-white rounded-full" />
                      </div>
                      <div>
                        <p className="font-semibold">Downloadable PDF</p>
                        <p className="text-sm text-muted-foreground">Take your colors anywhere</p>
                      </div>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            
            <Button onClick={onUpgrade} size="lg" className="gradient-bg text-white hover:shadow-xl transition-all duration-300 px-8">
              <Crown className="w-5 h-5 mr-2" />
              Upgrade for $9.99
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}