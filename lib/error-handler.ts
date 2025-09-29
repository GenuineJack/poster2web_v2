export interface AppError {
  code: string
  message: string
  userMessage: string
  severity: "low" | "medium" | "high" | "critical"
  context?: Record<string, any>
}

export class ErrorHandler {
  static createError(
    code: string,
    message: string,
    userMessage: string,
    severity: AppError["severity"] = "medium",
    context?: Record<string, any>,
  ): AppError {
    return {
      code,
      message,
      userMessage,
      severity,
      context,
    }
  }

  static handleDatabaseError(error: any): AppError {
    console.error("[ErrorHandler] Database error:", error)

    if (error?.code === "PGRST116") {
      return this.createError("NOT_FOUND", "Resource not found", "The requested item could not be found.", "low")
    }

    if (error?.message?.includes("JWT")) {
      return this.createError(
        "AUTH_REQUIRED",
        "Authentication required",
        "Please confirm your email address to access this feature.",
        "high",
      )
    }

    if (error?.message?.includes("RLS")) {
      return this.createError(
        "PERMISSION_DENIED",
        "Permission denied",
        "You do not have permission to perform this action.",
        "high",
      )
    }

    if (error?.code === "23505") {
      return this.createError(
        "DUPLICATE_ENTRY",
        "Duplicate entry",
        "This item already exists. Please try a different name.",
        "medium",
      )
    }

    if (error?.code === "23503") {
      return this.createError(
        "FOREIGN_KEY_VIOLATION",
        "Reference error",
        "Cannot delete this item because it is being used elsewhere.",
        "medium",
      )
    }

    if (error?.message?.includes("timeout")) {
      return this.createError(
        "DATABASE_TIMEOUT",
        "Database timeout",
        "The operation took too long. Please try again.",
        "high",
      )
    }

    return this.createError(
      "DATABASE_ERROR",
      error?.message || "Database operation failed",
      "A database error occurred. Please try again.",
      "high",
      { originalError: error },
    )
  }

  static handleFileProcessingError(error: any, fileName?: string): AppError {
    console.error("[ErrorHandler] File processing error:", error)

    if (error?.message?.includes("size")) {
      return this.createError(
        "FILE_TOO_LARGE",
        "File size exceeds limit",
        "The file is too large. Please use a file smaller than 50MB.",
        "medium",
      )
    }

    if (error?.message?.includes("type") || error?.message?.includes("format")) {
      return this.createError(
        "UNSUPPORTED_FILE_TYPE",
        "Unsupported file type",
        "This file type is not supported. Please use PDF, PowerPoint, Word, or image files.",
        "medium",
      )
    }

    return this.createError(
      "FILE_PROCESSING_ERROR",
      error?.message || "File processing failed",
      `Failed to process ${fileName || "the file"}. Please try a different file or contact support.`,
      "medium",
      { fileName },
    )
  }

  static handleAuthError(error: any): AppError {
    console.error("[ErrorHandler] Auth error:", error)

    if (error?.message?.includes("Invalid login credentials")) {
      return this.createError(
        "INVALID_CREDENTIALS",
        "Invalid credentials",
        "Invalid email or password. Please check your credentials and try again.",
        "medium",
      )
    }

    if (error?.message?.includes("Email not confirmed")) {
      return this.createError(
        "EMAIL_NOT_CONFIRMED",
        "Email not confirmed",
        "Please check your email and click the confirmation link before logging in.",
        "medium",
      )
    }

    if (error?.message?.includes("Email rate limit exceeded")) {
      return this.createError(
        "EMAIL_RATE_LIMIT",
        "Too many email requests",
        "Please wait a few minutes before requesting another email.",
        "medium",
      )
    }

    if (error?.message?.includes("Password should be at least")) {
      return this.createError(
        "WEAK_PASSWORD",
        "Password too weak",
        "Password must be at least 6 characters long.",
        "medium",
      )
    }

    return this.createError(
      "AUTH_ERROR",
      error?.message || "Authentication failed",
      "An authentication error occurred. Please try again.",
      "medium",
    )
  }

  static handleNetworkError(error: any): AppError {
    console.error("[ErrorHandler] Network error:", error)

    if (error?.code === "NETWORK_ERROR" || error?.message?.includes("fetch")) {
      return this.createError(
        "NETWORK_ERROR",
        "Network request failed",
        "Network connection failed. Please check your internet connection and try again.",
        "high",
      )
    }

    if (error?.code === "TIMEOUT_ERROR") {
      return this.createError(
        "REQUEST_TIMEOUT",
        "Request timeout",
        "The request took too long. Please try again.",
        "medium",
      )
    }

    return this.createError(
      "NETWORK_ERROR",
      "Network request failed",
      "Network connection failed. Please check your internet connection and try again.",
      "high",
    )
  }

  static logError(error: AppError): void {
    const logLevel = error.severity === "critical" ? "error" : error.severity === "high" ? "warn" : "info"

    console[logLevel](`[${error.code}] ${error.message}`, {
      userMessage: error.userMessage,
      severity: error.severity,
      context: error.context,
    })

    if (typeof window !== "undefined" && process.env.NODE_ENV === "production") {
      // Could integrate with error reporting service like Sentry here
      // Example: Sentry.captureException(error)
    }
  }
}
