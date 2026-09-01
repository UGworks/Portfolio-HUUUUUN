# Portfolio-HUUUUUN — 다른 PC 작업 핸드오프

> SOYLAB Track B 지원용 포트폴리오. 이 문서만 따라하면 **데이터 동기화 → Cursor 작업 → 배포**까지 이어갈 수 있습니다.

---

## 1. 프로젝트 한 줄 요약

| 항목 | 값 |
|------|-----|
| GitHub | https://github.com/UGworks/Portfolio-HUUUUUN |
| 라이브 사이트 | https://ugworks.github.io/Portfolio-HUUUUUN/ |
| Track B 배너 URL | https://ugworks.github.io/Portfolio-HUUUUUN/soylab |
| 스택 | React 18 + Vite 5 + TypeScript + Tailwind + Framer Motion |
| 배포 | `main` 푸시 → GitHub Actions → GitHub Pages |
| GA4 측정 ID | `G-0GK9DRZDE7` |
| 용량 | 약 600MB+ (영상·썸네일 포함, Git clone 시간 다소 걸림) |

---

## 2. 다른 PC에서 처음 세팅 (데이터 동기화)

### 2-1. 필수 설치

- **Git**
- **Node.js 20+** (권장 24)
- **Cursor** (https://cursor.com)
- (선택) **GitHub CLI**: `brew install gh` → `gh auth login`

### 2-2. 저장소 클론 (권장 — 유일한 정본)

```bash
# 작업 폴더로 이동 후
git clone https://github.com/UGworks/Portfolio-HUUUUUN.git
cd Portfolio-HUUUUUN
```

> ZIP 다운로드보다 **clone**을 쓰세요. 영상·Git 이력이 모두 포함됩니다.

### 2-3. 의존성 설치 & 로컬 실행

```bash
npm install
npm run dev
```

브라우저: **http://localhost:5173/**  
Track B 배너: **http://localhost:5173/soylab**

배포와 동일한 빌드 확인:

```bash
npm run build
npm run preview
# → http://localhost:4173/Portfolio-HUUUUUN/
```

### 2-4. Cursor에서 열기

1. Cursor 실행
2. **File → Open Folder**
3. `Portfolio-HUUUUUN` 폴더 선택
4. 터미널에서 `npm run dev` (이미 실행 중이면 생략)

---

## 3. 일상 작업 — 동기화 루틴

### 시작할 때 (다른 PC / 다른 날)

```bash
cd Portfolio-HUUUUUN
git pull origin main
npm install          # package.json 바뀌었을 때만
npm run dev
```

### 작업 끝 — GitHub에 반영

```bash
git status
git add .
git commit -m "설명: 무엇을 왜 바꿨는지"
git push origin main
```

푸시 후 **1~2분** 뒤 라이브 반영:  
https://github.com/UGworks/Portfolio-HUUUUUN/actions

### 충돌 나면

```bash
git pull origin main   # 먼저 받기
# 충돌 파일 수동 수정 후
git add .
git commit -m "fix: merge conflict"
git push origin main
```

---

## 4. GitHub / 배포 설정 (이미 완료 — 재설정 불필요)

- **브랜치**: `main`
- **Pages**: GitHub Actions (`build_type: workflow`)
- **프로덕션 base path**: `/Portfolio-HUUUUUN/` (`vite.config.ts`)
- **워크플로**: `.github/workflows/deploy.yml`

다른 PC에서 **Pages를 다시 켤 필요 없음**. 푸시만 하면 배포됩니다.

---

## 5. Google Analytics (이미 완료)

| 항목 | 내용 |
|------|------|
| 스트림 URL | `https://ugworks.github.io/Portfolio-HUUUUUN/` |
| 측정 ID | `G-0GK9DRZDE7` |
| 코드 위치 | `index.html`, `src/analytics.ts` |

### 수집 중인 이벤트

| 이벤트 | 의미 |
|--------|------|
| `section_view` | PORTFOLIO / ABOUT 이동 |
| `menu_click` | 헤더 메뉴 클릭 |
| `project_view` | 작품 1초+ 조회 (제목·카테고리·선택 방식) |
| `project_leave` | 작품 체류 시간(초) |
| `video_start` / `video_progress` / `video_complete` | 영상 재생 |
| `resume_pdf_save` | 이력서 PDF 저장 |
| `click` | 전화·메일·LinkedIn·TVCF |
| `engagement_heartbeat` | 30초 단위 체류 |

GA에서 작품 제목 보려면: **관리 → 맞춤 정의 → 맞춤 측정기준**에 `project_title` 등록.

---

## 6. 폴더 구조 (Cursor에서 자주 건드리는 곳)

```
Portfolio-HUUUUUN/
├── src/
│   ├── App.tsx                 # 섹션 라우팅, 로딩, GA 연동
│   ├── main.tsx                # Router basename (Pages 경로)
│   ├── analytics.ts            # GA4 이벤트 전부
│   ├── data.ts                 # 작품·클라이언트 데이터 (대용량)
│   ├── schoolCopy.ts           # /soylab 등 경로별 배너 카피
│   ├── components/
│   │   ├── PortfolioLayout.tsx # 작품 휠/스와이프/클릭
│   │   ├── MainDisplay.tsx     # 메인 영상 재생
│   │   ├── ProjectSidebar.tsx  # 썸네일 사이드바
│   │   ├── ContactPage.tsx     # ABOUT(이력서) + PDF
│   │   ├── Header.tsx          # PORTFOLIO / ABOUT
│   │   ├── LoadingScreen.tsx   # 시작 로딩 (영상 3개 버퍼)
│   │   └── PasswordProtection.tsx  # ⚠️ 미사용 (파일만 남음)
│   ├── video/                  # .webm 영상 (~580MB)
│   └── IMG/                    # 썸네일
├── public/
│   └── 404.html                # SPA fallback (Pages 경로 포함)
├── vite.config.ts              # base: /Portfolio-HUUUUUN/ (production)
└── .github/workflows/deploy.yml
```

---

## 7. 현재 사이트 상태 (2026-08-11 기준)

- **비밀번호 화면 없음** — 바로 포트폴리오 진입
- **Study Plan** 섹션 제거됨
- **헤더**: PORTFOLIO / ABOUT (이력서는 ABOUT 탭)
- **이력서**: Track B 지원용 카피, 학력 제거, 이메일 `huuuuun.88@gmail.com`
- **시작 로딩**: Seonghun.Lee / Portfolio + 진행 바, 영상 3개 프리로드
- **CNAME(allgre.com) 제거** — GitHub Pages 전용

---

## 8. Cursor로 작업할 때 팁

1. **Agent에게 컨텍스트 주기**: 이 파일(`HANDOFF.md`) + 수정할 파일 경로
2. **로컬 확인**: `npm run dev` → http://localhost:5173
3. **배포 전 확인**: `npm run build` 에러 없는지
4. **커밋은 직접 요청할 때만** — Agent가 임의로 push하지 않도록
5. **대용량 영상**은 `src/video/` — Git push/pull 시간 오래 걸림 (정상)

### 자주 쓰는 Cursor 프롬프트 예시

```
HANDOFF.md 참고해서 Portfolio-HUUUUUN 작업해줘.
로컬 서버 켜고 [작업 내용] 수정 후 GitHub에 푸시해줘.
```

---

## 9. 트러블슈팅

| 증상 | 해결 |
|------|------|
| `localhost:5173` 안 열림 | `lsof -i :5173` → 프로세스 kill 후 `npm run dev` |
| Pages 하얀 화면 | `vite.config.ts`의 `base: '/Portfolio-HUUUUUN/'` 확인 |
| Actions 실패 (Node 경고) | `deploy.yml`은 v5/v7 사용 중 — 최신 main pull |
| GA에 `project_view` 안 보임 | 작품 1초+ 조회 필요 / 보고서 반영 24h 지연 |
| clone 느림 / 실패 | 네트워크 안정 후 재시도, shallow: `git clone --depth 1 ...` (이력 없음) |
| push 거부 | `gh auth login` 또는 GitHub PAT 설정 |

---

## 10. 계정·권한 체크리스트 (다른 PC)

- [ ] GitHub `UGworks` 계정 로그인 (`gh auth login` 또는 Git credential)
- [ ] `Portfolio-HUUUUUN` repo write 권한
- [ ] (선택) GA4 속성 접근 — https://analytics.google.com

---

## 11. 빠른 명령어 치트시트

```bash
# 동기화 + 실행
git pull && npm install && npm run dev

# 변경 푸시 + 배포
git add -A && git commit -m "메시지" && git push origin main

# 배포 상태
gh run list --repo UGworks/Portfolio-HUUUUUN --limit 3

# 로컬 포트 확인
lsof -i :5173
```

---

**정본은 GitHub `main` 브랜치입니다.** 다른 PC·Cursor·로컬 폴더는 항상 `git pull` / `git push`로 맞추세요.
