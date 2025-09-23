interface RetryOptions {
  maxAttempts?: number
  delay?: number
  backoff?: "linear" | "exponential"
  shouldRetry?: (error: any) => boolean
}

export class RetryError extends Error {
  constructor(
    message: string,
    public attempts: number,
    public lastError: Error,
  ) {
    super(message)
    this.name = "RetryError"
  }
}

export async function withRetry<T>(fn: () => Promise<T>, options: RetryOptions = {}): Promise<T> {
  const { maxAttempts = 3, delay = 1000, backoff = "exponential", shouldRetry = () => true } = options

  let lastError: Error

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))

      // Don't retry if we shouldn't or if it's the last attempt
      if (!shouldRetry(lastError) || attempt === maxAttempts) {
        break
      }

      // Calculate delay
      const currentDelay = backoff === "exponential" ? delay * Math.pow(2, attempt - 1) : delay * attempt

      console.warn(`[v0] Attempt ${attempt} failed, retrying in ${currentDelay}ms:`, lastError.message)

      await new Promise((resolve) => setTimeout(resolve, currentDelay))
    }
  }

  throw new RetryError(`Failed after ${maxAttempts} attempts`, maxAttempts, lastError!)
}

// Specific retry configurations for common scenarios
export const retryConfigs = {
  database: {
    maxAttempts: 3,
    delay: 1000,
    backoff: "exponential" as const,
    shouldRetry: (error: any) => {
      // Retry on network errors, timeouts, and temporary database issues
      return (
        error.code === "NETWORK_ERROR" ||
        error.code === "TIMEOUT" ||
        error.message?.includes("timeout") ||
        error.message?.includes("connection")
      )
    },
  },

  fileUpload: {
    maxAttempts: 2,
    delay: 500,
    backoff: "linear" as const,
    shouldRetry: (error: any) => {
      // Retry on network errors but not on validation errors
      return !error.message?.includes("validation") && !error.message?.includes("invalid file")
    },
  },

  api: {
    maxAttempts: 3,
    delay: 1000,
    backoff: "exponential" as const,
    shouldRetry: (error: any) => {
      // Retry on 5xx errors and network issues, but not 4xx client errors
      const status = error.status || error.response?.status
      return !status || status >= 500 || error.code === "NETWORK_ERROR"
    },
  },
}
