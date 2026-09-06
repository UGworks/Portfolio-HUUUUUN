import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  AnimatePresence,
  animate,
  motion,
  motionValue,
  useReducedMotion,
  type MotionValue,
  type TargetAndTransition,
  type Transition,
} from 'framer-motion';
import { createPortal } from 'react-dom';
import { info, projects } from '../data';
import { trackOutboundClick } from '../analytics';
import TvcfSheet from './TvcfSheet';
import previewLibratum from '../IMG/site-previews/libratum.webp';
import previewOpenexc from '../IMG/site-previews/openexc.webp';
import previewConcentrix from '../IMG/site-previews/concentrix.webp';
import previewVixen from '../IMG/site-previews/vixen.webp';
import previewSillok from '../IMG/site-previews/sillok.jpg';
import previewTufte from '../IMG/site-previews/tufte.webp';
import previewEyes from '../IMG/site-previews/eyes.webp';
import previewNarrative from '../IMG/site-previews/narrative.webp';
import previewData2vis from '../IMG/site-previews/data2vis.webp';
import previewLida from '../IMG/site-previews/lida.webp';

/** 마우스를 올리면 뜨는 미리보기.
    · 웹사이트: url(새 탭) + preview(캡처 이미지)
    · 포트폴리오 작품: video(자동 재생) 또는 preview(정지 이미지) + label(작품명) */
type SitePreview = {
  url?: string;
  preview?: string;
  video?: string;
  label?: string;
  /** false면 iframe 삽입을 막는 사이트 → 시트에 캡처 이미지를 띄운다 */
  embed?: boolean;
  /** 시트 제목 옆 꼬리표. 기본 '웹사이트' */
  kicker?: string;
};

/** 페이지 위 시트로 여는 내용. 컨텍스트로 어디서든 연다 */
type SheetContent = { url: string; title: string; kicker?: string; image?: string };
const OpenSheetContext = createContext<(content: SheetContent) => void>(() => {});

/** 사이트 링크는 새 탭 대신 시트로. 삽입이 막힌 곳은 캡처 이미지로 */
const useOpenSite = () => {
  const open = useContext(OpenSheetContext);
  return (site: SitePreview | undefined, title?: string, kicker?: string) => {
    if (!site?.url) return;
    trackOutboundClick(`sheet_${siteHost(site.url)}`, site.url);
    open({
      url: site.url,
      title: title ?? site.label ?? siteHost(site.url),
      kicker: kicker ?? site.kicker ?? '웹사이트',
      image: site.embed === false ? site.preview : undefined,
    });
  };
};

/** 포트폴리오 작품을 미리보기로. 영상이 있으면 영상, 없으면 썸네일 */
const projectPeek = (id: string): SitePreview | undefined => {
  const project = projects.find((item) => item.id === id);
  if (!project) return undefined;
  return { video: project.video, preview: project.thumbnail ?? project.image, label: project.title };
};

const SITE = {
  libratum: { url: 'https://libratuminvestment.com/', preview: previewLibratum, label: 'Libratum Investment' },
  openexc: { url: 'https://openexc.com/', preview: previewOpenexc, label: 'OpenExchange' },
  concentrix: { url: 'https://kr.concentrix.com/', preview: previewConcentrix, label: 'Concentrix Korea', embed: false },
  // http 전용 사이트: https로 배포된 페이지 안에서는 브라우저가 혼합 콘텐츠로 막는다 → 캡처로 대체
  vixen: { url: 'http://www.vixenvfxstudio.com/kr/', preview: previewVixen, label: 'VIXEN VFX Studio', embed: false },
  sillok: { url: 'https://www.riss.kr/link?id=T13413899', preview: previewSillok, label: '조선왕조실록 인물중심 데이터 시각화 (박진완 지도, 2014)', kicker: '참고 자료' },
  tufte: { url: 'https://www.edwardtufte.com/book/the-visual-display-of-quantitative-information/', preview: previewTufte, label: 'Tufte · The Visual Display of Quantitative Information', kicker: '참고 자료' },
  eyes: { url: 'https://ieeexplore.ieee.org/document/545307', preview: previewEyes, label: 'Shneiderman · The Eyes Have It', kicker: '참고 자료' },
  narrative: { url: 'https://idl.cs.washington.edu/papers/narrative/', preview: previewNarrative, label: 'Segel & Heer · Narrative Visualization', kicker: '참고 자료' },
  data2vis: { url: 'https://arxiv.org/abs/1804.03126', preview: previewData2vis, label: 'Data2Vis (arXiv)', embed: false, kicker: '참고 자료' },
  lida: { url: 'https://microsoft.github.io/lida/', preview: previewLida, label: 'LIDA · Microsoft', kicker: '참고 자료' },
} satisfies Record<string, SitePreview>;

const PROGRAM = '중앙대학교 첨단영상대학원 예술공학 전공 · 석사과정';
const PHONE = '010-2629-7954';
const EMAIL = 'huuuuun@cau.ac.kr';
/** 엔딩 화면 등 다른 곳에서도 같은 연락처를 쓴다 */
export const CONTACT = { phone: PHONE, email: EMAIL } as const;

/**
 * 목차. num이 있는 항목은 연구계획서 본문(순서가 의미를 갖는 논지),
 * num이 없는 항목은 기록(개요·경력·자격증)이라 번호 대신 점으로 표시한다.
 */
const CV_NAV = [
  { id: 'cv-intro', label: '개요', num: null },
  { id: 'cv-motivation', label: '진학 동기 및 배경', num: '01' },
  { id: 'cv-interests', label: '주요 연구 관심 분야', num: '02' },
  { id: 'cv-methodology', label: '연구 계획 및 방법론', num: '03' },
  { id: 'cv-outlook', label: '기대 효과 및 졸업 후 계획', num: '04' },
  { id: 'cv-experience', label: '경력', num: null },
  { id: 'cv-skills', label: '자격증 및 기술', num: null },
] as const;

type CvSectionId = (typeof CV_NAV)[number]['id'];

/** 학력. from = 입학, to = 졸업(재학 중이면 '현재'). 입학 연도를 모르면 졸업만 표시한다. */
const EDUCATION: { school: string; degree: string; from?: string; to: string; current?: boolean }[] = [
  {
    school: '중앙대학교 첨단영상대학원',
    degree: '예술공학 전공 · 석사과정',
    to: '현재',
    current: true,
  },
  {
    school: '숭실대학교 글로벌미래교육원',
    degree: '시각디자인학 학사',
    to: '2026.02',
  },
  {
    school: '한국폴리텍5대학',
    degree: '멀티미디어학과',
    to: '2009.02',
  },
];

const educationPeriod = (item: (typeof EDUCATION)[number]) =>
  item.from ? `${item.from} – ${item.to}` : item.current ? '2026 후반기 신입학' : `${item.to} 졸업`;

/**
 * 본문 블록. 통글 대신 소제목·명제·사실로 나눠 훑어 읽을 수 있게 한다.
 * 문장은 원문 그대로이며 재구성만 했다.
 */
/** 사실 한 줄. 문자열이거나, 미리보기 사이트가 붙은 객체 */
type FactItem = string | { text: string; site?: SitePreview };
const factText = (item: FactItem) => (typeof item === 'string' ? item : item.text);

type Block =
  | { kind: 'sub'; text: string }
  | { kind: 'quote'; text: string; source?: string }
  | { kind: 'facts'; items: FactItem[] }
  | { kind: 'p'; text: string };

const MOTIVATION_BLOCKS: Block[] = [
  { kind: 'sub', text: '실무 배경' },
  {
    kind: 'facts',
    items: [
      { text: '포스트프로덕션·웹 에이전시 실무 13년', site: SITE.vixen },
      { text: '현재 사모펀드(PEF) 운용사 리브라텀 파트너스 크리에이티브 디렉터', site: SITE.libratum },
      { text: '오픈익스체인지 등과 함께 IR 콘텐츠의 시각 시스템 총괄', site: SITE.openexc },
    ],
  },
  {
    kind: 'quote',
    text: '복잡한 텍스트 중심의 투심보고서,\n의사결정의 속도를 늦추는 정보 구조.\nAI 생성형 시각화로 이 병목을 푸는 것이\n본\u00A0연구의 출발점.',
    source: '현장에서 마주한 문제의식',
  },
  { kind: 'sub', text: '연구로 잇는 지점' },
  {
    kind: 'facts',
    items: [
      '목표: 텍스트 보고서를 AI 생성형 시각화로 재구성. 자본 시장의 의사결정 속도와 정확도를 높이는 시각 시스템',
      { text: '선행 연구 ① **정보 미학**: 박진완 「조선왕조실록 시각화」. 방대한 기록을 관계망으로 재구성', site: SITE.sillok },
      { text: '선행 연구 ② **시각화 이론**: Tufte 『The Visual Display of Quantitative Information』(1983), Shneiderman 「The Eyes Have It」(1996)', site: SITE.tufte },
      { text: '선행 연구 ③ **서사적 시각화**: Segel & Heer 「Narrative Visualization: Telling Stories with Data」(2010)', site: SITE.narrative },
      { text: '선행 연구 ④ **LLM 자동 시각화**: Data2Vis(2019) · Chat2VIS(2023) · LIDA(2023)', site: SITE.lida },
      '접점: 위 원리를 투심보고서에 적용. 비정형 텍스트를 시각 위계와 서사로 재편하는 금융 시각 언어 정립',
    ],
  },
];

const researchInterests = [
  {
    title: '금융 데이터의 시각 언어 변환 원리',
    body:
      '딜소싱·시장 데이터 같은 비정형 금융 정보를 형태·색·움직임·시간 구조로 옮기는 매핑 규칙 연구. 어떤 규칙이 의미를 잃지 않고 전달하는지 밝히고, 생성 시스템으로 구현해 재현 가능성 확보.',
  },
  {
    title: 'AI 기반 투자 판단 지원 시각화',
    body:
      '방대한 리포트와 기업 서사에서 핵심 신호를 가려내는 시각화 모델 연구. 리스크 신호와 서사의 방향을 AI가 읽어 시각 위계로 배치하고, 정보를 찾는 데 드는 인지 부담을 줄이는 방식 탐구.',
  },
  {
    title: '데이터 기반 인터랙티브 IR 모델',
    body:
      '발표자의 전달에 기대는 기존 IR 영상에서 벗어나, 실시간 스트리밍 안에서 데이터가 스스로 변하며 정보를 전하는 체계 설계. 공간 미디어로의 확장 가능성 검토.',
  },
];

const researchStages = [
  {
    step: '01',
    title: '이론 정립과 정보 미학 프레임워크 설계',
    body:
      '정량 데이터(재무제표·거시 지표)와 정성 데이터(뉴스레터·애널리스트 리포트)가 시각 기호로 바뀌는 방식 분석. 금융 정보 시각화의 미학적 기준 수립.',
  },
  {
    step: '02',
    title: 'AI 기반 생성형 시각화 시스템 구현',
    body:
      '수집한 데이터를 시각 서사로 자동 변환하는 프로토타입 개발. 데이터의 성격에 따라 화면 구성·색·움직임의 리듬을 맞추는 알고리즘 설계, 시각 균형과 정보 위계를 제어하는 방법 실험.',
  },
  {
    step: '03',
    title: '실무 그룹 대상 정량·정성 검증',
    body:
      '투자 운용·심사 실무자 대상 검증. 텍스트 리포트와 자동 생성 영상을 견주는 A/B 테스트로 정보 습득 속도와 정확도 측정, 전문가 인터뷰로 딜소싱 과정의 설득력·신뢰도 변화 확인.',
  },
];

const OUTLOOK_BLOCKS: Block[] = [
  { kind: 'sub', text: '기대 효과' },
  {
    kind: 'facts',
    items: [
      '예술공학으로 짓는 차세대 IR 시스템: 미적 완성도를 넘어 자본 시장의 정보 격차 완화',
      '투자 생태계의 투명성을 높이는 사회적 가치',
    ],
  },
  {
    kind: 'quote',
    text: '보조 도구를 넘어 의사결정의 핵심 인터페이스로.\n데이터 시각화의 위상 전환이 본\u00A0연구의 목표.',
    source: '연구의 목표',
  },
  { kind: 'sub', text: '졸업 후 계획' },
  {
    kind: 'facts',
    items: [
      '연구 성과를 바탕으로 PE 환경에 맞춘 B2B 시각화 솔루션 상용화',
      '보수적 금융 생태계와 예술공학을 잇는 융합 전문가로 활동',
      '데이터 시각화의 학문적 지평을 실물 경제로 확장',
    ],
  },
];

type ExperienceEntry = {
  company: string;
  role: string;
  period: string;
  from: number;
  to: number;
  current?: boolean;
  stints?: string[];
  items: FactItem[];
  /** 회사 웹사이트 — 마우스를 올리면 미리보기 카드, 회사명을 누르면 새 탭 */
  site?: SitePreview;
};

const experience: ExperienceEntry[] = [
  {
    company: '리브라텀 파트너스',
    role: '크리에이티브 디렉터',
    period: '2025.03 – 현재',
    from: 2025.17,
    to: 2026.75,
    current: true,
    site: SITE.libratum,
    items: [
      '글로벌 IR 콘텐츠의 시각 시스템 설계 및 통합 운영',
      '데이터·브랜드 내러티브를 영상 언어로 전환하는 제작 파이프라인 운영',
      '생성형 AI를 후반 공정에 연결하기 위한 실무 워크플로우 탐색',
    ],
  },
  {
    company: '오픈익스체인지',
    role: '아트 디렉터',
    site: SITE.openexc,
    period: '2023.09 – 2025.01',
    from: 2023.67,
    to: 2025.08,
    items: [
      '네이버·크래프톤·하나금융지주·휠라 등 라이브 실적발표 현장 감독',
      '실시간 IR 스트리밍 환경의 시각 디자인 시스템 운영 및 글로벌 금융 이벤트 시각 커뮤니케이션 총괄',
      '발표자 중심 포맷의 한계 분석 및 제작 구조 개선',
    ],
  },
  {
    company: '미디어파사드 프로젝트',
    role: '미디어 아티스트',
    period: '2022 – 현재',
    from: 2022,
    to: 2026.75,
    current: true,
    items: [
      { text: '아라온 테마파크 2025 / 다중 픽셀 피치 LED 패널 기반 공간 영상 시각 구조 최적화', site: projectPeek('59') },
      { text: '김해 가야테마파크 2024 / 입체 조형물 대상 프로젝션 매핑 콘텐츠 제작', site: projectPeek('67') },
      { text: '빛의 공간 2022·2023 / 대형 곡면 구조물 대상 관람 거리 기반 영상 설계 및 왜곡 보정', site: projectPeek('66') },
    ],
  },
  {
    company: '콘센트릭스 카탈리스트',
    role: '모션 콘텐츠 팀 리더',
    site: SITE.concentrix,
    period: '2020.02 – 2023.08',
    from: 2020.08,
    to: 2023.58,
    items: [
      'LG전자·삼성전자 글로벌 .com 페이지 콘텐츠 및 USP 영상 기획·제작',
      '디자인 팀 매니징 및 다국적 프로젝트 품질 일관성 유지',
      '69개국 글로벌 웹사이트 운영을 위한 webm/mp4/JSON 포맷 영상 소재 제작 총괄',
    ],
  },
  {
    company: '포스트프로덕션',
    role: '2D 테크니컬 디렉터 · 2D 아티스트',
    site: SITE.vixen,
    period: '2012.07 – 2019.11',
    from: 2012.5,
    to: 2019.83,
    stints: [
      '키스톤 플레이 (2015.09–2019.11)',
      '포스트포엠 (2014.10–2015.09)',
      '빅슨 스튜디오 (2012.07–2014.10)',
    ],
    items: [
      'TVCF·뮤직비디오·공익광고·바이럴 영상 등 100편 이상의 상업 영상 후반 작업 참여 및 2D 합성·이펙트 디렉팅',
      '대규모 미디어 캠페인용 고해상도 영상 소스 제작 및 브랜드 모션 그래픽 연출',
    ],
  },
];

