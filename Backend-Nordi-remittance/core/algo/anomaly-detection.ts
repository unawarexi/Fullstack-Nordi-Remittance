// ============================================================================
// ANOMALY DETECTION — Statistical & heuristic anomaly detection
// Isolation-forest-inspired scoring + time-series deviation
// ============================================================================

import Logger from '../../logs/logger.js';
import { computeStats } from './fraud-detection.js';

// ============================================================================
// TYPES
// ============================================================================

export interface AnomalyResult {
  isAnomaly: boolean;
  score: number;          // 0–1 (1 = most anomalous)
  method: string;
  detail: string;
}

export interface TimeSeriesPoint {
  timestamp: Date;
  value: number;
}

// ============================================================================
// Z-SCORE ANOMALY DETECTION
// ============================================================================

/**
 * Detect anomalies using modified Z-score (uses median absolute deviation).
 * More robust than standard Z-score against outliers.
 */
export function modifiedZScoreAnomaly(
  value: number,
  population: number[],
  threshold = 3.5,
): AnomalyResult {
  if (population.length < 5) {
    return { isAnomaly: false, score: 0, method: 'modified_z_score', detail: 'Insufficient data' };
  }

  const sorted = [...population].sort((a, b) => a - b);
  const n = sorted.length;
  const median = n % 2 === 0 ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2 : sorted[Math.floor(n / 2)];

  // Median Absolute Deviation
  const deviations = sorted.map((v) => Math.abs(v - median));
  deviations.sort((a, b) => a - b);
  const mad = n % 2 === 0
    ? (deviations[n / 2 - 1] + deviations[n / 2]) / 2
    : deviations[Math.floor(n / 2)];

  if (mad === 0) {
    const isAnomaly = value !== median;
    return { isAnomaly, score: isAnomaly ? 1 : 0, method: 'modified_z_score', detail: mad === 0 ? 'Zero variance' : '' };
  }

  const modifiedZ = 0.6745 * Math.abs(value - median) / mad;
  const score = Math.min(1, modifiedZ / (threshold * 2));

  return {
    isAnomaly: modifiedZ > threshold,
    score,
    method: 'modified_z_score',
    detail: `Modified Z-score: ${modifiedZ.toFixed(2)} (threshold: ${threshold})`,
  };
}

// ============================================================================
// ISOLATION FOREST — SIMPLIFIED (single-feature)
// ============================================================================

/**
 * Simplified isolation forest scoring for a single feature.
 * Anomalies are isolated in fewer partitions → higher score.
 */
export function isolationScore(
  value: number,
  data: number[],
  numTrees = 100,
  sampleSize = 256,
): AnomalyResult {
  if (data.length < 10) {
    return { isAnomaly: false, score: 0, method: 'isolation_forest', detail: 'Insufficient data' };
  }

  const actualSampleSize = Math.min(sampleSize, data.length);
  let totalPathLength = 0;

  for (let t = 0; t < numTrees; t++) {
    // Random subsample
    const sample = reservoirSample(data, actualSampleSize);
    totalPathLength += isolationPathLength(value, sample, 0, Math.ceil(Math.log2(actualSampleSize)));
  }

  const avgPathLength = totalPathLength / numTrees;
  const c = harmonicEstimate(actualSampleSize);
  const score = Math.pow(2, -(avgPathLength / c));

  return {
    isAnomaly: score > 0.6,
    score,
    method: 'isolation_forest',
    detail: `Isolation score: ${score.toFixed(3)} (avg path: ${avgPathLength.toFixed(1)})`,
  };
}

function isolationPathLength(value: number, data: number[], depth: number, maxDepth: number): number {
  if (depth >= maxDepth || data.length <= 1) {
    return depth + harmonicEstimate(data.length);
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  if (min === max) return depth;

  // Random split point
  const split = min + seededRandom(depth) * (max - min);

  if (value < split) {
    return isolationPathLength(value, data.filter((d) => d < split), depth + 1, maxDepth);
  }
  return isolationPathLength(value, data.filter((d) => d >= split), depth + 1, maxDepth);
}

function harmonicEstimate(n: number): number {
  if (n <= 1) return 0;
  if (n === 2) return 1;
  return 2 * (Math.log(n - 1) + 0.5772156649) - (2 * (n - 1) / n);
}

function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 49297;
  return x - Math.floor(x);
}

// ============================================================================
// TIME-SERIES ANOMALY — Moving average deviation
// ============================================================================

/**
 * Detect anomalies in time-series data using exponential moving average.
 * Returns anomaly status for the latest point.
 */
export function timeSeriesAnomaly(
  series: TimeSeriesPoint[],
  threshold = 2.5,
  alpha = 0.3,
): AnomalyResult {
  if (series.length < 10) {
    return { isAnomaly: false, score: 0, method: 'ema_deviation', detail: 'Insufficient data' };
  }

  const sorted = [...series].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  const values = sorted.map((s) => s.value);
  const latest = values[values.length - 1];

  // Exponential moving average
  let ema = values[0];
  let emVar = 0;

  for (let i = 1; i < values.length - 1; i++) {
    const diff = values[i] - ema;
    ema = ema + alpha * diff;
    emVar = (1 - alpha) * (emVar + alpha * diff * diff);
  }

  const emStd = Math.sqrt(emVar);
  if (emStd === 0) {
    return { isAnomaly: latest !== ema, score: latest !== ema ? 1 : 0, method: 'ema_deviation', detail: 'Zero variance in EMA' };
  }

  const deviation = Math.abs(latest - ema) / emStd;
  const score = Math.min(1, deviation / (threshold * 2));

  return {
    isAnomaly: deviation > threshold,
    score,
    method: 'ema_deviation',
    detail: `EMA deviation: ${deviation.toFixed(2)} (threshold: ${threshold})`,
  };
}

// ============================================================================
// UTILITY — Reservoir sampling for random subsets
// ============================================================================

export function reservoirSample<T>(data: T[], k: number): T[] {
  if (k >= data.length) return [...data];

  const reservoir = data.slice(0, k);
  for (let i = k; i < data.length; i++) {
    const j = Math.floor(Math.random() * (i + 1));
    if (j < k) reservoir[j] = data[i];
  }
  return reservoir;
}
