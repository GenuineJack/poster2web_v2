export class MonitoringService {
  private static instance: MonitoringService
  private metrics: Map<string, number[]> = new Map()

  static getInstance(): MonitoringService {
    if (!MonitoringService.instance) {
      MonitoringService.instance = new MonitoringService()
    }
    return MonitoringService.instance
  }

  // Track user interactions
  trackEvent(event: string, properties?: Record<string, any>) {
    if (typeof window === "undefined") return

    const timestamp = Date.now()
    const eventData = {
      event,
      timestamp,
      url: window.location.href,
      userAgent: navigator.userAgent,
      ...properties,
    }

    // Store locally for now (could be sent to analytics service)
    const events = JSON.parse(localStorage.getItem("app_events") || "[]")
    events.push(eventData)

    // Keep only last 100 events
    if (events.length > 100) {
      events.splice(0, events.length - 100)
    }

    localStorage.setItem("app_events", JSON.stringify(events))
  }

  // Track performance metrics
  trackPerformance(metric: string, value: number) {
    if (!this.metrics.has(metric)) {
      this.metrics.set(metric, [])
    }

    const values = this.metrics.get(metric)!
    values.push(value)

    // Keep only last 50 measurements
    if (values.length > 50) {
      values.splice(0, values.length - 50)
    }
  }

  // Get performance summary
  getPerformanceSummary() {
    const summary: Record<string, any> = {}

    for (const [metric, values] of this.metrics.entries()) {
      if (values.length > 0) {
        summary[metric] = {
          avg: values.reduce((a, b) => a + b, 0) / values.length,
          min: Math.min(...values),
          max: Math.max(...values),
          count: values.length,
        }
      }
    }

    return summary
  }

  // Track errors
  trackError(error: Error, context?: Record<string, any>) {
    this.trackEvent("error", {
      message: error.message,
      stack: error.stack,
      name: error.name,
      ...context,
    })
  }

  // Track page views
  trackPageView(page: string) {
    this.trackEvent("page_view", { page })
  }
}

// Export singleton instance
export const monitoring = MonitoringService.getInstance()
