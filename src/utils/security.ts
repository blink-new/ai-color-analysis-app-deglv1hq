// Security utilities for the color analysis app

/**
 * Validates file upload security
 */
export function validateFileUpload(file: File): { isValid: boolean; error?: string } {
  // Check file type - be more accepting
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/bmp', 'image/tiff']
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'Invalid file type. Please upload a JPG, PNG, WebP, GIF, BMP, or TIFF image.'
    }
  }

  // Check file size (15MB limit - more generous)
  const maxSize = 15 * 1024 * 1024 // 15MB
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: 'File size too large. Please upload an image smaller than 15MB.'
    }
  }

  // Check file name for suspicious patterns
  const suspiciousPatterns = [
    /\.php$/i,
    /\.exe$/i,
    /\.bat$/i,
    /\.sh$/i,
    /\.cmd$/i,
    /\.scr$/i,
    /\.com$/i,
    /\.pif$/i,
    /\.vbs$/i,
    /\.js$/i,
    /\.jar$/i
  ]

  if (suspiciousPatterns.some(pattern => pattern.test(file.name))) {
    return {
      isValid: false,
      error: 'Invalid file name. Please rename your image file.'
    }
  }

  return { isValid: true }
}

/**
 * Sanitizes user input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim()
}

/**
 * Validates URL to ensure it's safe
 */
export function validateUrl(url: string): boolean {
  try {
    const urlObj = new URL(url)
    // Only allow https and http protocols
    return ['https:', 'http:'].includes(urlObj.protocol)
  } catch {
    return false
  }
}

/**
 * Rate limiting utility
 */
export class RateLimiter {
  private attempts: Map<string, number[]> = new Map()
  
  constructor(
    private maxAttempts: number = 5,
    private windowMs: number = 15 * 60 * 1000 // 15 minutes
  ) {}

  isAllowed(identifier: string): boolean {
    const now = Date.now()
    const attempts = this.attempts.get(identifier) || []
    
    // Remove old attempts outside the window
    const validAttempts = attempts.filter(time => now - time < this.windowMs)
    
    if (validAttempts.length >= this.maxAttempts) {
      return false
    }
    
    // Add current attempt
    validAttempts.push(now)
    this.attempts.set(identifier, validAttempts)
    
    return true
  }

  getRemainingAttempts(identifier: string): number {
    const attempts = this.attempts.get(identifier) || []
    const now = Date.now()
    const validAttempts = attempts.filter(time => now - time < this.windowMs)
    return Math.max(0, this.maxAttempts - validAttempts.length)
  }
}

/**
 * Content Security Policy headers (for server-side implementation)
 */
export const CSP_HEADERS = {
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://blink.new",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://api.blink.new https://storage.googleapis.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; ')
}

/**
 * Security headers for enhanced protection
 */
export const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  ...CSP_HEADERS
}

/**
 * Validates color hex codes
 */
export function validateHexColor(hex: string): boolean {
  const hexPattern = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
  return hexPattern.test(hex)
}

/**
 * Escapes HTML to prevent XSS
 */
export function escapeHtml(text: string): string {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}