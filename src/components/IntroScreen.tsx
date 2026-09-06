import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { motion } from 'framer-motion';
import { projects } from '../data';
import introBg from '../IMG/intro-bg.png';
import introBgMoPerson from '../IMG/intro-bg_mo.png';
import { ease, useMotionPrefs } from '../motion';

interface IntroScreenProps {
  onContinue: () => void;
  onRevealChrome?: () => void;
  exitFadeMs?: number;
}

/** 황금비 φ ≈ 1.618 — 인물(좌) : 본문(우) = 1:φ */
const PHI = 1.6180339887;
const PHOTO_SHARE = 100 / (1 + PHI);
const DESKTOP_GRID_COLS = 10;
const DESKTOP_GRID_ROWS = 6;
const MOBILE_GRID_COLS = 8;
const MOBILE_GRID_ROWS = 10;

/** 데스크톱 소개: 이성훈 → 연혁 → 그리드 → 힌트 (ease-out, 이전 모션과 맞물림) */
const DESKTOP_INTRO_EASE = ease.title;
const DESKTOP_INTRO_DURATION = 1.5;
/** 이전 모션 timeline의 이 지점(0~1)에서 다음 시작 — 낮을수록 더 일찍 맞물림 */
const DESKTOP_MOTION_CHAIN = 0.32;

const chainIntroDelay = (previousDelay: number, previousDuration: number) =>
  previousDelay + previousDuration * DESKTOP_MOTION_CHAIN;

const DESKTOP_NAME_DELAY = 0;
const DESKTOP_CAREERS_DELAY = chainIntroDelay(DESKTOP_NAME_DELAY, DESKTOP_INTRO_DURATION);
const DESKTOP_GRID_BASE_DELAY = chainIntroDelay(DESKTOP_CAREERS_DELAY, DESKTOP_INTRO_DURATION);

const desktopIntroMotion = {
  name: { delay: DESKTOP_NAME_DELAY, duration: DESKTOP_INTRO_DURATION, y: 16 },
  careers: { delay: DESKTOP_CAREERS_DELAY, duration: DESKTOP_INTRO_DURATION, y: 12 },
  grid: { y: 18 },
  hint: { duration: DESKTOP_INTRO_DURATION, y: 8 },
};

/** 그리드: 좌상단 → 우하단 대각선 그라디언트처럼 순차 등장 */
const DESKTOP_GRID_CELL_DURATION = 1;
const DESKTOP_GRID_DIAGONAL_STAGGER = 0.048;

const getDesktopGridCellDelay = (index: number) => {
  const row = Math.floor(index / DESKTOP_GRID_COLS);
  const col = index % DESKTOP_GRID_COLS;
  return DESKTOP_GRID_BASE_DELAY + (row + col) * DESKTOP_GRID_DIAGONAL_STAGGER;
};

const getDesktopGridHintDelay = () => {
  const maxDiagonal = DESKTOP_GRID_ROWS - 1 + DESKTOP_GRID_COLS - 1;
  const lastCellDelay =
    DESKTOP_GRID_BASE_DELAY + maxDiagonal * DESKTOP_GRID_DIAGONAL_STAGGER;
  return chainIntroDelay(lastCellDelay, DESKTOP_GRID_CELL_DURATION);
};

/** scale=0이면(동작 줄이기) 지연·지속시간을 접어 최종 상태만 보여준다 */
const desktopIntroTransition = (delay: number, duration: number, scale: number) => ({
  duration: duration * scale,
  delay: delay * scale,
  ease: DESKTOP_INTRO_EASE,
});

const introCareers = [
  { label: '사모펀드&IR컨설팅', role: '크리에이티브 디렉터', period: '2023~現' },
  { label: '미디어파사드', role: '미디어 아티스트', period: '2022~現' },
  { label: 'Web UI/UX & 마케팅회사', role: '영상팀장', period: '2020~2023' },
  { label: '포스트프로덕션', role: '2D TD', period: '2012~2019' },
];

