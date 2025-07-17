import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { Button } from './ui/button'
import { Card } from './ui/card'
import { Badge } from './ui/badge'
import { Check, Crown, Sparkles, Zap, Star } from 'lucide-react'
import blink from '../blink/client'

interface PricingModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  analysisId?: string
}

export function PricingModal({ isOpen, onClose, onSuccess, analysisId }: PricingModalProps) {
  const [isProcessing, setIsProcessing] = useState(false)

  const handleUpgrade = async () => {
    setIsProcessing(true)
    
    try {
      // Create Stripe checkout session
      const response = await blink.data.fetch({
        url: 'https://api.stripe.com/v1/checkout/sessions',
        method: 'POST',
        headers: {
          'Authorization': 'Bearer {{stripe_secret_key}}',
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          'payment_method_types[]': 'card',
          'line_items[0][price_data][currency]': 'usd',
          'line_items[0][price_data][product_data][name]': 'Premium Color Analysis',
          'line_items[0][price_data][product_data][description]': 'Complete color palette with styling recommendations',
          'line_items[0][price_data][unit_amount]': '999', // $9.99
          'line_items[0][quantity]': '1',
          'mode': 'payment',
          'success_url': `${window.location.origin}?success=true&analysis_id=${analysisId}`,
          'cancel_url': `${window.location.origin}?canceled=true`,
          'metadata[analysis_id]': analysisId || '',
          'metadata[user_id]': (await blink.auth.me()).id
        }).toString()
      })

      if (response.status === 200) {
        const session = response.body
        // Redirect to Stripe Checkout
        window.location.href = session.url
      } else {
        throw new Error('Failed to create checkout session')
      }
    } catch (error) {
      console.error('Payment error:', error)
      alert('Payment failed. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Unlock Your Complete Color Profile
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-8">
          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Free Plan */}
            <Card className="p-6 border-2 border-muted">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto">
                  <Sparkles className="w-8 h-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Free Preview</h3>
                  <p className="text-3xl font-bold mt-2">$0</p>
                </div>
                <div className="space-y-3 text-left">
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-600" />
                    <span className="text-sm">Basic skin tone analysis</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-600" />
                    <span className="text-sm">3 recommended colors</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-600" />
                    <span className="text-sm">Color season identification</span>
                  </div>
                </div>
                <Button variant="outline" disabled className="w-full">
                  Current Plan
                </Button>
              </div>
            </Card>

            {/* Premium Plan */}
            <Card className="p-6 border-2 border-primary bg-gradient-to-br from-primary/5 to-accent/5 relative overflow-hidden">
              <Badge className="absolute top-4 right-4 bg-gradient-to-r from-primary to-accent text-white">
                Most Popular
              </Badge>
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                  <Crown className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Premium Analysis</h3>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <span className="text-3xl font-bold text-primary">$9.99</span>
                    <span className="text-sm text-muted-foreground line-through">$19.99</span>
                  </div>
                  <p className="text-sm text-accent font-medium">50% Launch Discount</p>
                </div>
                <div className="space-y-3 text-left">
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium">Everything in Free +</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-600" />
                    <span className="text-sm">Complete 20+ color palette</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-600" />
                    <span className="text-sm">Detailed seasonal analysis</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-600" />
                    <span className="text-sm">Personalized styling tips</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-600" />
                    <span className="text-sm">Makeup recommendations</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-600" />
                    <span className="text-sm">Downloadable PDF report</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-600" />
                    <span className="text-sm">Wardrobe color guide</span>
                  </div>
                </div>
                <Button 
                  onClick={handleUpgrade} 
                  disabled={isProcessing}
                  className="w-full gradient-bg text-white hover:shadow-xl transition-all duration-300"
                >
                  {isProcessing ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </div>
                  ) : (
                    <>
                      <Crown className="w-5 h-5 mr-2" />
                      Upgrade Now
                    </>
                  )}
                </Button>
              </div>
            </Card>
          </div>

          {/* Features Comparison */}
          <div className="bg-white/50 rounded-2xl p-6 border">
            <h4 className="text-lg font-bold mb-6 text-center">What You'll Get with Premium</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center mx-auto">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <h5 className="font-semibold">Instant Results</h5>
                <p className="text-sm text-muted-foreground">
                  Get your complete analysis immediately after payment
                </p>
              </div>
              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-gradient-to-br from-accent to-accent/80 rounded-xl flex items-center justify-center mx-auto">
                  <Star className="w-6 h-6 text-white" />
                </div>
                <h5 className="font-semibold">Expert Quality</h5>
                <p className="text-sm text-muted-foreground">
                  Professional-grade analysis used by stylists worldwide
                </p>
              </div>
              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center mx-auto">
                  <Crown className="w-6 h-6 text-white" />
                </div>
                <h5 className="font-semibold">Lifetime Access</h5>
                <p className="text-sm text-muted-foreground">
                  Keep your results forever and download anytime
                </p>
              </div>
            </div>
          </div>

          {/* Testimonials */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-4 bg-gradient-to-br from-primary/5 to-primary/10">
              <div className="flex items-center gap-2 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-sm italic mb-2">
                "This changed how I shop for clothes! The color recommendations are spot-on."
              </p>
              <p className="text-xs text-muted-foreground">- Sarah M.</p>
            </Card>
            <Card className="p-4 bg-gradient-to-br from-accent/5 to-accent/10">
              <div className="flex items-center gap-2 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-sm italic mb-2">
                "Finally found my perfect makeup colors. Worth every penny!"
              </p>
              <p className="text-xs text-muted-foreground">- Emma K.</p>
            </Card>
          </div>

          {/* Money Back Guarantee */}
          <div className="text-center p-4 bg-green-50 rounded-xl border border-green-200">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <Check className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-green-800">30-Day Money Back Guarantee</span>
            </div>
            <p className="text-sm text-green-700">
              Not satisfied? Get a full refund within 30 days, no questions asked.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}