import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
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
import { info } from '../data';
import { trackOutboundClick, trackResumePdfSave } from '../analytics';
import TvcfSheet from './TvcfSheet';
import seonghunImage from '../IMG/seonghun.jpg';
import previewLibratum from '../IMG/site-previews/libratum.webp';
import previewOpenexc from '../IMG/site-previews/openexc.webp';
import previewConcentrix from '../IMG/site-previews/concentrix.webp';
import previewVixen from '../IMG/site-previews/vixen.webp';
import previewKeystone from '../IMG/site-previews/keystone.png';

/** 페이지 위 시트로 여는 내용. 컨텍스트로 어디서든 연다 */
type SheetContent = { url: string; title: string; kicker?: string; image?: string };
const OpenSheetContext = createContext<(content: SheetContent) => void>(() => {});

/** 마우스를 올리면 뜨는 미리보기. 웹사이트는 url + 캡처, 작품은 영상 또는 썸네일 */
type SitePreview = {
  url?: string;
  preview?: string;
  video?: string;
  label?: string;
  /** false면 iframe 삽입을 막는 사이트 → 시트에 캡처 이미지를 띄운다 */
  embed?: boolean;
  /** 캡처 대신 카드 안에서 페이지를 축소해 보여준다 */
  livePreview?: boolean;
  kicker?: string;
};