const introKeywordLines = [
  '다양한 프로젝트 경험 · TVCF, VIRAL, M/V',
  '긍정적 사고 · 원활한 커뮤니케이션 · 노력형',
  '내 친구는 ADOBE · 책임감 · 일에 대한 열정',
  '나름 젊은 나이 · 약간의 드로잉 · 취미는 사진',
  '대기권까지 열린사고 · 빠른 손 · 체력이 국력',
  '영상 디자인이 체질 · 힘세고 오래가는 정신력',
  'MBTI-ENTP · 다재다능 · 성장하는 사람',
  'AFTER EFFECT · FLAME · CINEMA 4D',
  'IR활동지원 · 라이브이벤트 · DAVINCI RESOLVE',
];

/** 한 줄: 글자 단위 flex + space-between → 좌·우 끝선 정확히 맞춤 */
const IntroKeywordLine = ({ text }: { text: string }) => {
  const lineRef = useRef<HTMLParagraphElement>(null);

  useLayoutEffect(() => {
    const fitLine = () => {
      const line = lineRef.current;
      if (!line) return;

      const targetWidth = line.clientWidth;
      if (targetWidth <= 0) return;

      line.style.fontSize = '';
      const computed = getComputedStyle(line);
      let size = parseFloat(computed.fontSize) || 16;
      const minSize = size * 0.88;
      const maxSize = size * 1.62;

      const measureCharsWidth = () => {
        const charEls = line.querySelectorAll('.intro-screen__keywords-char');
        let total = 0;
        charEls.forEach((el) => {
          total += el.getBoundingClientRect().width;
        });
        return total;
      };

      line.style.fontSize = `${size}px`;

      while (measureCharsWidth() <= targetWidth && size < maxSize) {
        size += 0.25;
        line.style.fontSize = `${size}px`;
      }

      while (measureCharsWidth() > targetWidth && size > minSize) {
        size -= 0.25;
        line.style.fontSize = `${size}px`;
      }
    };

    fitLine();
    document.fonts?.ready.then(fitLine).catch(() => {});
    const observer = new ResizeObserver(fitLine);
    if (lineRef.current) observer.observe(lineRef.current);
    window.addEventListener('resize', fitLine);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', fitLine);
    };
  }, [text]);

  const chars = useMemo(
    () => [...text].map((char) => (char === ' ' ? '\u00A0' : char)),
    [text],
  );

  return (
    <p ref={lineRef} className="intro-screen__keywords-line" aria-label={text}>
      {chars.map((char, index) => (
        <span key={`${char}-${index}`} className="intro-screen__keywords-char" aria-hidden="true">
          {char}
        </span>
      ))}
    </p>
  );
};

