// ============================================================================
// Nordi-Remittance — Document Job Service
// Distributed document processing via BullMQ + Kafka + Redis
//
// Two job types:
//   1. RENDER — generate PDF from template   (DOCUMENT queue)
//   2. EXPORT — CSV / XLSX / DOCX export     (DOCUMENT queue)
//
// Results are cached in Redis with configurable TTL.
// Kafka is used for event fan-out to analytics / audit / storage topics.
// ============================================================================

import { nanoid } from 'nanoid';
import type { JobsOptions } from 'bullmq';
import { createLogger } from '../../logs/logger.js';
import { addJob } from '../../services/bullmq.service.js';
import { getKafkaService, KafkaTopics } from '../../services/kafka.service.js';
import { cacheGet, cacheSet } from '../../services/redis.service.js';
const log = createLogger('DocumentJobService');

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

export const JOB_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  DONE: 'done',
  FAILED: 'failed',
} as const;

export type JobStatusType = (typeof JOB_STATUS)[keyof typeof JOB_STATUS];

const DEFAULT_TTL = 3600; // 1 hour — cached parse/render results
const STATUS_TTL = 86400; // 24 hours — job status records

// ─────────────────────────────────────────────────────────────────────────────
// REDIS KEY HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const jobKey = (id: string) => `docjob:${id}`;
const resultKey = (id: string) => `docjob:result:${id}`;

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface RenderOptions {
  templateName?: string;
  data: Record<string, any>;
  branding?: Record<string, any>;
  pdfOptions?: Record<string, any>;
}

export interface ExportData {
  data: any[];
  columns: any[];
  title?: string;
}

export interface JobMeta {
  tenantId?: string;
  userId?: string;
  documentId?: string;
  label?: string;
  source?: 'analytics' | 'audit' | 'report';
}

// ─────────────────────────────────────────────────────────────────────────────
// JOB STATUS HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Persist job status to Redis.
 */
export async function setJobStatus(
  jobId: string,
  status: JobStatusType,
  meta: Record<string, any> = {},
): Promise<void> {
  await cacheSet(
    jobKey(jobId),
    JSON.stringify({ jobId, status, updatedAt: new Date().toISOString(), ...meta }),
    STATUS_TTL,
  );
}

/**
 * Read job status from Redis.
 */
export async function getJobStatus(jobId: string): Promise<Record<string, any> | null> {
  const raw = await cacheGet(jobKey(jobId));
  return raw ? JSON.parse(raw as string) : null;
}

/**
 * Store a serialisable result in Redis.
 */
export async function cacheResult(jobId: string, result: any, ttl = DEFAULT_TTL): Promise<void> {
  await cacheSet(resultKey(jobId), JSON.stringify(result), ttl);
}

/**
 * Retrieve a previously cached result.
 */
export async function getCachedResult(jobId: string): Promise<any | null> {
  const raw = await cacheGet(resultKey(jobId));
  return raw ? JSON.parse(raw as string) : null;
}

// ─────────────────────────────────────────────────────────────────────────────
// DISPATCH — RENDER (PDF generation)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Dispatch a PDF render job.
 */
export async function dispatchRenderJob(
  renderOptions: RenderOptions,
  opts: JobMeta = {},
  jobOpts: JobsOptions = {},
): Promise<string> {
  const jobId = `render_${nanoid(12)}`;

  const payload = {
    jobId,
    type: 'render',
    templateName: renderOptions.templateName || 'pdf-base',
    data: renderOptions.data,
    branding: renderOptions.branding || {},
    pdfOptions: renderOptions.pdfOptions || {},
    tenantId: opts.tenantId,
    userId: opts.userId,
    documentId: opts.documentId,
    label: opts.label,
    createdAt: new Date().toISOString(),
  };

  await Promise.all([
    addJob('DOCUMENT', 'document:render', payload, { priority: 2, ...jobOpts }),
    setJobStatus(jobId, JOB_STATUS.PENDING, { type: 'render', tenantId: opts.tenantId }),
  ]);

  if (opts.tenantId) {
    await getKafkaService().publish(KafkaTopics.DOCUMENT_EVENTS, {
      type: 'document.render.queued',
      jobId,
      tenantId: opts.tenantId,
      label: opts.label,
    }, opts.tenantId).catch((err) => log.warn('Kafka fan-out failed', { error: err.message }));
  }

  log.info('Render job dispatched', { jobId, label: opts.label });
  return jobId;
}

// ─────────────────────────────────────────────────────────────────────────────
// DISPATCH — EXPORT (CSV / XLSX / DOCX)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Dispatch a tabular-data export job.
 */
export async function dispatchExportJob(
  format: 'csv' | 'xlsx' | 'pdf',
  exportData: ExportData,
  opts: JobMeta = {},
  jobOpts: JobsOptions = {},
): Promise<string> {
  const jobId = `export_${nanoid(12)}`;
  const source = opts.source || 'report';

  const payload = {
    jobId,
    type: 'export',
    format,
    source,
    data: exportData.data,
    columns: exportData.columns,
    title: exportData.title || 'Export',
    tenantId: opts.tenantId,
    userId: opts.userId,
    createdAt: new Date().toISOString(),
  };

  await Promise.all([
    addJob('DOCUMENT', 'document:export', payload, { priority: 2, ...jobOpts }),
    setJobStatus(jobId, JOB_STATUS.PENDING, {
      type: 'export',
      format,
      source,
      tenantId: opts.tenantId,
    }),
  ]);

  const kafkaTopic = source === 'audit' ? KafkaTopics.AUDIT_EVENTS : KafkaTopics.ANALYTICS_EVENTS;

  if (opts.tenantId) {
    await getKafkaService().publish(kafkaTopic, {
      type: 'document.export.queued',
      jobId,
      format,
      source,
      tenantId: opts.tenantId,
    }, opts.tenantId).catch((err) => log.warn('Kafka fan-out failed', { error: err.message }));
  }

  log.info('Export job dispatched', { jobId, format, source });
  return jobId;
}

// ─────────────────────────────────────────────────────────────────────────────
// MARK COMPLETE / FAILED  (called by workers after processing)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Mark a job as done and cache its result.
 */
export async function markJobDone(jobId: string, result: any): Promise<void> {
  await Promise.all([setJobStatus(jobId, JOB_STATUS.DONE, { result }), cacheResult(jobId, result)]);
}

/**
 * Mark a job as failed.
 */
export async function markJobFailed(jobId: string, error: unknown): Promise<void> {
  const message = error instanceof Error ? error.message : String(error);
  await setJobStatus(jobId, JOB_STATUS.FAILED, { error: message });
}

export default {
  dispatchRenderJob,
  dispatchExportJob,
  getJobStatus,
  getCachedResult,
  cacheResult,
  markJobDone,
  markJobFailed,
  JOB_STATUS,
};