const siteHost = (url: string) => url.replace(/^https?:\/\//, '').replace(/\/$/, '');

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

const SITE = {
  libratum: { url: 'https://libratuminvestment.com/', preview: previewLibratum, label: 'Libratum Investment' },
  openexc: { url: 'https://openexc.com/', preview: previewOpenexc, label: 'OpenExchange' },
  concentrix: { url: 'https://kr.concentrix.com/', preview: previewConcentrix, label: 'Concentrix Korea', embed: false },
  vixen: { url: 'http://www.vixenvfxstudio.com/kr/', preview: previewVixen, label: 'VIXEN VFX Studio', embed: false },
  keystone: { url: 'http://www.keystoneplay.com/about', preview: previewKeystone, label: 'Keystone Play', embed: false },
} satisfies Record<string, SitePreview>;

const PHONE = '010-2629-7954';
const EMAIL = 'huuuun@kakao.com';
/** 엔딩 화면 등 다른 곳에서도 같은 연락처를 쓴다 */
export const CONTACT = { phone: PHONE, email: EMAIL } as const;

/**
 * 목차. num이 있는 항목은 연구계획서 본문(순서가 의미를 갖는 논지),
 * num이 없는 항목은 기록(개요·경력·자격증)이라 번호 대신 점으로 표시한다.
 */
const CV_NAV = [{ id: 'cv-intro', label: '이력서', num: null }] as const;

type CvSectionId = (typeof CV_NAV)[number]['id'];

/** 학력. 경력과 같이 학교(굵게) / 학위(중간) · 날짜 */
const EDUCATION: { school: string; program: string; date: string; gpa?: string }[] = [
  {
    school: '중앙대학교 첨단영상대학원',
    program: '예술공학 전공 · 석사과정',
    date: '재학중',
  },
  {
    school: '숭실대학교 글로벌미래교육원 (학점은행제)',
    program: '시각디자인학 학사',
    date: '2026. 02',
    gpa: '3.91',
  },
  {
    school: '한국폴리텍5대학',
    program: '멀티미디어학과',
    date: '2009. 02',
    gpa: '3.95',
  },
];

const PROFILE =
  '**13년 차** 시각 디자인·영상 전문가로, TVCF, 모션그래픽, 브랜드 필름, 라이브, 웹 콘텐츠까지 영상\u00A0제작 전반을 맡아 왔습니다.\n\n기획부터 촬영 대응, 합성·모션, 납품 포맷까지 한 흐름으로 이해하고, 그 과정을 **반복 가능한 워크플로우**로 만드는 데 강점이 있습니다.';

const ROLE_FIT = [
  '**포스트프로덕션 2D TD**로 아트팀과 2D팀을 함께 리딩하며, 광고주, 대행사, 사내 편집팀, 외부\u00A0필름\u00A0프로덕션과 조율했습니다.',
  '**TVCF 영상 후반**, 웹 에이전시 UI/UX 영상 콘텐츠, **라이브 이벤트**까지 포맷마다 다른 제작\u00A0문제를 풀어 왔습니다.',
];

type ExperienceEntry = {
  company: string;
  role: string;
  period: string;
  items: string[];
  site?: SitePreview;
};

const experience: ExperienceEntry[] = [
    {
      company: '리브라텀 파트너스',
      role: '크리에이티브 디렉터',
      period: '2025.03 – 현재',
    site: SITE.libratum,
      items: [
      '사모펀드(PEF) 투자 지표와 글로벌 IR 데이터를 인포그래픽, 피치덱, 웹 UI로 설계하는 **시각\u00A0시스템 통합 운영**',
      '데이터 기반 시각 구조 표준화와 투자자 커뮤니케이션 영상의 **구조 재설계**',
      '생성형 AI(t2v, i2v)와 바이브코딩 기반 웹 랜딩페이지 설계를 워크플로우에 도입하여 **제작\u00A0리드타임 40% 이상 단축**',
      ],
    },
    {
      company: '오픈익스체인지',
      role: '아트 디렉터',
      period: '2023.09 – 2025.01',
    site: SITE.openexc,
      items: [
      '삼성전자 인베스터데이, 네이버, 크래프톤, 휠라, 하나금융지주 **랜딩페이지·홀딩슬라이드 제작, 라이브 현장 총괄**',
      '**포스코홀딩스IR 채널 운영**, 템플릿 제작 및 외주 관리',
      ],
    },
    {
      company: '콘센트릭스 카탈리스트',
      role: '모션 콘텐츠 팀 리더',
      period: '2020.02 – 2023.08',
    site: SITE.concentrix,
      items: [
        '글로벌 IT/가전 기업의 **USP 영상 및 B2C 콘텐츠 기획·제작**',
      '인하우스 영상 프로덕션 팀 신설과 디자인 팀 매니징으로 **외주 제작비 연 40% 절감** 및 내부\u00A0수익화 전환',
      '다국적 프로젝트의 품질 일관성을 유지하고 69개국 웹사이트용 webm/mp4/JSON 영상\u00A0소재 **제작\u00A0총괄**',
      ],
    },
    {
      company: '키스톤 플레이',
      role: '2D 테크니컬 디렉터',
      period: '2015.09 – 2019.11',
    site: SITE.keystone,
      items: [
      '포스트 프로덕션 단계 **2D 시각 효과 및 합성** 솔루션\u00A0제공',
      '**TVCF, 뮤직비디오, 공익광고** 등 영상 프로젝트 테크니컬 디렉팅',
      '클라이언트 요구사항 기반 **촬영 현장 감독** 및 포스트 파이프라인 설계',
      ],
    },
    {
      company: '포스트포엠',
      role: '선임 2D 아티스트',
      period: '2014.10 – 2015.09',
      items: [
        '대규모 미디어 캠페인용 **고해상도 영상 소스** 제작 및 브랜드 모션 그래픽\u00A0연출',
        '광고 영상 합성 작업의 **품질 기준 수립** 및 주니어 아티스트 업무\u00A0조율',
        '다양한 포맷의 **납품 소재 관리** 및 후반 제작 공정\u00A0효율화',
      ],
    },
    {
      company: '빅슨 스튜디오',
      role: '2D 아티스트',
      period: '2012.07 – 2014.10',
    site: SITE.vixen,
      items: [
        '매트 페인팅 및 이미지 합성을 통한 **TV 광고 공간 연출** 및 후반 작업',
        'After Effects·Photoshop 기반 **키잉·리터칭·색보정** 등 광고 후반 전\u00A0공정\u00A0참여',
        '복수 프로젝트 동시 진행 환경에서 **납기 준수** 및 수정 대응 체계\u00A0구축',
      ],
    },
  ];

const certifications = [
  { name: '투자자산운용사', year: '2026' },
  { name: '컬러리스트기사', year: '2025' },
  { name: '컬러리스트산업기사', year: '2025' },
  { name: '멀티미디어콘텐츠제작전문가', year: '2025' },
  { name: `ICA DaVinci${'\u00A0'}Resolve 201`, year: '2024' },
];

const skillRows = [
  { label: '영상 후반 작업', value: `After Effects, DaVinci${'\u00A0'}Resolve, Flame, Premiere${'\u00A0'}Pro` },
  { label: '3D·생성형', value: 'Blender, ComfyUI, TouchDesigner' },
  { label: '라이브 스트리밍', value: 'vMix, Tricaster, OBS를 통한 라이브 송출 경험' },
  { label: 'AI 파이프라인', value: 'AI 기반 영상 디자인 파이프라인 개발' },
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
/** 터치에서 위아래 끌기로 섹션을 넘길지. 발표용 CV는 좌우 스와이프만 쓴다(위아래는 안쪽 스크롤 전용) */
const TOUCH_VERTICAL_PAGING = false;
/** 좌우 스와이프 커밋 거리(px) — 스테이지 폭의 일부와 최소값 중 큰 쪽 */
const hswipeCommitFor = (stageWidth: number) => Math.max(48, stageWidth * 0.12);
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
  mode: 'undecided' | 'drag' | 'native' | 'hswipe';
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

/* 미리보기 카드. 스테이지 레이어가 transform을 쓰므로 body에 포털로 그린다 */
const SITE_POP_W = 400;
const SITE_POP_H = 250 + 38;
const SITE_POP_GAP = 18;

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

  const onMove = (e: ReactPointerEvent) => {
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
            ) : site.preview ? (
              <img src={site.preview} alt="" width={1280} height={800} draggable={false} />
            ) : site.livePreview && site.url ? (
              <div className="cvx-site-pop-live">
                <iframe
                  src={site.url}
                  title=""
                  tabIndex={-1}
                  style={{ transform: `scale(${SITE_POP_W / 1280})` }}
                />
              </div>
            ) : null}
            <div className="cvx-site-pop-bar">
              <span className="cvx-site-pop-host">{site.url ? siteHost(site.url) : site.label}</span>
              <span className="cvx-site-pop-hint">{site.url ? '클릭하면 시트에서 열림' : '포트폴리오 작품'}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>,
      document.body,
    );

  return { handlers, popup };
};

