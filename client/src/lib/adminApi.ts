import axios from 'axios';
import type { Execution, InboxEvent, OutboxEvent, SweepRequest } from './mockData';

type ApiResponse<T> = {
  code: string;
  message: string;
  data: T;
};

type PageResponse<TItem, TSummary> = {
  summary: TSummary;
  items: TItem[];
  page: number;
  size: number;
  totalCount: number;
  totalPages: number;
};

export type SweepSummary = {
  totalCount: number;
  createdCount: number;
  processingCount: number;
  completedCount: number;
  failedCount: number;
};

export type OutboxSummary = {
  totalCount: number;
  publishedCount: number;
  failedCount: number;
  retryingCount: number;
  pendingCount: number;
};

export type InboxSummary = {
  totalCount: number;
  processedCount: number;
  failedCount: number;
  processingCount: number;
  receivedCount: number;
};

export type RetrySummary = {
  retryableCount: number;
  retryingCount: number;
  retrySucceededCount: number;
  retryFailedCount: number;
};

type DashboardSummary = {
  baseMonth: string;
  kpis: {
    monthlySweepRequestCount: number;
    monthlySweepCompletedCount: number;
    monthlySweepFailedCount: number;
    monthlyOutboxFailedCount: number;
    monthlyInboxFailedCount: number;
  };
  sweepSummary: SweepSummary;
  outboxSummary: OutboxSummary;
  inboxSummary: InboxSummary;
  recentFailedSweepRequests: RawSweepRequest[];
  recentFailedOutboxEvents: RawOutboxEvent[];
  recentFailedInboxEvents: RawInboxEvent[];
};

type RawSweepRequest = Omit<SweepRequest, 'sweepRequestId' | 'userUuid' | 'etfId'> & {
  sweepRequestId: number | string;
  pointLedgerId?: number | string | null;
  userUuid?: string | null;
  cardUserUuid?: string | null;
  etfId?: number | string | null;
};

type RawOutboxEvent = Omit<OutboxEvent, 'outboxId' | 'sweepRequestId'> & {
  outboxId: number | string;
  sweepRequestId: number | string;
};

type RawInboxEvent = Omit<InboxEvent, 'inboxId' | 'sweepRequestId' | 'failReason'> & {
  inboxId: number | string;
  sweepRequestId: number | string;
  failReason?: string | null;
  lastErrorMessage?: string | null;
};

type RawRetryTarget = {
  executionId: number | string;
  sweepRequestId: number | string;
  userUuid?: string | null;
  cardUserUuid?: string | null;
  etfId?: number | string | null;
  ticker?: string | null;
  failedStep: string;
  exchangeStatus: string;
  orderStatus: string;
  failReason: string | null;
  retryable: boolean;
  requestedAt: string;
  completedAt: string | null;
  updatedAt: string;
};

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081',
});

const unwrap = async <T>(promise: Promise<{ data: ApiResponse<T> }>): Promise<T> => {
  const response = await promise;
  return response.data.data;
};

const toStringId = (value: number | string | null | undefined) => {
  if (value === null || value === undefined) {
    return '-';
  }

  return String(value);
};

const mapSweepRequest = (item: RawSweepRequest): SweepRequest => ({
  sweepRequestId: toStringId(item.sweepRequestId),
  userUuid: item.userUuid || item.cardUserUuid || '-',
  baseMonth: item.baseMonth,
  pointAmount: item.pointAmount,
  krwAmount: item.krwAmount,
  etfId: toStringId(item.etfId),
  ticker: item.ticker || '-',
  requestStatus: item.requestStatus,
  failReason: item.failReason,
  requestedAt: item.requestedAt,
  sentAt: item.sentAt,
  completedAt: item.completedAt,
  updatedAt: item.updatedAt,
});

const mapOutboxEvent = (item: RawOutboxEvent): OutboxEvent => ({
  ...item,
  outboxId: toStringId(item.outboxId),
  sweepRequestId: toStringId(item.sweepRequestId),
});

const mapInboxEvent = (item: RawInboxEvent): InboxEvent => ({
  ...item,
  inboxId: toStringId(item.inboxId),
  sweepRequestId: toStringId(item.sweepRequestId),
  failReason: item.failReason ?? item.lastErrorMessage ?? null,
});

const mapRetryTarget = (item: RawRetryTarget): Execution & { failedStep: string; retryable: boolean } => ({
  executionId: toStringId(item.executionId),
  sweepRequestId: toStringId(item.sweepRequestId),
  userUuid: item.userUuid || item.cardUserUuid || '-',
  invstAccountUuid: '-',
  etfId: toStringId(item.etfId),
  ticker: item.ticker || '-',
  executionStatus: 'FAILED',
  fxStatus: item.exchangeStatus as Execution['fxStatus'],
  orderStatus: item.orderStatus as Execution['orderStatus'],
  failReason: item.failReason,
  startedAt: item.requestedAt,
  completedAt: item.completedAt,
  updatedAt: item.updatedAt,
  failedStep: item.failedStep,
  retryable: item.retryable,
});

export const adminApi = {
  async getDashboardSummary(baseMonth?: string) {
    const data = await unwrap<DashboardSummary>(
      client.get('/api/admin/dashboard/summary', { params: { baseMonth } })
    );

    return {
      ...data,
      recentFailedSweepRequests: data.recentFailedSweepRequests.map(mapSweepRequest),
      recentFailedOutboxEvents: data.recentFailedOutboxEvents.map(mapOutboxEvent),
      recentFailedInboxEvents: data.recentFailedInboxEvents.map(mapInboxEvent),
    };
  },

  async getSweepRequests(params: Record<string, string | number | undefined>) {
    const data = await unwrap<PageResponse<RawSweepRequest, SweepSummary>>(
      client.get('/api/admin/sweep-requests', { params })
    );

    return {
      ...data,
      items: data.items.map(mapSweepRequest),
    };
  },

  async getOutboxEvents(params: Record<string, string | number | undefined>) {
    const data = await unwrap<PageResponse<RawOutboxEvent, OutboxSummary>>(
      client.get('/api/admin/outbox-events', { params })
    );

    return {
      ...data,
      items: data.items.map(mapOutboxEvent),
    };
  },

  async getInboxEvents(params: Record<string, string | number | undefined>) {
    const data = await unwrap<PageResponse<RawInboxEvent, InboxSummary>>(
      client.get('/api/admin/inbox-events', { params })
    );

    return {
      ...data,
      items: data.items.map(mapInboxEvent),
    };
  },

  async getRetryTargets(params: Record<string, string | number | undefined>) {
    const data = await unwrap<PageResponse<RawRetryTarget, RetrySummary>>(
      client.get('/api/admin/auto-invest/retry-targets', { params })
    );

    return {
      ...data,
      items: data.items.map(mapRetryTarget),
    };
  },
};
