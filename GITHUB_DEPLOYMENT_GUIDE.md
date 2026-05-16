# GitHub 배포 가이드

## 1️⃣ 최종 검토 완료 항목

### ✅ .gitignore 설정
- `node_modules/` - 의존성 제외
- `dist/`, `build/` - 빌드 결과물 제외
- `.env`, `.env.local` 등 환경 변수 파일 제외
- IDE 설정 파일 제외 (.vscode/, .idea/)
- OS 파일 제외 (.DS_Store, Thumbs.db)
- 로그 파일 제외 (*.log)
- `.webdev/` - Manus 웹개발 아티팩트 제외
- `client/public/__manus__/version.json` - 자동 생성 파일 제외

### ✅ 민감 정보 확인
- 하드코딩된 API 키, 비밀번호 없음
- 모든 환경 변수는 `import.meta.env.VITE_*` 형식으로 관리
- 실제 API 키는 `.env.local`에서 관리 (Git 제외)

### ✅ 코드 품질
- TypeScript 타입 체크: ✅ 통과
- 모든 컴포넌트 정상 작동
- 라우팅 설정 완료
- Context API를 통한 상태 관리 구현

---

## 2️⃣ GitHub 저장소 생성 및 푸시 순서

### Step 1: GitHub 저장소 생성
```bash
# GitHub CLI를 사용하여 비공개 저장소 생성
gh repo create auto-invest-admin-dashboard --private --source=. --remote=origin --push
```

**또는 수동으로 생성하는 경우:**
1. GitHub.com에서 새 저장소 생성 (비공개)
2. 저장소 이름: `auto-invest-admin-dashboard`
3. README 추가하지 않기 (로컬에 이미 있음)

### Step 2: 로컬 Git 초기화 및 설정
```bash
cd /home/ubuntu/auto-invest-admin-dashboard

# Git 초기화 (이미 되어있을 수 있음)
git init

# 사용자 정보 설정 (처음 사용하는 경우)
git config user.name "Your Name"
git config user.email "your.email@example.com"

# 전역 설정 (선택사항)
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### Step 3: 파일 스테이징 및 커밋
```bash
# 모든 파일 스테이징
git add .

# 커밋 메시지와 함께 커밋
git commit -m "Initial commit: Auto-invest admin dashboard with charts and filtering"
```

### Step 4: 원격 저장소 설정 및 푸시
```bash
# 원격 저장소 추가 (GitHub에서 제공하는 URL 사용)
git remote add origin https://github.com/YOUR_USERNAME/auto-invest-admin-dashboard.git

# 기본 브랜치를 main으로 설정
git branch -M main

# 원격 저장소로 푸시
git push -u origin main
```

---

## 3️⃣ 프로젝트 구조 및 주요 파일

```
auto-invest-admin-dashboard/
├── client/
│   ├── src/
│   │   ├── pages/              # 페이지 컴포넌트
│   │   │   ├── Dashboard.tsx   # 대시보드 (차트 필터링)
│   │   │   ├── SweepRequests.tsx
│   │   │   ├── Executions.tsx
│   │   │   ├── RetryManagement.tsx
│   │   │   ├── OutboxEvents.tsx
│   │   │   ├── InboxEvents.tsx
│   │   │   ├── ErrorLogs.tsx
│   │   │   └── Settings.tsx
│   │   ├── components/
│   │   │   ├── charts/         # 차트 컴포넌트
│   │   │   │   ├── ExecutionStatusChart.tsx
│   │   │   │   ├── FailureTimelineChart.tsx
│   │   │   │   └── EventStatusChart.tsx
│   │   │   ├── common/         # 공통 컴포넌트
│   │   │   │   ├── StatusBadge.tsx
│   │   │   │   └── KPICard.tsx
│   │   │   ├── layout/         # 레이아웃 컴포넌트
│   │   │   │   ├── Header.tsx
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   └── DashboardLayout.tsx
│   │   │   └── ui/             # shadcn/ui 컴포넌트
│   │   ├── contexts/           # React Context
│   │   │   ├── ThemeContext.tsx
│   │   │   └── ChartFilterContext.tsx
│   │   ├── lib/                # 유틸리티 함수
│   │   │   ├── mockData.ts
│   │   │   ├── formatters.ts
│   │   │   ├── chartData.ts
│   │   │   └── statusMapping.ts
│   │   ├── App.tsx             # 라우팅 설정
│   │   ├── main.tsx            # 진입점
│   │   └── index.css           # 글로벌 스타일
│   ├── index.html
│   └── public/
├── server/                      # 백엔드 플레이스홀더
├── shared/                      # 공유 타입
├── package.json
├── tsconfig.json
├── vite.config.ts
├── .gitignore
├── README.md
└── GITHUB_DEPLOYMENT_GUIDE.md   # 이 파일
```

---

## 4️⃣ 주요 기능 및 구현 사항

### 대시보드 (Dashboard)
- **5개 KPI 카드**: 금일 투자 전환 요청, 완료, 실패, Outbox/Inbox 실패
- **3개 차트**:
  - 자동투자 처리 상태 도넛 차트 (클릭 필터링 가능)
  - 시간대별 실패 건수 라인 차트
  - 이벤트 발행 상태 막대 차트
- **최근 실패 목록**: 자동투자, Outbox, Inbox 실패 건 표시

### 차트 필터링
- 도넛 차트의 상태 영역 또는 범례 클릭 시 필터 적용
- 같은 상태 재클릭 시 필터 해제
- 선택된 상태는 시각적으로 강조 표시

### 투자 전환 요청 (Sweep Requests)
- 상태별 필터링 (PENDING, COMPLETED, FAILED)
- 상세 정보 사이드 패널
- 재처리 요청 기능

### 자동투자 실행 현황 (Executions)
- 6단계 Stepper로 처리 흐름 시각화
- 환전/주문/체결 상태 추적
- 실패 사유 표시

### 재처리 관리 (Retry Management)
- 실패한 건만 필터링
- 재처리 시작 단계 선택
- 멱등성 검증 안내

### Outbox/Inbox 이벤트
- 시스템별 구분 (카드망/증권망)
- JSON 페이로드 뷰어
- 상세 정보 사이드 패널

---

## 5️⃣ 환경 변수 설정 (.env.local)

프로젝트 루트에 `.env.local` 파일 생성:

```env
# 이 파일은 Git에 커밋되지 않음 (.gitignore에 포함)
# 로컬 개발 환경에서만 사용

