// Admin authentication and utilities

// Admin email addresses (you can modify this list)
const ADMIN_EMAILS = [
  'kai.jiabo.feng@gmail.com', // Your email from the project info
  'admin@example.com' // Add more admin emails as needed
]

/**
 * Check if the current user is an admin
 */
export function isAdmin(userEmail: string | null | undefined): boolean {
  if (!userEmail) return false
  return ADMIN_EMAILS.includes(userEmail.toLowerCase())
}

/**
 * Admin-only wrapper component
 */
export function requireAdmin(userEmail: string | null | undefined): boolean {
  return isAdmin(userEmail)
}

/**
 * Get admin status with detailed info
 */
export function getAdminStatus(userEmail: string | null | undefined) {
  const isAdminUser = isAdmin(userEmail)
  return {
    isAdmin: isAdminUser,
    email: userEmail,
    hasAccess: isAdminUser,
    message: isAdminUser 
      ? 'Admin access granted' 
      : 'This feature is only available to administrators'
  }
}

/**
 * Admin configuration
 */
export const ADMIN_CONFIG = {
  emails: ADMIN_EMAILS,
  features: {
    photoAnalysis: true,
    userManagement: true,
    systemTests: true,
    analytics: true
  }
}