/** `**강조**`만 굵게. 문장 자체는 그대로 두고 훑어 읽을 핵심만 올린다. */
function renderInlineMd(text: string): ReactNode {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, index) =>
    part.startsWith('**') && part.endsWith('**')
      ? <strong key={index}>{part.slice(2, -2)}</strong>
      : part,
  );
}

const ContactSiteLink = ({
  site,
  title,
  className,
  children,
}: {
  site: SitePreview;
  title: string;
  className?: string;
  children: ReactNode;
}) => {
  const { handlers, popup } = useSitePeek(site);
  const openSite = useOpenSite();

  return (
    <>
      <button
        type="button"
        className={className ?? 'cvx-inline-btn'}
        aria-haspopup="dialog"
        {...handlers}
        onClick={() => openSite(site, title, site.kicker)}
      >
        {children}
      </button>
      {popup}
    </>
  );
};

const JobTitle = ({ job }: { job: ExperienceEntry }) => (
  <>
    <span className="cvd-job-company">{job.company}</span>
    <span className="cvd-job-role"> / {job.role}</span>
  </>
);

const JobBlock = ({ job }: { job: ExperienceEntry }) => {
  const { handlers, popup } = useSitePeek(job.site);
  const openSite = useOpenSite();

  return (
    <div className={`cvd-job${job.site ? ' has-site' : ''}`} {...handlers}>
      <div className="cvd-job-head">
        <div className="cvd-job-title">
          {job.site?.url ? (
            <button
              type="button"
              className="cvd-job-link"
              aria-haspopup="dialog"
              onClick={() => openSite(job.site, job.company)}
            >
              <JobTitle job={job} />
              <span className="cvd-job-arrow" aria-hidden>
                ↗
              </span>
            </button>
          ) : (
            <JobTitle job={job} />
          )}
        </div>
        <span className="cvd-job-period">{job.period}</span>
      </div>
      <ul className="cvd-disc">
        {job.items.map((item) => (
          <li key={item}>{renderInlineMd(item)}</li>
        ))}
      </ul>
      {popup}
    </div>
  );
};


