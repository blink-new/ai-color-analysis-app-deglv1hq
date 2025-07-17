import { ReactNode } from 'react'
import { Shield, Lock, AlertTriangle } from 'lucide-react'
import { Card } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { isAdmin } from '../utils/admin'

interface AdminGuardProps {
  children: ReactNode
  userEmail: string | null | undefined
  fallback?: ReactNode
  showAdminBadge?: boolean
}

export function AdminGuard({ 
  children, 
  userEmail, 
  fallback,
  showAdminBadge = true 
}: AdminGuardProps) {
  const isAdminUser = isAdmin(userEmail)

  if (!isAdminUser) {
    return fallback || (
      <Card className="p-8 text-center border-2 border-dashed border-orange-200 bg-gradient-to-br from-orange-50 to-red-50">
        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Lock className="w-8 h-8 text-orange-600" />
        </div>
        <h3 className="text-xl font-bold text-orange-800 mb-2">Admin Access Required</h3>
        <p className="text-orange-700 mb-4">
          This feature is only available to administrators.
        </p>
        <div className="flex items-center justify-center gap-2 text-sm text-orange-600">
          <AlertTriangle className="w-4 h-4" />
          <span>Contact an administrator for access</span>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {showAdminBadge && (
        <div className="flex items-center justify-center">
          <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
            <Shield className="w-3 h-3 mr-1" />
            Admin Access
          </Badge>
        </div>
      )}
      {children}
    </div>
  )
}

/**
 * Admin status indicator component
 */
export function AdminStatus({ userEmail }: { userEmail: string | null | undefined }) {
  const isAdminUser = isAdmin(userEmail)

  if (!isAdminUser) return null

  return (
    <div className="fixed top-4 right-4 z-50">
      <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200 shadow-lg">
        <Shield className="w-3 h-3 mr-1" />
        Admin
      </Badge>
    </div>
  )
}