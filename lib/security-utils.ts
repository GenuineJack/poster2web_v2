export class SecurityUtils {
  // Sanitize user input to prevent XSS
  static sanitizeInput(input: string): string {
    return input
      .replace(/[<>]/g, "")
      .replace(/javascript:/gi, "")
      .replace(/on\w+=/gi, "")
      .trim()
  }

  // Validate email format
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email) && email.length <= 254
  }

  // Validate password strength
  static isValidPassword(password: string): { valid: boolean; message?: string } {
    if (password.length < 8) {
      return { valid: false, message: "Password must be at least 8 characters long" }
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return { valid: false, message: "Password must contain uppercase, lowercase, and number" }
    }
    return { valid: true }
  }

  // Rate limiting helper
  static createRateLimiter(maxRequests: number, windowMs: number) {
    const requests = new Map<string, number[]>()

    return (identifier: string): boolean => {
      const now = Date.now()
      const windowStart = now - windowMs

      if (!requests.has(identifier)) {
        requests.set(identifier, [])
      }

      const userRequests = requests.get(identifier)!
      const validRequests = userRequests.filter((time) => time > windowStart)

      if (validRequests.length >= maxRequests) {
        return false
      }

      validRequests.push(now)
      requests.set(identifier, validRequests)
      return true
    }
  }

  // Content Security Policy headers
  static getCSPHeader(): string {
    return [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; ")
  }
}
