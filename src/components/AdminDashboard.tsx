import { useState, useEffect } from 'react'
import { Users, BarChart3, Settings, Database, Shield, Activity, TrendingUp, Eye, Star } from 'lucide-react'
import { Card } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Progress } from './ui/progress'
import { FeatureRoadmap } from './FeatureRoadmap'
import blink from '../blink/client'

interface AnalyticsData {
  totalAnalyses: number
  totalUsers: number
  successRate: number
  avgProcessingTime: number
  recentActivity: Array<{
    id: string
    type: string
    timestamp: string
    userId: string
    status: 'success' | 'error'
  }>
}

export function AdminDashboard() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [systemHealth, setSystemHealth] = useState<'healthy' | 'warning' | 'error'>('healthy')

  useEffect(() => {
    loadAnalyticsData()
  }, [])

  const loadAnalyticsData = async () => {
    setLoading(true)
    try {
      // In a real app, this would fetch from your analytics database
      // For now, we'll simulate the data
      const mockData: AnalyticsData = {
        totalAnalyses: 1247,
        totalUsers: 892,
        successRate: 94.2,
        avgProcessingTime: 3.4,
        recentActivity: [
          {
            id: '1',
            type: 'photo_analysis',
            timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
            userId: 'user_123',
            status: 'success'
          },
          {
            id: '2',
            type: 'photo_analysis',
            timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
            userId: 'user_456',
            status: 'error'
          },
          {
            id: '3',
            type: 'payment',
            timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
            userId: 'user_789',
            status: 'success'
          }
        ]
      }
      
      setAnalyticsData(mockData)
      
      // Determine system health based on success rate
      if (mockData.successRate >= 95) {
        setSystemHealth('healthy')
      } else if (mockData.successRate >= 85) {
        setSystemHealth('warning')
      } else {
        setSystemHealth('error')
      }
      
    } catch (error) {
      console.error('Failed to load analytics data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy': return 'text-green-600'
      case 'warning': return 'text-yellow-600'
      case 'error': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getHealthBadge = (health: string) => {
    switch (health) {
      case 'healthy': return <Badge className="bg-green-100 text-green-800">Healthy</Badge>
      case 'warning': return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Warning</Badge>
      case 'error': return <Badge variant="destructive">Error</Badge>
      default: return <Badge variant="secondary">Unknown</Badge>
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            Admin Dashboard
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            Admin Dashboard
          </h2>
          <p className="text-muted-foreground">Monitor system performance and user activity</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">System Status:</span>
          {getHealthBadge(systemHealth)}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Analyses</p>
              <p className="text-2xl font-bold">{analyticsData?.totalAnalyses.toLocaleString()}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Users</p>
              <p className="text-2xl font-bold">{analyticsData?.totalUsers.toLocaleString()}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Success Rate</p>
              <p className={`text-2xl font-bold ${getHealthColor(systemHealth)}`}>
                {analyticsData?.successRate}%
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Activity className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg Processing</p>
              <p className="text-2xl font-bold">{analyticsData?.avgProcessingTime}s</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Success Rate Progress */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">System Performance</h3>
          <Badge variant="outline">{analyticsData?.successRate}% Success Rate</Badge>
        </div>
        <Progress value={analyticsData?.successRate} className="w-full" />
        <p className="text-sm text-muted-foreground mt-2">
          {analyticsData?.successRate && analyticsData.successRate >= 95 
            ? 'Excellent performance - system running smoothly'
            : analyticsData?.successRate && analyticsData.successRate >= 85
            ? 'Good performance - minor issues detected'
            : 'Performance issues detected - investigation recommended'
          }
        </p>
      </Card>

      <Tabs defaultValue="activity" className="space-y-4">
        <TabsList>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="roadmap">Roadmap</TabsTrigger>
          <TabsTrigger value="settings">System Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="activity">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Recent Activity
            </h3>
            <div className="space-y-4">
              {analyticsData?.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      activity.status === 'success' ? 'bg-green-500' : 'bg-red-500'
                    }`} />
                    <div>
                      <p className="font-medium capitalize">{activity.type.replace('_', ' ')}</p>
                      <p className="text-sm text-muted-foreground">
                        User: {activity.userId} • {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <Badge variant={activity.status === 'success' ? 'default' : 'destructive'} className={
                    activity.status === 'success' ? 'bg-green-100 text-green-800' : ''
                  }>
                    {activity.status}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Users className="w-5 h-5" />
              User Management
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Total Registered Users</p>
                  <p className="text-sm text-muted-foreground">Active users in the system</p>
                </div>
                <Badge variant="outline">{analyticsData?.totalUsers}</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Admin Users</p>
                  <p className="text-sm text-muted-foreground">Users with admin privileges</p>
                </div>
                <Badge variant="outline">1</Badge>
              </div>

              <div className="pt-4 border-t">
                <Button variant="outline" className="w-full">
                  <Eye className="w-4 h-4 mr-2" />
                  View All Users
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="roadmap">
          <FeatureRoadmap />
        </TabsContent>

        <TabsContent value="settings">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5" />
              System Settings
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Photo Analysis</p>
                  <p className="text-sm text-muted-foreground">AI-powered color analysis feature</p>
                </div>
                <Badge className="bg-green-100 text-green-800">Enabled</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Admin-Only Mode</p>
                  <p className="text-sm text-muted-foreground">Restrict analysis to admin users only</p>
                </div>
                <Badge className="bg-green-100 text-green-800">Active</Badge>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Error Logging</p>
                  <p className="text-sm text-muted-foreground">Comprehensive error tracking and reporting</p>
                </div>
                <Badge className="bg-green-100 text-green-800">Enabled</Badge>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Performance Monitoring</p>
                  <p className="text-sm text-muted-foreground">Real-time performance metrics collection</p>
                </div>
                <Badge className="bg-green-100 text-green-800">Active</Badge>
              </div>

              <div className="pt-4 border-t">
                <Button variant="outline" className="w-full">
                  <Database className="w-4 h-4 mr-2" />
                  Database Management
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}