const IntroScreen = ({ onContinue, onRevealChrome, exitFadeMs = 480 }: IntroScreenProps) => {
  const touchStartRef = useRef<{ y: number } | null>(null);
  const [isExiting, setIsExiting] = useState(false);
  const prefs = useMotionPrefs();
  /* 동작 줄이기: 대각선으로 7초간 등장하던 그리드를 최종 상태로 접는다 */
  const introScale = prefs.reduced ? 0 : 1;
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.innerWidth < 768,
  );

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const beginExit = useCallback(() => {
    if (isExiting) return;
    if (!isMobile) {
      onContinue();
      return;
    }
    setIsExiting(true);
    window.setTimeout(() => {
      onRevealChrome?.();
      onContinue();
    }, exitFadeMs);
  }, [isExiting, isMobile, exitFadeMs, onContinue, onRevealChrome]);

  const allThumbs = useMemo(
    () =>
      projects
        .map((p) => p.thumbnail || p.image)
        .filter((src): src is string => Boolean(src)),
    [],
  );

  const mobileGridThumbs = useMemo(() => {
    if (allThumbs.length === 0) return [];
    const target = MOBILE_GRID_COLS * MOBILE_GRID_ROWS;
    const filled: string[] = [];
    while (filled.length < target) {
      filled.push(...allThumbs);
    }
    return filled.slice(0, target);
  }, [allThumbs]);

  const desktopThumbs = useMemo(() => {
    if (allThumbs.length === 0) return [];
    const target = DESKTOP_GRID_COLS * DESKTOP_GRID_ROWS;
    const filled: string[] = [];
    while (filled.length < target) {
      filled.push(...allThumbs);
    }
    return filled.slice(0, target);
  }, [allThumbs]);

  useEffect(() => {
    if (isExiting) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown' || e.key === 'Escape') {
        e.preventDefault();
        beginExit();
      }
    };

    const onWheel = (e: WheelEvent) => {
      if (e.deltaY > 20) beginExit();
    };

    window.addEventListener('keydown', onKey);
    window.addEventListener('wheel', onWheel, { passive: true });
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('wheel', onWheel);
    };
  }, [isExiting, beginExit]);

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current || isExiting) return;
    const deltaY = e.changedTouches[0].clientY - touchStartRef.current.y;
    touchStartRef.current = null;
    if (deltaY < -30) beginExit();
  };

  const scaleVars = {
    '--phi': PHI,
    '--u': 'clamp(0.95rem, 1.15vw, 1.35rem)',
    '--name': 'calc(var(--u) * var(--phi) * var(--phi) * var(--phi))',
    '--hint': 'calc(var(--u) / var(--phi))',
    '--gap': 'calc(var(--u) * var(--phi))',
    '--gap-sm': 'calc(var(--u) * 0.618)',
  } as CSSProperties;

  const desktopContentStyle: CSSProperties = {
    top: 0,
    bottom: 0,
    left: `calc(${PHOTO_SHARE}% + var(--intro-content-shift))`,
    right: '2.5rem',
  };

  return (
    <motion.div
      className="intro-screen fixed inset-0 z-[150] cursor-pointer overflow-hidden h-[100dvh] md:h-auto md:overflow-hidden"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={prefs.t(0.55, ease.panel)}
      onClick={beginExit}
      onTouchStart={(e) => {
        if (!isMobile) return;
        touchStartRef.current = { y: e.touches[0].clientY };
      }}
      onTouchEnd={(e) => {
        if (!isMobile) return;
        handleTouchEnd(e);
      }}
      role="button"
      tabIndex={0}
      aria-label="소개를 닫고 포트폴리오 보기"
      style={scaleVars}
    >
      {/* ===== 모바일: 상단 크롬 없이 전체 화면 프로필+그리드 ===== */}
      <div className="intro-screen__mobile intro-screen--fade-shell md:hidden flex flex-col h-full bg-[#fafafa]">
        <motion.div
          className="intro-screen__fade-content w-full h-full flex flex-col"
          animate={{ opacity: isExiting ? 0 : 1 }}
          transition={prefs.t(exitFadeMs / 1000, ease.cut)}
        >
        <div className="intro-screen__body intro-screen__body--immersive flex flex-1 min-h-0 flex-col bg-black">
          <div className="intro-screen__hero relative min-h-0">
            <div className="intro-screen__layer-stack absolute inset-0">
              <div className="intro-screen__keywords absolute inset-0 z-0" aria-hidden>
                {introKeywordLines.map((line) => (
                  <IntroKeywordLine key={line} text={line} />
                ))}
              </div>

              <img
                src={introBgMoPerson}
                alt=""
                className="intro-screen__layer intro-screen__person pointer-events-none select-none"
                draggable={false}
              />
            </div>
          </div>

          <motion.div
            className="intro-screen__grid-section min-h-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={prefs.t(0.55, ease.cut, 0.25)}
          >
            <div
              className="intro-screen__grid grid w-full"
              style={{
                gridTemplateColumns: `repeat(${MOBILE_GRID_COLS}, minmax(0, 1fr))`,
              }}
            >
              {mobileGridThumbs.map((src, index) => (
                <div
                  key={`mo-grid-${src}-${index}`}
                  className="intro-screen__grid-cell overflow-hidden bg-neutral-900 min-h-0"
                >
                  <img
                    src={src}
                    alt=""
                    className="w-full h-full object-cover"
                    loading={index < MOBILE_GRID_COLS * 3 ? 'eager' : 'lazy'}
                    draggable={false}
                  />
                </div>
              ))}
            </div>
          </motion.div>
        </div>
        </motion.div>
      </div>

      {/* ===== 데스크톱: 좌측 인물 + 우측 이름·연혁·그리드 (원본) ===== */}
      <div className="hidden md:block absolute inset-0">
        <img
          src={introBg}
          alt=""
          className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
          style={{ objectPosition: 'left center' }}
          draggable={false}
        />

        <div className="relative z-10 w-full h-full">
          <div
            className="intro-screen__content absolute flex flex-col justify-center text-left"
            style={desktopContentStyle}
          >
            <motion.h1
              className="font-bold leading-none text-black shrink-0"
              style={{
                fontSize: 'var(--name)',
                marginBottom: 'var(--gap)',
              }}
              initial={{ opacity: 0, y: desktopIntroMotion.name.y }}
              animate={{ opacity: 1, y: 0 }}
              transition={desktopIntroTransition(
                desktopIntroMotion.name.delay,
                desktopIntroMotion.name.duration,
                introScale,
              )}
            >
              이성훈
            </motion.h1>

            <motion.ul
              className="text-black shrink-0 space-y-1"
              style={{
                fontSize: 'calc(var(--u) * var(--phi))',
                marginBottom: 'var(--gap)',
              }}
              initial={{ opacity: 0, y: desktopIntroMotion.careers.y }}
              animate={{ opacity: 1, y: 0 }}
              transition={desktopIntroTransition(
                desktopIntroMotion.careers.delay,
                desktopIntroMotion.careers.duration,
                introScale,
              )}
            >
              {introCareers.map((item) => (
                <li
                  key={`${item.label}-${item.period}`}
                  className="flex flex-wrap items-baseline gap-x-2 leading-snug"
                >
                  <span className="font-medium">{item.label}</span>
                  <span>{item.role}</span>
                  <span className="text-gray-600">{item.period}</span>
                </li>
              ))}
            </motion.ul>

            <div className="intro-screen__grid-wrap w-full min-h-0">
              <div
                className="intro-screen__grid grid overflow-hidden w-[90%]"
                style={{
                  gridTemplateColumns: `repeat(${DESKTOP_GRID_COLS}, minmax(0, 1fr))`,
                  gap: 'calc(var(--u) * 0.12)',
                }}
              >
                {desktopThumbs.map((src, index) => (
                  <motion.div
                    key={`${src}-${index}`}
                    className="intro-screen__grid-cell overflow-hidden bg-neutral-300 min-h-0 w-full"
                    style={{ aspectRatio: '16 / 10' }}
                    initial={{ opacity: 0, y: desktopIntroMotion.grid.y }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={desktopIntroTransition(
                      getDesktopGridCellDelay(index),
                      DESKTOP_GRID_CELL_DURATION,
                      introScale,
                    )}
                  >
                    <img
                      src={src}
                      alt=""
                      className="w-full h-full object-cover"
                      loading={index < DESKTOP_GRID_COLS * 2 ? 'eager' : 'lazy'}
                      draggable={false}
                    />
                  </motion.div>
                ))}
              </div>
            </div>

            <motion.p
              className="intro-screen__hint text-black shrink-0"
              style={{
                fontSize: 'var(--hint)',
                marginTop: 'var(--gap-sm)',
              }}
              initial={{ opacity: 0, y: desktopIntroMotion.hint.y }}
              animate={{ opacity: 0.5, y: 0 }}
              transition={desktopIntroTransition(
                getDesktopGridHintDelay(),
                desktopIntroMotion.hint.duration,
                introScale,
              )}
            >
              클릭하거나 스크롤하면 포트폴리오로 이어집니다
            </motion.p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default IntroScreen;