const certifications = [
  { name: '투자자산운용사', year: '2026' },
  { name: '컬러리스트기사', year: '2025' },
  { name: '컬러리스트산업기사', year: '2025' },
  { name: '멀티미디어콘텐츠제작전문가', year: '2025' },
  { name: `ICA DaVinci${' '}Resolve 201`, year: '2024' },
];

const skillRows = [
  { label: '영상 후반', value: `After Effects, DaVinci${' '}Resolve, Flame, Premiere${' '}Pro` },
  { label: '3D · 생성형 AI', value: 'Blender, Midjourney, ComfyUI' },
  { label: '라이브 스트리밍', value: 'vMix, Tricaster, OBS를 통한 라이브 송출 경험' },
  { label: 'AI 파이프라인', value: '이미지·영상 생성형 AI를 후반 제작과 연결한 실무 파이프라인 설계' },
  { label: 'Vibe Coding', value: 'Cursor, Claude Code를 통한 웹 및 다양한 HTML 디자인 포맷 제작' },
];

/* ============================================================
   모션 — Apple의 Designing Fluid Interfaces 원칙을 이 스테이지에 옮긴다.
   · 고정 시간 이징 대신 스프링: 새 입력이 오면 목표만 바뀌고 움직임은 이어진다.
   · 입력 잠금 없음: 전환 중에도 휠·키·터치를 받고, 항상 '지금 화면 값'에서 출발한다.
   · 터치는 1:1 추적 → 손을 떼면 손가락 속도를 그대로 스프링에 넘긴다.
   · 감쇠비(damping)·응답(response)을 framer의 bounce·duration으로 맞춘다.
   ============================================================ */

/** 기본 UI 스프링 — 임계 감쇠(damping 1.0), 튀지 않고 안착 */
const SPRING_UI: Transition = { type: 'spring', bounce: 0, duration: 0.5 };
/** 관성 스프링 — 플릭(던지기)이 앞섰을 때만 살짝 넘쳤다 돌아온다(damping ≈ 0.8) */
const SPRING_MOMENTUM: Transition = { type: 'spring', bounce: 0.15, duration: 0.45 };
/** 페이드스루 — 클릭·휠·키보드 전환에서 나가는 슬라이드는 제자리에서 빠르게 사라지고 */
const FADE_OUT: Transition = { duration: 0.14, ease: 'easeOut' };
/** 들어오는 슬라이드는 그 직후 스프링으로 들어온다(겹침 없음) */
const SPRING_ENTER: Transition = { type: 'spring', bounce: 0, duration: 0.5, delay: 0.1 };
/** 동작 줄이기 — 이동 없이 짧은 크로스페이드 */
const FADE_REDUCED: Transition = { duration: 0.2, ease: 'easeOut' };

/** 클릭·휠·키보드로 넘길 때 슬라이드가 오가는 거리(px) — 페이드스루라 짧게 */
const ENTER_OFFSET = 32;
/** 드래그로 넘겼을 때 나가는 슬라이드가 손끝 너머로 더 이어가는 거리(px) */
const EXIT_TAIL = 48;
/** 드래그 방향을 확정하기 전 허용 오차(px) — 탭과 드래그를 가른다 */
const DRAG_HYSTERESIS = 10;
/** 이 속도(px/s) 이상이면 위치가 아니라 속도의 부호로 커밋을 판정한다 */
const FLICK_VELOCITY = 260;
/** 휠 한 제스처의 누적 임계치와, 제스처가 끝났다고 보는 이벤트 간격 */
const WHEEL_THRESHOLD = 40;
const WHEEL_GAP_MS = 160;
/** 모멘텀 투영 감속률 — 0.998이 일반 스크롤, 페이지 넘김은 더 짧게 */
const DECELERATION_RATE = 0.99;

/** 놓았을 때 관성이 어디까지 갈지 — Apple 샘플 코드의 지수 감쇠식 그대로 */
const project = (velocity: number, decelerationRate = DECELERATION_RATE) =>
  ((velocity / 1000) * decelerationRate) / (1 - decelerationRate);

/** 경계에서 딱 멈추지 않고 점점 무거워진다 — 끝이라는 걸 저항으로 알린다 */
const rubberband = (overshoot: number, dimension: number, constant = 0.55) =>
  (overshoot * dimension * constant) / (dimension + constant * Math.abs(overshoot));

/** 섹션 안쪽 스크롤이 그 방향으로 더 갈 수 있는지 */
const canScroll = (el: HTMLElement, dir: number) => {
  const max = el.scrollHeight - el.clientHeight;
  if (max <= 4) return false;
  return dir > 0 ? el.scrollTop < max - 1 : el.scrollTop > 1;
};

/** 커밋 거리 — 스테이지 높이에 비례하되 엄지 한 번에 닿는 범위로 묶는다 */
const commitDistanceFor = (stageHeight: number) =>
  Math.min(Math.max(stageHeight * 0.28, 120), 320);

/** 옆 슬라이드가 미리 비치는 거리 — 손가락보다 조금 느리게 따라와 깊이를 만든다 */
const peekTravelFor = (commitDistance: number) => commitDistance * 0.6;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

type LayerMotion = { y: MotionValue<number>; opacity: MotionValue<number> };

type Gesture = {
  id: number;
  startX: number;
  startY: number;
  /** 드래그로 확정된 지점 — 여기서부터 1:1로 따라간다(잡은 위치 존중) */
  grabY: number;
  mode: 'undecided' | 'drag' | 'native';
  dir: 1 | -1;
  history: { y: number; t: number }[];
  commit: number;
  peekIndex: number | null;
  scroller: HTMLElement | null;
  /** 움직이던 도중 잡았을 때의 값과 공식값의 차 — 진행도에 따라 흘려보낸다 */
  base: { active: { y: number; o: number }; peek: { y: number; o: number } };
};

/** 최근 100ms 표본으로 손가락 속도(px/s)를 구한다. 멈췄다 놓았으면 0 */
const velocityFrom = (history: { y: number; t: number }[], now: number) => {
  const last = history[history.length - 1];
  if (!last || now - last.t > 80) return 0;
  const recent = history.filter((s) => last.t - s.t <= 100);
  const first = recent[0];
  if (!first || last.t === first.t) return 0;
  return ((last.y - first.y) / (last.t - first.t)) * 1000;
};

/**
 * 본문은 '레일 표'로 편다 — 왼쪽 열은 소제목 레이블, 오른쪽 열은 내용.
 * 소제목(sub)이 행을 열고, 그 뒤의 사실·문단이 그 행에 들어간다.
 * 명제(quote)는 출처를 레이블로 삼는 한 행이다.
 * 마커는 행 사이의 가는 선 하나뿐이라 글머리 기호가 섞이지 않는다.
 */
type TableRow =
  | { kind: 'row'; label: string; content: Exclude<Block, { kind: 'sub' | 'quote' }>[] }
  | { kind: 'quote'; text: string; source?: string };

const groupBlocks = (blocks: Block[]): TableRow[] => {
  const rows: TableRow[] = [];
  let current: Extract<TableRow, { kind: 'row' }> | null = null;
  for (const block of blocks) {
    if (block.kind === 'sub') {
      current = { kind: 'row', label: block.text, content: [] };
      rows.push(current);
    } else if (block.kind === 'quote') {
      rows.push({ kind: 'quote', text: block.text, source: block.source });
      current = null;
    } else {
      if (!current) {
        current = { kind: 'row', label: '', content: [] };
        rows.push(current);
      }
      current.content.push(block);
    }
  }
  return rows;
};

const renderBlocks = (blocks: Block[]) => (
  <div className="cvx-table">
    {groupBlocks(blocks).map((row, index) =>
      row.kind === 'quote' ? (
        <div key={`quote-${index}`} className="cvx-row cvx-row--quote">
          <p className="cvx-rail-label">{row.source ?? ''}</p>
          <blockquote className="cvx-quote">{row.text}</blockquote>
        </div>
      ) : (
        <div key={`row-${index}`} className="cvx-row">
          <h3 className="cvx-rail-label">{row.label}</h3>
          <div className="cvx-cell">
            {row.content.map((block, j) =>
              block.kind === 'facts' ? (
                <ul key={`facts-${j}`} className="cvx-facts">
                  {block.items.map((item) => (
                    <FactRow key={factText(item)} item={item} />
                  ))}
                </ul>
              ) : (
                <p key={`p-${j}`} className="cvx-para">
                  {block.text}
                </p>
              ),
            )}
          </div>
        </div>
      ),
    )}
  </div>
);

const NUMBERED_TOTAL = String(CV_NAV.filter((item) => item.num).length).padStart(2, '0');

/** 표제 — 연구계획서 섹션은 위에 작은 색인(01 / 04), 아래에 제목, 오른쪽 끝까지 내려긋는 선.
    색인이 없는 섹션도 같은 높이의 빈 줄을 두어 제목 위치가 모든 섹션에서 같다. */
const SlideHead = ({ num, title }: { num: string | null; title: string }) => (
  <header className="cvx-head">
    <p className="cvx-head-kicker" aria-hidden={num ? undefined : true}>
      {num && (
        <>
          <span className="cvx-num">{num}</span>
          <span className="cvx-head-of" aria-hidden>
            /
          </span>
          <span className="cvx-num cvx-head-total">{NUMBERED_TOTAL}</span>
        </>
      )}
    </p>
    <h2 className="cvx-head-title">{title}</h2>
  </header>
);

const Slide = ({
  num,
  title,
  bodyClassName,
  children,
}: {
  num: string | null;
  title: string;
  bodyClassName?: string;
  children: ReactNode;
}) => (
  <section className="cvx-slide">
    <SlideHead num={num} title={title} />
    <div className={`cvx-body cvx-scroll${bodyClassName ? ` ${bodyClassName}` : ''}`}>{children}</div>
  </section>
);

/* ── 시각자료: 본문 오른쪽 열에 놓는 인라인 SVG ─────────────────────
   색은 CSS 토큰(--ink·--ink-3·--rule·--now)을 그대로 쓰고, 글꼴은 본문을 상속한다.
   화면 크기에 따라 SVG가 늘어나므로 viewBox 단위로만 그린다. */
/** '**굵게**' 표기를 <strong>으로. 그 외 마크업은 없다 */
const renderEmphasis = (text: string): ReactNode => {
  const parts = text.split(/\*\*(.+?)\*\*/g);
  if (parts.length === 1) return text;
  return parts.map((part, i) => (i % 2 === 1 ? <strong key={i}>{part}</strong> : part));
};

/* ── 웹 미리보기 팝업(공용) ─────────────────────────────────────
   마우스를 따라다니는 카드. 스테이지 레이어가 transform을 쓰므로 body에 포털로 그린다. */
const SITE_POP_W = 400;
const SITE_POP_H = 250 + 38;
const SITE_POP_GAP = 18;

