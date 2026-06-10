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

export type ExecutionSummary = {
  totalCount: number;
  exchangeCompletedCount: number;
  orderFailedCount: number;
  completedCount: number;
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
  retryable?: boolean;
  retryDisabledReason?: string | null;
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

type RawExecution = Omit<Execution, 'executionId' | 'sweepRequestId' | 'userUuid' | 'etfId'> & {
  executionId: number | string;
  sweepRequestId: number | string;
  userUuid?: string | null;
  etfId?: number | string | null;
};

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081',
});

const investClient = axios.create({
  baseURL: import.meta.env.VITE_INVEST_API_BASE_URL || 'http://localhost:8083',
});

const investCoreClient = axios.create({
  baseURL: import.meta.env.VITE_INVEST_CORE_API_BASE_URL || 'http://localhost:8084',
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
  retryable: item.retryable ?? false,
  retryDisabledReason: item.retryDisabledReason ?? null,
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

const mapExecution = (item: RawExecution): Execution => ({
  ...item,
  executionId: toStringId(item.executionId),
  sweepRequestId: toStringId(item.sweepRequestId),
  userUuid: item.userUuid || '-',
  invstAccountUuid: '-',
  etfId: toStringId(item.etfId),
  ticker: item.ticker || '-',
});

const getCardOutboxEvents = async (params: Record<string, string | number | undefined>) => {
  const data = await unwrap<PageResponse<RawOutboxEvent, OutboxSummary>>(
    client.get('/api/admin/outbox-events', { params })
  );

  return {
    ...data,
    items: data.items.map(mapOutboxEvent),
  };
};

const getInvestOutboxEvents = async (params: Record<string, string | number | undefined>) => {
  const data = await unwrap<PageResponse<RawOutboxEvent, OutboxSummary>>(
    investClient.get('/api/admin/invest/outbox-events', { params })
  );

  return {
    ...data,
    items: data.items.map(mapOutboxEvent),
  };
};

const getCardInboxEvents = async (params: Record<string, string | number | undefined>) => {
  const data = await unwrap<PageResponse<RawInboxEvent, InboxSummary>>(
    client.get('/api/admin/inbox-events', { params })
  );

  return {
    ...data,
    items: data.items.map(mapInboxEvent),
  };
};

const getInvestInboxEvents = async (params: Record<string, string | number | undefined>) => {
  const data = await unwrap<PageResponse<RawInboxEvent, InboxSummary>>(
    investClient.get('/api/admin/invest/inbox-events', { params })
  );

  return {
    ...data,
    items: data.items.map(mapInboxEvent),
  };
};

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
    if (params.systemType === 'INVEST') {
      return getInvestOutboxEvents(params);
    }

    return getCardOutboxEvents(params);
  },

  async retryOutboxEvent(outboxId: string, systemType: OutboxEvent['systemType'] = 'CARD') {
    const targetClient = systemType === 'INVEST' ? investClient : client;
    const path = systemType === 'INVEST'
      ? `/api/admin/invest/outbox-events/${outboxId}/retry`
      : `/api/admin/outbox-events/${outboxId}/retry`;

    const data = await unwrap<RawOutboxEvent>(
      targetClient.post(path)
    );

    return mapOutboxEvent(data);
  },

  async getInboxEvents(params: Record<string, string | number | undefined>) {
    if (params.systemType === 'INVEST') {
      return getInvestInboxEvents(params);
    }

    return getCardInboxEvents(params);
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

  async getAutoInvestExecutions(params: Record<string, string | number | undefined>) {
    const data = await unwrap<PageResponse<RawExecution, ExecutionSummary>>(
      investCoreClient.get('/api/admin/invest/auto-invest/executions', { params })
    );

    return {
      ...data,
      items: data.items.map(mapExecution),
    };
  },
};
