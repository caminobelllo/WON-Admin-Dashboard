// Mock Data for Financial Dashboard

export interface SweepRequest {
  sweepRequestId: string;
  userUuid: string;
  baseMonth: string;
  pointAmount: number;
  krwAmount: number;
  etfId: string;
  ticker: string;
  requestStatus: 'CREATED' | 'SENT' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  failReason: string | null;
  requestedAt: string;
  sentAt: string | null;
  completedAt: string | null;
  updatedAt: string;
}

export interface Execution {
  executionId: string;
  sweepRequestId: string;
  userUuid: string;
  invstAccountUuid: string;
  etfId: string;
  ticker: string;
  executionStatus: 'READY' | 'FX_REQUESTED' | 'FX_COMPLETED' | 'ORDER_REQUESTED' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  fxStatus: 'REQUESTED' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  orderStatus: 'REQUESTED' | 'SENT' | 'PARTIAL_FILLED' | 'FILLED' | 'FAILED' | 'CANCELLED';
  failReason: string | null;
  startedAt: string;
  completedAt: string | null;
  updatedAt: string;
}

export interface OutboxEvent {
  outboxId: string;
  systemType: 'CARD' | 'INVST';
  sweepRequestId: string;
  eventType: 'SWEEP_REQUESTED' | 'AUTO_INVEST_COMPLETED' | 'AUTO_INVEST_FAILED' | 'SWEEP_INVESTMENT_COMPLETED' | 'SWEEP_INVESTMENT_FAILED';
  publishStatus: 'PENDING' | 'PUBLISHED' | 'FAILED' | 'RETRYING';
  retryCount: number;
  lastErrorMessage: string | null;
  retryable?: boolean;
  retryDisabledReason?: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface InboxEvent {
  inboxId: string;
  systemType: 'CARD' | 'INVST';
  sweepRequestId: string;
  sourceEventId: string;
  eventType: 'SWEEP_REQUESTED' | 'AUTO_INVEST_COMPLETED' | 'AUTO_INVEST_FAILED';
  processStatus: 'RECEIVED' | 'PROCESSING' | 'PROCESSED' | 'FAILED';
  failReason: string | null;
  receivedAt: string;
  processedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

const tickers = ['QQQ', 'SPY', 'VOO', 'VTI', 'BND', 'AGG'];
const now = new Date();

// 투자 전환 요청 샘플 데이터
export const mockSweepRequests: SweepRequest[] = [
  {
    sweepRequestId: generateUUID(),
    userUuid: generateUUID(),
    baseMonth: '2026-05',
    pointAmount: 50000,
    krwAmount: 500000,
    etfId: generateUUID(),
    ticker: 'QQQ',
    requestStatus: 'COMPLETED',
    failReason: null,
    requestedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    sentAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000 + 5 * 60 * 1000).toISOString(),
    completedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString(),
    updatedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString(),
  },
  {
    sweepRequestId: generateUUID(),
    userUuid: generateUUID(),
    baseMonth: '2026-05',
    pointAmount: 75000,
    krwAmount: 750000,
    etfId: generateUUID(),
    ticker: 'SPY',
    requestStatus: 'FAILED',
    failReason: '증권망 연결 타임아웃 - 재처리 필요',
    requestedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    sentAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000 + 5 * 60 * 1000).toISOString(),
    completedAt: null,
    updatedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000 + 10 * 60 * 1000).toISOString(),
  },
  {
    sweepRequestId: generateUUID(),
    userUuid: generateUUID(),
    baseMonth: '2026-05',
    pointAmount: 30000,
    krwAmount: 300000,
    etfId: generateUUID(),
    ticker: 'VOO',
    requestStatus: 'PROCESSING',
    failReason: null,
    requestedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
    sentAt: new Date(now.getTime() - 2 * 60 * 60 * 1000 + 5 * 60 * 1000).toISOString(),
    completedAt: null,
    updatedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000 + 10 * 60 * 1000).toISOString(),
  },
  {
    sweepRequestId: generateUUID(),
    userUuid: generateUUID(),
    baseMonth: '2026-05',
    pointAmount: 100000,
    krwAmount: 1000000,
    etfId: generateUUID(),
    ticker: 'QQQ',
    requestStatus: 'CREATED',
    failReason: null,
    requestedAt: new Date(now.getTime() - 30 * 60 * 1000).toISOString(),
    sentAt: null,
    completedAt: null,
    updatedAt: new Date(now.getTime() - 30 * 60 * 1000).toISOString(),
  },
];

