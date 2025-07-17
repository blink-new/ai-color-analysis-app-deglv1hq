import { useState } from 'react'
import { CheckCircle, Circle, Clock, Zap, Users, Shield, BarChart3, Palette, Star } from 'lucide-react'
import { Card } from './ui/card'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Progress } from './ui/progress'

interface Feature {
  id: string
  title: string
  description: string
  status: 'completed' | 'in-progress' | 'planned'
  priority: 'high' | 'medium' | 'low'
  category: 'core' | 'admin' | 'user-experience' | 'analytics' | 'security'
  estimatedHours?: number
  completedAt?: string
}

const features: Feature[] = [
  // Completed Features
  {
    id: 'f001',
    title: 'Admin-Only Photo Analysis',
    description: 'Restrict photo analysis feature to admin users only for controlled access',
    status: 'completed',
    priority: 'high',
    category: 'admin',
    completedAt: '2024-01-17'
  },
  {
    id: 'f002',
    title: 'Comprehensive Error Handling',
    description: 'Advanced error logging, monitoring, and user-friendly error messages',
    status: 'completed',
    priority: 'high',
    category: 'core',
    completedAt: '2024-01-17'
  },
  {
    id: 'f003',
    title: 'System Testing Suite',
    description: 'Comprehensive testing framework for all app components and functionality',
    status: 'completed',
    priority: 'high',
    category: 'admin',
    completedAt: '2024-01-17'
  },
  {
    id: 'f004',
    title: 'Admin Dashboard',
    description: 'Real-time analytics, user management, and system monitoring dashboard',
    status: 'completed',
    priority: 'high',
    category: 'admin',
    completedAt: '2024-01-17'
  },
  {
    id: 'f005',
    title: 'Enhanced Security Validation',
    description: 'File upload validation, XSS prevention, and security headers',
    status: 'completed',
    priority: 'high',
    category: 'security',
    completedAt: '2024-01-17'
  },

  // In Progress Features
  {
    id: 'f006',
    title: 'Database Integration',
    description: 'Store analysis results, user data, and system metrics in database',
    status: 'in-progress',
    priority: 'high',
    category: 'core',
    estimatedHours: 8
  },
  {
    id: 'f007',
    title: 'Performance Optimization',
    description: 'Optimize image processing, reduce load times, and improve responsiveness',
    status: 'in-progress',
    priority: 'medium',
    category: 'core',
    estimatedHours: 12
  },

  // Planned Features
  {
    id: 'f008',
    title: 'User Analytics Dashboard',
    description: 'Personal dashboard for users to view their analysis history and trends',
    status: 'planned',
    priority: 'medium',
    category: 'user-experience',
    estimatedHours: 16
  },
  {
    id: 'f009',
    title: 'Advanced Color Matching',
    description: 'AI-powered color matching with clothing brands and makeup products',
    status: 'planned',
    priority: 'high',
    category: 'core',
    estimatedHours: 24
  },
  {
    id: 'f010',
    title: 'Social Sharing',
    description: 'Share color analysis results on social media with beautiful graphics',
    status: 'planned',
    priority: 'low',
    category: 'user-experience',
    estimatedHours: 8
  },
  {
    id: 'f011',
    title: 'Mobile App',
    description: 'Native mobile application for iOS and Android',
    status: 'planned',
    priority: 'medium',
    category: 'user-experience',
    estimatedHours: 80
  },
  {
    id: 'f012',
    title: 'API for Third Parties',
    description: 'RESTful API for integration with fashion and beauty brands',
    status: 'planned',
    priority: 'low',
    category: 'core',
    estimatedHours: 32
  },
  {
    id: 'f013',
    title: 'Advanced Analytics',
    description: 'Detailed analytics with conversion tracking and user behavior insights',
    status: 'planned',
    priority: 'medium',
    category: 'analytics',
    estimatedHours: 20
  },
  {
    id: 'f014',
    title: 'Multi-language Support',
    description: 'Internationalization with support for multiple languages',
    status: 'planned',
    priority: 'low',
    category: 'user-experience',
    estimatedHours: 16
  },
  {
    id: 'f015',
    title: 'AI Model Improvements',
    description: 'Enhanced AI models for more accurate color analysis and recommendations',
    status: 'planned',
    priority: 'high',
    category: 'core',
    estimatedHours: 40
  }
]

