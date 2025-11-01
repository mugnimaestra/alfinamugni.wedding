/**
 * Performance Monitoring Utilities
 * Track Core Web Vitals and performance metrics for Indonesian mobile devices
 */

export interface PerformanceMetrics {
  // Core Web Vitals
  lcp?: number // Largest Contentful Paint
  fid?: number // First Input Delay (deprecated, using INP)
  inp?: number // Interaction to Next Paint
  cls?: number // Cumulative Layout Shift
  ttfb?: number // Time to First Byte
  fcp?: number // First Contentful Paint

  // Additional metrics
  domContentLoaded?: number
  loadComplete?: number
  networkType?: string
  deviceMemory?: number
  connectionSpeed?: number
  
  // Indonesian-specific
  carrier?: string
  peakHour?: boolean
  
  // Page info
  url: string
  timestamp: number
}

export interface PerformanceBudget {
  lcp: number // Target: 2.5s
  inp: number // Target: 200ms
  cls: number // Target: 0.1
  ttfb: number // Target: 800ms
  fcp: number // Target: 1.8s
}

// Performance budgets for Indonesian 3G networks
export const PERFORMANCE_BUDGET: PerformanceBudget = {
  lcp: 2500, // 2.5 seconds
  inp: 200, // 200 milliseconds
  cls: 0.1, // 0.1 score
  ttfb: 800, // 800 milliseconds
  fcp: 1800, // 1.8 seconds
}

/**
 * Detect if it's peak hour in Jakarta (WIB timezone)
 */
export function isPeakHour(): boolean {
  const now = new Date()
  const jakartaTime = new Date(
    now.toLocaleString("en-US", { timeZone: "Asia/Jakarta" }),
  )
  const hour = jakartaTime.getHours()

  // Peak hours: 7-9 AM and 6-8 PM Jakarta time
  return (hour >= 7 && hour <= 9) || (hour >= 18 && hour <= 20)
}

/**
 * Detect Indonesian carrier based on connection characteristics
 */
export function detectCarrier(
  downlink: number,
  rtt: number,
): string | undefined {
  if (downlink > 20 && rtt < 50) return "telkomsel"
  if (downlink > 15 && rtt < 80) return "xl-axiata"
  if (downlink > 10 && rtt < 100) return "indosat"
  if (downlink > 5) return "tri-3"
  return "unknown"
}

/**
 * Get network information
 */
export function getNetworkInfo(): {
  type?: string
  downlink?: number
  rtt?: number
  saveData?: boolean
  carrier?: string
} {
  if (typeof window === "undefined") return {}

  const connection =
    (navigator as any).connection ||
    (navigator as any).mozConnection ||
    (navigator as any).webkitConnection

  if (!connection) return {}

  const carrier = detectCarrier(connection.downlink || 10, connection.rtt || 50)

  return {
    type: connection.effectiveType,
    downlink: connection.downlink,
    rtt: connection.rtt,
    saveData: connection.saveData,
    carrier,
  }
}

/**
 * Collect Core Web Vitals using Performance Observer API
 */
export function observeWebVitals(
  callback: (metrics: PerformanceMetrics) => void,
): () => void {
  if (typeof window === "undefined") return () => {}

  const metrics: Partial<PerformanceMetrics> = {
    url: window.location.href,
    timestamp: Date.now(),
  }

  // Observe LCP (Largest Contentful Paint)
  const lcpObserver = new PerformanceObserver((list) => {
    const entries = list.getEntries()
    const lastEntry = entries[entries.length - 1] as any
    metrics.lcp = lastEntry.renderTime || lastEntry.loadTime
  })

  try {
    lcpObserver.observe({ type: "largest-contentful-paint", buffered: true })
  } catch (e: any) {
    console.warn("LCP observation not supported:", e?.message || e)
  }

  // Observe FID/INP (Interaction to Next Paint)
  const inpObserver = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      const fidEntry = entry as any
      if (!metrics.inp || fidEntry.processingStart - fidEntry.startTime > metrics.inp) {
        metrics.inp = fidEntry.processingStart - fidEntry.startTime
      }
    }
  })

  try {
    inpObserver.observe({ type: "first-input", buffered: true })
  } catch (e: any) {
    console.warn("FID/INP observation not supported:", e?.message || e)
  }

  // Observe CLS (Cumulative Layout Shift)
  let clsValue = 0
  const clsObserver = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      const layoutShift = entry as any
      if (!layoutShift.hadRecentInput) {
        clsValue += layoutShift.value
        metrics.cls = clsValue
      }
    }
  })

  try {
    clsObserver.observe({ type: "layout-shift", buffered: true })
  } catch (e: any) {
    console.warn("CLS observation not supported:", e?.message || e)
  }

  // Get Navigation Timing metrics
  const navigationTiming = performance.getEntriesByType(
    "navigation",
  )[0] as PerformanceNavigationTiming

  if (navigationTiming) {
    metrics.ttfb = navigationTiming.responseStart - navigationTiming.requestStart
    metrics.domContentLoaded =
      navigationTiming.domContentLoadedEventEnd - navigationTiming.fetchStart
    metrics.loadComplete =
      navigationTiming.loadEventEnd - navigationTiming.fetchStart
  }

  // Get FCP (First Contentful Paint)
  const fcpEntry = performance.getEntriesByName(
    "first-contentful-paint",
  )[0] as any
  if (fcpEntry) {
    metrics.fcp = fcpEntry.startTime
  }

  // Add network info
  const networkInfo = getNetworkInfo()
  metrics.networkType = networkInfo.type
  metrics.connectionSpeed = networkInfo.downlink
  metrics.carrier = networkInfo.carrier

  // Check if peak hour
  metrics.peakHour = isPeakHour()

  // Device memory (if available)
  if ("deviceMemory" in navigator) {
    metrics.deviceMemory = (navigator as any).deviceMemory
  }

  // Report metrics after page load
  if (document.readyState === "complete") {
    callback(metrics as PerformanceMetrics)
  } else {
    window.addEventListener("load", () => {
      setTimeout(() => {
        callback(metrics as PerformanceMetrics)
      }, 0)
    })
  }

  // Cleanup function
  return () => {
    lcpObserver.disconnect()
    inpObserver.disconnect()
    clsObserver.disconnect()
  }
}

