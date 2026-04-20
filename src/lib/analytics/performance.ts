// Response time tracker & performance analytics
// Measures how long each query takes and from which source

export type QuerySource = "cache" | "local-db" | "llm-api" | "service-worker";

export interface PerformanceMetric {
  queryId: string;
  startTime: number;
  endTime: number | null;
  responseTime: number | null;  // milliseconds
  isOffline: boolean;
  source: QuerySource;
  violationCount: number;
  queryLength: number;
  stateCode: string | null;
}

export interface PerformanceSummary {
  totalQueries: number;
  averageResponseTime: number;
  fastestResponseTime: number;
  slowestResponseTime: number;
  offlineQueryCount: number;
  onlineQueryCount: number;
  sourceBreakdown: Record<QuerySource, number>;
  p90ResponseTime: number;   // 90th percentile
}

// ============================================================
// Singleton tracker class
// ============================================================

class PerformanceTracker {
  private readonly metrics: PerformanceMetric[] = [];
  private readonly MAX_METRICS = 500; // keep last 500 queries to avoid memory leak

  startQuery(
    queryId: string,
    stateCode: string | null = null,
    queryLength = 0
  ): void {
    // Remove oldest if at limit
    if (this.metrics.length >= this.MAX_METRICS) {
      this.metrics.shift();
    }

    this.metrics.push({
      queryId,
      startTime: performance.now(),
      endTime: null,
      responseTime: null,
      isOffline: typeof navigator !== "undefined" ? !navigator.onLine : false,
      source: "local-db", // default, updated on endQuery
      violationCount: 0,
      queryLength,
      stateCode,
    });
  }

  endQuery(
    queryId: string,
    source: QuerySource,
    violationCount = 0
  ): PerformanceMetric | null {
    const metric = this.metrics.find((m) => m.queryId === queryId);
    if (!metric) return null;

    metric.endTime = performance.now();
    metric.responseTime = Math.round(metric.endTime - metric.startTime);
    metric.source = source;
    metric.violationCount = violationCount;

    return metric;
  }

  getMetric(queryId: string): PerformanceMetric | undefined {
    return this.metrics.find((m) => m.queryId === queryId);
  }

  getCompletedMetrics(): PerformanceMetric[] {
    return this.metrics.filter((m) => m.responseTime !== null);
  }

  getSummary(): PerformanceSummary {
    const completed = this.getCompletedMetrics();
    const times = completed
      .map((m) => m.responseTime!)
      .filter((t) => t >= 0)
      .sort((a, b) => a - b);

    const total = times.length;
    const avg = total > 0 ? Math.round(times.reduce((s, t) => s + t, 0) / total) : 0;
    const p90Idx = total > 0 ? Math.floor(total * 0.9) : 0;
    const p90 = times[p90Idx] ?? 0;

    const sourceBreakdown: Record<QuerySource, number> = {
      cache: 0,
      "local-db": 0,
      "llm-api": 0,
      "service-worker": 0,
    };
    for (const m of completed) {
      sourceBreakdown[m.source] = (sourceBreakdown[m.source] ?? 0) + 1;
    }

    return {
      totalQueries: total,
      averageResponseTime: avg,
      fastestResponseTime: times[0] ?? 0,
      slowestResponseTime: times[total - 1] ?? 0,
      offlineQueryCount: completed.filter((m) => m.isOffline).length,
      onlineQueryCount: completed.filter((m) => !m.isOffline).length,
      sourceBreakdown,
      p90ResponseTime: p90,
    };
  }

  getAverageResponseTime(): number {
    return this.getSummary().averageResponseTime;
  }

  formatResponseTime(ms: number): string {
    if (ms < 100) return `${ms}ms`;
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  }

  clearMetrics(): void {
    this.metrics.length = 0;
  }

  exportMetrics(): string {
    return JSON.stringify(
      {
        exportedAt: new Date().toISOString(),
        summary: this.getSummary(),
        metrics: this.getCompletedMetrics(),
      },
      null,
      2
    );
  }
}

// Singleton export
export const performanceTracker = new PerformanceTracker();

// Convenience: generate a random query ID
export function generateQueryId(): string {
  return `q_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

// ============================================================
// UI helper: formats response time + source for display
// ============================================================

export function formatPerformanceBadge(metric: Pick<PerformanceMetric, "responseTime" | "source" | "isOffline">): {
  timeLabel: string;
  sourceLabel: string;
  offlineLabel: string;
} {
  const SOURCE_LABELS: Record<QuerySource, string> = {
    cache: "Cache",
    "local-db": "Local DB",
    "llm-api": "AI",
    "service-worker": "Offline SW",
  };

  const ms = metric.responseTime;
  const timeLabel = ms === null ? "" : ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(1)}s`;
  const sourceLabel = SOURCE_LABELS[metric.source] ?? metric.source;
  const offlineLabel = metric.isOffline ? "Offline" : "Online";

  return { timeLabel, sourceLabel, offlineLabel };
}
