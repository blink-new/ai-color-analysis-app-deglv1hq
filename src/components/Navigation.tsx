import { useState } from 'react'
import { Button } from './ui/button'
import { Card } from './ui/card'
import { 
  Palette, 
  Menu, 
  X, 
  Home, 
  Sparkles, 
  Crown, 
  HelpCircle, 
  Mail,
  ExternalLink
} from 'lucide-react'

interface NavigationProps {
  currentPage?: 'home' | 'analysis' | 'dashboard' | 'pricing'
  onNavigate?: (page: string) => void
}

export function Navigation({ currentPage = 'home', onNavigate }: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navigationItems = [
    { id: 'home', label: 'Home', icon: Home, href: '/' },
    { id: 'analysis', label: 'Color Analysis', icon: Sparkles, href: '/analysis' },
    { id: 'pricing', label: 'Pricing', icon: Crown, href: '/pricing' },
    { id: 'help', label: 'Help', icon: HelpCircle, href: '/help' },
    { id: 'contact', label: 'Contact', icon: Mail, href: '/contact' }
  ]

  const handleNavigation = (item: typeof navigationItems[0]) => {
    if (onNavigate) {
      onNavigate(item.id)
    } else {
      // For SPA navigation, you might want to use React Router here
      window.location.hash = item.href
    }
    setIsMobileMenuOpen(false)
  }

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center space-x-8">
        {navigationItems.map((item) => {
          const Icon = item.icon
          const isActive = currentPage === item.id
          
          return (
            <button
              key={item.id}
              onClick={() => handleNavigation(item)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </button>
          )
        })}
      </nav>

      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="sm"
        className="md:hidden"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? (
          <X className="w-5 h-5" />
        ) : (
          <Menu className="w-5 h-5" />
        )}
      </Button>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 z-50 md:hidden">
          <Card className="m-4 p-4 shadow-lg border bg-white/95 backdrop-blur-sm">
            <div className="space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon
                const isActive = currentPage === item.id
                
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavigation(item)}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </button>
                )
              })}
              
              {/* Additional mobile-only items */}
              <div className="border-t pt-2 mt-2">
                <a
                  href="https://blink.new"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50"
                >
                  <ExternalLink className="w-4 h-4" />
                  Powered by Blink
                </a>
              </div>
            </div>
          </Card>
        </div>
      )}
    </>
  )
}

// Breadcrumb component for better navigation context
export function Breadcrumb({ items }: { items: Array<{ label: string; href?: string }> }) {
  return (
    <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
      {items.map((item, index) => (
        <div key={index} className="flex items-center">
          {index > 0 && <span className="mx-2">/</span>}
          {item.href ? (
            <a
              href={item.href}
              className="hover:text-foreground transition-colors"
            >
              {item.label}
            </a>
          ) : (
            <span className={index === items.length - 1 ? 'text-foreground font-medium' : ''}>
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  )
}

// Footer component for better site structure
export function Footer() {
  const currentYear = new Date().getFullYear()
  
  return (
    <footer className="border-t bg-white/50 backdrop-blur-sm mt-16">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <Palette className="w-5 h-5 text-primary" />
              </div>
              <span className="font-bold text-lg">AI Color Analysis</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Discover your perfect colors with AI-powered personal color analysis.
            </p>
          </div>

          {/* Product */}
          <div className="space-y-4">
            <h3 className="font-semibold">Product</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#analysis" className="hover:text-foreground transition-colors">Color Analysis</a></li>
              <li><a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a></li>
              <li><a href="#features" className="hover:text-foreground transition-colors">Features</a></li>
              <li><a href="#api" className="hover:text-foreground transition-colors">API</a></li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h3 className="font-semibold">Support</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#help" className="hover:text-foreground transition-colors">Help Center</a></li>
              <li><a href="#contact" className="hover:text-foreground transition-colors">Contact Us</a></li>
              <li><a href="#faq" className="hover:text-foreground transition-colors">FAQ</a></li>
              <li><a href="#status" className="hover:text-foreground transition-colors">Status</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h3 className="font-semibold">Legal</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#privacy" className="hover:text-foreground transition-colors">Privacy Policy</a></li>
              <li><a href="#terms" className="hover:text-foreground transition-colors">Terms of Service</a></li>
              <li><a href="#cookies" className="hover:text-foreground transition-colors">Cookie Policy</a></li>
              <li><a href="#security" className="hover:text-foreground transition-colors">Security</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground">
            © {currentYear} AI Color Analysis. All rights reserved.
          </p>
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <a
              href="https://blink.new"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              Built with <span className="font-semibold">Blink</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}