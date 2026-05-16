# 🎨 프론트엔드 개발 가이드라인

## 1. UI 및 스타일링 (shadcn/ui & Tailwind)
- **컴포넌트 재사용**: 상호작용이 필요한 UI는 가급적 `@/components/ui/*`(shadcn/ui)에서 가져와 사용합니다. 복붙 대신 재사용을 지향합니다.
- **디자인 토큰 유지**: 색상을 하드코딩하지 마세요.`client/src/index.css`에 정의된 CSS 변수(`bg-background`, `text-foreground` 등)를 활용해야 다크/라이트 테마가 일관되게 적용됩니다.
  - **규칙**: 배경색(\`bg-*\`)을 지정할 때는 반드시 대응하는 텍스트 색상(`text-*-foreground`)을 함께 지정하세요.
- **Tailwind 커스텀 유틸리티**:
  - `.container`: 자동으로 중앙 정렬 및 반응형 패딩을 제공합니다. (`mx-auto` 불필요)
  - `.flex`: 기본적으로 `min-width: 0`, `min-height: 0` 속성을 적용하여 flex 아이템의 넘침을 방지합니다.

## 2. React 상태 관리 최적화
- **렌더링 루프 방지**: 렌더링 단계에서 객체나 배열을 새로 생성하여 의존성 배열이나 쿼리 인자로 넘기지 마세요. 무한 재호출의 원인이 됩니다.
  ```tsx
  // ❌ Bad: 렌더링 시마다 새로운 배열 참조 생성
  const { data } = useQuery({ ids: [1, 2, 3] });
  
  // ✅ Good: 참조 안정화
  const ids = useMemo(() => [1, 2, 3], []);
  const { data } = useQuery({ ids });
  ```
 
- 상태 변경이나 네비게이션은 반드시 이벤트 핸들러나 `useEffect` 안에서 실행하세요.

## 3. 애니메이션 가이드
- **속도**: UI 애니메이션은 **300ms 이하**로 설정하여 빠릿한 느낌을 줍니다. (버튼 100~160ms, 모달 200~500ms)
- **Easing 함수**: 기본 `ease-in`은 둔탁한 느낌을 줍니다. 진입/진출 시 커스텀 easing(`cubic-bezier(0.23, 1, 0.32, 1)`)을 권장합니다.
- **성능**: 레이아웃을 다시 그리는 속성(width, height)보다 GPU 가속을 받는 `transform`과 `opacity` 위주로 애니메이션을 구현하세요.
- 요소가 나타날 때는 무(無)에서 나타나는 `scale(0)` 대신, `scale(0.95)`와 `opacity: 0` 조합을 시작점으로 잡는 것이 훨씬 자연스럽습니다.