// 자동투자 실행 샘플 데이터
export const mockExecutions: Execution[] = [
  {
    executionId: generateUUID(),
    sweepRequestId: mockSweepRequests[0].sweepRequestId,
    userUuid: mockSweepRequests[0].userUuid,
    invstAccountUuid: generateUUID(),
    etfId: mockSweepRequests[0].etfId,
    ticker: 'QQQ',
    executionStatus: 'COMPLETED',
    fxStatus: 'COMPLETED',
    orderStatus: 'FILLED',
    failReason: null,
    startedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    completedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000).toISOString(),
    updatedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000).toISOString(),
  },
  {
    executionId: generateUUID(),
    sweepRequestId: mockSweepRequests[1].sweepRequestId,
    userUuid: mockSweepRequests[1].userUuid,
    invstAccountUuid: generateUUID(),
    etfId: mockSweepRequests[1].etfId,
    ticker: 'SPY',
    executionStatus: 'FAILED',
    fxStatus: 'FAILED',
    orderStatus: 'CANCELLED',
    failReason: '환전 API 오류: 잔액 부족',
    startedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    completedAt: null,
    updatedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000 + 15 * 60 * 1000).toISOString(),
  },
  {
    executionId: generateUUID(),
    sweepRequestId: mockSweepRequests[2].sweepRequestId,
    userUuid: mockSweepRequests[2].userUuid,
    invstAccountUuid: generateUUID(),
    etfId: mockSweepRequests[2].etfId,
    ticker: 'VOO',
    executionStatus: 'FX_COMPLETED',
    fxStatus: 'COMPLETED',
    orderStatus: 'REQUESTED',
    failReason: null,
    startedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
    completedAt: null,
    updatedAt: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString(),
  },
];

// Outbox 이벤트 샘플 데이터
export const mockOutboxEvents: OutboxEvent[] = [
  {
    outboxId: generateUUID(),
    systemType: 'CARD',
    sweepRequestId: mockSweepRequests[0].sweepRequestId,
    eventType: 'SWEEP_REQUESTED',
    publishStatus: 'PUBLISHED',
    retryCount: 0,
    lastErrorMessage: null,
    publishedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    outboxId: generateUUID(),
    systemType: 'INVST',
    sweepRequestId: mockSweepRequests[1].sweepRequestId,
    eventType: 'AUTO_INVEST_FAILED',
    publishStatus: 'FAILED',
    retryCount: 3,
    lastErrorMessage: '수신자 서버 응답 없음 (timeout)',
    publishedAt: null,
    createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(now.getTime() - 30 * 60 * 1000).toISOString(),
  },
  {
    outboxId: generateUUID(),
    systemType: 'INVST',
    sweepRequestId: mockSweepRequests[2].sweepRequestId,
    eventType: 'AUTO_INVEST_COMPLETED',
    publishStatus: 'RETRYING',
    retryCount: 1,
    lastErrorMessage: null,
    publishedAt: null,
    createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(now.getTime() - 5 * 60 * 1000).toISOString(),
  },
];

// Inbox 이벤트 샘플 데이터
export const mockInboxEvents: InboxEvent[] = [
  {
    inboxId: generateUUID(),
    systemType: 'CARD',
    sweepRequestId: mockSweepRequests[0].sweepRequestId,
    sourceEventId: generateUUID(),
    eventType: 'SWEEP_REQUESTED',
    processStatus: 'PROCESSED',
    failReason: null,
    receivedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    processedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000 + 2 * 60 * 1000).toISOString(),
    createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000 + 2 * 60 * 1000).toISOString(),
  },
  {
    inboxId: generateUUID(),
    systemType: 'INVST',
    sweepRequestId: mockSweepRequests[1].sweepRequestId,
    sourceEventId: generateUUID(),
    eventType: 'AUTO_INVEST_FAILED',
    processStatus: 'FAILED',
    failReason: '페이로드 검증 실패: 필수 필드 누락',
    receivedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    processedAt: null,
    createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000 + 5 * 60 * 1000).toISOString(),
  },
  {
    inboxId: generateUUID(),
    systemType: 'INVST',
    sweepRequestId: mockSweepRequests[2].sweepRequestId,
    sourceEventId: generateUUID(),
    eventType: 'AUTO_INVEST_COMPLETED',
    processStatus: 'PROCESSING',
    failReason: null,
    receivedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
    processedAt: null,
    createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString(),
  },
];

// 대시보드 홈 KPI 데이터
export const mockDashboardKPIs = {
  todaySweepRequests: 24,
  todayCompletedExecutions: 18,
  todayFailures: 3,
  outboxPublishFailures: 2,
  inboxProcessFailures: 1,
};
