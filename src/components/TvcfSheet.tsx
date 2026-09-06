import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type Transition,
} from 'framer-motion';

interface TvcfSheetProps {
  open: boolean;
  url: string;
  title: string;
  onClose: () => void;
  /** 제목 옆 작은 꼬리표. 기본 TVCF */
  kicker?: string;
  /** iframe 삽입을 막는 사이트는 캡처 이미지를 대신 보여준다 */
  image?: string;
}

/* Apple의 시트 규격(damping 0.8 · response 0.3)에 가깝게.
   기본은 튀지 않는 임계 감쇠, 플릭으로 던졌을 때만 살짝 넘친다. */
const SHEET_SPRING: Transition = { type: 'spring', bounce: 0, duration: 0.5 };
const SHEET_SPRING_FLICK: Transition = { type: 'spring', bounce: 0.15, duration: 0.45 };
const FADE_REDUCED: Transition = { duration: 0.2, ease: 'easeOut' };

const DRAG_HYSTERESIS = 10;
const FLICK_VELOCITY = 300; // px/s
const DECELERATION_RATE = 0.99;

const project = (velocity: number, rate = DECELERATION_RATE) => ((velocity / 1000) * rate) / (1 - rate);
const rubberband = (overshoot: number, dimension: number, constant = 0.55) =>
  (overshoot * dimension * constant) / (dimension + constant * Math.abs(overshoot));

const viewportH = () => (typeof window === 'undefined' ? 900 : window.innerHeight);

/**
 * TVCF 포트폴리오를 페이지 이동 없이 현재 화면 위의 시트로 연다.
 * · 아래에서 올라오고 아래로 내려간다(들어온 길로 나감)
 * · 헤더를 잡고 1:1로 끌 수 있고, 놓는 순간의 속도가 스프링으로 이어진다
 * · 스크림은 시트 위치에 따라 같이 옅어진다(진행 중 피드백)
 */