export function FeatureRoadmap() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const getStatusIcon = (status: Feature['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'in-progress':
        return <Clock className="w-5 h-5 text-blue-600" />
      case 'planned':
        return <Circle className="w-5 h-5 text-gray-400" />
    }
  }

  const getStatusBadge = (status: Feature['status']) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>
      case 'in-progress':
        return <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>
      case 'planned':
        return <Badge variant="outline">Planned</Badge>
    }
  }

  const getPriorityBadge = (priority: Feature['priority']) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive">High Priority</Badge>
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800">Medium Priority</Badge>
      case 'low':
        return <Badge variant="outline">Low Priority</Badge>
    }
  }

  const getCategoryIcon = (category: Feature['category']) => {
    switch (category) {
      case 'core':
        return <Zap className="w-4 h-4" />
      case 'admin':
        return <Shield className="w-4 h-4" />
      case 'user-experience':
        return <Users className="w-4 h-4" />
      case 'analytics':
        return <BarChart3 className="w-4 h-4" />
      case 'security':
        return <Shield className="w-4 h-4" />
      default:
        return <Palette className="w-4 h-4" />
    }
  }

  const filteredFeatures = selectedCategory === 'all' 
    ? features 
    : features.filter(f => f.category === selectedCategory)

  const completedFeatures = features.filter(f => f.status === 'completed')
  const inProgressFeatures = features.filter(f => f.status === 'in-progress')
  const plannedFeatures = features.filter(f => f.status === 'planned')

  const completionPercentage = (completedFeatures.length / features.length) * 100

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Star className="w-6 h-6 text-primary" />
            Feature Roadmap
          </h2>
          <p className="text-muted-foreground">Track development progress and upcoming features</p>
        </div>
      </div>

      {/* Progress Overview */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Overall Progress</h3>
          <Badge variant="outline">{completionPercentage.toFixed(1)}% Complete</Badge>
        </div>
        <Progress value={completionPercentage} className="w-full mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-green-600">{completedFeatures.length}</p>
            <p className="text-sm text-muted-foreground">Completed</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-600">{inProgressFeatures.length}</p>
            <p className="text-sm text-muted-foreground">In Progress</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-600">{plannedFeatures.length}</p>
            <p className="text-sm text-muted-foreground">Planned</p>
          </div>
        </div>
      </Card>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="all" onClick={() => setSelectedCategory('all')}>All</TabsTrigger>
          <TabsTrigger value="core" onClick={() => setSelectedCategory('core')}>Core</TabsTrigger>
          <TabsTrigger value="admin" onClick={() => setSelectedCategory('admin')}>Admin</TabsTrigger>
          <TabsTrigger value="user-experience" onClick={() => setSelectedCategory('user-experience')}>UX</TabsTrigger>
          <TabsTrigger value="analytics" onClick={() => setSelectedCategory('analytics')}>Analytics</TabsTrigger>
          <TabsTrigger value="security" onClick={() => setSelectedCategory('security')}>Security</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="space-y-4">
            {filteredFeatures.map((feature) => (
              <Card key={feature.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    {getStatusIcon(feature.status)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getCategoryIcon(feature.category)}
                        <h3 className="font-semibold">{feature.title}</h3>
                      </div>
                      <p className="text-muted-foreground mb-3">{feature.description}</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        {getStatusBadge(feature.status)}
                        {getPriorityBadge(feature.priority)}
                        {feature.estimatedHours && (
                          <Badge variant="outline">{feature.estimatedHours}h estimated</Badge>
                        )}
                        {feature.completedAt && (
                          <Badge variant="outline">Completed {feature.completedAt}</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Category-specific content would be similar */}
        <TabsContent value="core">
          <div className="space-y-4">
            {features.filter(f => f.category === 'core').map((feature) => (
              <Card key={feature.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    {getStatusIcon(feature.status)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getCategoryIcon(feature.category)}
                        <h3 className="font-semibold">{feature.title}</h3>
                      </div>
                      <p className="text-muted-foreground mb-3">{feature.description}</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        {getStatusBadge(feature.status)}
                        {getPriorityBadge(feature.priority)}
                        {feature.estimatedHours && (
                          <Badge variant="outline">{feature.estimatedHours}h estimated</Badge>
                        )}
                        {feature.completedAt && (
                          <Badge variant="outline">Completed {feature.completedAt}</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Next Steps */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Immediate Next Steps</h3>
        <div className="space-y-3">
          {inProgressFeatures.concat(plannedFeatures.filter(f => f.priority === 'high')).slice(0, 3).map((feature) => (
            <div key={feature.id} className="flex items-center gap-3 p-3 border rounded-lg">
              {getStatusIcon(feature.status)}
              <div className="flex-1">
                <p className="font-medium">{feature.title}</p>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
              {getPriorityBadge(feature.priority)}
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}