/**
 * Check if metrics meet performance budget
 */
export function checkPerformanceBudget(
  metrics: PerformanceMetrics,
): {
  passing: boolean
  violations: string[]
} {
  const violations: string[] = []

  if (metrics.lcp && metrics.lcp > PERFORMANCE_BUDGET.lcp) {
    violations.push(
      `LCP: ${metrics.lcp.toFixed(0)}ms (budget: ${PERFORMANCE_BUDGET.lcp}ms)`,
    )
  }

  if (metrics.inp && metrics.inp > PERFORMANCE_BUDGET.inp) {
    violations.push(
      `INP: ${metrics.inp.toFixed(0)}ms (budget: ${PERFORMANCE_BUDGET.inp}ms)`,
    )
  }

  if (metrics.cls && metrics.cls > PERFORMANCE_BUDGET.cls) {
    violations.push(
      `CLS: ${metrics.cls.toFixed(3)} (budget: ${PERFORMANCE_BUDGET.cls})`,
    )
  }

  if (metrics.ttfb && metrics.ttfb > PERFORMANCE_BUDGET.ttfb) {
    violations.push(
      `TTFB: ${metrics.ttfb.toFixed(0)}ms (budget: ${PERFORMANCE_BUDGET.ttfb}ms)`,
    )
  }

  if (metrics.fcp && metrics.fcp > PERFORMANCE_BUDGET.fcp) {
    violations.push(
      `FCP: ${metrics.fcp.toFixed(0)}ms (budget: ${PERFORMANCE_BUDGET.fcp}ms)`,
    )
  }

  return {
    passing: violations.length === 0,
    violations,
  }
}

/**
 * Log performance metrics to console (development only)
 */
export function logPerformanceMetrics(metrics: PerformanceMetrics): void {
  if (typeof process !== "undefined" && process.env.NODE_ENV !== "development") return

  console.group("🚀 Performance Metrics")
  console.log("URL:", metrics.url)
  console.log("Timestamp:", new Date(metrics.timestamp).toLocaleString())
  console.log("\n📊 Core Web Vitals:")
  console.log(`  LCP: ${metrics.lcp?.toFixed(0)}ms`)
  console.log(`  INP: ${metrics.inp?.toFixed(0)}ms`)
  console.log(`  CLS: ${metrics.cls?.toFixed(3)}`)
  console.log(`  TTFB: ${metrics.ttfb?.toFixed(0)}ms`)
  console.log(`  FCP: ${metrics.fcp?.toFixed(0)}ms`)
  console.log("\n🌐 Network:")
  console.log(`  Type: ${metrics.networkType}`)
  console.log(`  Speed: ${metrics.connectionSpeed?.toFixed(1)} Mbps`)
  console.log(`  Carrier: ${metrics.carrier}`)
  console.log(`  Peak Hour: ${metrics.peakHour ? "Yes" : "No"}`)
  console.log("\n💻 Device:")
  console.log(`  Memory: ${metrics.deviceMemory} GB`)

  const budget = checkPerformanceBudget(metrics)
  if (!budget.passing) {
    console.warn("\n⚠️ Performance Budget Violations:")
    budget.violations.forEach((v) => console.warn(`  ${v}`))
  } else {
    console.log("\n✅ All performance budgets met!")
  }

  console.groupEnd()
}
