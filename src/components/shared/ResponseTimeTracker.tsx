'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Clock, TrendingUp, BarChart2, Zap } from 'lucide-react';

interface ResponseMetric {
  id: string;
  label: string;
  startTime: number;
  endTime?: number;
  durationMs?: number;
  category: 'api' | 'render' | 'user' | 'total';
}

interface ResponseTimeTrackerProps {
  isLoading?: boolean;
  onMetricsUpdate?: (metrics: ResponseMetric[]) => void;
  showUI?: boolean;
  className?: string;
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

function getPerformanceLabel(ms: number): { label: string; color: string } {
  if (ms < 500) return { label: 'Excellent', color: 'text-green-600' };
  if (ms < 1500) return { label: 'Good', color: 'text-blue-600' };
  if (ms < 3000) return { label: 'Fair', color: 'text-amber-600' };
  return { label: 'Slow', color: 'text-red-600' };
}

export function useResponseTimeTracker() {
  const metricsRef = useRef<ResponseMetric[]>([]);
  const [metrics, setMetrics] = useState<ResponseMetric[]>([]);

  const startTracking = useCallback((id: string, label: string, category: ResponseMetric['category'] = 'api') => {
    const metric: ResponseMetric = {
      id,
      label,
      startTime: performance.now(),
      category,
    };
    metricsRef.current = [...metricsRef.current.filter(m => m.id !== id), metric];
    setMetrics([...metricsRef.current]);
    return metric;
  }, []);

  const stopTracking = useCallback((id: string) => {
    const endTime = performance.now();
    metricsRef.current = metricsRef.current.map(m => {
      if (m.id === id && !m.endTime) {
        return { ...m, endTime, durationMs: Math.round(endTime - m.startTime) };
      }
      return m;
    });
    setMetrics([...metricsRef.current]);
  }, []);

  const clearMetrics = useCallback(() => {
    metricsRef.current = [];
    setMetrics([]);
  }, []);

  return { metrics, startTracking, stopTracking, clearMetrics };
}

export default function ResponseTimeTracker({
  isLoading = false,
  onMetricsUpdate,
  showUI = true,
  className = '',
}: ResponseTimeTrackerProps) {
  const [elapsedMs, setElapsedMs] = useState(0);
  const [sessionMetrics, setSessionMetrics] = useState<{ total: number; count: number; avg: number }>({
    total: 0,
    count: 0,
    avg: 0,
  });
  const startTimeRef = useRef<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [lastResponseTime, setLastResponseTime] = useState<number | null>(null);

  useEffect(() => {
    if (isLoading) {
      startTimeRef.current = performance.now();
      setElapsedMs(0);
      intervalRef.current = setInterval(() => {
        if (startTimeRef.current !== null) {
          setElapsedMs(Math.round(performance.now() - startTimeRef.current));
        }
      }, 100);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (startTimeRef.current !== null) {
        const duration = Math.round(performance.now() - startTimeRef.current);
        setLastResponseTime(duration);
        setSessionMetrics(prev => {
          const newCount = prev.count + 1;
          const newTotal = prev.total + duration;
          return { total: newTotal, count: newCount, avg: Math.round(newTotal / newCount) };
        });
        startTimeRef.current = null;
      }
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isLoading]);

  if (!showUI) return null;

  return (
    <div className={`text-xs space-y-1 ${className}`}>
      {isLoading ? (
        <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
          <Zap className="w-3 h-3 animate-pulse" />
          <span>Processing... {formatDuration(elapsedMs)}</span>
        </div>
      ) : lastResponseTime !== null ? (
        <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Last: {formatDuration(lastResponseTime)}
            {' '}
            <span className={getPerformanceLabel(lastResponseTime).color}>
              ({getPerformanceLabel(lastResponseTime).label})
            </span>
          </span>
          {sessionMetrics.count > 1 && (
            <span className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              Avg: {formatDuration(sessionMetrics.avg)} over {sessionMetrics.count} queries
            </span>
          )}
        </div>
      ) : null}
    </div>
  );
}