function renderSectionBody(id: CvSectionId): ReactNode {
  void id;
  return (
    <article className="cvx-slide cvx-slide--doc cvx-scroll">
      <div className="cvd">
        <div className="cvd-tools contact-no-print">
          <button
            type="button"
            className="cvd-pdf"
            onClick={() => {
              trackResumePdfSave();
              window.print();
            }}
          >
            이력서 PDF 저장
          </button>
        </div>

        <div className="cvd-photo contact-screen-only">
          <img src={seonghunImage} alt="이성훈 프로필 사진" />
        </div>

        <header className="cvd-id contact-screen-only">
          <h1>이성훈</h1>
          <p>Creative Director</p>
        </header>

        <section className="cvd-block">
          <h2>간단 소개</h2>
          {PROFILE.split('\n\n').map((paragraph) => (
            <p key={paragraph}>{renderInlineMd(paragraph)}</p>
          ))}
        </section>

        <section className="cvd-block">
          <h2>강점</h2>
          <ul className="cvd-disc">
            {ROLE_FIT.map((item) => (
              <li key={item}>{renderInlineMd(item)}</li>
            ))}
          </ul>
        </section>

        <section className="cvd-block">
          <h2>경력</h2>
          {experience.map((job) => (
            <JobBlock key={`${job.company}-${job.period}`} job={job} />
          ))}
        </section>

        <section className="cvd-block">
          <h2>학력</h2>
          <ul className="cvd-edu">
            {EDUCATION.map((item) => (
              <li key={item.school}>
                <div className="cvd-edu-head">
                  <div className="cvd-edu-title">
                    <span className="cvd-edu-school">{item.school}</span>
                    <span className="cvd-edu-program"> / {item.program}</span>
                  </div>
                  <span className="cvd-edu-date">{item.date}</span>
                </div>
                {item.gpa && (
                  <p className="cvd-edu-gpa">
                    평점평균 <strong>{item.gpa}</strong> / 4.5
                  </p>
                )}
              </li>
            ))}
          </ul>
        </section>

        <section className="cvd-block">
          <h2>자격증 및 기술</h2>
          <div className="cvd-spec">
            <strong>자격증</strong>
            <ul className="cvd-disc">
              {certifications.map((cert) => (
                <li key={cert.name}>
                  <span className="cvd-cert-name">{cert.name}</span>
                  <span className="cvd-cert-year">{cert.year}</span>
                </li>
              ))}
            </ul>
            {skillRows.map((row) => (
              <div key={row.label} className="cvd-spec-row">
                <strong>{row.label}</strong>
                <span>{row.value}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </article>
  );
}

const ContactPage = () => {
  const phone = PHONE;
  const email = EMAIL;
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
      // 한 장짜리 이력서는 섹션을 넘기지 않고, 스테이지가 문서처럼 내려간다
      if (CV_NAV.length <= 1) return;

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
      if (CV_NAV.length <= 1) {
        const page = window.innerHeight * 0.86;
        if (event.key === 'ArrowDown') {
          event.preventDefault();
          window.scrollBy({ top: 80 });
        } else if (event.key === 'ArrowUp') {
          event.preventDefault();
          window.scrollBy({ top: -80 });
        } else if (event.key === 'PageDown') {
          event.preventDefault();
          window.scrollBy({ top: page });
        } else if (event.key === 'PageUp') {
          event.preventDefault();
          window.scrollBy({ top: -page });
        }
        return;
      }
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
      if (!g || g.mode === 'native' || g.mode === 'hswipe') return;
      const t = findTouch(event, g.id);
      if (!t) return;

      if (g.mode === 'undecided') {
        const dx = t.clientX - g.startX;
        const dy = t.clientY - g.startY;
        if (Math.hypot(dx, dy) < DRAG_HYSTERESIS) return;
        if (Math.abs(dx) > Math.abs(dy)) {
          g.mode = 'hswipe'; // 좌우: 놓을 때 거리로 다음/이전 판정
          return;
        }
        if (!TOUCH_VERTICAL_PAGING) {
          g.mode = 'native'; // 위아래: 섹션 전환 없이 안쪽 스크롤만
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
      if (gesture.mode === 'hswipe') {
        if (cancelled) return;
        const dx = t.clientX - gesture.startX;
        if (Math.abs(dx) < hswipeCommitFor(stage.clientWidth)) return;
        navigate(activeIndexRef.current + (dx < 0 ? 1 : -1));
        return;
      }
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

          --layout-info-w: 21rem;
          --layout-meta: 1rem;
          --cv-mobile-nav-h: 3.25rem;

          background: var(--paper);
          color: var(--ink);
          /* 크기에 따라 글자꼴이 달라지는 서체면 그 광학 보정을 쓴다 */
          font-optical-sizing: auto;
        }

        @media (min-width: 1920px) {
          .contact-page { --layout-info-w: 23rem; --layout-meta: 1.0625rem; }
        }

        @media (min-width: 2560px) {
          .contact-page { --layout-info-w: 27rem; --layout-meta: 1.1875rem; }
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

        /* 이력서는 슬라이드가 아니라 긴 문서다.
           캔버스·레이어의 absolute 고정을 풀어야 스테이지 scrollHeight가 본문만큼 늘어난다. */
        .cv-stage-viewport:has(.cvx-slide--doc) {
          overflow: visible;
          block-size: auto;
          min-block-size: calc(100dvh - var(--layout-header-h));
        }

        .cv-stage-viewport:has(.cvx-slide--doc) .cv-stage-canvas {
          position: relative;
          inset: auto;
          padding: 0;
          block-size: auto;
        }

        .cv-stage-viewport:has(.cvx-slide--doc) .cv-stage-frame,
        .cv-stage-viewport:has(.cvx-slide--doc) .cv-stage-layer {
          position: relative;
          inset: auto;
          block-size: auto;
          min-block-size: 0;
          will-change: auto;
        }

        .cv-stage-viewport:has(.cvx-slide--doc) .contact-cv {
          block-size: auto;
          min-block-size: 0;
        }

        .cvx-slide--doc {
          display: block;
          block-size: auto;
          min-block-size: 0;
          overflow: visible;
          padding: 2.5rem 1.25rem 4rem;
        }

        .cvd {
          /* 본문 1을 기준으로 이름 φ², 절 φ, 직함 √φ, 기간 1/φ */
          --cv-phi: 1.618;
          --cv-body: var(--layout-body);
          --cv-meta: max(0.8125rem, calc(var(--cv-body) / var(--cv-phi)));
          --cv-lead: calc(var(--cv-body) * 1.272);
          --cv-h2: calc(var(--cv-body) * var(--cv-phi));
          --cv-h1: calc(var(--cv-body) * var(--cv-phi) * var(--cv-phi));
          max-inline-size: 38em;
          margin-inline: auto;
          color: #374151;
          font-size: var(--cv-body);
          font-weight: 400;
          line-height: 1.75;
          word-break: keep-all;
          line-break: strict;
          overflow-wrap: break-word;
          text-wrap: pretty;
        }

        .cvd strong {
          font-weight: 700;
          color: #111827;
        }

        .cvd-tools { display: flex; justify-content: flex-end; margin-block-end: 1.25rem; }

        .cvd-pdf {
          border: 1px solid #d1d5db;
          border-radius: 999px;
          padding: 0.5rem 1rem;
          background: transparent;
          color: #1f2937;
          font: inherit;
          font-size: 0.875rem;
          cursor: pointer;
        }

        .cvd-pdf:hover { opacity: 0.7; }

        .cvd-photo {
          display: flex;
          justify-content: center;
          margin-block-end: 2.5rem;
        }

        .cvd-photo img {
          inline-size: 60%;
          max-inline-size: 12rem;
          aspect-ratio: 3 / 4;
          object-fit: cover;
          background: #000;
        }

        .cvd-id {
          margin-block-end: 2rem;
          padding-block-end: 1.25rem;
          border-block-end: 2px solid #000;
        }

        .cvd-id h1 {
          margin: 0 0 0.2rem;
          font-size: var(--cv-h1);
          font-weight: 700;
          line-height: 1.15;
          letter-spacing: -0.03em;
          color: #111827;
        }

        .cvd-id p {
          margin: 0;
          font-size: var(--cv-lead);
          font-weight: 500;
          line-height: 1.4;
          color: #4b5563;
        }

        .cvd-block { margin-block-end: 3.25rem; }
        .cvd-block:last-child { margin-block-end: 0; }

        .cvd-block h2 {
          margin: 0 0 1.1rem;
          padding-block-end: 0.35rem;
          border-block-end: 1px solid #111827;
          font-size: var(--cv-h2);
          font-weight: 700;
          line-height: 1.3;
          letter-spacing: -0.02em;
          color: #111827;
        }

        .cvd-block > p { margin: 0; color: #374151; line-height: 1.75; }

        .cvd-id h1,
        .cvd-block h2,
        .cvd-job-title { text-wrap: balance; }

        .cvd-block > p + p { margin-top: 0.45rem; }

        .cvd-disc {
          margin: 0;
          padding-inline-start: 1.25rem;
          line-height: 1.4;
        }
        .cvd-disc li + li { margin-top: 0.08rem; }

        .cvd-job { margin-block-end: 2.35rem; }
        .cvd-job:last-child { margin-block-end: 0; }

        .cvd-job-head { margin-block-end: 0.85rem; line-height: 1.35; }
        .cvd-job-title {
          font-size: var(--cv-lead);
          font-weight: 500;
          color: #4b5563;
        }
        .cvd-job-company { font-weight: 700; color: #111827; }
        .cvd-job-role { font-weight: 500; }

        .cvd-job.has-site { cursor: pointer; }

        .cvd-job-link {
          display: inline;
          max-inline-size: 100%;
          padding: 0;
          border: 0;
          background: transparent;
          color: inherit;
          font: inherit;
          font-weight: inherit;
          line-height: inherit;
          text-align: inherit;
          white-space: normal;
          cursor: pointer;
        }

        .cvd-job-link:hover { opacity: 0.7; }

        .cvd-job-arrow {
          display: inline-block;
          margin-inline-start: 0.3rem;
          font-size: 0.85em;
          color: #6b7280;
        }

        .cvd-job.has-site:hover .cvd-job-arrow { color: var(--now); translate: 0.1em -0.25em; }
        .cvd-job-period {
          display: block;
          margin-top: 0.125rem;
          font-size: var(--cv-meta);
          font-weight: 500;
          font-variant-numeric: tabular-nums;
          color: #4b5563;
        }

        .cvd-edu { margin: 0; padding: 0; list-style: none; }
        .cvd-edu li + li { margin-top: 1.75rem; }
        .cvd-edu-head {
          font-size: var(--cv-lead);
          font-weight: 500;
          color: #4b5563;
        }
        .cvd-edu-school { font-weight: 700; color: #111827; }
        .cvd-edu-program { font-weight: 500; color: #4b5563; }
        .cvd-edu-date {
          display: block;
          margin-top: 0.125rem;
          font-size: var(--cv-meta);
          font-weight: 500;
          font-variant-numeric: tabular-nums;
          color: #4b5563;
        }
        .cvd-edu-gpa {
          margin: 0.15rem 0 0;
          font-size: var(--cv-meta);
          font-weight: 400;
          color: #6b7280;
        }
        .cvd-edu-gpa strong {
          font-weight: 600;
          color: #374151;
        }

        .cvd-cert-name { font-weight: 600; color: #111827; }
        .cvd-cert-year {
          margin-inline-start: 0.4rem;
          font-size: var(--cv-meta);
          font-weight: 500;
          font-variant-numeric: tabular-nums;
          color: #6b7280;
        }

        .cvd-spec {
          display: grid;
          grid-template-columns: 10.5rem minmax(0, 1fr);
          column-gap: 1.25rem;
          row-gap: 0.15rem;
          align-items: baseline;
        }
        .cvd-spec-row { display: contents; }
        .cvd-spec > strong:not(:first-of-type) { margin-top: 1.35rem; }
        .cvd-spec strong {
          font-weight: 700;
          color: #111827;
        }
        .cvd-spec-row > span { font-weight: 400; color: #374151; }
        .cvd-spec .cvd-disc {
          margin: 0;
          padding-inline-start: 0;
          list-style: none;
        }

        @media (min-width: 768px) {
          .cvx-slide--doc { padding-inline: 2.5rem; }
          .cvd-photo { justify-content: flex-start; }
          .cvd-photo img { inline-size: 12rem; block-size: 15rem; }
          .cvd-job-head,
          .cvd-edu-head {
            display: grid;
            grid-template-columns: minmax(0, 1fr) auto;
            align-items: baseline;
            column-gap: 1.25rem;
          }
          .cvd-job-title,
          .cvd-edu-title { min-inline-size: 0; }
          .cvd-job-period,
          .cvd-edu-date { margin-top: 0; white-space: nowrap; }
        }

        /* 이력서 한 장.
           이전 배치의 문제: 섹션이 하나인데 왼쪽 목차가 폭을 먹고,
           경력을 오른쪽 절반에 넣은 뒤 넓은 화면 규칙이 그 안에서 다시 2단으로 접어
           카드가 1/4 폭이 되며, overflow:hidden 때문에 아래가 잘렸다. */
        .cv-stage-canvas:has(.cvx-slide--sheet) {
          padding-block: clamp(1rem, 2.2cqi, 1.6rem);
          padding-inline: clamp(1.25rem, 2.4cqi, 2.25rem);
        }

        .cvx-slide--sheet {
          --t-base: clamp(0.78rem, 0.95cqi, 0.98rem);
          --t-display: calc(var(--t-base) * 2.35);
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
          block-size: 100%;
          min-block-size: 0;
          overflow: auto;
        }

        .cvx-sheet-name {
          margin: 0.1rem 0 0;
          font-size: var(--t-display);
          font-weight: 700;
          line-height: 1;
          letter-spacing: -0.03em;
        }

        .cvx-sheet-role {
          margin: 0.25rem 0 0;
          font-size: var(--t-lead);
          font-weight: 400;
          color: var(--ink-2);
        }

        .cvx-sheet-head {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 1rem 2rem;
          padding-block-end: 0.65rem;
          border-block-end: 1px solid var(--ink);
        }

        .cvx-sheet-contact {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: flex-end;
          gap: 0.45rem;
          margin: 0;
          font-size: var(--t-meta);
        }

        .cvx-sheet-label {
          margin: 0 0 0.3rem;
          font-size: var(--t-meta);
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .cvx-sheet-profile {
          margin: 0;
          max-inline-size: 78rem;
          font-size: var(--t-body);
          font-weight: 300;
          line-height: 1.6;
          color: #2f343a;
        }

        .cvx-sheet-career { min-inline-size: 0; }

        .cvx-sheet-foot {
          display: grid;
          grid-template-columns: minmax(0, 1.15fr) minmax(0, 0.9fr) minmax(0, 1.15fr);
          gap: 1rem 1.75rem;
          padding-block-start: 0.15rem;
        }

        .cvx-sheet-interests,
        .cvx-sheet-edu {
          margin: 0;
          padding: 0;
          list-style: none;
        }

        .cvx-sheet-interests li {
          position: relative;
          padding-inline-start: 0.75rem;
          font-size: var(--t-meta);
          font-weight: 300;
          line-height: 1.4;
          color: #2f343a;
        }

        .cvx-sheet-interests li + li { margin-top: 0.18rem; }

        .cvx-sheet-interests li::before {
          content: '';
          position: absolute;
          inset-inline-start: 0;
          inset-block-start: 0.45em;
          inline-size: 0.28rem;
          block-size: 0.28rem;
          border-radius: 50%;
          background: var(--ink);
        }

        .cvx-sheet-edu li {
          font-size: var(--t-meta);
          line-height: 1.35;
        }

        .cvx-sheet-edu li + li { margin-top: 0.28rem; }

        .cvx-sheet-edu-school {
          display: block;
          font-weight: 600;
        }

        .cvx-sheet-edu-degree {
          display: block;
          font-weight: 300;
          color: var(--ink-2);
        }

        .cvx-slide--sheet .cvx-jobs {
          grid-column: 1 / -1;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          column-gap: 2rem;
        }

        .cvx-slide--sheet .cvx-jobs .cvx-row {
          grid-template-columns: minmax(0, 1fr);
          column-gap: 0;
          padding-block: 0.55rem 0.7rem;
        }

        .cvx-slide--sheet .cvx-jobs .cvx-row:nth-child(-n + 2) {
          border-block-start: 0;
          padding-block-start: 0;
        }

        .cvx-slide--sheet .cvx-jobs .cvx-job-period {
          grid-area: 1 / 1;
          justify-self: end;
          padding-block-start: 0.15rem;
        }

        .cvx-slide--sheet .cvx-jobs .cvx-cell {
          grid-area: 1 / 1;
          max-inline-size: none;
          row-gap: 0.25rem;
        }

        .cvx-slide--sheet .cvx-jobs .cvx-job-head {
          padding-inline-end: 8.25rem;
        }

        .cvx-slide--sheet .cvx-facts li {
          padding-block: 0.06rem;
          line-height: 1.4;
          font-size: var(--t-meta);
        }

        .cvx-slide--sheet .cvx-job .cvx-facts li:first-child {
          padding-block-start: 0.28rem;
        }

        .cvx-slide--sheet .cvx-job-title {
          font-size: var(--t-lead);
        }

        .cvx-slide--sheet .cvx-cert-name,
        .cvx-slide--sheet .cvx-spec-value,
        .cvx-slide--sheet .cvx-rail-label {
          font-size: var(--t-meta);
        }

        .cvx-slide--sheet .cvx-sheet-certs .cvx-row,
        .cvx-slide--sheet .cvx-sheet-skills .cvx-row {
          grid-template-columns: 6.6rem minmax(0, 1fr);
          column-gap: 0.6rem;
        }

        .cvx-slide--sheet .cvx-spec-value {
          max-inline-size: none;
          line-height: 1.45;
        }

        @container cvstage (max-width: 860px) {
          .cvx-sheet-head { flex-direction: column; align-items: flex-start; }
          .cvx-sheet-contact { justify-content: flex-start; }
          .cvx-slide--sheet .cvx-jobs,
          .cvx-sheet-foot { grid-template-columns: 1fr; }
          .cvx-slide--sheet .cvx-jobs .cvx-row:nth-child(-n + 2) {
            border-block-start: 1px solid var(--rule);
            padding-block-start: 0.55rem;
          }
          .cvx-slide--sheet .cvx-jobs .cvx-row:first-child {
            border-block-start: 0;
            padding-block-start: 0;
          }
        }

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
        /* 인라인 그림: 넓은 화면에서는 오른쪽 열이 대신하므로 숨긴다 */
        .cvx-inline-fig { display: none; }

        @container cvstage (inline-size < 45rem) {
          .cvx-body--figure > .cvx-table,
          .cvx-body--figure > .cvx-list,
          .cvx-figures { grid-column: 1 / -1; }

          /* 좁은 화면: 그림 열을 접고, 글 바로 아래에 짝이 되는 그림을 1:1로 */
          .cvx-figures { display: none; }
          .cvx-inline-fig {
            display: block;
            margin-block-start: var(--s2);
            max-inline-size: 26rem;
          }
          .cvx-inline-fig svg {
            display: block;
            inline-size: 100%;
            block-size: auto;
            font-family: inherit;
          }
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

        /* 한 장 이력서의 경력 칸은 위 58rem 규칙보다 촘촘해야 한다 */
        .cvx-slide--sheet .cvx-job .cvx-facts li {
          font-size: var(--t-meta);
          line-height: 1.4;
          padding-block: 0.06rem;
        }

        .cvx-slide--sheet .cvx-job .cvx-facts li:first-child {
          padding-block-start: 0.22rem;
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

          .contact-page:not(:has(.cv-mobile-nav)) .cv-stage-canvas {
            padding-block-start: 1.15rem;
          }

          .cv-stage-canvas:has(.cvx-slide--doc) { padding: 0; }

          .cvd-spec {
            grid-template-columns: minmax(0, 1fr);
            row-gap: 0.2rem;
          }
          .cvd-spec > strong { margin-top: 1.15rem; }
          .cvd-spec > strong:first-of-type { margin-top: 0; }
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

        .cvx-contact-portfolio {
          padding: 0;
          border: 0;
          background: transparent;
          font: inherit;
          font-weight: 600;
          color: var(--ink);
          text-align: start;
          text-decoration: underline;
          text-underline-offset: 0.18em;
          text-decoration-thickness: 1px;
          cursor: pointer;
        }

        .cvx-contact-portfolio:hover { opacity: 0.65; }

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

        .cvx-site-pop-live {
          inline-size: 100%;
          aspect-ratio: 16 / 10;
          overflow: hidden;
          background: #111;
          pointer-events: none;
        }

        .cvx-site-pop-live iframe {
          inline-size: 1280px;
          block-size: 800px;
          border: 0;
          transform-origin: 0 0;
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

          .contact-print-area .contact-screen-only { display: none !important; }

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

          .cvd { --cv-body: 10pt; }

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
        {/* 목차 — 섹션이 둘 이상일 때만. 한 장 이력서에서는 폭만 잡아먹는다 */}
        {CV_NAV.length > 1 && <aside
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
        </aside>}

        <div
          className="contact-no-print flex-shrink-0 hidden md:block border-r border-gray-200"
          style={{ width: 'var(--layout-sidebar-w)' }}
        />

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
            {info.socials?.website && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '4rem minmax(0, 1fr)',
                  gap: 'var(--s2)',
                  alignItems: 'baseline',
                  padding: '0.7rem 0',
                  borderTop: '1px solid var(--rule)',
                }}
              >
                <span style={{ color: 'var(--ink-3)' }}>TVCF</span>
                <ContactSiteLink
                  className="cvx-contact-portfolio"
                  site={{
                    url: info.socials.website,
                    label: 'TVCF',
                    kicker: 'TVCF',
                    livePreview: true,
                  }}
                  title="HUUUUU.N 포트폴리오"
                >
                  포트폴리오
                  <span aria-hidden> ↗</span>
                </ContactSiteLink>
              </div>
            )}
          </div>
        </div>

        {/* 모바일 목차 — 섹션이 하나면 바 자체가 없다 */}
        {CV_NAV.length > 1 && <div
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
        </div>}

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
                        {renderSectionBody(id)}
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
          <h1 className="contact-print-name">이성훈</h1>
          <p className="contact-print-role">Creative Director</p>
          <p className="contact-print-doc">Curriculum Vitae</p>
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
