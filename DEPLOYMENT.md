# 🚀 GitHub 배포 및 운영 가이드

## 1️⃣ 환경 변수 설정 (.env.local)
프로젝트 루트에 `.env.local` 파일을 생성하여 아래 값을 관리합니다. 이 파일은 Git에 커밋되지 않습니다.

```env
VITE_FRONTEND_FORGE_API_KEY=your_api_key_here
VITE_FRONTEND_FORGE_API_URL=https://api.example.com
VITE_OAUTH_PORTAL_URL=https://oauth.example.com
VITE_APP_ID=your_app_id
VITE_APP_TITLE=자동투자 운영 관리
VITE_APP_LOGO=https://example.com/logo.png
```


## 2️⃣ 개발 및 빌드 명령어
```bash
# 의존성 설치
pnpm install

# 개발 서버 실행
pnpm dev

# 타입 체크 (배포 전 필수)
pnpm check

# 프로덕션 빌드
pnpm build

# 빌드 결과 미리보기
pnpm preview
```


## 3️⃣ 보안 체크리스트
- ✅ 민감 정보 (.env, 키, 토큰) 제외됨
- ✅ node_modules 제외됨
- ✅ 빌드 결과물(dist/, build/) 제외됨
- ✅ 모든 API 키는 환경 변수로 관리
- ✅ 타입스크립트 타입 체크 통과

## 4️⃣ 트러블슈팅
**푸시 실패 시 (충돌 등)**
```bash
git fetch origin
git rebase origin/main
git push origin main
```

**.gitignore 적용 안 될 때 (캐시 삭제)**
```bash
git rm -r --cached .
git add .
git commit -m "Fix: gitignore 적용"
```