VITE_FRONTEND_FORGE_API_KEY=your_api_key_here
VITE_FRONTEND_FORGE_API_URL=https://api.example.com
VITE_OAUTH_PORTAL_URL=https://oauth.example.com
VITE_APP_ID=your_app_id
VITE_APP_TITLE=자동투자 운영 관리
VITE_APP_LOGO=https://example.com/logo.png
```

---

## 6️⃣ 개발 및 빌드 명령어

```bash
# 의존성 설치
pnpm install

# 개발 서버 실행
pnpm dev

# 타입 체크
pnpm check

# 코드 포매팅
pnpm format

# 프로덕션 빌드
pnpm build

# 빌드 결과 미리보기
pnpm preview
```

---

## 7️⃣ 향후 개선 사항

### 단기 (1-2주)
- [ ] 실제 백엔드 API 연동
- [ ] 인증 시스템 구현 (OAuth)
- [ ] 데이터 새로고침 기능 (폴링 또는 WebSocket)

### 중기 (1개월)
- [ ] 다중 필터 선택 (Shift+클릭)
- [ ] 필터 프리셋 저장 기능
- [ ] 대시보드 커스터마이징 (위젯 추가/제거)
- [ ] 데이터 내보내기 (CSV, Excel)

### 장기 (2개월+)
- [ ] 실시간 알림 시스템
- [ ] 고급 검색 및 필터링
- [ ] 사용자 권한 관리
- [ ] 감사 로그 (Audit Log)
- [ ] 다국어 지원

---

## 8️⃣ 트러블슈팅

### 푸시 실패 시
```bash
# 원격 저장소 상태 확인
git remote -v

# 원격 저장소 업데이트
git fetch origin

# 강제 푸시 (주의: 팀 환경에서는 피할 것)
git push -u origin main --force
```

### 커밋 히스토리 수정 필요 시
```bash
# 마지막 커밋 메시지 수정
git commit --amend -m "새로운 커밋 메시지"

# 마지막 커밋 되돌리기
git reset --soft HEAD~1
```

### .gitignore 적용 안 될 때
```bash
# 캐시 초기화 후 다시 커밋
git rm -r --cached .
git add .
git commit -m "Fix: gitignore 적용"
```

---

## 9️⃣ 보안 체크리스트

- ✅ 민감 정보 (.env, 키, 토큰) 제외됨
- ✅ node_modules 제외됨
- ✅ 빌드 결과물 제외됨
- ✅ IDE 설정 파일 제외됨
- ✅ 로그 파일 제외됨
- ✅ 모든 API 키는 환경 변수로 관리
- ✅ 타입스크립트 타입 체크 통과

---

## 🔟 추가 리소스

- [GitHub CLI 문서](https://cli.github.com/manual)
- [Git 공식 문서](https://git-scm.com/doc)
- [React 공식 문서](https://react.dev)
- [Tailwind CSS 문서](https://tailwindcss.com/docs)
- [shadcn/ui 컴포넌트](https://ui.shadcn.com)

---

**마지막 업데이트**: 2026-05-16
**프로젝트 버전**: 30ae8d40
