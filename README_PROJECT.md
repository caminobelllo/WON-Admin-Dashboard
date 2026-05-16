# 자동투자 운영 관리 대시보드

금융권 자동투자 시스템의 운영 상태를 실시간으로 모니터링하고 관리하는 어드민 대시보드입니다.

## 🎯 프로젝트 개요

이 프로젝트는 자동투자 플랫폼의 운영자가 다음을 효율적으로 관리할 수 있도록 설계되었습니다:

- **투자 전환 요청 관리**: 사용자의 투자 전환 요청 상태 추적
- **자동투자 실행 현황**: 환전→주문→체결 6단계 프로세스 모니터링
- **실패 건 재처리**: 실패한 자동투자를 단계별로 재처리
- **이벤트 추적**: Outbox/Inbox 이벤트의 발행 및 처리 상태 조회
- **실시간 대시보드**: 차트 기반 시각화 및 필터링

## 🏗️ 기술 스택

| 계층 | 기술 |
|------|------|
| **프레임워크** | React 19 + TypeScript |
| **스타일링** | Tailwind CSS 4 + shadcn/ui |
| **라우팅** | Wouter |
| **상태 관리** | React Context |
| **차트** | Recharts |
| **폼 관리** | React Hook Form |
| **UI 컴포넌트** | Radix UI |
| **번들러** | Vite |
| **패키지 매니저** | pnpm |

## 📋 주요 기능

### 1. 대시보드 홈
- **KPI 카드**: 5개 핵심 지표 실시간 표시
- **차트**:
  - 자동투자 처리 상태 도넛 차트 (클릭 필터링)
  - 시간대별 실패 건수 라인 차트
  - 이벤트 발행 상태 막대 차트
- **최근 실패 목록**: 자동투자, Outbox, Inbox 실패 건 3개 영역

### 2. 투자 전환 요청 (Sweep Requests)
- 상태별 필터링 (PENDING, COMPLETED, FAILED)
- 상세 정보 사이드 패널
- 재처리 요청 기능

### 3. 자동투자 실행 현황 (Executions)
- 6단계 Stepper 시각화
- 환전/주문/체결 상태 추적
- 실패 사유 상세 표시

### 4. 자동투자 재처리 (Retry Management)
- 실패 건 필터링
- 재처리 시작 단계 선택
- 멱등성 검증 안내

### 5. Outbox 이벤트 조회
- 시스템별 구분 (카드망/증권망)
- 발행 상태 추적
- JSON 페이로드 뷰어

### 6. Inbox 이벤트 조회
- 수신 이벤트 처리 상태 추적
- 원천 이벤트 ID 매핑
- 실패 사유 상세 표시

## 🎨 디자인 철학

**Minimal Financial Dashboard** 스타일:
- **배경**: #F7F8FA (눈 피로 최소화)
- **메인 컬러**: 네이비/딥블루 (#1F2937)
- **상태 색상**: 초록(성공), 빨강(실패), 파랑(처리중), 회색(대기)
- **강조**: 과한 그라데이션, 아이콘, 장식 최소화
- **테이블**: 가독성 최우선, 명확한 행 구분

## 🔐 보안 특징

- 민감 정보 마스킹 (UUID, 계좌번호 등)
- 환경 변수 기반 설정 관리
- 타입스크립트 타입 안정성
- 모든 API 키는 `.env.local`에서 관리

## 🚀 시작하기

### 1. 의존성 설치
```bash
pnpm install
```

### 2. 환경 변수 설정
```bash
# .env.local 파일 생성
cp .env.example .env.local

# 필요한 환경 변수 입력
VITE_FRONTEND_FORGE_API_KEY=your_key
VITE_FRONTEND_FORGE_API_URL=https://api.example.com
```

### 3. 개발 서버 실행
```bash
pnpm dev
```

### 4. 브라우저에서 접속
```
http://localhost:3000
```

## 📦 빌드 및 배포

### 프로덕션 빌드
```bash
pnpm build
```

### 빌드 결과 미리보기
```bash
pnpm preview
```

## 🧪 코드 품질

### 타입 체크
```bash
pnpm check
```

### 코드 포매팅
```bash
pnpm format
```

## 📁 프로젝트 구조

```
client/
├── src/
│   ├── pages/              # 페이지 컴포넌트
│   ├── components/         # 재사용 가능한 컴포넌트
│   │   ├── charts/        # 차트 컴포넌트
│   │   ├── common/        # 공통 컴포넌트
│   │   ├── layout/        # 레이아웃
│   │   └── ui/            # shadcn/ui
│   ├── contexts/          # React Context
│   ├── lib/               # 유틸리티 함수
│   ├── App.tsx            # 라우팅
│   ├── main.tsx           # 진입점
│   └── index.css          # 글로벌 스타일
├── index.html
└── public/
```

## 🔄 차트 필터링 기능

도넛 차트의 상태 영역을 클릭하면 하단 테이블이 해당 상태로 필터링됩니다:

1. **도넛 차트 클릭**: 특정 상태 영역 클릭
2. **범례 클릭**: 범례의 상태 항목 클릭
3. **필터 해제**: 같은 상태를 다시 클릭

## 📊 샘플 데이터

현재 프로젝트는 샘플 데이터를 사용합니다. 실제 API 연동은 다음 단계에서 진행됩니다:

```typescript
// client/src/lib/mockData.ts
export const mockExecutions = [...]
export const mockOutboxEvents = [...]
export const mockInboxEvents = [...]
```

## 🔗 API 연동 (향후)

백엔드 API 연동 시 다음 엔드포인트를 활용할 예정입니다:

```
GET  /api/sweep-requests           # 투자 전환 요청 목록
GET  /api/executions               # 자동투자 실행 현황
POST /api/executions/:id/retry     # 재처리 요청
GET  /api/outbox-events            # Outbox 이벤트
GET  /api/inbox-events             # Inbox 이벤트
```

## 📝 라이선스

MIT

## 👥 기여 가이드

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 지원

문제가 발생하면 GitHub Issues를 통해 보고해주세요.

## 🗺️ 로드맵

### Phase 1 (완료)
- ✅ 기본 대시보드 UI
- ✅ 3개 차트 구현
- ✅ 차트 필터링 기능
- ✅ 모든 페이지 UI

### Phase 2 (예정)
- [ ] 백엔드 API 연동
- [ ] 인증 시스템
- [ ] 실시간 데이터 업데이트

### Phase 3 (예정)
- [ ] 고급 필터링
- [ ] 데이터 내보내기
- [ ] 사용자 권한 관리

---

**마지막 업데이트**: 2026-05-16  
**프로젝트 버전**: 30ae8d40