const TvcfSheet = ({ open, url, title, onClose, kicker = 'TVCF', image }: TvcfSheetProps) => {
  const reduceMotion = useReducedMotion() ?? false;
  const y = useMotionValue(0);
  const [vh, setVh] = useState(viewportH);
  const scrimOpacity = useTransform(y, [0, vh], [1, 0]);

  const sheetRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const lastFocusRef = useRef<HTMLElement | null>(null);
  const [dragging, setDragging] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // 열릴 때 포커스를 안으로, 닫히면 원래 자리로. Esc로 닫는다.
  useEffect(() => {
    if (!open) return;
    lastFocusRef.current = document.activeElement as HTMLElement | null;
    setLoaded(false);
    const focusTimer = window.setTimeout(() => closeBtnRef.current?.focus(), 50);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    const onResize = () => setVh(viewportH());
    window.addEventListener('keydown', onKey, { capture: true });
    window.addEventListener('resize', onResize);
    return () => {
      window.clearTimeout(focusTimer);
      window.removeEventListener('keydown', onKey, { capture: true } as EventListenerOptions);
      window.removeEventListener('resize', onResize);
      lastFocusRef.current?.focus?.();
    };
  }, [open, onClose]);

  /* ── 헤더 드래그: 직접 조작 ─────────────────────────────────────
     iframe은 포인터 이벤트를 삼키므로 잡는 곳은 헤더다.
     setPointerCapture로 손가락이 헤더를 벗어나도 계속 따라간다. */
  const gestureRef = useRef<{
    id: number;
    startY: number;
    grabY: number;
    active: boolean;
    history: { y: number; t: number }[];
  } | null>(null);

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    gestureRef.current = {
      id: e.pointerId,
      startY: e.clientY,
      grabY: e.clientY,
      active: false,
      history: [{ y: e.clientY, t: performance.now() }],
    };
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const g = gestureRef.current;
    if (!g || g.id !== e.pointerId) return;
    if (!g.active) {
      if (Math.abs(e.clientY - g.startY) < DRAG_HYSTERESIS) return;
      g.active = true;
      g.grabY = e.clientY; // 잡은 자리에서 출발 — 처음 10px만큼 튀지 않는다
      e.currentTarget.setPointerCapture(e.pointerId);
      y.stop(); // 움직이던 시트를 잡으면 그 자리에서 멈춘다
      setDragging(true);
    }
    const now = performance.now();
    g.history.push({ y: e.clientY, t: now });
    while (g.history.length > 2 && now - g.history[0].t > 120) g.history.shift();

    const dragY = e.clientY - g.grabY;
    // 위로는 더 갈 곳이 없다 — 러버밴드로 알린다
    y.set(dragY >= 0 ? dragY : rubberband(dragY, vh, 0.3));
  };

  const endDrag = (e: ReactPointerEvent<HTMLDivElement>, cancelled: boolean) => {
    const g = gestureRef.current;
    if (!g || g.id !== e.pointerId) return;
    gestureRef.current = null;
    if (!g.active) return;
    setDragging(false);
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);

    const last = g.history[g.history.length - 1];
    const recent = g.history.filter((s) => last.t - s.t <= 100);
    const first = recent[0];
    const stale = performance.now() - last.t > 80;
    const velocity =
      cancelled || stale || !first || last.t === first.t ? 0 : ((last.y - first.y) / (last.t - first.t)) * 1000;

    const current = y.get();
    const flick = Math.abs(velocity) >= FLICK_VELOCITY;
    // 플릭이면 속도의 부호가, 아니면 관성이 닿을 지점이 결정한다
    const shouldClose = flick ? velocity > 0 : current + project(velocity) > vh * 0.35;

    if (shouldClose) {
      onClose(); // exit 애니메이션이 현재 위치·속도에서 이어간다
    } else {
      animate(y, 0, reduceMotion ? FADE_REDUCED : flick ? SHEET_SPRING_FLICK : SHEET_SPRING);
    }
  };

  const sheetVariants = {
    hidden: () => (reduceMotion ? { opacity: 0, y: 0 } : { y: vh, opacity: 1 }),
    shown: () => ({
      y: 0,
      opacity: 1,
      transition: reduceMotion ? FADE_REDUCED : SHEET_SPRING,
    }),
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="tvcf-sheet-root" role="presentation">
          <style>{`
            .tvcf-sheet-root {
              position: fixed;
              inset: 0;
              z-index: 200;
              display: flex;
              align-items: flex-end;
              justify-content: center;
            }

            /* 딤 스크림 — 모달 과업이라 뒤를 눌러 둔다 */
            .tvcf-scrim {
              position: absolute;
              inset: 0;
              background: rgba(16, 18, 21, 0.48);
            }

            .tvcf-sheet {
              --ink: #101215;
              --ink-2: #5b626a;
              --ink-3: #949aa1;
              --rule: #e2e6ea;

              position: relative;
              display: grid;
              grid-template-rows: auto minmax(0, 1fr);
              inline-size: min(100%, 1280px);
              block-size: min(92vh, 100%);
              block-size: min(92dvh, 100%);
              background: #ffffff;
              border-start-start-radius: 16px;
              border-start-end-radius: 16px;
              overflow: hidden;
              /* 큰 면은 두꺼워 보여야 한다 — 깊은 그림자 */
              box-shadow:
                0 -1px 0 rgba(255, 255, 255, 0.6),
                0 -24px 80px rgba(16, 18, 21, 0.28);
              will-change: transform;
            }

            /* 잡는 곳: 반투명 머티리얼. 내용이 그 아래로 지나간다 */
            .tvcf-sheet-head {
              position: relative;
              z-index: 1;
              display: grid;
              grid-template-columns: minmax(0, 1fr) auto auto;
              align-items: center;
              column-gap: 0.75rem;
              padding: 1.1rem 1rem 0.75rem 1.25rem;
              background: rgba(255, 255, 255, 0.78);
              -webkit-backdrop-filter: blur(20px) saturate(180%);
              backdrop-filter: blur(20px) saturate(180%);
              border-block-end: 1px solid rgba(16, 18, 21, 0.08);
              cursor: grab;
              touch-action: none;
              user-select: none;
              -webkit-user-select: none;
            }

            .tvcf-sheet-head[data-dragging='true'] { cursor: grabbing; }

            /* 그래버 — 끌 수 있다는 유일한 힌트 */
            .tvcf-grabber {
              position: absolute;
              inset-block-start: 6px;
              inset-inline-start: 50%;
              translate: -50% 0;
              inline-size: 36px;
              block-size: 4px;
              border-radius: 2px;
              background: rgba(16, 18, 21, 0.18);
            }

            .tvcf-sheet-title {
              display: flex;
              align-items: baseline;
              gap: 0.6rem;
              min-inline-size: 0;
              margin: 0;
              font-size: 0.9375rem;
              font-weight: 600;
              letter-spacing: -0.01em;
              color: var(--ink);
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }

            .tvcf-sheet-title small {
              font-size: 0.75rem;
              font-weight: 500;
              letter-spacing: 0.06em;
              color: var(--ink-3);
            }

            .tvcf-sheet-link,
            .tvcf-sheet-close {
              display: inline-flex;
              align-items: center;
              justify-content: center;
              min-block-size: 2.25rem;
              padding-inline: 0.85rem;
              border: 1px solid var(--rule);
              border-radius: 999px;
              background: transparent;
              color: var(--ink-2);
              font-size: 0.8125rem;
              font-weight: 500;
              letter-spacing: 0.01em;
              text-decoration: none;
              cursor: pointer;
              -webkit-tap-highlight-color: transparent;
              transition: transform 0.12s ease-out, background-color 0.2s ease-out, color 0.2s ease-out;
            }

            .tvcf-sheet-close {
              inline-size: 2.25rem;
              padding-inline: 0;
              color: var(--ink);
            }

            .tvcf-sheet-link:hover,
            .tvcf-sheet-close:hover { background: rgba(16, 18, 21, 0.05); color: var(--ink); }

            .tvcf-sheet-link:active,
            .tvcf-sheet-close:active { transform: scale(0.96); transition: none; }

            .tvcf-sheet-body {
              position: relative;
              min-block-size: 0;
              background: #f4f5f7;
            }

            .tvcf-sheet-frame {
              display: block;
              inline-size: 100%;
              block-size: 100%;
              border: 0;
              background: #ffffff;
            }

            .tvcf-sheet-body[data-dragging='true'] .tvcf-sheet-frame { pointer-events: none; }

            /* 삽입 불가 사이트의 정지 화면 */
            .tvcf-sheet-still {
              position: absolute;
              inset: 0;
              overflow: auto;
              background: #f4f5f7;
            }

            .tvcf-sheet-still img {
              display: block;
              inline-size: min(100%, 1280px);
              margin-inline: auto;
              box-shadow: 0 1px 0 rgba(0, 0, 0, 0.06);
            }

            .tvcf-sheet-still-note {
              margin: 0;
              padding: 0.9rem 1.25rem 1.5rem;
              text-align: center;
              font-size: 0.85rem;
              color: var(--ink-3);
            }

            .tvcf-sheet-still-note a {
              color: var(--ink);
              text-decoration: none;
              border-block-end: 1px solid currentColor;
            }

            /* 로드 전 상태 — 무엇이 오는지 말해 준다 */
            .tvcf-sheet-loading {
              position: absolute;
              inset: 0;
              display: grid;
              place-content: center;
              gap: 0.5rem;
              text-align: center;
              font-size: 0.875rem;
              color: var(--ink-3);
              pointer-events: none;
            }

            .tvcf-sheet-loading strong {
              font-weight: 600;
              color: var(--ink-2);
            }

            @media (max-width: 767px) {
              .tvcf-sheet {
                block-size: calc(100% - 0.75rem);
                border-start-start-radius: 14px;
                border-start-end-radius: 14px;
              }
              .tvcf-sheet-link { display: none; }
            }

            @media (prefers-reduced-transparency: reduce) {
              .tvcf-sheet-head {
                background: #ffffff;
                -webkit-backdrop-filter: none;
                backdrop-filter: none;
              }
            }

            @media (prefers-contrast: more) {
              .tvcf-scrim { background: rgba(0, 0, 0, 0.7); }
              .tvcf-sheet-head { border-block-end-color: var(--ink); }
            }

            @media (prefers-reduced-motion: reduce) {
              .tvcf-sheet-link,
              .tvcf-sheet-close { transition: none; }
              .tvcf-sheet-link:active,
              .tvcf-sheet-close:active { transform: none; }
            }
          `}</style>

          <motion.div
            className="tvcf-scrim"
            style={reduceMotion ? undefined : { opacity: scrimOpacity }}
            initial={reduceMotion ? { opacity: 0 } : false}
            animate={reduceMotion ? { opacity: 1 } : undefined}
            exit={reduceMotion ? { opacity: 0 } : undefined}
            transition={FADE_REDUCED}
            onClick={onClose}
            aria-hidden
          />

          <motion.div
            ref={sheetRef}
            className="tvcf-sheet"
            role="dialog"
            aria-modal="true"
            aria-label={title}
            style={{ y }}
            variants={sheetVariants}
            initial="hidden"
            animate="shown"
            exit="hidden"
            transition={reduceMotion ? FADE_REDUCED : SHEET_SPRING}
          >
            <div
              className="tvcf-sheet-head"
              data-dragging={dragging ? 'true' : undefined}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={(e) => endDrag(e, false)}
              onPointerCancel={(e) => endDrag(e, true)}
            >
              <i className="tvcf-grabber" aria-hidden />
              <h2 className="tvcf-sheet-title">
                {title}
                <small>{kicker}</small>
              </h2>
              <a
                className="tvcf-sheet-link"
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                onPointerDown={(e) => e.stopPropagation()}
              >
                새 탭에서 열기
              </a>
              <button
                ref={closeBtnRef}
                type="button"
                className="tvcf-sheet-close"
                onClick={onClose}
                onPointerDown={(e) => e.stopPropagation()}
                aria-label="닫기"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden>
                  <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <div className="tvcf-sheet-body" data-dragging={dragging ? 'true' : undefined}>
              {image ? (
                /* 삽입이 막힌 사이트: 캡처 이미지 + 새 탭 안내 */
                <div className="tvcf-sheet-still">
                  <img src={image} alt={title} draggable={false} />
                  <p className="tvcf-sheet-still-note">
                    이 사이트는 페이지 안에 띄울 수 없어 캡처 화면을 보여줍니다.{' '}
                    <a href={url} target="_blank" rel="noopener noreferrer">새 탭에서 열기 ↗</a>
                  </p>
                </div>
              ) : (
                <>
                  {!loaded && (
                    <div className="tvcf-sheet-loading" aria-live="polite">
                      <strong>{title}</strong>
                      <span>{kicker === 'TVCF' ? 'TVCF 포트폴리오를 불러오는 중…' : '페이지를 불러오는 중…'}</span>
                    </div>
                  )}
                  <iframe
                    className="tvcf-sheet-frame"
                    src={url}
                    title={title}
                    loading="eager"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allow="fullscreen; autoplay"
                    onLoad={() => setLoaded(true)}
                  />
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default TvcfSheet;
