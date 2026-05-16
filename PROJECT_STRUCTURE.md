# 자동투자 운영 관리 대시보드 - 프로젝트 구조

## 데이터 모델

### 1. 투자 전환 요청 (SweepRequest)
- **sweepRequestId**: UUID
- **userUuid**: UUID (마스킹: UUID만 표시)
- **baseMonth**: YYYY-MM
- **pointAmount**: 숫자
- **krwAmount**: 숫자
- **etfId**: UUID
- **ticker**: QQQ, SPY, VOO 등
- **requestStatus**: CREATED, SENT, PROCESSING, COMPLETED, FAILED
- **failReason**: 문자열 (말줄임 처리)
- **requestedAt, sentAt, completedAt, updatedAt**: ISO 8601

### 2. 자동투자 실행 (Execution)
- **executionId**: UUID
- **sweepRequestId**: UUID
- **userUuid**: UUID
- **invstAccountUuid**: UUID (마스킹)
- **etfId**: UUID
- **ticker**: 문자열
- **executionStatus**: READY, FX_REQUESTED, FX_COMPLETED, ORDER_REQUESTED, COMPLETED, FAILED, CANCELLED
- **fxStatus**: REQUESTED, PROCESSING, COMPLETED, FAILED, CANCELLED
- **orderStatus**: REQUESTED, SENT, PARTIAL_FILLED, FILLED, FAILED, CANCELLED
- **failReason**: 문자열
- **startedAt, completedAt, updatedAt**: ISO 8601

### 3. Outbox 이벤트
- **outboxId**: UUID
- **systemType**: CARD, INVST
- **sweepRequestId**: UUID
- **eventType**: SWEEP_REQUESTED, AUTO_INVEST_COMPLETED, AUTO_INVEST_FAILED
- **publishStatus**: PENDING, PUBLISHED, FAILED, RETRYING
- **retryCount**: 숫자
- **lastErrorMessage**: 문자열
- **publishedAt, createdAt, updatedAt**: ISO 8601

### 4. Inbox 이벤트
- **inboxId**: UUID
- **systemType**: CARD, INVST
- **sweepRequestId**: UUID
- **sourceEventId**: UUID
- **eventType**: SWEEP_REQUESTED, AUTO_INVEST_COMPLETED, AUTO_INVEST_FAILED
- **processStatus**: RECEIVED, PROCESSING, PROCESSED, FAILED
- **failReason**: 문자열
- **receivedAt, processedAt, createdAt, updatedAt**: ISO 8601

## 컴포넌트 구조

```
client/src/
├── pages/
│   ├── Dashboard.tsx              # 대시보드 홈
│   ├── SweepRequests.tsx           # 투자 전환 요청
│   ├── Executions.tsx              # 자동투자 실행 현황
│   ├── RetryManagement.tsx         # 자동투자 재처리
│   ├── OutboxEvents.tsx            # Outbox 이벤트
│   └── InboxEvents.tsx             # Inbox 이벤트
├── components/
│   ├── layout/
│   │   ├── Header.tsx              # 상단 헤더
│   │   ├── Sidebar.tsx             # 좌측 사이드바
│   │   └── DashboardLayout.tsx     # 메인 레이아웃
│   ├── common/
│   │   ├── KPICard.tsx             # KPI 요약 카드
│   │   ├── StatusBadge.tsx         # 상태 배지
│   │   ├── DataTable.tsx           # 데이터 테이블
│   │   ├── SearchFilter.tsx        # 검색/필터 영역
│   │   ├── DetailPanel.tsx         # 상세 사이드 패널
│   │   ├── RetryModal.tsx          # 재처리 모달
│   │   ├── JsonViewer.tsx          # JSON 페이로드 뷰어
│   │   └── Pagination.tsx          # 페이지네이션
│   └── charts/
│       ├── ExecutionStatusChart.tsx # 처리 상태 도넛 차트
│       ├── FailureTimelineChart.tsx # 시간대별 실패 라인 차트
│       └── EventStatusChart.tsx     # 이벤트 발행 상태 막대 차트
├── hooks/
│   ├── useTableState.ts            # 테이블 상태 관리
│   ├── useFilterState.ts           # 필터 상태 관리
│   └── useDateRange.ts             # 날짜 범위 관리
├── lib/
│   ├── mockData.ts                 # 샘플 데이터
│   ├── formatters.ts               # 포매팅 유틸
│   └── statusColors.ts             # 상태별 색상 매핑
└── contexts/
    └── FilterContext.tsx           # 필터 상태 컨텍스트
```

## 상태 색상 매핑

| 상태 | 색상 | 예시 |
|------|------|------|
| COMPLETED, PROCESSED, PUBLISHED | 초록 (#10B981) | 처리 완료 |
| FAILED | 빨강 (#EF4444) | 처리 실패 |
| PROCESSING, RETRYING, FX_REQUESTED, ORDER_REQUESTED | 파랑 (#3B82F6) | 처리 중 |
| CREATED, RECEIVED, PENDING, READY | 회색 (#9CA3AF) | 대기 |
| CANCELLED | 어두운 회색 (#6B7280) | 취소됨 |

## 페이지 흐름

1. **대시보드 홈** → 전체 운영 상태 요약
2. **투자 전환 요청** → 카드망 요청 관리
3. **자동투자 실행 현황** → 증권망 처리 상태
4. **자동투자 재처리** → 실패 건 재처리
5. **Outbox 이벤트** → 발행한 이벤트 추적
6. **Inbox 이벤트** → 수신한 이벤트 처리

## 설계 원칙

- **가독성 우선**: 테이블 가독성을 최우선으로 함
- **명확한 구분**: 카드망/증권망/systemType 구분이 명확함
- **민감정보 보호**: 계좌번호, 카드번호 원문 미표시 (UUID + 마스킹만)
- **실패 강조**: 실패 상태가 즉시 눈에 들어옴
- **실제 운영 시스템**: 랜딩페이지처럼 꾸미지 않음
