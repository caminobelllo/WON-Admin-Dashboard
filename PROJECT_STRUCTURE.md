# 🏗️ 자동투자 운영 관리 대시보드 - 프로젝트 구조

## 📊 데이터 모델

### 1. 투자 전환 요청 (SweepRequest)
- **sweepRequestId**: UUID
- **userUuid**: UUID (마스킹: UUID만 표시)
- **requestStatus**: CREATED, SENT, PROCESSING, COMPLETED, FAILED

### 2. 자동투자 실행 (Execution)
- **executionStatus**: READY, FX_REQUESTED, FX_COMPLETED, ORDER_REQUESTED, COMPLETED, FAILED, CANCELLED
- **fxStatus**: REQUESTED, PROCESSING, COMPLETED, FAILED, CANCELLED
- **orderStatus**: REQUESTED, SENT, PARTIAL_FILLED, FILLED, FAILED, CANCELLED

### 3. 시스템 이벤트 (Outbox / Inbox)
- **systemType**: CARD, INVST
- **publishStatus** / **processStatus**: PENDING, PUBLISHED, RECEIVED, PROCESSING, PROCESSED, FAILED 등

## 🎨 상태 색상 매핑

| 상태 | 색상 | 예시 |
|------|------|------|
| COMPLETED, PROCESSED, PUBLISHED | 초록 (#10B981) | 처리 완료 |
| FAILED | 빨강 (#EF4444) | 처리 실패 |
| PROCESSING, RETRYING, FX_REQUESTED | 파랑 (#3B82F6) | 처리 중 |
| CREATED, RECEIVED, PENDING, READY | 회색 (#9CA3AF) | 대기 |
| CANCELLED | 어두운 회색 (#6B7280) | 취소됨 |


## 📁 컴포넌트 구조
\`\`\`text
client/src/
├── pages/              # 대시보드 홈, 투자 전환 요청, 자동투자 실행 현황 등 페이지 컴포넌트
├── components/
│   ├── layout/         # Header, Sidebar, DashboardLayout
│   ├── common/         # KPICard, StatusBadge, DataTable, SearchFilter 등 공통 UI
│   └── charts/         # 도넛 차트, 라인 차트, 막대 차트 등 시각화
├── hooks/              # 테이블, 필터, 날짜 범위 상태 관리 커스텀 훅
├── lib/                # 샘플 데이터, 포매터, 상태 색상 매핑 유틸
└── contexts/           # 필터 상태 등 전역 컨텍스트
\`\`\`