export class PerformanceMonitor {
  private static measurements: Map<string, number> = new Map()

  static startMeasurement(name: string): void {
    this.measurements.set(name, performance.now())
  }

  static endMeasurement(name: string): number {
    const startTime = this.measurements.get(name)
    if (!startTime) {
      console.warn(`No start measurement found for: ${name}`)
      return 0
    }

    const duration = performance.now() - startTime
    this.measurements.delete(name)

    console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`)
    return duration
  }

  static measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    this.startMeasurement(name)
    return fn().finally(() => {
      this.endMeasurement(name)
    })
  }

  static measureSync<T>(name: string, fn: () => T): T {
    this.startMeasurement(name)
    try {
      return fn()
    } finally {
      this.endMeasurement(name)
    }
  }

  static logMemoryUsage(): void {
    if ("memory" in performance) {
      const memory = (performance as any).memory
      console.log("[Performance] Memory usage:", {
        used: `${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
        total: `${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
        limit: `${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB`,
      })
    }
  }
}