const siteHost = (url: string) => url.replace(/^https?:\/\//, '').replace(/\/$/, '');

/* 커서 오른쪽 아래에 두되, 화면 밖으로 나가면 왼쪽·위로 뒤집는다 */
const placeSitePop = (pt: { x: number; y: number }) => {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  let left = pt.x + SITE_POP_GAP;
  let top = pt.y + SITE_POP_GAP;
  if (left + SITE_POP_W > vw - 12) left = pt.x - SITE_POP_GAP - SITE_POP_W;
  if (top + SITE_POP_H > vh - 12) top = Math.max(12, pt.y - SITE_POP_GAP - SITE_POP_H);
  return { left, top };
};

const useSitePeek = (site?: SitePreview) => {
  const [pointer, setPointer] = useState<{ x: number; y: number } | null>(null);
  const canHover = useRef(
    typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches,
  );

  const onMove = (e: React.PointerEvent) => {
    if (!site || !canHover.current || e.pointerType !== 'mouse') return;
    setPointer({ x: e.clientX, y: e.clientY });
  };
  const onLeave = () => setPointer(null);

  const handlers = site ? { onPointerEnter: onMove, onPointerMove: onMove, onPointerLeave: onLeave } : {};

  const popup =
    site &&
    createPortal(
      <AnimatePresence>
        {pointer && (
          <motion.div
            key="pop"
            className="cvx-site-pop"
            style={placeSitePop(pointer)}
            initial={{ opacity: 0, scale: 0.96, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.12 } }}
            transition={{ type: 'spring', bounce: 0, duration: 0.32 }}
            aria-hidden
          >
            {site.video ? (
              <video
                src={site.video}
                poster={site.preview}
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                className="cvx-site-pop-video"
              />
            ) : (
              <img src={site.preview} alt="" width={1280} height={800} draggable={false} />
            )}
            <div className="cvx-site-pop-bar">
              <span className="cvx-site-pop-host">{site.url ? siteHost(site.url) : site.label}</span>
              <span className="cvx-site-pop-hint">{site.url ? '클릭하면 새 탭에서 열림' : '포트폴리오 작품'}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>,
      document.body,
    );

  return { handlers, popup };
};

/** 사실 한 줄. 사이트가 붙어 있으면 미리보기 + 끝에 ↗ 링크 */
const FactRow = ({ item }: { item: FactItem }) => {
  const text = factText(item);
  const site = typeof item === 'string' ? undefined : item.site;
  const { handlers, popup } = useSitePeek(site);
  const openSite = useOpenSite();
  return (
    <li className={site ? 'has-site' : undefined} {...handlers}>
      {renderEmphasis(text)}
      {site?.url && (
        <a
          href={site.url}
          className="cvx-fact-link"
          aria-label={`${site.label ?? siteHost(site.url)} 열기`}
          aria-haspopup="dialog"
          onClick={(e) => {
            e.preventDefault();
            openSite(site);
          }}
        >
          ↗
        </a>
      )}
      {popup}
    </li>
  );
};

const FIG_INK = 'var(--ink)';
const FIG_MUTE = 'var(--ink-3)';
const FIG_RULE = 'var(--rule)';
const FIG_NOW = 'var(--now)';

/* ── 단계 순환 강조 ────────────────────────────────────────────
   그림의 단계를 일정 간격으로 하나씩 밝혀 흐름을 읽게 한다.
   동작 줄이기 설정이면 멈추고(-1) 모두 같은 톤으로 둔다. */
const STEP_MS = 1500;
const useStepCycle = (count: number, ms = STEP_MS) => {
  const reduced = useReducedMotion();
  const [step, setStep] = useState(0);
  useEffect(() => {
    if (reduced || count <= 1) return;
    const id = window.setInterval(() => setStep((v) => (v + 1) % count), ms);
    return () => window.clearInterval(id);
  }, [count, ms, reduced]);
  return reduced ? -1 : step;
};

/** 활성 단계 위에 켜지는 붉은 테두리와 옅은 채움. 상자와 같은 좌표·크기로 놓는다 */
const Glow = ({
  x,
  y,
  w,
  h,
  rx = 6,
  active,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  rx?: number;
  active: boolean;
}) => (
  <motion.g
    initial={false}
    animate={{ opacity: active ? 1 : 0 }}
    transition={{ duration: 0.45, ease: 'easeOut' }}
    style={{ pointerEvents: 'none' }}
  >
    <rect x={x} y={y} width={w} height={h} rx={rx} fill={FIG_NOW} fillOpacity={0.07} />
    <rect x={x} y={y} width={w} height={h} rx={rx} fill="none" stroke={FIG_NOW} strokeWidth={1.6} />
  </motion.g>
);

/** 그림 1 — 문제(텍스트 보고서) → 변환(AI 생성형 시각화) → 목적(의사결정) */
const PipelineFigure = () => {
  const step = useStepCycle(3);
  const node = (y: number, title: string, sub: string, icon: ReactNode, accent = false, active = false) => (
    <g transform={`translate(0 ${y})`}>
      <rect x="0.5" y="0.5" width="319" height="72" rx="8" fill="none" stroke={accent ? FIG_INK : FIG_RULE} strokeWidth={accent ? 1.5 : 1} />
      <Glow x={0.5} y={0.5} w={319} h={72} rx={8} active={active} />
      <g transform="translate(14 12)">{icon}</g>
      <text x="76" y="30" fontSize="13.5" fontWeight="600" fill={FIG_INK}>{title}</text>
      <text x="76" y="50" fontSize="11" fill={FIG_MUTE}>{sub}</text>
    </g>
  );
  const arrow = (y: number, label: string) => (
    <g transform={`translate(0 ${y})`}>
      <line x1="38" y1="0" x2="38" y2="30" stroke={FIG_NOW} strokeWidth="1.5" />
      <polygon points="33,24 43,24 38,31" fill={FIG_NOW} />
      <text x="56" y="19" fontSize="11.5" fontWeight="600" fill={FIG_NOW}>{label}</text>
    </g>
  );
  /* 촘촘한 텍스트 줄 = 읽기 부담 */
  const widths = [46, 40, 48, 34, 46, 42, 30, 44];
  const textIcon = (
    <g stroke={FIG_MUTE} strokeWidth="2" strokeLinecap="round">
      {widths.map((w, i) => (
        <line key={i} x1="0" y1={i * 6 + 3} x2={w} y2={i * 6 + 3} />
      ))}
    </g>
  );
  /* 막대 + 관계망 = 위계와 서사 */
  const bars: [number, number, number][] = [[0, 30, 18], [8, 20, 28], [16, 36, 12], [24, 12, 36]];
  const visIcon = (
    <g>
      {bars.map(([x, y, h]) => (
        <rect key={x} x={x} y={y} width="6" height={h} rx="1" fill={FIG_INK} />
      ))}
      <g stroke={FIG_NOW} strokeWidth="1.2" fill="var(--paper)">
        <line x1="36" y1="8" x2="48" y2="24" />
        <line x1="48" y1="24" x2="38" y2="40" />
        <line x1="36" y1="8" x2="38" y2="40" />
        <circle cx="36" cy="8" r="3" />
        <circle cx="48" cy="24" r="3" />
        <circle cx="38" cy="40" r="3" />
      </g>
    </g>
  );
  /* 과녁 = 판단 */
  const decideIcon = (
    <g fill="none" stroke={FIG_INK} strokeWidth="1.5">
      <circle cx="24" cy="24" r="22" stroke={FIG_RULE} />
      <circle cx="24" cy="24" r="14" />
      <circle cx="24" cy="24" r="4" fill={FIG_NOW} stroke="none" />
      <path d="M24 2 v8 M24 38 v8 M2 24 h8 M38 24 h8" />
    </g>
  );
  return (
    <svg viewBox="0 0 320 288" role="img" aria-label="연구 파이프라인: 텍스트 보고서에서 AI 생성형 시각화를 거쳐 의사결정으로">
      {node(0, '텍스트 중심 투심보고서', '비정형 · 고밀도 · 선형 읽기', textIcon, false, step === 0)}
      {arrow(74, 'AI 생성형 시각화')}
      {node(107, '시각 위계 · 데이터 서사', '형태 · 색 · 움직임 · 시간 구조', visIcon, true, step === 1)}
      {arrow(181, '판단 지원')}
      {node(214, '투자 의사결정', '속도 · 정확도 ↑ / 인지 부담 ↓', decideIcon, false, step === 2)}
    </svg>
  );
};

/** 그림 2 — 선행 연구 지형도. 가로 = 규칙·구조 ↔ 서사·미학, 세로 = 수동 설계 ↔ 자동 생성.
    비어 있던 사분면(서사 × 자동 생성)이 본 연구의 자리다. 상자에는 이름만 남긴다. */
const Quad = ({
  x,
  y,
  title,
  sub,
  accent = false,
  site,
  active = false,
}: {
  x: number;
  y: number;
  title: string;
  sub?: string;
  accent?: boolean;
  site?: SitePreview;
  active?: boolean;
}) => {
  const { handlers, popup } = useSitePeek(site);
  const openSite = useOpenSite();
  return (
    <>
    <g
      transform={`translate(${x} ${y})`}
      {...handlers}
      onClick={site?.url ? () => openSite(site) : undefined}
      style={site?.url ? { cursor: 'pointer' } : undefined}
    >
      <rect x="0.5" y="0.5" width="139" height="47" rx="8" fill={accent ? FIG_INK : 'none'} stroke={accent ? FIG_INK : FIG_RULE} />
      {sub ? (
        <>
          <text x="12" y="20" fontSize="12" fontWeight="600" fill={accent ? 'var(--paper)' : FIG_INK}>{title}</text>
          <text x="12" y="36" fontSize="10" fill={accent ? 'var(--paper)' : FIG_MUTE}>{sub}</text>
        </>
      ) : (
        <text x="12" y="28" fontSize="12" fontWeight="600" fill={accent ? 'var(--paper)' : FIG_INK}>{title}</text>
      )}
      {accent && <circle cx="125" cy="13" r="4" fill={FIG_NOW} />}
      <Glow x={0.5} y={0.5} w={139} h={47} rx={8} active={active} />
    </g>
    {popup}
    </>
  );
};

const LandscapeFigure = () => {
  const step = useStepCycle(4);
  return (
    <svg viewBox="0 0 320 138" role="img" aria-label="선행 연구 지형도: 규칙과 서사, 수동 설계와 자동 생성의 두 축에서 본 연구의 위치">
      <text x="102" y="11" fontSize="10" fill={FIG_MUTE} textAnchor="middle" letterSpacing="0.06em">규칙 · 구조</text>
      <text x="250" y="11" fontSize="10" fill={FIG_MUTE} textAnchor="middle" letterSpacing="0.06em">서사 · 미학</text>
      <text x="0" y="0" fontSize="10" fill={FIG_MUTE} textAnchor="middle" letterSpacing="0.06em" transform="translate(10 44) rotate(-90)">수동 설계</text>
      <text x="0" y="0" fontSize="10" fill={FIG_MUTE} textAnchor="middle" letterSpacing="0.06em" transform="translate(10 110) rotate(-90)">자동 생성</text>
      <g transform="translate(32 20)">
        <Quad x={0} y={0} title="정보 시각화 이론" site={SITE.eyes} active={step === 0} />
        <Quad x={148} y={0} title="정보 미학 · 서사" site={SITE.narrative} active={step === 1} />
        <Quad x={0} y={66} title="LLM 자동 시각화" site={SITE.data2vis} active={step === 2} />
        <Quad x={148} y={66} title="본 연구" sub="시각적 서사 × 자동 생성" accent active={step === 3} />
        <g fill="none" stroke={FIG_NOW} strokeWidth="1.2" strokeDasharray="3 3">
          <path d="M140 48 L148 66" />
          <path d="M218 48 L218 66" />
          <path d="M140 90 L148 90" />
        </g>
      </g>
    </svg>
  );
};


/** 그림 3 — 데이터 유형 → 시각 변수 매핑(이분 그래프) */
const MappingFigure = () => {
  const left = ['딜소싱', '시장 데이터', '리포트 서사'];
  const right = ['형태', '색', '움직임', '시간'];
  const ly = (i: number) => 22 + i * 30;
  const ry = (i: number) => 12 + i * 22;
  const edges: [number, number][] = [[0, 0], [0, 3], [1, 1], [1, 2], [2, 0], [2, 3]];
  const step = useStepCycle(edges.length, 1200);
  const [ha, hb] = edges[step < 0 ? 3 : step];
  const d = (a: number, b: number) => `M118 ${ly(a)} C 170 ${ly(a)}, 190 ${ry(b)}, 236 ${ry(b)}`;
  return (
    <svg viewBox="0 0 320 100" role="img" aria-label="비정형 금융 데이터를 형태·색·움직임·시간의 시각 변수로 옮기는 매핑 규칙">
      <g stroke={FIG_RULE} strokeWidth="1">
        {edges.map(([a, b]) => (
          <path key={`${a}-${b}`} d={d(a, b)} fill="none" />
        ))}
      </g>
      {/* 활성 간선: 왼쪽에서 오른쪽으로 그려진다 */}
      <motion.path
        key={`${ha}-${hb}`}
        d={d(ha, hb)}
        fill="none"
        stroke={FIG_NOW}
        strokeWidth="1.6"
        initial={step < 0 ? false : { pathLength: 0, opacity: 0.4 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.7, ease: 'easeInOut' }}
      />
      {left.map((t, i) => (
        <g key={t}>
          <rect x="0.5" y={ly(i) - 11} width="112" height="22" rx="4" fill="none" stroke={FIG_RULE} />
          <Glow x={0.5} y={ly(i) - 11} w={112} h={22} rx={4} active={i === ha} />
          <text x="12" y={ly(i) + 4} fontSize="11" fill={FIG_INK}>{t}</text>
          <circle cx="118" cy={ly(i)} r="2.5" fill={i === ha ? FIG_NOW : FIG_INK} />
        </g>
      ))}
      {right.map((t, i) => (
        <g key={t}>
          <circle cx="236" cy={ry(i)} r="2.5" fill={i === hb ? FIG_NOW : FIG_INK} />
          <text x="248" y={ry(i) + 4} fontSize="11" fontWeight={i === hb ? 600 : 400} fill={FIG_INK}>{t}</text>
        </g>
      ))}
      <text x="177" y="96" fontSize="9.5" fill={FIG_MUTE} textAnchor="middle" letterSpacing="0.06em">매핑 규칙</text>
    </svg>
  );
};

/** 그림 4 — 방대한 텍스트에서 신호를 가려 시각 위계로 배치 */
const SignalFigure = () => {
  const lines = [44, 40, 46, 30, 42, 38, 46, 34, 40, 28];
  const hot = new Set([2, 6]);
  const step = useStepCycle(3);
  return (
    <svg viewBox="0 0 320 100" role="img" aria-label="리포트 텍스트에서 AI가 핵심 신호를 가려내 시각 위계로 배치">
      <rect x="0.5" y="0.5" width="96" height="99" rx="6" fill="none" stroke={FIG_RULE} />
      <Glow x={0.5} y={0.5} w={96} h={99} rx={6} active={step === 0} />
      <g strokeWidth="2" strokeLinecap="round">
        {lines.map((w, i) => (
          <line key={i} x1="12" y1={12 + i * 8.5} x2={12 + w} y2={12 + i * 8.5} stroke={hot.has(i) ? FIG_NOW : FIG_RULE} />
        ))}
      </g>
      <g transform="translate(112 34)">
        <path d="M0 0 L40 0 L28 20 L28 34 L12 34 L12 20 Z" fill="none" stroke={FIG_INK} strokeWidth="1.2" strokeLinejoin="round" />
        <text x="20" y="-8" fontSize="9.5" fill={FIG_MUTE} textAnchor="middle" letterSpacing="0.06em">AI 선별</text>
        <Glow x={-8} y={-18} w={56} h={58} rx={6} active={step === 1} />
      </g>
      <line x1="156" y1="50" x2="176" y2="50" stroke={FIG_NOW} strokeWidth="1.5" />
      <polygon points="174,45 182,50 174,55" fill={FIG_NOW} />
      <g transform="translate(192 0)">
        <rect x="0.5" y="0.5" width="127" height="40" rx="4" fill={FIG_INK} />
        <Glow x={-6} y={-6} w={134} h={106} rx={6} active={step === 2} />
        <text x="10" y="18" fontSize="10.5" fontWeight="600" fill="var(--paper)">리스크 신호</text>
        <text x="10" y="32" fontSize="9" fill="var(--paper)">가장 크게 · 먼저</text>
        <rect x="0.5" y="48.5" width="80" height="22" rx="4" fill="none" stroke={FIG_INK} />
        <text x="10" y="63" fontSize="10" fill={FIG_INK}>서사의 방향</text>
        <rect x="0.5" y="78.5" width="48" height="16" rx="4" fill="none" stroke={FIG_RULE} />
        <text x="8" y="90" fontSize="9" fill={FIG_MUTE}>맥락</text>
        <text x="127" y="92" fontSize="9.5" fill={FIG_MUTE} textAnchor="end" letterSpacing="0.06em">시각 위계</text>
      </g>
    </svg>
  );
};

/** 그림 5 — 발표자 의존 IR → 데이터가 스스로 움직이는 실시간 IR */
const LiveIrFigure = () => {
  const step = useStepCycle(2, 1800);
  return (
  <svg viewBox="0 0 320 100" role="img" aria-label="실시간 스트리밍 안에서 데이터가 스스로 변하며 정보를 전하는 IR 모델">
    <g transform="translate(0 6)">
      <rect x="0.5" y="0.5" width="118" height="70" rx="6" fill="none" stroke={FIG_RULE} />
      <Glow x={0.5} y={0.5} w={118} h={70} rx={6} active={step === 0} />
      <circle cx="59" cy="26" r="10" fill="none" stroke={FIG_MUTE} strokeWidth="1.2" />
      <path d="M38 62 C 38 44, 80 44, 80 62" fill="none" stroke={FIG_MUTE} strokeWidth="1.2" />
      <text x="59" y="86" fontSize="9.5" fill={FIG_MUTE} textAnchor="middle" letterSpacing="0.06em">발표자 중심</text>
    </g>
    <line x1="134" y1="41" x2="154" y2="41" stroke={FIG_NOW} strokeWidth="1.5" />
    <polygon points="152,36 160,41 152,46" fill={FIG_NOW} />
    <g transform="translate(172 6)">
      <rect x="0.5" y="0.5" width="147" height="70" rx="6" fill="none" stroke={FIG_INK} strokeWidth="1.5" />
      <Glow x={0.5} y={0.5} w={147} h={70} rx={6} active={step === 1} />
      <polyline points="12,52 34,40 56,46 78,24 100,30 122,14 136,20" fill="none" stroke={FIG_INK} strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx="136" cy="20" r="3.5" fill={FIG_NOW} />
      <g stroke={FIG_RULE} strokeWidth="1">
        <line x1="12" y1="60" x2="136" y2="60" />
        {[12, 43, 74, 105, 136].map((x) => (
          <line key={x} x1={x} y1="60" x2={x} y2="64" />
        ))}
      </g>
      <circle cx="14" cy="14" r="3" fill={FIG_NOW} />
      <text x="22" y="17.5" fontSize="9" fontWeight="600" fill={FIG_NOW} letterSpacing="0.08em">LIVE</text>
      <text x="74" y="86" fontSize="9.5" fill={FIG_MUTE} textAnchor="middle" letterSpacing="0.06em">데이터 중심 · 실시간</text>
    </g>
  </svg>
  );
};

const InterestFigures = () => (
  <aside className="cvx-figures" aria-label="시각자료">
    <figure className="cvx-figure">
      <p className="cvx-figure-title">시각 변수 매핑</p>
      <MappingFigure />
    </figure>
    <figure className="cvx-figure">
      <p className="cvx-figure-title">신호 선별과 시각 위계</p>
      <SignalFigure />
    </figure>
    <figure className="cvx-figure">
      <p className="cvx-figure-title">실시간 IR 모델</p>
      <LiveIrFigure />
    </figure>
  </aside>
);

/** 그림 6 — 연구 로드맵: 입력(정량·정성) → 세 단계 → 산출물 */
const RoadmapFigure = () => {
  const step = useStepCycle(4);
  const stage = (y: number, num: string, title: string, out: string, accent = false, active = false) => (
    <g transform={`translate(0 ${y})`}>
      <rect x="0.5" y="0.5" width="319" height="52" rx="6" fill={accent ? FIG_INK : 'none'} stroke={accent ? FIG_INK : FIG_RULE} strokeWidth={accent ? 1.5 : 1} />
      <Glow x={0.5} y={0.5} w={319} h={52} rx={6} active={active} />
      <text x="14" y="32" fontSize="14" fontWeight="600" fill={accent ? 'var(--paper)' : FIG_NOW} letterSpacing="0.02em">{num}</text>
      <text x="48" y="22" fontSize="11.5" fontWeight="600" fill={accent ? 'var(--paper)' : FIG_INK}>{title}</text>
      <text x="48" y="40" fontSize="10" fill={accent ? 'var(--paper)' : FIG_MUTE}>{out}</text>
    </g>
  );
  const link = (y: number) => (
    <g transform={`translate(0 ${y})`}>
      <line x1="24" y1="0" x2="24" y2="14" stroke={FIG_NOW} strokeWidth="1.5" />
      <polygon points="19,10 29,10 24,16" fill={FIG_NOW} />
    </g>
  );
  return (
    <svg viewBox="0 0 320 252" role="img" aria-label="연구 로드맵: 정량·정성 데이터 입력, 이론 정립, 시스템 구현, 실무 검증">
      {/* 입력: 정량 + 정성 */}
      <g>
        <rect x="0.5" y="0.5" width="154" height="34" rx="6" fill="none" stroke={FIG_RULE} strokeDasharray="3 3" />
        <text x="12" y="15" fontSize="10.5" fontWeight="600" fill={FIG_INK}>정량 데이터</text>
        <text x="12" y="28" fontSize="9.5" fill={FIG_MUTE}>재무제표 · 거시 지표</text>
        <rect x="165.5" y="0.5" width="154" height="34" rx="6" fill="none" stroke={FIG_RULE} strokeDasharray="3 3" />
        <text x="177" y="15" fontSize="10.5" fontWeight="600" fill={FIG_INK}>정성 데이터</text>
        <text x="177" y="28" fontSize="9.5" fill={FIG_MUTE}>뉴스레터 · 애널리스트 리포트</text>
        <path d="M77 35 L77 42 L243 42 L243 35" fill="none" stroke={FIG_RULE} />
        <line x1="160" y1="42" x2="160" y2="52" stroke={FIG_NOW} strokeWidth="1.5" />
        <polygon points="155,48 165,48 160,54" fill={FIG_NOW} />
        <Glow x={0.5} y={0.5} w={154} h={34} rx={6} active={step === 0} />
        <Glow x={165.5} y={0.5} w={154} h={34} rx={6} active={step === 0} />
      </g>
      {stage(58, '01', '이론 정립 · 정보 미학 프레임워크', '산출: 데이터 → 시각 기호 변환 규칙, 미학적 기준', false, step === 1)}
      {link(111)}
      {stage(128, '02', 'AI 생성형 시각화 시스템 구현', '산출: 데이터 → 시각 서사 자동 변환 프로토타입', true, step === 2)}
      {link(181)}
      {stage(198, '03', '실무 그룹 대상 정량 · 정성 검증', '산출: 정보 습득 속도 · 정확도 · 신뢰도 변화', false, step === 3)}
    </svg>
  );
};

/** 그림 7 — 검증 설계: A/B 비교 + 전문가 인터뷰 → 측정 지표 */
const ValidationFigure = () => {
  const step = useStepCycle(3);
  return (
  <svg viewBox="0 0 320 132" role="img" aria-label="검증 설계: 텍스트 리포트와 자동 생성 영상을 견주는 A/B 테스트와 전문가 인터뷰">
    <text x="0" y="10" fontSize="9.5" fill={FIG_MUTE} letterSpacing="0.06em">투자 운용 · 심사 실무자</text>
    {/* A: 텍스트 리포트 */}
    <g transform="translate(0 18)">
      <rect x="0.5" y="0.5" width="92" height="56" rx="6" fill="none" stroke={FIG_RULE} />
      <Glow x={0.5} y={0.5} w={92} h={56} rx={6} active={step === 0} />
      <text x="10" y="16" fontSize="10.5" fontWeight="600" fill={FIG_INK}>A · 텍스트 리포트</text>
      <g stroke={FIG_RULE} strokeWidth="2" strokeLinecap="round">
        {[26, 33, 40, 47].map((y, i) => (
          <line key={y} x1="10" y1={y} x2={[70, 62, 74, 50][i]} y2={y} />
        ))}
      </g>
    </g>
    {/* B: 자동 생성 영상 */}
    <g transform="translate(0 84)">
      <rect x="0.5" y="0.5" width="92" height="46" rx="6" fill="none" stroke={FIG_INK} strokeWidth="1.5" />
      <Glow x={0.5} y={0.5} w={92} h={46} rx={6} active={step === 1} />
      <text x="10" y="16" fontSize="10.5" fontWeight="600" fill={FIG_INK}>B · 자동 생성 영상</text>
      <rect x="10" y="24" width="10" height="16" rx="1" fill={FIG_INK} />
      <rect x="24" y="30" width="10" height="10" rx="1" fill={FIG_INK} />
      <rect x="38" y="20" width="10" height="20" rx="1" fill={FIG_NOW} />
      <polyline points="54,38 62,30 70,33 78,24" fill="none" stroke={FIG_INK} strokeWidth="1.5" />
    </g>
    {/* 비교 화살표 */}
    <line x1="100" y1="46" x2="126" y2="70" stroke={FIG_NOW} strokeWidth="1.2" />
    <line x1="100" y1="107" x2="126" y2="80" stroke={FIG_NOW} strokeWidth="1.2" />
    <text x="112" y="80" fontSize="9" fill={FIG_NOW} textAnchor="middle" fontWeight="600">vs</text>
    {/* 지표 */}
    <g transform="translate(136 18)">
      <rect x="0.5" y="0.5" width="184" height="112" rx="6" fill="none" stroke={FIG_RULE} />
      <Glow x={0.5} y={0.5} w={184} h={112} rx={6} active={step === 2} />
      <text x="12" y="18" fontSize="9.5" fill={FIG_MUTE} letterSpacing="0.06em">측정 지표</text>
      {[
        ['정보 습득 속도', 0.82],
        ['정확도', 0.7],
        ['설득력 · 신뢰도', 0.58],
      ].map(([label, w], i) => (
        <g key={String(label)} transform={`translate(12 ${30 + i * 26})`}>
          <text x="0" y="9" fontSize="10.5" fill={FIG_INK}>{label}</text>
          <rect x="0" y="14" width="160" height="4" rx="2" fill={FIG_RULE} />
          <rect x="0" y="14" width={160 * Number(w)} height="4" rx="2" fill={i === 2 ? FIG_INK : FIG_NOW} />
        </g>
      ))}
    </g>
  </svg>
  );
};

/** 그림 8 — 기대 효과의 파급: 본 연구 → PE 실무 → 자본 시장 → 투자 생태계. 아래로 갈수록 넓어진다 */
const ImpactFigure = () => {
  const tiers: [number, string, string][] = [
    [116, '본 연구', '예술공학 × 금융'],
    [184, 'PE 실무 · B2B 시각화', '현장 적용'],
    [252, '자본 시장의 정보 격차 완화', '차세대 IR 시스템'],
    [320, '투자 생태계의 투명성', '사회적 가치'],
  ];
  const step = useStepCycle(tiers.length);
  return (
    <svg viewBox="0 0 320 224" role="img" aria-label="기대 효과의 파급: 본 연구에서 PE 실무, 자본 시장, 투자 생태계로 넓어진다">
      {tiers.map(([w, title, sub], i) => {
        const y = i * 60;
        const accent = i === 0;
        return (
          <g key={title} transform={`translate(0 ${y})`}>
            <rect x="0.5" y="0.5" width={w - 1} height="42" rx="6" fill={accent ? FIG_INK : 'none'} stroke={accent ? FIG_INK : FIG_RULE} />
            <Glow x={0.5} y={0.5} w={w - 1} h={42} rx={6} active={step === i} />
            <text x="14" y="19" fontSize="11" fontWeight="600" fill={accent ? 'var(--paper)' : FIG_INK}>{title}</text>
            <text x="14" y="33" fontSize="9.5" fill={accent ? 'var(--paper)' : FIG_MUTE}>{sub}</text>
            {i < tiers.length - 1 && (
              <g transform="translate(38 45)">
                <line x1="0" y1="0" x2="0" y2="8" stroke={FIG_NOW} strokeWidth="1.5" />
                <polygon points="-4,7 4,7 0,12" fill={FIG_NOW} />
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
};

/** 그림 9 — 졸업 후 계획: 연구 성과에서 세로 줄기를 타고 세 갈래로 뻗는다 */
const AfterFigure = () => {
  const items: [string, string][] = [
    ['B2B 시각화 솔루션 상용화', 'PE 환경 맞춤'],
    ['금융 × 예술공학 융합 전문가', '보수적 생태계와의 가교'],
    ['학문적 지평의 실물 경제 확장', '데이터 시각화 연구의 산업 적용'],
  ];
  const cy = (i: number) => 20 + i * 52;
  const step = useStepCycle(items.length + 1);
  return (
    <svg viewBox="0 -3 320 150" role="img" aria-label="졸업 후 계획: 연구 성과를 상용화, 융합 전문가 활동, 학문적 확장으로 잇는다">
      <rect x="0.5" y="47.5" width="96" height="50" rx="6" fill={FIG_INK} />
      <Glow x={0.5} y={47.5} w={96} h={50} rx={6} active={step === 0} />
      <text x="48" y="69" fontSize="11" fontWeight="600" fill="var(--paper)" textAnchor="middle">연구 성과</text>
      <text x="48" y="84" fontSize="9" fill="var(--paper)" textAnchor="middle">석사 과정</text>
      {/* 줄기: 상자 오른쪽에서 나와 세로로 서고, 각 갈래로 수평 가지 */}
      <g fill="none" stroke={FIG_NOW} strokeWidth="1.2">
        <line x1="97" y1="72" x2="112" y2="72" />
        <line x1="112" y1={cy(0)} x2="112" y2={cy(2)} />
        {items.map((_, i) => (
          <line key={i} x1="112" y1={cy(i)} x2="126" y2={cy(i)} />
        ))}
      </g>
      {items.map(([title, sub], i) => (
        <g key={title} transform={`translate(126 ${cy(i) - 20})`}>
          <circle cx="0" cy="20" r="2.5" fill={FIG_NOW} />
          <rect x="6.5" y="0.5" width="187" height="40" rx="6" fill="none" stroke={FIG_RULE} />
          <Glow x={6.5} y={0.5} w={187} h={40} rx={6} active={step === i + 1} />
          <text x="18" y="17" fontSize="10.5" fontWeight="600" fill={FIG_INK}>{title}</text>
          <text x="18" y="31" fontSize="9" fill={FIG_MUTE}>{sub}</text>
        </g>
      ))}
    </svg>
  );
};

const MethodologyFigures = () => (
  <aside className="cvx-figures" aria-label="시각자료">
    <figure className="cvx-figure">
      <p className="cvx-figure-title">연구 로드맵</p>
      <RoadmapFigure />
    </figure>
    <figure className="cvx-figure">
      <p className="cvx-figure-title">검증 설계</p>
      <ValidationFigure />
    </figure>
  </aside>
);

const OutlookFigures = () => (
  <aside className="cvx-figures" aria-label="시각자료">
    <figure className="cvx-figure">
      <p className="cvx-figure-title">기대 효과의 파급</p>
      <ImpactFigure />
    </figure>
    <figure className="cvx-figure">
      <p className="cvx-figure-title">졸업 후 계획</p>
      <AfterFigure />
    </figure>
  </aside>
);

const MotivationFigures = () => (
  <aside className="cvx-figures" aria-label="시각자료">
    <figure className="cvx-figure">
      <p className="cvx-figure-title">연구 파이프라인</p>
      <PipelineFigure />
    </figure>
    <figure className="cvx-figure">
      <p className="cvx-figure-title">선행 연구 지형도</p>
      <LandscapeFigure />
    </figure>
  </aside>
);

/** 경력 한 칸. 사이트가 있으면 마우스를 따라다니는 웹 미리보기 카드를 띄운다. */
const JobCard = ({ job }: { job: ExperienceEntry }) => {
  const site = job.site;
  const { handlers, popup } = useSitePeek(site);
  const openSite = useOpenSite();

  return (
    <article
      className={`cvx-row cvx-job${job.current ? ' is-now' : ''}${site ? ' has-site' : ''}`}
      {...handlers}
    >
      <p className="cvx-rail-label cvx-num cvx-job-period">{job.period}</p>
      <div className="cvx-cell">
        <header className="cvx-job-head">
          <h3 className="cvx-job-title">
            {site?.url ? (
              <a
                href={site.url}
                className="cvx-job-title-link"
                aria-haspopup="dialog"
                onClick={(e) => {
                  e.preventDefault();
                  openSite(site, job.company);
                }}
              >
                {job.company}
                <span className="cvx-job-title-arrow" aria-hidden>↗</span>
              </a>
            ) : (
              job.company
            )}
          </h3>
          <p className="cvx-job-role">{job.role}</p>
          {job.stints && <p className="cvx-job-stints">{job.stints.join('  ·  ')}</p>}
        </header>
        <ul className="cvx-facts">
          {job.items.map((item) => (
            <FactRow key={factText(item)} item={item} />
          ))}
        </ul>
      </div>
      {popup}
    </article>
  );
};

function renderSectionBody(id: CvSectionId, onOpenTvcf?: () => void): ReactNode {
  const meta = CV_NAV.find((item) => item.id === id);

  switch (id) {
    case 'cv-intro':
      return (
        <section className="cvx-slide cvx-slide--intro">
          <div className="cvx-body cvx-scroll">
            <div className="cvx-intro">
              {/* 눈썹(소속) → 표제(이름) → 부제(역할): 크기·굵기·행간을 한 세트로 */}
              <p className="cvx-intro-kicker">
                <i className="cvx-dot cvx-dot--now" aria-hidden />
                <span>중앙대학교 첨단영상대학원</span>
                <span className="cvx-intro-sep" aria-hidden>·</span>
                <span>예술공학 전공 · 석사과정</span>
              </p>
              <h1 className="cvx-intro-name">이성훈</h1>
              <p className="cvx-intro-role">
                Creative Director
                <span className="cvx-intro-sep" aria-hidden>/</span>
                Media Artist
              </p>
            </div>

            <div className="cvx-edu">
              <p className="cvx-rail-label">학력</p>
              <ul className="cvx-edu-list">
                {EDUCATION.map((item) => (
                  <li key={item.school} className={`cvx-edu-row cvx-rail-row${item.current ? ' is-now' : ''}`}>
                    <span className="cvx-rail-label cvx-num">{educationPeriod(item)}</span>
                    <span className="cvx-edu-main">
                      <span className="cvx-edu-school">{item.school}</span>
                      <span className="cvx-edu-degree">{item.degree}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="cvx-intro-contact">
              <a
                href={`tel:${PHONE.replace(/-/g, '')}`}
                className="cvx-num"
                onClick={() => trackOutboundClick('phone', `tel:${PHONE.replace(/-/g, '')}`)}
              >
                {PHONE}
              </a>
              <i className="cvx-dot cvx-dot--sep" aria-hidden />
              <a
                href={`mailto:${EMAIL}`}
                className="cvx-num"
                onClick={() => trackOutboundClick('email', `mailto:${EMAIL}`)}
              >
                {EMAIL}
              </a>
              {onOpenTvcf && (
                <>
                  <i className="cvx-dot cvx-dot--sep" aria-hidden />
                  <button type="button" className="cvx-inline-btn" onClick={onOpenTvcf} aria-haspopup="dialog">
                    TVCF-Site
                  </button>
                </>
              )}
            </div>
          </div>
        </section>
      );

    case 'cv-motivation':
      return (
        <Slide num={meta?.num ?? null} title="진학 동기 및 배경" bodyClassName="cvx-body--figure">
          {renderBlocks(MOTIVATION_BLOCKS)}
          <MotivationFigures />
        </Slide>
      );

    case 'cv-interests':
      return (
        <Slide num={meta?.num ?? null} title="주요 연구 관심 분야" bodyClassName="cvx-body--figure">
          <ul className="cvx-list">
            {researchInterests.map((item) => (
              <li key={item.title} className="cvx-list-row">
                <div className="cvx-list-rail">
                  <i className="cvx-dot" aria-hidden />
                </div>
                <div className="cvx-list-main">
                  <h3 className="cvx-list-title">{item.title}</h3>
                  <p className="cvx-list-body">{item.body}</p>
                </div>
              </li>
            ))}
          </ul>
          <InterestFigures />
        </Slide>
      );

    case 'cv-methodology':
      return (
        <Slide num={meta?.num ?? null} title="연구 계획 및 방법론" bodyClassName="cvx-body--figure">
          <ol className="cvx-list cvx-list--steps">
            {researchStages.map((stage) => (
              <li key={stage.step} className="cvx-list-row">
                <div className="cvx-list-rail">
                  <span className="cvx-step-num">{stage.step}</span>
                </div>
                <div className="cvx-list-main">
                  <h3 className="cvx-list-title">{stage.title}</h3>
                  <p className="cvx-list-body">{stage.body}</p>
                </div>
              </li>
            ))}
          </ol>
          <MethodologyFigures />
        </Slide>
      );

    case 'cv-outlook':
      return (
        <Slide num={meta?.num ?? null} title="기대 효과 및 졸업 후 계획" bodyClassName="cvx-body--figure">
          {renderBlocks(OUTLOOK_BLOCKS)}
          <OutlookFigures />
        </Slide>
      );

    case 'cv-experience':
      return (
        <Slide num={meta?.num ?? null} title="경력">
          {/* 레일 = 기간, 내용 = 회사·역할·한 일. 표와 같은 열 시스템 */}
          <div className="cvx-table cvx-jobs">
            {experience.map((job) => (
              <JobCard key={job.company} job={job} />
            ))}
          </div>
        </Slide>
      );

    case 'cv-skills':
      return (
        <Slide num={meta?.num ?? null} title="자격증 및 기술">
          {/* 두 그룹 모두 같은 레일 표: 왼쪽 = 연도·분류, 오른쪽 = 이름·값.
              값이 행의 반대편 끝으로 밀려나지 않고 레이블 옆에 붙는다. */}
          <div className="cvx-group">
            <p className="cvx-group-label">자격증</p>
            <ul className="cvx-table cvx-certs">
              {certifications.map((cert) => (
                <li key={cert.name} className="cvx-row cvx-row--tight">
                  <span className="cvx-rail-label cvx-num">{cert.year}</span>
                  <span className="cvx-cert-name">{cert.name}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="cvx-group">
            <p className="cvx-group-label">기술</p>
            <dl className="cvx-table cvx-spec-list">
              {skillRows.map((row) => (
                <div key={row.label} className="cvx-row cvx-row--tight">
                  <dt className="cvx-rail-label">{row.label}</dt>
                  <dd className="cvx-spec-value">{row.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </Slide>
      );

    default:
      return null;
  }
}

const ContactPage = () => {
  const phone = PHONE;
  const email = EMAIL;
  const portfolioUrl = info.socials?.website;
  const stageRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion() ?? false;

  /* 외부 링크는 페이지를 떠나지 않고 시트로 연다(TVCF 포함).
     닫힐 때 내용은 남겨 두어 나가는 애니메이션 동안 빈 시트가 되지 않게 한다 */
  const [sheet, setSheet] = useState<SheetContent | null>(null);
  const [tvcfOpen, setTvcfOpen] = useState(false);
  const tvcfOpenRef = useRef(false);
  tvcfOpenRef.current = tvcfOpen;
  const openSheet = useCallback((content: SheetContent) => {
    setSheet(content);
    setTvcfOpen(true);
  }, []);
  const openTvcf = useCallback(() => {
    if (!portfolioUrl) return;
    trackOutboundClick('tvcf_site', portfolioUrl);
    openSheet({ url: portfolioUrl, title: 'HUUUUU.N 포트폴리오', kicker: 'TVCF' });
  }, [portfolioUrl, openSheet]);
  const closeTvcf = useCallback(() => setTvcfOpen(false), []);

  /* 화면에 올라오는 슬라이드 = 활성 슬라이드 + (드래그 중이면) 옆에서 비치는 슬라이드.
     나가는 슬라이드는 AnimatePresence가 붙잡고 있다가 스프링이 안착하면 내린다. */
  const [activeIndex, setActiveIndex] = useState(0);
  const [peek, setPeek] = useState<{ index: number; dir: 1 | -1 } | null>(null);

  // 이벤트 핸들러는 한 번만 붙이고, 최신 상태는 ref로 읽는다
  const activeIndexRef = useRef(0);
  const gestureRef = useRef<Gesture | null>(null);
  /** 마지막 전환의 방향과 성격 — 새로 들어오는 슬라이드의 출발 위치·스프링을 정한다 */
  const navRef = useRef<{ dir: 1 | -1; flick: boolean; peekTravel: number; via: 'nav' | 'drag' }>({
    dir: 1,
    flick: false,
    peekTravel: 0,
    via: 'nav',
  });
  /** 퇴장 계획 — 슬라이드가 내려갈 때 '지금 값'에서 어디로 갈지. 있으면 아직 퇴장 중 */
  const exitPlanRef = useRef(new Map<CvSectionId, TargetAndTransition>());

  /* 슬라이드마다 자기 모션값(y, opacity)을 갖는다.
     드래그는 이 값을 직접 쓰고, 스프링은 이 값의 현재치·속도에서 출발한다. */
  const layerMotionRef = useRef(new Map<CvSectionId, LayerMotion>());
  const getMotion = useCallback((id: CvSectionId): LayerMotion => {
    let m = layerMotionRef.current.get(id);
    if (!m) {
      m = { y: motionValue(0), opacity: motionValue(1) };
      layerMotionRef.current.set(id, m);
    }
    return m;
  }, []);

  const activeSection = CV_NAV[activeIndex].id;

  /** 클릭·휠·키보드 전환. 잠금 없음 — 진행 중인 전환은 현재 값에서 방향만 바꾼다 */
  const navigate = useCallback(
    (nextIndex: number) => {
      const current = activeIndexRef.current;
      if (nextIndex < 0 || nextIndex >= CV_NAV.length || nextIndex === current) return;
      if (gestureRef.current?.mode === 'drag') return;

      const dir: 1 | -1 = nextIndex > current ? 1 : -1;
      const fromId = CV_NAV[current].id;
      const toId = CV_NAV[nextIndex].id;

      // 페이드스루: 나가는 슬라이드는 제자리에서 빠르게 사라지고,
      // 들어오는 슬라이드가 그 직후 같은 축을 따라 들어온다. 둘이 겹쳐 보이지 않는다.
      exitPlanRef.current.set(fromId, {
        opacity: 0,
        transition: reduceMotion ? FADE_REDUCED : FADE_OUT,
      });

      navRef.current = { ...navRef.current, dir, flick: false, via: 'nav' };
      const target = getMotion(toId);
      if (exitPlanRef.current.has(toId)) {
        // 퇴장 중이던 슬라이드로 되돌아감: 값을 초기화하지 않고 지금 위치에서 이어간다
        exitPlanRef.current.delete(toId);
        target.y.stop();
        target.opacity.stop();
      } else {
        target.y.set(reduceMotion ? 0 : dir * ENTER_OFFSET);
        target.opacity.set(0);
      }

      activeIndexRef.current = nextIndex;
      setActiveIndex(nextIndex);
      setPeek(null);
    },
    [getMotion, reduceMotion],
  );

  const goToSection = useCallback(
    (id: CvSectionId) => {
      const idx = CV_NAV.findIndex((item) => item.id === id);
      if (idx >= 0) navigate(idx);
    },
    [navigate],
  );

  /* 섹션 본문이 넘치는지 재서 스크롤 가장자리 효과에 알려 준다 */
  useLayoutEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const measure = () => {
      stage.querySelectorAll<HTMLElement>('.cvx-scroll').forEach((el) => {
        el.dataset.overflow = el.scrollHeight - el.clientHeight > 4 ? 'true' : 'false';
      });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(stage);
    return () => ro.disconnect();
  }, [activeIndex, peek]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const activeId = () => CV_NAV[activeIndexRef.current].id;
    const scrollerOf = (id: CvSectionId) =>
      stage.querySelector<HTMLElement>(`[data-cv-section="${id}"] .cvx-scroll`);

    /* ── 휠: 한 제스처에 한 번만 넘긴다. 잠금이 아니라 제스처 종료 감지 ──
       트랙패드 관성으로 이벤트가 이어지는 동안은 같은 제스처로 본다.
       섹션 안쪽에 스크롤 여지가 있으면 그쪽이 먼저고, 그 제스처로는 넘기지 않는다. */
    let wheelAcc = 0;
    let wheelLast = 0;
    let wheelSign = 0;
    let wheelConsumed = false;
    let wheelScrolledInner = false;

    const onWheel = (event: WheelEvent) => {
      const now = event.timeStamp;
      const delta =
        event.deltaMode === 1
          ? event.deltaY * 16
          : event.deltaMode === 2
            ? event.deltaY * stage.clientHeight
            : event.deltaY;
      const sign = Math.sign(delta);

      const newGesture =
        now - wheelLast > WHEEL_GAP_MS || (sign !== 0 && wheelSign !== 0 && sign !== wheelSign);
      if (newGesture) {
        wheelAcc = 0;
        wheelConsumed = false;
        wheelScrolledInner = false;
      }
      wheelLast = now;
      if (sign !== 0) wheelSign = sign;

      // 드래그 중이거나 이 제스처로 이미 넘겼으면, 남은 관성은 버린다(새 섹션 안쪽으로 새지 않게)
      if (gestureRef.current?.mode === 'drag' || wheelConsumed) {
        event.preventDefault();
        return;
      }

      const scroller = scrollerOf(activeId());
      if (scroller && sign !== 0 && canScroll(scroller, sign)) {
        wheelScrolledInner = true;
        wheelAcc = 0;
        return; // 네이티브 스크롤에 맡긴다
      }

      event.preventDefault();
      if (wheelConsumed || wheelScrolledInner || sign === 0) return;

      wheelAcc += delta;
      if (Math.abs(wheelAcc) >= WHEEL_THRESHOLD) {
        wheelConsumed = true;
        wheelAcc = 0;
        navigate(activeIndexRef.current + (sign > 0 ? 1 : -1));
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (tvcfOpenRef.current) return; // 시트가 열려 있으면 뒤의 섹션은 움직이지 않는다
      if (event.key === 'ArrowDown' || event.key === 'PageDown') {
        event.preventDefault();
        navigate(activeIndexRef.current + 1);
      } else if (event.key === 'ArrowUp' || event.key === 'PageUp') {
        event.preventDefault();
        navigate(activeIndexRef.current - 1);
      }
    };

    /* ── 터치: 직접 조작 ──────────────────────────────────────────
       손가락과 슬라이드가 같이 움직인다. 놓는 순간의 속도를 스프링에 넘겨
       드래그와 애니메이션 사이에 이음새가 없게 한다. */
    let g: Gesture | null = null;

    const findTouch = (event: TouchEvent, id: number) => {
      for (let i = 0; i < event.changedTouches.length; i += 1) {
        const t = event.changedTouches[i];
        if (t.identifier === id) return t;
      }
      return null;
    };

    const setupPeek = (gesture: Gesture, dir: 1 | -1) => {
      const idx = activeIndexRef.current + dir;
      gesture.dir = dir;
      if (idx < 0 || idx >= CV_NAV.length) {
        gesture.peekIndex = null;
        setPeek(null);
        return;
      }
      const id = CV_NAV[idx].id;
      const m = getMotion(id);
      const travel = peekTravelFor(gesture.commit);
      m.y.stop();
      m.opacity.stop();
      if (exitPlanRef.current.has(id)) {
        // 퇴장 중이던 슬라이드를 다시 잡았다 — 지금 값에서 이어간다
        exitPlanRef.current.delete(id);
      } else {
        m.y.set(dir * travel);
        m.opacity.set(0);
      }
      gesture.base.peek = { y: m.y.get() - dir * travel, o: m.opacity.get() };
      gesture.peekIndex = idx;
      navRef.current = { ...navRef.current, dir, peekTravel: travel };
      setPeek({ index: idx, dir });
    };

    const beginDrag = (gesture: Gesture, touch: Touch, dir: 1 | -1, scroller: HTMLElement | null) => {
      gesture.mode = 'drag';
      gesture.grabY = touch.clientY;
      gesture.scroller = scroller;
      gesture.history = [{ y: touch.clientY, t: performance.now() }];
      // 드래그 동안 안쪽 스크롤은 잠시 멈춘다 — 손가락 하나에 움직이는 것은 하나
      if (scroller) scroller.style.overflowY = 'hidden';
      gestureRef.current = gesture;
      stage.dataset.dragging = 'true';

      // 움직이던 슬라이드를 잡으면 그 자리에서 멈춘다(항상 화면 값에서 출발)
      const active = getMotion(activeId());
      active.y.stop();
      active.opacity.stop();
      gesture.base.active = { y: active.y.get(), o: active.opacity.get() - 1 };
      setupPeek(gesture, dir);
    };

    const applyDrag = (gesture: Gesture, rawDragY: number) => {
      const stageH = stage.clientHeight;
      const active = getMotion(activeId());
      let dragY = rawDragY;

      if (gesture.peekIndex == null) {
        // 첫·끝 섹션 너머: 러버밴드 — 더 없다는 걸 저항으로 말한다
        active.y.set(rubberband(dragY, stageH));
        return;
      }

      // 손가락이 시작점을 지나 반대로 갔다: 되돌릴 이웃이 있으면 그쪽을 비추고, 없으면 제자리
      const sign: 1 | -1 = dragY < 0 ? 1 : -1;
      if (dragY !== 0 && sign !== gesture.dir) {
        const otherIdx = activeIndexRef.current + sign;
        const blocked =
          otherIdx < 0 ||
          otherIdx >= CV_NAV.length ||
          (gesture.scroller != null && canScroll(gesture.scroller, sign));
        if (blocked) {
          dragY = 0;
        } else {
          const oldId = CV_NAV[gesture.peekIndex].id;
          exitPlanRef.current.set(oldId, {
            y: gesture.dir * peekTravelFor(gesture.commit),
            opacity: 0,
            transition: SPRING_UI,
          });
          setupPeek(gesture, sign);
        }
      }

      const { dir, commit, base } = gesture;
      const peekM = getMotion(CV_NAV[gesture.peekIndex!].id);
      const travel = peekTravelFor(commit);
      const p = clamp01(Math.abs(dragY) / commit);
      const k = 1 - p; // 잡았을 때 남아 있던 오프셋을 진행도에 따라 녹인다
      const over = Math.max(Math.abs(dragY) - commit, 0);

      // 활성: 손가락과 1:1, 진행될수록 옅어진다
      active.y.set(dragY + base.active.y * k);
      active.opacity.set(clamp01(1 - 0.85 * p + base.active.o * k));

      // 비침: 조금 느리게 따라오며 짙어진다. 커밋 거리를 넘기면 러버밴드로 살짝만 더
      const peekY = dir * travel * (1 - p) - dir * rubberband(over, stageH, 0.4);
      peekM.y.set(peekY + base.peek.y * k);
      peekM.opacity.set(clamp01(p + base.peek.o * k));
    };

    const release = (gesture: Gesture, dragY: number, velocityY: number) => {
      const active = getMotion(activeId());
      const { dir, commit } = gesture;
      const flick = Math.abs(velocityY) >= FLICK_VELOCITY;

      if (gesture.peekIndex == null) {
        animate(active.y, 0, reduceMotion ? FADE_REDUCED : SPRING_UI);
        return;
      }

      // 플릭이면 속도의 부호가 결정하고, 아니면 관성이 닿을 지점으로 판정한다
      let shouldCommit: boolean;
      if (flick) {
        shouldCommit = dir === 1 ? velocityY < 0 : velocityY > 0;
      } else {
        const projected = dragY + project(velocityY);
        shouldCommit = Math.abs(projected) >= commit * 0.5 && Math.sign(projected) === -dir;
      }

      const fromId = activeId();
      const peekId = CV_NAV[gesture.peekIndex].id;

      if (shouldCommit) {
        const currentY = active.y.get();
        const exitY =
          dir === 1 ? Math.min(currentY - EXIT_TAIL, -commit) : Math.max(currentY + EXIT_TAIL, commit);
        exitPlanRef.current.set(
          fromId,
          reduceMotion
            ? { opacity: 0, transition: FADE_REDUCED }
            : { y: exitY, opacity: 0, transition: SPRING_UI },
        );
        exitPlanRef.current.delete(peekId);
        navRef.current = { ...navRef.current, dir, flick, via: 'drag' };
        activeIndexRef.current = gesture.peekIndex;
        setActiveIndex(gesture.peekIndex);
        setPeek(null);
      } else {
        exitPlanRef.current.set(peekId, {
          y: dir * peekTravelFor(commit),
          opacity: 0,
          transition: reduceMotion ? FADE_REDUCED : SPRING_UI,
        });
        setPeek(null);
        animate(active.y, 0, reduceMotion ? FADE_REDUCED : flick ? SPRING_MOMENTUM : SPRING_UI);
        animate(active.opacity, 1, reduceMotion ? FADE_REDUCED : SPRING_UI);
      }
    };

    const onTouchStart = (event: TouchEvent) => {
      if (g) return; // 두 번째 손가락은 무시
      const t = event.changedTouches[0];
      if (!t) return;
      g = {
        id: t.identifier,
        startX: t.clientX,
        startY: t.clientY,
        grabY: t.clientY,
        mode: 'undecided',
        dir: 1,
        history: [],
        commit: commitDistanceFor(stage.clientHeight),
        peekIndex: null,
        scroller: null,
        base: { active: { y: 0, o: 0 }, peek: { y: 0, o: 0 } },
      };
    };

    const onTouchMove = (event: TouchEvent) => {
      if (!g || g.mode === 'native') return;
      const t = findTouch(event, g.id);
      if (!t) return;

      if (g.mode === 'undecided') {
        const dx = t.clientX - g.startX;
        const dy = t.clientY - g.startY;
        if (Math.hypot(dx, dy) < DRAG_HYSTERESIS) return;
        if (Math.abs(dx) > Math.abs(dy)) {
          g.mode = 'native';
          return;
        }
        const dir: 1 | -1 = dy < 0 ? 1 : -1;
        const scroller = scrollerOf(activeId());
        if (scroller && canScroll(scroller, dir)) {
          g.mode = 'native'; // 안쪽에 스크롤 여지가 있으면 그쪽이 먼저
          return;
        }
        beginDrag(g, t, dir, scroller);
      }

      const now = performance.now();
      g.history.push({ y: t.clientY, t: now });
      while (g.history.length > 2 && now - g.history[0].t > 120) g.history.shift();
      applyDrag(g, t.clientY - g.grabY);
    };

    const endGesture = (event: TouchEvent, cancelled: boolean) => {
      if (!g) return;
      const t = findTouch(event, g.id);
      if (!t) return;
      const gesture = g;
      g = null;
      gestureRef.current = null;
      if (gesture.mode !== 'drag') return;

      delete stage.dataset.dragging;
      if (gesture.scroller) gesture.scroller.style.overflowY = '';

      const dragY = t.clientY - gesture.grabY;
      const velocityY = cancelled ? 0 : velocityFrom(gesture.history, performance.now());
      release(gesture, dragY, velocityY);
    };

    const onTouchEnd = (event: TouchEvent) => endGesture(event, false);
    const onTouchCancel = (event: TouchEvent) => endGesture(event, true);

    stage.addEventListener('wheel', onWheel, { passive: false });
    stage.addEventListener('touchstart', onTouchStart, { passive: true });
    stage.addEventListener('touchmove', onTouchMove, { passive: true });
    stage.addEventListener('touchend', onTouchEnd, { passive: true });
    stage.addEventListener('touchcancel', onTouchCancel, { passive: true });
    window.addEventListener('keydown', onKeyDown);

    return () => {
      stage.removeEventListener('wheel', onWheel);
      stage.removeEventListener('touchstart', onTouchStart);
      stage.removeEventListener('touchmove', onTouchMove);
      stage.removeEventListener('touchend', onTouchEnd);
      stage.removeEventListener('touchcancel', onTouchCancel);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [getMotion, navigate, reduceMotion]);

  /* 슬라이드 variants — 값은 렌더 시점이 아니라 애니메이션이 시작되는 순간 ref에서 읽는다.
     그래야 퇴장 중인 슬라이드도 마지막 렌더가 아니라 '지금' 계획대로 움직인다. */
  const variantsFor = (id: CvSectionId) => ({
    enter: () => ({
      y: reduceMotion ? 0 : navRef.current.dir * ENTER_OFFSET,
      opacity: 0,
    }),
    peek: () => ({ y: navRef.current.dir * navRef.current.peekTravel, opacity: 0 }),
    center: () => ({
      y: 0,
      opacity: 1,
      transition: reduceMotion
        ? FADE_REDUCED
        : navRef.current.via === 'nav'
          ? SPRING_ENTER // 나가는 슬라이드가 사라진 뒤에 들어온다
          : navRef.current.flick
            ? SPRING_MOMENTUM
            : SPRING_UI,
    }),
    exit: () =>
      exitPlanRef.current.get(id) ?? {
        opacity: 0,
        transition: reduceMotion ? FADE_REDUCED : SPRING_UI,
      },
  });

  const layers: { id: CvSectionId; role: 'active' | 'peek' }[] = [
    { id: activeSection, role: 'active' },
  ];
  if (peek) layers.push({ id: CV_NAV[peek.index].id, role: 'peek' });

  return (
    <OpenSheetContext.Provider value={openSheet}>
    <motion.div
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={reduceMotion ? FADE_REDUCED : { type: 'spring', bounce: 0, duration: 0.6 }}
      className="contact-page min-h-screen pt-[var(--layout-header-h)]"
    >
      <style>{`
        /* ============================================================
           점·선·면 — 이 소개서의 구조 언어
           점: 낱낱의 사실(항목, 자격, 시작점)      · 현재형은 --now
           선: 관계와 기간(경력 타임라인, 구획선)
           면: 본문이 비워 둔 여백 그 자체
           12칼럼 그리드 위에서 본문은 8칼럼까지만 차지해 여백을 남긴다.
           ============================================================ */
        .contact-print-only { display: none; }

        .contact-page {
          --paper: #ffffff;
          --ink: #101215;
          --ink-2: #5b626a;
          --ink-3: #949aa1;
          --rule: #e2e6ea;
          --now: #e4372b;

          /* Libratum Charts / 2-07. Coordinate Components (Figma)
             Line/2 보조 그리드라인 · Line/3 축선과 눈금 · Text/3 축 레이블.
             점선 리듬(4/4)과 눈금 대 레이블 비율(1:3)은 원본 그대로,
             크기만 이 문서의 발표용 스케일에 맞춰 파생한다. */
          --chart-line-2: #e5e6eb;
          --chart-line-3: #c9cdd4;
          --chart-text-3: #86909c;

          --s1: 0.5rem;
          --s2: 1rem;
          --s3: 1.5rem;
          --s4: 2rem;
          --s5: 2.5rem;
          --s6: 3rem;

          --layout-sidebar-w: 18rem;
          --layout-info-w: 21rem;
          --layout-meta: 1rem;
          --cv-mobile-nav-h: 3.25rem;

          background: var(--paper);
          color: var(--ink);
          /* 크기에 따라 글자꼴이 달라지는 서체면 그 광학 보정을 쓴다 */
          font-optical-sizing: auto;
        }

        @media (min-width: 1920px) {
          .contact-page { --layout-sidebar-w: 20rem; --layout-info-w: 23rem; --layout-meta: 1.0625rem; }
        }

        @media (min-width: 2560px) {
          .contact-page { --layout-sidebar-w: 22rem; --layout-info-w: 27rem; --layout-meta: 1.1875rem; }
        }

        /* ── 스테이지 ────────────────────────────────────────────── */
        .cv-stage-screen {
          block-size: calc(100vh - var(--layout-header-h));
        }

        @supports (block-size: 100dvh) {
          .cv-stage-screen { block-size: calc(100dvh - var(--layout-header-h)); }
        }

        /* 세로 팬은 브라우저에 맡기되(안쪽 스크롤), 끝에 닿으면 터치 이벤트로 슬라이드를 끈다.
           스테이지 밖으로 스크롤이 번지지 않게 막는다(당겨서 새로고침 포함). */
        .cv-stage-viewport {
          overflow: hidden;
          touch-action: pan-y;
          overscroll-behavior: none;
        }

        .cv-stage-viewport[data-dragging='true'] {
          user-select: none;
          -webkit-user-select: none;
        }

        .cv-stage-frame {
          position: relative;
          block-size: 100%;
          min-block-size: 0;
        }

        /* 슬라이드는 한 자리에 겹쳐 놓고 transform·opacity만 움직인다(컴포지터 전용 속성) */
        .cv-stage-layer {
          position: absolute;
          inset: 0;
          min-block-size: 0;
          will-change: transform, opacity;
        }

        /* 스테이지는 좌우 패널 사이에 끼어 있어 뷰포트가 아니라
           자신의 너비를 기준으로 반응해야 한다 → 컨테이너 쿼리 */
        .cv-stage-canvas {
          container-type: inline-size;
          container-name: cvstage;
          padding-block: clamp(1.75rem, 4cqi, 3.25rem) clamp(1.25rem, 2.5cqi, 2rem);
          padding-inline: clamp(1.25rem, 3.4cqi, 3rem);
        }

        /* ── 슬라이드 골격 ───────────────────────────────────────── */
        .cvx-slide {
          /* 발표용 모듈러 스케일 (배수 1.25).
             기준값 --t-base 하나만 조정하면 모든 단계가 같은 비율로 따라간다.
             스테이지 폭에 반응하므로 교실 스크린(QHD)에서는 자동으로 더 커진다. */
          --t-base: clamp(1rem, 1.6cqi, 1.35rem);

          --t-meta: calc(var(--t-base) * 0.8);      /* 1.25^-1 */
          --t-body: var(--t-base);                  /* 1.25^0  */
          --t-lead: calc(var(--t-base) * 1.25);     /* 1.25^1  */
          --t-title: calc(var(--t-base) * 1.953);   /* 1.25^3  */
          --t-display: calc(var(--t-base) * 3.815); /* 1.25^6  */

          --gutter: clamp(0.5rem, 1.4cqi, 1.25rem);

          display: grid;
          grid-template-columns: repeat(12, minmax(0, 1fr));
          grid-template-rows: auto minmax(0, 1fr);
          column-gap: var(--gutter);
          block-size: 100%;
          min-block-size: 0;
        }

        .cvx-slide--intro { grid-template-rows: minmax(0, 1fr); }

        .cvx-slide--intro .cvx-body {
          align-content: space-between;
          row-gap: var(--s4);
          padding-block-end: clamp(var(--s2), 2cqi, var(--s4));
        }

        .cvx-head {
          grid-column: 1 / -1;
          display: grid;
          row-gap: 0.55rem;
          padding-block-end: var(--s2);
          border-block-end: 1px solid var(--ink);
          margin-block-end: var(--space-head);
        }

        /* 색인: 제목 옆이 아니라 위에, 작은 글자로. 논지는 01 / 04, 기록은 점 */
        .cvx-head-kicker {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          margin: 0;
          min-block-size: 1em;
          font-size: var(--t-meta);
          font-weight: 500;
          letter-spacing: 0.06em;
          color: var(--ink-3);
        }

        .cvx-head-kicker .cvx-num { font-weight: 500; }
        .cvx-head-kicker .cvx-num:first-child { color: var(--ink); }
        .cvx-head-of { color: var(--chart-line-3); }

        .cvx-head-title {
          margin: 0;
          font-size: var(--t-title);
          font-weight: 700;
          letter-spacing: -0.025em;
          line-height: 1.2;
        }

        .cvx-body {
          grid-column: 1 / -1;
          display: grid;
          grid-template-columns: subgrid;
          align-content: start;
          row-gap: var(--space-block);
          min-block-size: 0;
          overflow-y: auto;
          overscroll-behavior: contain;
          scrollbar-gutter: stable;
        }

        /* 스크롤 가장자리 — 1px 구분선 대신, 본문이 넘칠 때만 그 끝을 살짝 흐린다.
           스크롤 위치에 따라 위·아래 흐림이 나타나고 사라진다(스크롤 타임라인). */
        @property --cvx-edge-top {
          syntax: '<length>';
          inherits: false;
          initial-value: 0px;
        }

        @property --cvx-edge-bottom {
          syntax: '<length>';
          inherits: false;
          initial-value: 0px;
        }

        @supports (animation-timeline: scroll()) {
          .cvx-scroll[data-overflow='true'] {
            mask-image: linear-gradient(
              to bottom,
              transparent,
              #000 var(--cvx-edge-top),
              #000 calc(100% - var(--cvx-edge-bottom)),
              transparent
            );
            animation: cvx-scroll-edge linear both;
            animation-timeline: scroll(self block);
          }

          @keyframes cvx-scroll-edge {
            0%   { --cvx-edge-top: 0px;   --cvx-edge-bottom: 2.5rem; }
            12%  { --cvx-edge-top: 2rem;  --cvx-edge-bottom: 2.5rem; }
            88%  { --cvx-edge-top: 2rem;  --cvx-edge-bottom: 2.5rem; }
            100% { --cvx-edge-top: 2rem;  --cvx-edge-bottom: 0px; }
          }
        }

        /* ── 점 ──────────────────────────────────────────────────── */
        .cvx-dot {
          flex: none;
          inline-size: 5px;
          block-size: 5px;
          border-radius: 50%;
          background: var(--ink);
          display: inline-block;
        }

        .cvx-dot--now { background: var(--now); }
        .cvx-dot--sep { background: var(--rule); }

        /* 국·영문 모두 프리텐다드. 수치는 자릿수만 고정해 표처럼 읽히게 한다. */
        .cvx-num {
          font-weight: 400;
          font-variant-numeric: tabular-nums;
          font-feature-settings: 'tnum' 1;
          letter-spacing: 0.01em;
        }

        .cvx-rail-label {
          margin: 0;
          font-size: var(--t-meta);
          font-weight: 400;
          letter-spacing: 0.06em;
          color: var(--ink-3);
          /* 레일이 좁아 두 줄로 접힐 때 어절 단위로, 두 줄 길이가 고르게 나뉜다
             ("실무에서 확인한 / 구조적 한계") */
          word-break: keep-all;
          overflow-wrap: break-word;
          text-wrap: balance;
          line-height: 1.4;
        }

        /* ── 개요 ────────────────────────────────────────────────── */
        .cvx-intro { grid-column: 1 / span 9; }

        /* 눈썹: 작은 글자는 자간을 벌리고 굵기로 또렷하게. 점은 '현재 소속' */
        .cvx-intro-kicker {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          column-gap: 0.55rem;
          row-gap: 0.2rem;
          margin: 0 0 var(--space-block);
          font-size: var(--t-meta);
          font-weight: 500;
          letter-spacing: 0.04em;
          line-height: 1.4;
          color: var(--ink-2);
          word-break: keep-all;
        }

        .cvx-intro-sep {
          color: var(--ink-3);
          font-weight: 300;
        }

        /* 표제: 커질수록 자간은 좁히고 행간은 1에 가깝게 */
        .cvx-intro-name {
          margin: 0;
          font-size: var(--t-display);
          font-weight: 700;
          line-height: 0.98;
          letter-spacing: -0.035em;
          font-optical-sizing: auto;
        }

        /* 부제: 굵기는 낮추고 크기는 본문보다 한 단계 위. 표제와 붙여 한 덩어리로 읽힌다 */
        .cvx-intro-role {
          display: flex;
          flex-wrap: wrap;
          align-items: baseline;
          column-gap: 0.5rem;
          margin: var(--s2) 0 0;
          font-size: calc(var(--t-lead) * 1.1);
          font-weight: 400;
          line-height: 1.3;
          letter-spacing: -0.01em;
          color: var(--ink-2);
        }

        .cvx-intro-role .cvx-intro-sep { font-size: 0.9em; }

        .cvx-edu {
          grid-column: 1 / span 10;
          display: grid;
          grid-template-columns: minmax(0, 1fr);
          gap: var(--space-item);
          padding-block-start: var(--space-block);
          border-block-start: 1px solid var(--ink);
        }

        .cvx-edu-list {
          margin: 0;
          padding: 0;
          list-style: none;
        }

        /* 학력 행: 레일 = 기간(입학 – 졸업), 내용 = 학교 · 학위 */
        .cvx-edu-row {
          padding-block: var(--space-row-tight);
          border-block-start: 1px solid var(--rule);
          font-size: var(--t-body);
        }

        .cvx-edu-row:first-child { border-block-start: 0; padding-block-start: 0; }
        .cvx-edu-row.is-now .cvx-rail-label { color: var(--now); }

        .cvx-edu-main {
          display: flex;
          flex-wrap: wrap;
          column-gap: var(--s2);
          row-gap: 0.1rem;
          min-inline-size: 0;
        }

        .cvx-edu-school { font-weight: 600; }
        .cvx-edu-degree { color: var(--ink-2); font-weight: 300; }

        .cvx-intro-contact {
          grid-column: 1 / span 10;
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: var(--s2);
          font-size: var(--t-meta);
        }

        .cvx-intro-contact a {
          color: var(--ink-2);
          text-decoration: none;
          transition: color 0.2s;
        }

        .cvx-intro-contact a:hover { color: var(--ink); }

        @media (min-width: 768px) {
          .cvx-intro-contact { display: none; }
        }

        /* ── 본문: 레일 표 ────────────────────────────────────────────
           모든 논지 섹션(01–04)이 같은 왼쪽 열 너비를 공유한다.
           왼쪽 = 레이블(소제목·출처·번호·점), 오른쪽 = 내용.
           행 사이의 가는 선이 유일한 마커다. */
        /* ── 간격 시스템 ─────────────────────────────────────────────
           모든 표·목록·행이 아래 토큰만 쓴다. 값은 여기서만 바꾼다.
           · 열: 레일(메타) 너비 하나, 열 사이 간격 하나, 본문 최대 폭 하나
           · 행: 행 안쪽 패딩(보통/촘촘), 항목 사이, 블록 사이, 표제 아래 */
        .cvx-slide {
          --rail-w: minmax(7rem, 11rem);
          --col-gap: var(--s3);
          --measure: 76ch;

          --space-row: clamp(var(--s2), 1.6cqi, var(--s3));
          --space-row-tight: 0.6rem;
          --space-item: 0.5rem;
          --space-block: clamp(var(--s3), 3cqi, var(--s5));
          --space-head: clamp(var(--s3), 3.4cqi, var(--s6));
        }

        /* 레일 행: 어느 표든 같은 두 열 */
        .cvx-rail-row {
          display: grid;
          grid-template-columns: var(--rail-w) minmax(0, 1fr);
          column-gap: var(--col-gap);
          align-items: baseline;
        }

        /* 국문은 어절 단위로 줄을 바꾼다 — 단어가 끊기면 읽는 리듬이 깨진다 */
        .cvx-para,
        .cvx-quote,
        .cvx-facts li,
        .cvx-list-body,
        .cvx-cert-name,
        .cvx-spec-value {
          word-break: keep-all;
          overflow-wrap: break-word;
          text-wrap: pretty;
        }

        .cvx-table {
          grid-column: 1 / span 10;
          display: grid;
          margin: 0;
          padding: 0;
          list-style: none;
        }

        .cvx-row {
          display: grid;
          grid-template-columns: var(--rail-w) minmax(0, 1fr);
          column-gap: var(--col-gap);
          align-items: start;
          padding-block: var(--space-row);
          border-block-start: 1px solid var(--rule);
        }

        .cvx-row:first-child { border-block-start: 0; padding-block-start: 0; }

        /* 한 줄짜리 행(자격증·기술): 촘촘한 패딩, 기준선 정렬 */
        .cvx-row--tight {
          align-items: baseline;
          padding-block: var(--space-row-tight);
        }

        .cvx-row--tight > .cvx-rail-label { padding-block-start: 0; }

        /* 그룹: 작은 제목 + 표. 그룹 사이는 블록 간격 */
        .cvx-group {
          grid-column: 1 / span 10;
          display: grid;
          row-gap: var(--space-item);
        }

        .cvx-group > .cvx-table { grid-column: auto; }

        .cvx-group-label {
          margin: 0;
          padding-block-end: var(--space-item);
          border-block-end: 1px solid var(--ink);
          font-size: var(--t-meta);
          font-weight: 600;
          letter-spacing: 0.04em;
          color: var(--ink);
        }

        /* 레이블은 내용 첫 줄과 같은 높이에 놓는다 */
        .cvx-row > .cvx-rail-label {
          padding-block-start: calc((var(--t-body) * 1.6 - var(--t-meta) * 1.4) / 2);
          line-height: 1.4;
        }

        .cvx-row--quote > .cvx-rail-label {
          padding-block-start: calc((var(--t-lead) * 1.55 - var(--t-meta) * 1.4) / 2);
        }

        /* ── 시각자료 열: 본문 8칸 + 그림 4칸 ───────────────────────── */
        .cvx-body--figure > .cvx-table,
        .cvx-body--figure > .cvx-list { grid-column: 1 / span 8; }

        .cvx-figures {
          grid-column: 9 / -1;
          display: grid;
          align-content: start;
          row-gap: var(--s5);
          padding-inline-start: var(--col-gap);
          border-inline-start: 1px solid var(--rule);
          /* 본문이 넘쳐 스크롤돼도 그림은 그 자리에 머문다 */
          position: sticky;
          inset-block-start: 0;
        }

        .cvx-figure {
          margin: 0;
          display: grid;
          row-gap: 0.75rem;
        }

        .cvx-figure svg {
          display: block;
          inline-size: 100%;
          block-size: auto;
          font-family: inherit;
        }

        .cvx-figure-title {
          margin: 0 0 0.25rem;
          padding-block-end: 0.45rem;
          border-block-end: 1px solid var(--rule);
          font-size: var(--t-meta);
          font-weight: 400;
          letter-spacing: 0.06em;
          line-height: 1.4;
          color: var(--ink-3);
        }

        .cvx-figcaption {
          font-size: var(--t-meta);
          line-height: 1.5;
          color: var(--ink-3);
          word-break: keep-all;
          overflow-wrap: break-word;
        }

        /* 그림이 있는 섹션(01~04)은 브라우저 탭·주소창을 뺀 실제 창 높이(FHD ≈ 950px)에
           들어와야 한다. 글자 기준값·표제 여백·행간을 한 단계씩 줄인다. */
        .cvx-slide:has(> .cvx-body--figure) {
          --t-base: clamp(1rem, 1.45cqi, 1.25rem);
          --space-head: clamp(var(--s2), 2cqi, var(--s4));
          --space-row: clamp(0.75rem, 1.3cqi, 1.25rem);
        }

        .cvx-body--figure .cvx-facts li { line-height: 1.5; padding-block: 0.3rem; }
        .cvx-body--figure .cvx-quote { line-height: 1.45; }
        .cvx-body--figure .cvx-cell { row-gap: var(--s1); }

        /* 중간 폭(노트북): 그림은 옆에 두되 좁게, 레일 라벨은 내용 위로 접는다 */
        @container cvstage (45rem <= inline-size < 60rem) {
          .cvx-body--figure {
            --t-base: 0.9375rem;
            --space-row: 0.5rem;
            --space-item: 0.35rem;
          }

          /* 표제 아래 여백도 한 단계 좁게 */
          .cvx-slide:has(> .cvx-body--figure) .cvx-head { margin-block-end: var(--s2); }

          .cvx-body--figure .cvx-quote { line-height: 1.42; }

          .cvx-body--figure > .cvx-table,
          .cvx-body--figure > .cvx-list { grid-column: 1 / span 8; }

          .cvx-figures { grid-column: 9 / -1; }

          .cvx-body--figure .cvx-row {
            grid-template-columns: minmax(0, 1fr);
            row-gap: 0.3rem;
          }

          .cvx-body--figure .cvx-row > .cvx-rail-label,
          .cvx-body--figure .cvx-row--quote > .cvx-rail-label { padding-block-start: 0; }

          .cvx-body--figure .cvx-cell,
          .cvx-body--figure .cvx-quote { max-inline-size: none; }

          .cvx-body--figure .cvx-facts li { padding-block: 0.22rem; line-height: 1.42; }
          .cvx-body--figure .cvx-cell { row-gap: var(--s1); }
        }

        /* 좁은 폭: 그림을 본문 아래로 내리고 두 장을 나란히 */
        @container cvstage (inline-size < 45rem) {
          .cvx-body--figure > .cvx-table,
          .cvx-body--figure > .cvx-list,
          .cvx-figures { grid-column: 1 / -1; }
          .cvx-figures {
            position: static;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            column-gap: var(--s3);
            padding-inline-start: 0;
            border-inline-start: 0;
            padding-block-start: var(--s3);
            border-block-start: 1px solid var(--rule);
          }
        }

        @container cvstage (inline-size < 44rem) {
          .cvx-figures { grid-template-columns: minmax(0, 1fr); }
        }

        .cvx-cell {
          display: grid;
          row-gap: var(--s2);
          max-inline-size: var(--measure);
        }

        .cvx-para {
          margin: 0;
          font-size: var(--t-body);
          font-weight: 300;
          line-height: 1.9;
          letter-spacing: -0.005em;
          color: #2f343a;
        }

        /* 명제: 크기와 굵기로만 세운다. 선을 덧대지 않는다 */
        .cvx-quote {
          margin: 0;
          max-inline-size: 52ch;
          /* 줄바꿈은 원문의 \n을 따른다(문장·구 단위). 좁으면 그 안에서 다시 접힌다 */
          white-space: pre-line;
          font-size: var(--t-lead);
          font-weight: 500;
          line-height: 1.5;
          letter-spacing: -0.015em;
          color: var(--ink);
        }

        /* 사실: 한 줄이 항목 하나, 줄 사이는 가는 선 */
        .cvx-facts {
          margin: 0;
          padding: 0;
          list-style: none;
        }

        .cvx-facts li {
          padding-block: 0.4rem;
          border-block-start: 1px solid var(--rule);
          font-size: var(--t-body);
          font-weight: 400;
          line-height: 1.6;
          color: var(--ink);
        }

        .cvx-facts li:first-child { border-block-start: 0; padding-block-start: 0; }
        .cvx-facts strong { font-weight: 600; }

        /* 미리보기가 붙은 줄: 끝에 작은 ↗. 올리면 붉게 뜬다 */
        .cvx-fact-link {
          display: inline-block;
          margin-inline-start: 0.35em;
          font-size: 0.8em;
          color: var(--ink-3);
          text-decoration: none;
          translate: 0 -0.05em;
          transition: color 0.2s ease-out, translate 0.2s ease-out;
        }

        .cvx-facts li.has-site:hover .cvx-fact-link { color: var(--now); translate: 0.1em -0.2em; }
        .cvx-facts li:last-child { padding-block-end: 0; }

        /* ── 목록: 점(병렬) / 번호(순서) ──────────────────────────── */
        .cvx-list {
          grid-column: 1 / span 10;
          display: grid;
          margin: 0;
          padding: 0;
          list-style: none;
        }

        /* 목록 행도 같은 레일 표: 왼쪽 열 너비를 01·04 섹션과 공유한다 */
        .cvx-list-row {
          display: grid;
          grid-template-columns: var(--rail-w) minmax(0, 1fr);
          column-gap: var(--col-gap);
          padding-block: var(--space-row);
          border-block-start: 1px solid var(--rule);
        }

        .cvx-list-row:first-child { border-block-start: 0; padding-block-start: 0; }

        .cvx-list-rail {
          /* 번호·점은 제목 첫 줄과 같은 높이의 행상자에 놓아
             광학 중심을 제목과 정확히 맞춘다. */
          --rail-line: calc(var(--t-lead) * 1.4);

          position: relative;
        }

        /* 점(병렬)은 제목 첫 줄 한가운데 */
        .cvx-list-rail > .cvx-dot {
          margin-block-start: calc((var(--rail-line) - 5px) / 2);
        }

        /* 번호(순서)는 다른 표의 레일 레이블과 같은 글자 — 축선·눈금 없이 숫자만 */
        .cvx-step-num {
          display: block;
          line-height: var(--rail-line);
          font-size: var(--t-meta);
          font-variant-numeric: tabular-nums;
          font-weight: 500;
          letter-spacing: 0.06em;
          color: var(--ink-3);
        }

        .cvx-list-main { max-inline-size: var(--measure); }

        .cvx-list-title {
          margin: 0 0 var(--s2);
          font-size: var(--t-lead);
          font-weight: 600;
          line-height: 1.4;
          letter-spacing: -0.015em;
        }

        .cvx-list-body {
          margin: 0;
          font-size: var(--t-body);
          font-weight: 300;
          line-height: 1.9;
          color: #2f343a;
        }

        /* 경력 행: 레일 = 기간, 내용 = 회사·역할 + 한 일(가는 선 목록) */
        .cvx-job.is-now .cvx-job-period { color: var(--now); }

        .cvx-job-head {
          display: grid;
          row-gap: 0.15rem;
          align-content: start;
        }

        .cvx-job-title {
          margin: 0;
          font-size: var(--t-lead);
          font-weight: 600;
          line-height: 1.4;
          letter-spacing: -0.015em;
        }

        .cvx-job-role,
        .cvx-job-stints {
          margin: 0;
          font-size: var(--t-meta);
          color: var(--ink-3);
        }

        .cvx-job-role { color: var(--ink-2); }

        /* 회사명 링크: 평소엔 글자 그대로, 올리면 화살표가 살짝 뜬다 */
        .cvx-job-title-link {
          color: inherit;
          text-decoration: none;
          transition: opacity 0.2s ease-out;
        }

        .cvx-job-title-arrow {
          display: inline-block;
          margin-inline-start: 0.3em;
          font-size: 0.7em;
          font-weight: 500;
          color: var(--ink-3);
          translate: 0 -0.1em;
          transition: translate 0.2s ease-out, color 0.2s ease-out;
        }

        .cvx-job.has-site:hover .cvx-job-title-arrow { color: var(--now); translate: 0.1em -0.25em; }
        .cvx-job-title-link:hover { opacity: 0.7; }

        /* 한 일 목록은 사실 목록과 같은 규격이되, 첫 줄 위에 선을 두어 머리와 나눈다 */
        .cvx-job .cvx-facts li:first-child {
          padding-block-start: 0.5rem;
          border-block-start: 1px solid var(--rule);
        }

        /* ── 자격증 및 기술 ──────────────────────────────────────── */
        /* 자격증: 레일 = 연도, 내용 = 이름. 연도와 이름이 한 열 간격으로 붙는다 */
        .cvx-cert-name {
          font-size: var(--t-body);
          font-weight: 400;
          color: var(--ink);
        }

        /* 기술: 레일 = 분류, 내용 = 도구·설명 */
        .cvx-spec-value {
          margin: 0;
          max-inline-size: var(--measure);
          font-size: var(--t-body);
          font-weight: 300;
          line-height: 1.7;
          color: #2f343a;
        }

        /* ── 넓은 스테이지: 경력 2단 ─────────────────────────────────
           2단에서는 기간 레일이 폭을 절반 가까이 먹으므로, 기간을 회사명
           오른쪽으로 올리고 본문이 단 전체 폭을 쓴다. 한 화면에 들어오는 게 목표. */
        @container cvstage (inline-size >= 58rem) {
          .cvx-jobs {
            grid-column: 1 / -1;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            column-gap: var(--s5);
          }

          /* 행 = 한 칸짜리 격자. 기간은 그 칸의 오른쪽 위에 겹쳐 놓고,
             머리(회사·역할)만 오른쪽 여백을 비워 기간과 겹치지 않게 한다.
             한 일 목록은 단 전체 폭을 쓴다. */
          /* 회사 사이는 넉넉히(위아래 각 s4), 대신 표제 아래·항목 안쪽은 촘촘히 */
          .cvx-jobs .cvx-row {
            grid-template-columns: minmax(0, 1fr);
            column-gap: 0;
            padding-block: var(--s4);
          }

          .cvx-slide:has(.cvx-jobs) .cvx-head { margin-block-end: var(--s3); }

          .cvx-jobs .cvx-row:nth-child(-n + 2) { border-block-start: 0; padding-block-start: 0; }

          .cvx-jobs .cvx-job-period {
            grid-area: 1 / 1;
            justify-self: end;
            /* 회사명(t-lead, 1.4) 첫 줄과 기준선을 맞춘다 */
            padding-block-start: calc((var(--t-lead) * 1.4 - var(--t-meta) * 1.4) / 2);
          }

          .cvx-jobs .cvx-cell {
            grid-area: 1 / 1;
            max-inline-size: none;
            row-gap: 0.4rem;
          }

          .cvx-jobs .cvx-job-head { padding-inline-end: 9.5rem; }

          .cvx-job .cvx-facts li {
            font-size: calc(var(--t-body) * 0.94);
            line-height: 1.42;
            padding-block: 0.18rem;
          }

          .cvx-job .cvx-facts li:first-child { padding-block-start: 0.3rem; }
        }

        /* ── 좁은 스테이지: 격자 해제 ────────────────────────────── */
        @container cvstage (inline-size < 44rem) {
          .cvx-intro,
          .cvx-edu,
          .cvx-intro-contact,
          .cvx-table,
          .cvx-list { grid-column: 1 / -1; }

          /* 레일 표는 한 열로: 레이블이 내용 위에 놓인다.
             한 줄짜리 행(학력·자격증·기술)은 레일을 좁혀 두 열을 유지한다. */
          .cvx-row,
          .cvx-list-row { grid-template-columns: minmax(0, 1fr); row-gap: 0.4rem; }
          .cvx-row--tight,
          .cvx-edu-row { grid-template-columns: minmax(4.5rem, 6.5rem) minmax(0, 1fr); row-gap: 0; column-gap: var(--s2); }
          .cvx-row > .cvx-rail-label,
          .cvx-row--quote > .cvx-rail-label { padding-block-start: 0; }
          .cvx-cell,
          .cvx-quote,
          .cvx-list-main,
          .cvx-spec-value { max-inline-size: none; }

          .cvx-list-rail { padding-block-end: 0.2rem; }
          .cvx-list-rail > .cvx-dot { margin-block-start: 0; }
          .cvx-step-num { line-height: 1.4; }

          .cvx-edu-main { flex-direction: column; row-gap: 0.05rem; }
          .cvx-group { grid-column: 1 / -1; }
        }

        /* ── 모바일 ──────────────────────────────────────────────── */
        @media (max-width: 767px) {
          .cvx-scroll { touch-action: pan-y; -webkit-overflow-scrolling: touch; }

          .cv-mobile-nav { block-size: var(--cv-mobile-nav-h); }
          .cv-mobile-nav > div { block-size: 100%; padding-block: 0; }

          /* 목차 바가 고정 오버레이라 본문 상단을 그만큼 비운다 */
          .cv-stage-canvas {
            padding-block-start: calc(var(--cv-mobile-nav-h) + var(--s2));
            padding-inline: 1.25rem;
          }
        }

        /* ── 응답: 피드백은 누르는 순간, 즉시 ─────────────────────────
           눌림은 트랜지션 없이 바로 보이고, 손을 떼면 짧게 풀린다. */
        .cvx-nav-item {
          color: var(--ink-3);
          font-weight: 400;
          -webkit-tap-highlight-color: transparent;
          transition: color 0.2s ease-out;
        }

        .cvx-nav-item[aria-current='true'] {
          color: var(--ink);
          font-weight: 600;
        }

        .cvx-nav-item:hover { color: var(--ink); }

        .cvx-nav-label {
          display: inline-block;
          transition: transform 0.12s ease-out;
        }

        .cvx-nav-item:active { color: var(--ink); transition: none; }
        .cvx-nav-item:active .cvx-nav-label { transform: translateX(3px); transition: none; }

        .cvx-btn {
          -webkit-tap-highlight-color: transparent;
          transition: transform 0.12s ease-out, opacity 0.2s ease-out;
        }

        /* 링크처럼 놓인 버튼(TVCF 시트 열기) — 주변 링크와 같은 글자, 같은 반응 */
        .cvx-inline-btn {
          padding: 0;
          border: 0;
          background: transparent;
          font: inherit;
          color: inherit;
          cursor: pointer;
          -webkit-tap-highlight-color: transparent;
          transition: color 0.2s ease-out;
        }

        .cvx-inline-btn:hover { color: var(--ink); }
        .cvx-inline-btn:active { color: var(--ink); opacity: 0.6; transition: none; }

        .cvx-btn:hover { opacity: 0.6; }
        .cvx-btn:active { transform: scale(0.97); opacity: 0.6; transition: none; }

        .cvx-chip {
          border: 1px solid var(--rule);
          color: var(--ink-2);
          background: transparent;
          -webkit-tap-highlight-color: transparent;
          transition: transform 0.12s ease-out, background-color 0.2s ease-out, color 0.2s ease-out;
        }

        .cvx-chip[aria-current='true'] {
          background: var(--ink);
          border-color: var(--ink);
          color: #fff;
        }

        .cvx-chip:active { transform: scale(0.96); transition: none; }

        /* ── 머티리얼: 떠 있는 목차는 반투명 층 ────────────────────────
           위쪽 밝은 선은 빛을 받는 유리의 모서리. 글자는 색이 아니라 굵기와 자간으로 세운다. */
        .cv-mobile-nav {
          background: rgba(255, 255, 255, 0.72);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
          backdrop-filter: blur(20px) saturate(180%);
          border-block-start: 1px solid rgba(255, 255, 255, 0.6);
          border-block-end: 1px solid rgba(16, 18, 21, 0.08);
        }

        .cv-mobile-nav .cvx-chip {
          font-weight: 500;
          letter-spacing: 0.01em;
        }

        /* ── 접근성 ──────────────────────────────────────────────── */
        .contact-page :focus-visible {
          outline: 2px solid var(--ink);
          outline-offset: 3px;
        }

        /* 동작 줄이기: 피드백은 남기고 움직임만 뺀다 — 슬라이드 전환은 JS에서 크로스페이드로 */
        @media (prefers-reduced-motion: reduce) {
          .cvx-nav-label,
          .cvx-btn,
          .cvx-chip { transition: none; }

          .cvx-nav-item:active .cvx-nav-label,
          .cvx-btn:active,
          .cvx-chip:active { transform: none; }
        }

        /* 투명도 줄이기: 유리를 불투명하게 */
        @media (prefers-reduced-transparency: reduce) {
          .cv-mobile-nav {
            background: #ffffff;
            -webkit-backdrop-filter: none;
            backdrop-filter: none;
          }
        }

        /* 대비 높이기: 또렷한 경계선 */
        @media (prefers-contrast: more) {
          .cv-mobile-nav {
            background: #ffffff;
            -webkit-backdrop-filter: none;
            backdrop-filter: none;
            border-block-end-color: var(--ink);
          }

          .cvx-chip { border-color: var(--ink-2); color: var(--ink); }
        }

        /* ── 인쇄 ────────────────────────────────────────────────── */
        /* ── 경력 웹 미리보기 카드(body 포털) ─────────────────────── */
        .cvx-site-pop {
          position: fixed;
          z-index: 80;
          inline-size: ${SITE_POP_W}px;
          pointer-events: none;
          overflow: hidden;
          border-radius: 12px;
          background: #fff;
          border: 1px solid #e2e6ea;
          box-shadow: 0 24px 60px rgba(16, 18, 21, 0.18), 0 2px 8px rgba(16, 18, 21, 0.08);
          transform-origin: 0 0;
        }

        .cvx-site-pop img,
        .cvx-site-pop-video {
          display: block;
          inline-size: 100%;
          block-size: auto;
          aspect-ratio: 16 / 10;
          object-fit: cover;
          background: #000;
        }

        .cvx-site-pop-bar {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          gap: 1rem;
          padding: 0.55rem 0.8rem 0.6rem;
          border-block-start: 1px solid #e2e6ea;
          font-size: 0.78rem;
          line-height: 1.3;
        }

        .cvx-site-pop-host {
          font-weight: 500;
          color: #101215;
          letter-spacing: 0.01em;
        }

        .cvx-site-pop-hint {
          color: #949aa1;
          white-space: nowrap;
        }

        @media print {
          @page { size: A4; margin: 14mm; }

          html, body {
            background: #ffffff !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          body * { visibility: hidden; }

          .contact-print-area,
          .contact-print-area * { visibility: visible; }

          .contact-print-area {
            position: absolute;
            inset-inline-start: 0;
            inset-block-start: 0;
            inline-size: 100% !important;
            max-inline-size: none !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          .contact-no-print,
          .cv-stage-screen { display: none !important; }

          .contact-print-only { display: block !important; }

          .cvx-slide {
            --t-display: 2rem;
            --t-title: 1.25rem;
            --t-lead: 1rem;
            --t-body: 0.8125rem;
            --t-meta: 0.6875rem;
            --gutter: 0.5rem;
            block-size: auto;
          }

          .cvx-body { overflow: visible; block-size: auto; }
          .cv-print-section {
            break-inside: avoid;
            page-break-inside: avoid;
            margin-block-end: 1.5rem;
          }

          .contact-print-header {
            border-block-end: 1px solid #000 !important;
            padding-block-end: 6mm !important;
            margin-block-end: 8mm !important;
          }

          .contact-print-program {
            margin: 0 0 2mm;
            font-size: 9pt;
            color: var(--ink-2);
          }

          .contact-print-name {
            margin: 0 0 1mm;
            font-size: 20pt;
            font-weight: 700;
            letter-spacing: -0.03em;
          }

          .contact-print-role {
            margin: 0;
            font-size: 11pt;
            font-weight: 300;
            color: var(--ink-2);
          }

          .contact-print-doc {
            margin: 5mm 0 0;
            font-size: 8.5pt;
            letter-spacing: 0.18em;
            text-transform: uppercase;
            color: var(--ink-3);
          }

          .contact-print-area a { color: #374151 !important; text-decoration: none !important; }
        }
      `}</style>

      <div className="flex" style={{ minHeight: 'calc(100vh - var(--layout-header-h))' }}>
        {/* 목차 — 번호는 논지, 점은 기록 */}
        <aside
          className="contact-no-print hidden md:flex flex-col flex-shrink-0 fixed left-0 z-30 bg-white"
          style={{
            top: 'var(--layout-header-h)',
            width: 'var(--layout-sidebar-w)',
            height: 'calc(100vh - var(--layout-header-h))',
            padding: 'var(--layout-sidebar-pad)',
            borderRight: '1px solid var(--rule)',
          }}
        >
          <nav className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
            {CV_NAV.map(({ id, label, num }) => {
              const isActive = activeSection === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => goToSection(id)}
                  aria-current={isActive ? 'true' : undefined}
                  className="cvx-nav-item"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1.75rem minmax(0, 1fr)',
                    alignItems: 'baseline',
                    gap: '0.5rem',
                    width: '100%',
                    padding: '0.6rem 0',
                    textAlign: 'left',
                    borderTop: '1px solid var(--rule)',
                    background: 'transparent',
                    fontSize: 'var(--layout-meta)',
                  }}
                >
                  <span
                    className="cvx-num"
                    style={{ fontSize: 'calc(var(--layout-meta) - 0.125rem)' }}
                  >
                    {num ?? (
                      <i
                        className="cvx-dot"
                        style={{ background: isActive ? 'var(--now)' : 'currentColor' }}
                        aria-hidden
                      />
                    )}
                  </span>
                  <span className="cvx-nav-label">{label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        <div className="flex-shrink-0 hidden md:block" style={{ width: 'var(--layout-sidebar-w)' }} />

        {/* 연락처 */}
        <div
          className="contact-no-print hidden md:block fixed right-0 bg-white z-30 overflow-y-auto"
          style={{
            top: 'var(--layout-header-h)',
            width: 'var(--layout-info-w)',
            height: 'calc(100vh - var(--layout-header-h))',
            padding: 'var(--layout-panel-pad)',
            borderLeft: '1px solid var(--rule)',
            scrollbarWidth: 'none',
          }}
        >
          <p className="cvx-rail-label" style={{ marginBottom: 'var(--s4)' }}>
            CONTACT
          </p>
          <div style={{ fontSize: 'var(--layout-meta)' }}>
            {[
              { label: '전화', value: phone, href: `tel:${phone.replace(/-/g, '')}`, key: 'phone' as const },
              { label: '이메일', value: email, href: `mailto:${email}`, key: 'email' as const },
            ].map((row) => (
              <div
                key={row.key}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '4rem minmax(0, 1fr)',
                  gap: 'var(--s2)',
                  padding: '0.7rem 0',
                  borderTop: '1px solid var(--rule)',
                }}
              >
                <span style={{ color: 'var(--ink-3)' }}>{row.label}</span>
                <a
                  href={row.href}
                  className="cvx-num"
                  style={{ color: 'var(--ink)', textDecoration: 'none' }}
                  onClick={() => trackOutboundClick(row.key, row.href)}
                >
                  {row.value}
                </a>
              </div>
            ))}
            {(info.socials?.linkedin || portfolioUrl) && (
              <div
                style={{
                  display: 'flex',
                  gap: 'var(--s2)',
                  padding: '0.7rem 0',
                  borderTop: '1px solid var(--rule)',
                  color: 'var(--ink-2)',
                }}
              >
                {info.socials?.linkedin && (
                  <a
                    href={info.socials.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: 'inherit', textDecoration: 'none' }}
                    onClick={() => trackOutboundClick('linkedin', info.socials!.linkedin!)}
                  >
                    LinkedIn
                  </a>
                )}
                {info.socials?.linkedin && portfolioUrl && (
                  <i className="cvx-dot cvx-dot--sep" style={{ alignSelf: 'center' }} aria-hidden />
                )}
                {portfolioUrl && (
                  <button
                    type="button"
                    className="cvx-inline-btn"
                    onClick={openTvcf}
                    aria-haspopup="dialog"
                    aria-expanded={tvcfOpen}
                  >
                    TVCF-Site
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 모바일 목차 */}
        {/* 반투명 머티리얼 — 본문 위에 떠 있는 기능층. 색은 아래에 두고 글자는 대비로 세운다 */}
        <div
          className="cv-mobile-nav contact-no-print md:hidden fixed left-0 right-0 z-20"
          style={{ top: 'var(--layout-header-h)' }}
        >
          <div className="flex items-center gap-2 px-4 py-3 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
            {CV_NAV.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => goToSection(id)}
                aria-current={activeSection === id ? 'true' : undefined}
                className="cvx-chip whitespace-nowrap px-3 py-1.5 text-xs"
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* 고정 스테이지: 휠·키는 섹션 전환, 터치는 슬라이드를 직접 끈다 */}
        <div
          ref={stageRef}
          className="cv-stage-screen cv-stage-viewport flex-1 md:mr-[var(--layout-info-w)] relative bg-white"
        >
          <div className="cv-stage-canvas absolute inset-0">
            <div className="cv-stage-frame">
              <AnimatePresence mode="sync" initial={false}>
                {layers.map(({ id, role }) => {
                  const m = getMotion(id);
                  return (
                    <motion.div
                      key={id}
                      className="cv-stage-layer"
                      style={{ y: m.y, opacity: m.opacity }}
                      variants={variantsFor(id)}
                      initial={role === 'peek' ? 'peek' : 'enter'}
                      animate={role === 'active' ? 'center' : undefined}
                      exit="exit"
                      onAnimationComplete={(definition) => {
                        if (definition === 'exit') exitPlanRef.current.delete(id);
                      }}
                      aria-hidden={role !== 'active' ? true : undefined}
                    >
                      <div id={id} data-cv-section={id} className="contact-cv w-full h-full min-h-0">
                        {renderSectionBody(id, openTvcf)}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {sheet && (
        <TvcfSheet
          open={tvcfOpen}
          url={sheet.url}
          title={sheet.title}
          kicker={sheet.kicker}
          image={sheet.image}
          onClose={closeTvcf}
        />
      )}

      {/* 인쇄용 전체 본문 */}
      <div className="contact-print-area contact-print-only px-8 py-8">
        <header className="contact-print-header">
          <p className="contact-print-program">{PROGRAM}</p>
          <h1 className="contact-print-name">이성훈</h1>
          <p className="contact-print-role">Creative Director / Media Artist</p>
          <p className="contact-print-doc">Statement of Purpose &amp; Research Plan</p>
        </header>
        {CV_NAV.map(({ id }) => (
          <section key={id} className="cv-print-section">
            {renderSectionBody(id)}
          </section>
        ))}
      </div>
    </motion.div>
    </OpenSheetContext.Provider>
  );
};

export default ContactPage;
